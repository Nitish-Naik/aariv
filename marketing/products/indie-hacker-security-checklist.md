# The Indie Hacker Security Checklist
## 25 Vulnerabilities to Check Before You Launch (With Exact Fixes)

---

### Why This Exists

I audited an open-source trading platform and found 12 vulnerabilities — including 1 critical issue that could expose every user's credentials. The app was already live with real users.

Most indie hackers skip security because "nothing has gone wrong yet." This checklist takes 30 minutes and catches the issues that will eventually go wrong.

---

## Section 1: Authentication (5 checks)

### 1. API Keys in Client-Side Code
**Severity: CRITICAL**

Check if API keys, tokens, or secrets are stored in localStorage, sessionStorage, or hardcoded in JavaScript.

**How to check:**
```
grep -r "localStorage\|sessionStorage" src/ --include="*.ts" --include="*.tsx"
grep -r "api_key\|apikey\|secret\|token.*=" src/ --include="*.ts" | grep -v "process.env"
```

**Fix:** Move to httpOnly cookies or server-side sessions. Never expose long-lived credentials to JavaScript.

**Real example:** Found API key in localStorage on a live trading platform. Any XSS = full account takeover with no revocation mechanism.

---

### 2. Missing Auth on API Routes
**Severity: HIGH**

Every API endpoint that reads or writes user data must verify authentication.

**How to check:**
```
# Find routes WITHOUT auth middleware
find src/app/api -name "route.ts" -exec grep -L "auth\|session\|getServerSession" {} \;
```

**Fix:** Add auth middleware to every protected route. Use a centralized auth check, not per-route implementation.

---

### 3. Password/Token in URL Parameters
**Severity: HIGH**

Tokens in URLs get logged in server logs, browser history, and referrer headers.

**How to check:** Search for `?token=` or `?key=` in your codebase and API routes.

**Fix:** Use POST body or Authorization headers instead of URL parameters.

---

### 4. No Rate Limiting on Auth Endpoints
**Severity: MEDIUM**

Login, signup, and password reset without rate limiting = brute force target.

**How to check:** Try hitting `/api/auth/login` 100 times in 10 seconds. If all succeed, you have no rate limiting.

**Fix:** Add sliding window rate limit (e.g., 5 attempts per minute per IP).

---

### 5. OAuth State/PKCE Not Validated
**Severity: MEDIUM**

If using OAuth (Google, GitHub login), the `state` parameter must be validated to prevent CSRF.

**How to check:** Look at your OAuth callback handler. Does it verify the `state` parameter matches what was sent?

**Fix:** Generate random state on auth initiation, verify it on callback.

---

## Section 2: Data Access (5 checks)

### 6. IDOR (Insecure Direct Object Reference)
**Severity: HIGH**

Can User A access User B's data by changing an ID in the URL?

**How to check:**
```
# Find routes that take user-controlled IDs
grep -rn "params\.\|searchParams\." src/app/api/ --include="*.ts" | grep -i "id\|user"
```

Then verify: does the handler check that the authenticated user owns the requested resource?

**Fix:** Always verify `resource.userId === authenticatedUser.id` before returning data.

**Real example:** Found portfolio endpoint accessible by agent name — any user could view another agent's portfolio.

---

### 7. No Row Level Security (RLS)
**Severity: HIGH**

If using Supabase/Postgres, RLS is your last line of defense.

