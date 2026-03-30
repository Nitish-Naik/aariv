# Billing and Credits — Low-Level Design

**Files:** `python-agent/routers/billing.py`, `python-agent/routers/chat.py`, `python-agent/supabase/subscription_tier_migration.sql`

Two distinct flows:
1. **Usage** — quota check before each chat request or trigger fire
2. **Subscription** — user purchases a paid plan via DodoPayments; webhook upgrades tier

---

## Flow Diagram

### Flow A: Chat Quota (every chat request)

```
POST /api/chat (request arrives)
          |
          v
_check_and_increment_chat_quota(user_id)   [chat.py:64]
          |
          v
SELECT subscription_tier, chat_messages_used, chat_messages_limit, billing_cycle_start
FROM user_credits WHERE user_id = ?
          |
          v
_maybe_reset_billing_cycle(user_id, data)
    tier == "free":
        needs_reset = (cycle_start.month != today.month OR cycle_start.year != today.year)
    tier != "free":
        needs_reset = (today - cycle_start).days >= 30
    If needs_reset:
        UPDATE user_credits SET chat_messages_used=0, billing_cycle_start=today
          |
          v
used  = data["chat_messages_used"]    (post-reset if applicable)
limit = data["chat_messages_limit"]
          |
          +-- used < limit? ---YES---> UPDATE user_credits SET chat_messages_used = used + 1
          |                             Return {"ok": True, "tier": str}
          |
          +-- used >= limit? ---------> Return {"ok": False, "used": int, "limit": int, "tier": str}
                                         chat_endpoint emits SSE:
                                         {type: "chat_quota_exceeded",
                                          data: {used, limit, reason: "quota_exceeded"}}
                                         StreamingResponse ends immediately
```

### Flow B: Trigger Fire Quota (every trigger summary)

```
_trigger_background_summary(user_id, ...)
          |
          v
supabase_admin.rpc("try_increment_trigger_fire", {
    "p_user_id": user_id,
    "p_free_limit": FREE_TIER_FIRES_LIMIT  (= 10)
})
          |
          +-- Returns TRUE  -------> proceed to AI summarization
          |
          +-- Returns FALSE -------> LOG "[fires] Free tier daily limit reached for {user_id}"
                                      _update_event_statuses(event_db_ids, "failed",
                                          error="Free tier daily limit reached")
                                      RETURN (no AI call, no SSE push)

[Postgres try_increment_trigger_fire procedure:]
    UPDATE user_credits
        SET trigger_fires_today=0, trigger_fires_reset_at=CURRENT_DATE
    WHERE user_id = p_user_id AND trigger_fires_reset_at < CURRENT_DATE;

    SELECT subscription_tier, trigger_fires_today
    INTO v_tier, v_fires
    FROM user_credits WHERE user_id = p_user_id FOR UPDATE;

    IF v_tier != 'free' THEN
        UPDATE trigger_fires_today = v_fires + 1;
        RETURN TRUE;                      -- paid: unlimited
    END IF;

    IF v_fires >= p_free_limit THEN
        RETURN FALSE;                     -- free cap reached
    END IF;

    UPDATE trigger_fires_today = v_fires + 1;
    RETURN TRUE;
```

### Flow C: Subscription Upgrade

