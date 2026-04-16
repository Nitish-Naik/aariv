# V2: Unified Home Feed

> Roadmap design for merging Dashboard + Review into a single actionable feed.
> Priority: After first 10 paying customers + feedback collected.

## The Problem (V1)

Currently the user has to check two pages:
- **Dashboard (Overview):** Stats, proposals, calendar — view only, click "Act on this" goes to assistant
- **Review (Inbox):** Action items with approve/dismiss/snooze — no pre-drafted responses

Users bounce between pages to understand what needs attention. The briefing shows proposals but can't execute them. The inbox can execute but doesn't prioritize.

## The Solution (V2)

One unified feed that shows everything actionable in priority order, with inline actions.

```
┌─────────────────────────────────────────────────────────┐
│ Home                                            Settings│
│                                                         │
│ Good evening, Nitish                                    │
│ 4 items need your attention                             │
│                                                         │
│ ─── 🔴 Needs Your Decision (2) ──────────────────────── │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 📧 Email from Mike                    Waiting 2 days │ │
│ │ Budget proposal needs your input                    │ │
│ │                                                     │ │
│ │ Mike is waiting for your thoughts on the Q1 budget  │ │
│ │ allocation. He's asked about engineering headcount.  │ │
│ │                                                     │ │
│ │ ┌─────────────────────────────────────────────────┐ │ │
│ │ │ Draft reply: "Hi Mike, Thanks for sending this  │ │ │
│ │ │ over. I've reviewed the proposal and I think..." │ │ │
│ │ └─────────────────────────────────────────────────┘ │ │
│ │                                                     │ │
│ │ [Edit Draft]  [Send Reply]                          │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 📅 Calendar Conflict                      Tomorrow  │ │
│ │ Design review overlaps with team standup            │ │
│ │                                                     │ │
│ │ Both meetings at 10:00 AM. Design review was        │ │
│ │ scheduled first.                                    │ │
│ │                                                     │ │
│ │ [Skip Standup] [Reschedule Review]                  │ │
│ │ [Move Standup to 10:30]                             │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ─── 💡 Suggestions (2) ──────────────── [Dismiss all] ─ │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 📧 Email from Sarah                        2h ago   │ │
│ │ Q4 timeline follow-up                               │ │
│ │                                                     │ │
│ │ Sarah asked about the Q4 timeline. Should I let     │ │
│ │ her know we're targeting mid-November?              │ │
│ │                                                     │ │
│ │ [Dismiss]  [Later]  [Yes, reply]                    │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 🟢 Focus Time                            Tomorrow   │ │
│ │ You have 3 hours of uninterrupted time              │ │
│ │ between 2pm-5pm. Want to block it?                  │ │
│ │                                                     │ │
│ │ [Skip]  [Block on calendar]                         │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ─── ✅ All caught up ────────────────────────────────── │
│                                                         │
│ No more items need your attention right now.            │
│ Your next meeting: Team standup at 10:00 AM tomorrow.  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Key Design Principles

### 1. Priority-Based Feed
Items sorted by urgency, not chronology:
- 🔴 **Needs Your Decision** — time-sensitive, waiting on you
- 💡 **Suggestions** — AI recommends acting but not urgent
- ✅ **All caught up** — nothing left

### 2. AI Pre-Drafts Actions
The AI doesn't just flag items — it proposes specific actions:
- Email: draft reply already written, user edits or sends
- Calendar conflict: specific resolution options (move, skip, reschedule)
- Follow-up: "Should I let her know we're targeting mid-November?" (yes/no)

### 3. Inline Execution
Every action happens on the page — no navigation to assistant:
- "Send Reply" → sends the email immediately
- "Move Standup to 10:30" → updates calendar immediately
- "Yes, reply" → sends the AI-drafted response immediately

### 4. One Page Replaces Three
V1 requires: Dashboard → Review → Assistant
V2 requires: Home (everything here)

## Architecture Changes Required

### Backend
- New endpoint: `GET /api/home/feed` — returns unified priority-sorted items
- Each item includes: source app, title, description, priority, **pre-drafted actions**
- Actions endpoint: `POST /api/home/act` — executes inline action (send email, move event, etc.)
- AI generates draft responses during trigger processing (not on-demand)

### Frontend
- New `Home` page replacing current Dashboard + Review
- Card components for each item type (email, calendar, slack, task)
- Inline action buttons that call the API directly
- Optimistic UI: item disappears immediately on action, rolls back on error

### Data Model
```
home_feed_items:
  id            UUID
  user_id       UUID
  priority      "decision" | "suggestion" | "info"
  source_app    "gmail" | "googlecalendar" | "slack"
  title         TEXT
  description   TEXT
  actions       JSONB  (array of {label, type, params})
  draft_content TEXT   (AI pre-drafted reply/action)
  status        "pending" | "acted" | "dismissed" | "snoozed"
  created_at    TIMESTAMPTZ
  acted_at      TIMESTAMPTZ
```

### Trigger Processing Change
Current: trigger fires → AI summarizes → creates review item (title + description only)
V2: trigger fires → AI summarizes → drafts a response → creates feed item with actions

## What Stays the Same
- Assistant/Chat — still available for freeform requests
- Automations — trigger management stays separate
- Settings — unchanged
- Integrations — unchanged

## Migration Path
1. Build `home_feed_items` table alongside existing `review_items`
2. New trigger processing writes to both tables during transition
3. Launch new Home page as opt-in beta
4. After validation, make it default and deprecate old Dashboard + Review

## When to Build
- After 10+ paying customers
- After collecting feedback on current v1 flow
- After confirming the "act on this → assistant" flow is the main pain point
- Estimated effort: 2-3 weeks

## Reference
Design inspired by screenshot saved on 2026-03-29 showing:
- Grouped feed (Needs Decision / Suggestions)
- Inline draft replies
- Calendar conflict resolution options
- Quick action buttons
