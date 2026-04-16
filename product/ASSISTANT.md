# CalmPilot — Assistant Page Plan

---

## What It Is

The Assistant page is the **core of the product**. It's where the user talks to Aariv and gets real work done across all their connected apps. Not a chatbot. An AI that actually executes.

---

## What's Already Built

### Frontend (`/dashboard/assistant`)
- Full chat UI with streaming SSE responses
- Left sidebar — chat history, conversation list, delete single/all/by date range
- Right panel — live execution logs (what Aariv is doing step by step)
- Suggestion chips — dynamic, based on connected apps (Gmail shows email chips, GitHub shows PR chips, etc.)
- Model selection — gpt-4o (loaded from localStorage, synced from Settings)
- File drag & drop — drop a .txt/.md/.json/.csv file, content pastes into input
- Auto-send — reads `?prompt=` URL param, fires automatically (used by dashboard proposals)
- Conversation memory — SupabaseSession persists history across sessions
- Auth required — if an app needs OAuth, shows a connect button inline
- Data cards — structured UI cards for structured data (emails, events, etc.)
- Rate limiting — 20 requests/min per user (in-memory sliding window)
- History retention — user can set auto-delete after X days

### Backend (`/chat`)
- OpenAI Agents SDK + Composio toolset
- 1000+ tools via Composio (Gmail, Slack, Calendar, GitHub, Notion, Linear, etc.)
- Streaming SSE: `log`, `auth_required`, `data_card`, `result`, `insufficient_credits`, `error`
- 120s timeout per agent run
- Charges user credits per GPT token usage
- Saves interaction to conversation history in Supabase

---

## Current Limitations

### 1. Response doesn't stream text — it arrives all at once
The backend streams `log` events (tool calls) in real time, but the final **text response** only arrives as one big `result` event at the end. The user sees the logs updating but the answer appears all at once after waiting.

**Fix:** Stream the text tokens as they generate using `event.type = "token"` events, updating the message content progressively as each token arrives.

---

### 2. No empty state / welcome screen
When a user opens a fresh chat with no messages, they see a blank white area with just the suggestion chips. There's no welcoming moment — no personality, no indication of what Aariv can do.

**Fix:** Show a proper welcome state when `messages.length === 0`:
- Greeting: "Good morning. What should I handle today?"
- 3-4 highlight capability cards (not just chips):
  - "Handle my email" / "Check my calendar" / "Update my team on Slack" / "Review my PRs"
- The suggestion chips already exist — just frame them better

---

### 3. No indication of what's happening during long runs
Agent runs can take 30-120 seconds. The logs panel shows step-by-step activity but only if the user has it open. On mobile the logs panel is hidden.

**Fix:** Show a subtle animated status bar at the top of the chat during agent runs: "Checking your Gmail..." / "Reading Slack channels..." — pulled from the latest log event label.

---

### 4. The right-panel logs are too technical
The logs show raw tool names like `COMPOSIO_MULTI_EXECUTE_TOOL → GMAIL_FETCH_EMAILS`. Most users don't understand these. It looks like a developer debug panel, not a trust-building transparency panel.

**Fix:** Map tool slugs to human-readable labels:
- `GMAIL_FETCH_EMAILS` → "Reading your Gmail inbox"
- `GOOGLECALENDAR_EVENTS_LIST` → "Checking your calendar"
- `SLACK_SEND_MESSAGE` → "Sending Slack message"
- `GITHUB_LIST_PULL_REQUESTS` → "Fetching your pull requests"
- Show the app logo next to each log entry

---

### 5. Model selector is visible to users but shouldn't be
The model selector (gpt-4o vs gpt-4o-mini) exposes internal infrastructure choices to users. Users don't care about model names. They care about speed vs quality.

**Fix:** Replace "gpt-4o / gpt-4o-mini" labels with:
- "Standard" (gpt-4o-mini — faster, cheaper)
- "Powerful" (gpt-4o — slower, better for complex tasks)

Or remove it entirely and auto-select based on message complexity.

---

### 6. No feedback on what was actually done
After Aariv completes a task, the response is just text. There's no confirmation UI — no "Email sent ✓" badge, no "Calendar event created ✓" indicator.

**Fix:** Parse the result for action completions and show inline confirmation badges:
- Green pill: "Email sent to alex@company.com ✓"
- Blue pill: "Meeting created: Friday 3 PM ✓"
- These already exist in data_cards partially — needs consistent use

---

## What To Build Next (Priority Order)

### Priority 1 — Welcome / Empty State
**Why:** First impression. Every new user lands here. A blank screen with chips is not a first impression.

```
When messages.length === 0:

  "Good morning, Nitish."
  "What should I handle today?"

  [ Handle my email ]  [ Check my calendar ]
  [ Update my team  ]  [ Review my PRs     ]

  ── or type anything below ──
```

---

### Priority 2 — Human-readable log labels
**Why:** The logs panel is CalmPilot's biggest trust-building feature — showing exactly what the AI is doing. But right now it reads like a crash dump. Fix the labels and it becomes a feature users show their friends.

```
Current:  COMPOSIO_MULTI_EXECUTE_TOOL → GMAIL_FETCH_EMAILS ✓
Fixed:    📧 Reading your Gmail inbox ✓

Current:  GOOGLECALENDAR_EVENTS_LIST → success
Fixed:    📅 Checking your calendar for today ✓
```

---

### Priority 3 — Status bar during long runs
**Why:** 30-120 second waits with no feedback feel like the app is frozen on mobile (where logs panel is hidden).

```
During agent run — thin animated bar at top of chat:
  ● Searching your GitHub repositories...
  ● Reading Slack channel #engineering...
  ● Drafting reply in Gmail...
```

---

### Priority 4 — Token streaming for text response
**Why:** Watching the answer appear word-by-word feels alive. Waiting 30 seconds then seeing a wall of text feels like a loading screen.

Requires backend change: stream `{"type": "token", "data": "word"}` events during generation.

---

## What NOT To Build (Yet)

- **Voice input** — a router exists (`/voice`) but not wired to the frontend. Do this after 100 active users when you know if people want it.
- **File upload to cloud** — current drag & drop pastes text content. Full file upload (PDFs, images) is a Phase 3 feature.
- **Multi-agent** — running multiple agents in parallel for complex tasks. Phase 4.
- **Scheduled tasks from chat** — "Do this every Monday at 9 AM". This is the Triggers page feature, not Assistant.

---

## The Core Experience Goal

User opens Assistant. Types: *"What happened while I was asleep?"*

Aariv:
1. Checks Gmail (3 urgent, 12 others — logged: "📧 Reading your inbox ✓")
2. Checks Slack (2 mentions in #product — logged: "💬 Checking Slack ✓")
3. Checks Calendar (standup in 2 hours — logged: "📅 Checking calendar ✓")
4. Responds: "3 things need you: [client email], [PR review request], [standup at 10 AM]. Everything else is handled."

Total time: 15 seconds. User closes laptop. Goes to make coffee.

**That is the assistant page done right.**
