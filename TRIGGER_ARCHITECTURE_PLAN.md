# Aariv — Production Trigger Architecture Plan

## 1. Current Architecture (As-Is)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  COMPOSIO                                                               │
│  ┌──────────────────┐    ┌──────────────────┐                           │
│  │ Pusher WebSocket  │    │  HTTP Webhook     │                          │
│  └────────┬─────────┘    └────────┬─────────┘                           │
└───────────┼───────────────────────┼─────────────────────────────────────┘
            │                       │
            ▼                       ▼
┌───────────────────────────────────────────────────────────────────────┐
│  PYTHON BACKEND (single process)                                      │
│                                                                       │
│  server.py                                                            │
│  ┌────────────────────┐  ┌───────────────────────┐                    │
│  │ Background Thread   │  │  /webhook endpoint     │                   │
│  │ subscription.handle │  │  signature verify       │                  │
│  │ + auto-reconnect    │  │  + BackgroundTasks      │                  │
│  └─────────┬──────────┘  └──────────┬────────────┘                    │
│            │                        │                                  │
│            └────────┬───────────────┘                                  │
│                     ▼                                                  │
│  triggers.py: TriggerDispatcher                                       │
│  ┌──────────────────────────────────────────────────────────────┐      │
│  │ 1. Dedup (in-memory fingerprint cache, 5min TTL)             │     │
│  │ 2. User Resolution (5-step cascade: profiles → entities      │     │
│  │    → trigger_id → connected_account_id → sole user)          │     │
│  │ 3. DB Logging (trigger_events table + auto-sync trigger)     │     │
│  │ 4. Noise Filter (heuristic L1)                               │     │
│  │ 5. Debounce (30s quiet window, in-memory timers)             │     │
│  │ 6. AI Summary (OpenAI gpt-4o via Composio Agent SDK)         │     │
│  │ 7. Review Extraction (gpt-4o-mini)                           │     │
│  │ 8. Billing (charge_user per AI call)                         │     │
│  │ 9. Push SSE notification                                     │     │
│  └──────────────────────────────────────────────────────────────┘      │
│                                                                       │
│  config.py: NotificationManager                                       │
│  ┌──────────────────────────────────────────────────────────────┐      │
│  │ In-memory asyncio.Queue per user → SSE stream                │     │
│  │ + DB fallback for reconnecting users                         │     │
│  └──────────────────────────────────────────────────────────────┘      │
└───────────────────────────────────────────────────────────────────────┘
```

---

## 2. Weaknesses Identified

### Critical (will cause data loss or outages)

| # | Weakness | Impact | Current Behavior |
|---|----------|--------|------------------|
| C1 | **In-memory debounce/dedup state** | All timers + dedup cache lost on restart/deploy. Events re-processed or debouncing resets. | `active_timers`, `event_buffer`, `_seen_events` are plain dicts in `TriggerDispatcher.__init__` |
| C2 | **No retry for failed AI summarization** | Events marked `status=failed` in DB but never retried. User permanently misses that notification. | Exception handler in `_trigger_background_summary` marks failed + sends fallback text |
| C3 | **Dead-letter is log-only** | Un-mappable events written to `logger.warning()` — no table, no recovery, no retry. | `_dead_letter_event()` only writes a structured log line |
| C4 | **Single-process scaling ceiling** | Can't run 2+ replicas because debounce and dedup are in-process, not shared. | All state in `TriggerDispatcher` instance dict |

### High (degraded reliability)

| # | Weakness | Impact |
|---|----------|--------|
| H1 | **No circuit breaker for OpenAI** | If OpenAI is down/slow, every trigger event queues up an agent call that burns time waiting → cascading latency |
| H2 | **No backpressure** | A chatty integration (e.g., Slack in high-traffic workspace) can generate hundreds of events/minute → overwhelms AI pipeline |
| H3 | **No per-user rate limit on trigger events** | One user's noisy app can exhaust global rate limits |
| H4 | **WebSocket health not exposed** | No metric or alert when subscription thread dies (reconnect works, but ops has no visibility) |
| H5 | **Event status lifecycle incomplete** | States: received → processing → completed/failed. Missing: `retry`, `dead_letter`, `expired` |

### Medium (operational friction)

| # | Weakness | Impact |
|---|----------|--------|
| M1 | **Trigger setup not idempotent** | Calling auto-setup twice can create duplicate triggers on Composio |
| M2 | **No trigger health dashboard** | No per-trigger error rate, latency percentiles, or success rate |
| M3 | **Manual sync endpoint creates mock data** | `/webhook/sync-composio` injects fake summary text instead of real event data |
| M4 | **Notification delivery is fire-and-forget** | If SSE connection drops mid-send, notification is lost (DB fallback only loads last 1) |

---

## 3. Proposed Architecture (To-Be)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  COMPOSIO                                                               │
│  ┌──────────────────┐    ┌──────────────────┐                           │
│  │ Pusher WebSocket  │    │  HTTP Webhook     │                          │
│  └────────┬─────────┘    └────────┬─────────┘                           │
└───────────┼───────────────────────┼─────────────────────────────────────┘
            │                       │
            ▼                       ▼
┌───────────────────────────────────────────────────────────────────────┐
│  PYTHON BACKEND                                                       │
│                                                                       │
│  ┌─── LAYER 1: INGESTION ──────────────────────────────────────────┐  │
│  │  • WebSocket handler (existing reconnect ✓)                      │ │
│  │  • Webhook handler (existing signature verify ✓)                 │ │
│  │  • NEW: Health monitor — exposes subscription_alive metric       │ │
│  │  • NEW: Per-user event rate limiter (token bucket per user)      │ │
│  └──────────────┬──────────────────────────────────────────────────┘  │
│                 ▼                                                      │
│  ┌─── LAYER 2: INTAKE (new) ──────────────────────────────────────┐  │
│  │  • Dedup via Supabase (trigger_events + unique fingerprint)      │ │
│  │  • User resolution (existing 5-step cascade ✓)                   │ │
│  │  • Persist to trigger_events with status="received"              │ │
│  │  • Dead-letter table for unmappable events                       │ │
│  └──────────────┬──────────────────────────────────────────────────┘  │
│                 ▼                                                      │
│  ┌─── LAYER 3: PROCESSING ────────────────────────────────────────┐  │
│  │  • Noise filter (existing heuristic ✓)                           │ │
│  │  • Debounce via DB (status="buffered", scheduled_at timestamp)   │ │
│  │  • Background worker picks up ready batches                      │ │
│  └──────────────┬──────────────────────────────────────────────────┘  │
│                 ▼                                                      │
│  ┌─── LAYER 4: AI PIPELINE ───────────────────────────────────────┐  │
│  │  • Circuit breaker (trips after 3 consecutive OpenAI failures)   │ │
│  │  • Semaphore (max 3 concurrent AI calls)                         │ │
│  │  • AI summary + review extraction (existing ✓)                   │ │
│  │  • Billing (existing ✓)                                          │ │
│  │  • Retry with exponential backoff (max 3 attempts)               │ │
│  └──────────────┬──────────────────────────────────────────────────┘  │
│                 ▼                                                      │
│  ┌─── LAYER 5: DELIVERY ──────────────────────────────────────────┐  │
│  │  • SSE push (existing ✓)                                         │ │
│  │  • Persist notification to DB (load last N on reconnect)         │ │
│  │  • Status: received → buffered → processing → completed/failed  │ │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌─── LAYER 6: RECOVERY (new) ────────────────────────────────────┐  │
│  │  • Retry worker: polls failed events every 60s, retries ≤3x     │ │
│  │  • Dead-letter monitor: alerts + manual retry endpoint           │ │
│  │  • Stale event cleanup: mark events >24h in "processing" as     │ │
│  │    failed (crash recovery)                                       │ │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌─── OBSERVABILITY ──────────────────────────────────────────────┐  │
│  │  • /api/triggers/health — subscription status, queue depths,     │ │
│  │    circuit breaker state, retry queue size, per-app metrics      │ │
│  │  • Structured logs with trace_id per event                       │ │
│  │  • Per-trigger error_count + last_error stored in triggers table │ │
│  └────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────┘
```

