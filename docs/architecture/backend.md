# Backend Architecture

## Overview

The CalmPilot backend is a FastAPI application (`python-agent/`) that serves as the brain of the platform. It handles AI-powered chat via the OpenAI Agents SDK, integrates third-party apps through Composio, processes real-time trigger events (emails, Slack messages, calendar alerts), manages billing via Dodo Payments, and streams notifications to connected frontend clients over SSE. All data is persisted in Supabase Postgres.

---

## Directory Structure

```
python-agent/
├── server.py               # App factory, router mounts, webhook endpoints, startup lifespan
├── config.py               # Logging setup, NotificationManager, global composio_client
├── middleware.py            # JWT auth dependency (get_current_user), StructuredLoggingMiddleware
├── triggers.py             # Trigger event dispatcher and per-app AI summariser prompts
├── limiter.py              # Shared slowapi rate-limiter instance (60 req/min default)
├── env_loader.py           # Loads .env.{APP_ENV} before any other import
├── run_dev.py              # Dev launcher (uvicorn with reload)
│
├── routers/                # One file per API surface area
│   ├── actions.py          # Execute user-initiated tool chains
│   ├── app_triggers.py     # Trigger CRUD: create, list, update, delete, test
│   ├── auth.py             # Signup, profile, delete-account, usage stats
│   ├── billing.py          # Dodo Payments: plans, checkout, subscription management
│   ├── calendar.py         # Calendar events, create, suggest-times, conflicts
│   ├── callback.py         # OAuth callback after Composio app connection
│   ├── chat.py             # AI chat stream (SSE), connections, suggestions
│   ├── dashboard.py        # Daily briefing, upcoming meeting, activity feed
│   ├── feedback.py         # User feedback submission
│   ├── health.py           # /api/health liveness + /api/status readiness probes
│   ├── history.py          # Conversation history CRUD
│   ├── inbox.py            # Agentic Gmail inbox fetch
│   ├── integrations.py     # List, connect, disconnect Composio integrations
│   ├── notifications.py    # SSE stream endpoint for push notifications
│   ├── review.py           # Human-in-the-loop action approval hub
│   ├── settings.py         # User preference read/write
│   ├── toolkits.py         # List available Composio toolkits
│   └── voice.py            # STT → chat-with-tools → TTS pipeline
│
├── services/               # Reusable business logic, no HTTP knowledge
│   ├── action_classifier.py    # Classify actions as destructive (requiring confirmation)
│   ├── bootstrap.py            # Seed first trigger events on new app connection (Day 0 fix)
│   ├── briefing_scheduler.py   # Predict user wakeup time, pre-generate daily briefing
│   ├── composio_client.py      # Composio SDK wrapper with retry policy
│   ├── composio_execute.py     # Execute Composio actions via explicit account resolution
│   ├── conflict_service.py     # Detect and propose resolutions for calendar conflicts
│   ├── data_card_parser.py     # Parse tool outputs into typed cards (email/calendar/message)
│   ├── email.py                # Transactional email via Resend (welcome, re-engagement)
│   ├── openai_client.py        # Singleton OpenAI client
│   ├── reengagement.py         # Hourly cron: email inactive users (2–7 day window)
│   ├── scheduling_service.py   # Find and rank free calendar slots
│   ├── session.py              # SupabaseSession: loads conversation history for Agent SDK
│   ├── supabase_client.py      # supabase (anon) and supabase_admin (service-role) clients
│   └── upcoming_meeting.py     # Detect meetings starting within 15 minutes
│
├── models/                 # Pydantic request/response models
├── supabase/               # DB migrations and schema snapshots
├── tests/                  # Pytest test suite
│
├── requirements.txt        # Pinned production dependencies
├── requirements-lock.txt   # Full transitive lock file
├── Dockerfile              # Container image (uvicorn, single worker)
├── apprunner.yaml          # AWS App Runner config
├── render.yaml             # Render.com config
├── cloudbuild.yaml         # Google Cloud Build pipeline
└── PRODUCTION_README.md    # Deployment playbook (do not duplicate here — link below)
```

---

## Key Files

