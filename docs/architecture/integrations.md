# Integrations Architecture

## Overview

CalmPilot uses the **Composio SDK** as its integration backbone, giving users access to 1000+ tools and OAuth-based connections for 30+ popular apps. Composio handles the OAuth dance, token storage, and tool execution on behalf of CalmPilot, while CalmPilot controls which apps are surfaced to users and what automations run after a connection is established. At launch, only three apps are active (Gmail, Google Calendar, Slack); the remaining apps are already modeled in code and can be uncommented as demand grows.

---

## How Apps Connect

The connection flow is a six-step cycle that spans the frontend, the FastAPI backend, Composio's OAuth infrastructure, and Supabase.

```
User clicks "Connect"
        │
        ▼
POST /api/integrations/connect
  └─ session.authorize(appName, callback_url=...)
        │
        ▼
Composio generates OAuth URL
        │
        ▼
Browser redirects → Third-party OAuth provider (Google, Slack, …)
        │
        ▼
GET /api/callback?status=success&connectedAccountId=...&appName=...
  ├─ BackgroundTask: _run_auto_setup(connected_account_id, app_name)
  │    ├─ Resolve user_id from Composio connected account (3 attempts, exponential backoff)
  │    ├─ Upsert composio_entities table
  │    ├─ invalidate_user_connections() — bust the 60-second connection cache
  │    ├─ auto_setup_triggers(user_id, app_name) — create default triggers
  │    └─ bootstrap_first_briefing(user_id, app_name) — seed Day 0 data
  └─ Redirect → /dashboard/integrations?status=success&app=...
```

**Key implementation notes:**

- `session.authorize()` is called via a per-user Composio session created with `composio_toolset.create(user_id=...)`.
- The callback URL encodes the `appName` as a query parameter so it survives the OAuth round-trip even if Composio does not echo it back.
- The auto-setup step runs as a FastAPI `BackgroundTask` so the OAuth redirect is never delayed by trigger creation.
- Retry logic (up to 3 attempts, 2 s / 4 s / 8 s backoff) handles the race condition where a newly created connection is not immediately visible via the Composio API.

**Whitelist gate:** Only apps listed in `ALLOWED_APPS` (defined in `integrations.py`) may be connected. Any request for an unlisted app returns HTTP 400.

---

## Entity Management

Composio tracks users by an **entity ID**, which in CalmPilot is set equal to the Supabase `user_id` (`UUID`). This 1:1 mapping keeps identity simple.

| Supabase table | Key columns | Purpose |
|---|---|---|
| `composio_entities` | `composio_entity_id`, `user_id`, `app_name` | Maps Composio entity IDs back to CalmPilot users for trigger event routing |

The upsert happens inside `_run_auto_setup` (callback.py) immediately after the OAuth callback resolves a `user_id`. The `composio_entity_id` field is intentionally set to the same value as `user_id` because CalmPilot passes `user_id` as the entity when creating sessions via `composio_toolset.create(user_id=...)`.

When a trigger webhook fires, `TriggerDispatcher._resolve_verified_user_id()` uses this table as one of its fallback lookup strategies if the raw `user_id` from the event metadata is not directly recognized.

---

## Tool Library

When an AI agent needs to call tools on behalf of a user, it fetches that user's tool list via:

```python
session = composio_client.create(user_id=user_id)
tools = session.tools()
```

This call returns only the tools for apps the user has **actively connected**. The result is cached for 1 hour per user (up to 500 entries) in `_tools_cache` inside `triggers.py` to avoid a Composio API round-trip on every trigger fire.

`composio_client` in `config.py` is initialized with `OpenAIAgentsProvider()` so the tool list is already in the OpenAI function-calling format expected by the Agents SDK. `composio_toolset` in `services/composio_client.py` is a separate `Composio()` instance used for all non-agent API calls (CRUD on connections, triggers, toolkits).

---

## Supported Apps

The table below shows the three apps active at launch and the broader set planned for future rollout (commented out in `ALLOWED_APPS`).

