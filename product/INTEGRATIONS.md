# CalmPilot — Integrations Page Plan

---

## Why This Page Exists

**The Integrations page is the power source of CalmPilot.**

Every feature in the product depends on connected apps:
- **Home briefing** — only works if apps are connected (calendar events + trigger events)
- **Assistant** — can only act on apps the user has connected via OAuth
- **Triggers** — automation rules only fire on connected apps
- **Review queue** — proposals only appear for connected apps
- **Feed** — activity log only shows events from connected apps
- **Suggestion chips** — dynamically generated from connected apps

Without this page, CalmPilot is a chatbot with no tools.
With it, CalmPilot becomes an AI with access to the user's entire digital work life.

**This is the most critical onboarding page in the product.**

---

## How It Connects to Every Other Page

```
Integrations Page
       │
       ├── Home (Dashboard)
       │     └── Briefing only generates if apps connected
       │         Onboarding state shown if 0 apps connected
       │         "Connect your first app" CTAs point here
       │
       ├── Assistant
       │     └── Suggestion chips are built from connected apps
       │         Agent can only call tools for connected apps
       │         "Connect an app" auth_required event links here
       │
       ├── Triggers
       │     └── Trigger rules only work on connected apps
       │         After connecting an app → auto-redirects to Triggers to customize
       │         "Customize monitoring →" toast after successful connect
       │
       ├── Review Queue
       │     └── AI proposals are always linked to a specific connected app
       │         Disconnecting an app removes its proposals from the queue
       │
       └── Feed
             └── Activity log entries are tagged by app
                 Disconnecting an app stops new entries from that app
```

---

## What's Already Built

### Frontend
- Full grid of 1000+ apps from Composio (fetched via `/integrations`)
- Connected vs disconnected status per app, shown visually
- Search bar — filter by app name
- Category filter tabs — Communication, Productivity, Developer Tools, etc.
- Grid / List view toggle
- "All" / "Connected" tab toggle
- OAuth connect flow — opens Composio OAuth in a **popup window** (not redirect — keeps user on page)
- Polls for popup close → refreshes integrations list automatically
- Disconnect flow — confirmation dialog before disconnecting
- After connect success:
  - Toast: "[App] connected! Customize monitoring →" (links to Triggers page)
  - Auto-calls `/triggers/auto-setup` to register default triggers for the new app
- Color-coded app logos — multi-color corner gradients derived from brand colors
- Manual overrides for well-known brands (Gmail, Slack, GitHub, Notion, etc.)

### Backend (`/integrations`)
- `GET /integrations` — lists all Composio toolkits + user's connected status
  - Toolkit list is cached (1-hour TTL) — not re-fetched every page load
  - Merges toolkit metadata with user's active Composio connections
  - Marks Gmail, Google Calendar as "Free" apps
  - Returns: appName, label, description, logo, status, connectedAt, isPro, canDisconnect, categories
- `GET /integrations/categories` — returns all toolkit categories (cached 1h)
- `POST /integrations/connect` — initiates OAuth via Composio, returns redirect URL
  - Credit gate: requires credits to connect paid apps
- `POST /integrations/disconnect` — disconnects a Composio connection
  - Invalidates user's trigger connections cache

---

## Current Limitations

### 1. No empty "connected apps" state
The "Connected" tab shows nothing with a blank area if no apps are connected. No CTA, no guidance — just empty.

**Fix:** When "Connected" tab is active and no apps connected, show:
```
No apps connected yet.
Connect Gmail or Google Calendar to get started — they're free.
[Connect Gmail]  [Connect Calendar]
```

---

### 2. No visual indication of what each app unlocks
Users see 1000+ apps but don't know which ones make CalmPilot most useful. Every app looks equally important.

**Fix:** Tag the 5-6 most impactful apps:
- "⭐ Most popular" badge on Gmail, Calendar, Slack, GitHub
- "Start here" section at the top of the All apps list (before the full grid)
- These 4 apps unlock 80% of the product's value

---

### 3. Connecting an app doesn't tell the user what just changed
After connecting Gmail, the toast says "Gmail connected! Customize monitoring →" — but the user doesn't know what that means. What triggers got set up? What will Aariv now do with their Gmail?

**Fix:** After connecting an app, show an explanation inline:
```
Gmail connected ✓
Aariv will now:
  • Monitor your inbox for important emails
  • Surface urgent threads in your morning brief
  • Let you read, draft, and send emails via chat
[Customize triggers]  [Go to Assistant]
```

---

### 4. No reconnect flow for expired connections
OAuth tokens expire. When a connection goes stale, the app still shows as "connected" but actions will fail silently in the assistant. User never knows.

**Fix:**
- Backend should check token validity periodically and mark connections as `expired`
- Frontend shows "Reconnect" button for expired connections with a warning badge
- This prevents the silent failure in the assistant where tools return auth errors

---

### 5. The page loads slowly on first open
Fetching 1000+ toolkits from Composio + user connections + categories on every page open is slow. The 1-hour server cache helps, but the frontend still has to wait for the API response before rendering anything.

**Fix:** Show skeleton cards immediately while loading. Already partially done — improve the skeleton to match the actual card layout.

---

## The Critical Flow: First-Time User

This is the most important flow in the entire product:

```
New user signs up
       │
       ▼
Home page → Onboarding state
"Connect your first app" → Integrations page
       │
       ▼
User sees "Start here" section:
  Gmail (Free) | Google Calendar (Free) | Slack | GitHub
       │
       ▼
User clicks "Connect Gmail"
→ Composio OAuth popup opens
→ User grants permission
→ Popup closes
→ Page refreshes: Gmail now shows as connected ✓
→ Toast: "Gmail connected! Aariv will now monitor your inbox."
→ Backend auto-registers default Gmail triggers
       │
       ▼
User goes back to Home
→ Briefing now generates (has at least 1 connected app)
→ Onboarding state gone → Calm or Active state shows
       │
       ▼
User opens Assistant
→ Suggestion chips now include Gmail chips
→ User types: "What emails need my attention?"
→ Aariv reads their Gmail and responds
```

**Every step of this flow must work flawlessly. This is where users either "get it" or leave forever.**

---

## Connection to Triggers (The Hidden Dependency)

When a user connects an app, two things happen automatically:

1. **Composio OAuth** — user's token stored, Aariv can now call that app's API
2. **Auto-setup triggers** — `POST /triggers/auto-setup` registers default monitoring rules

This means **connecting Gmail doesn't just enable chat** — it also starts monitoring the inbox for trigger events, which feed the home briefing.

The user doesn't need to know this. It just works. But the Triggers page is where they can customize or disable what gets monitored.

```
Connect Gmail
    │
    ├── OAuth stored → Assistant can read/send emails via chat
    └── Auto-triggers → Gmail inbox monitored → feeds Home briefing
                        User can customize on Triggers page
```

---

## Priority Build Order

| Priority | What | Why |
|---|---|---|
| 1 | "Start here" section with top 4 apps | First-time users need guidance on which apps to connect first |
| 2 | Post-connect explanation panel | Users need to know what changed after connecting |
| 3 | Empty "Connected" tab state with CTAs | Dead end when no apps connected |
| 4 | Expired connection handling | Silent failures destroy trust |
| 5 | Skeleton loading improvement | Faster perceived load |

---

## What NOT to Build Yet

- **App usage stats per integration** (how many times Gmail was called this week) — Feed page handles this
- **Granular permission scopes** — which Gmail permissions are granted — Phase 3 (enterprise)
- **Team-shared integrations** — one OAuth for entire team — Phase 4
- **Webhooks / API key integrations** — beyond OAuth — Phase 3
