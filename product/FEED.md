# CalmPilot — Feed Page Plan

---

## Why This Page Exists

**The Feed is Aariv's memory — a full audit trail of everything it has ever seen.**

Every trigger event, every action taken, every error encountered — all of it flows through here. It answers the question: *"What exactly has Aariv been doing?"*

Without the Feed:
- Users have no way to investigate why a briefing said what it said
- Error debugging is impossible ("why did Aariv miss this email?")
- There's no transparency — users have to trust a black box

With the Feed:
- Full accountability — every event is timestamped and attributable to an app
- Error investigation — failed events link directly to the cause
- Pattern recognition — users can see which apps are most active, which are broken

The Feed is not something users check every day. But when something feels off — a missed notification, a wrong briefing item, a failed action — this is where they go to find out why.

---

## How It Connects to Every Other Page

```
Feed
       │
       ├── Triggers
       │     └── Every trigger that fires creates a row in trigger_events
       │         Feed is a view of those rows
       │         Trigger event count / error count on Triggers page = Feed data
       │         "2 errors" on Triggers page → links here filtered to that trigger
       │
       ├── Review Queue
       │     └── Every approved review item action appears here as a completed event
       │         Failed actions visible in feed for investigation
       │         "Aariv handled: Draft reply sent" — sourced from feed data
       │
       ├── Home (Dashboard)
       │     └── Home briefing reads trigger_events (same underlying table)
       │         If briefing seems wrong → check Feed to see what events were available
       │         "Why didn't Aariv mention my Stripe payment?" → Feed shows if event fired
       │
       ├── Integrations
       │     └── Feed entries are tagged by app
       │         Disconnecting an app stops new entries from that app
       │         "See activity" link on an integration card → Feed filtered to that app
       │
       └── Assistant
             └── When user asks "What happened while I was away?" → reads trigger_events
                 Feed is the human-readable version of the same data
```

---

## What's Already Built

### Frontend (`/dashboard/feed`)
- Timeline view grouped by date: Today / Yesterday / older dates
- App filter pills — click to filter by Gmail, Slack, GitHub, etc.
- Search bar — filter by trigger name, preview text
- Status badges: Received / Processing / Completed / Failed (color-coded)
- Processing time indicator per event (e.g., "142ms")
- Auto-refresh every 30 seconds
- Manual "Sync" button — calls `/webhook/sync` to pull latest from Composio
- Pagination: "Load more" at the bottom
- Stats bar: Total events / Processed / Errors / Apps active
- Empty state when no events

### Backend (`GET /dashboard/feed`)
- Filterable by `app` (prefix match on trigger_slug), `status`, `search`
- Paginated: `limit` + `offset`
- Returns stats: `total`, `completed`, `failed`, `apps` (distinct app count)
- Event shape: `id`, `triggerSlug`, `app`, `status`, `preview`, `processingTimeMs`, `error`, `createdAt`
- App detection: splits trigger_slug on `_` to extract app prefix (e.g., `GMAIL_` → `gmail`)
- Preview extraction: pulls `subject`, `title`, `text`, `summary`, `message` from payload

### Database
- Reads from `trigger_events` table — same table that feeds the home briefing and review queue
- No separate feed table — it's a filtered, formatted view of existing data

---

## Current Limitations

### 1. Trigger slugs shown as-is — meaningless to users
A feed entry shows `GMAIL_NEW_GMAIL_MESSAGE` or `GOOGLECALENDAR_EVENT_STARTING_SOON_TRIGGER`. Even with the preview text, the trigger slug next to it is developer noise. Users see a technical label where they should see a plain-English action name.

**Fix:** Same human-readable map used on the Triggers page:
```
Current:  GMAIL_NEW_GMAIL_MESSAGE · "Re: Invoice #1042"
Fixed:    New email received · "Re: Invoice #1042"
```
This map already needs to be built for the Triggers page — reuse it here.

---

### 2. No way to see the full event payload
The feed shows a one-line preview (`preview` field, max 200 chars). For Gmail that's a subject line. For GitHub that's a PR title. But when investigating an issue — "why did Aariv flag this as high priority?" — users need to see the full payload.