---

## 4. Implementation Plan (Prioritized)

### Phase A — Reliability Foundations (do first)

These changes are contained, low-risk, and fix the most critical production gaps.

#### A1. Circuit Breaker for OpenAI
**File:** `python-agent/triggers.py`  
**What:** Add a `CircuitBreaker` class that wraps all OpenAI calls in `_trigger_background_summary` and `_extract_review_items`.
- States: `CLOSED` → `OPEN` → `HALF_OPEN`
- Opens after 3 consecutive failures within 60s
- Open state rejects calls immediately (returns fallback notification)
- Half-open after 30s cooldown, allows 1 test call
- Resets on success

```python
class CircuitBreaker:
    def __init__(self, failure_threshold=3, reset_timeout=30):
        self.failure_count = 0
        self.failure_threshold = failure_threshold
        self.reset_timeout = reset_timeout
        self.state = "CLOSED"  # CLOSED | OPEN | HALF_OPEN
        self.last_failure_time = 0
    
    def can_execute(self) -> bool:
        if self.state == "CLOSED":
            return True
        if self.state == "OPEN":
            if time.time() - self.last_failure_time > self.reset_timeout:
                self.state = "HALF_OPEN"
                return True
            return False
        return True  # HALF_OPEN allows one attempt
    
    def record_success(self):
        self.failure_count = 0
        self.state = "CLOSED"
    
    def record_failure(self):
        self.failure_count += 1
        self.last_failure_time = time.time()
        if self.failure_count >= self.failure_threshold:
            self.state = "OPEN"
```

