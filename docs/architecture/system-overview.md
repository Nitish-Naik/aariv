# CalmPilot — System Overview

> **Reading time:** ~15 minutes. This is the first document a new developer should read. It gives a mental model of the entire system before you dive into any specific component.

---

## a. Overview

CalmPilot (also referred to as Aariv in parts of the codebase) is an AI-powered work assistant SaaS that connects to 30+ professional apps via Composio, monitors them 24/7 through real-time trigger subscriptions, and delivers proactive morning briefings and notifications to users. It provides an AI chat interface backed by OpenAI Agents where users can give natural-language instructions that CalmPilot executes autonomously across their connected tools. Built by Nitish at CBIT, Hyderabad, CalmPilot acts as a B2B digital proxy — handling repetitive work tasks so users do not have to.

---

## b. Architecture Diagram

```
User Browser
    |
    v
Next.js Frontend (Vercel — calmpilot.app)
    |
    | REST API + Server-Sent Events (SSE)
    v
FastAPI Backend (Cloud Run / Render — python-agent)
    |           |               |
    v           v               v
Supabase     OpenAI          Composio SDK
(Postgres    Agents API      (WebSocket subscription
 + Auth)     (GPT-4o)         to trigger events)
                                    |
                                    v
                              30+ App APIs
                         (Gmail, Slack, GitHub,
                          Google Calendar, Notion,
                          Linear, Discord, ...)
                                    |
                                    v
                          DodoPayments (billing)
                          Resend (transactional email)
```

**Key connection details:**
- Frontend talks to backend over HTTPS REST + SSE (streaming chat responses).
- Backend connects **outbound** to Composio via WebSocket/SSE subscription — this means triggers work in local development without a public URL.
- CORS allowed origins (set via `ALLOWED_ORIGINS` env): `localhost:3000`, `localhost:8081`, `aariv.vercel.app`, `calmpilot.app`, `www.calmpilot.app`.

---

## c. Service Map

| Service | Purpose | Where It Runs | Key Tech |
|---------|---------|---------------|----------|
| **Frontend** | UI — dashboard, chat, integrations, marketing pages | Vercel (auto-deploy from `main`) | Next.js 14, React 18, TypeScript, Tailwind, Zustand, Framer Motion |
| **Backend** | AI agent, trigger processing, API, webhooks | Google Cloud Run / Render | FastAPI, Uvicorn, Python 3.11+, slowapi (rate limiting) |
| **Database** | User data, conversation history, trigger events, credits | Supabase (managed Postgres) | Supabase Postgres + Supabase Auth (JWT) |
| **AI** | Natural-language reasoning, tool selection, response generation | OpenAI API (external) | OpenAI Agents SDK (`gpt-4o`), `composio_openai_agents` |
| **Integrations** | OAuth connections, tool execution, trigger subscriptions | Composio API (external) | Composio Python SDK, 30+ app connectors |
| **Payments** | Subscription management (Starter / Pro tiers), billing webhooks | DodoPayments (external) | `dodopayments` Python SDK |
| **Email** | Welcome emails, morning briefings, re-engagement campaigns | Resend API (external) | Resend HTTP API, called from `services/email.py` |

---

## d. Request Flow

**Example: "User asks the AI to send an email"**

1. User types a message in the chat UI (`/dashboard/assistant`).
2. Frontend sends `POST /api/chat` with the JWT from Supabase Auth in the `Authorization: Bearer` header.
3. Backend middleware (`middleware.py`) validates the JWT against Supabase; the request is rejected if invalid.
4. Backend checks the user's credit/message quota via `check_and_increment_usage()` in `routers/billing.py`; 429 if over limit.
5. Backend builds an OpenAI Agent (`routers/chat.py`) with Composio tools scoped to the user's connected apps (Gmail in this case).
6. The agent reasons about the request and decides to call the `GMAIL_SEND_EMAIL` Composio tool.
7. Composio executes the tool against the Gmail API using the user's stored OAuth credentials.
8. The backend streams the agent's response tokens back to the frontend via **Server-Sent Events (SSE)**.
9. Frontend renders the streamed text in real-time inside the chat UI.
10. On completion, the backend debits the usage counter and saves the conversation turn to Supabase.

