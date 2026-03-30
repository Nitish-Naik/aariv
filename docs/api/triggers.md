# Triggers API

Manage Composio trigger subscriptions for connected apps. Triggers fire webhooks that feed the CalmPilot briefing pipeline. All endpoints require a valid Firebase JWT in the `Authorization: Bearer <token>` header.

---

## Tier Limits

| Plan    | Max active triggers | Grace period |
|---------|---------------------|--------------|
| Free    | 3                   | 3 days (full access after signup) |
| Starter | Unlimited           | — |
| Pro     | Unlimited           | — |

During the 3-day grace period, free users bypass the 3-trigger cap. After the grace period, attempts to create or enable a 4th trigger return `402`.

---

## GET /api/triggers/trigger-apps

Return only the user's connected apps that have at least one trigger type available.

**Auth Required:** Yes

**Query Parameters:** None

**Response `200`**

```json
{
  "apps": [
    {
      "id": "conn_abc123",
      "appName": "gmail",
      "displayName": "Gmail",
      "logo": "https://cdn.composio.dev/logos/gmail.png",
      "status": "ACTIVE"
    },
    {
      "id": "conn_def456",
      "appName": "googlecalendar",
      "displayName": "Googlecalendar",
      "logo": "https://cdn.composio.dev/logos/googlecalendar.png",
      "status": "ACTIVE"
    }
  ]
}
```

**Notes:**
- Intersects the user's active Composio connections with the cached set of apps that have at least one trigger type.
- The trigger-capable-apps set and toolkit logo lookup are both cached for 1 hour.
- User connections are cached for 60 seconds; invalidated on connect/disconnect.
- Apps in `SKIP_APPS` (`googlesuper`, `agent_mail`) are always excluded.

**Errors:**

| Code | Description |
|------|-------------|
| 401  | Missing or invalid JWT |
| 500  | Composio not initialized or unexpected error |

---

## GET /api/triggers/available

List all trigger types available for a given app.

**Auth Required:** Yes

**Query Parameters**

| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| appName   | string | Yes      | App slug (e.g. `"gmail"`, `"slack"`) |

**Response `200`**

```json
{
  "triggers": [
    {
      "slug": "GMAIL_NEW_GMAIL_MESSAGE",
      "displayName": "New Gmail Message",
      "description": "Fires when a new email arrives in Gmail.",
      "type": "poll",
      "instructions": "",
      "config": {
        "properties": {
          "userId": { "type": "string", "default": "me" },
          "interval": { "type": "integer", "default": 1 },
          "labelIds": { "type": "string", "default": "INBOX" }
        },
        "required": []
      },
      "payload": {},
      "toolkit": "gmail",
      "toolkitName": "Gmail",
      "toolkitLogo": "https://cdn.composio.dev/logos/gmail.png"
    }
  ]
}
```

**Notes:**
- Fetches up to 500 trigger types for the given app directly from Composio (not cached at this layer).
- `type` is `"webhook"` or `"poll"`.
- `config.required` lists fields the user must supply before the trigger can be created.

**Errors:**

| Code | Description |
|------|-------------|
| 401  | Missing or invalid JWT |
| 500  | Composio not initialized or unexpected error |

---

## GET /api/triggers/config

Get the full configuration schema for a specific trigger type.

**Auth Required:** Yes

**Query Parameters**

| Parameter   | Type   | Required | Description |
|-------------|--------|----------|-------------|
| triggerName | string | Yes      | Trigger slug (e.g. `"GMAIL_NEW_GMAIL_MESSAGE"`) |

**Response `200`**

