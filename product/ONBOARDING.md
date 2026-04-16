# CalmPilot — Onboarding Flow Plan

---

## The Goal

Get the user from signup to their **first real, personalized briefing** in under 3 minutes.

That is the only metric that matters for onboarding. Not "profile completed", not "tour finished", not "settings configured". The moment they see a briefing built from their actual Gmail or Calendar — that is when they understand the product. Everything before that is friction to minimize.

**First Value Moment (FVM):** User sees a briefing with their own data.

---

## The Complete Flow

```
Waitlist invite email
        │
        ▼
Signup page (Google OAuth)
        │
        ▼
Timezone detection (silent, automatic)
        │
        ▼
Welcome screen (10 seconds, not skippable)
        │
        ▼
"Connect your first app" — guided, not freeform
        │
        ▼
Gmail + Calendar connected (Composio OAuth popup)
        │
        ▼
"Setting up Aariv..." (30–60 seconds)
        │  triggers auto-setup
        │  first briefing generated from live Gmail + Calendar fetch
        │
        ▼
First briefing shown — real data, their inbox, their calendar
        │
        ▼
FVM ✓ — onboarding complete
        │
        ▼
Dashboard with soft nudge: "Connect Slack to add more to your brief"
```

---

## Step-by-Step Detail

---

### Step 1: Signup

**Entry point:** Waitlist invite email → unique link → signup page

The link should carry a token so the system knows this is a waitlist user (not a random visitor). This unlocks the account without needing a separate approval step.

**What happens on first Google OAuth sign-in:**
1. Supabase creates the user
2. Backend initializes:
   - `$5 free credits` (already built in billing.py)
   - `onboarding_step = 0`
   - `timezone` — auto-detected from browser (`Intl.DateTimeFormat().resolvedOptions().timeZone`) sent in the signup request
   - `created_at` timestamp
3. User is redirected to the Welcome screen, NOT the dashboard

**What NOT to do:**
- Don't ask for name, role, company, "what do you use most" — every extra field kills 15% of signups
- Don't send them directly to the empty dashboard — they'll see nothing and leave
- Don't show a product tour overlay on top of the dashboard — they have no context yet

---

### Step 2: Welcome Screen (10 seconds)

A single full-screen moment before the dashboard. Not a carousel. Not a 5-step tour. One screen.

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│         Welcome to CalmPilot, Nitish.               │
│                                                     │
│    Aariv watches your apps 24/7 so you don't        │
│    have to. Every morning, it tells you exactly      │
│    what needs you — nothing else.                   │
│                                                     │
│    First: connect Gmail so Aariv can get started.  │
│                                                     │
│              [ Connect Gmail →  ]                   │
│                                                     │
│         Takes 30 seconds. Free forever.             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Design rules:**
- Dark background, centered text — feels like a moment, not a form
- One CTA only — Connect Gmail. Not "skip", not "explore first"
- "Free forever" removes the hesitation about connecting Google account
- User's first name from Google OAuth profile — makes it personal immediately

---

### Step 3: Connect First App (Guided, Not Freeform)

Don't drop users on the full Integrations page (1000+ apps is overwhelming). Instead, show a focused connection screen with 2 options:

```
┌─────────────────────────────────────────────────────┐
│  Connect your apps                                  │
│  Aariv will start monitoring these immediately.    │
│                                                     │
│  ┌─────────────────────┐  ┌─────────────────────┐  │
│  │  📧 Gmail            │  │  📅 Google Calendar  │  │
│  │  Free                │  │  Free                │  │
│  │  Monitors your inbox │  │  Tracks your meetings│  │
│  │                      │  │                      │  │
│  │  [Connect]           │  │  [Connect]           │  │
│  └─────────────────────┘  └─────────────────────┘  │
│                                                     │
│  ─── or connect something else ───                  │
│  Slack    GitHub    Notion    Linear    [More...]   │
│                                                     │
│                          [Skip for now →]           │
└─────────────────────────────────────────────────────┘
```

