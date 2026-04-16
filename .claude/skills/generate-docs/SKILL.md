---
name: generate-docs
description: Regenerate CalmPilot documentation by reading current source code. Usage: /generate-docs <target>
argument-hint: <target> (e.g., backend, frontend, database, api chat, lld trigger-pipeline, all)
---

You are a documentation generator for CalmPilot. Your job is to regenerate specific documentation files by reading the current source code and rewriting the docs to match.

## Step 1: Parse Target

The user specified: $ARGUMENTS

Match the target to the table below. If no target or unrecognized target, show the available targets list and ask the user to pick one.

| Target | Doc File | Source Files to Read |
|--------|----------|---------------------|
| `backend` | `docs/architecture/backend.md` | `python-agent/server.py`, all files in `python-agent/routers/`, `python-agent/middleware.py`, `python-agent/config.py`, all files in `python-agent/services/` |
| `frontend` | `docs/architecture/frontend.md` | `web/src/app/` (all page.tsx), `web/src/components/` (list), `web/src/context/` (all), `web/src/lib/` (all), `web/package.json`, `web/next.config.js` |
| `database` | `docs/architecture/database.md` | All `.sql` files in `python-agent/supabase/` |
| `integrations` | `docs/architecture/integrations.md` | `python-agent/routers/integrations.py`, `python-agent/routers/callback.py`, `python-agent/routers/toolkits.py`, `python-agent/services/composio_client.py`, `python-agent/services/session.py` |
| `triggers` | `docs/architecture/triggers.md` | `python-agent/triggers.py`, `python-agent/routers/app_triggers.py` |
| `overview` | `docs/architecture/system-overview.md` | `python-agent/server.py`, `web/next.config.js`, `web/package.json`, `PROJECT_CONTEXT.md` |
| `api chat` | `docs/api/chat.md` | `python-agent/routers/chat.py` |
| `api dashboard` | `docs/api/dashboard.md` | `python-agent/routers/dashboard.py` |
| `api integrations` | `docs/api/integrations.md` | `python-agent/routers/integrations.py`, `python-agent/routers/callback.py`, `python-agent/routers/toolkits.py` |
| `api triggers` | `docs/api/triggers.md` | `python-agent/routers/app_triggers.py` |
| `api billing` | `docs/api/billing.md` | `python-agent/routers/billing.py` |
| `api webhooks` | `docs/api/webhooks.md` | `python-agent/server.py`, all remaining routers not covered by other api docs |
| `lld trigger-pipeline` | `docs/architecture/lld/trigger-pipeline.md` | `python-agent/triggers.py` |
| `lld chat` | `docs/architecture/lld/agent-chat-execution.md` | `python-agent/routers/chat.py`, `python-agent/services/session.py` |
| `lld oauth` | `docs/architecture/lld/oauth-connection.md` | `python-agent/routers/integrations.py`, `python-agent/routers/callback.py` |
| `lld billing` | `docs/architecture/lld/billing-credits.md` | `python-agent/routers/billing.py`, relevant `.sql` files in `python-agent/supabase/` |
| `index` | `docs/README.md` | Scan all files in `docs/` to rebuild the table of contents |
| `all` | All of the above | All source files |

## Step 2: Read Existing Doc

Read the existing doc file to understand its current section structure. You MUST preserve the same sections and format — only update the content within each section to reflect the current source code.

## Step 3: Read Source Files

Read ALL the source files listed in the table for the matched target. Extract:
- Function/class names and signatures
- Endpoint definitions (method, path, function name)
- Data structures, types, interfaces
- Environment variables
- Configuration values
- Relationships between components

## Step 4: Regenerate the Doc

Rewrite the doc file with updated content based on what you found in the source code.

Rules:
- Preserve the existing section structure and format
- Update all tables, lists, and descriptions to match current code
- If new endpoints/functions/tables were added, include them
- If endpoints/functions/tables were removed, remove them from the doc
- Keep the same writing style: concise, developer-focused for architecture/API docs
- Include accurate file paths and line references where appropriate
- Do NOT add sections that weren't there before (unless something major was added to the codebase)

## Step 5: Write and Commit

1. Write the updated doc file
2. Commit with message: `docs: update <doc-name> to match current codebase`

## Special: `all` Target

If the target is `all`, process each target one by one in this order:
1. overview
2. backend
3. frontend
4. database
5. integrations
6. triggers
7. lld trigger-pipeline
8. lld chat
9. lld oauth
10. lld billing
11. api chat
12. api dashboard
13. api integrations
14. api triggers
15. api billing
16. api webhooks
17. index

Commit all changes together at the end with message: `docs: regenerate all documentation to match current codebase`

## Special: `index` Target

For the index target, scan the `docs/` directory structure and rebuild `docs/README.md` with updated links and descriptions for all doc files found. Preserve the existing section grouping (Architecture, LLD, API Reference, User Guide, Other Resources).
