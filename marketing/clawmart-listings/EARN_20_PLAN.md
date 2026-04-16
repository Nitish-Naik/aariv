# Earn $20 in 24 Hours — Action Plan

## Strategy: Sell QA Audits as a Service ($10-20 each)

Products need audience. Services need ONE client.
We need 1 client at $20 or 2 clients at $10.

---

## PAYMENT SETUP (Do this FIRST — 5 minutes)

**Use Dodo Payments** (you already have an account for CalmPilot)

1. Go to your Dodo Payments dashboard (app.dodopayments.com)
2. Create a product:
   - Name: "Code Security Audit"
   - Price: $15 (one-time payment)
   - Description: "Full security + performance audit with graded A-F report and exact file:line fixes"
3. Get the payment link
4. Share this link when a client DMs you

**Why Dodo:** Works in India, 220+ countries, no Stripe/PayPal needed, 
merchant of record (handles taxes), fast payouts to Indian bank accounts.

---

## POST 1: Reddit r/forhire (HIGHEST PRIORITY)

**This sub exists for exactly this. People hire for small tasks daily.**

Title: `[For Hire] I'll security-audit your codebase and give you a graded report with exact fixes — $15`

Body:
```
Hey! I'm offering quick security + performance audits for indie projects and side projects.

**What you get:**

- Full audit across security, performance, backend, frontend, and database
- Graded report (A through F) so you know where you stand
- Every issue has an exact file:line reference and a specific fix (not vague "add validation" — the actual code change)
- I also tell you what's already good, not just problems
- Report delivered within 2-4 hours

**What I check (50+ items):**

- Auth bypass, SQL injection, XSS vectors
- Exposed secrets, CORS misconfiguration
- Missing rate limiting on expensive endpoints
- N+1 queries, missing caches, oversized payloads
- Race conditions on billing/financial operations
- Missing error boundaries, data leaks in localStorage
- Hardcoded credentials, missing input validation

**Works with any stack** — FastAPI, Express, Next.js, Django, Rails, Laravel, Go, whatever you've got.

**Price: $15** (one-time, no subscription)

I built an AI-assisted audit pipeline that catches things manual reviews miss. I then verify everything and deliver a clean report.

DM me with your GitHub repo link (public or private invite) and I'll have your report back within hours.

Payment: https://checkout.dodopayments.com/buy/pdt_0NbmeEPwLbETogllRG0Lv?quantity=1
```

---

## POST 2: Reddit r/SideProject

Title: `I'll audit your side project for security vulnerabilities for free (first 3) / $10 after`

Body:
```
Building a code audit tool and need real-world test cases.

I'll do a full security + performance audit on your side project — graded A-F report with exact file:line fixes for every issue found.

**Free for the first 3 repos** (I need portfolio examples).
$10 after that.

What I check:
- Auth bypass, injection (SQL/XSS), exposed secrets
- Missing rate limiting, CORS misconfig
- N+1 queries, missing caches, race conditions
- 50+ checks across security, backend, frontend, database, performance

Works with any stack. DM me your repo link.

Report delivered within 2-4 hours.
```

Why "free for first 3": Creates urgency. People rush to DM. Even if you do 3 free, you'll get 5-10 more DMs asking for paid audits from the same post.

---

## POST 3: Reddit r/webdev

Title: `Offering $10 security audits for web apps — graded report with exact file:line fixes`

Body:
```
Indie developer here. I built an audit pipeline that combines AI analysis with manual verification to find real security and performance issues in web apps.

Not theoretical concerns — actual bugs with exact file locations and specific fixes.

Example findings from a recent audit:

---

**CRITICAL-1: Missing auth check on DELETE /api/users/{id}**
- File: backend/routers/users.py:47
- Risk: Any authenticated user can delete any other user's account
- Fix: Add `if user_id != current_user.id: raise HTTPException(403)`

**HIGH-1: No rate limiting on /api/auth/login**
- File: backend/routers/auth.py:12
- Risk: Brute force attacks on user passwords
- Fix: Add rate limiter — 5 attempts per minute per IP

**What's Already Good:**
- JWT validation is solid with proper expiry checks
- CORS properly scoped to production domain
- All financial operations use database transactions

---

$10 per audit. Any stack (FastAPI, Express, Next.js, Django, Rails, etc.).

DM me your repo link. Report back within 2-4 hours.
```