| File Path | Purpose | Key Exports / Classes |
|---|---|---|
| `server.py` | App entry point — mounts routers, runs startup lifespan, hosts `/webhook` endpoints | `app` (FastAPI), `lifespan`, `verify_webhook_signature` |
| `config.py` | Module-level singletons loaded at import time | `notification_manager` (NotificationManager), `composio_client` (OpenAIAgentsProvider), `IS_CLOUD_RUN`, `logger` |
| `middleware.py` | HTTP auth and request logging | `get_current_user` (FastAPI dependency), `StructuredLoggingMiddleware` |
| `triggers.py` | Routes inbound trigger events to the right AI summariser | `dispatcher` (TriggerDispatcher), `TRIGGER_PROMPTS` |
| `limiter.py` | Shared rate-limiter | `limiter` (slowapi Limiter), `_has_limiter` |
| `services/composio_client.py` | Composio SDK with retry and legacy shim | `composio_toolset` (_ComposioCompat), `composio_call` |
| `services/supabase_client.py` | DB connection pool | `supabase` (anon client), `supabase_admin` (service-role client) |
| `services/session.py` | Conversation history loader for OpenAI Agents SDK | `SupabaseSession` |
| `services/openai_client.py` | OpenAI singleton | `openai_client` |

---

## Server Startup Flow

The `lifespan` async context manager in `server.py` runs the following steps in order on every cold start:

1. **Validate required env vars** — In cloud environments (`IS_CLOUD_RUN=true`), raises `RuntimeError` immediately if any of `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `COMPOSIO_API_KEY`, `OPENAI_API_KEY`, `WEB_APP_URL`, `API_BASE_URL`, `COMPOSIO_WEBHOOK_SECRET`, or `RESEND_API_KEY` is missing. Prevents a misconfigured container from silently serving partial traffic.

2. **Patch Composio trigger parser** — `_patch_composio_trigger_parser()` monkey-patches `Triggers._parse_payload` in the Composio SDK to handle payloads missing the `nanoId` field (present in newer Composio API versions). Without this, SDK raises `KeyError: 'nanoId'` and drops events silently.

3. **Register webhook with Composio** — `register_webhook_with_composio()` POSTs to `https://backend.composio.dev/api/v3/webhook_subscriptions` to ensure Composio routes `composio.trigger.message` events to our `/webhook` endpoint. Skipped in dev when `SKIP_WEBHOOK_REGISTRATION=true`.

4. **Start trigger subscription thread** — `_start_trigger_subscription()` opens a persistent outbound WebSocket/SSE connection to Composio (via `composio_toolset.triggers.subscribe()`). This is the **primary** delivery mechanism — it works without a public URL, so local development receives live trigger events. Reconnects automatically with exponential backoff (5 s → 300 s cap).

5. **Start briefing cron** — `asyncio.create_task(run_briefing_cron())` starts a background async task that predicts each user's wakeup time after 7+ days of data and pre-generates their daily briefing 30 minutes before.

6. **Start re-engagement cron** — `asyncio.create_task(run_reengagement_cron())` runs hourly, finds users inactive for 2–7 days, and sends one re-engagement email per 14-day cooldown window.

On shutdown, both cron tasks are cancelled and the trigger subscription thread is signalled to stop cleanly.

---

## Routers

All routers are mounted under `/api` in `server.py`.

| Router | Prefix | Endpoints | Purpose |
|---|---|---|---|
| `health` | `/api` | 3 | Liveness (`/health`), readiness (`/status`), and version probes |
| `callback` | `/api` | 1 | OAuth redirect after Composio app connection; auto-sets up triggers |
| `auth` | `/api/auth` | 6 | Signup/login hooks, profile CRUD, account deletion, usage stats |
| `integrations` | `/api/integrations` | 4 | List connected apps, initiate OAuth flow, disconnect, list allowed apps |
| `toolkits` | `/api/toolkits` | 2 | List available Composio toolkits with metadata |
| `calendar` | `/api/calendar` | 5 | Fetch events, create events, suggest free slots, detect conflicts |
| `inbox` | `/api/inbox` | 1 | Agentic Gmail inbox fetch with OpenAI function-calling loop |
| `dashboard` | `/api/dashboard` | 7 | Daily briefing, upcoming meeting, trigger event feed, activity log |
| `actions` | `/api/actions` | 1 | Execute user-initiated Composio tool chains |
| `voice` | `/api/voice` | 1 | STT → agent chat → TTS full pipeline |
| `chat` | `/api/chat` | 3 | AI chat (SSE stream), list connections, conversation suggestions |
| `notifications` | `/api/notifications` | 1 | SSE stream for real-time push notifications |
| `app_triggers` | `/api/triggers` | 12 | Trigger CRUD, enable/disable, test-fire, subscription tier gating |
| `review` | `/api/review` | 4 | Human-in-the-loop action approval, approve/reject AI suggestions |
| `billing` | `/api/billing` | 2 | Dodo Payments checkout, subscription status |
| `history` | `/api/history` | 6 | Conversation list, message history, delete conversation |
| `feedback` | `/api/feedback` | 1 | Submit user feedback |
| `settings` | `/api/settings` | 1 | Read/write user preferences |

