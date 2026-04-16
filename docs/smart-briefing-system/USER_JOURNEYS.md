# User Journeys — Smart Briefing System

## Journey 1: New User — First Day

```
2:00 PM  User signs up, connects Gmail
         └── user_briefing_state created: cursor = NULL

2:01 PM  Bootstrap runs: fetches 10 emails → writes trigger_events

2:02 PM  User opens dashboard
         ├── cursor = NULL → fallback to last 24h
         ├── 10 bootstrap events found
         ├── GPT generates: "12 emails scanned, 3 need attention"
         ├── briefing_type: "first"
         ├── Tone: warm, comprehensive
         └── cursor advances to 2:02 PM

2:30 PM  User checks again
         ├── Events since 2:02 PM → 0
         ├── Return: "You're all caught up"
         ├── No AI call ($0)
         └── Calendar events still shown live

5:00 PM  2 new emails arrive → trigger_events written
         └── Supabase Realtime → frontend shows "2 new events" banner

5:05 PM  User clicks "Refresh"
         ├── Events since 2:02 PM → 2
         ├── GPT generates incremental: "2 new emails since this afternoon"
         ├── briefing_type: "incremental"
         └── cursor advances to 5:05 PM
```

## Journey 2: Morning Briefing (The Hero Feature)

```
OVERNIGHT (user sleeping):
  9 PM   Investor email arrives → trigger_event
  11 PM  Calendar event moved → trigger_event
  6 AM   Slack DM from CTO → trigger_event

7:30 AM  Cron pre-generates morning briefing
         ├── Reads cursor (5:05 PM yesterday)
         ├── 3 events since then
         ├── GPT: "Overnight: investor email, cal change, CTO DM"
         ├── Stores in briefings table
         └── Does NOT advance cursor

8:00 AM  User opens CalmPilot ←── AHA MOMENT
         ├── Pre-generated briefing served instantly (no wait)
         ├── ☀️ "While you slept:"
         │   ├── 📧 Investor follow-up email (URGENT)
         │   ├── 📅 10 AM meeting moved to 11 AM
         │   └── 💬 CTO: "deploy failed, fixed at 3 AM"
         │
         ├── 🤖 Proposals:
         │   ├── [Reply to investor] → Act on this
         │   ├── [Acknowledge cal change] → Dismiss
         │   └── [Reply to CTO] → Act on this
         │
         ├── Check: events since pre-gen (7:30-8:00)?
         │   └── 0 → no "new since" banner
         └── cursor advances to 8:00 AM

         User thinks: "This is exactly what I needed."
         User is hooked.
```

## Journey 3: Incremental Update (Midday)

```
12:00 PM  User checks dashboard
          ├── Events since 8:00 AM → 5 new emails, 1 Slack
          ├── GPT: "Since this morning: 5 emails (1 urgent), team standup notes on Slack"
          ├── briefing_type: "incremental"
          ├── Tone: brief, highlights only
          └── cursor advances to 12:00 PM

12:15 PM  User checks again
          ├── Events since 12:00 PM → 0
          ├── "All caught up" (no AI call)
          └── cursor stays at 12:00 PM
```

## Journey 4: Grace Period User (Free, Day 2)

```
8:00 AM  Free user opens dashboard
         ├── is_in_grace_period() → true (day 2 of 3)
         ├── Briefing allowed
         ├── Same cursor logic applies
         └── Morning briefing generated and shown

Day 4:
8:00 AM  Free user opens dashboard
         ├── is_in_grace_period() → false
         ├── 403: briefing_requires_paid_plan
         ├── Dashboard shows: "Upgrade for daily briefings"
         └── User remembers how good the briefing was → UPGRADES
```

## Journey 5: Paid User (Starter/Pro)

```
Same as Journey 2, but:
  ├── No grace period check needed
  ├── Briefing always available
  ├── Pro users: priority briefing (processed first by cron)
  └── Overage chat messages available if quota exceeded
```

## Journey 6: Real-Time Event Notification

```
User has dashboard open:

  ┌─────────────────────────────────────────────┐
  │  ☀️ Morning Brief                           │
  │  3 urgent emails, 2 meetings today          │
  │                                              │
  │  ┌────────────────────────────────────────┐  │
  │  │ 🔄 2 new events since your last check  │  │
  │  │         [ Refresh briefing ]           │  │
  │  └────────────────────────────────────────┘  │
  │                                              │
  │  [Proposals...]                              │
  │  [Calendar...]                               │
  └─────────────────────────────────────────────┘

User clicks "Refresh briefing":
  ├── GET /briefing?force=true
  ├── 2 new events since cursor → incremental briefing
  ├── Banner disappears
  └── cursor advances
```

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| User never opens dashboard | Cursor stays NULL, morning briefing pre-gens but user doesn't see it |
| User opens on phone + laptop simultaneously | RPC `advance_briefing_cursor` is atomic — no duplicate briefings |
| Bootstrap events on first connect | cursor = NULL → shows all bootstrap events as "first briefing" |
| 100+ events overnight | Briefing limited to 50 most recent events, sorted by priority |
| No trigger events at all (new user, nothing happened) | "All caught up" calm state with calendar only |
| User disconnects all apps | No trigger events → "All caught up" permanently until reconnect |