#### A2. AI Concurrency Limiter (Semaphore)
**File:** `python-agent/triggers.py`  
**What:** Add `asyncio.Semaphore(3)` to limit concurrent AI calls.
- Prevents overloading OpenAI when many debounce windows fire simultaneously
- Queues excess work instead of rejecting it
- Configurable via env `MAX_CONCURRENT_AI_CALLS=3`

#### A3. Retry for Failed Events
**File:** `python-agent/triggers.py`  
**What:** Add retry logic to `_trigger_background_summary`.
- On failure: increment `retry_count` in DB, schedule retry with backoff
- Max 3 retries (backoff: 30s, 120s, 300s)
- After max retries → status = `permanently_failed`, send fallback notification
- Add `retry_count` and `next_retry_at` columns to `trigger_events` table

**New background task in `server.py` lifespan:**
```python
async def _retry_failed_events():
    """Periodically retry failed trigger events."""
    while True:
        await asyncio.sleep(60)  # Check every minute
        # Query: status='failed' AND retry_count < 3 AND next_retry_at <= now()
        # Re-inject into dispatcher
```

#### A4. Dead-Letter Table
**File:** `python-agent/triggers.py` + new migration  
**What:** Replace log-only dead-letter with a proper DB table.

```sql
CREATE TABLE IF NOT EXISTS dead_letter_events (
    id TEXT PRIMARY KEY DEFAULT 'dl_' || extract(epoch from now())::text,
    trigger_slug TEXT,
    raw_payload JSONB NOT NULL,
    reason TEXT NOT NULL,  -- 'unmappable_user', 'schema_error', 'max_retries_exceeded'
    metadata JSONB DEFAULT '{}',
    retry_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolved_by TEXT  -- user_id who manually resolved, or 'auto'
);
```

- Events that can't be mapped to a user go here
- Events that exceed max retries also go here
- `/api/triggers/dead-letter` endpoint to list + manually retry

---

### Phase B — State Durability (solves restart data loss)

#### B1. DB-Backed Dedup
**File:** `python-agent/triggers.py`  
**What:** Move deduplication from in-memory dict to DB-backed check.

**Strategy:** Use `trigger_events` table itself:
- Before processing, check: `SELECT id FROM trigger_events WHERE fingerprint = $1 AND created_at > now() - interval '5 minutes'`
- Add `fingerprint TEXT` column to `trigger_events` (indexed)
- In-memory cache remains as L1 (fast path), DB is L2 (survives restarts)
- This is a **read before write** pattern — fast because fingerprint is indexed

