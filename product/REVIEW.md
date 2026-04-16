# CalmPilot — Review Queue Page Plan

---

## Why This Page Exists

**The Review Queue is the human-in-the-loop layer.**

Aariv can act on many things automatically — read emails, check calendars, post Slack messages. But some things require judgment. A client escalation, a payment failure, a PR that needs a decision — Aariv can surface these and propose what to do, but a human must approve before it acts.

Without this page, Aariv is either:
- **Too passive** — shows you information but never acts on it
- **Too aggressive** — acts on everything without asking, which breaks trust fast

The Review Queue is the balance. Aariv proposes. You decide. One tap.

A review item is: **"Aariv noticed [event], thinks you should [action]. Approve?"**

---

## How It Connects to Every Other Page

```
Review Queue
       │
       ├── Triggers
       │     └── Trigger events that Aariv can't auto-handle → create review items
       │         The trigger is the SOURCE, the review item is the OUTPUT
       │         Pausing a trigger also pauses its review item generation
       │
       ├── Home (Dashboard)
       │     └── Home proposals ARE review items (same data, different view)
       │         "Draft with Aariv" button on a proposal → opens assistant with context
       │         "Review" action on a proposal → links directly to this page
       │         needs_judgment count on home = pending review items count
       │
       ├── Assistant
       │     └── Approving a review item → executes via the assistant's agent
       │         User can click "Handle with Aariv" → opens assistant with pre-filled prompt
       │         "Why did Aariv flag this?" → linked to original trigger event
       │
       ├── Feed
       │     └── Every review item approval/dismissal appears as a feed event
       │         Feed shows "Aariv handled: [action]" after approval
       │         Failed actions visible in feed for investigation
       │
       └── Integrations
             └── Review items are always linked to a specific connected app
                 Disconnecting an app removes its pending review items
                 App logo shown on each review card
```

---

## What's Already Built

### Frontend (`/dashboard/review`)
- Inbox-style layout with three tabs: Pending / Resolved / All
- Priority levels: High / Medium / Low with color-coded badges
- Per-item actions:
  - **Approve** — Aariv executes the suggested action immediately
  - **Dismiss** — marks as resolved, no action taken
  - **Snooze** — hide for 15 min / 1 hr / 4 hrs / Tomorrow
- App-specific color coding (Gmail red, GitHub dark, Slack purple, Calendar blue, etc.)
- AI confidence indicator (stored, not prominently displayed)
- Auto-refresh every 30 seconds for pending items
- "Dismiss all" batch operation
- Action result toasts (success/error)
- Empty state when queue is clear

### Backend (`/review`)
- `GET /review` — list items by status (pending / resolved / all)
- `POST /review/act` — approve / dismiss / snooze a specific item
- `POST /review/dismiss-all` — dismiss all pending items for a user
- Priority ordering: high → medium → low
- Snooze un-expiry: items resurface after snooze window ends
- Credit check before executing approved actions
- Token usage tracking and billing for AI executions
- `create_review_item()` helper — creates items in `review_items` table

### Database (`review_items` table)
```
id, user_id, source_app, trigger_slug, title, description,
priority, category, status, actions[], action_context,
ai_confidence, created_at, updated_at
```

---

## The Critical Gap: How Review Items Are Created

This is the most important architectural gap in the current system.

Review items need to be created automatically when trigger events fire. Right now `create_review_item()` exists as a helper, but the pipeline from **trigger fires → review item created** is not fully wired.

### How it should work:

```
Composio webhook fires (trigger event received)
        │
        ▼
POST /webhook/trigger-event
        │
        ▼
Webhook handler:
  1. Stores raw event → trigger_events table
  2. Classifies event: auto-handle OR needs-judgment?
        │
        ├── Auto-handle (low-stakes, Aariv can act alone)
        │     └── Execute action immediately → write result to feed
        │
        └── Needs judgment (high-stakes, irreversible, or uncertain)
              └── create_review_item() → review_items table
                  → appears in Review Queue
                  → counted in Home briefing needs_judgment
```

### Classification logic (needs to be built):
```python
ALWAYS_REVIEW = [
    "GMAIL_NEW_GMAIL_MESSAGE",           # Emails — Aariv reads, user decides what to reply
    "STRIPE_PAYMENT_FAILED_TRIGGER",     # Money — always escalate
    "SALESFORCE_NEW_LEAD_TRIGGER",       # CRM — sales decisions aren't auto
    "GITHUB_PULL_REQUEST_EVENT",         # Code review — needs human eyes
]

AUTO_HANDLE = [
    "GOOGLECALENDAR_EVENT_STARTING_SOON_TRIGGER",  # Just a reminder, no action needed
    "SLACK_REACTION_ADDED",                         # Informational only
]
```

