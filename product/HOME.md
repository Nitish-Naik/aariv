# CalmPilot — Home Screen (Dashboard) Architecture

---

## What the Home Screen Is

The home screen is the **first thing a user sees after login**. It is not a dashboard full of charts and metrics. It is a **morning brief** — a single, calm, organized view of everything that happened and everything that needs attention.

The design principle: **the user should be able to close their laptop 30 seconds after opening it** — because CalmPilot already handled everything.

---

## Three States

The home screen renders one of three states depending on the user's situation.

---

### State 1: Onboarding (New User, No Apps Connected)

**Triggered when:** User has no connected apps.

**What it shows:**
- Welcome message with their first name
- 3 recommended apps to connect first (Gmail, Google Calendar, Slack)
- "Browse all apps" button → Integrations page
- "Skip — chat with Aariv" button → Assistant page
- How it works (3 steps: Connect → CalmPilot watches → You decide)

**Goal:** Get the user to connect at least one app within the first 2 minutes.

---

### State 2: Calm (Apps Connected, Nothing Urgent)

**Triggered when:** Apps are connected but there's nothing high-priority today.

**What it shows:**
- Greeting ("Good morning, Nitish")
- Calm subtitle ("Nothing needs your attention right now.")
- Today's calendar events (if Calendar connected)
- 3 quick action buttons: Ask Aariv / Manage Triggers / Review Items
- Link to Activity Feed
- Aariv's insight (what it did quietly in the background)

**Goal:** Reassure the user. Everything is handled. You're free.

---

### State 3: Active (Apps Connected + AI Found Things To Do)

**Triggered when:** Trigger events fired recently or calendar has meetings.