```json
{
  "slug": "GMAIL_NEW_GMAIL_MESSAGE",
  "displayName": "New Gmail Message",
  "description": "Fires when a new email arrives in Gmail.",
  "type": "poll",
  "instructions": "",
  "config": {
    "properties": {
      "userId": { "type": "string", "default": "me" },
      "interval": { "type": "integer", "default": 1 },
      "labelIds": { "type": "string", "default": "INBOX" }
    },
    "required": []
  },
  "payload": {
    "properties": {
      "messageId": { "type": "string" },
      "subject": { "type": "string" },
      "from": { "type": "string" },
      "body": { "type": "string" }
    }
  },
  "toolkit": "gmail",
  "toolkitName": "Gmail",
  "toolkitLogo": "https://cdn.composio.dev/logos/gmail.png"
}
```

**Notes:**
- Returns a single trigger type object (same schema as items in `/api/triggers/available`).
- Use this endpoint to render a dynamic config form before calling `POST /api/triggers/create`.

**Errors:**

| Code | Description |
|------|-------------|
| 401  | Missing or invalid JWT |
| 500  | Composio not initialized, trigger slug not found, or unexpected error |

---

## GET /api/triggers

List all triggers the authenticated user has set up, ordered newest first.

**Auth Required:** Yes

**Query Parameters:** None

**Response `200`**

```json
{
  "triggers": [
    {
      "id": "tri_abc123",
      "user_id": "user_abc123",
      "connected_account_id": "conn_abc123",
      "toolkit": "gmail",
      "trigger_slug": "GMAIL_NEW_GMAIL_MESSAGE",
      "trigger_name": "GMAIL_NEW_GMAIL_MESSAGE",
      "trigger_config": { "userId": "me", "interval": 1, "labelIds": "INBOX" },
      "is_enabled": true,
      "is_auto": true,
      "event_count": 42,
      "error_count": 0,
      "created_at": "2024-01-15T10:30:00Z",
      "disabled_at": null
    }
  ]
}
```

**Notes:**
- Data is read from the `triggers` Supabase table (not live from Composio).
- Returns an empty array if Supabase is unavailable.

**Errors:**

| Code | Description |
|------|-------------|
| 401  | Missing or invalid JWT |
| 500  | Unexpected database error |

---

## POST /api/triggers/create

Create a new trigger instance for the user's connected account. Persisted to both Composio and the `triggers` Supabase table.

**Auth Required:** Yes

**Request Body**

```json
{
  "userId": "user_abc123",
  "connectedAccountId": "conn_abc123",
  "triggerName": "GMAIL_NEW_GMAIL_MESSAGE",
  "toolkit": "gmail",
  "config": {
    "userId": "me",
    "interval": 1,
    "labelIds": "INBOX"
  }
}
```

| Field              | Type   | Required | Description |
|--------------------|--------|----------|-------------|
| userId             | string | Yes      | Must match the authenticated user's ID |
| connectedAccountId | string | Yes      | Composio connected account ID for the app |
| triggerName        | string | Yes      | Trigger type slug (e.g. `"GMAIL_NEW_GMAIL_MESSAGE"`) |
| toolkit            | string | Yes      | App slug (e.g. `"gmail"`) |
| config             | object | No       | Trigger configuration values. String values are auto-coerced to match the schema's expected types (integer, boolean, etc.) |

**Response `200`**

```json
{
  "status": "success",
  "triggerId": "tri_abc123",
  "triggerName": "GMAIL_NEW_GMAIL_MESSAGE"
}
```

**Notes:**
- Composio's `triggers.create()` is idempotent — creating the same trigger twice returns the same instance.
- Free tier users are blocked after 3 active triggers (unless in the 3-day grace period).
- Config string values are coerced to the schema's declared types before being sent to Composio.

**Errors:**

| Code | Description |
|------|-------------|
| 401  | Missing or invalid JWT |
| 403  | `userId` does not match the authenticated user, or free tier limit reached |
| 500  | Composio not initialized or unexpected error |

---

## POST /api/triggers/enable

Re-enable a previously disabled (paused) trigger.

**Auth Required:** Yes

**Request Body**

```json
{
  "triggerId": "tri_abc123"
}
```