---

## POST 4: X (Twitter)

**Tweet 1:**
```
I'll audit your codebase for security vulnerabilities for $10

You get:
- Graded report (A-F)
- Every issue with exact file:line reference
- Specific fix for each issue (not "add validation" — the actual code)
- What's already good

Any stack. DM me your repo link
```

**Tweet 2 (reply to yourself):**
```
Example from a recent audit:

CRITICAL: Missing auth on DELETE /api/users/{id}
→ Any user can delete any other user's account
→ Fix: add user_id != current_user.id check

Found in 3 minutes. Would have been a production incident.

50+ checks. Security, performance, database, frontend.
```

**Tweet 3 (reply):**
```
Works with:
- FastAPI / Django / Flask
- Express / Nest / Hono
- Next.js / React / Vue / Svelte
- Rails / Laravel / Go

Report delivered in 2-4 hours.

$10. DM me.
```

---

## POST 5: Reddit r/ClaudeAI

Title: `I built a Claude Code skill that turns Claude into a senior QA engineer — offering audits for $10`

Body:
```
I created a comprehensive QA audit skill for Claude Code that runs 50+ security and performance checks on any codebase.

It auto-detects your tech stack, reads every endpoint and auth check, and generates a graded report (A-F) with exact file:line references and specific fixes.

I'm offering to run it on your projects:
- **$10 per audit** — full report delivered in 2-4 hours
- **Free for first 2 repos** — building my portfolio

What it catches:
- Auth bypass, SQL injection, XSS
- Exposed secrets, CORS misconfig
- N+1 queries, missing caches
- Race conditions on billing
- Missing error boundaries
- Hardcoded credentials

DM me your repo link.

Once I earn enough from the service side, I'll be releasing the skill itself on ClawMart for anyone to use.
```

---

## HOUR-BY-HOUR TIMELINE

### Hour 0 (RIGHT NOW)
- [ ] Set up payment method (Ko-fi or PayPal) — 5 min
- [ ] Post on r/forhire — 2 min (copy paste from above)
- [ ] Post on r/SideProject — 2 min

### Hour 1
- [ ] Post on r/webdev — 2 min
- [ ] Post on r/ClaudeAI — 2 min
- [ ] Post the X thread — 2 min

### Hour 2-4
- [ ] Check DMs every 30 min
- [ ] When someone sends a repo: clone it, run /qa-audit full, clean up the report, send it
- [ ] Ask satisfied clients to upvote your Reddit post

### Hour 5-12
- [ ] Reply to comments on your posts (engagement boosts visibility)
- [ ] If r/SideProject has "just launched" posts — comment offering a free audit
- [ ] Cross-post to r/startups if no traction yet

### Hour 12-24
- [ ] Follow up with anyone who showed interest but didn't pay
- [ ] If you hit $20 — sign up for ClawMart creator immediately

---

## WHEN A CLIENT DMS YOU

1. Ask for their GitHub repo link (public, or invite you as collaborator if private)
2. Clone the repo
3. Run: `/qa-audit full` (our skill does the heavy lifting)
4. Review the output — remove any false positives, clean up formatting
5. Send the report as a markdown file or paste in DM
6. Send payment link
7. Ask: "Happy with the report? Mind upvoting my post?"

---

## BACKUP PLAN (if no clients in 12 hours)

1. Go to r/SideProject, sort by "New"
2. Find 5-10 posts where people shared their project
3. Comment: "Hey, I ran a quick security scan on your repo and found [1-2 specific issues]. Happy to do a full audit for $10 if you're interested — DM me."
4. This converts at ~20-30% because you're showing value upfront

---

## PRICING RATIONALE

- Professional security audits cost $500-5000
- Automated tools (Snyk, SonarQube) cost $20-100/month
- You're offering human-verified, AI-assisted audits for $10-15
- This is a no-brainer for any indie dev shipping to production
