# Design Spec: `/generate-docs` Claude Code Skill

**Date:** 2026-03-30
**Status:** Approved
**Author:** Claude (Documentation skill brainstorm)

---

## 1. Overview

A Claude Code skill invoked via `/generate-docs <target>` that regenerates specific documentation files by reading the current source code. Ensures docs stay in sync with the codebase without manual effort.

### Problem

- Documentation goes stale as the codebase evolves
- Manually updating docs after every code change is tedious
- No way to know which docs are outdated

### Solution

A targeted regeneration skill. User specifies which doc to update, Claude reads the relevant source files and rewrites the doc to match the current codebase.

---

## 2. Supported Targets

| Command | Output File | Source Files Read |
|---------|------------|-------------------|
| `/generate-docs backend` | `docs/architecture/backend.md` | `python-agent/server.py`, `python-agent/routers/`, `python-agent/middleware.py`, `python-agent/config.py`, `python-agent/services/` |
| `/generate-docs frontend` | `docs/architecture/frontend.md` | `web/src/app/`, `web/src/components/`, `web/src/context/`, `web/src/lib/`, `web/package.json` |
| `/generate-docs database` | `docs/architecture/database.md` | `python-agent/supabase/*.sql` |
| `/generate-docs integrations` | `docs/architecture/integrations.md` | `python-agent/routers/integrations.py`, `python-agent/routers/callback.py`, `python-agent/services/composio_client.py`, `python-agent/services/session.py` |
| `/generate-docs triggers` | `docs/architecture/triggers.md` | `python-agent/triggers.py`, `python-agent/routers/app_triggers.py` |
| `/generate-docs overview` | `docs/architecture/system-overview.md` | `python-agent/server.py`, `web/next.config.js`, `PROJECT_CONTEXT.md` |
| `/generate-docs api chat` | `docs/api/chat.md` | `python-agent/routers/chat.py` |
| `/generate-docs api dashboard` | `docs/api/dashboard.md` | `python-agent/routers/dashboard.py` |
| `/generate-docs api integrations` | `docs/api/integrations.md` | `python-agent/routers/integrations.py`, `python-agent/routers/callback.py`, `python-agent/routers/toolkits.py` |
| `/generate-docs api triggers` | `docs/api/triggers.md` | `python-agent/routers/app_triggers.py` |
| `/generate-docs api billing` | `docs/api/billing.md` | `python-agent/routers/billing.py` |
| `/generate-docs api webhooks` | `docs/api/webhooks.md` | `python-agent/server.py` (webhook section), all remaining routers |
| `/generate-docs lld trigger-pipeline` | `docs/architecture/lld/trigger-pipeline.md` | `python-agent/triggers.py` |
| `/generate-docs lld chat` | `docs/architecture/lld/agent-chat-execution.md` | `python-agent/routers/chat.py`, `python-agent/services/session.py` |
| `/generate-docs lld oauth` | `docs/architecture/lld/oauth-connection.md` | `python-agent/routers/integrations.py`, `python-agent/routers/callback.py` |
| `/generate-docs lld billing` | `docs/architecture/lld/billing-credits.md` | `python-agent/routers/billing.py`, `python-agent/supabase/*.sql` |
| `/generate-docs index` | `docs/README.md` | All files in `docs/` (scan structure) |
| `/generate-docs all` | All of the above | All source files |

---

## 3. Behavior

1. User runs `/generate-docs <target>`
2. Skill reads the existing doc file to understand the current structure/sections
3. Skill reads the relevant source files listed in the table above
4. Skill regenerates the doc maintaining the same section structure but with updated content
5. Skill writes the updated file
6. Skill commits the change

---

## 4. What This Does NOT Do

- No auto-detection of what changed
- No user guide updates (those are manually maintained)
- No inline docstring updates
- No new doc creation (only regenerates existing docs)
- No cost beyond Claude Code subscription

---

## 5. Implementation

Single file: `.claude/skills/generate-docs/SKILL.md`
