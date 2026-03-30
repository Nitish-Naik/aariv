# CalmPilot API Overview

This document describes the conventions, authentication, and error codes that apply to all CalmPilot API endpoints.

---

## Base URL

| Environment | Base URL |
|---|---|
| Production | `https://api.calmpilot.app/api` |
| Local development | `http://localhost:8080/api` |

All paths in the individual endpoint docs are relative to the base URL (e.g., `GET /api/chat/connections` → `https://api.calmpilot.app/api/chat/connections`).

---

## Authentication

Every endpoint requires a valid Supabase JWT issued after sign-in.

**Header format:**

```
Authorization: Bearer <jwt_token>
```

The server validates the token against Supabase Auth and then checks that the corresponding user exists in the `public.profiles` table. Both checks must pass or the request is rejected.

**What causes auth failures:**

- Missing `Authorization` header
- Malformed or expired JWT
- User account deleted from the database

---

## Request Format

All request bodies must be JSON.

```
Content-Type: application/json
```

GET endpoints use query string parameters where applicable (no body).

---

## Response Format

Successful responses return JSON. The shape varies per endpoint (see individual docs), but all follow these conventions:

- Top-level keys are camelCase
- Timestamps are ISO 8601 strings (`2025-03-30T09:00:00Z`)
- Empty collections are `[]`, never `null`

**Example — success:**

```json
{
  "connections": [
    {
      "id": "conn_abc123",
      "app": "gmail",
      "appName": "Gmail",
      "status": "ACTIVE",
      "connectedAt": "2025-03-01T08:00:00Z"
    }
  ]
}
```

**Example — error:**

```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

---

## Rate Limiting

### Chat endpoint (`POST /api/chat`)

A per-user sliding-window rate limit is applied in-memory:

- **Limit:** 20 requests per user per 60-second window
- **Exceeded response:** HTTP `429` with `detail: "Rate limit exceeded. Max 20 requests per minute."`

### Scan endpoint (`POST /api/dashboard/scan`)

- **Limit:** 3 scan calls per user per hour
- **Exceeded response:** HTTP `200` with `{ "status": "rate_limited", "events": 0 }`

All other endpoints have no additional rate limiting beyond authentication.

---

## Quota System

Chat messages and briefing generation count against a per-user monthly quota. Quotas reset monthly (free users reset on the 1st of the calendar month; paid users reset 30 days after their billing cycle start date).

| Tier | Chat messages / month | Briefings |
|---|---|---|
| Free | 50 | First 3 days (grace period) only |
| Starter | 500 | Included |
| Pro | 2000 | Included |

When the quota is reached the chat endpoint returns an SSE event with `type: "chat_quota_exceeded"` rather than an HTTP error (see [chat.md](./chat.md) for the full event shape). The briefing endpoint returns HTTP `402` or `429` as appropriate.

---

## Error Codes

| HTTP Status | Meaning | Example response body |
|---|---|---|
| `401` | Missing, invalid, or expired JWT; or user not found in the database | `{"error": "Unauthorized", "message": "Invalid or expired token"}` |
| `402` | Feature requires a paid subscription | `{"detail": "briefing_requires_paid_plan"}` |
| `403` | Authenticated but not permitted (e.g., userId in body does not match token) | `{"detail": "Forbidden: userId mismatch"}` |
| `404` | Resource not found | `{"detail": "Not Found"}` |
| `429` | Rate limit exceeded | `{"detail": "Rate limit exceeded. Max 20 requests per minute."}` |
| `500` | Unexpected server error | `{"detail": "An unexpected error occurred."}` |
| `503` | Upstream dependency (Supabase, Composio) unavailable | `{"error": "SERVICE_UNAVAILABLE", "message": "Unable to verify user account. Please try again."}` |

---

## Endpoint Index

| Document | Endpoints |
|---|---|
| [chat.md](./chat.md) | `POST /api/chat`, `GET /api/chat/connections`, `GET /api/chat/suggestions/{user_id}` |
| [dashboard.md](./dashboard.md) | `GET /api/dashboard/briefing`, `GET /api/dashboard/calendar`, `GET /api/dashboard/upcoming-meeting`, `GET /api/dashboard/recent-events`, `GET /api/dashboard/feed`, `POST /api/dashboard/scan`, `GET /api/dashboard/app-snapshot/{app_slug}` |
