# Chat API

Endpoints for sending messages to the AI agent, listing connected apps, and fetching suggestion chips.

All paths are relative to the [base URL](./README.md).

---

## POST /api/chat

Send a message to the CalmPilot AI agent. Returns a **Server-Sent Events (SSE)** stream.

### Auth Required

Yes — `Authorization: Bearer <jwt_token>`

### Consumes Quota

Yes — each call increments `chat_messages_used` by 1. If the monthly limit is reached the stream still opens but the first (and only) event will have `type: "chat_quota_exceeded"`.

### Rate Limit

20 requests per user per 60-second sliding window. Returns HTTP `429` if exceeded.

### Request Body

```json
{
  "userId": "uuid-of-authenticated-user",
  "message": "What emails need my attention today?",
  "conversationId": "uuid-of-existing-conversation",
  "model": "gpt-4.1-mini",
  "timezone": "America/New_York",
  "currentDate": "2025-03-30"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `userId` | `string` (UUID) | Yes | Must match the `sub` claim in the JWT. |
| `message` | `string` | Yes | User's natural language message. |
| `conversationId` | `string` (UUID) | No | Existing conversation to append to. If omitted a new conversation is created automatically. |
| `model` | `string` | No | AI model to use. Defaults to `gpt-4.1-mini`. See tier limits below. |
| `timezone` | `string` | No | IANA timezone (e.g., `"America/New_York"`). Passed to the agent for date interpretation. |
| `currentDate` | `string` | No | ISO date string for today (`YYYY-MM-DD`). Prevents the agent from asking the user for today's date. |

**Allowed models by tier:**

| Model | Minimum tier |
|---|---|
| `gpt-4o`, `gpt-4o-mini`, `gpt-4.1-mini`, `gpt-4.1-nano` | Free |
| `gpt-4.1` | Starter |
| `gpt-5`, `gpt-5.1`, `gpt-5.2`, `gpt-5.4` | Pro |

If the user requests a model above their tier, the server silently downgrades to the best model they can access.

### Response

`Content-Type: text/event-stream`

Each line in the stream has the format:

```
data: <JSON>\n\n
```

**SSE event types:**

| `type` | When emitted | `data` shape |
|---|---|---|
| `log` | Every time the agent starts or finishes calling a tool | `{"label": "Reading emails...", "status": "running" \| "success" \| "error", "tool": "COMPOSIO_MULTI_EXECUTE_TOOL"}` |
| `token` | Each text token the agent produces | `"Hello, here are your emails…"` (plain string delta) |
| `data_card` | When a tool returns structured data that can be rendered as a rich card | Varies by action — see data card docs |
| `auth_required` | When the agent needs the user to connect an app | `{"appName": "Gmail", "url": "https://connect.composio.dev/…"}` |
| `chat_quota_exceeded` | When the monthly quota is reached | `{"used": 50, "limit": 50, "reason": "quota_exceeded"}` |
| `result` | Final event — stream ends after this | `{"response": "Here are 3 emails…", "conversationId": "uuid", "logs": […], "actions_taken": true, "auth_actions": […]}` |
| `error` | Agent crashed or timed out (2-minute hard timeout) | `"Request timed out. Please try a simpler query."` (plain string) |

**Example stream:**

```
data: {"type":"log","data":{"label":"Initializing assistant...","status":"running"}}

data: {"type":"log","data":{"label":"Reading emails...","status":"running","tool":"COMPOSIO_MULTI_EXECUTE_TOOL"}}

data: {"type":"log","data":{"label":"Reading emails...","status":"success","tool":"COMPOSIO_MULTI_EXECUTE_TOOL"}}

data: {"type":"token","data":"You have "}

data: {"type":"token","data":"3 unread emails."}

data: {"type":"result","data":{"response":"You have 3 unread emails.","conversationId":"abc-123","logs":[],"actions_taken":false,"auth_actions":[]}}
```

**Quota exceeded stream (no AI call is made):**

```
data: {"type":"chat_quota_exceeded","data":{"used":50,"limit":50,"reason":"quota_exceeded"}}
```

### Errors

| Status | Cause |
|---|---|
| `401` | Missing or invalid JWT |
| `403` | `userId` in body does not match token's `sub` |
| `429` | Per-user rate limit exceeded (20 req/min) |
| `500` | Composio client not initialized |

---

## GET /api/chat/connections

List all active app connections for the authenticated user.

### Auth Required

Yes

### Consumes Quota

No

### Request

No body or query parameters.

### Response

```json
{
  "connections": [
    {
      "id": "conn_abc123",
      "app": "gmail",
      "appName": "Gmail",
      "status": "ACTIVE",
      "connectedAt": "2025-03-01T08:00:00Z"
    },
    {
      "id": "conn_def456",
      "app": "googlecalendar",
      "appName": "Google Calendar",
      "status": "ACTIVE",
      "connectedAt": "2025-03-01T08:01:00Z"
    }
  ]
}
```

| Field | Type | Description |
|---|---|---|
| `connections` | `array` | List of active connections. Empty array if none. |
| `connections[].id` | `string` | Composio connection ID. |
| `connections[].app` | `string` | Lowercase app slug (e.g., `"gmail"`, `"slack"`). |
| `connections[].appName` | `string` | Human-readable display name. |
| `connections[].status` | `string` | Always `"ACTIVE"` (only active connections are returned). |
| `connections[].connectedAt` | `string \| null` | ISO 8601 timestamp when the connection was created. |

### Errors

| Status | Cause |
|---|---|
| `401` | Missing or invalid JWT |
| `500` | Composio client not initialized or unexpected error |

---

## GET /api/chat/suggestions/{user_id}

Return dynamic suggestion chips based on the user's connected apps. Used by the chat UI to surface relevant quick-action buttons.

### Auth Required

Yes

### Consumes Quota

No

### Path Parameters

| Parameter | Type | Description |
|---|---|---|
| `user_id` | `string` (UUID) | The user's ID. Must match the authenticated user's ID; otherwise fallback suggestions are returned. |

### Response

```json
{
  "suggestions": [
    {
      "label": "Check emails",
      "message": "What emails need my attention today?"
    },
    {
      "label": "Today's schedule",
      "message": "What's on my calendar today?"
    }
  ]
}
```

| Field | Type | Description |
|---|---|---|
| `suggestions` | `array` | Up to 4 suggestion chips. Falls back to 3 generic suggestions if no apps are connected or on any error. |
| `suggestions[].label` | `string` | Short display label for the chip button. |
| `suggestions[].message` | `string` | Full message to send when the chip is tapped. |

**Fallback suggestions** (returned when no apps are connected or `user_id` does not match the token):

```json
[
  {"label": "Summarize my emails for today", "message": "Summarize my emails for today"},
  {"label": "What's on my calendar for tomorrow", "message": "What's on my calendar for tomorrow"},
  {"label": "Catch me up on latest messages on Slack", "message": "Catch me up on latest messages on Slack"}
]
```

### Errors

This endpoint does not return HTTP errors — any failure falls back to the generic suggestions above.

| Status | Cause |
|---|---|
| `401` | Missing or invalid JWT |
