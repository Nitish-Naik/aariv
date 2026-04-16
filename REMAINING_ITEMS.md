# Remaining Items (Post-Audit)

Last updated: 2026-03-13

---

## ✅ Already Fixed

- PUT → PATCH for `/auth/onboarding-step` in `dashboard/page.tsx`
- Removed duplicate `useEffect` that was double-tracking onboarding step 3
- Env validation now raises `RuntimeError` (hard fail) instead of just logging
- `COMPOSIO_WEBHOOK_SECRET` added to required env vars at startup
- Context expand panel in Review page (Feature F)
- Monthly spend alert email when spend crosses threshold (Feature I)
- Fixed `%-d` strftime (POSIX-only) in `services/email.py`
- Fixed `.single()` crash risk → `.limit(1)` in `_maybe_send_spend_alert`
- Fixed missing `abs()` on negative billing amounts in monthly spend calc
- Fixed wrong table name (`usage_logs` → `billing_transactions`)
- Added missing `import asyncio` in `routers/billing.py`
- CORS: locked to specific methods + headers (not `*`)

---

## 🔴 Critical

~~**1. Billing routes allow cross-user data access**~~ — **NOT AN ISSUE**
All billing routes (`/balance`, `/usage`, `/history`, `/setup-auto-refill`) already have `if _user.get("userId") != user_id: raise 403` ownership checks. Safe.

---

## 🟠 High

### 2. Unnecessary `userId` query params sent from frontend
**Files:** `web/src/app/dashboard/page.tsx` (lines 757, 783, 784)
**Issue:** Frontend sends `?userId=${user.id}` to `/integrations`, `/dashboard/briefing`, and `/review`. Backend derives userId from JWT so these are ignored, but they expose the user ID in server logs and are confusing.
**Fix:** Remove `?userId=...` from all three `api.get()` calls.

### 3. Chat SSE stream not cleaned up on unmount
**File:** `web/src/app/dashboard/assistant/page.tsx` (or wherever the streaming chat is)
**Issue:** If the component unmounts while an SSE stream is active (e.g., user navigates away mid-response), the `EventSource` or `fetch` stream is not aborted. This leaks the connection and can cause state-update-on-unmounted-component warnings.
**Fix:** Use an `AbortController` passed to the fetch, and call `controller.abort()` in the `useEffect` cleanup function.

---

## 🟡 Medium

### 4. Rate limiting missing on destructive auth endpoints
**File:** `python-agent/routers/auth.py`
**Issue:** `/auth/delete` (account deletion) and `/auth/account` endpoints have no rate limiting. A script could spam deletion requests or account lookups.
**Fix:** Add `@limiter.limit("5/minute")` decorator (slowapi) to these endpoints, same pattern as other rate-limited routes.

### 5. `RESEND_API_KEY` not in required env check
**File:** `python-agent/server.py`
**Issue:** All transactional emails (morning briefing, spend alert, high-priority review alerts) silently fail if `RESEND_API_KEY` is missing. It's not in the startup required-env list.
**Fix:** Add `"RESEND_API_KEY": os.getenv("RESEND_API_KEY")` to `_required_env` in the Cloud Run startup check.

---

## 🔵 Low / Nice-to-Have

### 6. `SLACK_NUDGE_KEY` constant defined but never used
**File:** `web/src/app/dashboard/page.tsx` (line 727)
**Issue:** `const SLACK_NUDGE_KEY = (userId: string) => ...` is defined but the nudge logic uses an inline string instead.
**Fix:** Either use the constant or delete it.

### 7. Test/diagnostic scripts in production image
**Files:** `python-agent/diagnose_composio.py`, `diagnose_triggers.py`, `fix_missing_triggers.py`, `test_agent_stream.py`, `test_sse.py`, `test_webhook.py`
**Issue:** These files are included in the Docker image deployed to Cloud Run. Not a security risk but adds image bloat.
**Fix:** Add to `.dockerignore` or move to a `scripts/` folder excluded from the image.

### 8. `run_dev.py` / `env_loader.py` in production image
**File:** `python-agent/run_dev.py`, `python-agent/env_loader.py`
**Same as above** — dev-only helpers shouldn't be in the production image.

---

## SQL Migrations Still Needed (if not already run)

```sql
-- For spend alert feature (Feature I)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS spend_alert_threshold NUMERIC,
  ADD COLUMN IF NOT EXISTS spend_alert_sent_month TEXT;

-- For review context panel (Feature F) — already existed
-- trigger_events table with payload column — confirm exists
```

Run in Supabase SQL editor if not already applied.
