# CalmPilot — Triggers Page Plan

---

## Why This Page Exists

**Triggers are what make CalmPilot autonomous.**

Without triggers, CalmPilot is just a chatbot — you have to ask it things manually. With triggers, it watches your apps 24/7 and reacts automatically to what happens in them.

A trigger is: **"When [event happens in app], Aariv notices and acts."**

Examples:
- When a new email arrives in Gmail → Aariv reads it, classifies it, surfaces it in the morning brief
- When a calendar event starts in 10 minutes → Aariv alerts you
- When a Stripe payment fails → Aariv flags it for your attention
- When a GitHub PR is assigned to you → Aariv queues it for review

**Without triggers, the Home briefing would be empty.** The briefing is built from trigger events — it's what Aariv "saw" while watching your apps. No triggers = nothing to brief you about.

---

## How It Connects to Every Other Page

```
Triggers Page
       │
       ├── Integrations Page
       │     └── Connecting an app → auto-setup triggers fires immediately
       │         "Customize monitoring →" toast after connect points here
       │         Disconnecting an app should pause its triggers
       │
       ├── Home (Dashboard Briefing)
       │     └── Briefing is BUILT from trigger events in the last 24h
       │         More active triggers = richer, more accurate briefing
       │         Pausing all triggers = briefing goes empty ("Nothing happened")
       │
       ├── Feed (Activity Log)
       │     └── Every trigger that fires creates a row in trigger_events table
       │         Feed is a view of those rows
       │         Trigger event count/error count shown on this page match Feed data
       │
       ├── Review Queue
       │     └── Trigger events that Aariv can't auto-handle → go to review queue
       │         The trigger is the source, the review item is the output
       │
       └── Assistant
             └── Trigger events are used as context when chatting
                 "What happened while I was away?" reads from trigger events
                 User can ask "why did Aariv flag this?" → linked to trigger
```

---

## What's Already Built

### Frontend
- Two-panel layout: left (trigger list per app), right (detail sheet)
- App-grouped triggers — triggers are organized by connected app, not a flat list
- Filter modes: All / Active / Paused / Auto-created
- Search by trigger name or app
- Stats bar: Total triggers / Active / Paused / Total events fired / Total errors
- Per-trigger:
  - Enable/Pause toggle (play/pause button)
  - Delete trigger
  - View recent events (last 10 events with status, time, processing time)
  - Edit config (for triggers with configurable fields)
  - "Auto" badge for triggers that were created automatically on app connect
  - Webhook vs Poll type badge
  - Last event time, event count, error count
- Add new trigger — browse available triggers per connected app, configure and create
- Config form modal — for triggers that require config (e.g., specific calendar ID, channel ID)

### Backend (`/triggers` + `app_triggers.py`)
- `GET /triggers` — list user's active triggers from Composio
- `POST /triggers/auto-setup` — called after app connect, auto-creates triggers
  - For known apps: uses curated `PREFERRED_TRIGGERS` list (Gmail, Calendar, Slack, etc.)
  - For unknown apps: dynamically discovers all triggers with no required config
  - Idempotent — safe to call multiple times, won't duplicate
- `POST /triggers` — manually create a trigger with config
- `PATCH /triggers/:id` — enable/disable a trigger
- `DELETE /triggers/:id` — delete a trigger
- `GET /triggers/available` — list available triggers for a specific app
- `GET /triggers/events/:id` — recent events for a specific trigger

### Auto-Setup System (the smart part)
When a user connects an app, the backend:
1. Checks `PREFERRED_TRIGGERS` — curated list for noisy apps (Gmail, Slack, Calendar, etc.)
2. Falls back to dynamic discovery — fetches all trigger types for the app, filters to only those with no required config fields
3. Creates all of them via Composio (idempotent — safe to call multiple times)
4. Caches per-app trigger list for 1 hour

This means **users never have to manually set up triggers** for common apps. It just works.

---

## Current Limitations

### 1. Users don't understand what a trigger IS
The page shows trigger slugs like `GMAIL_NEW_GMAIL_MESSAGE` and `GOOGLECALENDAR_EVENT_STARTING_SOON_TRIGGER`. Even formatted as "Gmail New Gmail Message", this is meaningless to a non-technical user.