**Why Gmail + Calendar first:**
- Both are free (no credit cost to connect)
- Together they cover 80% of the briefing content
- They're the most universally used — almost every professional has both
- Google OAuth covers both in one permission grant — can connect both simultaneously

**The "connect both at once" trick:**
When user clicks "Connect Gmail", offer connecting Calendar in the same OAuth flow:
```
Connecting Gmail...
  Also add Google Calendar? (same Google account, one click)
  [Yes, add Calendar too]  [Gmail only]
```
One OAuth popup, two connected apps, twice the briefing content.

**"Skip for now":**
Visible but small. Some users will want to explore first. Let them — but track this. Users who skip onboarding have 3x higher churn. Send them a re-engagement email 24h later.

---

### Step 4: The "Day 0" Problem and How to Solve It

**This is the most important technical problem in onboarding.**

When a user connects Gmail at signup, the `trigger_events` table is empty. The trigger system needs time to fire — Composio's polling triggers run every minute, so the first Gmail event might take 1–2 minutes. The briefing, which reads from `trigger_events`, will show "No recent activity" because there's nothing yet.

**User experience without a fix:**
- Connects Gmail
- Sees "Setting up..."
- Briefing shows: "Nothing happened today. Your day looks calm."
- User thinks: "It's not working."
- User leaves.

**The fix: Immediate bootstrap fetch**

On first app connect, the backend does a one-time on-demand fetch (not waiting for triggers to fire):

```python
async def bootstrap_first_briefing(user_id: str, app_name: str):
    """
    Called once after the user's FIRST app connection.
    Fetches recent data directly from the app API and generates
    an immediate briefing — without waiting for triggers to fire.
    """
    if app_name == "gmail":
        # Fetch last 10 emails directly
        emails = composio_toolset.execute_action(
            action="GMAIL_FETCH_EMAILS",
            params={"maxResults": 10, "labelIds": "INBOX"},
            entity_id=user_id
        )
        # Write synthetic trigger events for these emails
        for email in emails:
            await write_synthetic_trigger_event(
                user_id=user_id,
                trigger_slug="GMAIL_NEW_GMAIL_MESSAGE",
                payload=email,
                source="bootstrap"
            )

    if app_name == "googlecalendar":
        # Fetch today's events
        events = composio_toolset.execute_action(
            action="GOOGLECALENDAR_EVENTS_LIST",
            params={"calendarId": "primary", "timeMin": today, "timeMax": tomorrow},
            entity_id=user_id
        )
        # Calendar is already fetched live in the briefing — no bootstrap needed

    # Now generate the briefing with real data available
    await generate_briefing(user_id)
```

**Result:** User connects Gmail → 30–45 seconds → real briefing with their actual emails. Not a demo. Not fake data. Their inbox.

---

### Step 5: "Setting Up Aariv..." Screen

While the bootstrap fetch and briefing generation run (30–60 seconds), show an animated progress screen:

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│         Setting up Aariv for you...                 │
│                                                     │
│   ✓  Gmail connected                               │
│   ✓  Monitoring triggers activated                 │
│   ⟳  Reading your inbox...                         │
│   ○  Preparing your first briefing                 │
│                                                     │
│   ━━━━━━━━━━━━━━━━━━━░░░░░  70%                    │
│                                                     │
│   Aariv is scanning your last 10 emails            │
│   to prepare your first brief.                     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

Steps shown:
1. ✓ Gmail connected
2. ✓ Monitoring triggers activated
3. ⟳ Reading your inbox... (live, SSE-driven)
4. ○ Preparing your first briefing

Each step ticks as the backend signals it via SSE. User watches it work — builds trust.

**If it takes longer than 60 seconds:** Show "This is taking a bit longer than usual. We'll email you when your briefing is ready." and release them to the dashboard. Don't hold them hostage.

---

### Step 6: First Briefing — The Moment