#### B2. DB-Backed Debounce
**File:** `python-agent/triggers.py`  
**What:** Replace in-memory `asyncio.TimerHandle` debounce with DB-coordinated approach.

**Strategy:**
1. On event arrival: upsert into `trigger_events` with status `buffered`, set `debounce_key` and `debounce_until = now() + 30s`
2. Background worker (every 10s): query `WHERE status = 'buffered' AND debounce_until <= now()` → process batch
3. If a new event arrives with same `debounce_key`, update `debounce_until` to extend the quiet window

**New columns on `trigger_events`:**
```sql
ALTER TABLE trigger_events ADD COLUMN IF NOT EXISTS debounce_key TEXT;
ALTER TABLE trigger_events ADD COLUMN IF NOT EXISTS debounce_until TIMESTAMPTZ;
ALTER TABLE trigger_events ADD COLUMN IF NOT EXISTS fingerprint TEXT;
ALTER TABLE trigger_events ADD COLUMN IF NOT EXISTS retry_count INT DEFAULT 0;
ALTER TABLE trigger_events ADD COLUMN IF NOT EXISTS next_retry_at TIMESTAMPTZ;
```

**New index:**
```sql
CREATE INDEX IF NOT EXISTS idx_trigger_events_debounce 
    ON trigger_events (status, debounce_until) 
    WHERE status = 'buffered';
CREATE INDEX IF NOT EXISTS idx_trigger_events_fingerprint 
    ON trigger_events (fingerprint) 
    WHERE fingerprint IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_trigger_events_retry 
    ON trigger_events (status, next_retry_at) 
    WHERE status = 'failed' AND retry_count < 3;
```

**Tradeoff:** Adds ~5ms latency per event (DB round-trip) but gains crash-proof debouncing.

#### B3. Enhanced Notification Persistence
**File:** `python-agent/config.py`  
**What:** Store last N (5) notifications per user in DB instead of last 1.
- On SSE reconnect, deliver all unseen notifications since last connection
- Add `notification_delivered_at` to track which were actually seen
- Clean up notifications > 48h old

---

### Phase C — Operational Safety (prevents cascading failures)

#### C1. Per-User Event Rate Limiter
**File:** `python-agent/triggers.py`  
**What:** Token bucket rate limiter per user for incoming events.
- Default: 30 events/minute per user
- Excess events: logged + status `rate_limited` in DB (not processed, not lost)
- Configurable via env `TRIGGER_RATE_LIMIT_PER_USER=30`

```python
class UserRateLimiter:
    def __init__(self, max_per_minute=30):
        self._buckets: Dict[str, list] = {}
        self.max_per_minute = max_per_minute
    
    def allow(self, user_id: str) -> bool:
        now = time.time()
        bucket = self._buckets.setdefault(user_id, [])
        # Remove timestamps older than 60s
        bucket[:] = [t for t in bucket if now - t < 60]
        if len(bucket) >= self.max_per_minute:
            return False
        bucket.append(now)
        return True
```

#### C2. Subscription Health Monitor
**File:** `python-agent/server.py`  
**What:** Expose subscription health in `/api/health` and add periodic self-check.

- Track `last_event_received_at` timestamp (updated on every successful event)
- If no events for 10 minutes AND triggers exist → log warning "subscription may be stalled"
- `/api/health` response includes `trigger_subscription.alive`, `trigger_subscription.last_event_age_seconds`
- Cloud Run / Render health checks can use this

#### C3. Stale Event Recovery
**File:** `python-agent/triggers.py` (background task)  
**What:** Detect and recover events stuck in `processing` state.

Background task (every 5 minutes):
```python
async def _recover_stale_events():
    # Events in "processing" for > 10 minutes are likely from a crashed worker
    # Mark them as "failed" with retry_count=0 so the retry worker picks them up
    UPDATE trigger_events 
    SET status = 'failed', error = 'stale_recovery', retry_count = 0
    WHERE status = 'processing' 
    AND updated_at < now() - interval '10 minutes'
```

