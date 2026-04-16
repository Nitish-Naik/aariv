# Smart Briefing System

> Architecture document for CalmPilot's cursor-based briefing engine.
> Created: 2026-03-28

## Problem

The current briefing system shows a fixed 24-hour window of events. If the user was active during the day and already handled their emails/messages, the briefing recaps what they already know. That's useless.

## Solution

Replace the fixed 24h window with an **event cursor** that tracks where the user last left off. Briefings only show events that arrived AFTER the cursor.

## Documents

- [Architecture](./ARCHITECTURE.md) — System design, data flow, diagrams
- [Database](./DATABASE.md) — New tables, RPC functions, migrations
- [Implementation](./IMPLEMENTATION.md) — Step-by-step build plan
- [User Journeys](./USER_JOURNEYS.md) — How each scenario plays out

## Key Design Decisions

1. **Cursor, not window** — Events are scoped to "since last seen," not "last 24 hours"
2. **No AI call when caught up** — If 0 new events since cursor, return static response ($0 cost)
3. **Pre-gen does NOT advance cursor** — Only user viewing the briefing moves the cursor forward
4. **Supabase Realtime** — Frontend gets notified when new events arrive (no polling)
5. **Three briefing types** — First, Morning, Incremental (each gets different GPT prompt tone)
