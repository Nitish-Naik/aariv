# CLAUDE.md — CalmPilot / Aariv

> For full documentation, see [docs/README.md](docs/README.md).
> For contributor onboarding, see [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md).

## Project Overview

CalmPilot (also called Aariv in parts of the codebase) is an AI work assistant SaaS. It connects to 30+ professional apps via Composio, monitors them 24/7 via real-time triggers, and delivers proactive morning briefings + an AI chat interface backed by OpenAI Agents SDK.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS, shadcn/ui, Zustand |
| Backend | FastAPI, Python, OpenAI Agents SDK, Composio SDK |
| Database / Auth | Supabase (Postgres + RLS) |
| Billing | DodoPayments |
| Notifications | Resend (transactional email) |
| Deployment | Vercel (frontend), Cloud Run / Render (backend) |

## Project Structure

```
web/            Next.js frontend (deployed to Vercel)
python-agent/   FastAPI backend — triggers, AI chat, webhooks
composio/       Composio SDK monorepo (reference / integration surface)
docs/           Full documentation (see docs/README.md)
product/        Feature specs per app section
marketing/      Marketing content + daily post plans
.claude/skills/ Custom Claude Code skills (see below)
```

## Development Setup

**Frontend**
```bash
cd web && npm install && npm run dev
# Runs on http://localhost:3000
```

**Backend**
```bash
cd python-agent && pip install -r requirements.txt
uvicorn server:app --reload --port 8080
# or: python run_dev.py
```

**Required env vars** — copy `.env.example` in each folder:
- Backend: `OPENAI_API_KEY`, `COMPOSIO_API_KEY`, `SUPABASE_URL`, `SUPABASE_KEY`
- Frontend: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Custom Skills

Invoke with the Skill tool or `/skill-name` in chat.

| Skill | What it does |
|-------|-------------|
| `/marketing-daily` | Generate a daily marketing plan with ready-to-post content for X, LinkedIn, Reddit |
| `/generate-docs` | Regenerate CalmPilot docs by reading current source code |
| `/changelog` | Generate a changelog from recent git commits for build-in-public posts |
| `/weekly-review` | Analyze the week's marketing posts and generate next week's strategy |

## Coding Conventions

**Frontend (`web/`)**
- TypeScript everywhere — no `any` unless unavoidable
- Tailwind for all styling; use shadcn/ui components before building custom ones
- Next.js App Router (`web/src/app/`); server components by default
- State management with Zustand

**Backend (`python-agent/`)**
- Google-style docstrings on all public functions
- FastAPI routers live in `python-agent/routers/` — add new endpoints there
- Async handlers throughout; avoid blocking I/O

**Git**
- Conventional commits: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`
- Branch off `main`; PRs required for non-trivial changes

## Key Documentation

Start at [docs/README.md](docs/README.md) for the full index. Most-referenced docs:

- [docs/architecture/system-overview.md](docs/architecture/system-overview.md) — architecture diagram, service map
- [docs/architecture/triggers.md](docs/architecture/triggers.md) — trigger/event pipeline
- [docs/api/README.md](docs/api/README.md) — API auth, base URL, error format
- [TRIGGER_ARCHITECTURE_PLAN.md](TRIGGER_ARCHITECTURE_PLAN.md) — reliability + scaling plan
- [REMAINING_ITEMS.md](REMAINING_ITEMS.md) — Phase 2–4 implementation gaps
- [product/](product/) — feature specs per page
