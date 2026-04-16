# CalmPilot Documentation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Write comprehensive documentation for CalmPilot covering developer architecture (10 files), API reference (7 files), user guide (7 files), docs index (1 file), and inline code documentation.

**Architecture:** Each doc file is independent markdown. Subagents read source code directly and write documentation based on what they find. No code changes except for inline docstrings/JSDoc.

**Tech Stack:** Markdown files in `docs/`, Google-style Python docstrings, JSDoc for TypeScript

---

## File Structure

```
docs/
  README.md                          # CREATE — Documentation index
  architecture/
    system-overview.md               # CREATE — High-level architecture
    backend.md                       # CREATE — FastAPI backend deep dive
    frontend.md                      # CREATE — Next.js frontend structure
    database.md                      # CREATE — Supabase schema reference
    integrations.md                  # CREATE — Composio integration layer
    triggers.md                      # CREATE — Trigger system overview
    lld/
      trigger-pipeline.md            # CREATE — Trigger pipeline LLD
      agent-chat-execution.md        # CREATE — Chat execution LLD
      oauth-connection.md            # CREATE — OAuth flow LLD
      billing-credits.md             # CREATE — Billing system LLD
  api/
    README.md                        # CREATE — API overview + auth + errors
    chat.md                          # CREATE — Chat endpoints
    integrations.md                  # CREATE — Integration endpoints
    triggers.md                      # CREATE — Trigger endpoints
    dashboard.md                     # CREATE — Dashboard endpoints
    billing.md                       # CREATE — Billing endpoints
    webhooks.md                      # CREATE — Webhook endpoints
  user-guide/
    getting-started.md               # CREATE — First-time user guide
    morning-briefing.md              # CREATE — Briefing feature guide
    assistant.md                     # CREATE — AI chat guide
    integrations.md                  # CREATE — App connection guide
    triggers.md                      # CREATE — Automation guide
    billing.md                       # CREATE — Credits + billing guide
    faq.md                           # CREATE — Frequently asked questions
```

**Existing files to reference (do NOT duplicate, link to them):**
- `PROJECT_CONTEXT.md` — Practical onboarding guide
- `python-agent/PRODUCTION_README.md` — Production deployment
- `TRIGGER_ARCHITECTURE_PLAN.md` — Trigger scaling roadmap
- `PRICING_STRATEGY.md` — Pricing model details
- `python-agent/README_DEPENDENCIES.md` — Dependency management
- `product/*.md` — Feature specs per page

---

### Task 1: Create documentation directory structure + docs/README.md

**Files:**
- Create: `docs/architecture/lld/` (directory)
- Create: `docs/api/` (directory)
- Create: `docs/user-guide/` (directory)
- Create: `docs/README.md`

- [ ] **Step 1: Create directories**

```bash
mkdir -p docs/architecture/lld docs/api docs/user-guide
```

- [ ] **Step 2: Write docs/README.md**

Write the following to `docs/README.md`:

```markdown
# CalmPilot Documentation

> **New here?** Start with [System Overview](architecture/system-overview.md) to understand how everything fits together.

## Architecture

Developer documentation for understanding the CalmPilot system.

| Document | Description |
|----------|-------------|
| [System Overview](architecture/system-overview.md) | High-level architecture, service map, local dev setup |
| [Backend](architecture/backend.md) | FastAPI app structure, routers, middleware, agent setup |
| [Frontend](architecture/frontend.md) | Next.js pages, components, contexts, API client |
| [Database](architecture/database.md) | Supabase tables, relationships, RLS policies |
| [Integrations](architecture/integrations.md) | Composio SDK, OAuth flow, tool library |
| [Triggers](architecture/triggers.md) | Event-driven automation pipeline |

### Low-Level Design

Function-level documentation for the 4 most complex flows.

| Document | Description |
|----------|-------------|
| [Trigger Pipeline](architecture/lld/trigger-pipeline.md) | Webhook → dedup → filter → debounce → AI summary → notify |
| [Agent Chat Execution](architecture/lld/agent-chat-execution.md) | Message → auth → tools → agent → SSE stream → billing |
| [OAuth Connection](architecture/lld/oauth-connection.md) | App select → Composio OAuth → callback → auto-triggers |
| [Billing & Credits](architecture/lld/billing-credits.md) | Credit check → LLM call → token count → debit → topup |

## API Reference

Complete endpoint documentation for the FastAPI backend.

| Document | Description |
|----------|-------------|
| [API Overview](api/README.md) | Base URL, authentication, rate limits, error format |
| [Chat](api/chat.md) | AI assistant chat with SSE streaming |
| [Integrations](api/integrations.md) | App connection and OAuth endpoints |
| [Triggers](api/triggers.md) | Trigger CRUD and event management |
| [Dashboard](api/dashboard.md) | Morning briefing and activity feed |
| [Billing](api/billing.md) | Credits, subscriptions, and transactions |
| [Webhooks](api/webhooks.md) | Composio and payment webhook receivers |

## User Guide

End-user documentation for CalmPilot features.

| Document | Description |
|----------|-------------|
| [Getting Started](user-guide/getting-started.md) | Sign up, connect apps, first briefing |
| [Morning Briefing](user-guide/morning-briefing.md) | How briefings work |
| [AI Assistant](user-guide/assistant.md) | Chat with the AI, example prompts |
| [Integrations](user-guide/integrations.md) | Connecting and managing apps |
| [Triggers](user-guide/triggers.md) | Setting up automations |
| [Billing](user-guide/billing.md) | Credits, plans, and topping up |
| [FAQ](user-guide/faq.md) | Common questions answered |

## Other Resources

| Document | Description |
|----------|-------------|
| [PROJECT_CONTEXT.md](../PROJECT_CONTEXT.md) | Practical contributor onboarding guide |
| [PRODUCTION_README.md](../python-agent/PRODUCTION_README.md) | Production deployment, workers, monitoring |
| [PRICING_STRATEGY.md](../PRICING_STRATEGY.md) | Pricing model analysis and GTM strategy |
| [REMAINING_ITEMS.md](../REMAINING_ITEMS.md) | Phase 2-4 implementation gaps |
| [Product Specs](../product/) | Feature specifications per page |
```