Two additional webhook endpoints live directly on `server.py` (not in a router):

| Endpoint | Purpose |
|---|---|
| `POST /webhook` | Receive Composio trigger events (Svix HMAC signature verified) |
| `POST /webhook/dodo` | Receive Dodo Payments subscription events |
| `POST /webhook/test` | Dev-only: inject a mock trigger event into the pipeline |
| `POST /webhook/sync` | Pull recent trigger events from DB; acts as a heartbeat |

---

## Middleware

### JWT Auth — `get_current_user()`

Used as a FastAPI dependency (`Depends(get_current_user)`) on every protected endpoint.

1. Extracts the Bearer token from the `Authorization` header via `HTTPBearer`.
2. Calls `supabase.auth.get_user(token)` to validate the Supabase JWT (no local secret needed — Supabase verifies it server-side).
3. Performs a **global DB guard**: queries `public.profiles` to confirm the user record still exists. Returns `USER_NOT_FOUND` / `LOGOUT_REQUIRED` if it does not.
4. Returns `{"userId": str, "email": str, "name": str}` on success.

All `401` and `503` responses are JSON with structured `error` and `action` fields so the frontend can react programmatically (e.g., auto-logout on `LOGOUT_REQUIRED`).

### `StructuredLoggingMiddleware`

Wraps every request. Logs after the response is sent:

- `http_method`, `http_url`, `http_status`, `http_user_agent`
- `http_request_duration_ms` (wall-clock, rounded to 2 dp)
- `client_ip`

Log level: `INFO` for 2xx/3xx, `WARNING` for 4xx, `ERROR` for 5xx. In cloud environments the formatter outputs JSON compatible with Google Cloud Logging's structured log schema.

### Rate Limiting — `slowapi`

Configured in `limiter.py`: **60 requests/minute per IP** (in-memory, no Redis required). The limiter instance is attached to `app.state.limiter`. Individual routers can override the limit per-endpoint via the `@limiter.limit()` decorator.

### CORS

Controlled by the `ALLOWED_ORIGINS` environment variable (comma-separated). In production the defaults are `https://calmpilot.app` and `https://www.calmpilot.app`. In dev, `localhost:3000` and `localhost:8081` are also allowed. All HTTP methods and `Content-Type`/`Authorization` headers are permitted.

---

## Agent Architecture

### How the AI agent works

The chat endpoint (`routers/chat.py`) uses the **OpenAI Agents SDK** (`agents.Agent`, `agents.Runner`) together with **Composio** as the tool provider.

1. **Session creation** — `composio_client.create(user_id=userId, toolkits=["gmail", "googlecalendar", "slack"])` creates a Composio session scoped to the three supported toolkits for that user.
2. **Tool fetching** — `session.tools()` returns the full list of Composio tools the user can access based on their connected accounts. For free-tier users outside the grace period, `COMPOSIO_MANAGE_CONNECTIONS` is removed from the list to prevent self-serve OAuth flows.
3. **Agent construction** — `Agent(instructions=..., model="gpt-4o", tools=tools)` is created per-request with a system prompt that includes the user's timezone, current date, and list of connected apps.
4. **Conversation memory** — `SupabaseSession(user_id, conversation_id)` loads prior messages from the `messages` Supabase table so the agent has full context across server restarts.
5. **Streaming** — `Runner.run_streamed(starting_agent, input, session)` runs the agent and yields events asynchronously. The chat endpoint iterates `stream.stream_events()` and pushes typed SSE frames to an `asyncio.Queue`.
6. **SSE delivery** — An outer `StreamingResponse` generator reads from the queue and writes `data: {...}\n\n` frames, including tool-call progress events (`log` frames) and the final `result` frame with the full response, token counts, and conversation ID.

