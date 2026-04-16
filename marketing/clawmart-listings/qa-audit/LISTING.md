# Claw Mart Listing — Ship-Safe Audit

## Listing Metadata

| Field | Value |
|-------|-------|
| **Name** | Ship-Safe Audit |
| **Type** | Skill |
| **Category** | Engineering |
| **Price** | $29 |
| **Version** | 1 |
| **License** | One-time purchase |
| **Compatible With** | Any web application — auto-detects tech stack (FastAPI, Express, Next.js, Django, Rails, etc.) |
| **Required Tools** | Claude Code (or any OpenClaw-compatible agent), a codebase to audit |

## Short Description (100 chars)

Full security, performance, and data integrity audit — graded A-F with exact file:line fixes

## About (Listing Body)

Your AI agent becomes a senior QA engineer. Point it at any codebase and get a production readiness audit covering security, performance, database integrity, and frontend safety — with exact file:line references and specific fixes for every issue found.

**What it audits:**

- **Security** — auth bypass, injection (SQL/XSS), exposed secrets, CORS misconfig, rate limiting gaps, missing authorization policies, hardcoded credentials
- **Backend** — missing validation, error handling gaps, race conditions, IDOR vulnerabilities, unbounded queries, blocking I/O in async code
- **Frontend** — XSS vectors, auth state leaks, missing error boundaries, sensitive data in localStorage, console.log leaks
- **Database** — missing indexes, orphaned records, authorization policy gaps, no atomic transactions on billing/financial operations
- **Performance** — N+1 queries, missing caches, oversized payloads, unnecessary bundle imports, unoptimized images

**What makes this different from a generic "review my code" prompt:**

1. **Structured checklist** — 50+ specific checks across 5 categories, not vibes
2. **Real issues only** — flags actual problems, not theoretical concerns or style preferences
3. **Exact fixes** — every issue comes with a specific code change, not "add better validation"
4. **Graded report** — A through F rating so you know where you stand
5. **Auto-detects your stack** — works with FastAPI, Express, Next.js, Django, Rails, Hono, NestJS, Vue, React, Svelte, and more
6. **Acknowledges what's good** — not just a list of problems, also highlights solid engineering

**Run it before you ship.** Run it before a launch. Run it before you sleep at night wondering if your auth is actually secure.

**Scopes available:**
- `security` — auth and injection focused
- `backend` — API validation and error handling
- `frontend` — XSS, state, and data leaks
- `database` — integrity and authorization
- `performance` — speed and efficiency
- `full` — all of the above (default)

## Core Capabilities

- security-audit
- performance-audit
- xss-detection
- sql-injection
- auth-bypass
- rate-limiting
- database-integrity
- production-readiness
- code-review
- OWASP

## Example Output

```markdown
# QA Audit Report — MyApp

**Scope:** Full
**Tech Stack:** Next.js 14 + FastAPI + Supabase
**Date:** 2026-04-01
**Grade:** C

## Critical Issues (must fix before production)

### CRITICAL-1: Missing auth check on DELETE /api/users/{id}
- **File:** `backend/routers/users.py:47`
- **Risk:** Any authenticated user can delete any other user's account
- **Fix:** Add `if user_id != current_user.id: raise HTTPException(403)`

### CRITICAL-2: Raw SQL query with string interpolation
- **File:** `backend/routers/search.py:23`
- **Risk:** SQL injection via search parameter
- **Fix:** Use parameterized query: `cursor.execute("SELECT * FROM items WHERE name = %s", (query,))`

## What's Already Good
- JWT validation is solid with proper expiry checks
- CORS properly scoped to production domain
- All financial operations use database transactions
- Frontend uses React (auto-escapes most XSS vectors)

## Summary
- **Critical:** 2 issues
- **High:** 4 issues
- **Medium:** 6 issues
- **Low:** 3 issues
- **Production ready?** NO — fix the 2 critical auth/injection issues first
```

## API Payload (for programmatic listing)

```json
{
  "type": "skill",
  "name": "Ship-Safe Audit",
  "description": "Full security, performance, and data integrity audit — graded A-F with exact file:line fixes",
  "category": "Engineering",
  "price": 2900,
  "capabilities": ["security-audit", "performance-audit", "xss-detection", "sql-injection", "auth-bypass", "production-readiness", "code-review"]
}
```
