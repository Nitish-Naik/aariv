# OAuth Connection — Low-Level Design

**Files:** `python-agent/routers/integrations.py`, `python-agent/routers/callback.py`, `python-agent/routers/app_triggers.py`

---

## Flow Diagram

```
User clicks "Connect" on Integrations page
          |
          | POST /api/integrations/connect  {userId, appName, platform}
          v
connect_integration(body, current_user)
          |
          +-> JWT auth check (userId == token.userId)
          |         | 403 if mismatch
          |         v
          +-> ALLOWED_APPS whitelist check
          |         | 400 if not in list
          |         v
          +-> composio_toolset.create(user_id=userId)
          +-> session.authorize(appName, callback_url=callback_url)
          |         callback_url = "{API_BASE_URL}/api/callback?platform=web&appName={app}"
          |         v
          +-> Extract redirectUrl from connection_request
          +-> invalidate_user_connections(userId)
          +-> Return {url: redirectUrl}
                    |
          [Browser opens OAuth popup / redirects to Google/Slack/etc.]
                    |
          [OAuth provider redirects back to callback_url]
                    |
                    v
GET /api/callback?status=success&connectedAccountId=...&appName=...&platform=web
          |
          v
oauth_callback(request, background_tasks)
          |
          +-> Whitelist and sanitize all query params
          +-> If status=="success" and app_name missing: resolve from composio_toolset
          |
          +-> If status in ("success", "ACTIVE"):
          |       background_tasks.add_task(_run_auto_setup, connected_account_id, app_name)
          |
          +-> platform=="web":  302 RedirectResponse to {WEB_APP_URL}/dashboard/integrations?status=...
          +-> platform=="mobile": HTMLResponse with deep link redirect to {DEEP_LINK_SCHEME}://...
                    |
                    v (background)
          _run_auto_setup(connected_account_id, app_name)  [up to 3 retries with backoff]
                    |
                    +-> composio_toolset.connected_accounts.get(nanoid=connected_account_id)
                    |         Resolves user_id from connected account
                    |         Fallback 1: list connections for app, find by ID
                    |         Fallback 2: take latest connection for app
                    |         If still no user_id: retry with exponential backoff (2s, 4s, 8s)
                    |         After 3 failures: LOG ERROR; return
                    |         v
                    +-> supabase.composio_entities.upsert({composio_entity_id, user_id, app_name})
                    +-> invalidate_user_connections(user_id)
                    +-> auto_setup_triggers(user_id, app_name)
                    |         Creates Composio triggers from PREFERRED_TRIGGERS or dynamic discovery
                    |         Saves trigger records to Supabase triggers table
                    |         Returns {created: [slugs], skipped: [slugs]}
                    |         v
                    +-> If any triggers created or first connection:
                            asyncio.create_task(bootstrap_first_briefing(user_id, app_name))
```

---

## Functions Reference

| Name | File:Line | Purpose | Inputs | Outputs |
|---|---|---|---|---|
| `connect_integration` | integrations.py:267 | POST handler — initiate OAuth, return redirect URL | `ConnectRequest, current_user: dict` | `{url: str}` |
| `disconnect_integration` | integrations.py:336 | POST handler — delete connection, clean up triggers | `DisconnectRequest, current_user: dict` | `{status, message}` |
| `list_integrations` | integrations.py:158 | GET handler — list allowed apps with connection status | `current_user: dict` | `{integrations: list}` |
| `oauth_callback` | callback.py:146 | GET handler — receive OAuth redirect, trigger background setup | `request: Request, background_tasks` | `RedirectResponse` or `HTMLResponse` |
| `_run_auto_setup` | callback.py:15 | Background: resolve userId, store entity, create triggers | `connected_account_id, app_name` | None (async, 3 retries) |
| `_get_cached_toolkits` | integrations.py:67 | Return cached Composio toolkit list (1h TTL) | None | `list` |
| `_get_cached_categories` | integrations.py:91 | Return cached category list (1h TTL) | None | `list` |
| `_ensure_triggers_for_connected_apps` | integrations.py:128 | Background: create missing triggers for connected apps | `user_id, connected_slugs: list` | None (async) |
| `auto_setup_triggers` | app_triggers.py | Create Composio triggers for a connected app | `user_id, app_name` | `{created: list, skipped: list}` |
| `invalidate_user_connections` | app_triggers.py | Clear per-user connection cache entry | `user_id: str` | None |

