# Connecting Your Apps

CalmPilot becomes useful the moment you connect your first app. The more apps you connect, the smarter your morning briefing gets and the more your AI assistant can actually do for you.

---

## Supported Apps

CalmPilot works with over 1,000 apps. Here are the ones most people connect first:

| App | What CalmPilot Can Do |
|---|---|
| **Gmail** | Read emails, draft replies, send messages, flag urgent threads |
| **Google Calendar** | See upcoming events, get reminders, create calendar entries |
| **Slack** | Read messages, send replies, monitor channels |
| **GitHub** | Track pull requests assigned to you, watch for review requests |
| **Linear** | Monitor issue updates, see what's assigned to you |
| **Notion** | Read pages and databases, create new entries |
| **Discord** | Monitor server activity, send messages |
| **Stripe** | Watch for payment failures, new customers, and subscription events |
| **Jira** | Track ticket updates and assignments |
| **Trello** | Monitor card movements and new assignments |
| **1,000+ more** | All other apps are available via the search bar on the Integrations page |

> **Where to start:** Gmail and Google Calendar are free to connect on all plans and unlock the most value immediately. Connect those first.

---

## How to Connect an App

1. Go to **Integrations** in the sidebar.
2. Find the app you want — use the search bar or browse by category.
3. Click **Connect** on the app card.
4. A small popup window will open asking you to sign in and grant permission.
5. Complete the sign-in in the popup. The window will close on its own.
6. The app card will update to show a green checkmark — you are connected.

You will see a confirmation message at the bottom of the screen once the connection is successful.

---

## What Happens When You Connect an App

Two things happen automatically in the background:

1. **Your AI assistant gains new abilities.** It can now read from and act on that app. For example, connecting Gmail lets you ask "What emails need my attention?" and get a real answer.

2. **Monitoring starts immediately.** CalmPilot sets up background watchers (called triggers) for that app. These watch for important events — like a new email or a calendar reminder — and feed that information into your morning briefing.

You do not need to configure anything. It works out of the box. If you want to customize what gets monitored, visit the [Triggers](./triggers.md) page.

---

## How to Disconnect an App

1. Go to **Integrations** in the sidebar.
2. Click the **Connected** tab at the top to see only your connected apps.
3. Find the app you want to remove and click on it.
4. Click **Disconnect**.
5. A confirmation dialog will appear — confirm to disconnect.

Once disconnected, CalmPilot will stop monitoring that app and the AI assistant will no longer be able to interact with it.

---

## Troubleshooting

**"Connection failed" or the popup closed without connecting**

This usually means the authentication did not complete. Try again:
- Make sure pop-ups are not blocked in your browser for this site.
- Try a different browser if the popup does not open.
- If you see an error inside the popup, sign out of that app in another tab and try again to get a fresh login.

**"My app is not in the list"**

CalmPilot exposes 30 curated apps by default because these are the ones that provide the most value. If you need an app that is not listed, use the **Feedback** widget in the bottom corner of the app to request it. High-demand apps get added first.

**"I connected the app but nothing is happening"**

Give it a few minutes. Triggers need a short time to start receiving events. If your morning briefing still shows nothing after 24 hours, try disconnecting and reconnecting the app.

**"The app shows as connected but the AI says it cannot access it"**

Your OAuth token may have expired. Disconnect the app and reconnect it to get a fresh token.