### Tool call flow

```
User message
    → Agent (GPT-4o)
        → COMPOSIO_SEARCH_TOOLS  (find the right tool)
        → COMPOSIO_MULTI_EXECUTE_TOOL  (call it with user's credentials)
    → SSE: log events (tool name, status)
    → SSE: result event (text, data cards, token usage)
```

Destructive actions (send email, create event, etc.) are classified by `services/action_classifier.py`. The frontend surfaces these as confirmation dialogs using the `collected_auth_actions` field in the result event.

---

## NotificationManager

`NotificationManager` (in `config.py`) is the in-process pub/sub bus that bridges trigger events to connected SSE clients.

### API

| Method | Signature | Behaviour |
|---|---|---|
| `subscribe(user_id)` | `→ asyncio.Queue` | Creates a queue for this SSE connection. If a cached summary exists in memory, enqueues it immediately. Otherwise loads the most recent `trigger_events` row from Supabase (survives server restarts). |
| `unsubscribe(user_id, queue)` | `→ None` | Removes the queue. Clears the in-memory cache when the last listener disconnects. |
| `push(user_id, event)` | `async → None` | Puts the event on every active queue for that user. Caches the latest summary per user for future `subscribe()` calls. |

### In-memory structure

```python
queues: Dict[str, List[asyncio.Queue]]   # user_id → [queue per open tab]
last_summaries: Dict[str, Dict]          # user_id → most recent trigger notification
```

`last_summaries` is capped at **5,000 entries** (LRU eviction) to prevent unbounded memory growth from offline users accumulating entries.

### SSE flow

```
Composio trigger fires
    → triggers.py dispatcher → notification_manager.push(user_id, event)
        → asyncio.Queue.put(event)
            → notifications.py SSE generator reads queue
                → data: {"type": "email_summary", "data": {...}}\n\n
                    → Frontend NotificationPanel updates
```

Supported event types that are cached: `proactive_summary`, `email_summary`, `github_update`, `slack_summary`, `calendar_alert`, `notion_update`, `linear_update`, `discord_summary`.

---

## Services Layer

