# The Assistant (Talking to Aariv)

The Assistant is where you talk directly to Aariv — CalmPilot's AI — and get real work done. This isn't a chatbot that gives you advice. Aariv is connected to your actual apps and can take real actions on your behalf.

---

## What Can the AI Do?

Here's what Aariv can help with, across your connected apps:

- **Read and summarize** your emails, Slack messages, GitHub activity, and more
- **Draft replies** to emails or Slack messages, ready for you to review or send
- **Send emails** directly from your Gmail account when you say the word
- **Create and update calendar events** — schedule meetings, check availability, resolve conflicts
- **Post to Slack** — send messages to channels or DMs
- **Create tasks** in Notion, Linear, or other project tools
- **Look up information** across your connected apps — "What did Sarah say in Slack last week?"
- **Cross-app actions** — "Take the key points from this email and create a Notion page"
- **Answer questions** about your work — "How many PRs are waiting for my review?"

Aariv works with 1,000+ actions across dozens of apps. If you've connected an app, you can probably ask Aariv to do something with it.

---

## Example Prompts

Here are 10 things you can type right now to see what Aariv can do:

1. *"What's on my calendar today?"*
2. *"Summarize my last 10 unread emails."*
3. *"Draft a reply to the most recent email from John."*
4. *"Send a message to the #general Slack channel saying I'll be 5 minutes late to standup."*
5. *"What GitHub PRs are waiting for my review?"*
6. *"Create a Notion page summarizing what I need to do this week."*
7. *"Check if I have any calendar conflicts tomorrow."*
8. *"What happened in #product Slack channel today?"*
9. *"Write a status update based on the GitHub issues I closed this week and send it to #engineering on Slack."*
10. *"Find all emails from my manager in the last 7 days and summarize them."*

---

## Being Specific Gets Better Results

Aariv works best when you give it enough context to act. Some tips:

- **Mention the app** — "in Gmail", "on Slack", "in my calendar" helps Aariv know where to look
- **Mention the person** — "the email from Sarah" is clearer than "the email"
- **Mention the timeframe** — "this week", "in the last 24 hours", "today"
- **Say what you want done** — "draft a reply" vs "send a reply" vs "just summarize it"

Examples of vague vs specific:

| Instead of... | Try... |
|---|---|
| "Check my email" | "Summarize unread emails from the last 2 days in Gmail" |
| "What's happening?" | "What Slack messages mentioned me today?" |
| "Handle the PR thing" | "List open GitHub PRs assigned to me and tell me which one is oldest" |

---

## The Activity Log (What's Aariv Doing?)

On the right side of the Assistant page, there's a live activity panel. Every time Aariv takes a step — checking an app, fetching data, sending a message — it logs what it's doing in plain English:

- Reading your Gmail inbox
- Checking your calendar for today
- Sending Slack message to #general
- Creating Notion page

This panel exists because you should always know exactly what Aariv is doing. If something doesn't look right, you can stop it. Transparency is built in.

For longer tasks, Aariv may take 15–120 seconds to complete. The activity log updates in real time so you can follow along.

---

## Uploading Files

You can drop a file into the chat input to include its contents in your message. This works for:

- `.txt` — plain text files
- `.md` — Markdown documents
- `.json` — data files
- `.csv` — spreadsheets

When you drop a file, its content is pasted into the input. You can then add your question or instruction on top of it — for example, dropping a CSV and asking Aariv to summarize the data.

> Note: Full file upload (PDFs, images, large documents) is coming in a future update.

---

## Credit Usage

Each message you send uses credits. The amount depends on how complex the task is:

- A simple question ("What's on my calendar?") uses a small number of credits
- A multi-step task ("Read my emails, find the urgent ones, draft replies to each, and create a Notion list") uses more

You can see your credit balance in **Settings**. If you run out mid-conversation, Aariv will let you know and you can add more credits or upgrade your plan.

> For plan details, see the [Billing guide](./billing.md).

---

## Chat History

All your conversations with Aariv are saved automatically. You can find previous conversations in the left sidebar under your chat list. You can:

- Click any conversation to continue it
- Delete individual conversations
- Set auto-delete after a certain number of days (in Settings)

Aariv remembers the context within a single conversation — if you said "draft a reply to that email" earlier in the chat, you can follow up with "now make it more formal" and it knows what you mean.

---

## Tips

- **One thing at a time for complex tasks.** Aariv handles multi-step tasks, but if a request is very complex, breaking it into steps gives you more control at each stage.
- **Review before sending.** For emails and Slack messages, Aariv will draft and show you what it's about to send before it does. You can edit or reject it.
- **If Aariv can't do something**, it will tell you clearly — either the app isn't connected, or the action isn't supported. It won't silently fail.
- **The suggestion chips** at the top of the chat are tailored to your connected apps. They're a good starting point if you're not sure what to ask.