**Fix:** Replace slug-based display with plain-English descriptions:
```
Current: GMAIL_NEW_GMAIL_MESSAGE
Fixed:   "New email in inbox"
         "Aariv watches for new emails and surfaces important ones in your brief"
```

Map the most common triggers to human-readable names + one-line explanations. For unknown triggers, use the `formatSlug()` helper that's already there.

---

### 2. No explanation of what "auto" triggers do
Auto-created triggers have an "Auto" badge but no explanation of WHY they were created or what they do. New users see a list of 8 auto-triggers and have no idea if they should keep them, what they cost, or what would happen if they paused them.

**Fix:** Add a tooltip or inline explanation on auto triggers:
```
[Auto] ← hover/click
"This trigger was automatically set up when you connected Gmail.
 It watches your inbox and feeds your morning brief."
```

---

### 3. The stats bar is meaningless without context
"47 events, 2 errors" means nothing. Is 47 a lot? Is 2 errors bad?

**Fix:**
- Events today vs all time
- Error rate percentage
- Last event time ("Last activity: 3 min ago" feels alive)
- Link errors directly to the Feed page for investigation

---

### 4. No visibility into what triggers actually produced
A user can see a trigger fired 47 times but can't quickly see what those events were or how they affected the briefing. The events panel shows raw status (success/failed) but not what the payload was.

**Fix:** In the trigger detail panel, show the last 3 events with their actual payload preview:
```
GMAIL_NEW_GMAIL_MESSAGE — 3 recent events:
  • 2h ago: "Re: Invoice #1042 — payment pending" ← this fed your brief
  • 4h ago: "Team standup notes" ← classified as low priority
  • 6h ago: "New comment on your PR" ← surfaced in review queue
```

---

### 5. Pausing all triggers kills the briefing — user doesn't know
If a user pauses all their Gmail triggers, they won't understand why their morning brief suddenly has no email content. There's no warning connecting trigger state to briefing quality.

**Fix:** When a user pauses a trigger, show a contextual warning:
```
Pausing this trigger will stop Aariv from monitoring your Gmail inbox.
Your morning brief will no longer include email summaries.
[Pause anyway]  [Keep active]
```

---

## The Auto-Setup Flow (Most Important Mechanic)

This is the hidden magic of CalmPilot that most users never see but always benefit from:

```
User connects Gmail on Integrations page
          │
          ▼
POST /triggers/auto-setup { userId, appName: "gmail" }
          │
          ▼
Backend checks PREFERRED_TRIGGERS["gmail"]
  → [{ slug: "GMAIL_NEW_GMAIL_MESSAGE", config: { userId: "me", interval: 1, labelIds: "INBOX" } }]
          │
          ▼
Creates trigger on Composio (idempotent)
          │
          ▼
Composio webhook fires whenever new email arrives
          │
          ▼
Backend receives webhook → stores in trigger_events table
          │
    ┌─────┴─────┐
    ▼           ▼
Home Briefing  Feed
(reads last   (shows
24h events)   all events)
```

**User experience:** Connect Gmail → briefing immediately starts including email summaries. No configuration needed. Magic.

---

## What Needs To Be Built Next (Priority Order)

| Priority | What | Why |
|---|---|---|
| 1 | Human-readable trigger names + descriptions | Current slug display is developer-facing, not user-facing |
| 2 | Auto-trigger explanation tooltip | Users don't know what auto triggers do or why they exist |
| 3 | Payload preview in event list | Closes the loop between trigger → what it did → where it showed up |
| 4 | Briefing impact warning when pausing | Users need to understand consequences of pausing triggers |
| 5 | Error investigation link to Feed | "2 errors" should link directly to the failed events in Feed |

---

## What NOT To Build Yet

- **Custom trigger logic** — "only alert me if email is from @client.com" — conditional filtering. Phase 3.
- **Trigger chains** — "when X happens, trigger Y" — workflow builder territory. Phase 4.
- **Trigger rate limiting settings** — let users control polling interval. Phase 3.
- **Trigger templates** — pre-built combinations like "Sales alert package" (Stripe + HubSpot + Slack). Phase 3.
- **Team-shared triggers** — one trigger feeds an entire team. Phase 4.

---

## The One-Line Summary

> Triggers are the eyes and ears of CalmPilot.
> Without them, it's blind.
> With them, it knows everything that happens in your work life — before you do.