**Trigger flow (proactive / background):**

1. On startup, the backend subscribes to Composio's WebSocket feed (`_start_trigger_subscription` in `server.py`).
2. When a user's connected app fires an event (e.g., new Slack message), Composio pushes the event over the subscription.
3. `triggers/dispatcher.py` routes the event to the correct handler based on `trigger_slug`.
4. The handler generates an AI summary and calls `notification_manager.push(user_id, event)`.
5. If the user has an active SSE connection (`/api/notifications`), the summary is delivered immediately; otherwise it is cached in Supabase (`trigger_events` table) and delivered on next reconnect.

---

## e. Repository Structure

```
aariv/
├── web/                    # Next.js frontend (App Router, TypeScript, Tailwind)
│   ├── src/app/            # Page routes and layouts
│   ├── src/components/     # Shared UI components
│   └── next.config.js      # Env vars, CSP headers, image config
│
├── python-agent/           # FastAPI backend — the core of the system
│   ├── server.py           # App factory, CORS, router registration, lifespan
│   ├── config.py           # Logging, IS_CLOUD_RUN flag, NotificationManager, Composio init
│   ├── triggers/           # Trigger dispatcher and per-app handlers
│   ├── routers/            # One file per API domain (chat, billing, integrations, ...)
│   ├── services/           # Shared service clients (supabase_client, composio_client, email, briefing_scheduler)
│   ├── middleware.py        # JWT auth, structured logging middleware
│   ├── Dockerfile          # Container image for Cloud Run / Render
│   ├── cloudbuild.yaml     # GCP Cloud Build pipeline
│   └── render.yaml         # Render.com deploy config
│
├── composio/               # Composio SDK monorepo (reference / internal tooling)
│
├── product/                # Feature specs per app section (HOME.md, ASSISTANT.md, ...)
├── marketing/              # Marketing content, daily posts, image assets
├── docs/                   # Architecture and developer documentation (you are here)
│   └── architecture/
│       └── system-overview.md
│
├── PROJECT_CONTEXT.md      # Practical onboarding guide — folder roles, dev commands, known inconsistencies
├── TRIGGER_ARCHITECTURE_PLAN.md  # Reliability/scaling roadmap for the trigger pipeline
├── REMAINING_ITEMS.md      # Implementation gaps and bug tracker
└── docker-compose.yml      # Single-service compose config (legacy Node shape — see PROJECT_CONTEXT.md §8)
```

See `PROJECT_CONTEXT.md` for deeper folder-by-folder descriptions and a known-inconsistencies list.

---

## f. Local Development Setup

### Frontend

```bash
cd web
npm install
npm run dev          # Runs on http://localhost:3000
```

Create `web/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key from Supabase dashboard>
```

### Backend

```bash
cd python-agent
pip install -r requirements.txt
uvicorn server:app --reload --port 8080
# or use the dev helper:
python run_dev.py
```

Create `python-agent/.env`:
```
OPENAI_API_KEY=sk-...
COMPOSIO_API_KEY=...
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_SERVICE_KEY=<service role key>
RESEND_API_KEY=re_...
SKIP_WEBHOOK_REGISTRATION=true     # skip Composio webhook reg in local dev
```

The backend uses Composio's outbound subscription (WebSocket/SSE) by default, so you do **not** need a public URL or ngrok for trigger events to work locally.

---

## g. Environment Variables

### Frontend (`web/.env.local`)

| Variable | Purpose | Required | Example |
|----------|---------|----------|---------|
| `NEXT_PUBLIC_API_URL` | Backend base URL | Required | `http://localhost:8080` / `https://api.calmpilot.app` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Required | `https://abcdef.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public anon key (safe to expose) | Required | `eyJ...` |

### Backend (`python-agent/.env`)

**Core / always required:**

| Variable | Purpose | Required | Example |
|----------|---------|----------|---------|
| `OPENAI_API_KEY` | OpenAI API access for agent reasoning | Required | `sk-proj-...` |
| `COMPOSIO_API_KEY` | Composio SDK auth for tool execution and triggers | Required | `...` |
| `SUPABASE_URL` | Supabase project URL | Required | `https://abcdef.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Supabase service role key (backend-only, never expose) | Required | `eyJ...` |