```
[User clicks "Upgrade to Starter/Pro" on dashboard]
          |
          v
POST /api/billing/subscribe
    Body: SubscribeRequest {plan: "starter" | "pro"}
    Auth: JWT; rate-limited 5/hour
          |
          v
[Validate plan in ("starter", "pro")]
    400 if invalid
          |
          v
[Double-subscription check]
    SELECT subscription_tier, dodo_subscription_id FROM user_credits WHERE user_id=?
    If dodo_subscription_id present AND tier != "free":
        If current_tier == body.plan: 400 "You're already on the {plan} plan."
        Else: 400 "Please cancel your current {plan} before switching."
          |
          v
[Create DodoPayments checkout session]
    product_id = _DODO_STARTER_PRODUCT_ID or _DODO_PRO_PRODUCT_ID  (env vars)
    client = DodoPayments(bearer_token=DODO_API_KEY, environment=DODO_ENV)
    session = client.checkout_sessions.create(
        product_cart=[{product_id, quantity: 1}],
        customer={email, name: email.split("@")[0]},
        return_url="{WEB_APP_URL}/dashboard?subscribed={plan}",
        metadata={user_id, plan}            <-- critical for webhook routing
    )
    return {"checkout_url": session.checkout_url}
          |
          v
[User pays in DodoPayments hosted page]
          |
          v
[DodoPayments sends webhook to POST /api/billing/webhook]
    event.type == "subscription.active" | "payment.succeeded":
        user_id = event.metadata["user_id"]
        plan    = event.metadata["plan"]
        sub_id  = event.subscription_id
        await activate_subscription(user_id, plan, sub_id)
    event.type == "subscription.cancelled" | "subscription.expired":
        await deactivate_subscription(user_id, sub_id)
          |
          v
activate_subscription(user_id, plan, subscription_id)
    [Idempotency check]
        If dodo_subscription_id == subscription_id AND tier == plan:
            LOG "Duplicate activation skipped"; return
    limits = _TIER_LIMITS[plan]
    UPDATE user_credits SET
        subscription_tier       = plan
        chat_messages_limit     = limits["chat_messages_limit"]
        trigger_fires_limit     = limits["trigger_fires_limit"]
        chat_messages_used      = 0                               (reset on upgrade)
        billing_cycle_start     = today
        dodo_subscription_id    = subscription_id
    [Retroactive trigger setup]
        SELECT app_name FROM composio_entities WHERE user_id=?
        For each app not in SKIP_APPS:
            await auto_setup_triggers(user_id, app)
```

### Flow D: Subscription Cancellation / Expiry

```
[DodoPayments sends webhook: subscription.cancelled or subscription.expired]
          |
          v
deactivate_subscription(user_id, subscription_id)
    [Idempotency check]
        If tier == "free" AND dodo_subscription_id is NULL:
            LOG "Duplicate deactivation skipped"; return
    free_limits = _TIER_LIMITS["free"]  {chat_messages_limit: 50, trigger_fires_limit: 10}
    UPDATE user_credits SET
        subscription_tier       = "free"
        chat_messages_limit     = 50
        trigger_fires_limit     = 10
        dodo_subscription_id    = NULL
    Note: chat_messages_used is NOT reset on downgrade (user keeps what they've used)
```

### Flow E: Balance Query

```
GET /api/billing/balance/{user_id}
    Auth: JWT; userId must match path param
          |
          v
SELECT * FROM user_credits WHERE user_id=?
          |
          v
If tier == "free":
    is_in_grace_period(user_id)
        -> check account age <= GRACE_PERIOD_DAYS
    If in grace: compute grace_period_ends = created_at + GRACE_PERIOD_DAYS
          |
          v
Return {
    subscription_tier, chat_messages_used, chat_messages_limit,
    trigger_fires_today, trigger_fires_limit,
    in_grace_period (free only), grace_period_ends (free + in grace)
}
```

---

## Functions Reference

| Name | File:Line | Purpose | Inputs | Outputs |
|---|---|---|---|---|
| `_check_and_increment_chat_quota` | chat.py:64 | Read quota, reset if new period, increment if under limit | `user_id: str` | `dict {ok, tier, used?, limit?, reason?}` |
| `_maybe_reset_billing_cycle` | chat.py:23 | Lazy monthly reset for free; 30-day rolling for paid | `user_id: str, data: dict` | `dict` (mutated) |
| `check_and_increment_usage` | billing.py:225 | Same quota logic for non-chat AI endpoints | `user_id: str` | `dict {ok, used?, limit?, tier?}` |
| `create_subscription_checkout` | billing.py:44 | Create DodoPayments checkout session, return URL | `request, SubscribeRequest, current_user` | `{checkout_url: str}` |
| `activate_subscription` | billing.py:101 | Idempotent tier upgrade; set limits; retroactive triggers | `user_id, plan, subscription_id: str` | None |
| `deactivate_subscription` | billing.py:142 | Idempotent tier downgrade back to free | `user_id, subscription_id: str` | None |
| `get_balance` | billing.py:170 | Return tier, usage counters, grace period info | `user_id: str, _user: dict` | `dict` |

