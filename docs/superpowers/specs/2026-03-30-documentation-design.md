# Design Spec: CalmPilot Documentation

**Date:** 2026-03-30
**Status:** Draft
**Author:** Claude (Documentation brainstorm)

---

## 1. Overview

Comprehensive documentation for CalmPilot/Aariv covering developer architecture, API reference, and user guide. All docs live in `docs/` as markdown files, browsable on GitHub. No external tooling or build step required.

### Audience

- **Primary:** Future co-founder or developer joining the project with zero context
- **Secondary:** Nitish himself — reference for how things work months from now

### Goals

- A new developer can understand the full system in 1-2 hours
- All API endpoints are documented with request/response examples
- End-users have a help resource for every feature
- Complex flows have function-level documentation (LLD)
- Key functions have inline docstrings/JSDoc

---

## 2. File Structure

```
docs/
  README.md                   # NEW — Documentation index / table of contents
  architecture/
    system-overview.md
    backend.md
    frontend.md
    database.md
    integrations.md
    triggers.md
    lld/
      trigger-pipeline.md
      agent-chat-execution.md
      oauth-connection.md
      billing-credits.md
  api/
    README.md
    chat.md
    integrations.md
    triggers.md
    dashboard.md
    billing.md
    webhooks.md
  user-guide/
    getting-started.md
    morning-briefing.md
    assistant.md
    integrations.md
    triggers.md
    billing.md
    faq.md
```

**Total: 21 markdown files + inline code documentation**

---

## 2.1 Documentation Index — `docs/README.md`

A top-level table of contents that serves as the entry point when anyone opens the `docs/` folder on GitHub. Links to every doc section with a one-line description of what each covers.

Structure:
- **Quick Links** — "New here? Start with system-overview.md"
- **Architecture** — links to all 6 architecture docs + 4 LLD docs
- **API Reference** — links to all 7 API docs
- **User Guide** — links to all 7 user guide docs
- **Existing Resources** — links to docs that already exist elsewhere in the repo (see Section 2.2)

---

## 2.2 Existing Docs Consolidation

Several useful docs already exist scattered across the repo. Rather than duplicating or moving them (which would break existing workflows), the new docs will **reference and link to them** where relevant, and **absorb key content** where it makes sense.

| Existing file | Location | Action |
|---------------|----------|--------|
| `PROJECT_CONTEXT.md` | Root | **Link from** `system-overview.md` as the practical onboarding guide. Absorb the folder structure map into `system-overview.md`, link back for contributor workflow details. |
| `PRODUCTION_README.md` | `python-agent/` | **Link from** `backend.md` for deployment/production config. Do not duplicate — it's already excellent. |
| `TRIGGER_ARCHITECTURE_PLAN.md` | Root | **Absorb into** `architecture/triggers.md` and `lld/trigger-pipeline.md`. The architecture plan content becomes part of the formal docs. Link from those docs to the original for historical context. |
| `PRICING_STRATEGY.md` | Root | **Link from** `api/billing.md` and `user-guide/billing.md` for pricing model details. Do not duplicate. |
| `REMAINING_ITEMS.md` | Root | **Link from** `docs/README.md` under a "Project Status" section. This is a living doc, not worth absorbing. |
| `product/*.md` | `product/` | **Link from** relevant architecture and user-guide docs. These are product specs — the new docs explain how the specs were implemented. |
| `docs/remained_implementation.md` | `docs/` | **Link from** `docs/README.md` under "Project Status". Pre-launch checklist stays as-is. |
| `docs/smart-briefing-system/` | `docs/` | **Link from** `architecture/backend.md` and `lld/` where briefing logic is covered. |
| `README_DEPENDENCIES.md` | `python-agent/` | **Link from** `backend.md` for dependency management. |

**Principle:** One source of truth. New docs are the primary reference for "how things work." Existing docs are linked when they provide depth, context, or historical decisions that don't belong in the architecture docs.

---

## 3. Dev Docs — `docs/architecture/`

### 3.1 system-overview.md

