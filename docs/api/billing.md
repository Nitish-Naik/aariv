# Billing API

Base path: `/api/billing`

Billing is powered by **DodoPayments**. All endpoints require a valid Supabase JWT in the `Authorization: Bearer <token>` header.

Rate limits: `POST /subscribe` is limited to **5 requests per hour** per user.

---

## Tier Comparison

| Feature | Free | Starter | Pro |
|---|---|---|---|
| Chat messages / month | 50 | 500 | 2,000 |
| Trigger fires / day | 10 | Unlimited (−1) | Unlimited (−1) |
| AI model access | gpt-4o, gpt-4o-mini | + gpt-4.1, gpt-4.1-mini | + gpt-5, gpt-5.4 |
| Retroactive trigger setup | No | Yes (on upgrade) | Yes (on upgrade) |

Free users get a grace period at signup during which triggers fire without counting against the daily limit. Quotas reset monthly (calendar month for Free, 30-day rolling for paid tiers).

---

## Endpoints

### POST /api/billing/subscribe

Create a DodoPayments checkout session for the Starter or Pro plan. Returns a redirect URL; the client navigates the user there to complete payment. On success, DodoPayments calls the `/webhook/dodo` endpoint to activate the subscription automatically.

**Auth required:** Yes

**Request body**

```json
{
  "plan": "starter"
}
```

| Field | Type | Required | Values |
|---|---|---|---|
| `plan` | string | Yes | `"starter"` or `"pro"` |

**Success response — 200**

```json
{
  "checkout_url": "https://pay.dodopayments.com/checkout/sess_abc123"
}
```

**Error responses**

| Status | Condition |
|---|---|
| 400 | `plan` is not `starter` or `pro` |
| 400 | User already has an active subscription on the requested plan |
| 400 | User has an active subscription on a different plan (must cancel first) |
| 500 | DodoPayments product not configured (`DODO_STARTER_PRODUCT_ID` / `DODO_PRO_PRODUCT_ID` env vars missing) |
| 500 | DodoPayments checkout session creation failed |
| 429 | Rate limit exceeded (5/hour) |

---

### GET /api/billing/balance/{user_id}

Return the authenticated user's current plan, message usage, and trigger quota. The caller must be the same user as `{user_id}` — accessing another user's balance returns 403.

**Auth required:** Yes

**Path parameter**

| Parameter | Description |
|---|---|
| `user_id` | Supabase UUID of the authenticated user |

**Success response — 200**

```json
{
  "subscription_tier": "starter",
  "chat_messages_used": 47,
  "chat_messages_limit": 500,
  "trigger_fires_today": 3,
  "trigger_fires_limit": -1
}
```

For Free-tier users who are still within the grace period, two additional fields are included:

```json
{
  "subscription_tier": "free",
  "chat_messages_used": 12,
  "chat_messages_limit": 50,
  "trigger_fires_today": 0,
  "trigger_fires_limit": 10,
  "in_grace_period": true,
  "grace_period_ends": "2025-04-15T00:00:00+00:00"
}
```

**Response fields**

| Field | Type | Description |
|---|---|---|
| `subscription_tier` | string | `"free"`, `"starter"`, or `"pro"` |
| `chat_messages_used` | integer | Messages consumed this billing cycle |
| `chat_messages_limit` | integer | Monthly cap for this tier |
| `trigger_fires_today` | integer | Trigger events processed today |
| `trigger_fires_limit` | integer | Daily cap; `-1` means unlimited |
| `in_grace_period` | boolean | Only present for free-tier users |
| `grace_period_ends` | string (ISO 8601) | Only present when `in_grace_period` is `true` |

**Error responses**

| Status | Condition |
|---|---|
| 403 | Authenticated user does not match `{user_id}` |
| 500 | Supabase not configured or query failed |

---

## Subscription Lifecycle (Internal)

These functions are not HTTP endpoints — they are called internally from the DodoPayments webhook handler (`/webhook/dodo`).

- **`activate_subscription(user_id, plan, subscription_id)`** — Upgrades the user's tier in `user_credits`, resets usage counters, stores the DodoPayments subscription ID, and retroactively sets up Composio triggers for any apps the user connected while on the free tier.
- **`deactivate_subscription(user_id, subscription_id)`** — Reverts the user to the free tier and clears the subscription ID when a subscription is cancelled or expires.

Both functions are idempotent and safe to call multiple times for the same `subscription_id`.
