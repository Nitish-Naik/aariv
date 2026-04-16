# Implementation Plan — Smart Briefing System

## Phase 1: Database (Supabase)

### Step 1.1: Create `user_briefing_state` table
Run in Supabase SQL Editor:
- See [DATABASE.md](./DATABASE.md) for full SQL

### Step 1.2: Create RPC functions
- `advance_briefing_cursor(user_id, now)`
- `count_events_since_cursor(user_id)`

### Step 1.3: Enable Realtime on `trigger_events`
- Supabase Dashboard → Database → Replication → Enable `trigger_events`

### Step 1.4: Backfill existing users
```sql
INSERT INTO public.user_briefing_state (user_id)
SELECT id FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_briefing_state)
ON CONFLICT DO NOTHING;
```

### Step 1.5: Update `handle_new_user()` trigger
Add auto-creation of `user_briefing_state` row on signup.

---

## Phase 2: Backend — Core Logic

### Step 2.1: Add helpers to `dashboard.py`

```python
# New functions:
async def _get_or_init_briefing_state(user_id: str) -> dict
async def _count_events_since(user_id: str, cursor: str | None) -> int
async def _advance_briefing_cursor(user_id: str, now_utc: str) -> None
```

### Step 2.2: Modify `_generate_briefing_data()`

Add `since: datetime | None` parameter. Change event query from fixed 24h to cursor-based:

```python
# Before:
cutoff = (today - timedelta(hours=24)).strftime(...)

# After:
if since:
    cutoff = since.strftime(...)
else:
    cutoff = (today - timedelta(hours=24)).strftime(...)  # fallback for NULL cursor
```

### Step 2.3: Rewrite `get_briefing` endpoint

New flow:
1. Tier gate (existing + grace period)
2. Get cursor from `user_briefing_state`
3. Count events since cursor
4. If 0 → return calm state (NO AI call, $0)
5. If N > 0 → generate briefing with `since=cursor`
6. Advance cursor
7. Return with metadata: `is_incremental`, `since`, `briefing_type`

### Step 2.4: Update GPT prompt

Add time-window context:
- Morning (>10h): "This is a MORNING BRIEFING covering overnight events"
- Incremental (2-10h): "INCREMENTAL UPDATE covering the last ~N hours"
- Quick (<2h): "QUICK UPDATE covering the last ~N minutes"
- First (NULL cursor): "This is the user's FIRST BRIEFING"

### Step 2.5: Cache invalidation

In `triggers.py` `_log_event_to_db()`, after writing a trigger_event:
```python
from routers.dashboard import _briefing_cache
_briefing_cache.pop(user_id, None)
```

---

## Phase 3: Backend — Scheduler

### Step 3.1: Modify `briefing_scheduler.py`

`_generate_and_deliver()`:
1. Read cursor from `user_briefing_state`
2. Generate briefing scoped to events since cursor
3. Store in `briefings` table
4. Do NOT advance cursor (user must view)
5. Send email notification

### Step 3.2: Add `new_since_pregen` logic

When serving a pre-generated briefing:
1. Check if events arrived after pre-gen timestamp
2. If yes, include count in response: `new_since_pregen: N`
3. Frontend shows "N new events since morning brief" with refresh button

---

## Phase 4: Frontend

### Step 4.1: Supabase Realtime subscription

In `dashboard/page.tsx`:
```typescript
const channel = supabase
  .channel(`briefing-${user.id}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'trigger_events',
    filter: `user_id=eq.${user.id}`,
  }, () => {
    setHasNewEvents(true);
    setNewEventCount(prev => prev + 1);
  })
  .subscribe();
```

### Step 4.2: "New events" banner

When `hasNewEvents`:
```
┌──────────────────────────────────────┐
│ 🔄 3 new events since last check    │
│        [ Refresh briefing ]         │
└──────────────────────────────────────┘
```

### Step 4.3: Update TypeScript types

```typescript
interface Briefing {
  // Existing
  subtitle: string;
  is_calm: boolean;
  counts: { meetings: number; emails: number; focus_hours: number; needs_judgment: number };
  proposals: Proposal[];
  events: CalendarEvent[];
  insight: string;

  // NEW
  is_incremental: boolean;
  since: string | null;
  briefing_type: "first" | "morning" | "incremental" | "caught_up";
  new_since_pregen?: number;
}
```

### Step 4.4: Briefing type UI

- **First**: "Welcome to CalmPilot! Here's your inbox overview."
- **Morning**: "Good morning, Nitish. While you slept:"
- **Incremental**: "Since you last checked (4 hours ago):"
- **Caught up**: "You're all caught up. Nothing new." (no AI call)

---

## Phase 5: Testing

### Test Cases

1. **New user (NULL cursor)** → should show all bootstrap events as "first briefing"
2. **Caught up (0 events)** → should return calm state, NO AI call, $0 cost
3. **Morning briefing (overnight)** → should show only events since last check
4. **Incremental (midday)** → should show only events since morning check
5. **Two tabs open** → atomic cursor, no duplicate briefings
6. **Pre-gen + new events** → should show pre-gen + "N new since" badge
7. **Free tier (post-grace)** → 403 on briefing
8. **Free tier (in grace)** → briefing allowed, cursor works
9. **Paid tier** → briefing always works, cursor works

---

## Files to Modify

| File | Changes |
|------|---------|
| `python-agent/routers/dashboard.py` | New helpers, rewritten endpoint, prompt update |
| `python-agent/services/briefing_scheduler.py` | Use cursor, don't advance on pre-gen |
| `python-agent/triggers.py` | Cache invalidation on new event |
| `web/src/app/dashboard/page.tsx` | Realtime subscription, new events banner, briefing types |
| Supabase SQL Editor | New table, RPC functions, backfill |

## Estimated Time

| Phase | Time |
|-------|------|
| Database setup | 30 min |
| Backend core | 2-3 hours |
| Scheduler update | 1 hour |
| Frontend | 1-2 hours |
| Testing | 1 hour |
| **Total** | **5-7 hours** |