**Covers:**
- High-level architecture: how frontend (Next.js on Vercel), backend (FastAPI on cloud), database (Supabase/PostgreSQL), and Composio SDK connect
- Text-based architecture diagram showing request flow
- Deployment topology: Vercel for frontend, cloud host for Python agent, Supabase managed DB
- Key external services: OpenAI API, Composio, DodoPayments, Resend
- Environment overview: which env vars each service needs
- How to run the full stack locally

**Template:**
- Overview (2-3 sentences)
- Architecture diagram (text-based)
- Service map (table: service → purpose → where it runs)
- Request flow (user action → frontend → backend → external service → response)
- Local development setup
- Environment variables summary

### 3.2 backend.md

**Covers:**
- FastAPI app structure (`python-agent/`)
- Server startup flow (`server.py`: lifespan, CORS, routers, trigger listener)
- All routers and their responsibilities (chat, integrations, triggers, billing, dashboard, auth, feedback, app_triggers, health)
- Middleware: JWT validation, rate limiting (slowapi), CORS
- OpenAI Agents SDK integration: how the agent is constructed, tool binding, streaming
- Composio client setup and entity management
- NotificationManager: in-memory SSE queues for real-time push
- Error handling patterns
- How to add a new router

**Template:**
- Overview
- Architecture (directory structure)
- Key Files (path → purpose table)
- How It Works (startup flow, request lifecycle)
- Environment Variables
- Common Tasks ("How do I add a new endpoint?")

### 3.3 frontend.md

**Covers:**
- Next.js 14 App Router structure (`web/src/app/`)
- Page hierarchy: landing, login, pricing, dashboard (with sub-pages)
- Component organization (`web/src/components/`)
- Context providers: AuthContext, BillingContext, LogoContext
- API client (`web/src/lib/`) — how frontend talks to backend
- SSE streaming: how assistant chat receives real-time responses
- Tailwind CSS + shadcn/ui component patterns
- Vercel deployment: analytics, speed insights
- How to add a new dashboard page

**Template:**
- Overview
- Architecture (directory structure)
- Key Files (path → purpose table)
- How It Works (routing, auth flow, SSE streaming)
- Environment Variables
- Common Tasks ("How do I add a new page?")

### 3.4 database.md

**Covers:**
- Supabase project setup
- All tables with columns, types, and descriptions:
  - profiles, user_credits, billing_transactions, conversations, trigger_events, review_items, connected_integrations, briefings
- Table relationships (foreign keys, user_id linkage)
- Row-Level Security (RLS) policies
- Key queries used by the backend
- Migration patterns
- How to add a new table

**Template:**
- Overview
- Schema diagram (text-based)
- Tables (one section per table: columns, types, description, RLS)
- Relationships
- Key Queries
- Common Tasks ("How do I add a new table?")

### 3.5 integrations.md

**Covers:**
- Composio SDK: what it provides (1000+ tools, OAuth, triggers)
- How apps connect: user clicks → Composio OAuth popup → callback → connected_integrations table
- Entity management: one Composio entity per Supabase user
- Tool library: how tools are fetched and bound to the OpenAI agent
- Auto-trigger setup: what happens after an app connects
- How to add support for a new app

**Template:**
- Overview
- Architecture (Composio ↔ CalmPilot flow)
- Key Files
- How It Works (connection flow step-by-step)
- Environment Variables
- Common Tasks ("How do I add a new integration?")

### 3.6 triggers.md

**Covers:**
- What triggers are (event-driven automations)
- Trigger pipeline: Composio webhook → TriggerDispatcher
- Curated vs dynamic trigger setup
- Per-app trigger management (enable/pause/delete)
- Overview of pipeline stages (detailed in LLD)
- SSE push to frontend
- How to add a new trigger type

**Template:**
- Overview
- Architecture (pipeline stages)
- Key Files
- How It Works (high-level flow)
- Environment Variables
- Common Tasks ("How do I add a trigger for a new app?")

---

## 4. Low-Level Design — `docs/architecture/lld/`

### 4.1 trigger-pipeline.md

