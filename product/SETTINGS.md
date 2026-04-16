# CalmPilot — Settings Page Plan

---

## Why This Page Exists

**Settings is where users make CalmPilot theirs.**

It's not a dumping ground for every configuration option. It's a small, intentional set of choices that meaningfully change how the product behaves for that specific user.

The wrong approach: settings as a graveyard of toggles nobody uses.
The right approach: settings as the 6–8 choices that actually affect the daily experience.

---

## How It Connects to Every Other Page

```
Settings
       │
       ├── Home (Dashboard Briefing)
       │     └── Timezone → determines when "today" starts and when briefing generates
       │         Briefing schedule preference → what time to pre-generate the brief
       │         "Morning" means 6 AM to one user and 10 AM to another
       │
       ├── Assistant
       │     └── Model selection → Standard (fast) vs Powerful (better) vs Auto
       │         History retention → how long conversations are stored
       │         Both currently live in the assistant page — should be canonical here
       │
       ├── Review Queue + Feed
       │     └── Notification preferences → email alerts for high-priority items
       │         (Phase 2, but the setting stub belongs here now)
       │
       ├── Usage / Credits
       │     └── Auto-refill configuration → could live here or Usage (currently Usage)
       │         Payment method management links to billing
       │
       └── All pages
             └── Theme (light/dark) → applies globally
                 Account info (name, avatar, email) → shown in nav/profile
```

---

## What's Already Built

### Frontend (`/dashboard/settings`)
- Model selection: GPT-5.4 / GPT-5 / GPT-4.1 / GPT-4.1-mini
- History retention: 7 / 30 / 90 days / Forever
- Theme toggle: Light / Dark
- Account management section
- Privacy & Security section
- Billing integrations section
- `SectionCard` component pattern for consistent UI layout
- Theme context integration (applies globally)
- Billing context integration

---

## Current Limitations

### 1. No timezone setting — the briefing is broken without it

The home briefing generates at "6 AM" — but 6 AM where? The backend uses `datetime.utcnow()` for all time calculations. If the user is in IST (UTC+5:30), their "6 AM" is 12:30 AM UTC. The briefing fires at the wrong time, calendar events show wrong times, and "today" is calculated wrong.

**This is not a nice-to-have. It breaks core functionality.**

**Fix:** Add timezone as a required setting, auto-detected on first login:
```
Timezone
  Detected: Asia/Kolkata (IST, UTC+5:30)   [Change]

  Your morning briefing generates at 6:00 AM IST.
  Calendar events shown in your local time.
```
Auto-detect using `Intl.DateTimeFormat().resolvedOptions().timeZone` in the browser on first login → save to user profile → use in all backend time calculations.

---

### 2. No briefing time preference
The behavioral scheduler (planned in HOME.md) will learn when users open the app and pre-generate the briefing. But users should also be able to override this with a fixed preferred time.

**Fix:**
```
Morning Briefing
  When should Aariv prepare your daily brief?

  ○ Smart (learns your pattern automatically)  ← default
  ● Fixed time:  [ 7:30 AM ▾ ]  Asia/Kolkata

  "Your briefing will be ready at 7:30 AM every day."
```

---