| Field     | Type   | Required | Description |
|-----------|--------|----------|-------------|
| triggerId | string | Yes      | ID of the trigger to enable |

**Response `200`**

```json
{
  "status": "enabled",
  "triggerId": "tri_abc123"
}
```

**Notes:**
- Ownership is verified against the `triggers` table before calling Composio.
- Free tier users (outside the grace period) are blocked if they already have 3 active triggers. Returns `402` with a structured error body.
- `disabled_at` is set to `null` in Supabase on success.

**Errors:**

| Code | Description |
|------|-------------|
| 401  | Missing or invalid JWT |
| 402  | Free tier trigger limit reached (`TRIGGER_LIMIT` error code) |
| 403  | Trigger does not belong to the authenticated user |
| 500  | Composio not initialized or unexpected error |

**`402` error body**

```json
{
  "detail": {
    "error": "Upgrade Required",
    "code": "TRIGGER_LIMIT",
    "message": "Free plan allows 3 active triggers. Upgrade to Starter for unlimited.",
    "active": 3,
    "limit": 3
  }
}
```

---

## POST /api/triggers/disable

Pause a trigger without deleting it. The trigger remains in the `triggers` table with `is_enabled: false`.

**Auth Required:** Yes

**Request Body**

```json
{
  "triggerId": "tri_abc123"
}
```

| Field     | Type   | Required | Description |
|-----------|--------|----------|-------------|
| triggerId | string | Yes      | ID of the trigger to pause |

**Response `200`**

```json
{
  "status": "disabled",
  "triggerId": "tri_abc123"
}
```

**Notes:**
- Ownership is verified against the `triggers` table before calling Composio.
- `disabled_at` is set to the current UTC timestamp in Supabase.

**Errors:**

| Code | Description |
|------|-------------|
| 401  | Missing or invalid JWT |
| 403  | Trigger does not belong to the authenticated user |
| 500  | Composio not initialized or unexpected error |

---

## POST /api/triggers/delete

Permanently delete a trigger from both Composio and the `triggers` Supabase table.

**Auth Required:** Yes

**Request Body**

```json
{
  "triggerId": "tri_abc123"
}
```

| Field     | Type   | Required | Description |
|-----------|--------|----------|-------------|
| triggerId | string | Yes      | ID of the trigger to delete |

**Response `200`**

```json
{
  "status": "deleted",
  "triggerId": "tri_abc123"
}
```

**Notes:**
- Ownership is verified against the `triggers` table before calling Composio.
- This action is irreversible. Use `POST /api/triggers/disable` to pause instead.

**Errors:**

| Code | Description |
|------|-------------|
| 401  | Missing or invalid JWT |
| 403  | Trigger does not belong to the authenticated user |
| 500  | Composio not initialized or unexpected error |

---

## POST /api/triggers/auto-setup

Auto-create default triggers for a newly connected app. Called by the frontend after a successful OAuth flow as a convenience; the OAuth callback also triggers this automatically in the background.

**Auth Required:** Yes

**Request Body**

```json
{
  "userId": "user_abc123",
  "appName": "gmail"
}
```

| Field   | Type   | Required | Description |
|---------|--------|----------|-------------|
| userId  | string | Yes      | Must match the authenticated user's ID |
| appName | string | Yes      | App slug (e.g. `"gmail"`) |

**Response `200`**

```json
{
  "created": ["GMAIL_NEW_GMAIL_MESSAGE"],
  "paused": [],
  "skipped": [],
  "app": "gmail"
}
```

| Field   | Description |
|---------|-------------|
| created | Trigger slugs that were newly created and are active |
| paused  | Trigger slugs created but immediately disabled (free tier cap exceeded) |
| skipped | Trigger slugs that already existed or failed to create |
| app     | Normalized app slug that was processed |

