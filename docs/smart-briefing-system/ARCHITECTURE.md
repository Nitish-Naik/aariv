# Architecture — Smart Briefing System

## Core Concept: Event Cursor

```
EVENT TIMELINE
═══════════════════════════════════════════════════

  ┌─email─┐ ┌─slack─┐ ┌─email─┐ ┌─cal─┐ ┌─email─┐
  └───────┘ └───────┘ └───────┘ └─────┘ └───────┘
  2 PM       4 PM      9 PM     11 PM    6 AM

                    ▲                         ▲
                    │                         │
              CURSOR                      NOW (8 AM)
              (last seen: 4 PM)

  ┌──── Already seen ────┐ ┌── NEW (briefing) ──┐
```

The cursor (`events_cursor_at`) is a timestamp stored per user. It advances every time the user views a briefing. Events before the cursor are "already seen." Events after are "new."

## System Flow

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  COMPOSIO   │     │   SUPABASE   │     │   FRONTEND   │
│  (webhooks) │     │  (database)  │     │  (dashboard)  │
└──────┬──────┘     └──────┬───────┘     └──────┬───────┘
       │                   │                     │
       │  Trigger fires    │                     │
       │──────────────────►│ trigger_events      │
       │                   │ INSERT              │
       │                   │                     │
       │                   │ ─── Realtime ──────►│
       │                   │ "new event"         │ Banner:
       │                   │                     │ "New events"
       │                   │                     │
       │                   │              User opens dashboard
       │                   │              or clicks Refresh
       │                   │                     │
       │                   │◄────────────────────│
       │                   │ GET /briefing       │
       │                   │                     │
       │          ┌────────┴────────┐            │
       │          │ BRIEFING ENGINE │            │
       │          │                 │            │
       │          │ 1. Read cursor  │            │
       │          │    from         │            │
       │          │    user_briefing│            │
       │          │    _state       │            │
       │          │                 │            │
       │          │ 2. Count events │            │
       │          │    since cursor │            │
       │          │                 │            │
       │          │ 3a. 0 events:   │            │
       │          │    "Caught up"  │───────────►│ Calm state
       │          │    (no AI, $0)  │            │
       │          │                 │            │
       │          │ 3b. N events:   │            │
       │          │    GPT-4o-mini  │            │
       │          │    → Generate   │───────────►│ Briefing!
       │          │    → Advance    │            │
       │          │      cursor     │            │
       │          └─────────────────┘            │
```

## Briefing Types

| Type | When | Prompt tone | AI cost |
|------|------|-------------|---------|
| **First** | User's first ever briefing | Warm, comprehensive, welcoming | ~$0.005 |
| **Morning** | First open of the day (overnight events) | Organized, prioritized, "here's your day" | ~$0.005 |
| **Incremental** | Midday check (few hours since last) | Brief, highlights only, "since you last checked" | ~$0.003 |
| **Caught up** | No new events since last check | No AI call, static response | **$0** |

## Cost Comparison

```
CURRENT (fixed 24h):
  Every dashboard open → AI call → ~$0.005
  10 checks/day → $0.05/day → $1.50/month per user
  100 users → $150/month

SMART CURSOR:
  Morning + 1-2 incremental → 2-3 AI calls/day → $0.015/day
  Caught-up checks → $0
  100 users → $45/month (70% reduction)
```

## Pre-Generated Morning Briefing

```
7:30 AM  Cron runs for user
         ├── Read cursor (e.g., yesterday 4 PM)
         ├── Query events since cursor → 5 overnight events
         ├── Generate briefing via GPT
         ├── Store in briefings table
         └── Do NOT advance cursor ←── CRITICAL
                                       (user hasn't seen it yet)

8:00 AM  User opens dashboard
         ├── Pre-generated briefing served (instant, no wait)
         ├── Check: any events since pre-gen (7:30-8:00)?
         │   ├── Yes → show "1 new event since your morning brief"
         │   └── No → show briefing as-is
         └── Advance cursor to 8:00 AM ←── NOW it advances
```

## Cache Strategy

- In-memory cache with 15-min TTL (existing)
- Cache invalidated when new trigger_event is written for the user
- Cache key includes cursor timestamp to prevent stale data
- "Caught up" responses are cached too (cheapest to serve)