#### C4. Idempotent Trigger Setup
**File:** `python-agent/routers/app_triggers.py`  
**What:** Before creating a trigger on Composio, check if one with the same slug + user already exists.

```python
# In auto_setup_triggers():
existing = composio_toolset.triggers.list_active(user_ids=[user_id])
existing_slugs = {getattr(t, 'trigger_slug', '') for t in existing}
for trigger_def in app_triggers:
    if trigger_def["slug"] in existing_slugs:
        continue  # Already exists, skip
    # Create new trigger
```

---

### Phase D — Observability (know what's happening)

#### D1. Event Trace IDs
**File:** `python-agent/triggers.py`  
**What:** Generate a `trace_id` (UUID) at ingestion and propagate through all logs.

- Every log line for that event includes `trace_id=abc123`
- Stored in `trigger_events.trace_id` column
- Makes debugging a single event's journey trivial

#### D2. Trigger Health Dashboard Endpoint
**File:** `python-agent/routers/app_triggers.py`  
**What:** `/api/triggers/health` returns comprehensive pipeline metrics.

```json
{
  "subscription": {
    "alive": true,
    "last_event_age_seconds": 45,
    "reconnect_count": 2
  },
  "circuit_breaker": {
    "state": "CLOSED",
    "failure_count": 0
  },
  "pipeline": {
    "events_last_hour": 42,
    "events_failed_last_hour": 1,
    "events_in_retry_queue": 0,
    "dead_letter_count": 0,
    "avg_processing_time_ms": 2340,
    "active_debounce_keys": 3
  },
  "per_app": {
    "gmail": { "events_24h": 28, "error_rate": 0.0 },
    "slack": { "events_24h": 14, "error_rate": 0.07 }
  }
}
```

#### D3. Per-Trigger Error Tracking
**File:** `python-agent/triggers.py`  
**What:** On failure, increment `error_count` and store `last_error` on the `triggers` table row.
- Already have `error_count` column in schema
- Add: `last_error TEXT`, `last_error_at TIMESTAMPTZ`
- Frontend can show "⚠ Gmail trigger has 3 errors" with details

---

## 5. Database Migration

All schema changes needed for the above:

```sql
-- Phase A: Retry support
ALTER TABLE trigger_events ADD COLUMN IF NOT EXISTS retry_count INT DEFAULT 0;
ALTER TABLE trigger_events ADD COLUMN IF NOT EXISTS next_retry_at TIMESTAMPTZ;
ALTER TABLE trigger_events ADD COLUMN IF NOT EXISTS error TEXT;

-- Phase B: Debounce + Dedup durability
ALTER TABLE trigger_events ADD COLUMN IF NOT EXISTS fingerprint TEXT;
ALTER TABLE trigger_events ADD COLUMN IF NOT EXISTS debounce_key TEXT;
ALTER TABLE trigger_events ADD COLUMN IF NOT EXISTS debounce_until TIMESTAMPTZ;
ALTER TABLE trigger_events ADD COLUMN IF NOT EXISTS trace_id TEXT;

-- Phase B: Indexes
CREATE INDEX IF NOT EXISTS idx_trigger_events_fingerprint 
    ON trigger_events (fingerprint) WHERE fingerprint IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_trigger_events_debounce 
    ON trigger_events (status, debounce_until) WHERE status = 'buffered';
CREATE INDEX IF NOT EXISTS idx_trigger_events_retry 
    ON trigger_events (status, next_retry_at) 
    WHERE status = 'failed' AND retry_count < 3;
CREATE INDEX IF NOT EXISTS idx_trigger_events_user_status 
    ON trigger_events (user_id, status, created_at DESC);

-- Phase A: Dead-letter table
CREATE TABLE IF NOT EXISTS dead_letter_events (
    id TEXT PRIMARY KEY DEFAULT 'dl_' || extract(epoch from now())::bigint::text,
    trigger_slug TEXT,
    raw_payload JSONB NOT NULL,
    reason TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    retry_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolved_by TEXT
);

-- Phase D: Error tracking on triggers table
ALTER TABLE triggers ADD COLUMN IF NOT EXISTS last_error TEXT;
ALTER TABLE triggers ADD COLUMN IF NOT EXISTS last_error_at TIMESTAMPTZ;

-- Cleanup: auto-expire old events (retention policy)
-- Run via Supabase cron or pg_cron
-- DELETE FROM trigger_events WHERE created_at < now() - interval '30 days';
-- DELETE FROM dead_letter_events WHERE resolved_at IS NOT NULL AND resolved_at < now() - interval '7 days';
```

