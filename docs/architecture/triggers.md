# Trigger System Architecture

## Overview

Triggers are **event-driven automations** that run 24/7 in the background, without the user needing to open CalmPilot. When a connected app fires an event — a new Slack message, a calendar update, an incoming email — the event flows through a multi-stage pipeline that deduplicates, filters noise, debounces bursts, generates an AI summary, persists the result, and delivers it to the user in real time via Server-Sent Events (SSE). The result is a proactive, always-on assistant that surfaces what matters without overwhelming the user.

---

## Pipeline Overview

```
Composio SDK Subscription (background thread)
        │
        ▼
TriggerDispatcher.handle_event(payload)
        │
        ├─ 1. Deduplication
        │       Fingerprint = trigger_id + trigger_slug + MD5(data)
        │       Skips if seen within last 1 hour (_seen_events dict)
        │
        ├─ 2. User Resolution
        │       Extract user_id from metadata/connection block
        │       Verify against Supabase auth users
        │       Fallback: composio_entities table, connected_accounts lookup
        │       Unresolvable → dead-letter (persisted, not dropped)
        │
        ├─ 3. Noise Filter (L1 heuristic)
        │       _is_noise(): drops bot messages, reactions, empty payloads, etc.
        │
        ├─ 4. DB Log
        │       _log_event_to_db() → trigger_events table (status: "pending")
        │
        ├─ 5. Debounce ("Quiet Window")
        │       Key = user_id:app_name:channel_key
        │       Free tier:  30-minute window (collapses burst into one AI call)
        │       Paid tier:  30-second window
        │       Timer resets on every new event in the same channel
        │
        └─ 6. Quiet Window Reached
                │
                ├─ Rate-limit check (free: 10 fires/day via try_increment_trigger_fire RPC)
                ├─ AI Summary (specialized prompt per trigger type)
                │   └─ composio_client session.tools() + OpenAI Agents SDK
                ├─ DB update: status → "notified" / "completed"
                └─ SSE push via NotificationManager → frontend card
```

For function-level details (exact method signatures, SQL queries, error paths), see [lld/trigger-pipeline.md](lld/trigger-pipeline.md).

---

## Trigger Types

### Curated triggers (auto-setup on connect)

When a user successfully connects an app, `_run_auto_setup` in `callback.py` calls `auto_setup_triggers(user_id, app_name)`. This function:

1. Reads `PREFERRED_TRIGGERS` in `app_triggers.py` for a curated list of triggers with pre-configured defaults.
2. If the app is not in `PREFERRED_TRIGGERS`, dynamically discovers all triggers for that app from the Composio API and auto-creates every trigger that has **no required config fields**.
3. Calls `composio_toolset.triggers.create()` for each trigger — this call is idempotent, so running it multiple times is safe.

**Current curated defaults (active at launch):**

| App | Auto-created triggers |
|---|---|
| Gmail | `GMAIL_NEW_GMAIL_MESSAGE` (INBOX only) |
| Google Calendar | `GOOGLECALENDAR_GOOGLE_CALENDAR_EVENT_UPDATED_TRIGGER`, `GOOGLECALENDAR_EVENT_STARTING_SOON_TRIGGER`, `GOOGLECALENDAR_GOOGLE_CALENDAR_EVENT_CREATED_TRIGGER`, `GOOGLECALENDAR_EVENT_CANCELED_DELETED_TRIGGER` |
| Slack | `SLACK_RECEIVE_MESSAGE`, `SLACK_RECEIVE_DIRECT_MESSAGE` |

Curated triggers for future apps (GitHub, Notion, Outlook, Stripe, etc.) are already defined in `PREFERRED_TRIGGERS` and will be used automatically when those apps are uncommented in `ALLOWED_APPS`.

### Dynamic triggers (user-created via API)

Users (or the UI) can create, pause, and delete triggers at any time via the `app_triggers` router. Dynamic triggers respect the same pipeline but are not automatically created on connect. They are stored in the `triggers` Supabase table alongside curated triggers.

---

## Per-App Trigger Management

The `app_triggers` router (`python-agent/routers/app_triggers.py`) exposes CRUD endpoints for trigger lifecycle management:

| Endpoint | Purpose |
|---|---|
| `GET /app-triggers/trigger-apps` | List connected apps that have at least one available trigger type |
| `GET /app-triggers/available?appName=...` | List all trigger types available for a specific app |
| `GET /app-triggers` | List the user's active triggers from the `triggers` table |
| `POST /app-triggers` | Create a new trigger (manual or from UI) |
| `PATCH /app-triggers/{id}/pause` | Pause a trigger (Composio disables delivery) |
| `PATCH /app-triggers/{id}/resume` | Resume a paused trigger |
| `DELETE /app-triggers/{id}` | Delete a trigger from Composio and Supabase |

Config values submitted from the UI are automatically coerced to match the trigger's schema types (string → integer/boolean) via `_coerce_config()`.

