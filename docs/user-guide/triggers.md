# Triggers

## What Are Triggers?

Triggers watch your connected apps 24/7 and notify you when something important happens.

Think of them as background watchers. While you are in a meeting, asleep, or just not at your desk, CalmPilot is keeping an eye on your Gmail, Slack, GitHub, and any other apps you have connected. When something worth your attention happens, it captures it, summarises it, and includes it in your briefing.

Without triggers, your morning briefing would be empty. Triggers are what give CalmPilot its memory of "what happened while you were away."

---

## How They Work

The flow is simple:

1. **An event happens** — a new email arrives, a PR gets assigned to you, a payment fails.
2. **CalmPilot receives the event** — this happens automatically in the background.
3. **The AI decides if it matters** — low-priority noise gets filtered out.
4. **A summary appears in your feed and briefing** — you see a plain-language summary, not raw data.

You do not need to do anything. Once you connect an app, its triggers are set up automatically.

---

## Viewing Your Triggers

Go to **Triggers** in the sidebar. You will see all your active triggers grouped by app.

At the top you will find a stats bar showing:
- How many triggers are active vs paused
- How many events have been processed today
- Any errors worth your attention

Click on any trigger to see its recent activity — the last few events it captured and what CalmPilot did with them.

---

## Managing Triggers

### Pausing a Trigger

If you want to stop monitoring something temporarily, click the **pause** button next to a trigger. The trigger stays in your list but stops firing. Your briefing will no longer include events from that trigger while it is paused.

> Note: Pausing a Gmail trigger means your briefing will stop showing email summaries. You can re-enable it at any time.

### Re-enabling a Trigger

Click the **play** button next to any paused trigger to turn it back on.

### Deleting a Trigger

Click the **delete** icon to permanently remove a trigger. If you want it back later, you will need to reconnect the app or create the trigger manually.

### Creating a New Trigger

Click **Add Trigger** at the top of the page. Select a connected app, choose the event type you want to watch for, and save. Some triggers let you configure extra details (like a specific Slack channel or calendar).

---

## The Activity Feed

Every event captured by your triggers appears in the **Feed** in your dashboard. The feed is a running log of everything CalmPilot has noticed across all your apps.

Your morning briefing is a curated summary of the most important items from the feed in the past 24 hours.

---

## Trigger Limits by Plan

| Plan | Active Triggers | Trigger Events per Day |
|---|---|---|
| Free | 3 | 10 |
| Starter | Unlimited | Unlimited |
| Pro | Unlimited | Unlimited |

On the Free plan, once you hit 3 active triggers you will need to pause one before you can add another. Upgrading to Starter removes this limit entirely.

---

## Troubleshooting

**"I connected an app but I am not seeing any events"**

- Check the Triggers page and confirm the trigger for that app shows as **Active** (not Paused).
- Some apps require a bit of activity to fire. Gmail needs a new email to arrive, for example.
- If the trigger shows as Active but no events appear after a day, try disconnecting and reconnecting the app — this resets the trigger setup.

**"I am on the Free plan and cannot add more triggers"**

You have reached the 3-trigger limit. Pause or delete an existing trigger to free up a slot, or upgrade to Starter for unlimited triggers.

**"My trigger shows errors"**

Click on the trigger to see recent events. Error entries usually mean the connection to that app needs refreshing. Go to Integrations, disconnect the app, and reconnect it.

**"My morning briefing is empty even though triggers are active"**

If no new events came in for those apps in the past 24 hours, the briefing will reflect that. Try checking the Feed directly to confirm whether any events were captured.
