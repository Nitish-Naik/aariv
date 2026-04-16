# Aariv — Build Queue

Tracked against all product specs. Organized by screen, then priority.
Status: ✅ Built | 🔴 Critical | 🟠 High | 🟡 Medium | 🔵 Phase 2+

---

## Onboarding

| Priority | What | Notes |
|---|---|---|
| ✅ | Google OAuth signup | Supabase handles it |
| ✅ | $5 free credits on signup | billing.py auto-initializes |
| ✅ | Home onboarding state (0 apps connected) | Shows CTA to connect |
| ✅ | Welcome screen (full-screen, pre-dashboard) | Built |
| ✅ | "Setting up Aariv..." progress screen | Built |
| ✅ | Bootstrap first briefing fetch (Day 0 fix) | Built |
| ✅ | Guided connect screen (2-app focus) | Welcome page shows Gmail / Calendar / Slack — not the full 1000-app grid |
| ✅ | Timezone detection on signup | AuthContext sends timezone → auth.py saves to profiles |
| ✅ | Onboarding step tracking (steps 1, 2, 3, 4 in DB) | Step 1: welcome seen; Step 2: first app connected; Step 3: first briefing seen (FVM); Step 4: nudge dismissed |
| ✅ | Soft nudge after first briefing ("Connect Slack") | Dismissable toast, persisted in localStorage, tracks step 4 |
| 🔵 | Re-engagement emails (24h / 4h / 48h / 72h triggers) | Resend exists, triggers don't |

---

## Home (Dashboard Briefing)

| Priority | What | Notes |
|---|---|---|
| ✅ | Phase 1: On-demand briefing, 15-min memory cache | Live |
| ✅ | Three states: Onboarding / Calm / Active | Live |
| ✅ | Activity logging (`user_activity_log` table) — first open per day | Start collecting now, needed for behavioral scheduling |
| 🔵 | Behavioral scheduling: learn open time per user (median + stdev) | After 7 days of activity data |
| 🔵 | Pre-generated briefings (`briefings` table, cron every 5 min) | Phase 2 |
| 🔵 | Morning email via Resend (when briefing pre-generated) | Phase 2 |
| 🔵 | Briefing time preference: Smart vs Fixed (in Settings) | Phase 2 |

---

## Assistant

| Priority | What | Notes |
|---|---|---|
| ✅ | Full chat UI with streaming SSE | Live |
| ✅ | Left sidebar — chat history, delete | Live |
| ✅ | Right panel — live execution logs | Live |
| ✅ | Suggestion chips (dynamic per connected apps) | Live |
| ✅ | Model selection, file drag & drop, auto-send, conversation memory | Live |
| ✅ | Rate limiting, history retention | Live |
| ✅ | Human-readable log labels in logs panel | `TOOL_LABELS` + `formatToolName` + `getToolAppSlug` in appMeta.tsx. App color dot per entry in DetailedLogEntry. |
| ✅ | Status bar during long runs (thin animated bar at top of chat) | Mobile users can't see logs panel |
| ✅ | Model selector labels: replace "gpt-4o-mini" with "Standard / Powerful" | Tier labels (Fast/Standard/Powerful/Ultra) in Settings; model ID shown as secondary |
| 🔵 | Token streaming for text response (word-by-word) | Backend change: stream `{type: "token"}` events |

---

## Integrations

| Priority | What | Notes |
|---|---|---|
| ✅ | Full grid of 1000+ apps, search, category filter, grid/list toggle | Live |
| ✅ | Connected/disconnected status, OAuth popup, disconnect flow | Live |
| ✅ | Post-connect toast + auto-trigger setup | Live |
| ✅ | "Start here" section — top 4 apps at top (Gmail, Calendar, Slack, GitHub) | With "★ Most popular" badge |
| ✅ | Post-connect explanation panel ("Aariv will now: monitor your inbox...") | Users don't know what changed after connecting |
| ✅ | Empty "Connected" tab state with CTAs | Dead end when no apps connected |
| ✅ | Expired connection detection + "Reconnect" button | Silent failures in assistant when OAuth token expires |
| ✅ | Skeleton loading matching actual card layout | Perceived load improvement |

---

## Triggers

| Priority | What | Notes |
|---|---|---|
| ✅ | Two-panel layout, app-grouped, filter modes, search, stats bar | Live |
| ✅ | Per-trigger: enable/pause/delete, recent events, config form | Live |
| ✅ | Add new trigger, auto-setup system | Live |
| ✅ | Human-readable trigger names + one-line descriptions | `formatTriggerSlug` + new `TRIGGER_DESCRIPTIONS` map wired into both available triggers panel and user trigger cards |
| ✅ | Auto-trigger tooltip/explanation ("set up when you connected Gmail...") | Users don't know what auto triggers do |
| ✅ | Payload preview in event list (last 3 events with content preview) | Closes the loop between trigger → what it did |
| ✅ | Briefing impact warning when pausing ("This will remove email summaries from your brief") | Users don't understand consequences |
| ✅ | Error count links directly to Feed filtered by that trigger | "2 errors" should be clickable |

---

## Review Queue