### 3. Model selection exists but isn't explained in user terms
The settings page shows "GPT-5.4 / GPT-5 / GPT-4.1 / GPT-4.1-mini" — internal model names that mean nothing to users. The same problem that exists on the Assistant page (ASSISTANT.md limitation #5) is the canonical version of this setting and it's equally opaque here.

**Fix:** Label models by behavior, not name:
```
AI Model

  ○ Auto (recommended) — Aariv picks the right model per task
  ● Standard  — Faster, uses less credits. Good for most tasks.
  ○ Powerful  — Slower, uses more credits. Better for complex research.

  Current estimated cost: ~$0.02 per chat message
```
Show live cost estimate that updates when user changes the selection.

---

### 4. History retention is a toggle but there's no "what happens" explanation
"Delete after 30 days" — delete WHAT exactly? Conversation messages? Trigger events? Review items? The setting exists but users don't understand its scope or consequences.

**Fix:** Inline explanation per option:
```
Conversation History

  How long should Aariv remember your chats?

  ○ 7 days    — Minimal storage. Aariv won't remember chats from last week.
  ● 30 days   — Recommended. Good balance of memory and privacy.
  ○ 90 days   — Aariv has longer context across sessions.
  ○ Forever   — Keep everything. You can manually delete at any time.

  Note: This applies to chat conversations only.
  Trigger events and activity feed are kept for 90 days regardless.
```

---

### 5. No data export or account deletion with data wipe
Users have no way to download their data or fully delete their account. This is both a trust issue and a compliance issue (GDPR right to erasure, data portability).

**Fix — Danger Zone section:**
```
Data & Account

  [Export my data]        Downloads your conversations, trigger events, and settings as JSON.
                          Takes up to 5 minutes. You'll receive an email with the download link.

  [Delete my account]     Permanently deletes your account and all associated data.
                          This cannot be undone. Cancels any active subscriptions.
```
Export sends an email with a download link (async job) — don't block the UI.
Deletion requires typing "DELETE" to confirm — prevents accidental taps.

---

### 6. Notification preferences section is missing
There's no place for users to set how they want to be notified about high-priority review items, briefing ready alerts, or credit warnings. These settings need to exist even as stubs before the notification system is built — so users know the product is aware of the need.

**Fix — stub section now, wire in Phase 2:**
```
Notifications  [Coming soon]

  ☐ Email me when high-priority items need review
  ☐ Email me when my morning briefing is ready
  ☐ Email me when my credits drop below $1.00
  ☐ Push notifications (mobile — coming soon)
```
Show it greyed out with "Coming soon" — sets the expectation and builds anticipation.

---

## Settings Page Structure (Final)

```
⚙ Settings

  ── Account ──────────────────────────────────────
  Avatar  Name  Email (read-only, from Google OAuth)
  [Sign out]

  ── Preferences ──────────────────────────────────
  Timezone              [ Asia/Kolkata (IST) ▾ ]
  Morning Briefing      ○ Smart  ● Fixed: [ 7:30 AM ▾ ]
  Theme                 ○ Light  ● Dark  ○ System

  ── Assistant ────────────────────────────────────
  AI Model              ○ Auto  ● Standard  ○ Powerful
  Conversation History  ○ 7d  ● 30d  ○ 90d  ○ Forever

  ── Notifications ────────────────────────────────
  [Coming soon — greyed out stubs]

  ── Billing ──────────────────────────────────────
  Current balance   $4.23    [Add Credits]
  Auto-refill       Off      [Configure]
  Billing history             [View]

  ── Data & Account ───────────────────────────────
  [Export my data]
  [Delete my account]
```

---

## What To Build Next (Priority Order)

| Priority | What | Why |
|---|---|---|
| 1 | Timezone setting with auto-detect | Briefing times, calendar display, and "today" are wrong without this |
| 2 | Briefing time preference (Smart vs Fixed) | Required for behavioral scheduler (HOME.md) |
| 3 | Model labels in plain English | "GPT-4.1-mini" means nothing — "Standard" does |
| 4 | History retention explanation | Users don't know what 30 days covers |
| 5 | Data export + account deletion | Trust and compliance requirement |

---

## What NOT To Build Yet

- **Team settings / workspace settings** — shared config for multiple users. Phase 4.
- **Custom AI persona** — change Aariv's name, tone, language. Phase 3.
- **API key access** — let power users call Aariv via API. Phase 3.
- **Two-factor authentication** — relies on Supabase Auth, can enable when needed. Phase 3.
- **Integrations management** — connecting/disconnecting apps belongs on the Integrations page, not here.
- **Granular notification rules** — "only notify me for emails from @client.com". Phase 3.

---

## The One-Line Summary

> Settings should be the 6 choices that actually change your day —
> not the 60 knobs that nobody touches.
