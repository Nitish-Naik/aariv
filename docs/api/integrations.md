# Integrations API

Manage third-party app connections via Composio OAuth. All endpoints require a valid Firebase JWT in the `Authorization: Bearer <token>` header unless marked **Public**.

---

## GET /api/integrations/categories

List all available toolkit categories (e.g. "Communication", "Productivity").

**Auth Required:** Yes

**Query Parameters:** None

**Response `200`**

```json
{
  "categories": [
    { "id": "communication", "name": "Communication" },
    { "id": "productivity", "name": "Productivity" }
  ]
}
```

**Notes:**
- Response is cached server-side for 1 hour.

**Errors:**

| Code | Description |
|------|-------------|
| 401  | Missing or invalid JWT |
| 500  | Composio not initialized |

---

## GET /api/integrations

List all available integrations in the curated whitelist with the current user's connection status.

**Auth Required:** Yes

**Query Parameters:** None

**Response `200`**

```json
{
  "integrations": [
    {
      "id": "conn_abc123",
      "appName": "gmail",
      "label": "Gmail",
      "description": "Connect your Gmail account.",
      "logo": "https://logos.composio.dev/api/gmail",
      "status": "connected",
      "connectedAt": "2024-01-15T10:30:00Z",
      "isPro": false,
      "canDisconnect": true,
      "categories": [
        { "id": "communication", "name": "Communication" }
      ]
    },
    {
      "id": "slack",
      "appName": "slack",
      "label": "Slack",
      "description": "Connect your Slack account.",
      "logo": "https://logos.composio.dev/api/slack",
      "status": "disconnected",
      "connectedAt": null,
      "isPro": false,
      "canDisconnect": true,
      "categories": [
        { "id": "communication", "name": "Communication" }
      ]
    }
  ]
}
```

**Notes:**
- Only apps in the server-side `ALLOWED_APPS` whitelist are returned. At launch this is `gmail`, `googlecalendar`, and `slack`.
- Toolkit list is cached server-side for 1 hour; connection status is fetched live from Composio.
- After listing, a background task checks whether any connected app is missing triggers and auto-creates them (rate-limited to once per 60 seconds per user).
- `status` is `"connected"` if the user has an `ACTIVE` Composio connection, or if the app requires no auth (`no_auth: true`).
- `canDisconnect` is `false` for no-auth apps.

**Errors:**

| Code | Description |
|------|-------------|
| 401  | Missing or invalid JWT |
| 500  | Composio not initialized or unexpected error |

---

## POST /api/integrations/connect

Initiate an OAuth connection for a supported app. Returns a redirect URL the client must open in a browser or WebView.

**Auth Required:** Yes

**Request Body**

```json
{
  "userId": "user_abc123",
  "appName": "gmail",
  "platform": "web"
}
```

| Field    | Type   | Required | Description |
|----------|--------|----------|-------------|
| userId   | string | Yes      | Must match the authenticated user's ID |
| appName  | string | Yes      | App slug (e.g. `"gmail"`, `"slack"`). Must be in the allowed list |
| platform | string | No       | `"web"` (default: `"mobile"`). Controls the OAuth callback redirect behaviour |

**Response `200`**

```json
{
  "url": "https://connect.composio.dev/oauth/gmail?session=xyz..."
}
```

The client must redirect the user to `url` to complete the OAuth flow. After authorization, Composio redirects to `GET /api/callback`.

**Errors:**

| Code | Description |
|------|-------------|
| 400  | `appName` is not in the allowed integration list |
| 401  | Missing or invalid JWT |
| 403  | `userId` in the body does not match the authenticated user |
| 500  | Failed to generate a redirect URL from Composio |

---

## POST /api/integrations/disconnect

Disconnect an existing integration. Also deletes any orphaned Composio triggers that belong to the disconnected app.

**Auth Required:** Yes

**Request Body**

```json
{
  "userId": "user_abc123",
  "connectionId": "conn_abc123",
  "appName": "gmail"
}
```

| Field        | Type   | Required | Description |
|--------------|--------|----------|-------------|
| userId       | string | Yes      | Must match the authenticated user's ID |
| connectionId | string | Yes      | Composio connected account ID to delete |
| appName      | string | No       | App slug. Used to find and clean up orphaned triggers |

