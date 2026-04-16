# Remaining Implementation Items

Items identified during the production security audit that require manual action, product decisions, or new feature development. Organized by priority.

---

## CRITICAL — Before Production Launch

### 1. Rotate ALL Secrets
Every secret in `python-agent/.env` has been exposed (file exists on disk, was previously committed to git). Regenerate all of these:

| Secret | Where to regenerate |
|--------|-------------------|
| `OPENAI_API_KEY` | https://platform.openai.com/api-keys |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API |
| `SUPABASE_KEY` (anon) | Supabase Dashboard → Settings → API |
| `JWT_SECRET` | Generate new: `openssl rand -hex 64` |
| `JWT_REFRESH_SECRET` | Generate new: `openssl rand -hex 64` |
| `COMPOSIO_API_KEY` | https://platform.composio.dev/settings |
| `COMPOSIO_WEBHOOK_SECRET` | https://platform.composio.dev/settings/webhook |
| `DODO_PAYMENTS_API_KEY` | Dodo Payments dashboard |
| `DODO_PAYMENTS_WEBHOOK_KEY` | Dodo Payments dashboard → Webhooks |
| `RESEND_API_KEY` | https://resend.com/api-keys |
| `SENTRA_API_KEY` | Sentra dashboard |
| `CRON_SECRET` | Generate new: `openssl rand -hex 64` |
| `GOOGLE_CLIENT_ID` | Google Cloud Console → Credentials |

### 2. Scrub Git History
The `.env` file and `client_secret_*.json` were committed in past commits. Even though they're now gitignored, secrets remain in git history.

```bash
# Install BFG Repo-Cleaner: https://rtyley.github.io/bfg-repo-cleaner/
bfg --delete-files .env
bfg --delete-files 'client_secret*.json'
git reflog expire --expire=now --all && git gc --prune=now --aggressive
git push --force
```

### 3. Set Environment Variables on Deployment Platforms
Since hardcoded fallbacks were removed from `next.config.js` and `checkout/page.tsx`, these MUST be set:

**Vercel (frontend):**
- `NEXT_PUBLIC_API_URL` — e.g. `https://aariv-backend-python.onrender.com/api`
- `NEXT_PUBLIC_SUPABASE_URL` — your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — your Supabase anon key

**Render (backend):**
- All secrets from the table above
- `ALLOWED_ORIGINS` — set to production domain only (remove localhost)
- `WEB_APP_URL` — e.g. `https://aariv.vercel.app`

### 4. Run New SQL Migrations in Supabase
Execute these in the Supabase SQL Editor in order:

1. **RLS for briefings + user_activity_log** (from `user_activity_log_briefings.sql`):
```sql
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own activity" ON user_activity_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role full access on user_activity_log" ON user_activity_log FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE briefings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own briefings" ON briefings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role full access on briefings" ON briefings FOR ALL USING (true) WITH CHECK (true);
```

2. **Atomic overage charge** (from `production_schema_v2.sql`):
```sql
CREATE OR REPLACE FUNCTION charge_overage_atomic(p_user_id UUID, p_cost NUMERIC)
RETURNS NUMERIC LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_balance NUMERIC; v_new_balance NUMERIC;
BEGIN
    SELECT balance INTO v_balance FROM user_credits WHERE user_id = p_user_id FOR UPDATE;
    IF v_balance IS NULL OR v_balance < p_cost THEN RETURN -999; END IF;
    v_new_balance := v_balance - p_cost;
    UPDATE user_credits SET balance = v_new_balance, total_spent = total_spent + p_cost,
        chat_messages_used = chat_messages_used + 1, last_updated = NOW()
    WHERE user_id = p_user_id;
    RETURN v_new_balance;
END; $$;
```

3. **Atomic credit top-up** (from `production_schema_v2.sql`):
```sql
CREATE OR REPLACE FUNCTION credit_user_atomic(p_user_id UUID, p_amount NUMERIC, p_description TEXT DEFAULT 'Credits Top-up')
RETURNS NUMERIC LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_new_balance NUMERIC;
BEGIN
    INSERT INTO user_credits (user_id, balance, last_updated) VALUES (p_user_id, 5.0 + p_amount, NOW())
    ON CONFLICT (user_id) DO UPDATE SET balance = user_credits.balance + p_amount, last_updated = NOW()
    RETURNING balance INTO v_new_balance;
    INSERT INTO billing_transactions (user_id, type, description, amount, balance_after)
    VALUES (p_user_id, 'credit', p_description, p_amount, v_new_balance);
    RETURN v_new_balance;
END; $$;
```