**Flow:** Composio webhook → event received → deduplication (5-min cache) → noise filtering (heuristic L1) → debouncing (30s quiet window) → AI summarization (GPT-4o) → DB logging (trigger_events) → SSE push to frontend

**Documents:**
- Text-based flow diagram
- Each function involved: name, file path, purpose, inputs, outputs
- Deduplication logic: how the in-memory cache works, TTL
- Noise filtering: what gets filtered and why
- Debouncing: how the 30s quiet window works
- AI summary: prompt template, model used, token costs
- Error handling: what happens when each stage fails
- Key decisions: why this architecture was chosen

### 4.2 agent-chat-execution.md

**Flow:** User message → JWT auth → credit check → build OpenAI agent (tools from connected apps) → agent execution (reasoning + tool calls) → SSE streaming response → token counting → credit debit → conversation save

**Documents:**
- Text-based flow diagram
- Each function involved with file paths
- How tools are selected based on connected integrations
- OpenAI Agents SDK: Runner.run_streamed() usage
- SSE event types and format
- Token counting and billing logic
- Conversation history persistence
- Error handling at each step

### 4.3 oauth-connection.md

**Flow:** User selects app → frontend opens connection popup → Composio initiateConnection() → OAuth redirect → user authorizes → callback to backend → connected_integrations insert → auto-trigger setup → UI update

**Documents:**
- Text-based flow diagram
- Each function involved with file paths
- Composio entity creation/lookup
- OAuth redirect handling
- How connected_integrations table is updated
- Auto-trigger setup: which triggers are created per app
- Disconnection flow
- Error handling

### 4.4 billing-credits.md

**Flow:** User action → credit balance check → insufficient? prompt topup : proceed → LLM call → token count (input + output) → calculate cost (4x markup) → debit user_credits → log billing_transaction

**Topup flow:** User clicks topup → DodoPayments checkout → webhook callback → credit user_credits → log transaction

**Documents:**
- Text-based flow diagram
- Each function involved with file paths
- Credit calculation formula: tokens → cost → 4x markup
- DodoPayments integration: checkout creation, webhook verification
- Balance checking middleware
- Transaction logging
- Error handling (failed payments, webhook retries)

---

## 5. Inline Code Documentation

### 5.1 Python (Backend)

Add docstrings to:
- All router endpoint functions (description, params, returns, raises)
- TriggerDispatcher class and its methods
- Composio client wrapper functions
- Billing calculation functions
- Auth/middleware functions

Format: Google-style docstrings
```python
def process_trigger_event(event: dict, user_id: str) -> dict:
    """Process an incoming trigger event through the pipeline.

    Args:
        event: Raw event payload from Composio webhook.
        user_id: The Supabase user ID who owns this trigger.

    Returns:
        Processed event with AI summary and metadata.

    Raises:
        InsufficientCreditsError: If user has no credits for AI summary.
    """
```

### 5.2 TypeScript (Frontend)

Add JSDoc to:
- Context providers (AuthContext, BillingContext)
- API client functions
- Key component props interfaces
- Utility functions

Format: JSDoc with TypeScript types
```typescript
/**
 * Initiates an SSE connection to the chat endpoint and streams responses.
 * @param message - The user's chat message
 * @param onEvent - Callback fired for each SSE event (log, response, error)
 * @returns Cleanup function to close the SSE connection
 */
function streamChat(message: string, onEvent: (event: ChatEvent) => void): () => void
```

---

## 6. API Docs — `docs/api/`

### 6.1 README.md

**Covers:**
- Base URL (production + local dev)
- Authentication: JWT bearer token from Supabase Auth
- Request format: JSON body, Content-Type headers
- Response format: standard success/error envelope
- Rate limiting: 100 req/15 min global, 20 req/min for chat
- Credit system: how actions cost credits
- Error codes: standard error response format with codes

### 6.2 chat.md

**Endpoints:**
- `POST /chat` — Send message to AI agent, receive SSE stream

**Documents:**
- Request body (message, conversation_id, file attachments)
- SSE event types (log, response, error, done)
- Example request and response
- Credit costs per message
- Rate limit: 20/min
- Error cases