**Response `200`**

```json
{
  "status": "success",
  "message": "Disconnected successfully"
}
```

**Notes:**
- Triggers whose `trigger_slug` starts with the disconnected app name are deleted from both Composio and the `triggers` Supabase table.
- The per-user connection cache is invalidated immediately.

**Errors:**

| Code | Description |
|------|-------------|
| 401  | Missing or invalid JWT |
| 403  | `userId` in the body does not match the authenticated user |
| 500  | Composio not initialized or unexpected error |

---

## GET /api/callback

OAuth redirect callback. This is the URL Composio redirects to after the user completes (or cancels) an OAuth flow.

**Auth Required:** No (public endpoint)

**Query Parameters**

| Parameter          | Description |
|--------------------|-------------|
| status             | `"success"` \| `"ACTIVE"` \| `"failure"` \| `"cancelled"` |
| connectedAccountId | Composio connected account ID (also accepted as `connected_account_id`) |
| appName            | App slug (also accepted as `app_name`) |
| platform           | `"web"` \| `"mobile"` (default: `"web"`) |

**Behaviour by platform:**

- **web** — Returns `HTTP 302` redirect to `{WEB_APP_URL}/dashboard/integrations?status=<status>&app=<appName>`.
- **mobile** — Returns an `HTML 200` page with a `meta refresh` and a button that deep-links back to the app using scheme `{DEEP_LINK_SCHEME}://?status=...&connectedAccountId=...&appName=...`.

**Background task (on success):**

When `status` is `"success"` or `"ACTIVE"` and both `connectedAccountId` and `appName` are present, a background task is enqueued that:

1. Resolves `user_id` from the connected account (with 3-attempt exponential backoff).
2. Upserts an entity mapping row to `composio_entities`.
3. Invalidates the per-user connection cache.
4. Calls `auto_setup_triggers` to create default triggers for the app.
5. If any triggers were created, bootstraps an initial briefing (`bootstrap_first_briefing`).

The background task does **not** block the redirect response.

**Errors:**

This endpoint does not return JSON errors. Invalid or unknown query parameter values are silently sanitized (empty string fallback).

---

## GET /api/toolkits

List all available apps (from the curated whitelist) with the specified user's connection status. This is a legacy endpoint that mirrors `/api/integrations` but uses a different response shape.

**Auth Required:** Yes

**Query Parameters**

| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| userId    | string | Yes      | Min length 3. Must match the authenticated user's ID |

**Response `200`**

```json
{
  "toolkits": [
    {
      "id": "conn_abc123",
      "name": "Gmail",
      "description": "Connect your Gmail account.",
      "category": "Communication",
      "icon": "apps",
      "logo": "https://cdn.composio.dev/logos/gmail.png",
      "connected": true,
      "connectedAt": "2024-01-15T10:30:00Z",
      "isPro": false,
      "appUniqueId": "gmail"
    }
  ]
}
```

**Notes:**
- `isPro` is `false` for `gmail` and `googlecalendar` (the free apps); `true` for all others.
- Toolkit list is fetched live from Composio; connection list is fetched live and filtered to `ACTIVE` status.

**Errors:**

| Code | Description |
|------|-------------|
| 401  | Missing or invalid JWT |
| 403  | `userId` does not match the authenticated user |
| 500  | Composio not initialized or unexpected error |

---

## GET /api/toolkits/bundles

Return the list of curated toolkit bundles (static, no Composio call).

**Auth Required:** Yes

**Query Parameters:** None

**Response `200`**

```json
{
  "bundles": [
    {
      "id": "bundle_startup",
      "title": "Founder Stack",
      "description": "Essential tools for running a modern startup.",
      "toolkitIds": ["1", "2", "11"],
      "savings": "Setup in 1 click",
      "icon": "rocket"
    },
    {
      "id": "bundle_dev",
      "title": "Code & Ship",
      "description": "Full development lifecycle automation.",
      "toolkitIds": ["6", "3"],
      "savings": "Automate CI/CD",
      "icon": "code-slash"
    }
  ]
}
```

**Notes:**
- Bundles are static and hardcoded server-side. `toolkitIds` reference toolkit IDs from `GET /api/toolkits`.

**Errors:**

| Code | Description |
|------|-------------|
| 401  | Missing or invalid JWT |