4. **Atomic trigger fire check** (from `subscription_tier_migration.sql`):
```sql
CREATE OR REPLACE FUNCTION public.try_increment_trigger_fire(p_user_id UUID, p_free_limit INT DEFAULT 10)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_tier TEXT; v_fires INT;
BEGIN
    UPDATE public.user_credits SET trigger_fires_today = 0, trigger_fires_reset_at = CURRENT_DATE
    WHERE user_id = p_user_id AND trigger_fires_reset_at < CURRENT_DATE;
    SELECT subscription_tier, trigger_fires_today INTO v_tier, v_fires
    FROM public.user_credits WHERE user_id = p_user_id FOR UPDATE;
    IF COALESCE(v_tier, 'free') != 'free' THEN
        UPDATE public.user_credits SET trigger_fires_today = COALESCE(v_fires, 0) + 1 WHERE user_id = p_user_id;
        RETURN TRUE;
    END IF;
    IF COALESCE(v_fires, 0) >= p_free_limit THEN RETURN FALSE; END IF;
    UPDATE public.user_credits SET trigger_fires_today = COALESCE(v_fires, 0) + 1 WHERE user_id = p_user_id;
    RETURN TRUE;
END; $$;
GRANT EXECUTE ON FUNCTION public.try_increment_trigger_fire(UUID, INT) TO service_role;
```

### 5. Remove CORS Localhost Origins in Production
In Render environment variables, set `ALLOWED_ORIGINS` to production domain only:
```
ALLOWED_ORIGINS=https://aariv.vercel.app
```
Do NOT include `http://localhost:*` in production.

---

## HIGH — Implement Soon After Launch

### 6. Cancel Subscription UI
**Current state:** No way for users to cancel their subscription from the app. They'd need to contact support or find Dodo's portal manually.

**Required:**
- Add a "Cancel Subscription" button in Settings page (under billing section)
- Backend endpoint: `POST /billing/cancel-subscription` that calls Dodo API to cancel
- Confirmation dialog: "Are you sure? You'll be downgraded to Free at the end of your billing period."
- Handle the `subscription.cancelled` webhook (already implemented in backend)

**Dodo API call:**
```python
from dodopayments import DodoPayments
dodo = DodoPayments(bearer_token=DODO_API_KEY, environment=DODO_ENV)
dodo.subscriptions.update(subscription_id, status="cancelled")
```

### 7. Plan Upgrade/Downgrade Path (Starter <-> Pro)
**Current state:** A Starter user wanting Pro must cancel Starter first, wait for expiry, then subscribe to Pro. The backend now blocks duplicate subscriptions, but there's no smooth switch.

**Required:**
- Add plan switch flow: cancel old subscription + create new one in a single action
- Or use Dodo's subscription update API to change the product
- Prorate the billing (charge difference or credit remainder)
- Handle the transition gracefully: don't reset `chat_messages_used` on plan change within same cycle

### 8. Redis-Backed Rate Limiting
**Current state:** Rate limiter uses `storage_uri="memory://"` — resets on every deploy and doesn't share state across instances.

**Required:**
- Set up a Redis instance (Render Redis, Upstash, or AWS ElastiCache)
- Change `limiter.py` to: `storage_uri="redis://your-redis-url"`
- This affects: per-IP signup limits, per-user chat rate limits, endpoint rate limits

### 9. CSP Hardening — Remove `unsafe-eval`
**Current state:** `Content-Security-Policy` includes `'unsafe-eval'` in `script-src`. This significantly weakens XSS protection.

**Required:**
- Audit if Next.js can work without `'unsafe-eval'` (it often can with proper config)
- Use `nonce`-based CSP for inline scripts if needed
- Test thoroughly after removal — some third-party libraries require eval