**What it shows:**
- Greeting + date
- 4 stat cards: Meetings today / Focus Hours available / Emails to review / Items needing judgment
- AI Proposals (0-3 items) — specific things Aariv suggests acting on, with action buttons
- Calendar timeline (what's ahead today)
- Review queue link (if pending items exist)
- Aariv's insight
- Refresh button (re-run the briefing on demand)

**Goal:** Give the user a clear picture of their day and a one-click path to act on each item.

---

## How the Briefing Is Generated (Current — Phase 1)

```
User opens dashboard
       │
       ▼
Check in-memory cache (15-min TTL)
       │
  Cache hit? ──► Return instantly
       │
  Cache miss?
       │
       ▼
Check credits (402 if insufficient)
       │
       ▼
Fetch in parallel:
  ├── Google Calendar → today's events (via Composio)
  └── Trigger events → last 24h from all connected apps (Supabase)
       │
       ▼
Send to GPT-4o-mini with structured prompt
       │
       ▼
Returns JSON:
  {
    subtitle, is_calm, proposals,
    needs_judgment, insight, events
  }
       │
       ▼
Charge user credits (async, fire-and-forget)
Cache result (15 min)
Return to frontend
```

**Latency:** 2-5 seconds on first load. Instant on cache hit.

**Cost per briefing:** ~$0.001 (GPT-4o-mini, ~1000 tokens)

---

## The Problem With Current Approach

The briefing is **generated on-demand when the user opens the dashboard**.

This means:
- User opens app at 8 AM → waits 3-5 seconds watching a loading skeleton
- The briefing isn't "ready" — it generates in front of them
- This contradicts the core promise: *"wake up to everything already handled"*

---

## Planned Architecture — Behavioral Scheduling (Phase 2+)

### The Goal
The briefing should be **pre-generated and waiting** before the user even opens the app.

### The Challenge
Not everyone wakes up at 6 AM. Users open the app at wildly different times:
- Some at 4 AM, some at 11 PM
- Weekday patterns differ from weekends
- Travel changes everything
- Some users have no consistent pattern at all

**A fixed cron at 6 AM UTC fails for everyone outside that timezone.**
**A fixed 6 AM per timezone still assumes everyone wakes at 6 AM.**
**Averaging opens across 7 days loses weekday/weekend distinction and gets fooled by outliers.**

### The Solution: Behavioral Scheduling

**Don't guess. Learn.**

Track when the user actually first opens the app each day. After enough data, predict when to generate the briefing — 30 minutes before they typically arrive.

```
Day 1-7   → On-demand generation (current behavior)
            Log each "first open of the day" with timestamp + timezone

Day 8+    → Analyze pattern:
            ├── Separate weekday vs weekend opens
            ├── Compute median (not mean — ignores outliers)
            ├── Compute stdev (spread of opens)
            │
            ├── stdev < 1.5h → Predictable user
            │   └── Pre-generate briefing at (median - 30 min)
            │       Brief them before they wake up
            │
            └── stdev >= 1.5h → Unpredictable user
                └── Keep generating on-demand
                    Re-evaluate every 7 days
```

### Why Median Not Mean
A user who opens at 7 AM on 6 days and 2 AM once:
- Mean → 6.1 AM (distorted by the outlier)
- Median → 7 AM (correct)

### Why Weekday/Weekend Split
A user who opens at 7 AM Mon-Fri and 11 AM Sat-Sun:
- Single average → 7.6 AM (wrong for both)
- Split → 7 AM weekdays, 11 AM weekends (correct)

### Timezone Handling
- Capture timezone from browser on first login: `Intl.DateTimeFormat().resolvedOptions().timeZone`
- Store as IANA timezone string (e.g. `Asia/Kolkata`, `America/New_York`)
- All scheduling computed in user's local time
- If timezone changes for 3+ consecutive days → user is traveling → pause schedule, recalibrate

### Fallback for New Users (Day 1-7)
Use regional defaults based on detected timezone:
- India (IST) → 7 AM
- US East (EST) → 7 AM
- US West (PST) → 8 AM
- UK (GMT) → 7 AM
- Default → 7 AM UTC

### Infrastructure
```
Every 5 minutes — one cron job runs:
"Find all users whose scheduled briefing time falls in the next 5 minutes"

For each matched user (in parallel):
  1. Fetch calendar + trigger events
  2. Run GPT → briefing JSON
  3. Store in briefings table (not memory cache)
  4. Send morning email via Resend
  5. Update last_briefing_sent_at

User opens dashboard at their usual time:
  GET /dashboard/briefing
  → Today's briefing already exists in DB → return instantly
  → No briefing yet (new user / irregular) → generate live
```

### Database Schema
```sql
-- Track first opens per day
CREATE TABLE user_activity_log (
  user_id      uuid    NOT NULL,
  activity_date DATE   NOT NULL,
  first_open_at timestamptz NOT NULL,
  timezone      TEXT   NOT NULL,
  PRIMARY KEY (user_id, activity_date)
);

-- Store pre-generated briefings
CREATE TABLE briefings (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL,
  briefing_date DATE NOT NULL,
  data          jsonb NOT NULL,
  emailed_at    timestamptz,
  created_at    timestamptz DEFAULT now(),
  UNIQUE (user_id, briefing_date)
);

-- Add to user settings
ALTER TABLE user_credits
  ADD COLUMN timezone      TEXT DEFAULT 'UTC',
  ADD COLUMN briefing_time TIME DEFAULT '07:00',  -- learned or user-set
  ADD COLUMN briefing_stdev FLOAT;                -- spread of their opens
```

---

## Morning Email (Phase 2)

When the briefing is pre-generated, send a morning email via Resend with:
- Today's date + greeting
- Subtitle (the one-line summary)
- Stat cards (meetings, emails, focus hours)
- Top 1-2 proposals (what needs attention)
- Link to open the full dashboard
- "Nothing needed today" message if is_calm = true

The email is the **push** that brings them to the dashboard.
The dashboard is the **pull** that lets them act on it.

---

## Phase Rollout

| Phase | Users | Briefing Method |
|---|---|---|
| **Phase 1** (now) | 0-50 | On-demand, 15-min memory cache |
| **Phase 2** | 50-200 | Collect activity logs, learn patterns, pre-generate for consistent users |
| **Phase 3** | 200-1000 | Weekday/weekend split, timezone detection, stdev gating, morning email |
| **Phase 4** | 1000+ | User-configurable briefing time in Settings, team briefings, multi-timezone |

---

## What "Done" Looks Like

A user sets up CalmPilot on Monday. By the following Monday:
- CalmPilot has learned they open the app at 7:15 AM on weekdays
- At 6:45 AM every weekday, the briefing is generated and emailed
- They open their phone at 7:15 AM, see the email: "3 things need you today"
- They tap through to the dashboard — it loads instantly, briefing already there
- In 90 seconds they know exactly what their day looks like
- They close the app and start their real work

**That is the product.**