---

## Tier System

| Tier | chat_messages_limit | trigger_fires_limit | AI model access | Debounce window |
|---|---|---|---|---|
| free | 50 / month | 10 / day | gpt-4.1-mini, gpt-4o | 1800s (30 min) |
| starter | 500 / month | unlimited (-1) | + gpt-4.1 | 30s |
| pro | 2000 / month | unlimited (-1) | + gpt-5.x | 30s |

**Grace period:** New free users get `GRACE_PERIOD_DAYS` of access to paid features (defined in `routers/app_triggers.py`). During grace: `COMPOSIO_MANAGE_CONNECTIONS` is available in chat, and all apps in `ALLOWED_APPS` can be connected.

**Billing period:**
- Free: resets on 1st of each calendar month
- Paid: resets every 30 days from `billing_cycle_start` (set on activation or last reset)

---

## Quota Enforcement — Which Endpoints Check

| Endpoint | Quota function | Blocks on |
|---|---|---|
| `POST /api/chat` | `_check_and_increment_chat_quota` | chat_messages_limit |
| Trigger summaries (background) | `try_increment_trigger_fire` RPC | trigger_fires_limit (free only) |
| Other AI endpoints | `check_and_increment_usage` | chat_messages_limit |

Chat tokens are counted (`total_input_tokens`, `total_output_tokens`) via `ResponseCompletedEvent` for analytics only — no per-token charge is applied.

---

## Stored Procedures

### `try_increment_trigger_fire(p_user_id UUID, p_free_limit INT DEFAULT 10) RETURNS BOOLEAN`

Location: `supabase/subscription_tier_migration.sql`

Atomic check-and-increment with row-level lock (`FOR UPDATE`):
1. Resets `trigger_fires_today = 0` if `trigger_fires_reset_at < CURRENT_DATE` (daily reset)
2. If `subscription_tier != 'free'`: increments and returns `TRUE` (unlimited)
3. If `trigger_fires_today >= p_free_limit`: returns `FALSE` (blocked)
4. Otherwise: increments and returns `TRUE`

### `increment_trigger_fires(p_user_id UUID) RETURNS void`

Non-atomic fallback used when `try_increment_trigger_fire` RPC call fails:
1. Resets counter if date has changed
2. Increments `trigger_fires_today`

### `increment_trigger_event_count(p_trigger_id TEXT) RETURNS void`

Called by `_log_event_to_db` after each trigger event insert. Increments `triggers.event_count` for analytics/dashboard display.

### `reset_daily_trigger_fires() RETURNS void`

Optional scheduled job (pg_cron) as an alternative to the lazy reset in `try_increment_trigger_fire`. Resets all `trigger_fires_today = 0` rows where `trigger_fires_reset_at < CURRENT_DATE`. Not required — the lazy reset in the RPC handles it on the next fire.

---

## user_credits Table (Billing Columns)

| Column | Type | Default | Notes |
|---|---|---|---|
| user_id | UUID PK | — | FK to auth.users |
| subscription_tier | TEXT | 'free' | "free" / "starter" / "pro" |
| chat_messages_used | INTEGER | 0 | Incremented per chat request |
| chat_messages_limit | INTEGER | 50 | 50 / 500 / 2000 by tier |
| trigger_fires_today | INTEGER | 0 | Reset daily by RPC |
| trigger_fires_limit | INTEGER | 10 | 10 (free) / -1 unlimited (paid) |
| trigger_fires_reset_at | DATE | CURRENT_DATE | Date of last daily reset |
| billing_cycle_start | DATE | NULL | Set on activation or reset |
| dodo_subscription_id | TEXT | NULL | NULL for free users |
| created_at | TIMESTAMPTZ | NOW() | Used for grace period calculation |

