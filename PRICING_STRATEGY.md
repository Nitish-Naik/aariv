# CalmPilot Pricing Strategy

> Complete pricing analysis and decision log from strategy session on 2026-03-24.

---

## Table of Contents

1. [What CalmPilot Is](#what-calmpilot-is)
2. [Current Pricing Model (Implemented)](#current-pricing-model-implemented)
3. [Problems With the Current Model](#problems-with-the-current-model)
4. [Composio's Pricing Model](#composios-pricing-model)
5. [Cost Structure Analysis](#cost-structure-analysis)
6. [Final Proposed Pricing Model](#final-proposed-pricing-model)
7. [New User Journey](#new-user-journey)
8. [Composio Profitability Analysis](#composio-profitability-analysis)
9. [When to Switch Composio Plans](#when-to-switch-composio-plans)
10. [Go-To-Market Launch Strategy](#go-to-market-launch-strategy)
11. [Free Tier Composio Call Analysis](#free-tier-composio-call-analysis)
12. [Composio Call Optimizations](#composio-call-optimizations)
13. [What Needs to Be Built](#what-needs-to-be-built)

---

## What CalmPilot Is

CalmPilot is an AI-powered digital proxy that:

- Connects to 30 curated apps via OAuth (Gmail, Slack, Notion, GitHub, Linear, etc.)
- Watches events (triggers) and responds automatically — 24/7
- Delivers daily AI briefings (morning summary of everything)
- Takes actions on your behalf (send emails, create tasks, etc.)
- Provides an on-demand chat interface

**Core value proposition:** "Wake up to work done." The agent works while you sleep.

**Key insight for pricing:** CalmPilot has two fundamentally different workloads:

```
AUTOMATION (background, 24/7)     CHAT (on-demand by user)
→ Triggers processing events       → User asks questions
→ Daily briefings                  → User requests actions
→ Costs are PREDICTABLE            → Costs are UNPREDICTABLE
→ Best covered by subscription     → Best covered by usage cap
```

---

## Current Pricing Model (Implemented)

**Type:** Pure Pay-As-You-Go Credits

| Detail | Value |
|---|---|
| Signup bonus | $5 free credits (auto-created on first `/billing/balance` call) |
| Markup on LLM costs | 4× (~75% gross margin on tokens) |
| Top-up amounts | $10, $25, $50, $100, or custom $5–$500 |
| Payment processor | DodoPayments |
| Auto-refill | Yes — configurable threshold + amount |
| Spend alerts | Yes — email when monthly spend crosses threshold |

### What Happens When a User Tops Up $20

```
Step 1: User clicks "Add Credits" → selects $20
        POST /billing/create-checkout { amount: 20 }

Step 2: Backend creates DodoPayments checkout session
        quantity=20, metadata = { user_id, credits_usd: "20" }

Step 3: User pays $20 on DodoPayments
        DodoPayments takes ~2.9% fee = ~$0.58
        You receive: ~$19.42

Step 4: DodoPayments fires webhook → POST /webhook/dodo
        Verifies signature, reads metadata

Step 5: Backend credits the user
        user_credits.balance += $20.00
        billing_transactions INSERT (type="topup", amount=20)

Step 6: Supabase Realtime fires → wallet updates live in browser
```

### Economics on a $20 Top-Up

```
User pays:                  $20.00
DodoPayments fee:           -$0.58
LLM cost (4× markup):       -$5.00
Composio tool calls:        -$2.24  (currently absorbed silently — untracked)
──────────────────────────────────
Your profit:                $12.18  (63% real margin, not the stated 75%)
```

### Current Token Pricing (billing.py)

```python
MARKUP = 4.0

BASE_COST = {
    "gpt-5.4":     {"input": 2.50,  "output": 15.00},
    "gpt-5.4-pro": {"input": 30.00, "output": 180.00},
    "gpt-5":       {"input": 1.25,  "output": 10.00},
    "gpt-4.1":     {"input": 2.00,  "output": 8.00},
    "gpt-4.1-mini":{"input": 0.40,  "output": 1.60},
    "gpt-4.1-nano":{"input": 0.10,  "output": 0.40},
    "gpt-4o":      {"input": 2.50,  "output": 10.00},
    "gpt-4o-mini": {"input": 0.15,  "output": 0.60},
}
```

---

## Problems With the Current Model

### Problem 1 — Dead Code (billing.py:15)
```python
FLAT_FEE_COST = 0.05  # defined but NEVER used anywhere
```
Ghost from an old pricing model. Does nothing.

### Problem 2 — Composio Tool Calls Not Billed
`charge_user` only charges LLM tokens. Every agent run also burns Composio tool calls. You silently absorb ~$2/user/month in Composio costs.

### Problem 3 — No Tier or Subscription System
Comment in `actions.py:40`:
```python
# Note: Pro feature gating should be checked via user subscription
```
**Never implemented.** No subscription table, no tier check, no feature gating. Every user gets identical access.

### Problem 4 — No Trigger Limits
`app_triggers.py` auto-creates triggers for every connected app with no count check. A free user connecting 5 apps gets ~15 active triggers for free, forever.

### Problem 5 — Expensive Models Not Gated
`settings/page.tsx` lets all users select GPT-5.4-pro ($30 input/$180 output per 1M × 4 markup). A free user with $5 credits can select the most expensive model and drain balance in one task.

### Problem 6 — Rate Limiting Is In-Memory
```python
_user_request_times: dict[str, deque] = {}  # chat.py:41
```
Resets on server restart. Breaks completely with multiple pods.

### Problem 7 — No Abuse Prevention on $5 Credit
Every new account gets $5 automatically. No email verification, no IP check, no duplicate detection. A bad actor can create unlimited accounts for unlimited free usage.

### Problem 8 — Credit Check Before Cost Is Known
```python
credit_status = await check_credits(user_id)   # checks balance upfront
# ... runs the agent (actual cost unknown until AFTER)
await charge_user(...)                           # charges after
```
Grace period is only $0.01 but task overage can be much larger.

### Problem 9 — No Predictable Revenue
Pure PAYG = $0 guaranteed MRR. No subscription table, no recurring charge, no upgrade flow.

### Summary Table

| # | Problem | Impact |
|---|---|---|
| 1 | Dead `FLAT_FEE_COST` variable | Technical debt |
| 2 | Composio costs not billed | ~11% margin loss per task |
| 3 | No tier/subscription system | Zero MRR, no upgrade path |
| 4 | No trigger limits | Free users get unlimited triggers |
| 5 | Expensive models not gated | Free users can burn $5 instantly |
| 6 | In-memory rate limiting | Resets on restart, breaks at scale |
| 7 | No abuse prevention | Infinite free account creation |
| 8 | Credit check before cost known | Users go into negative balance |
| 9 | No pricing page | No conversion from landing site |

---

## Composio's Pricing Model

Composio is the tool execution infrastructure CalmPilot runs on. **All CalmPilot users share one Composio org account.**

### Plan Pricing (from composio.dev/pricing)

| Plan | Monthly Fee | Standard Tool Calls | Additional Calls |
|---|---|---|---|
| Totally Free | $0 | 20K included | — |
| Ridiculously Cheap | **$29/mo** | 200K included | $0.299/1k |
| Serious Business | **$229/mo** | 2M included | $0.249/1k |
| Enterprise | Custom | Flexible | Custom |

### Premium Tool Calls (3× cost of standard)
Search APIs (Perplexity, Exa, SerpAPI), code execution (E2B), web scraping, OCR.

| Plan | Premium Calls Included | Overage |
|---|---|---|
| Totally Free | 1K | — |
| Ridiculously Cheap | 5K | $0.897/1k |
| Serious Business | 50K | $0.747/1k |

### Rate Limits
| Plan | Limit | Window |
|---|---|---|
| Starter/Hobby | 20,000 requests | 10 minutes |
| Growth | 100,000 requests | 10 minutes |
| Enterprise | Unlimited | — |

### Architecture
```
YOUR COMPOSIO ORG ACCOUNT
        │
        ├── User A (Sarah)  ──┐
        ├── User B (Alex)   ──┼──► All tool calls count against YOUR quota
        ├── User C (Rahul)  ──┘

YOUR OPENAI API KEY
        │
        ├── Sarah's LLM calls ──┐
        └── Alex's LLM calls  ──┼──► All billed to YOUR key
```

---

## Cost Structure Analysis

### Composio Tool Calls Per User Per Month

When the agent runs (trigger, briefing, or chat), it makes multiple Composio API calls:

```
Trigger fires (e.g. new Gmail email):
  fetch email + context + respond  =  ~4 calls/trigger

Daily briefing (5 apps connected):
  fetch from each app              =  ~12 calls/day

Chat message:
  fetch context + execute action   =  ~7 calls/message
```

**Average Starter user monthly Composio calls:**
```
Triggers:  30 fires/day × 4 calls × 30 days  =  3,600 calls
Briefings: 12 calls/day × 30 days             =    360 calls
Chat:      250 messages × 7 calls             =  1,750 calls
                                              ──────────────
Total:                                         5,710 calls/month
```

### LLM Costs Per Starter User

**Automation (fast model — gpt-4.1-mini):**
```
Triggers + briefings: ~930,000 tokens/month
Cost: $0.93/month
```

**Chat (standard model — gpt-4.1, 250 avg messages):**
```
250 messages × 2,500 tokens = 625,000 tokens
Cost: $2.50/month
```

### Full Variable Cost Per Starter User

```
Composio tool calls:         $1.71/month  (5,710 × $0.299/1k)
Automation LLM:              $0.93/month
Chat LLM (250 msgs avg):     $2.50/month
──────────────────────────────────────
Total variable cost:         $5.14/month

Revenue (Starter):           $19.00/month
Gross profit:                $13.86/month
Gross margin:                73%
```

---

## Final Proposed Pricing Model

### The Core Principle

**Two separate buckets — automation (subscription) and chat (counted):**

```
BUCKET 1: AUTOMATION — covered by subscription
  Triggers    → fast model → always works, never drains
  Briefings   → fast model → always works, never drains
  Actions     → fast model → always works, never drains

BUCKET 2: CHAT — counted per message
  500 messages included on Starter
  Increments by 1 per chat interaction
  Overage: $0.03/message
```

### The Tiers

| | **Free** | **Starter** | **Pro** |
|---|---|---|---|
| **Price** | $0 | **$19/mo** | **$49/mo** |
| Active triggers | 3 | Unlimited | Unlimited |
| Daily briefing | ❌ | ✅ Once/day | ✅ Priority daily briefing |
| Chat messages/mo | 50 | 500 | 2,000 |
| Chat quota reset | Hard reset monthly | Hard reset every 30 days | Hard reset every 30 days |
| AI model | Fast only | Standard | Powerful |
| Extra chat messages | — | $0.03/msg | $0.02/msg |
| Integrations | Core only | All 30 curated | All 30 curated |

### Why Each Limit

- **3 triggers on Free** — forces user to choose their top apps, feels the value, hits limit naturally
- **No briefing on Free** — the #1 feature users will miss → strongest upgrade push
- **50 chats on Free** — enough to get addicted, not enough to stay free
- **$19 Starter** — psychological SaaS sweet spot (Cursor, Perplexity, Claude Pro all use $20)
- **500 chats Starter** — ~17/day, enough for a power user
- **Standard model Starter** — noticeably better than Free's fast model
- **Priority briefing Pro** — future: morning, afternoon, evening; currently 1x/day with priority processing
- **Powerful model Pro** — the real upgrade reason; users feel the quality difference

### Profit Per Tier (Average User)

```
Free tier:
  Cost:    ~$0.50/month   Revenue: $0    Purpose: acquisition

Starter ($19/mo, 250 avg chats):
  Variable cost:   ~$5.14/month
  Gross profit:    ~$13.86/month   (73% margin)

Pro ($49/mo, 800 avg chats):
  Automation cost: ~$8.00/month
  Chat cost:       ~$8.00/month
  Total cost:      ~$16.00/month
  Gross profit:    ~$33.00/month   (67% margin)
```

### Natural Upgrade Path

```
Free user
  └─ Hits 50 chat limit    → "Upgrade to Starter"
  └─ Wants briefings       → "Upgrade to Starter"
  └─ Needs more triggers   → "Upgrade to Starter"

Starter user
  └─ Wants better AI       → "Upgrade to Pro"
  └─ Hits 500 chat limit   → "Upgrade to Pro" OR pay $0.03/msg
  └─ Wants 3× briefings    → "Upgrade to Pro"
```

### Why This Model Over Alternatives

| Dimension | Current PAYG | Subscription + Credits | **This Model** |
|---|---|---|---|
| User confusion | Low | **High** (pay twice) | **Low** |
| Guaranteed MRR | $0 | Some | **Strong** |
| "Running out" anxiety | Yes (credits drain) | Yes (credits drain) | **No** |
| Automation stops when broke | Yes | Yes | **No — automation always runs** |
| Churn risk | High | Medium | **Low** |
| Composio quota protection | None | Tier limits | **Usage caps** |
| Business valuation multiple | 1-2× revenue | 5-8× ARR | **5-10× ARR** |

---

## New User Journey

### Current Flow (Broken)

```
Visit landing page → no pricing shown
Sign up with Google
Land on dashboard with $5 credit they don't know about
Connect apps → triggers auto-created (no limits)
Credits drain silently
Credits hit $0 → red banner "Out of credits"
User confused → CHURN
```

### Proposed Flow

```
STAGE 1: LANDING
  Visit calmpilot.app
  See clear pricing: Free / Starter $19 / Pro $49
  Click "Get Started Free" OR "Start Starter"

STAGE 2: SIGNUP
  Sign in with Google → POST /auth/sync
  subscription_tier = "free" set immediately
  If Starter/Pro clicked → payment first → then dashboard

STAGE 3: ONBOARDING (most important moment)
  Screen 1: "Connect your first app"
    → Gmail, Slack, Calendar, GitHub, Notion
    → Triggers auto-created in background
    → onboarding_step = 1

  Screen 2: "Connect a second app" (skippable)
    → "The more you connect, the smarter your briefing"
    → onboarding_step = 2

  Screen 3: "Your AI is setting up"
    → Bootstrap briefing runs
    → "You'll get your first briefing tomorrow at 8 AM"
    → onboarding_step = 3

STAGE 4: DASHBOARD
  Free tier:  "You're on Free — 3/3 triggers, 50 chats/mo"
  Paid tier:  Everything unlocked, no banners, just the product

STAGE 5: UPGRADE (natural)
  Free → Starter: hits any limit → single clear CTA
  Starter → Pro: wants better AI or more chats
```

### The Activation Event

```
Connect first app → triggers start firing → FIRST BRIEFING RECEIVED
                                                    ↓
                                        "Oh. This actually works."
                                                    ↓
                                            User is retained.
```

**Everything in onboarding must be designed to reach the first briefing as fast as possible.**

---

## Composio Profitability Analysis

### Is $19 Profitable? — By Plan

#### On Totally Free Plan ($0/mo)

```
Profit per user:   $15.57  (82% margin) ✅
LIMIT: Only 3 users max (20K ÷ 5,710 calls/user)
4th user → everyone gets blocked
```

#### On Ridiculously Cheap Plan ($29/mo)

| Users | Plan/user | LLM/user | Total cost | Revenue | Profit | Margin |
|---|---|---|---|---|---|---|
| 1 | $29.00 | $3.43 | $32.43 | $19 | **-$13.43** | **LOSS** ❌ |
| 2 | $14.50 | $3.43 | $17.93 | $19 | +$1.07 | 6% ⚠️ |
| 3 | $9.67 | $3.43 | $13.10 | $19 | +$5.90 | 31% ✅ |
| 5 | $5.80 | $3.43 | $9.23 | $19 | +$9.77 | 51% ✅ |
| 10 | $2.90 | $3.43 | $6.33 | $19 | +$12.67 | 67% ✅ |
| 35 | $0.83 | $3.43 | $4.26 | $19 | +$14.74 | 78% ✅ |

**Break-even: 3 Starter users paying $19**

#### On Serious Business Plan ($229/mo)

| Users | Plan/user | Profit/user | Margin |
|---|---|---|---|
| 10 | $22.90 | **-$7.33** | **LOSS** ❌ |
| 50 | $4.58 | +$11.00 | 58% ✅ |
| 100 | $2.29 | +$13.29 | 70% ✅ |
| 350 | $0.65 | +$14.93 | 79% ✅ |

**Don't upgrade to Serious Business until 50+ paying users.**

---

## When to Switch Composio Plans

```
Right now (0–3 Starter users):
  Stay on Free ($0/mo)
  Monitor: you have 20K calls/month shared
  ⚠️ Alert yourself manually when nearing 15K/month

3–35 Starter users:
  Move to Ridiculously Cheap ($29/mo)
  200K calls covers all users comfortably
  $29 covered by just 3 subscriptions ($57 revenue)

35–150 Starter users:
  Still Ridiculously Cheap + overage
  At 50 users: ~$25/mo overage → total Composio bill $54/mo
  Still very profitable

150+ Starter users:
  Switch to Serious Business ($229/mo)
  Overage on Cheap plan exceeds the $200 upgrade cost
  Switch point: when total Composio bill > $229/mo
```

---

## Go-To-Market Launch Strategy

### The Reality
No SaaS gets paying customers on day 1. The sequence is always:

```
Users → Active Users → Engaged Users → Paying Users
You cannot skip steps.
```

### The Activation Event (Most Important)
Before a user pays, they must hit this moment:

```
Connect app → Triggers fire → Receive first briefing → "Oh wow, this works."
```

Everything in onboarding must be designed to reach the first briefing as fast as possible. Once a user sees it work, they pay. Until then, pricing doesn't matter.

### Phased Launch Plan

#### Phase 1 — Free Launch (Month 1)
```
Goal:   20-30 active users from waitlist who have connected
        apps + received at least 1 briefing

→ Invite waitlist users to Free tier
→ No credit card required
→ Collect feedback obsessively
→ Fix what's broken
→ Cost: $0 (Composio Free plan covers ~12 free users)
```

#### Phase 2 — Paid Pricing (Month 2)
```
Goal:   Convert most active free users to paid

→ Email your most active users personally:
  "You've been using CalmPilot since the beginning.
   We're launching paid plans — upgrade to Starter for $19/mo."

→ Offer early adopter coupon (EARLYBIRD) for $10 off first month
→ Even 3 Starter users = $57/mo = covers $29 Composio plan
```

#### Phase 3 — Full Pricing (Month 3+)
```
→ Free / Starter $19 / Pro $49 goes live publicly
→ All new signups see real pricing
→ You now have social proof + real users
```

### Bootstrap Revenue Milestones

```
Month 1:  0 paying users
          Composio: $0 (Free plan)
          Server/Supabase: ~$15
          Net: -$15/mo (near zero burn)

Month 2:  3 Starter × $19 = $57 MRR
          Composio: $29/mo
          Net: +$28/mo → profitable ✅

Month 3:  5 Starter + 2 Pro = $95 + $98 = $193 MRR
          Composio: $29/mo
          Net: +$164/mo

Month 6:  20 paying users → $300+ MRR → real traction
```

### What Kills Early SaaS

```
❌ Wrong:  Launch → no users → get demotivated → abandon

✅ Right:  Launch free → 20 active users → see them love it
           → introduce pricing → 3-5 convert → proof of concept
           → scale from there
```

---

## Free Tier Composio Call Analysis

### The Problem: Trigger Fires Are Unbounded

Even with only 3 triggers, a Gmail user receiving 50 emails/day fires 50 trigger events. You can't control how busy a user's inbox is. This means limiting trigger **count** is not enough — you also need to limit trigger **fires per day**.

### Free Tier Limits (Two Gates Required)

| Limit | Value | Reason |
|---|---|---|
| Active triggers | 3 | Forces users to pick top apps |
| Trigger fires/day | 10 | Caps Composio usage regardless of inbox volume |
| Daily briefing | Blocked | Single biggest Composio cost on the platform |
| Chat messages/month | 50 | Caps LLM + Composio chat costs |

### Composio Calls Per Free User (With Correct Gates)

```
Each trigger fire = 1 agent run:
  session.create()       = 1 call
  session.tools()        = 1 call
  fetch data (tool)      = 1 call
  get detail (tool)      = 1 call
  Per fire:                4 calls

Triggers:  10 fires/day × 4 calls × 30 days  = 1,200 calls
Briefing:  blocked                            =     0 calls
Chat:      50 messages × 7 calls              =   350 calls
                                              ─────────────
Total per free user:                            1,550 calls/month
```

### How Many Free Users Fit in 20K Plan

```
Without trigger fire limit (broken):
  Heavy user: ~38,000 calls/month → 1 user exhausts quota in <1 day ❌

With trigger fire limit (correct):
  1 free user:   1,550 calls  →  fits easily ✅
  5 free users:  7,750 calls  →  fits easily ✅
  10 free users: 15,500 calls →  77% of quota ✅
  12 free users: 18,600 calls →  getting close ⚠️
  13 free users: 20,150 calls →  OVER limit ❌

Safe capacity on Composio Free plan: 12 free users
```

### The Bootstrap Goal

```
12 free users → convert 3 to Starter ($19)
→ $57 revenue covers $29 Composio plan → $28 profit
→ self-funded from that point forward

Convert 3 out of 12 = 25% conversion rate — very achievable
once users have seen their first briefing work.
```

---

## Composio Call Optimizations

By optimizing how the agent runs, we can reduce calls per free user from **1,550 to ~420/month** — supporting **47 free users** on the 20K plan instead of 12.

### Optimization 1 — Batch Trigger Events (Biggest Win, 70% reduction)

**Current behaviour:** Each trigger event = its own agent run = 4 calls

```
Gmail fires 5 times in 1 hour:
  Run 1: 4 calls
  Run 2: 4 calls
  Run 3: 4 calls
  Run 4: 4 calls
  Run 5: 4 calls
  Total: 20 calls ❌
```

**With 30-minute batching:** Collect all events, process in one run

```
Gmail fires 5 times → wait 30 min → 1 agent run processes all 5:
  session.create()         = 1 call
  session.tools()          = 1 call
  GMAIL_FETCH_EMAILS (all) = 1 call  ← fetches all 5 at once
  Process + respond        = 1 call
  Total:                     4 calls ✅ (instead of 20)
```

**Impact:**
```
Before: 10 fires/day × 4 calls × 30 = 1,200 calls/month
After:  3 batches/day × 4 calls × 30 =   360 calls/month
Saving: 840 calls/month  (70% reduction)
```

### Optimization 2 — Cache `session.tools()` (Easy Win)

`session.tools()` fetches the full tool list from Composio on every single agent run. It never changes between runs. Cache it for 1 hour.

```
Before: every run = session.create + session.tools + tool calls
After:  cache tools list 1hr → skip session.tools call

Saving: 1 call per run
        3 batches/day → 3 calls/day → 90 calls/month saved
```

### Optimization 3 — Realistic Chat Call Average

Not every chat message uses Composio tools:

```
"What did you just say?"     → 0 Composio calls
"Summarize that for me"      → 0 Composio calls
"Check my emails"            → 3-4 Composio calls
"Send a reply to John"       → 2-3 Composio calls

Current assumption: 7 calls/message
Reality:            3 calls/message average
```

**Impact:**
```
Before: 50 messages × 7 = 350 calls/month
After:  50 messages × 3 = 150 calls/month
Saving: 200 calls/month
```

### Combined Result

| Component | Before | After | Saving |
|---|---|---|---|
| Triggers (batching) | 1,200 | 360 | 840 |
| session.tools cache | 0 | -90 | 90 |
| Chat (realistic avg) | 350 | 150 | 200 |
| **Total** | **1,550** | **420** | **1,130** |

```
Before optimizations: 20,000 ÷ 1,550 = 12 free users on Free plan
After optimizations:  20,000 ÷  420  = 47 free users on Free plan ✅
```

### Implementation Notes

- Batching is partially in place in `triggers.py` (events are already queued)
- Need to add: 30-minute hold before processing queued events per user
- Cache: store tools list in memory with 1-hour TTL per user
- Chat calls: already realistic — no code change needed

---

## What Needs to Be Built

### Database Changes (Supabase)

```sql
-- Add to user_credits table:
subscription_tier       TEXT DEFAULT 'free'   -- 'free' | 'starter' | 'pro'
subscription_since      TIMESTAMPTZ
billing_cycle_start     TIMESTAMPTZ
chat_messages_used      INTEGER DEFAULT 0      -- resets monthly
chat_messages_limit     INTEGER DEFAULT 50     -- 50/500/2000 by tier
```

### Backend Changes

| File | Change | Priority |
|---|---|---|
| `billing.py` | Remove dead `FLAT_FEE_COST` | Low |
| `billing.py` | Add `+$0.01` flat fee per task for Composio overhead | Medium |
| `billing.py` | Add `subscription_tier` to balance endpoint | High 🔴 |
| `chat.py` | Increment `chat_messages_used` per message | High 🔴 |
| `chat.py` | Block/charge overage when limit reached | High 🔴 |
| `app_triggers.py` | Limit trigger creation to 3 for Free tier | High 🔴 |
| `dashboard.py` | Block briefing for Free tier | High 🔴 |
| `auth.py` | Set `subscription_tier = 'free'` on signup | High 🔴 |
| `billing.py` | Add Dodo recurring subscription endpoints | Medium |
| `auth.py` | Gate model selection by tier | Medium |

### Frontend Changes

| File | Change | Priority |
|---|---|---|
| `web/src/app/pricing/page.tsx` | New pricing page | High 🔴 |
| `web/src/app/onboarding/` | 3-screen onboarding flow | High 🔴 |
| `dashboard/layout.tsx` | Replace credit banner with tier-aware UI | Medium |
| `dashboard/usage/page.tsx` | Show "X/500 chats used" instead of credit wallet | Medium |
| `web/src/context/useBilling.tsx` | Add subscription tier to context | Medium |

---

## Key Decisions Made

1. **No team tier** — dropping team/multi-seat for now, focus on individual users
2. **No credit wallet for automation** — triggers and briefings are subscription-covered, never drain
3. **Chat is message-counted, not dollar-valued** — "500 messages/month" is clearer than "$X of credits"
4. **Automation always uses fast model** — gpt-4.1-mini for all background tasks, protects margins
5. **Model quality is the Pro upgrade lever** — users feel the difference between Standard and Powerful
6. **Hard reset on chat quota monthly** — counter resets to 0 each billing cycle. Overage pricing ($0.03/msg) is the safety valve for users who need more, not rollover. Rollover was considered but rejected: it enables stockpiling, adds complexity, reduces upgrade pressure, and no competitor does it (Cursor, Claude Pro, ChatGPT Plus all hard-reset).
7. **Automation never stops even at chat limit** — only chat pauses, triggers/briefings keep running, reduces churn
8. **30 curated integrations, not 500+** — deliberate choice to keep each integration polished. Composio offers 1000+ but we only expose 30 that matter for our target user. "Request an integration" button lets demand drive expansion.
9. **$1 signup balance (overage buffer)** — new users get $1 balance instead of $5 credits. This covers ~33 overage messages if they upgrade to paid, and gates premium app connections on free tier.

---

## Implementation Status

> Updated: 2026-03-25

### Backend — All Complete

| Item | File | Status |
|---|---|---|
| Tier limits (`_TIER_LIMITS`) | `billing.py` | ✅ |
| Subscription checkout (Dodo) | `billing.py` | ✅ |
| Activate/deactivate subscription | `billing.py` | ✅ |
| Chat quota increment + overage | `chat.py` | ✅ |
| Monthly quota auto-reset (lazy) | `chat.py` | ✅ |
| Free tier trigger limit (3) | `app_triggers.py` | ✅ |
| Trigger fire rate limit (10/day) | `triggers.py` | ✅ |
| Briefing gating (free blocked) | `dashboard.py` | ✅ |
| Model gating by tier | `auth.py` | ✅ |
| 30-app whitelist | `integrations.py`, `toolkits.py` | ✅ |
| Preferred triggers for curated apps | `app_triggers.py` | ✅ |

### Frontend — All Complete

| Item | File | Status |
|---|---|---|
| Pricing page (Free/Starter/Pro) | `pricing/page.tsx` | ✅ |
| Landing page PricingSection | `PricingSection.tsx` | ✅ |
| Tier-aware status banner | `layout.tsx` | ✅ |
| Settings: Plan & Billing section | `settings/page.tsx` | ✅ |
| Settings: Model gating UI | `settings/page.tsx` | ✅ |
| Settings: Briefing gating UI | `settings/page.tsx` | ✅ |
| Settings: Referral (message-based) | `settings/page.tsx` | ✅ |
| Subscription tier in billing context | `useBilling.tsx` | ✅ |
| Checkout flow (`/checkout?plan=X`) | `checkout/page.tsx` | ✅ |
| All "credits" copy → subscription language | All pages | ✅ |
| All dead links fixed | All pages | ✅ |
| Integration pages (30 curated apps) | `integrations-data.ts` | ✅ |
| Marketing copy (30+ apps) | All landing components | ✅ |

### Not Implemented (Deferred)

| Item | Reason |
|---|---|
| `+$0.01` flat fee per Composio task | Absorbed in subscription pricing — not needed |
| 3x daily briefings for Pro | Code supports ON/OFF only; marked as "Priority briefing" for now |
| Early adopter coupon (EARLYBIRD) | Set up in Dodo dashboard — $10 off first month |
| Chat message rollover | Rejected in favor of hard reset + overage pricing |

---

*Document created: 2026-03-24*
*Implementation completed: 2026-03-25*
*Status: Fully implemented and aligned*