---

## 6. Implementation Priority & Effort

| Phase | Item | Effort | Risk | Deploy Independently? |
|-------|------|--------|------|-----------------------|
| **A1** | Circuit breaker | 1h | Low | ✅ Yes |
| **A2** | AI semaphore | 30min | Low | ✅ Yes |
| **A3** | Retry worker | 2h | Low | ✅ Yes (after migration) |
| **A4** | Dead-letter table | 1h | Low | ✅ Yes (after migration) |
| **B1** | DB-backed dedup | 1.5h | Medium | ✅ Yes |
| **B2** | DB-backed debounce | 3h | Medium | ✅ Yes (biggest change) |
| **B3** | Notification persistence | 1h | Low | ✅ Yes |
| **C1** | Per-user rate limiter | 1h | Low | ✅ Yes |
| **C2** | Subscription health | 1h | Low | ✅ Yes |
| **C3** | Stale recovery | 30min | Low | ✅ Yes |
| **C4** | Idempotent setup | 30min | Low | ✅ Yes |
| **D1** | Trace IDs | 1h | Low | ✅ Yes |
| **D2** | Health dashboard | 1.5h | Low | ✅ Yes |
| **D3** | Per-trigger errors | 30min | Low | ✅ Yes |

**Total estimated: ~15 hours of implementation.**

**Recommended deployment order:**
1. Run DB migration (all phases at once — additive only, no breaking changes)
2. Phase A (circuit breaker + semaphore + retry + dead-letter)
3. Phase C (rate limiter + health monitor + stale recovery + idempotent setup)
4. Phase D (trace IDs + dashboard + error tracking)
5. Phase B (DB-backed dedup/debounce — biggest change, saved for last)

---

## 7. What We're NOT Doing (and Why)

| Approach | Why Not |
|----------|---------|
| **Redis for state** | Adds infrastructure complexity. Supabase Postgres is already available and sufficient for our scale (< 1000 events/day). |
| **Message queue (RabbitMQ, SQS)** | Overkill for current scale. The DB-backed debounce pattern gives us durable queuing without another service. |
| **Horizontal scaling (multiple replicas)** | Phase B's DB-backed state makes this *possible* but not *necessary* yet. Single process handles our load. |
| **Kafka / event streaming** | Way too complex. We're processing < 100 events/hour. |
| **Webhook-only (drop WebSocket)** | WebSocket is lower latency and more reliable for real-time. Keep both for redundancy. |

---

## 8. Success Criteria

After implementation, the trigger system should pass these tests:

1. **Restart resilience:** Kill the server mid-processing → restart → all buffered events are recovered and processed
2. **OpenAI outage:** Simulate OpenAI returning 500s → circuit breaker opens → fallback notifications sent → circuit recovers when OpenAI returns
3. **Duplicate delivery:** Send same event via webhook AND subscription → only processed once
4. **User mapping failure:** Send event with unknown user_id → lands in dead_letter table → visible in admin
5. **Noisy integration:** Send 100 Slack events in 1 minute → rate-limited to 30 → remaining stored as rate_limited, not lost
6. **Health visibility:** `/api/triggers/health` shows accurate real-time state of entire pipeline
7. **Event traceability:** Given a trace_id, can follow entire event journey from ingestion to notification in logs

---

## 9. Next Step

**Approve this plan** (or suggest modifications), then I'll implement Phase A first — the circuit breaker, semaphore, retry worker, and dead-letter table. These are the highest-impact, lowest-risk changes.
