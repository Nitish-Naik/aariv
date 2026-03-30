# Frequently Asked Questions

---

## Is my data safe?

Yes. Here is what we do to protect it:

- All data is stored in Supabase with Row Level Security (RLS) enabled. This means each user can only ever access their own data — there is no way for one account to read another's.
- Authentication uses JWT tokens. Your session is verified on every request.
- All data is encrypted in transit using HTTPS.
- We do not sell your data to anyone, ever.

Your connected app data (emails, calendar events, etc.) is used only to generate your briefings and power your AI assistant. It is not stored permanently — we process it and summarize it, we do not build a copy of your inbox.

---

## What AI model does CalmPilot use?

CalmPilot uses different models depending on the task:

- **GPT-4o** — used for reasoning, chat responses, and anything that needs a thoughtful answer
- **GPT-4o-mini** — used for background summaries, trigger processing, and briefing generation

On the Pro plan, you get access to more powerful model options. You can see and change your model preference in **Settings**.

---

## Can I undo an action?

Yes. Before CalmPilot sends an email, creates a task, or takes any action on your behalf, it puts the proposed action in your **Review Queue** first. You can read exactly what it plans to do and either approve or reject it.

Nothing gets sent or executed without your approval unless you have explicitly told it to act automatically.

---

## How many apps can I connect?

There is no limit on the number of app connections on any plan. You can connect as many apps as you want.

The Free plan limits you to 3 **active triggers** (monitoring rules), but you can still connect more apps — you just will not have automated monitoring for all of them until you upgrade.

---

## What happens if I run out of chat messages?

Your AI assistant will stop responding to new messages until your monthly count resets or you upgrade. You will see a clear message explaining what happened and giving you the option to upgrade.

Your background automation keeps running — triggers continue watching your apps and your briefing (if you are on a paid plan) continues generating. Only the chat assistant pauses.

You can also send extra messages at $0.03 each (Starter) or $0.02 each (Pro) without changing your plan.

---

## Can I export my data?

Not yet. Data export is planned for a future update. If this is important to you, let us know via the Feedback widget — it helps us prioritize.

---

## How do I delete my account?

Go to **Settings** and scroll to the bottom. You will find a **Delete Account** option. This permanently deletes your account and all associated data. This cannot be undone.

---

## Who built CalmPilot?

CalmPilot was built by Nitish, a final-year student at CBIT, Hyderabad. It started as a project to solve a real problem: too many apps, too much noise, not enough signal. If you have feedback, it goes directly to the person who built it.

---

## Is there a mobile app?

CalmPilot is web-only right now. It works well on mobile browsers, and if you add it to your home screen you get a PWA (Progressive Web App) experience — it opens like a native app without going through the browser.

A dedicated mobile app is something we are thinking about for later. Use the Feedback widget to let us know if this matters to you.

---

## How do I report a bug?

Use the **Feedback** widget in the bottom corner of the app. Describe what you were doing, what you expected to happen, and what actually happened. Screenshots are helpful if the issue is visual.

You can also reach out directly — Nitish reads every piece of feedback.