---

## Subscription Thread

The Composio SDK's built-in WebSocket/SSE subscription is the **primary event delivery mechanism**. It does not require a public-facing webhook URL, which simplifies local development and staging environments.

On server startup (`server.py`), `_start_trigger_subscription()` launches a daemon thread that:

1. Creates a `composio_toolset.triggers.subscribe()` subscription.
2. Registers `_on_trigger_event(event)` as the handler.
3. The handler normalizes the raw SDK event object into a standard `payload` dict and dispatches it to `dispatcher.handle_event(payload)` using `asyncio.run_coroutine_threadsafe()` (because the handler runs in a sync thread, not the async event loop).
4. On failure, the thread restarts the subscription with exponential backoff (up to indefinite restarts, stopping only when `_trigger_stop_event` is set during shutdown).

The subscription runs on a separate daemon thread to avoid blocking the FastAPI request loop. The `asyncio.run_coroutine_threadsafe()` bridge ensures safe cross-thread communication with the async dispatcher.

---

## Rate Limiting

Rate limits are enforced inside `TriggerDispatcher._trigger_background_summary()` using the `user_credits` Supabase table.

| Tier | Daily AI summary limit | Debounce window |
|---|---|---|
| Free | 10 fires/day | 30 minutes (batches all events in a channel into one AI call) |
| Starter / Pro | Unlimited | 30 seconds (near-real-time, quiet-window strategy) |

The daily limit is checked and incremented atomically via the `try_increment_trigger_fire` Supabase RPC function. If the RPC call fails, a non-atomic fallback reads `trigger_fires_today` directly. Events blocked by the rate limit update the `trigger_events` row to status `"failed"` with an explanatory error message.

The debounce window resets on every new event for the same `user_id:app_name:channel_key` key. This means a Slack channel that sends 20 messages in 25 seconds (free tier) will produce exactly one AI summary instead of 20 separate calls.

---

## Key Files

| File Path | Purpose |
|---|---|
| `python-agent/triggers.py` | `TriggerDispatcher` class — dedup, noise filter, debounce, rate limiting, AI summary, SSE push; `TRIGGER_PROMPTS` per-app prompt routing |
| `python-agent/server.py` | Starts the subscription background thread on startup; `_on_trigger_event` normalization logic |
| `python-agent/routers/app_triggers.py` | Trigger CRUD endpoints; `auto_setup_triggers()` for curated defaults; `PREFERRED_TRIGGERS` config |
| `python-agent/routers/callback.py` | OAuth callback; triggers `_run_auto_setup` as a background task after successful OAuth |
| `python-agent/routers/integrations.py` | `_ensure_triggers_for_connected_apps()` — idempotency guard that re-runs auto-setup for connected apps missing triggers (called on every GET /integrations, rate-limited to once per 60 s per user) |
| `python-agent/services/composio_client.py` | `composio_toolset` — low-level Composio SDK client with retry policy; used for trigger CRUD (`triggers.create`, `triggers.delete`, `triggers.list`, `triggers.subscribe`) |
| `python-agent/config.py` | `notification_manager` (SSE queues + Supabase-backed cache); `composio_client` for tool execution |

---

## Further Reading

- [lld/trigger-pipeline.md](lld/trigger-pipeline.md) — Function-level walkthrough of every stage in the trigger pipeline, including exact method calls, SQL queries, and error paths.
- [TRIGGER_ARCHITECTURE_PLAN.md](../../TRIGGER_ARCHITECTURE_PLAN.md) — Original design document with rationale for debounce strategy, tier design, and future extension points.

---

## Common Tasks

### How do I add triggers for a new app?

1. **Uncomment the app** in `ALLOWED_APPS` in `python-agent/routers/integrations.py` so users can connect it.

2. **Add a `PREFERRED_TRIGGERS` entry** in `python-agent/routers/app_triggers.py`. Define the trigger slugs and their default config. If you leave this out, the system auto-discovers and creates all config-free triggers for the app — which may be noisy.
   ```python
   "myapp": [
       {"slug": "MYAPP_NEW_ITEM_TRIGGER", "config": {}},
   ],
   ```

3. **Add a routing prompt** in `TRIGGER_PROMPTS` in `python-agent/triggers.py` keyed on the trigger slug prefix (uppercase):
   ```python
   "MYAPP": (
       "You are CalmPilot's MyApp assistant. Analyze these events. "
       "Highlight: ... Be concise."
   ),
   ```

4. **Add a notification type** in the `type_map` in `_get_notification_type()` (triggers.py) and in `NotificationManager._load_cached_notification()` (config.py) so the frontend renders the right card style.

5. **Test end-to-end:** connect the app in the UI, verify triggers appear in the `triggers` table, then trigger an event in the connected app and confirm a row appears in `trigger_events` with status `"notified"` and that the SSE stream delivers a notification card.