---

## Error Handling

| Stage | Error | Handling |
|---|---|---|
| Quota check: supabase_admin is None | DB client not initialized | Returns `{ok: False, reason: "service_unavailable"}` — request blocked (fail-closed) |
| Quota check: DB query exception | Any Supabase error | Caught; returns `{ok: False, reason: "service_unavailable"}` — blocked |
| Quota check: user_credits row missing | New user before row is created | Returns empty dict `{}`; defaults to 50 limit; first 50 requests allowed |
| Billing cycle reset: invalid date | Malformed billing_cycle_start | Defaults to today; treats as no reset needed |
| `try_increment_trigger_fire` RPC fails | DB error / connection timeout | Falls back to non-atomic `_get_tier_and_fires()` + `_increment_trigger_fires()`; if free tier over limit, blocks |
| Checkout: DODO_API_KEY or product_id empty | Env var not set | HTTPException(500) "Subscription product not configured" |
| Checkout: DodoPayments API error | External API failure | Caught; HTTPException(500) "Failed to create subscription checkout" |
| `activate_subscription`: supabase_admin None | DB unavailable | Raises `RuntimeError` — caller must handle |
| `activate_subscription` duplicate webhook | Same subscription_id + tier already set | Idempotency check logs and returns without DB write |
| `activate_subscription` retroactive triggers | `auto_setup_triggers` fails | Warning logged; subscription activation completes regardless |
| `deactivate_subscription` duplicate webhook | User already free with no sub_id | Idempotency check logs and returns |
| `get_balance` row missing | No user_credits row yet | Returns defaults: free tier, 0 used, 50 limit |

---

## Key Decisions

**Fail-closed on quota check DB errors**
If the Supabase quota check throws any exception, the request is blocked rather than allowed through. Fail-open would allow unlimited requests during a DB outage. Given that quota checks are simple single-row reads, failures are rare and the fail-closed cost (blocked request) is lower than the financial risk.

**Lazy billing cycle reset (no cron)**
Reset happens on the next request after a billing period ends, not on a schedule. This avoids a background worker. Trade-off: a user who sends a message at midnight may find their counter resets on that very request, not the next one — a single-message tolerance.

**Atomic try_increment_trigger_fire RPC**
Trigger fires can arrive concurrently for the same user. A Python-side read-modify-write would have a race condition where two concurrent fires both read `fires_today=9` (under the limit of 10) and both proceed. The Postgres RPC uses `FOR UPDATE` row-level locking, making the check-and-increment atomic. The non-atomic Python fallback is used only when the RPC itself fails (e.g., connection timeout).

**DodoPayments over Stripe**
DodoPayments handles international VAT/GST collection and remittance automatically. Stripe requires separate Stripe Tax configuration for this, adding setup overhead for an early-stage SaaS.

**Retroactive trigger setup on upgrade**
A free user who upgrades may already have apps connected from the grace period. Without retroactive setup, those apps would have no triggers on the paid tier. `activate_subscription` reads all `composio_entities` entries and calls `auto_setup_triggers` for each app immediately on payment.

**trigger_fires_limit = -1 for paid tiers**
Sentinel value for "unlimited". The RPC checks `subscription_tier != 'free'` rather than comparing the limit numerically, so -1 is never used in arithmetic. Makes the unlimited intent explicit in the data.

**user_id threaded through DodoPayments metadata**
The checkout session includes `metadata: {user_id, plan}`. When DodoPayments fires the subscription webhook, this metadata is returned with the event. This allows the webhook handler to route the activation to the correct user without maintaining any server-side state between checkout creation and webhook receipt.
