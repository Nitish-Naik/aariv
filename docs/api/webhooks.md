# Webhooks & Remaining API Endpoints

This document covers:
1. [Webhook Endpoints](#webhook-endpoints) — Composio trigger webhook and DodoPayments callback
2. [Other Endpoints](#other-endpoints) — All remaining API routes not documented elsewhere

---

## Webhook Endpoints

Webhooks are registered at the app root (not under `/api/`). No auth header is required — requests are verified by signature.

### POST /webhook

Receive real-time trigger events from Composio (email, Slack, GitHub, etc.).

**Signature verification** uses the Svix-compatible HMAC-SHA256 scheme. The following headers must be present:

| Header | Description |
|---|---|
| `webhook-id` | Unique event ID from Composio |
| `webhook-timestamp` | Unix timestamp of the event |
| `webhook-signature` | `v1,<base64-encoded HMAC>` |

The signing string is `{webhook-id}.{webhook-timestamp}.{raw-body}`. The server derives the HMAC key from the `COMPOSIO_WEBHOOK_SECRET` environment variable (supports both raw secrets and `whsec_`-prefixed base64 secrets).

**Payload format**

```json
{
  "type": "composio.trigger.message",
  "trigger_id": "trig_abc123",
  "metadata": {
    "user_id": "<supabase-user-uuid>",
    "trigger_slug": "GMAIL_NEW_EMAIL_EVENT"
  },
  "data": {
    "subject": "Project update",
    "from": "alice@example.com",
    "text": "..."
  }
}
```

**Success response — 200**

```json
{ "status": "accepted", "message": "Event queued for processing" }
```

The event is handed off to `dispatcher.handle_event()` as a background task — the endpoint returns immediately before processing completes.

**Error responses**

| Status | Condition |
|---|---|
| 400 | Missing required webhook headers |
| 401 | HMAC signature mismatch |
| 500 | `COMPOSIO_WEBHOOK_SECRET` not configured |

> **Note:** The primary event delivery mechanism in production is the Composio SDK subscription (outbound WebSocket from the server). The webhook endpoint is the fallback for environments where the SDK subscription is unavailable.

---

### POST /webhook/dodo

Handle DodoPayments subscription lifecycle events. Verifies the request using the official DodoPayments SDK (`dodo.webhooks.unwrap()`), then upgrades or downgrades the user's tier accordingly.

**Headers** (same Svix scheme as above)

| Header | Description |
|---|---|
| `webhook-id` | Event ID |
| `webhook-signature` | `v1,<base64 HMAC>` |
| `webhook-timestamp` | Unix timestamp |

**Handled event types**

| Event type | Action |
|---|---|
| `subscription.active` | Call `activate_subscription()` — upgrades user tier, resets usage, sets up triggers |
| `subscription.cancelled` | Call `deactivate_subscription()` — reverts to free tier |
| `subscription.failed` | Same as `subscription.cancelled` |

**Tier upgrade flow**

1. DodoPayments sends `subscription.active` with `data.customer.metadata.user_id` and `data.product_id`.
2. The handler maps `product_id` to a plan name (`starter` or `pro`).
3. `activate_subscription()` updates `user_credits` in Supabase with new limits and the subscription ID.
4. Triggers are retroactively set up for apps the user had connected while on the free tier.

**Success response — 200**

```json
{ "status": "ok" }
```

**Error responses**

| Status | Condition |
|---|---|
| 401 | Signature verification failed |
| 500 | `DODO_PAYMENTS_WEBHOOK_KEY` not configured |

---

## Other Endpoints

All endpoints below are under the `/api/` prefix unless stated otherwise. All require a Supabase JWT in `Authorization: Bearer <token>` unless marked **No auth**.

---

### Auth — `/api/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/sync` | Yes | Upsert user profile into `profiles` table after Supabase sign-in. Initialises `user_credits` row for new users (free tier defaults). Sends a welcome email on first signup. Rate-limited to 10/minute; new account creation limited to 3 per IP per hour. |
| GET | `/api/auth/me` | Yes | Return the current user's profile fields: `timezone`, `preferred_model`, `briefing_mode`, `briefing_time`, `spend_alert_threshold`. |
| PATCH | `/api/auth/model` | Yes | Update the user's preferred AI model. Body: `{"model": "gpt-4o"}`. Allowed values: `gpt-4o-mini`, `gpt-4o`, `gpt-4.1-mini` (Free+), `gpt-4.1` (Starter+), `gpt-5`, `gpt-5.4` (Pro). Returns 403 if the user's tier is too low for the requested model. |
| PATCH | `/api/auth/timezone` | Yes | Save the user's timezone string (e.g. `"America/New_York"`) to their profile and `user_credits` table. Body: `{"timezone": "America/New_York"}`. |
| DELETE | `/api/auth/delete` | Yes | Soft delete: removes profile and all Composio connections. Rate-limited to 3/minute. |
| DELETE | `/api/auth/account` | Yes | Full account deletion: cancels active Dodo subscription, revokes all Composio connections and triggers, purges all user data from every table, then deletes the Supabase auth record. Rate-limited to 3/minute. Returns 204 No Content on success. |

**POST /api/auth/sync — body**

```json
{
  "name": "Alice",
  "avatar": "https://...",
  "timezone": "Europe/London"
}
```

---

### Notifications — `/api/notifications`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/notifications/{userId}` | Yes | Open a Server-Sent Events (SSE) stream for real-time push notifications. The caller must match `{userId}`. Sends a heartbeat comment (`: heartbeat`) every 30 seconds to keep the connection alive through proxies. |

**SSE event format**

```
data: {"type": "connection", "status": "connected"}

data: {"type": "trigger_event", "title": "New email from Alice", ...}

: heartbeat
```

---

### Actions — `/api/actions`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/actions/execute` | Yes | Execute a named action via an AI + Composio tool-calling loop (up to 5 iterations). Counts toward the user's monthly message quota. Returns 429 if quota exceeded. |

**Request body**

```json
{
  "userId": "<uuid>",
  "actionType": "DRAFT_REPLY",
  "actionData": {
    "threadId": "...",
    "description": "Polite acknowledgement",
    "title": "Re: Project Update",
    "to": "alice@example.com",
    "metadata": {}
  }
}
```

**Supported action types**

| `actionType` | Description |
|---|---|
| `DRAFT_REPLY` | Create a Gmail draft reply for a thread |
| `SAVE_DRAFT` | Save a new Gmail draft |
| `SEND_EMAIL` | Send an email immediately |
| `CALENDAR_ACTION` | Accept, decline, or create a calendar event |
| `GENERAL_ACTION` | Free-form action using any available Composio tool |

**Success response**

```json
{ "status": "success", "message": "Draft saved to thread xyz." }
```

---

### Inbox — `/api/inbox`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/inbox` | Yes | Fetch and AI-summarise the user's Gmail inbox using a Composio tool-calling loop. Counts toward monthly quota. Returns `{"messages": []}` if Gmail is not connected. |

**Query parameters**

| Param | Default | Description |
|---|---|---|
| `filter` | `""` | Pass `"high_priority"` to restrict to unread important primary-category emails only |

**Response shape**

```json
{
  "messages": [
    {
      "id": "msg_abc",
      "threadId": "thread_xyz",
      "sender": "Alice",
      "subject": "Meeting at 3pm",
      "snippet": "Quick sync to align on Q2...",
      "time": "10:30 AM",
      "unread": true,
      "priority": "high",
      "actionRequired": true,
      "suggestedAction": "Reply confirming attendance"
    }
  ]
}
```

---

### Voice — `/api/voice`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/voice/` | Yes | Full voice pipeline: Whisper STT transcription → GPT-4o chat with Composio tools → TTS (alloy voice) → base64 MP3. Accepts `multipart/form-data`. Counts toward monthly quota. Max audio size: 25 MB. |

**Request** (`multipart/form-data`)

| Field | Type | Description |
|---|---|---|
| `audio` | file | Audio file (webm, mp3, wav, etc.) |
| `userId` | string | Authenticated user's UUID |

**Success response**

```json
{
  "transcript": "What meetings do I have today?",
  "replyText": "You have two meetings: standup at 9am and a design review at 2pm.",
  "audioBase64": "<base64-encoded MP3>"
}
```

**Error codes:** 402 (quota exceeded), 413 (file too large), 403 (userId mismatch)

---

### Review — `/api/review`

The review hub surfaces AI-curated action items for human approval before execution.

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/review` | Yes | List review items for the current user. Query param `status`: `pending` (default), `resolved`, or `all`. Returns items sorted by priority (high → medium → low) then recency. Automatically un-snoozes items whose snooze window has passed. |
| POST | `/api/review/act` | Yes | Approve, dismiss, or snooze a review item. Approving triggers AI execution of the associated action (counts toward quota). |
| POST | `/api/review/dismiss-all` | Yes | Dismiss all pending items for the current user at once. |
| GET | `/api/review/{item_id}/context` | Yes | Return the raw trigger event payload for a review item (for display in the UI). Returns `{"data": null}` if no trigger event is linked. |

**POST /api/review/act — body**

```json
{
  "userId": "<uuid>",
  "itemId": "rev_1712345678_gmail",
  "action": "snooze",
  "snoozeDuration": 120
}
```

| Field | Type | Description |
|---|---|---|
| `action` | string | `"approve"`, `"dismiss"`, or `"snooze"` |
| `snoozeDuration` | integer | Minutes to snooze; only relevant when `action` is `"snooze"`. Defaults to 60. |

---

### History — `/api/history`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/history/conversations/{user_id}` | Yes | List all conversations for a user, ordered by most recently updated. Query param: `limit` (default 50). Returns `[{id, title, updated_at, created_at}]`. |
| GET | `/api/history/messages/{conversation_id}` | Yes | Fetch all messages in a conversation, with attached tool execution logs. Verifies the conversation belongs to the authenticated user. |
| DELETE | `/api/history/conversations/user/{user_id}` | Yes | Delete all conversations for a user. Optional query param `older_than_days` to restrict to conversations created within the last N days. Cascades through messages and tool logs. |
| DELETE | `/api/history/conversations/{conversation_id}` | Yes | Delete a single conversation and all its messages and tool logs. |
| GET | `/api/history/retention/{user_id}` | Yes | Get the user's history auto-delete preference in days. Returns `{"retention_days": null}` if set to keep forever. |
| PUT | `/api/history/retention/{user_id}` | Yes | Set the retention preference. Body: `{"days": 30}`. Pass `null` to keep forever. Immediately purges conversations older than the new limit if a value is set. |

---

### Calendar — `/api/calendar`

All calendar endpoints require Google Calendar to be connected via Composio. Endpoints that call AI (suggest-times, conflicts, conflicts/resolve) count toward the monthly message quota.

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/calendar` | Yes | Fetch calendar events. Query params: `userId` (required), `timeMin` (ISO 8601), `timeMax` (ISO 8601). If `timeMin`/`timeMax` are omitted, defaults to today in the user's profile timezone. Returns `{"events": [...]}`. |
| POST | `/api/calendar/create` | Yes | Create a Google Calendar event. See request body below. Returns `{"success": true, "event": {...}, "message": "Event created successfully!"}`. |
| POST | `/api/calendar/suggest-times` | Yes | AI-powered free-slot finder. Parses a natural-language query, checks existing events, and returns up to 5 ranked suggestions. Counts toward quota. |
| GET | `/api/calendar/conflicts` | Yes | Detect scheduling conflicts in the next 7 days using AI analysis. Query param: `userId`. Counts toward quota. Returns `{"conflicts": [...]}`. |
| POST | `/api/calendar/conflicts/resolve` | Yes | Execute an AI-generated conflict resolution (e.g. decline one event, reschedule another). Body: `{"userId": "...", "resolution": {...}}`. Counts toward quota. |

**POST /api/calendar/create — body**

```json
{
  "userId": "<uuid>",
  "title": "Design Review",
  "startTime": "2025-04-01T14:00:00Z",
  "endTime": "2025-04-01T15:00:00Z",
  "description": "Q2 design sync",
  "location": "Zoom",
  "attendees": ["bob@example.com"]
}
```

**POST /api/calendar/suggest-times — body**

```json
{
  "userId": "<uuid>",
  "query": "30-minute meeting sometime tomorrow afternoon",
  "duration": 30
}
```

---

### Settings — `/api/settings`

| Method | Path | Auth | Description |
|---|---|---|---|
| PUT | `/api/settings/briefing` | Yes | Save the user's AI briefing preference. Body: `{"mode": "smart"}` or `{"mode": "fixed", "time": "08:00"}`. `mode` must be `"smart"` or `"fixed"`. When `mode` is `"fixed"`, `time` is an `"HH:MM"` string. Returns `{"success": true}`. |

---

### Feedback — `/api/feedback`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/feedback` | Yes | Submit user feedback. Body fields: `category` (required: `bug`, `feature`, `ux`, or `general`), `message` (required, max 5000 chars), `rating` (optional, 1–5), `page` (optional, max 200 chars, the UI route where feedback was submitted). Returns `{"status": "submitted"}`. |

---

### Health — (root, no `/api/` prefix)

These endpoints have no auth requirement and are intended for load balancers and uptime monitors.

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | No | Full health check. Returns service name, version, timestamp, and whether Composio is initialised. Always 200. |
| GET | `/healthz` | No | Minimal liveness probe for Kubernetes. Returns `{"alive": true}`. Always 200. |
| GET | `/readiness` | No | Readiness probe. Checks both Composio initialisation and live Supabase connectivity. Returns 200 if both are ready, 503 otherwise. |

**GET /health — example response**

```json
{
  "status": "ok",
  "timestamp": "2025-03-30T12:00:00.000000",
  "service": "aariv-backend",
  "version": "2.0.0",
  "composio_initialized": true
}
```

**GET /readiness — example response (degraded)**

```json
{
  "ready": false,
  "composio_initialized": true,
  "supabase_connected": false,
  "timestamp": "2025-03-30T12:00:00.000000"
}
```