### 10. `.env.example` Files
**Current state:** No example env files. New developers must guess which variables are needed.

**Required:**
Create `python-agent/.env.example`:
```
COMPOSIO_API_KEY=
COMPOSIO_WEBHOOK_SECRET=
OPENAI_API_KEY=
SUPABASE_URL=
SUPABASE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DODO_PAYMENTS_API_KEY=
DODO_PAYMENTS_WEBHOOK_KEY=
DODO_PAYMENTS_ENVIRONMENT=test_mode
DODO_STARTER_PRODUCT_ID=
DODO_PRO_PRODUCT_ID=
DODO_PRODUCT_ID=
RESEND_API_KEY=
FROM_EMAIL=CalmPilot <hello@calmpilot.app>
WEB_APP_URL=http://localhost:3001
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
JWT_SECRET=
JWT_REFRESH_SECRET=
PORT=8080
NODE_ENV=development
```

Create `web/.env.example`:
```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

---

## MEDIUM — Implement Before Scale

### 11. Audit Logging for Sensitive Operations
**Current state:** No structured audit trail for billing events, admin actions, or account changes.

**Required:**
- Log all payment events with: user_id, action, amount, timestamp, IP
- Log subscription changes: upgrade, downgrade, cancel
- Log account deletions
- Store in a dedicated `audit_log` table (not just application logs)

### 12. Subscription Renewal Confirmation Email
**Current state:** When `subscription.renewed` fires, the backend upgrades the tier but sends no email.

**Required:**
- Send a receipt/confirmation email on renewal
- Include: plan name, amount charged, next billing date, current usage

### 13. Billing Failure Handling
**Current state:** If `subscription.failed` webhook fires, the user is immediately downgraded to free.

**Consider:**
- Grace period (3-7 days) before downgrade
- Send "payment failed" email with link to update payment method
- Dodo may handle dunning (retry failed payments) — verify their behavior

### 14. Database Constraints on `user_credits`
**Current state:** No CHECK constraints on critical columns.

**Required SQL:**
```sql
ALTER TABLE user_credits ADD CONSTRAINT check_subscription_tier
    CHECK (subscription_tier IN ('free', 'starter', 'pro'));
ALTER TABLE user_credits ADD CONSTRAINT check_non_negative_usage
    CHECK (chat_messages_used >= 0 AND chat_messages_limit >= 0);
```

### 15. Composite Index for Billing Queries
**Current state:** Missing index for the most common billing query pattern.

**Required SQL:**
```sql
CREATE INDEX idx_billing_tx_user_type_created
    ON public.billing_transactions(user_id, type, created_at DESC);
```

### 16. Cloud Run Authentication
**Current state:** `cloudbuild.yaml` deploys with `--allow-unauthenticated`. While the app has its own auth middleware, this removes the cloud-level defense.

**Required:**
- Remove `--allow-unauthenticated` from cloudbuild.yaml
- Configure Cloud Run to accept requests from your load balancer / API gateway only
- Or keep it if the backend must be publicly accessible for webhooks, but add Cloud Armor / WAF

### 17. Webhook Test Endpoint Disabled in Production
**Current state:** `/webhook/test` is blocked by `IS_CLOUD_RUN` check, but Render deployments don't set that flag.

**Required:**
- Change the guard to check `NODE_ENV == "production"` or add a dedicated `DISABLE_TEST_WEBHOOK` env var
- Or use the `RENDER` env var to detect Render deployments

---

## LOW — Nice to Have

### 18. Supabase Realtime Subscription Filtering
**Current state:** `useBilling.tsx` subscribes to ALL updates on `user_credits` for the user. This is fine for now but could be optimized to only listen for specific columns.

### 19. Credit Balance Alerts in Dashboard
**Current state:** Spend alert emails work, but there's no in-dashboard alert when balance is low.

### 20. Usage Analytics Dashboard
**Current state:** Usage data exists in `billing_transactions` but there's no visual dashboard for users to see their spending trends, model usage breakdown, etc.

### 21. Invoice Generation
**Current state:** No downloadable invoices. Users can see spending history in settings but can't export or download receipts.

---

*Last updated: 2026-03-27 — Generated during production security audit*