### 6.3 integrations.md

**Endpoints:**
- `GET /integrations` — List all available apps
- `GET /integrations/connected` — List user's connected apps
- `POST /integrations/connect` — Initiate OAuth connection
- `DELETE /integrations/:app_id/disconnect` — Disconnect an app

**Documents per endpoint:**
- Request params/body
- Response format with example JSON
- OAuth flow explanation
- Error cases

### 6.4 triggers.md

**Endpoints:**
- `GET /triggers` — List user's triggers (grouped by app)
- `POST /triggers` — Create a new trigger
- `PUT /triggers/:id` — Update trigger (enable/pause)
- `DELETE /triggers/:id` — Delete a trigger
- `GET /triggers/events` — List trigger events

**Documents per endpoint:**
- Request/response with examples
- Trigger states (active, paused)
- Event status types (received, processing, completed, failed)
- Error cases

### 6.5 dashboard.md

**Endpoints:**
- `GET /dashboard/briefing` — Generate morning briefing

**Documents:**
- Response format (greeting, stats, proposals, calendar, activity)
- Caching: 15-minute cache, when it refreshes
- What data sources it pulls from
- Error cases

### 6.6 billing.md

**Endpoints:**
- `GET /billing/balance` — Get current credit balance
- `POST /billing/topup` — Create topup checkout session
- `GET /billing/transactions` — List billing history

**Documents per endpoint:**
- Request/response with examples
- Topup amounts and credit conversion
- Transaction types (topup, charge)
- DodoPayments redirect flow
- Error cases

### 6.7 webhooks.md

**Endpoints:**
- `POST /webhook` — Composio trigger webhook receiver
- `POST /webhook/dodo` — DodoPayments payment callback

**Documents:**
- Webhook payload formats
- Verification/security (how webhooks are authenticated)
- What happens after receiving each webhook type
- Retry behavior
- Error cases

---

## 7. User Guide — `docs/user-guide/`

### 7.1 getting-started.md

- What is CalmPilot (1 paragraph, plain language)
- Sign up and first login
- Connecting your first app (step-by-step)
- Your first morning briefing
- Asking the AI assistant a question
- Understanding credits

### 7.2 morning-briefing.md

- What the briefing shows you
- Where data comes from (connected apps + triggers)
- How to refresh
- Proposal items: what they are, how to approve/reject
- Tips for getting the most out of briefings

### 7.3 assistant.md

- What the AI assistant can do
- Example prompts for common tasks
- How to upload files
- Understanding the activity log (tool calls)
- Credit usage per message
- Tips for better responses

### 7.4 integrations.md

- Supported apps overview
- How to connect an app
- How to disconnect
- What happens when you connect (auto-triggers)
- Troubleshooting failed connections

### 7.5 triggers.md

- What triggers are (plain language)
- How they work (events → AI summary → notification)
- Viewing your triggers
- Pausing/enabling/deleting
- Understanding the activity feed
- Troubleshooting missed events

### 7.6 billing.md

- How credits work
- What costs credits (AI chat, trigger summaries)
- Checking your balance
- Topping up credits
- Transaction history
- Free signup bonus

### 7.7 faq.md

- Is my data safe?
- What AI model is used?
- Can I undo an action the AI took?
- How many apps can I connect?
- What happens if I run out of credits?
- Can I export my data?
- How do I delete my account?
- Who built CalmPilot?

---

## 8. What This Does NOT Include

- Auto-generated Swagger/OpenAPI (can be added later via FastAPI's built-in `/docs`)
- Versioned docs or changelog
- Contribution guide (add when open-sourcing)
- Runbooks/playbooks (add when you have on-call)
- Architecture Decision Records (add at 5+ devs)

---

## 9. Implementation Order

1. **Dev docs** — `docs/architecture/` (6 files) + `docs/architecture/lld/` (4 files)
2. **Inline code docs** — docstrings in Python, JSDoc in TypeScript
3. **API docs** — `docs/api/` (7 files)
4. **User guide** — `docs/user-guide/` (7 files)