---

## Composio Entity

Every CalmPilot user gets a Composio entity identified by their Supabase `user_id` UUID.

**Entity creation/lookup flow:**
1. `composio_toolset.create(user_id=userId)` — Composio session scoped to this user
2. Composio may return a different entity ID in webhook events (account migration, SDK version change)
3. The `composio_entities` table maps stale IDs back to the real Supabase UUID

**composio_entities table:**
```sql
composio_entity_id  TEXT  PRIMARY KEY   -- entity ID as seen in Composio events
user_id             UUID  NOT NULL      -- real Supabase auth UUID
app_name            TEXT                -- optional context (e.g. "gmail")
```

After each successful OAuth callback, `_run_auto_setup` upserts `{composio_entity_id: user_id, user_id: user_id, app_name: app_name}` to establish the canonical mapping.

---

## OAuth Redirect

**Web flow:**
1. `connect_integration` calls `session.authorize(appName, callback_url=...)` to get a Composio-hosted redirect URL
2. Frontend opens the URL (popup or redirect) — user authenticates with Google/Slack/etc.
3. OAuth provider hands token to Composio; Composio redirects to our `callback_url`
4. `oauth_callback` extracts params, sanitizes them, schedules auto-setup, and issues `302 RedirectResponse` back to the dashboard

**Mobile flow:**
- Same OAuth redirect, but `platform=mobile` in callback URL
- `oauth_callback` returns an HTML page with `<meta http-equiv="refresh">` pointing to the deep link `{DEEP_LINK_SCHEME}://?status=...`
- A manual button is also shown for devices that block auto-redirect

**Callback URL parameter threading:**
The OAuth chain is: our app -> Composio -> OAuth provider -> back to Composio -> our callback. `appName` must be embedded in the original callback URL so it survives the full redirect chain without server-side session state.

**Callback parameter sanitization:**
- `status` whitelisted to `("success", "ACTIVE", "failure", "cancelled", "")`, else empty string
- `platform` whitelisted to `("web", "mobile", "")`, defaults to `"web"`
- `connected_account_id` truncated to 100 chars; `app_name` to 50 chars

---

## Auto-Trigger Setup

After OAuth completes, `auto_setup_triggers(user_id, app_name)` creates Composio triggers.

**Trigger selection strategy:**
1. Check `PREFERRED_TRIGGERS` dict for the app — if present, create curated subset
2. If not in `PREFERRED_TRIGGERS`: dynamically fetch all triggers for the app from Composio API, filter to config-free triggers only, create all of them

**Launch-phase PREFERRED_TRIGGERS:**

| App | Trigger Slug | Config |
|---|---|---|
| gmail | GMAIL_NEW_GMAIL_MESSAGE | `{userId: "me", interval: 1, labelIds: "INBOX"}` |
| googlecalendar | GOOGLECALENDAR_GOOGLE_CALENDAR_EVENT_UPDATED_TRIGGER | `{calendarId: "primary", interval: 1}` |
| googlecalendar | GOOGLECALENDAR_EVENT_STARTING_SOON_TRIGGER | `{calendarId: "primary", interval: 1, minutes_before_start: 10}` |
| googlecalendar | GOOGLECALENDAR_GOOGLE_CALENDAR_EVENT_CREATED_TRIGGER | `{calendarId: "primary", interval: 1}` |
| googlecalendar | GOOGLECALENDAR_EVENT_CANCELED_DELETED_TRIGGER | `{calendarId: "primary", interval: 1}` |
| slack | SLACK_RECEIVE_MESSAGE | `{}` |
| slack | SLACK_RECEIVE_DIRECT_MESSAGE | `{}` |

**Idempotency:** `composio.triggers.create()` is idempotent — calling it twice returns the same instance. Safe to call on reconnects.