**Required in production (validated on Cloud Run startup):**

| Variable | Purpose | Required | Example |
|----------|---------|----------|---------|
| `WEB_APP_URL` | Frontend URL for email links and OAuth redirects | Prod required | `https://calmpilot.app` |
| `API_BASE_URL` | Backend public URL for Composio webhook registration | Prod required | `https://api.calmpilot.app` |
| `COMPOSIO_WEBHOOK_SECRET` | HMAC secret to verify Composio webhook signatures | Prod required | `whsec_...` |
| `RESEND_API_KEY` | Resend API key for transactional email | Prod required | `re_...` |

**Payments (DodoPayments):**

| Variable | Purpose | Required | Example |
|----------|---------|----------|---------|
| `DODO_PAYMENTS_API_KEY` | DodoPayments API key | Required for billing | `...` |
| `DODO_PAYMENTS_ENVIRONMENT` | `test_mode` or `live_mode` | Optional | `test_mode` |
| `DODO_STARTER_PRODUCT_ID` | Product ID for Starter plan | Required for billing | `prd_...` |
| `DODO_PRO_PRODUCT_ID` | Product ID for Pro plan | Required for billing | `prd_...` |

**Optional / tuning:**

| Variable | Purpose | Required | Example |
|----------|---------|----------|---------|
| `ALLOWED_ORIGINS` | Comma-separated CORS origins | Optional | `https://calmpilot.app,https://www.calmpilot.app` |
| `SUPABASE_KEY` | Supabase anon key (alternative name) | Optional | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Alternative name for service role key | Optional | `eyJ...` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID (if using direct Google OAuth) | Optional | `...apps.googleusercontent.com` |
| `SKIP_WEBHOOK_REGISTRATION` | Set to `true` to skip Composio webhook reg in dev | Optional | `true` |
| `LOG_LEVEL` | Logging verbosity | Optional | `INFO` |
| `ENABLE_FILE_LOGGING` | Write logs to file in addition to stdout | Optional | `false` |
| `COMPOSIO_DISABLE_TELEMETRY` | Disable Composio SDK telemetry (default: `true`) | Optional | `true` |
| `PORT` | Port for the server process | Optional | `8080` |

---

## h. Deployment

| Surface | Platform | Trigger | Notes |
|---------|---------|---------|-------|
| **Frontend** | Vercel | Auto-deploy on push to `main` | Domain: `calmpilot.app`, `aariv.vercel.app` |
| **Backend** | Google Cloud Run (primary) or Render | Manual deploy or Cloud Build (`cloudbuild.yaml`) / `render.yaml` | Dockerfile at `python-agent/Dockerfile` |
| **Database** | Supabase (managed) | N/A — always on | Postgres + Auth + Row-Level Security |

The `docker-compose.yml` at the repo root references a legacy Node backend shape and should be treated as a reference only — see `PROJECT_CONTEXT.md §8` for details.

---

## i. Further Reading

| Document | What it covers |
|----------|---------------|
| [`PROJECT_CONTEXT.md`](../../PROJECT_CONTEXT.md) | Practical onboarding: folder roles, dev commands, known repo inconsistencies, contributor workflow |
| [`TRIGGER_ARCHITECTURE_PLAN.md`](../../TRIGGER_ARCHITECTURE_PLAN.md) | Reliability and scaling roadmap for the trigger/event pipeline |
| [`REMAINING_ITEMS.md`](../../REMAINING_ITEMS.md) | Current implementation gaps, bugs, and status tracker |
| [`product/`](../../product/) | Feature-level specs for each product surface (Home, Assistant, Integrations, etc.) |
| [`docs/architecture/`](./) | Additional architecture documents (add new ones here) |

---

*Last updated: 2026-03-30*
