# CalmPilot — Usage & Credits Page Plan

---

## Why This Page Exists

**Credits are the fuel. This page is the fuel gauge.**

CalmPilot runs on AI — every briefing, every assistant message, every review item action consumes tokens, which costs real money. The credit system lets users pay for what they use without a surprise monthly bill. This page is where they see exactly what they've spent, on what, and top up when needed.

Without this page, users:
- Don't know why actions suddenly stop working (out of credits)
- Have no visibility into what's expensive vs cheap
- Can't predict their monthly cost
- Have no trust in the billing system

With it, the credit system feels fair and transparent — users know exactly what they're getting for their money.

---

## How It Connects to Every Other Page

```
Usage / Credits
       │
       ├── Assistant
       │     └── Every chat message consumes credits (token-based)
       │         If balance hits 0 → assistant returns "insufficient_credits" event
       │         Assistant shows inline "Add credits" CTA when credits run out
       │         Model selection (Standard vs Powerful) directly affects burn rate
       │
       ├── Home (Dashboard Briefing)
       │     └── Briefing generation costs credits (GPT-4o-mini call)
       │         If balance = 0 → briefing returns 402, home shows empty/error state
       │         Briefing is the most frequent automatic credit consumer
       │
       ├── Review Queue
       │     └── Approving an action costs credits (agent executes via GPT)
       │         Credit check happens before each approval
       │         Failed approval due to 0 credits → shown as error toast
       │
       └── Settings
             └── Auto-refill configuration lives here OR in Settings
                 Model preference set in Settings affects cost-per-message here
```

---

## What's Already Built

### Frontend (`/dashboard/usage`)
- Credit balance display with visual progress bar
- "Add Credits" modal with preset amounts: $10 / $25 / $50 / $100
- Custom amount input in the modal
- Usage summary by model: input tokens, output tokens, cost per model
- Spending history: transaction log with amount, description, timestamp
- Auto-refill configuration toggle
- Dodo Payments checkout integration

### Backend (`/billing`)
- `GET /billing/balance/{user_id}` — credit balance; auto-initializes new users with **$5 free credits**
- `GET /billing/usage/{user_id}?days=30` — usage summary grouped by model
- `GET /billing/history/{user_id}?limit=20` — transaction history
- `POST /billing/create-checkout` — Dodo Payments checkout session
- `POST /billing/setup-auto-refill/{user_id}` — configure auto-top-up
- `charge_user()` — internal function called after every AI operation
- `check_credits()` — gate function called before expensive operations
- Atomic billing via Supabase RPC (prevents double-charge race conditions)

### Pricing Model
| Model | Input (per 1M tokens) | Output (per 1M tokens) |
|---|---|---|
| GPT-5.4 | $2.50 | $15.00 |
| GPT-5 | $1.25 | $10.00 |
| GPT-4.1 | $2.00 | $8.00 |
| GPT-4.1-mini | $0.40 | $1.60 |
| GPT-4o | $2.50 | $10.00 |

4x markup applied → ~75% gross margin.
New users get **$5 free credits** on signup (auto-initialized by balance endpoint).

---

## Current Limitations

### 1. Users don't know what their $5 will actually buy them
A new user sees "$5.00 credits" with no reference point. Is that 1 day? 1 week? 1 month of normal use? They have no idea if they should top up immediately or if $5 will last a month.

**Fix:** Show a "your $5 lasts approximately X days at your usage rate":
```
Balance: $4.23
━━━━━━━━━━━━━━━━━━━━━░░░░  84%

At your current usage rate (~$0.08/day):
Runs out in ~52 days  •  [Add Credits]
```
For new users with no usage history: show a reference from median user data.
"Most users spend $2–8/month depending on how much they chat."

---

### 2. Usage summary shows token counts — users don't think in tokens
"GPT-4.1-mini: 42,310 input tokens, 8,421 output tokens, $0.04" is technically accurate but meaningless to a non-technical user. They care about: how many chats? How many briefings? How many actions?