- [ ] **Step 3: Commit**

```bash
git add docs/README.md
git commit -m "docs: add documentation index and directory structure"
```

---

### Task 2: Write architecture/system-overview.md

**Files:**
- Create: `docs/architecture/system-overview.md`

**Context:** CalmPilot has 3 main components: Next.js frontend (Vercel), FastAPI backend (cloud), Supabase DB (managed). External services: OpenAI API, Composio SDK, DodoPayments, Resend.

- [ ] **Step 1: Read source files for accuracy**

Read these files to extract exact details:
- `python-agent/server.py` — CORS origins, routers registered, lifespan events, env vars
- `web/next.config.js` — env vars, security headers
- `web/package.json` — key dependencies
- `PROJECT_CONTEXT.md` — folder structure, dev setup
- `docker-compose.yml` — if it has service definitions

- [ ] **Step 2: Write docs/architecture/system-overview.md**

The document must include these sections:
1. **Overview** — CalmPilot is an AI work assistant SaaS (2-3 sentences)
2. **Architecture Diagram** — text-based showing: User → Next.js (Vercel) → FastAPI (Cloud) → Supabase + OpenAI + Composio
3. **Service Map** — table with: Service, Purpose, Where It Runs, Key Tech
   - Frontend: Next.js 14, React 18, Tailwind, shadcn/ui → Vercel
   - Backend: FastAPI, Python 3.11+, OpenAI Agents SDK → Cloud (Render/Railway)
   - Database: PostgreSQL via Supabase → Supabase managed
   - AI: OpenAI GPT-4o (reasoning), GPT-4o-mini (summaries) → OpenAI API
   - Integrations: Composio SDK (1000+ tools, OAuth, triggers) → Composio cloud
   - Payments: DodoPayments → DodoPayments
   - Email: Resend → Resend
4. **Request Flow** — step-by-step for a typical user action (e.g., "user asks AI to send an email")
5. **Repository Structure** — folder map with descriptions (reference PROJECT_CONTEXT.md, link to it)
6. **Local Development Setup** — exact commands to run frontend + backend
7. **Environment Variables** — table of ALL env vars across frontend and backend, grouped by service
8. **Deployment** — how frontend deploys to Vercel, backend deploys to cloud host

- [ ] **Step 3: Verify all file paths and env vars are accurate**

Read the file back and cross-reference against source files.

- [ ] **Step 4: Commit**

```bash
git add docs/architecture/system-overview.md
git commit -m "docs: add system overview architecture document"
```

---

### Task 3: Write architecture/backend.md

**Files:**
- Create: `docs/architecture/backend.md`

- [ ] **Step 1: Read source files**

