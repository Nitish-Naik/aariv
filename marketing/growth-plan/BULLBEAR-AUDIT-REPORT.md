# Security Audit Report: BullBear
**Repo:** github.com/DunkinGuys/BullBear
**Date:** April 2, 2026
**Auditor:** Nitish @ CalmPilot Labs

---

## Summary
BullBear is a Next.js + Supabase trading platform where AI agents trade with virtual $100K. Overall security posture is **good** — auth is implemented on most routes, RLS policies exist, and cron endpoints are protected. However, there are several findings worth addressing.

---

## Findings

### 1. IDOR Risk on Portfolio Endpoint
**Severity: Medium**
**File:** `src/app/api/portfolio/route.ts:10`

The portfolio endpoint accepts an `agent` query parameter without verifying the requesting user owns that agent:
```
const agentName = searchParams.get('agent');
```
Any authenticated user could potentially view another agent's portfolio by guessing/knowing the agent name.

**Fix:** Add ownership check — verify the authenticated user is the owner of the requested agent before returning portfolio data.

---

### 2. Trade History Accessible by Agent Name
**Severity: Medium**
**File:** `src/app/api/trades/route.ts:147`

Trade history can be queried by agent name:
```
const agentName = searchParams.get('agent');
```
While trade data may be intentionally public (leaderboard context), confirm this is intended. If trade strategies should be private, add ownership verification.

**Fix:** If trade history should be private, add auth check verifying the requester owns the agent. If intentionally public, document this decision.

---

### 3. Missing Rate Limiting on Public Endpoints
**Severity: Low**
**File:** `src/app/api/leaderboard/route.ts`, `src/app/api/feed/route.ts`, `src/app/api/search/route.ts`

Public GET endpoints (leaderboard, feed, search) don't appear to have rate limiting. While read-only, these could be abused for scraping or DoS.

**Fix:** Add rate limiting middleware (e.g., Vercel's built-in rate limiting or a custom sliding window).

---

### 4. Stock Price Endpoint Unauthenticated
**Severity: Low**
**File:** `src/app/api/stocks/[symbol]/price/route.ts`

This is the only API route with zero auth. If stock prices are fetched from a paid API, unauthenticated access could run up costs.

**Fix:** Add API key auth or rate limit this endpoint. If prices are intentionally public, add rate limiting at minimum.

---

### 5. Input Validation on Agent Creation
**Severity: Low**
**File:** `src/app/api/agents/route.ts:26`

Agent creation accepts `request.json()` but should validate:
- Agent name length and allowed characters
- Prevent duplicate names (currently checked at DB level, but error handling could be cleaner)
- Sanitize any user-provided strings to prevent stored XSS

**Fix:** Add Zod or similar schema validation on the request body.

---

## What's Done Well

- **Cron endpoint protected** with `CRON_SECRET` header verification
- **API key hashing** — keys are stored as hashes, not plaintext
- **RLS policies exist** — `20260207094539_add_rls_policies.sql` migration present
- **Atomic trade functions** — using Supabase RPC for trade execution prevents race conditions
- **Auth middleware** (`apiAuth.ts`) is well-structured with rate limiting on trade routes
- **Input parsing** uses dedicated `parseBody` utility with error handling
- **Supabase service role key** properly kept server-side only

---

## Risk Rating: **Low-Medium**
The application has solid security fundamentals. The main risks are IDOR on portfolio/trade endpoints and missing rate limits on public endpoints. No critical vulnerabilities found.

---

*Audit performed by CalmPilot Labs — AI-powered security audits for indie devs.*
*Want an audit on your repo? DM @nitishnaik2022 on X.*
