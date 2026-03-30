# The Morning Briefing

The morning briefing is the first thing you see when you open CalmPilot. It's a single, calm summary of everything that happened since you last checked — built automatically from your connected apps.

---

## What is the Morning Briefing?

Instead of opening Gmail, then Slack, then Calendar, then GitHub — one by one — CalmPilot pulls everything together and tells you only what matters. The briefing answers one question: **"What actually needs me today?"**

Everything else — the noise, the low-priority threads, the FYI messages — is filtered out.

---

## What It Shows

The briefing changes depending on what's going on. Here's what you might see:

### Greeting and Status

At the top, a greeting with your first name and a one-line summary of the day:

- **"Nothing needs your attention right now."** — When things are calm. Enjoy your morning.
- **"3 things need you today."** — When there are items requiring a decision or action from you.

### Stat Cards

Four quick numbers:

| Card | What it means |
|---|---|
| Meetings today | How many calendar events you have |
| Focus hours | Uninterrupted time available before your first meeting |
| Emails to review | Emails that rose to a level worth your attention |
| Items needing judgment | Things Aariv flagged that require a human decision |

### AI Proposals

Up to 3 specific suggested actions Aariv is recommending. For example:

- *"Client followed up on invoice from last week. Reply?"*
- *"PR #47 has been waiting for your review for 2 days."*
- *"Your 2 PM and 3 PM meetings overlap — resolve conflict?"*

Each proposal has action buttons so you can act immediately without leaving the dashboard.

### Calendar Timeline

A list of what's on your calendar today, shown in time order.

### Aariv's Insight

A short note from Aariv about something it noticed quietly in the background — like a pattern in your emails, a gap in your schedule, or something it already handled.

---

## Where the Data Comes From

The briefing pulls from two sources:

1. **Your connected apps** — Gmail, Slack, GitHub, Notion, Linear, and any other apps you've connected. CalmPilot monitors these continuously and captures events (new emails, messages, comments, etc.) as they happen.

2. **Google Calendar** — fetched fresh each time your briefing loads.

The AI reads the last 24 hours of activity across all connected apps and your calendar events for the day, then writes the briefing in plain English.

---

## Proposals: What They Are and How to Use Them

Proposals are the most important part of the briefing. They represent things CalmPilot thinks need a human decision — not things it handled automatically, but things it's surfacing for your review.

### What you can do with each proposal:

- **Approve** — Tell Aariv to go ahead and take the action it suggested (e.g., send the reply, create the task).
- **Reject** — Dismiss the proposal. Aariv won't act on it.
- **Snooze** — Remind me later. It comes back in the next briefing.

Proposals are deliberately limited to 0–3 per briefing. CalmPilot's goal is to reduce what you need to think about, not create a new inbox.

---

## Refreshing Your Briefing

Your briefing is cached for **15 minutes** to keep things fast. If you want a fresh briefing:

1. Click the **Refresh** button on the dashboard.
2. CalmPilot will re-fetch your calendar and recent app activity and regenerate.

Refreshing uses a small number of credits (the same as the initial load). You won't need to refresh often — the briefing is accurate for the current day.

---

## The Three States of Your Dashboard

Your dashboard shows one of three views:

| State | When it appears |
|---|---|
| **Onboarding** | You haven't connected any apps yet. You'll see prompts to connect Gmail and Calendar. |
| **Calm** | Apps are connected, nothing urgent. A reassuring message and your calendar. |
| **Active** | Trigger events fired, calendar has meetings, items need attention. Full briefing with stats and proposals. |

---

## Tips for Richer Briefings

The briefing only knows about apps you've connected. The more apps you add, the more complete the picture:

- **Gmail** — Email summaries, flagged messages, proposals to reply
- **Google Calendar** — Meeting schedule, focus time, conflict detection
- **Slack** — Channel summaries, mentions, important threads
- **GitHub** — PRs waiting for your review, issues assigned to you
- **Notion** — Pages updated, tasks due
- **Linear** — Issues in your queue, sprint activity

You can connect more apps from the **Integrations** page. Each additional app makes the briefing more useful without adding more work for you.

---

## Frequently Asked Questions

**What if my briefing says "Nothing needs your attention" but I know things are happening?**

This usually means the relevant apps aren't connected yet. Go to Integrations and connect the apps where your work lives.

**Why does it take a few seconds to load the first time?**

The briefing is generated fresh on your first load of the day. After that, it's cached and loads instantly. In the future, CalmPilot will pre-generate your briefing before you wake up.

**Can I see what Aariv did overnight?**

Yes — the Activity Feed (linked from your dashboard) shows a full log of every action Aariv took, including what it did, when, and why. Full transparency, always.