| Priority | What | Notes |
|---|---|---|
| ✅ | Inbox-style layout, priority badges, approve/dismiss/snooze | Live |
| ✅ | Auto-refresh, dismiss-all, action toasts, empty state | Live |
| ✅ | Review queue wiring: live triggers → review items | Via `_extract_review_items` in triggers.py |
| ✅ | Review queue wiring: bootstrap events → review items | Just built |
| ✅ | Context panel: expand card to see full email/message payload | Users approve blindly without this |
| ✅ | "View details" toggle with animated expand/collapse | Built with ContextPanel component |
| ✅ | Post-approve result card ("Aariv drafted: Hi Alex... [View in Gmail]") | Users don't know what Aariv actually did |
| ✅ | AI confidence display (color-coded pill per card) | 95% and 40% confidence items look identical |
| ✅ | Multi-select batch actions ("Dismiss all low priority") | "Dismiss all" is the only batch option |
| 🔵 | Email notification for `priority: "high"` items | Resend integration exists |
| ✅ | In-app nav badge showing pending count | Visibility |

---

## Feed

| Priority | What | Notes |
|---|---|---|
| ✅ | Timeline grouped by date, app filter pills, search, status badges | Live |
| ✅ | Processing time, auto-refresh, manual sync, pagination, stats bar | Live |
| ✅ | Human-readable trigger names inline (reuse `formatTriggerSlug` from `appMeta.tsx`) | Already wired at line 512 |
| ✅ | Time-windowed stats ("Today: 24 events • 0 errors • Last: 4 min ago") | Compact strip below stats grid |
| ✅ | Expandable event detail panel (full payload, review item link, briefing inclusion) | Debugging requires this |
| ✅ | User-friendly error messages ("Your Gmail connection expired. [Reconnect]") | Raw Python exceptions shown to users |
| ✅ | Filter pill event counts ("Gmail (312)", "Failed (23)") | Users don't know what's behind each filter |
| ✅ | Rename "Sync" → "Check for new events", show count after sync | Current behavior is unclear |

---

## Usage & Credits

| Priority | What | Notes |
|---|---|---|
| ✅ | Credit balance, "Add Credits" modal, usage summary, spending history | Live |
| ✅ | Auto-refill toggle, Dodo Payments checkout | Live |
| ✅ | Low-balance banner across all dashboard pages (balance < $1.00) | Amber at <$1, red at $0. Sticky top of layout. Links fixed to /usage. |
| ✅ | "Balance lasts ~X days at your usage rate" estimate | New users have no cost reference |
| ✅ | Translate usage to actions, not tokens ("18× morning briefings — $0.12") | Token counts meaningless to users |
| ✅ | Group transaction history by conversation (not per API call) | Wall of $0.001 rows looks broken |
| ✅ | Auto-refill configuration with explanation (threshold + amount) | Toggle exists but not usable without context |

---

## Settings

| Priority | What | Notes |
|---|---|---|
| ✅ | Model selection, history retention, theme toggle, account section | Live |
| ✅ | Timezone display with auto-detect | Shown in Settings; auto-detected from browser on every login |
| ✅ | Model labels in plain English: "Fast / Standard / Powerful / Ultra" | Done |
| ✅ | History retention explanation (what does "30 days" actually cover?) | Inline descriptions + scope note added |
| ✅ | Notifications section (stubs, greyed "Coming soon") | Added |
| ✅ | Briefing time preference: Smart (learns pattern) vs Fixed time | Required for behavioral scheduler |
| 🔵 | Data export (async, email with download link) | GDPR compliance |
| ✅ | Account deletion with "DELETE" confirmation | GDPR right to erasure |

---

## Summary by Priority

### 🔴 Critical (fix first — breaks core functionality)
1. Timezone setting with auto-detect (Settings)
2. Low-balance banner across dashboard (Usage)

### 🟠 High (users notice immediately)
3. ~~Human-readable trigger names on Triggers page~~ ✅
4. ~~Human-readable log labels in Assistant logs panel~~ ✅
5. ~~"Start here" section on Integrations (top 4 apps)~~ ✅
6. ~~Post-connect explanation panel on Integrations~~ ✅
7. ~~Context panel in Review Queue (see payload before approving)~~ ✅
8. ~~Human-readable trigger names in Feed (reuse `formatTriggerSlug`)~~ ✅
9. ~~Time-windowed stats in Feed~~ ✅
10. ~~"Balance lasts X days" estimate on Usage~~ ✅
11. ~~Auto-trigger tooltip on Triggers page~~ ✅

### 🟡 Medium (polish + trust)
12. Payload preview in Triggers event list
13. Payload preview in Triggers event list
14. Pausing trigger → briefing impact warning
15. Empty "Connected" tab state on Integrations
16. ~~Expired connection "Reconnect" on Integrations~~ ✅
17. ~~Expandable event detail in Feed~~ ✅
18. ~~User-friendly error messages in Feed~~ ✅
19. Filter pill counts in Feed
20. Post-approve result card in Review Queue
21. AI confidence display in Review Queue
22. Multi-select batch actions in Review Queue
23. Translate tokens to actions on Usage
24. Group transaction history on Usage
25. Auto-refill configuration UI on Usage
26. History retention explanation on Settings
27. Notifications section stub on Settings
28. Status bar during long runs on Assistant
29. Model selector labels in plain English

### 🔵 Phase 2+ (after real users)
- Activity logging + behavioral scheduling
- Pre-generated briefings + morning email
- Re-engagement emails (Resend)
- Token streaming in Assistant
- Data export + account deletion
- Push notifications for high-priority review items