Read these files:
- `python-agent/server.py` — full file (routers, lifespan, CORS, webhook handler)
- `python-agent/middleware.py` — auth dependency, logging middleware
- `python-agent/config.py` — NotificationManager, logging setup, composio_client
- `python-agent/services/` — list all service files and read their key exports
- `python-agent/requirements.txt` or `python-agent/requirements.in` — dependencies
- `python-agent/PRODUCTION_README.md` — production config (link to it, don't duplicate)

- [ ] **Step 2: Write docs/architecture/backend.md**

Sections:
1. **Overview** — FastAPI backend handling AI chat, integrations, triggers, billing
2. **Directory Structure** — tree of `python-agent/` with file descriptions
3. **Key Files** — table: File Path → Purpose → Key Exports
4. **Server Startup Flow** — step-by-step from `server.py` lifespan: env validation → Composio patch → webhook registration → trigger subscription thread → briefing cron → reengagement cron
5. **Routers** — table of all 18 routers: Router Name → Prefix → Endpoints Count → Purpose
6. **Middleware** — JWT auth via `get_current_user()`, structured logging, rate limiting (slowapi)
7. **Agent Architecture** — how OpenAI Agents SDK + Composio tools create the AI agent, how streaming works
8. **NotificationManager** — how SSE push notifications work (subscribe/unsubscribe/push)
9. **Services Layer** — table of all service files and their responsibilities
10. **Environment Variables** — all backend env vars with descriptions
11. **Common Tasks** — "How do I add a new router?", "How do I add a new service?"
12. **Further Reading** — link to `PRODUCTION_README.md` for deployment, link to LLD docs

- [ ] **Step 3: Commit**

```bash
git add docs/architecture/backend.md
git commit -m "docs: add backend architecture document"
```

---

### Task 4: Write architecture/frontend.md

**Files:**
- Create: `docs/architecture/frontend.md`

- [ ] **Step 1: Read source files**

Read these files:
- `web/src/app/layout.tsx` — root layout, providers wrapping
- `web/src/app/dashboard/layout.tsx` — dashboard layout, sidebar
- `web/src/context/AuthContext.tsx` — auth flow, Google OAuth, syncWithBackend
- `web/src/context/ThemeContext.tsx` — theme toggle
- `web/src/context/useBilling.tsx` — billing state, real-time subscription
- `web/src/context/ToastContext.tsx` — toast notifications
- `web/src/context/LogoContext.tsx` — app logo caching
- `web/src/lib/api.ts` — HTTP client, auth header injection, error handling
- `web/src/lib/types.ts` — key type definitions
- `web/next.config.js` — security headers, CSP

- [ ] **Step 2: Write docs/architecture/frontend.md**

Sections:
1. **Overview** — Next.js 14 App Router, React 18, Tailwind CSS, shadcn/ui
2. **Directory Structure** — tree of `web/src/` with descriptions
3. **Pages** — table of all 16 routes: Route → File → Purpose → Auth Required?
4. **Components** — organized by category: Core (Sidebar, ErrorBoundary, etc.), Dashboard (EmptyState, WeeklyStats), Landing Page (Hero, Features, Pricing, etc.), UI (shadcn components)
5. **Context Providers** — for each of the 5 contexts: what it provides, key functions, how to use it
6. **API Client** — how `web/src/lib/api.ts` works: auto auth headers, timeout, error handling, streaming
7. **SSE Streaming** — how the assistant chat receives real-time responses from the backend
8. **Styling** — Tailwind CSS + shadcn/ui patterns, dark mode via ThemeContext
9. **State Management** — Zustand for prompt store, React Context for auth/billing/theme
10. **Environment Variables** — NEXT_PUBLIC_API_URL, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
11. **Common Tasks** — "How do I add a new dashboard page?", "How do I add a new context provider?"

- [ ] **Step 3: Commit**

```bash
git add docs/architecture/frontend.md
git commit -m "docs: add frontend architecture document"
```

---

### Task 5: Write architecture/database.md

**Files:**
- Create: `docs/architecture/database.md`

- [ ] **Step 1: Read SQL schema files**

Read ALL files in `python-agent/supabase/`:
- `production_schema_v2.sql` — main schema
- `onboarding_migration.sql`
- `subscription_tier_migration.sql`
- `smart_briefing_state.sql`
- `user_activity_log_briefings.sql`
- `feedback_table.sql`
- `pre-launch-checklist.sql`
- `add_subscription_columns.sql`
- `fix_missing_columns.sql`

- [ ] **Step 2: Write docs/architecture/database.md**

Sections:
1. **Overview** — Supabase (managed PostgreSQL) with RLS, real-time subscriptions
2. **Schema Diagram** — text-based relationship diagram:
   ```
   auth.users (1:1) → profiles
   auth.users (1:1) → user_credits
   auth.users (1:n) → billing_transactions
   auth.users (1:n) → triggers → trigger_events
   auth.users (1:n) → conversations → messages → tool_execution_logs
   auth.users (1:n) → review_items
   auth.users (1:n) → composio_entities
   auth.users (1:n) → briefings
   auth.users (1:1) → user_briefing_state
   auth.users (1:n) → user_activity_log
   auth.users (1:n) → feedback
   ```
3. **Tables** — one subsection per table (14 tables total). For each: columns table (Name, Type, Default, Description), indexes, RLS policy summary
4. **Stored Procedures** — table of all 11 functions: Name → Purpose → Parameters → Returns
5. **Enums** — transaction_type enum values
6. **Key Queries** — common query patterns used by the backend (read from router files)
7. **Migration Pattern** — how schema changes are applied (SQL files in `python-agent/supabase/`)
8. **Common Tasks** — "How do I add a new table?", "How do I add a stored procedure?"

- [ ] **Step 3: Commit**

```bash
git add docs/architecture/database.md
git commit -m "docs: add database architecture document"
```

---

### Task 6: Write architecture/integrations.md + architecture/triggers.md

**Files:**
- Create: `docs/architecture/integrations.md`
- Create: `docs/architecture/triggers.md`

- [ ] **Step 1: Read source files**

Read:
- `python-agent/routers/integrations.py` — connection flow
- `python-agent/routers/callback.py` — OAuth callback, auto_setup_triggers
- `python-agent/routers/toolkits.py` — toolkit listing, bundles
- `python-agent/routers/app_triggers.py` — trigger CRUD
- `python-agent/triggers.py` — TriggerDispatcher (already explored)
- `python-agent/services/composio_client.py` — Composio SDK wrapper
- `python-agent/services/session.py` — SupabaseSession for Composio
- `python-agent/config.py` — composio_client initialization

- [ ] **Step 2: Write docs/architecture/integrations.md**

Sections:
1. **Overview** — Composio SDK provides 1000+ tools, OAuth for 30+ apps, trigger webhooks
2. **How Apps Connect** — step-by-step: user clicks Connect → frontend calls POST /integrations/connect → Composio initiateConnection() → OAuth redirect → callback → DB insert → auto-trigger setup
3. **Entity Management** — one Composio entity per user, stored in composio_entities table
4. **Tool Library** — how tools are fetched via session.tools() and bound to OpenAI agent
5. **Supported Apps** — list of key apps with their capabilities
6. **Key Files** — path → purpose table
7. **Environment Variables** — COMPOSIO_API_KEY, COMPOSIO_WEBHOOK_SECRET
8. **Common Tasks** — "How do I add support for a new app?"

- [ ] **Step 3: Write docs/architecture/triggers.md**

Sections:
1. **Overview** — event-driven automations that run 24/7 in the background
2. **Pipeline Overview** — high-level: Webhook → Dedup → Filter → Debounce → AI Summary → DB → SSE (link to LLD for details)
3. **Trigger Types** — curated (auto-setup on connect) vs dynamic (user-created)
4. **Per-App Trigger Management** — enable/pause/delete via app_triggers router
5. **Subscription Thread** — how server.py starts the Composio trigger listener
6. **Key Files** — path → purpose table
7. **Further Reading** — link to `lld/trigger-pipeline.md` and `TRIGGER_ARCHITECTURE_PLAN.md`
8. **Common Tasks** — "How do I add triggers for a new app?"

- [ ] **Step 4: Commit**

```bash
git add docs/architecture/integrations.md docs/architecture/triggers.md
git commit -m "docs: add integrations and triggers architecture documents"
```

---

### Task 7: Write all 4 LLD documents

**Files:**
- Create: `docs/architecture/lld/trigger-pipeline.md`
- Create: `docs/architecture/lld/agent-chat-execution.md`
- Create: `docs/architecture/lld/oauth-connection.md`
- Create: `docs/architecture/lld/billing-credits.md`

- [ ] **Step 1: Read source files for trigger pipeline**

Read `python-agent/triggers.py` (full file) — extract every method signature, the pipeline flow, dedup logic, noise filtering, debouncing, AI summary prompts.

- [ ] **Step 2: Write docs/architecture/lld/trigger-pipeline.md**

Sections:
1. **Flow Diagram** (text-based):
   ```
   Composio Webhook
       ↓
   handle_event(payload)
       ↓
   _is_duplicate() → Skip if seen in last 5 min
       ↓
   _resolve_verified_user_id() → Map to Supabase user
       ↓
   _is_noise() → Skip if empty/spam
       ↓
   _log_event_to_db() → Insert trigger_events (status: received)
       ↓
   _queue_for_processing() → Buffer + start debounce timer
       ↓
   [30s quiet window for paid / 30min for free]
       ↓
   _process_quiet_window()
       ↓
   _trigger_background_summary() → OpenAI Agent with app-specific prompt
       ↓
   _extract_review_items() → Parse into review_items table
       ↓
   _update_event_statuses(completed)
       ↓
   _persist_notification() → SSE push to frontend
   ```
2. **Functions Reference** — table for EVERY TriggerDispatcher method: Name, File:Line, Purpose, Inputs, Outputs
3. **Deduplication** — _event_fingerprint() logic, _seen_events dict, 5-min TTL
4. **Noise Filtering** — _is_noise() heuristics: empty data, spam patterns
5. **Debouncing** — 30s for paid, 1800s for free, event_buffer, active_timers
6. **AI Summarization** — TRIGGER_PROMPTS dict (20+ app-specific prompts), model used, token costs
7. **Rate Limiting** — free tier: 10 fires/day, paid: unlimited
8. **Error Handling** — what happens at each stage on failure, _dead_letter_event()
9. **Key Decisions** — why debouncing, why per-app prompts, why in-memory dedup

- [ ] **Step 3: Read source files for chat execution**

Read:
- `python-agent/routers/chat.py` — chat_streaming() function
- `python-agent/services/session.py` — tool binding
- `python-agent/middleware.py` — get_current_user()

- [ ] **Step 4: Write docs/architecture/lld/agent-chat-execution.md**

Sections:
1. **Flow Diagram** — User message → JWT auth → credit/quota check → build agent (tools from connected apps) → Runner.run_streamed() → SSE events → token counting → credit debit → conversation save
2. **Functions Reference** — table: Name, File, Purpose, Inputs, Outputs
3. **Tool Selection** — how tools are fetched per user based on connected integrations
4. **Agent Construction** — OpenAI Agents SDK setup, system prompt, tool binding
5. **SSE Streaming** — event types (log, response, error, done), format
6. **Billing Integration** — quota gate (chat_messages_used vs limit), charge_user_atomic()
7. **Conversation Persistence** — how messages and tool_execution_logs are saved
8. **Error Handling** — auth failures, quota exceeded, agent errors, Composio failures

- [ ] **Step 5: Read source files for OAuth**

Read:
- `python-agent/routers/integrations.py` — connect_integration()
- `python-agent/routers/callback.py` — oauth_callback(), auto_setup_triggers()

- [ ] **Step 6: Write docs/architecture/lld/oauth-connection.md**

Sections:
1. **Flow Diagram** — App select → POST /connect → Composio initiateConnection → OAuth redirect → GET /callback → connected_integrations insert → auto_setup_triggers() → UI update
2. **Functions Reference** — table
3. **Composio Entity** — creation/lookup, composio_entities table
4. **OAuth Redirect** — how the popup works, redirect URL handling
5. **Auto-Trigger Setup** — which triggers are created per app, curated list
6. **Disconnection** — POST /disconnect flow
7. **Error Handling** — OAuth failures, Composio errors, duplicate connections

- [ ] **Step 7: Read source files for billing**

Read:
- `python-agent/routers/billing.py` — subscribe, get_balance
- `python-agent/routers/callback.py` — dodo webhook handler (if exists, or check server.py for /webhook/dodo)
- SQL files for charge_user_atomic, credit_user_atomic

- [ ] **Step 8: Write docs/architecture/lld/billing-credits.md**

Sections:
1. **Flow Diagram** — two flows: Usage (quota check → action → increment counter) and Subscription (checkout → DodoPayments → webhook → tier upgrade)
2. **Functions Reference** — table
3. **Tier System** — free/starter/pro limits table (messages, triggers)
4. **Quota Enforcement** — which endpoints check quota, how chat_messages_used is incremented
5. **Subscription Flow** — DodoPayments checkout creation, webhook verification, tier upgrade
6. **Stored Procedures** — charge_user_atomic, credit_user_atomic, increment_trigger_fires, try_increment_trigger_fire
7. **Grace Period** — how grace periods work for expired subscriptions
8. **Error Handling** — failed payments, webhook retries, race conditions

- [ ] **Step 9: Commit all 4 LLD docs**

```bash
git add docs/architecture/lld/
git commit -m "docs: add low-level design documents for 4 critical flows"
```

---

### Task 8: Write API docs — api/README.md + api/chat.md + api/dashboard.md

**Files:**
- Create: `docs/api/README.md`
- Create: `docs/api/chat.md`
- Create: `docs/api/dashboard.md`

- [ ] **Step 1: Read source files**

Read:
- `python-agent/routers/chat.py` — chat_streaming(), get_connected_apps(), get_chat_suggestions()
- `python-agent/routers/dashboard.py` — get_briefing(), get_dashboard_calendar(), get_upcoming_meeting(), get_recent_events(), get_activity_feed(), scan_new_events(), get_app_snapshot()
- `python-agent/middleware.py` — auth format, error responses

- [ ] **Step 2: Write docs/api/README.md**

Sections:
1. **Base URL** — Production: `https://api.calmpilot.app/api`, Local: `http://localhost:8080/api`
2. **Authentication** — Bearer token from Supabase Auth. Header: `Authorization: Bearer <jwt_token>`
3. **Request Format** — JSON body, `Content-Type: application/json`
4. **Response Format** — standard JSON. Show success and error examples.
5. **Rate Limiting** — 100 req/15 min global (slowapi). Per-endpoint limits noted in each doc.
6. **Quota System** — tier-based limits (free: 50 messages, starter: 500, pro: 2000). Endpoints that consume quota are marked.
7. **Error Codes** — table: HTTP Status → Meaning → Example response body (401 Unauthorized, 402 Quota Exceeded, 403 Forbidden, 404 Not Found, 429 Rate Limited, 500 Server Error)
8. **Endpoint Index** — link to each API doc file

- [ ] **Step 3: Write docs/api/chat.md**

For each endpoint, document: Method + Path, Description, Auth Required, Consumes Quota?, Request (params/body with types), Response (format + example JSON), Errors, Rate Limit.

Endpoints:
- `POST /api/chat` — Send message, receive SSE stream. Document SSE event types.
- `GET /api/chat/connections` — List connected apps for current user.
- `GET /api/chat/suggestions/{user_id}` — Get contextual chat suggestions.

- [ ] **Step 4: Write docs/api/dashboard.md**

Endpoints:
- `GET /api/dashboard/briefing` — Generate morning briefing (15-min cache).
- `GET /api/dashboard/calendar` — Get calendar events for dashboard.
- `GET /api/dashboard/upcoming-meeting` — Get next meeting.
- `GET /api/dashboard/recent-events` — Get recent trigger events.
- `GET /api/dashboard/feed` — Get activity feed.
- `POST /api/dashboard/scan` — Manual trigger refresh.
- `GET /api/dashboard/app-snapshot/{app_slug}` — Get per-app activity snapshot.

- [ ] **Step 5: Commit**

```bash
git add docs/api/README.md docs/api/chat.md docs/api/dashboard.md
git commit -m "docs: add API overview, chat, and dashboard endpoint docs"
```

---

### Task 9: Write API docs — api/integrations.md + api/triggers.md

**Files:**
- Create: `docs/api/integrations.md`
- Create: `docs/api/triggers.md`

- [ ] **Step 1: Read source files**

Read:
- `python-agent/routers/integrations.py`
- `python-agent/routers/callback.py`
- `python-agent/routers/toolkits.py`
- `python-agent/routers/app_triggers.py`

- [ ] **Step 2: Write docs/api/integrations.md**

Endpoints:
- `GET /api/integrations/categories` — List integration categories.
- `GET /api/integrations` — List all available integrations.
- `POST /api/integrations/connect` — Initiate OAuth connection.
- `POST /api/integrations/disconnect` — Disconnect an app.
- `GET /api/callback` — OAuth redirect callback (public).
- `GET /api/toolkits` — List connected toolkits (cached 1hr).
- `GET /api/toolkits/bundles` — List curated toolkit bundles.

- [ ] **Step 3: Write docs/api/triggers.md**

Endpoints:
- `GET /api/triggers/trigger-apps` — List apps that support triggers.
- `GET /api/triggers/available` — List available trigger types.
- `GET /api/triggers/config` — Get trigger configuration options.
- `GET /api/triggers` — List user's active triggers.
- `POST /api/triggers/create` — Create a new trigger.
- `POST /api/triggers/enable` — Enable a paused trigger.
- `POST /api/triggers/disable` — Pause a trigger.
- `POST /api/triggers/delete` — Delete a trigger.
- `POST /api/triggers/auto-setup` — Auto-setup triggers for connected apps.
- `POST /api/triggers/re-setup-all` — Re-setup all triggers.
- `GET /api/triggers/events` — List trigger event history.
- `GET /api/triggers/stats` — Get trigger statistics.

- [ ] **Step 4: Commit**

```bash
git add docs/api/integrations.md docs/api/triggers.md
git commit -m "docs: add integrations and triggers API endpoint docs"
```

---

### Task 10: Write API docs — api/billing.md + api/webhooks.md

**Files:**
- Create: `docs/api/billing.md`
- Create: `docs/api/webhooks.md`

- [ ] **Step 1: Read source files**

Read:
- `python-agent/routers/billing.py`
- `python-agent/server.py` — webhook handler section
- `python-agent/routers/callback.py` — dodo webhook if present
- `python-agent/routers/auth.py` — for auth endpoints doc
- `python-agent/routers/review.py` — for review endpoints
- `python-agent/routers/history.py` — for history endpoints
- `python-agent/routers/feedback.py`
- `python-agent/routers/settings.py`
- `python-agent/routers/notifications.py`
- `python-agent/routers/actions.py`
- `python-agent/routers/inbox.py`
- `python-agent/routers/voice.py`
- `python-agent/routers/calendar.py`

- [ ] **Step 2: Write docs/api/billing.md**

Endpoints:
- `POST /api/billing/subscribe` — Create subscription checkout (DodoPayments).
- `GET /api/billing/balance/{user_id}` — Get credit balance and tier info.

Also include the tier comparison table:
| Tier | Messages/month | Triggers/day | Price |
|------|---------------|-------------|-------|
| Free | 50 | 10 | $0 |
| Starter | 500 | Unlimited | $X/mo |
| Pro | 2000 | Unlimited | $X/mo |

- [ ] **Step 3: Write docs/api/webhooks.md**

Endpoints:
- `POST /api/webhooks/composio` — Composio trigger webhook receiver. Document: signature verification (Svix), payload format, what happens after receiving.
- DodoPayments webhook — payment callback. Document: verification, what gets updated.

Also document:
- `POST /api/auth/sync` — Sync user profile.
- `GET /api/auth/me` — Get current user.
- `PATCH /api/auth/model` — Update preferred AI model.
- `DELETE /api/auth/account` — Delete account.
- `GET /api/notifications/{userId}` — SSE notification stream.
- `POST /api/actions/execute` — Execute a pending action.
- `GET /api/inbox` — Get AI-triaged inbox.
- `POST /api/voice` — Voice chat (Whisper → Chat → TTS).
- `GET /api/review` — List review items.
- `POST /api/review/act` — Approve/dismiss/snooze review item.
- `GET /api/history/conversations/{user_id}` — Get chat history.
- `POST /api/feedback` — Submit feedback.
- Calendar endpoints (list, create, suggest times, conflicts).
- Settings endpoints.
- Health check endpoints.

Note: Group these "additional endpoints" in the webhooks.md file under an "Other Endpoints" section, or create a separate `docs/api/other.md` if it gets too long. Use your judgment.

- [ ] **Step 4: Commit**

```bash
git add docs/api/billing.md docs/api/webhooks.md
git commit -m "docs: add billing, webhooks, and remaining API endpoint docs"
```

---

### Task 11: Write user guide — getting-started.md + morning-briefing.md + assistant.md

**Files:**
- Create: `docs/user-guide/getting-started.md`
- Create: `docs/user-guide/morning-briefing.md`
- Create: `docs/user-guide/assistant.md`

- [ ] **Step 1: Read product specs for accuracy**

Read:
- `product/PRODUCT_VISION.md` — what CalmPilot does
- `product/HOME.md` — dashboard/briefing states
- `product/ASSISTANT.md` — chat UI specs
- `product/ONBOARDING.md` — first-time user experience
- `web/src/app/page.tsx` — landing page copy (for consistent messaging)

- [ ] **Step 2: Write docs/user-guide/getting-started.md**

Sections:
1. **What is CalmPilot?** — 1 paragraph, plain language. "CalmPilot is an AI assistant that connects to your work apps (Gmail, Slack, Calendar, etc.) and handles routine tasks for you. Wake up to a morning brief with everything summarized — no more checking 5 apps before coffee."
2. **Sign Up** — step-by-step (Google OAuth)
3. **Connect Your First App** — walk through connecting Gmail (most common)
4. **Your First Morning Briefing** — what to expect, how to read it
5. **Ask the AI a Question** — first chat interaction
6. **Understanding Credits** — brief intro, link to billing.md for details

- [ ] **Step 3: Write docs/user-guide/morning-briefing.md**

Sections:
1. **What is the Morning Briefing?** — AI-generated summary of overnight activity
2. **What It Shows** — greeting, stats, calendar, proposals, activity feed
3. **Where Data Comes From** — connected apps + trigger events from last 24h
4. **Proposals** — what they are, how to approve/reject/snooze
5. **Refreshing** — how to manually refresh, 15-min cache
6. **Tips** — connect more apps for richer briefings, check daily for best results

- [ ] **Step 4: Write docs/user-guide/assistant.md**

Sections:
1. **What Can the AI Do?** — list of capabilities (send emails, check calendar, manage tasks, etc.)
2. **Example Prompts** — 10 real examples: "Draft a reply to John's email", "What's on my calendar today?", "Create a meeting with Sarah at 2pm", etc.
3. **Uploading Files** — supported types (.txt, .md, .json, .csv), drag-and-drop
4. **Activity Log** — what the tool execution panel shows
5. **Credit Usage** — each message costs credits, more complex actions cost more
6. **Tips** — be specific, mention which app, ask follow-up questions

- [ ] **Step 5: Commit**

```bash
git add docs/user-guide/getting-started.md docs/user-guide/morning-briefing.md docs/user-guide/assistant.md
git commit -m "docs: add user guide for getting started, briefings, and assistant"
```

---

### Task 12: Write user guide — integrations.md + triggers.md + billing.md + faq.md

**Files:**
- Create: `docs/user-guide/integrations.md`
- Create: `docs/user-guide/triggers.md`
- Create: `docs/user-guide/billing.md`
- Create: `docs/user-guide/faq.md`

- [ ] **Step 1: Read product specs**

Read:
- `product/INTEGRATIONS.md` — app connection grid
- `product/TRIGGERS.md` — trigger management
- `product/USAGE.md` — credit/billing UX
- `PRICING_STRATEGY.md` — pricing details (link to it, don't duplicate)

- [ ] **Step 2: Write docs/user-guide/integrations.md**

Sections:
1. **Supported Apps** — Gmail, Google Calendar, Slack, GitHub, Linear, Notion, Discord, Stripe, Jira, Trello, etc. (1000+ via Composio)
2. **How to Connect** — step-by-step with expected outcome
3. **What Happens on Connect** — triggers are auto-created, tools become available to AI
4. **How to Disconnect** — step-by-step
5. **Troubleshooting** — "Connection failed" (re-auth), "App not listed" (request via feedback)

- [ ] **Step 3: Write docs/user-guide/triggers.md**

Sections:
1. **What Are Triggers?** — plain language: "Triggers watch your connected apps 24/7 and notify you when something important happens"
2. **How They Work** — event → AI decides importance → summary in your feed
3. **Viewing Triggers** — where to find them in the dashboard
4. **Managing Triggers** — pause, enable, delete
5. **Activity Feed** — where trigger events appear, status indicators
6. **Troubleshooting** — "Not receiving events" (check if trigger is enabled, app is connected)

- [ ] **Step 4: Write docs/user-guide/billing.md**

Sections:
1. **How Credits Work** — tier-based: free (50 messages), starter (500), pro (2000)
2. **What Uses Credits** — AI chat messages, trigger summaries
3. **Checking Your Balance** — where to find it in the dashboard
4. **Upgrading Your Plan** — starter vs pro comparison, how to subscribe
5. **Transaction History** — where to view past charges
6. **Free Tier** — what you get for free, when you'll need to upgrade
7. **Further Details** — link to PRICING_STRATEGY.md

- [ ] **Step 5: Write docs/user-guide/faq.md**

Questions to answer (read source code/product docs for accurate answers):
1. **Is my data safe?** — Supabase RLS, JWT auth, no data sold, encrypted in transit
2. **What AI model is used?** — GPT-4o for reasoning, GPT-4o-mini for summaries
3. **Can I undo an action the AI took?** — Review queue lets you approve before actions send
4. **How many apps can I connect?** — Unlimited on all tiers
5. **What happens if I run out of credits?** — AI chat stops, triggers continue on paid plans
6. **Can I export my data?** — Not yet (planned)
7. **How do I delete my account?** — Settings → Delete Account
8. **Who built CalmPilot?** — Nitish, final-year student at CBIT, Hyderabad
9. **Is there a mobile app?** — Web-only for now, PWA support planned
10. **How do I report a bug?** — Feedback widget in the app or email

- [ ] **Step 6: Commit**

```bash
git add docs/user-guide/
git commit -m "docs: add user guide for integrations, triggers, billing, and FAQ"
```

---

### Task 13: Add inline code documentation — Python backend

**Files:**
- Modify: `python-agent/routers/chat.py` — add docstrings to endpoint functions
- Modify: `python-agent/routers/integrations.py` — add docstrings
- Modify: `python-agent/routers/billing.py` — add docstrings
- Modify: `python-agent/routers/dashboard.py` — add docstrings
- Modify: `python-agent/routers/app_triggers.py` — add docstrings
- Modify: `python-agent/triggers.py` — add docstrings to TriggerDispatcher methods
- Modify: `python-agent/middleware.py` — add docstrings
- Modify: `python-agent/config.py` — add docstrings to NotificationManager

- [ ] **Step 1: Read each file and add Google-style docstrings**

For EVERY router endpoint function and every TriggerDispatcher method, add a docstring like:

```python
async def chat_streaming(request: ChatRequest, user=Depends(get_current_user)):
    """Send a message to the AI agent and receive a streaming SSE response.

    Args:
        request: Chat request with message, conversation_id, and optional file attachments.
        user: Authenticated user from JWT token.

    Returns:
        StreamingResponse with SSE events (log, response, error, done).

    Raises:
        HTTPException(402): If user has exceeded their message quota.
        HTTPException(429): If rate limited.
    """
```

Do NOT change any logic — only add docstrings to existing functions.

Focus on:
- All router endpoint functions (highest priority)
- TriggerDispatcher class and all its methods
- NotificationManager class and its methods
- get_current_user() in middleware.py
- Key service functions (composio_client, session)

- [ ] **Step 2: Verify no logic was changed**

Run: `git diff --stat` — confirm only docstring additions, no logic changes.

- [ ] **Step 3: Commit**

```bash
git add python-agent/
git commit -m "docs: add Google-style docstrings to backend endpoint and core functions"
```

---

### Task 14: Add inline code documentation — TypeScript frontend

**Files:**
- Modify: `web/src/context/AuthContext.tsx` — add JSDoc
- Modify: `web/src/context/useBilling.tsx` — add JSDoc
- Modify: `web/src/context/ThemeContext.tsx` — add JSDoc
- Modify: `web/src/context/ToastContext.tsx` — add JSDoc
- Modify: `web/src/context/LogoContext.tsx` — add JSDoc
- Modify: `web/src/lib/api.ts` — add JSDoc
- Modify: `web/src/lib/types.ts` — add JSDoc to interfaces
- Modify: `web/src/lib/analytics.ts` — add JSDoc

- [ ] **Step 1: Read each file and add JSDoc comments**

For every exported function, context provider, and key interface, add JSDoc:

```typescript
/**
 * Provides authentication state and methods throughout the app.
 *
 * @remarks
 * Uses Supabase Auth with Google OAuth. Syncs user metadata with the backend
 * on login via syncWithBackend().
 *
 * @example
 * ```tsx
 * const { user, signInWithGoogle, signOut } = useAuth();
 * ```
 */
```

Focus on:
- All 5 context providers (exported hooks and provider components)
- api.ts (all HTTP methods)
- types.ts (all exported interfaces)
- analytics.ts (trackEvent)

Do NOT change any logic — only add JSDoc comments.

- [ ] **Step 2: Verify no logic was changed**

Run: `git diff --stat` — confirm only JSDoc additions.

- [ ] **Step 3: Commit**

```bash
git add web/src/
git commit -m "docs: add JSDoc comments to frontend context providers and utilities"
```
