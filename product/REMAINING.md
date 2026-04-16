# Aariv — Remaining Unbuilt Items (by page)

Cross-referenced against all product specs. Only items explicitly described in spec files.

---

## Home (`HOME.md`)

| Item | Phase | Notes |
|---|---|---|
| Behavioral scheduling (learn open time, median+stdev, weekday/weekend) | Phase 2 | Needs 7+ days of activity data per user |
| Pre-generated briefings (`briefings` table, cron every 5 min) | Phase 2 | DB schema defined in HOME.md |
| Morning email via Resend (when briefing pre-generated) | Phase 2 | Depends on pre-generated briefings |

---

## Assistant (`ASSISTANT.md`)

| Item | Phase | Notes |
|---|---|---|
| Token streaming (word-by-word text response) | Phase 2 | Backend must stream `{type: "token"}` events |
| Action completion badges ("Email sent ✓", "Meeting created ✓") | Phase 2 | Spec limitation #6 — parse result for action completions, show inline confirmation pills |

---

## Integrations (`INTEGRATIONS.md`)

| Item | Phase | Notes |
|---|---|---|
| App usage stats per integration | Phase 3 | Feed page handles this partially |
| Granular permission scopes | Phase 3 | Enterprise feature |
| Team-shared integrations | Phase 4 | Multi-user |
| Webhooks / API key integrations | Phase 3 | Beyond OAuth |

**Phase 1 is fully built.**

---

## Triggers (`TRIGGERS.md`)

| Item | Phase | Notes |
|---|---|---|
| Custom trigger logic ("only if email from @client.com") | Phase 3 | Conditional filtering |
| Trigger chains ("when X happens, trigger Y") | Phase 4 | Workflow builder |
| Trigger rate limiting settings | Phase 3 | User-controlled polling interval |
| Trigger templates ("Sales alert package") | Phase 3 | Pre-built combos |
| Team-shared triggers | Phase 4 | Multi-user |

**Phase 1 is fully built.**

---

## Review Queue (`REVIEW.md`)

| Item | Phase | Notes |
|---|---|---|
| Email notification for `priority: "high"` items | Phase 2 | Resend integration exists |
| Custom approval rules ("auto-approve if confidence > 90%") | Phase 3 | |
| Conditional snooze ("snooze until client replies") | Phase 3 | Event-based, not time-based |
| Review item comments / annotations | Phase 3 | |
| Team review queue | Phase 4 | Shared inbox |

**Phase 1 is fully built.**

---

## Feed (`FEED.md`)

| Item | Phase | Notes |
|---|---|---|
| ~~Time-windowed stats ("Today: X events, Last: Y ago")~~ | ~~Phase 1~~ | ✅ Fixed — today strip + last activity timestamp |
| ~~Auth error → Reconnect link~~ | ~~Phase 1~~ | ✅ Fixed — auth errors now link to Integrations reconnect |
| Export to CSV | Phase 3 | Enterprise/power users |
| Webhook replay (re-fire failed event) | Phase 3 | Needs Composio support |
| Feed-based alerts ("notify if error rate > 5%") | Phase 3 | |
| Team feed | Phase 4 | Shared activity log |
| Event annotations | Phase 3 | |

**Phase 1 is now fully built.**

---

## Usage & Credits (`USAGE.md`)

| Item | Phase | Notes |
|---|---|---|
| Subscription plan (flat monthly fee) | Phase 3 | Evaluate credits vs subscription after 200 users |
| Team billing | Phase 4 | Admin controls per member |
| Invoice generation (PDF) | Phase 3 | Business expense claims |
| Usage alerts ("email when I spend $X/month") | Phase 2 | |
| Free tier with hard limits | Phase 3 | Evaluate after 200 users |

**Phase 1 is fully built.**

---

## Settings (`SETTINGS.md`)

| Item | Phase | Notes |
|---|---|---|
| Data export (async, email with download link) | Phase 2 | GDPR data portability — account deletion is ✅ |
| Team / workspace settings | Phase 4 | |
| Custom AI persona (name, tone, language) | Phase 3 | |
| API key access for power users | Phase 3 | |
| Two-factor authentication | Phase 3 | Supabase Auth |
| Granular notification rules | Phase 3 | |

---

## Onboarding (`ONBOARDING.md`)

| Item | Phase | Notes |
|---|---|---|
| ~~`router` undefined bug in dashboard/page.tsx~~ | ~~Bug~~ | ✅ Fixed — added `useRouter()` to DashboardHome |
| ~~Frontend onboarding step tracking (never called)~~ | ~~Bug~~ | ✅ Fixed — step 1 (welcome), step 3 (first briefing), step 4 (nudge dismissed) |
| ~~Soft nudge after first briefing ("Connect Slack")~~ | ~~Phase 1~~ | ✅ Fixed — dismissible banner on dashboard |
| Re-engagement emails (24h / 4h / 48h / 72h triggers) | Phase 2 | Resend exists, triggers don't |

**Phase 1 is now fully built.**

---

## Summary — What's Buildable Next (Phase 2)

These are the Phase 2 items that make sense to build once there are real users:

1. **Behavioral scheduling** (Home) — needs 7 days of activity logs
2. **Pre-generated briefings + morning email** (Home) — depends on #1
3. **Token streaming** (Assistant) — backend change
4. **Action completion badges** (Assistant) — frontend only
5. **Email notifications for high-priority review items** (Review) — Resend ready
6. **Data export** (Settings) — GDPR compliance
7. **Re-engagement emails** (Onboarding) — Resend ready
8. **Usage alerts** (Usage) — email when spend threshold hit