**Notes:**
- Uses the universal auto-subscribe system: prefers `PREFERRED_TRIGGERS` curated defaults for known apps; falls back to dynamically discovering all trigger types with no required config fields.
- Composio's `triggers.create()` is idempotent — safe to call multiple times.
- Triggers that already exist in Supabase for this user and app are skipped without error.
- Free tier: first 3 triggers are created active; beyond that they are created in a disabled state.
- If no connected account is found for the app, returns an error note in the response (no HTTP error code).

**Errors:**

| Code | Description |
|------|-------------|
| 401  | Missing or invalid JWT |
| 403  | `userId` does not match the authenticated user |
| 500  | Composio not initialized or unexpected error |

---

## POST /api/triggers/re-setup-all

Delete all auto-created (`is_auto: true`) triggers for the user and re-create them using the latest slug/config definitions. Manual (user-created) triggers are untouched.

**Auth Required:** Yes

**Request Body**

```json
{}
```

(Empty body accepted.)

**Response `200`**

```json
{
  "results": {
    "gmail": {
      "created": ["GMAIL_NEW_GMAIL_MESSAGE"],
      "paused": [],
      "skipped": [],
      "app": "gmail"
    },
    "googlecalendar": {
      "created": [
        "GOOGLECALENDAR_GOOGLE_CALENDAR_EVENT_UPDATED_TRIGGER",
        "GOOGLECALENDAR_EVENT_STARTING_SOON_TRIGGER"
      ],
      "paused": [],
      "skipped": [],
      "app": "googlecalendar"
    }
  }
}
```

**Notes:**
- Intended for use after a slug correction deployment, not for routine use.
- Deletes triggers from both Composio and Supabase before re-creating them. Composio deletion errors are silently ignored (trigger may already be gone).
- Runs `auto_setup_triggers` for every connected app, excluding `SKIP_APPS` (`googlesuper`, `agent_mail`).

**Errors:**

| Code | Description |
|------|-------------|
| 401  | Missing or invalid JWT |
| 500  | Composio not initialized or unexpected error |

---

## GET /api/triggers/events

List recent trigger events for the authenticated user, ordered newest first.

**Auth Required:** Yes

**Query Parameters**

| Parameter | Type    | Required | Description |
|-----------|---------|----------|-------------|
| triggerId | string  | No       | Filter to a specific trigger ID |
| limit     | integer | No       | Number of events to return. Min 1, max 100. Default `20` |

**Response `200`**

```json
{
  "events": [
    {
      "id": "evt_abc123",
      "trigger_id": "tri_abc123",
      "event_type": "GMAIL_NEW_GMAIL_MESSAGE",
      "trigger_slug": "GMAIL_NEW_GMAIL_MESSAGE",
      "status": "processed",
      "error": null,
      "processing_time_ms": 142,
      "created_at": "2024-01-15T10:35:00Z"
    }
  ]
}
```

**Notes:**
- Data is read from the `trigger_events` Supabase table.
- Returns an empty array if Supabase is unavailable.
- Payload data is not included in this response to keep it lightweight; fetch the full event from the database if needed.

**Errors:**

| Code | Description |
|------|-------------|
| 401  | Missing or invalid JWT |
| 500  | Unexpected database error |

---

## GET /api/triggers/stats

Return aggregate trigger statistics for the authenticated user.

**Auth Required:** Yes

**Query Parameters:** None

**Response `200`**

```json
{
  "total": 5,
  "active": 3,
  "paused": 2,
  "totalEvents": 218,
  "totalErrors": 4
}
```

| Field       | Description |
|-------------|-------------|
| total       | Total number of triggers (active + paused) |
| active      | Triggers with `is_enabled: true` |
| paused      | Triggers with `is_enabled: false` |
| totalEvents | Sum of `event_count` across all triggers |
| totalErrors | Sum of `error_count` across all triggers |

**Notes:**
- Data is aggregated from the `triggers` Supabase table.
- Returns all-zero values if Supabase is unavailable.

**Errors:**

| Code | Description |
|------|-------------|
| 401  | Missing or invalid JWT |
| 500  | Unexpected database error |