**Fix:** Expandable detail panel per event:
```
▼ New email received · 2h ago · Completed · 142ms
  From: alex@client.com
  Subject: Re: Invoice #1042 — still waiting
  Trigger: GMAIL_NEW_GMAIL_MESSAGE
  Review item created: Yes → [View in Review Queue]
  Briefing included: Yes (2026-03-09 briefing)
```

---

### 3. Failed events have no actionable information
When an event shows `status: failed`, the error field contains a raw Python exception message. Users see something like `ConnectionError: HTTPSConnectionPool(host='api.composio.dev')` — meaningless to them.

**Fix:** Map known error types to user-facing explanations:
```
Current: ConnectionError: HTTPSConnectionPool...
Fixed:   "Composio couldn't process this event — it will retry automatically."

Current: AuthenticationError: Token expired
Fixed:   "Your Gmail connection has expired. [Reconnect Gmail]"
```
Auth errors should link directly to the Integrations page reconnect flow.

---

### 4. Stats bar is totals only — no time context
"847 events, 23 errors" means nothing in isolation. Is that from today? All time? What's the error rate? Is 23 errors in 847 events (2.7%) normal or alarming?

**Fix:** Time-windowed stats with rate:
```
Today: 24 events  •  0 errors  •  3 apps active  •  Last: 4 min ago
All time: 847 total  •  23 errors (2.7%)
```
"Last activity" timestamp makes the system feel alive. Zero errors today means everything is healthy.

---

### 5. App filter pills are dynamic but have no counts
The filter pills appear for whatever apps the user has. But clicking "Gmail" shows N events with no indication of how many. Users don't know if Gmail has 2 events or 200 events before clicking.

**Fix:** Show counts on the filter pills:
```
[All (847)]  [Gmail (312)]  [Slack (198)]  [GitHub (95)]  [Failed (23)]
```
"Failed" as a dedicated quick-filter pill is especially useful for debugging.

---

### 6. Manual sync button behavior is unclear
The "Sync" button calls `/webhook/sync` — but users don't know what this does, why they'd need it, or if it worked. After clicking it, a toast says "Synced" but nothing visibly changes unless new events came in.

**Fix:**
- Rename "Sync" to "Check for new events"
- After sync, show count: "3 new events pulled" or "Already up to date"
- Hide the button if auto-refresh is working (only show if last refresh was >2 min ago)

---

## What To Build Next (Priority Order)

| Priority | What | Why |
|---|---|---|
| 1 | Human-readable trigger names (reuse Triggers page map) | Raw slugs are the #1 readability problem on this page |
| 2 | Time-windowed stats with "last activity" timestamp | Stats currently have no context — meaningless numbers |
| 3 | Expandable event detail panel | Debugging requires seeing full payload, review item link, briefing inclusion |
| 4 | User-friendly error messages with reconnect links | Auth errors need a CTA, not a stack trace |
| 5 | Filter pill event counts | Users need to know what's behind each filter before clicking |

---

## What NOT To Build Yet

- **Export to CSV** — pull all feed events as a spreadsheet. Phase 3 (enterprise/power users).
- **Webhook replay** — manually re-fire a failed event. Phase 3 (requires Composio support).
- **Feed-based alerts** — "notify me if error rate > 5%". Phase 3.
- **Team feed** — shared activity log across a team. Phase 4.
- **Event annotations** — add notes to a feed entry. Phase 3.

---

## The Debugging Flow (Most Important Use Case)

User asks: *"Why wasn't my Stripe payment failure in this morning's brief?"*

```
Home briefing → no Stripe proposal
        │
        ▼
User opens Feed → filters by Stripe
        │
        ├── Case A: Event is there, status Completed
        │     → Briefing had it but GPT deprioritized it → edit prompt
        │
        ├── Case B: Event is there, status Failed
        │     → Click event → expand detail → "Auth token expired"
        │     → [Reconnect Stripe] CTA
        │
        └── Case C: No event at all
              → Trigger never fired
              → Go to Triggers page → check if Stripe trigger is active
              → Or: Stripe has no trigger → synthetic poller gap
```

**The Feed is the diagnostic layer that makes every other page trustworthy.**
Without it, when something goes wrong, users have nowhere to look.
With it, every problem is investigable in under 60 seconds.
