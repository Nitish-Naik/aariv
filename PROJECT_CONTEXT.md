# Aariv Project Context

This document provides a practical, up-to-date overview of the current workspace so contributors can onboard quickly and understand how the code and docs fit together.

## 1) Project Snapshot

- Product naming in repo/docs is mixed: `Aariv` and `CalmPilot` are used interchangeably.
- This workspace is a multi-part product with:
  - a Next.js web app (`web/`),
  - a Python FastAPI agent backend (`python-agent/`),
  - a full Composio SDK monorepo (`composio/`),
  - product/strategy docs (`product/` and root markdown files).
- Historical docs mention an Expo mobile app and a Node `backend/`, but those folders are not present in this checkout.

## 2) Top-Level Folder Roles

- `web/`
  - Customer-facing web product (Next.js App Router + TypeScript + Tailwind).
  - Contains marketing + product pages (integrations, dashboard-related flows, etc.).
- `python-agent/`
  - Operational AI/automation backend (FastAPI + Composio + OpenAI).
  - Handles trigger ingestion, webhook/event processing, and notification workflows.
- `composio/`
  - Upstream-style SDK monorepo for Composio (TypeScript + Python SDKs, providers, docs).
  - Used as reference/integration surface for tool and trigger capabilities.
- `product/`
  - Product specs per app section (`HOME.md`, `ASSISTANT.md`, `INTEGRATIONS.md`, etc.).
  - Serves as source-of-truth planning docs for feature behavior and roadmap phases.
- `skills/`
  - Skill package/docs for agent workflows and contribution guidance.
- Root markdown docs (examples)
  - `TRIGGER_ARCHITECTURE_PLAN.md`: reliability/scaling plan for trigger pipeline.
  - `REMAINING_ITEMS.md` and `product/REMAINING.md`: implementation gaps and bug/status tracking.
  - `marketing.md`, `models.md`: GTM and pricing strategy.

## 3) Runtime Architecture (Current Practical View)

### Web App

- Stack: Next.js 14, React 18, TypeScript, Tailwind.
- Location: `web/`.
- Key characteristics:
  - Integration-focused UX for connecting apps.
  - Uses Supabase client dependencies.
  - Uses Vercel analytics/speed insights.

### Python Agent Service

- Stack: FastAPI, Uvicorn, OpenAI SDK, Composio SDK, Supabase client.
- Location: `python-agent/`.
- Key characteristics:
  - Trigger/event handling pipeline.
  - AI summarization/review extraction patterns.
  - Production deployment configs for Cloud Run/Render/AWS App Runner.

### Composio Monorepo

- Stack: pnpm workspace + Turbo + TS/Python SDK packages.
- Location: `composio/`.
- Key characteristics:
  - Official SDK code, provider integrations, docs tooling.
  - Useful if you need to inspect low-level Composio capabilities/changes.

## 4) Main External Integrations

- Composio: toolkits, OAuth connections, triggers/webhooks.
- OpenAI: model-backed summarization and agent responses.
- Supabase: auth/data persistence (web + backend integration points).
- Resend (backend docs/env): transactional notifications.
- Vercel analytics libraries (web): frontend performance/analytics.

## 5) Environment Variables (Important)

## Python backend (`python-agent/.env*`)

- Required in practice:
  - `OPENAI_API_KEY`
  - `COMPOSIO_API_KEY`
- Commonly used:
  - `SUPABASE_URL`
  - `SUPABASE_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `COMPOSIO_WEBHOOK_SECRET`
  - `PORT`
  - `IS_CLOUD_RUN`
  - `RESEND_API_KEY`
  - `GOOGLE_CLIENT_ID` (where OAuth flow requires it)

## Web frontend (`web/`)

- Common public env:
  - `NEXT_PUBLIC_API_URL`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 6) Local Development Commands

## Web (`web/`)

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Python Agent (`python-agent/`)

```bash
pip install -r requirements.txt
python run_dev.py
# or
python server.py
```

## Composio SDK Monorepo (`composio/`)

```bash
pnpm install
pnpm build
pnpm test
pnpm lint
```

## Root (legacy Expo scripts still present)

```bash
npm install
npm test
npx expo start
```

Note: root `package.json` contains Expo/Jest setup. In this checkout, active product code appears to be concentrated in `web/` and `python-agent/`.

## 7) Testing and Quality Signals

- Root:
  - `jest.config.js` exists with `jest-expo` preset.
- Web:
  - lint/build scripts in `web/package.json`.
- Python agent:
  - test files in `python-agent/tests/` and standalone test scripts.
  - diagnostics scripts (`diagnose_composio.py`, `diagnose_triggers.py`).
- Composio:
  - robust workspace scripts for test, lint, typecheck.

## 8) Deployment Clues

- Python backend deployment assets:
  - `python-agent/Dockerfile`
  - `python-agent/cloudbuild.yaml`
  - `python-agent/render.yaml`
  - `python-agent/apprunner.yaml`
- Root has `docker-compose.yml`, but it references a Node-style backend shape (`/api/health` on port 3000). Treat as potentially legacy unless validated against current service layout.

## 9) Product and Roadmap Sources

- Product behavior specs: `product/*.md`
- Remaining work: `product/REMAINING.md`, `REMAINING_ITEMS.md`
- Trigger reliability roadmap: `TRIGGER_ARCHITECTURE_PLAN.md`
- Pricing model analysis: `models.md`
- Marketing/GTM plan: `marketing.md`

## 10) Known Repo Inconsistencies (Important for New Contributors)

- `README.md` references Expo + Node `backend/` setup that does not fully match the present folder layout.
- `docker-compose.yml` references a Node backend contract that may be out-of-date relative to `python-agent/`.
- Naming varies between `Aariv` and `CalmPilot` across code and docs.

When starting implementation work, prefer folder-local configs and scripts (`web/`, `python-agent/`, `composio/`) over older root-level assumptions.

## 11) Suggested Contributor Workflow

1. Decide target surface first: `web`, `python-agent`, or `composio`.
2. Run that surface independently with its local env vars.
3. Use `product/*.md` to confirm intended behavior before coding.
4. For trigger/event changes, cross-check `TRIGGER_ARCHITECTURE_PLAN.md`.
5. If touching billing/pricing/growth behavior, align with `models.md` and `marketing.md`.

## 12) Quick Orientation by Goal

- Build UI/features: start in `web/src/app/` and related components.
- Build AI trigger processing or webhook logic: start in `python-agent/server.py` and `python-agent/triggers.py`.
- Investigate Composio SDK internals: start in `composio/ts/` and `composio/python/`.
- Validate product scope and missing features: start in `product/REMAINING.md`.

---

Last updated: 2026-03-14