| App | Trigger support | Tool support | Status |
|---|---|---|---|
| Gmail | Yes (GMAIL_NEW_GMAIL_MESSAGE) | Yes (send, read, label) | Active |
| Google Calendar | Yes (4 event triggers) | Yes (create, update, list) | Active |
| Slack | Yes (channel + DM messages) | Yes (send message, list channels) | Active |
| GitHub | Yes (PRs, issues, commits) | Yes | Commented out |
| Notion | Yes (page events) | Yes | Commented out |
| Google Drive | Yes (file create/update) | Yes | Commented out |
| Outlook | Yes (email + calendar) | Yes | Commented out |
| Stripe | Yes (payments, subscriptions) | Yes | Commented out |
| Jira, Linear, Trello, HubSpot, Salesforce, … | Yes | Yes | Commented out |

To activate a commented-out app, uncomment its entry in `ALLOWED_APPS` (integrations.py) and add a `PREFERRED_TRIGGERS` entry in `app_triggers.py`. See **Common Tasks** below.

---

## Key Files

| File Path | Purpose |
|---|---|
| `python-agent/routers/integrations.py` | `GET /integrations` (list + status), `POST /integrations/connect`, `POST /integrations/disconnect`; hosts `ALLOWED_APPS` whitelist and toolkit/category cache |
| `python-agent/routers/callback.py` | OAuth callback handler; auto-setup background task with retry logic; upserts `composio_entities` |
| `python-agent/routers/toolkits.py` | Alternative toolkit listing endpoint with bundle definitions (Founder Stack, Code & Ship) |
| `python-agent/routers/app_triggers.py` | Trigger CRUD, auto-setup logic, `PREFERRED_TRIGGERS` defaults, connection cache management |
| `python-agent/services/composio_client.py` | Low-level `Composio` SDK wrapper (`composio_toolset`) with retry policy via tenacity; `execute_action` shim for SDK v0.8 compatibility |
| `python-agent/services/session.py` | `SupabaseSession` — conversation history provider for the OpenAI Agents SDK |
| `python-agent/config.py` | Global `composio_client` (with `OpenAIAgentsProvider`) and `NotificationManager` initialization |

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `COMPOSIO_API_KEY` | Yes | Composio project API key; used by both `composio_client` (config.py) and `composio_toolset` (composio_client.py) |
| `COMPOSIO_WEBHOOK_SECRET` | Yes (production) | HMAC secret for verifying inbound trigger webhook payloads |
| `API_BASE_URL` | Yes | Public URL of the FastAPI server, e.g. `https://api.calmpilot.app`. Composio uses this as the OAuth redirect base |
| `WEB_APP_URL` | Yes | Frontend URL, e.g. `https://app.calmpilot.app`. After OAuth the backend redirects here |
| `DEEP_LINK_SCHEME` | No | Mobile deep-link scheme (default: `aariv`). Used for mobile OAuth redirects |
| `COMPOSIO_DISABLE_TELEMETRY` | No | Set to `true` (default) to opt out of Composio usage telemetry |

---

## Common Tasks

### How do I add support for a new app?

1. **Uncomment (or add) the app slug** in `ALLOWED_APPS` in `python-agent/routers/integrations.py`.

2. **Add preferred triggers** in `PREFERRED_TRIGGERS` in `python-agent/routers/app_triggers.py`. Include only the trigger slugs that make sense for most users. If you skip this step the system will auto-discover all config-free triggers for the app.

3. **Add a routing prompt** in `TRIGGER_PROMPTS` in `python-agent/triggers.py` so the AI knows how to summarize events from this app. Use the trigger slug prefix (e.g. `"HUBSPOT"`) as the key.

4. **Add a notification type** in the `type_map` dict inside `_get_notification_type()` in `triggers.py` so the frontend can render the correct icon/card style.

5. **Test the connection flow** locally by connecting the app through the integrations UI and checking that triggers are created in the `triggers` table and events flow through to `trigger_events`.

---

## Further Reading

- Low-level OAuth connection flow: `docs/architecture/lld/oauth-connection.md` (planned)
- Trigger event pipeline: [Triggers Architecture](./triggers.md)
- App rollout and monetization plan: `PRICING_STRATEGY.md`