**Fix:** Translate tokens into actions:
```
This month's usage — $0.82 total

  📧 Morning briefings    18×    $0.12
  💬 Assistant chats      34×    $0.51
  ✅ Review actions        8×    $0.19

  Most expensive chat: "Research competitors and summarize" — $0.08
```
Keep the raw token data available under a "Details" toggle for power users.

---

### 3. Transaction history is too granular — one row per API call
Every `charge_user()` call creates a transaction row. A single "What happened while I was asleep?" chat might generate 5-6 rows (one per tool call). The history tab shows a wall of micro-transactions — "$0.001", "$0.003", "$0.002" — which feels broken, not transparent.

**Fix:** Group micro-transactions by conversation or action:
```
Spending History

Mar 9    Assistant: "Summarize my emails"           -$0.04
Mar 9    Morning Briefing                           -$0.01
Mar 8    Assistant: "Draft reply to client"         -$0.03
Mar 8    Review: Approved "Client invoice reply"    -$0.02
Mar 7    Credit purchase — $10.00                  +$10.00
```
Each "conversation" row is a rollup of all micro-charges within that session.

---

### 4. Auto-refill exists but isn't explained
There's a toggle for auto-refill but no explanation of how it works — when does it trigger? What amount does it refill? Can they set the threshold? The UI has the option but no education around it.

**Fix:** Inline explanation with configurable threshold:
```
⚡ Auto-refill
When your balance drops below $2.00, automatically add $10.00.
You'll be charged to your saved card on file.

  Trigger threshold:  [ $2.00 ▾ ]
  Refill amount:      [ $10.00 ▾ ]

  [Enable Auto-refill]
```
The user sets it once and never thinks about it again.

---

### 5. No warning when balance is critically low
If a user has $0.30 left, they'll hit the credit gate mid-conversation — the assistant will stop responding and show an error. There's no proactive warning before this happens.

**Fix:** Persistent low-balance banner across the dashboard when balance < $1.00:
```
⚠ Low credits — $0.43 remaining. Add credits to keep Aariv running.  [Add $10]
```
This banner appears on every dashboard page (injected in the layout), not just Usage.

---

## The Billing Trust Problem

The biggest risk with a credit system is that users feel nickled-and-dimed or surprised by charges. Two things that kill trust:

1. **Silent failures** — action fails because of 0 credits, user doesn't know why
2. **Unexpected charges** — user does something they thought was cheap, it costs $0.50

**The fix for both:**

Before any expensive operation (complex agent run, multi-tool task), show a cost estimate:
```
This task will use multiple tools and may cost $0.05–0.15.
Your balance: $2.14    [Continue]  [Cancel]
```
Only show for operations above a threshold (e.g., >$0.05 estimated). Briefings and simple reads don't need a warning.

---

## What To Build Next (Priority Order)

| Priority | What | Why |
|---|---|---|
| 1 | "Balance lasts X days" estimate | New users have no cost reference — this prevents immediate churn |
| 2 | Low-balance banner across dashboard | Silent 402 failures are the #1 trust killer |
| 3 | Translate usage to actions (not tokens) | Token counts mean nothing to non-technical users |
| 4 | Group transaction history by conversation | Wall of micro-transactions looks broken |
| 5 | Auto-refill configuration UI with explanation | Toggle exists but isn't usable without context |

---

## What NOT To Build Yet

- **Subscription plan** (flat monthly fee instead of pay-per-use) — Phase 3. Keep credits for now — they align cost with value and prevent churned users from paying for nothing.
- **Team billing** — shared credits across a team, admin controls usage per member — Phase 4.
- **Invoice generation** — PDF invoices for business expense claims — Phase 3.
- **Usage alerts** — "email me when I spend $X this month" — Phase 2.
- **Free tier with hard limits** — "100 actions/month free then pay" — evaluate after 200 users to see if credits or subscription converts better.

---

## The One-Line Summary

> The credit system should be invisible when it's working
> and impossible to ignore — but never punishing — when it isn't.