| File | Purpose |
|---|---|
| `action_classifier.py` | Static set of `DESTRUCTIVE_ACTIONS` slugs; used by chat to flag actions requiring confirmation |
| `bootstrap.py` | Fetches recent app data (Gmail, Slack) on first connection and writes synthetic `trigger_events` so Day 0 briefings are populated |
| `briefing_scheduler.py` | Logs daily first-open events; after 7+ data points, predicts arrival time (median ± stdev) and pre-generates briefings 30 min early |
| `composio_client.py` | `composio_toolset` singleton with 3-attempt exponential retry; backwards-compat `execute_action` shim for older call sites |
| `composio_execute.py` | `execute_action(user_id, action, params)` — resolves `connected_account_id` explicitly before calling, which is more reliable than user ID auto-resolution |
| `conflict_service.py` | `detect_conflicts(user_id)` — fetches 7-day calendar via Composio, runs GPT to identify overlaps, returns resolution proposals |
| `data_card_parser.py` | Maps Composio action slugs to card types (email/calendar/message) and extracts structured fields for rich frontend rendering |
| `email.py` | Async email sending via Resend API — welcome email on signup, re-engagement email for inactive users |
| `openai_client.py` | `openai_client` singleton (used by conflict_service, briefing, etc. for non-streaming calls) |
| `reengagement.py` | `run_reengagement_cron()` — runs hourly; queries `user_activity_log` for users inactive 2–7 days; sends at most one email per 14-day cooldown |
| `scheduling_service.py` | `calculate_free_slots(events, start, end, duration)` — pure function that computes gaps between busy events and ranks slots by quality |
| `session.py` | `SupabaseSession` — implements the OpenAI Agents SDK `Session` protocol; `get_items()` loads prior messages from Supabase; `add_items()` is a no-op (persistence handled by `history.py`) |
| `supabase_client.py` | `supabase` (anon key, for user-scoped RLS queries) and `supabase_admin` (service-role key, bypasses RLS for backend operations) |
| `upcoming_meeting.py` | `get_upcoming_meeting(user_id)` — fetches events in the next 15 minutes and returns the first one with a meeting link |

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_KEY` | Yes | Supabase anon public key (RLS-enforced) |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service-role key (bypasses RLS) |
| `SUPABASE_SERVICE_KEY` | Yes (cloud) | Alias checked at startup validation |
| `OPENAI_API_KEY` | Yes | OpenAI API key for GPT-4o and embeddings |
| `COMPOSIO_API_KEY` | Yes | Composio API key for tool access and trigger management |
| `COMPOSIO_WEBHOOK_URL` | Yes (cloud) | Public URL for Composio to POST trigger events to `/webhook` |
| `COMPOSIO_WEBHOOK_SECRET` | Yes (cloud) | Svix HMAC secret for webhook signature verification |
| `RESEND_API_KEY` | Yes (cloud) | Resend API key for transactional email |
| `DODO_PAYMENTS_API_KEY` | For billing | Dodo Payments API key |
| `DODO_PAYMENTS_WEBHOOK_KEY` | For billing | Dodo Payments webhook signing key |
| `DODO_PAYMENTS_ENVIRONMENT` | For billing | `test_mode` or `live_mode` |
| `WEB_APP_URL` | Yes (cloud) | Frontend origin URL (e.g., `https://calmpilot.app`) |
| `API_BASE_URL` | Yes (cloud) | This backend's public URL |
| `ALLOWED_ORIGINS` | No | Comma-separated CORS origins (defaults to localhost + calmpilot.app) |
| `FROM_EMAIL` | No | Sender address for emails (default: `CalmPilot <hello@calmpilot.app>`) |
| `DASHBOARD_URL` | No | URL embedded in email CTAs (default: `https://calmpilot.app/dashboard`) |
| `LOG_LEVEL` | No | Root log level: `DEBUG`, `INFO`, `WARNING`, `ERROR` (default: `INFO`) |
| `ENABLE_FILE_LOGGING` | No | Write logs to `agent.log` in addition to stdout (default: `true` in dev, `false` in cloud) |
| `COMPOSIO_DISABLE_TELEMETRY` | No | Disable Composio SDK usage tracking (default: `true`) |
| `SKIP_WEBHOOK_REGISTRATION` | No | Set `true` in dev to skip Composio webhook registration on startup |
| `APP_ENV` | No | Environment name used by `env_loader.py` to pick `.env.{APP_ENV}` |

---

## Common Tasks

### How do I add a new router?

1. Create `python-agent/routers/my_feature.py` with an `APIRouter` instance:
   ```python
   from fastapi import APIRouter, Depends
   from middleware import get_current_user

   router = APIRouter()

   @router.get("/example")
   async def example(current_user: dict = Depends(get_current_user)):
       return {"user": current_user["userId"]}
   ```
2. Add `from routers import my_feature` to the import block in `server.py`.
3. Mount it: `app.include_router(my_feature.router, prefix="/api/my-feature", tags=["My Feature"])`.
4. Add the router filename to `routers/__init__.py` if it uses `__all__`.
5. Write tests in `tests/` and update the Routers table in this document.

### How do I add a new service?

1. Create `python-agent/services/my_service.py`. Keep it free of FastAPI imports — services contain pure business logic.
2. Import from `services/supabase_client.py`, `services/composio_client.py`, or `services/openai_client.py` as needed.
3. Use lazy imports inside functions (not at module top level) to avoid circular import issues with `config.py`.
4. Import and call your service from the relevant router.
5. Add it to the Services Layer table in this document.

---

## Further Reading

- **[PRODUCTION_README.md](../../python-agent/PRODUCTION_README.md)** — Deployment guide: Cloud Run, Render, AWS App Runner, Docker, worker configuration, cost-safety guards.
- **[docs/architecture/lld/](lld/)** — Low-level design documents for individual features.
- **[docs/api/](../api/)** — API endpoint reference.
- **[docs/architecture/system-overview.md](system-overview.md)** — High-level system architecture (start here if you haven't read it).