Without this wiring, the review queue only gets populated by the home briefing's proposal generation (GPT call every 15 min), which means:
- Items appear with a delay (up to 15 min after event)
- Items are missed if the briefing isn't regenerated
- The queue and the trigger events table are disconnected

---

## Current Limitations

### 1. No context shown — users approve blindly
A card says "Client followed up on invoice" but there's no way to see the actual email content. The user has to approve or dismiss based on the title and description alone — they can't verify what Aariv saw.

**Fix:** Expandable context panel on each review card:
```
[Client followed up on invoice]         High  Gmail
Aariv recommends: Draft a reply

▼ Show context
  From: alex@client.com
  Subject: Re: Invoice #1042 — still waiting
  "Hi, just following up on the invoice sent 10 days ago..."
  [Full email preview here]

[Approve]  [Dismiss]  [Snooze ▾]
```

---

### 2. AI confidence is invisible
The `ai_confidence` field exists in the database but isn't shown to users. A 95% confidence item and a 40% confidence item look identical on screen. Users have no signal for how much to trust the classification.

**Fix:** Show confidence as a subtle label:
```
● High priority    Gmail    Confidence: 94%
                            "Aariv is very sure this needs attention"
```
Or: sort by confidence within priority groups. Low-confidence items appear last and greyed slightly.

---

### 3. The only batch action is "Dismiss All" — not useful enough
"Dismiss All" is the nuclear option. Users often want:
- "Dismiss all low priority" (keep the important ones)
- "Approve all calendar items" (calendar reminders are safe to bulk-approve)
- "Snooze all until tomorrow"

**Fix:** Batch action bar appears when multiple items are selected:
```
☑ 3 selected  [Approve selected]  [Dismiss selected]  [Snooze selected ▾]
```

---

### 4. No notification when high-priority items arrive
A payment failure at 2 AM creates a review item. The user sees it the next morning at 10 AM — 8 hours later. For high-priority items, this lag destroys the value of the queue.

**Fix (Phase 2):**
- Email notification for `priority: "high"` items (Resend integration already exists)
- In-app badge on the nav item showing pending count
- Push notification if/when mobile is built

---

### 5. After approving, users don't know what actually happened
User clicks "Approve" on "Draft reply to client invoice". The action succeeds. But:
- Did Aariv send the email or just draft it?
- What did the draft say?
- Can they undo it?

The toast just says "Action completed". That's not enough for irreversible actions.

**Fix:** Post-approve result card inline on the item:
```
✓ Approved 2 min ago
  Aariv drafted a reply: "Hi Alex, apologies for the delay..."
  [View draft in Gmail]  [Undo — send to trash]
```

---

## What To Build Next (Priority Order)

| Priority | What | Why |
|---|---|---|
| 1 | Wire trigger events → review item creation | Without this, review queue is populated only by briefing (slow, partial) |
| 2 | Context panel (expand to see payload) | Users approve blindly without this — kills trust |
| 3 | Post-approve result card | Users don't know what Aariv actually did |
| 4 | AI confidence display | Low-confidence items should look different from high-confidence ones |
| 5 | Multi-select batch actions | "Dismiss all low priority" is a daily workflow |

---

## What NOT To Build Yet

- **Team review queue** — shared inbox for a team to approve items. Phase 4 (multi-user).
- **Custom approval rules** — "Auto-approve if confidence > 90% and app is Calendar". Phase 3.
- **Email/Slack notifications** — push alerts for high-priority items. Phase 2 (after core queue works).
- **Conditional snooze** — "Snooze until client replies" (event-based snooze, not time-based). Phase 3.
- **Review item comments** — annotate why you dismissed or approved. Phase 3.

---

## The Core Experience Goal

User opens CalmPilot at 9 AM. Review queue has 3 items:

```
● High    Gmail    "Client escalated invoice — 3rd follow-up"
  Aariv drafted a firm but polite reply.     [Approve]  [Edit first]  [Dismiss]

● High    Stripe   "Payment failed — $340 subscription"
  Aariv flagged for retry or customer contact.  [Approve]  [Dismiss]

● Low     GitHub   "PR approved by team — ready to merge"
  Aariv can merge when you're ready.         [Approve]  [Dismiss]
```

User takes 45 seconds. Three real business decisions made. Inbox zero. Done.

**That is the Review Queue done right.**