**How to check:**
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
-- Then for each table:
SELECT * FROM pg_policies WHERE tablename = 'your_table';
```

**Fix:** Enable RLS on every table. Add policies that restrict reads/writes to the owning user.

---

### 8. Sensitive Data in API Responses
**Severity: MEDIUM**

Are you returning password hashes, internal IDs, or other sensitive fields in API responses?

**How to check:** Make API calls and inspect the response. Look for fields that shouldn't be public.

**Fix:** Create a "safe columns" constant and explicitly select only those columns.

---

### 9. Mass Assignment
**Severity: MEDIUM**

Can users update fields they shouldn't by adding extra fields to the request body?

**How to check:** Send a PATCH request with `{"role": "admin"}` in the body. Does it update?

**Fix:** Explicitly whitelist which fields can be updated. Never spread the entire request body into a database update.

---

### 10. SQL/NoSQL Injection
**Severity: HIGH**

Are you building queries with string concatenation?

**How to check:**
```
grep -rn "\.rpc(\|raw(\|execute(" src/ --include="*.ts"
grep -rn '`.*\$\{' src/ --include="*.ts" | grep -i "query\|sql\|select\|insert"
```

**Fix:** Always use parameterized queries. Never interpolate user input into SQL strings.

---

## Section 3: Input Validation (5 checks)

### 11. No Input Length Limits
**Severity: MEDIUM**

Can a user submit a 10MB string in a text field?

**How to check:** Look for `request.json()` calls without validation.

**Fix:** Add schema validation (Zod, Joi) on every endpoint that accepts user input.

---

### 12. Missing Content-Type Validation
**Severity: LOW**

Does your API accept any content type, or only `application/json`?

**Fix:** Reject requests with unexpected Content-Type headers.

---

### 13. File Upload Without Validation
**Severity: HIGH**

If you accept file uploads: are you checking file type, size, and content?

**Fix:** Validate MIME type, enforce size limits, scan for malicious content, store outside webroot.

---

### 14. XSS via User Content
**Severity: HIGH**

Search for `dangerouslySetInnerHTML` in React or unescaped template literals.

**How to check:**
```
grep -rn "dangerouslySetInnerHTML\|v-html\|innerHTML" src/ --include="*.tsx" --include="*.vue"
```

**Fix:** Use React's default escaping. Never render raw HTML from user input.

---

### 15. URL Validation on User-Supplied Links
**Severity: MEDIUM**

Can users set URLs to `javascript:alert(1)` or `data:text/html,...`?

**Fix:** Validate URLs start with `https://` and match an allowlist of domains.

---

## Section 4: Infrastructure (5 checks)

### 16. Hardcoded Secrets in Code
**Severity: CRITICAL**

**How to check:**
```
grep -rn "sk_live\|pk_live\|AKIA\|ghp_\|glpat-" src/ .env*
git log --all -p | grep -i "api_key\|secret\|password" | head -20
```

**Fix:** Use environment variables. Add `.env*` to `.gitignore`. Rotate any keys that were ever committed.

---

### 17. Missing Security Headers
**Severity: MEDIUM**

Check for: CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy.

**Fix:** Add to your Next.js config or middleware:
```javascript
headers: [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
]
```

---

### 18. CORS Misconfiguration
**Severity: MEDIUM**

Is `Access-Control-Allow-Origin: *` set on sensitive endpoints?

**Fix:** Explicitly set allowed origins. Never use `*` on authenticated endpoints.

---

### 19. No HTTPS Enforcement
**Severity: HIGH**

Can your API be accessed over HTTP?

**Fix:** Redirect all HTTP to HTTPS. Set `Strict-Transport-Security` header.

---

### 20. Unprotected Cron/Webhook Endpoints
**Severity: MEDIUM**

Can anyone hit your `/api/cron/` endpoints directly?

**Fix:** Verify a secret header (e.g., `CRON_SECRET`) on all cron endpoints.

---

## Section 5: Business Logic (5 checks)

### 21. Race Conditions on Financial Operations
**Severity: CRITICAL**

Can two simultaneous requests double-spend credits or create duplicate orders?

**Fix:** Use database-level locking (`SELECT ... FOR UPDATE`) or atomic RPC functions.

---

### 22. No Audit Trail
**Severity: MEDIUM**

Can you see what actions were taken, by whom, and when?

**Fix:** Log every state-changing action with timestamp, user ID, and before/after state.

---

### 23. Missing Webhook Signature Verification
**Severity: HIGH**

If you receive webhooks (Stripe, Composio, etc.), are you verifying the signature?

**Fix:** Always verify the webhook signature against the provider's secret.

---

### 24. Excessive Data in Error Messages
**Severity: LOW**

Do your error responses leak stack traces, file paths, or database details?

**Fix:** Return generic error messages to users. Log detailed errors server-side only.

---

### 25. No Account Deletion/Data Export
**Severity: LOW (but legally required in many jurisdictions)**

Can users delete their account and all associated data?

**Fix:** Implement account deletion that cascades to all user data. Required by GDPR/CCPA.

---

## How To Use This Checklist

1. Go through each item. Mark as PASS, FAIL, or N/A.
2. Fix all CRITICAL and HIGH items before launch.
3. Fix MEDIUM items within 30 days.
4. Fix LOW items when you have time.

**Estimated time:** 30-60 minutes for the full checklist.

---

## Want a Professional Audit?

I run full security audits for indie hackers:
- 50+ check items (more than this list)
- File-by-file review with exact line numbers
- Severity-rated findings with specific fixes
- Delivered within 24 hours

**$10-15 per repo.** DM @nitishnaik2022 on X.

---

*Built by Nitish — solo founder of CalmPilot (calmpilot.app)*
*Security-first AI that reads your email overnight and briefs you by morning.*