**Bootstrap:** If any triggers were created, `bootstrap_first_briefing(user_id, app_name)` runs as background task to fetch recent data (last N emails/messages/events) and write synthetic `trigger_events` rows so the Day 0 briefing has real content.

**Retry logic (`_run_auto_setup`):**
- Max 3 attempts, exponential backoff: 2s, 4s, 8s
- Handles race condition where new connection is not yet visible via Composio API immediately after OAuth

**Guard on `list_integrations`:** `_ensure_triggers_for_connected_apps()` runs in the background whenever `GET /api/integrations` is called. Checks if any connected app is missing triggers. Rate-limited to once per 60 seconds per user.

---

## Disconnection Flow

`POST /api/integrations/disconnect` with `{userId, connectionId, appName?}`

1. Resolve `app_name` from request body; if missing, call `composio_toolset.connected_accounts.get(connectionId)`
2. `composio_toolset.connected_accounts.delete(connectionId)` — removes connection from Composio
3. `invalidate_user_connections(userId)` — clears connection cache
4. Query `triggers` table: all triggers for this user where `trigger_slug` starts with the app's uppercase prefix
5. For each orphaned trigger:
   - `composio_toolset.triggers.delete(trigger_id=trigger.id)` — remove from Composio (errors silently ignored)
   - `supabase.triggers.delete().eq("id", trigger.id)` — remove from local DB

---

## Error Handling

| Stage | Error | Handling |
|---|---|---|
| `connect_integration` | Not in ALLOWED_APPS | 400 "This integration is not available." |
| `connect_integration` | session.authorize() fails | Catches exception, logs with traceback, raises 500 |
| `connect_integration` | No redirectUrl in response | Logs error; raises 500 "Failed to get redirect URL from Composio" |
| `oauth_callback` | Invalid status or platform param | Sanitized to empty string or default value; no 400 |
| `oauth_callback` | Cannot resolve app_name from account | Logs warning, continues with empty app_name (auto-setup skipped) |
| `_run_auto_setup` | connected_accounts.get() fails | Retries with exponential backoff; lists connections as fallback |
| `_run_auto_setup` | User ID not resolved after 3 attempts | Logs FAILED error and returns; no triggers created |
| `_run_auto_setup` | Entity mapping upsert fails | Logs warning, continues to trigger setup |
| `_run_auto_setup` | No triggers created/skipped | Retries if under max_retries |
| `bootstrap_first_briefing` | Any exception | Logs warning; does not block trigger setup |
| `disconnect_integration` | Composio delete fails | Logged as error; DB cleanup still proceeds |
| Orphaned trigger Composio delete | Already removed in Composio | `pass` — silently ignored |
| `_ensure_triggers_for_connected_apps` | Any exception | Logs warning, non-fatal |
| `_get_cached_toolkits` | Composio API unavailable | Returns `[]`; integrations endpoint returns empty list |

---

## Key Decisions

**session.authorize() instead of direct API calls**
The SDK's `session.authorize()` generates a user-specific OAuth redirect URL tied to the `user_id`. This ensures the connection is correctly scoped to the user's Composio entity.

**Exponential backoff in _run_auto_setup**
After OAuth completes, there is a race condition: the Composio API may not yet reflect the new connection. The 3-attempt retry with 2s/4s/8s backoff handles this without blocking the callback response.

**PREFERRED_TRIGGERS as curated override**
For apps with many available triggers (Google Calendar has 5+), auto-creating all of them would generate excessive noise. `PREFERRED_TRIGGERS` defines the exact subset to create. Apps not in the dict fall through to config-free auto-discovery.

**composio.triggers.create() is idempotent**
Per Composio SDK documentation, calling `triggers.create()` for the same trigger twice returns the existing instance. This makes `auto_setup_triggers()` safe to call multiple times (from callback, from `_ensure_triggers_for_connected_apps`, on subscription upgrade).

**Disconnection cleans up triggers eagerly**
Orphaned triggers would fire webhook events that cannot be routed to a user. The disconnect flow proactively deletes them from both Composio and the local DB. Composio-side deletion is best-effort; DB deletion is required.