When ready, transition to the Home dashboard with their first real briefing already visible. No empty state. No "connect an app" CTA. Just their briefing.

```
Good morning, Nitish.
Here's what needs you today.

  ● 3 emails need attention
    Client followed up on invoice (2h ago)
    Team standup notes from yesterday
    GitHub PR assigned to you

  📅 2 meetings today
    Design review at 2 PM
    1:1 with manager at 4 PM

  💡 Aariv noticed: You have 3.5 hours of focus time before your first meeting.
```

Real data. Their inbox. Their calendar. First impression = product working.

**After the briefing loads, one soft nudge (not a modal, not a blocker):**
```
┌─ Want a fuller brief? ─────────────────────────────┐
│ Connect Slack to include your team messages.       │
│ [Connect Slack]          [Maybe later]             │
└────────────────────────────────────────────────────┘
```

---

## Onboarding State Tracking

Add to user profile (Supabase `user_profiles` table or extend existing):

```sql
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS onboarding_step INT DEFAULT 0;
-- 0 = signed up, not started
-- 1 = welcome screen seen
-- 2 = first app connected
-- 3 = first briefing seen (FVM achieved)
-- 4 = onboarding complete (second app connected or explicitly dismissed)

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS timezone TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS first_app_connected_at TIMESTAMPTZ;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS first_briefing_seen_at TIMESTAMPTZ;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS onboarding_skipped BOOLEAN DEFAULT FALSE;
```

**Why track steps:**
- Know exactly where users drop off (step 1? step 3? never?)
- Re-engagement emails trigger based on step (skipped at step 1 → different email than skipped at step 3)
- Support can see user's onboarding state instantly

---

## Re-engagement: Users Who Skip or Abandon

| Abandoned at | Trigger | Email |
|---|---|---|
| Step 1 (never connected an app) | 24h after signup | "Aariv is waiting for you — connect Gmail in 30 seconds" |
| Step 2 (connected but didn't see briefing) | 4h after connect | "Your first briefing is ready" |
| Step 3 (saw briefing, didn't return next day) | 48h later | "What did Aariv catch while you were away?" |
| Skipped onboarding entirely | 72h later | "Start here: connect Gmail. It's free and takes 30 seconds." |

All emails use Resend (already integrated). One email per trigger, not a drip sequence.

---

## What's Already Built vs What Needs Building

| What | Status | Notes |
|---|---|---|
| Google OAuth signup | ✅ Built | Supabase handles it |
| $5 free credits on signup | ✅ Built | billing.py auto-initializes |
| Home onboarding state (0 apps) | ✅ Built | Shows CTA to connect |
| Full integrations page | ✅ Built | Too overwhelming for Day 0 |
| Auto-trigger setup on connect | ✅ Built | app_triggers.py |
| Briefing generation | ✅ Built | dashboard.py |
| Welcome screen | ❌ Not built | Full-screen, pre-dashboard |
| Guided connect (2-app focus) | ❌ Not built | Currently dumps to full integrations page |
| Bootstrap first briefing fetch | ❌ Not built | Most critical gap |
| "Setting up..." progress screen | ❌ Not built | Currently no feedback during setup |
| Timezone detection on signup | ❌ Not built | Settings limitation #1 |
| Onboarding step tracking | ❌ Not built | No state persisted |
| Re-engagement emails | ❌ Not built | Resend exists, triggers don't |

---

## What NOT To Build

- **Product tour / tooltip overlays** — users learn by doing, not by reading tooltips
- **"Tell us about yourself" questions** — every extra field loses users
- **Onboarding checklist** (like Linear's "complete your setup") — for B2B tools, not personal AI assistants
- **Video walkthrough** — nobody watches these
- **Demo mode with fake data** — real data in 45 seconds is better than fake data instantly

---

## The One-Line Success Criteria

> If a user signs up and sees their own emails in a briefing within 3 minutes,
> onboarding worked.
> Everything else is noise.
