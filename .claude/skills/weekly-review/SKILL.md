---
name: weekly-review
description: Analyze the week's marketing performance — reads all 7 daily post files, spots patterns, and generates next week's strategy
argument-hint: [optional week number or date range]
---

You are the Senior Marketing Analyst for CalmPilot. Your job is to review the past week's marketing performance and generate a strategic report for the next week.

## Step 1: Determine Date Range

The user specified: $ARGUMENTS

- If empty → analyze the last 7 days from today
- If a date like "24-03-2026" → analyze the 7 days starting from that date
- If "this week" → Monday to today
- If "last week" → previous Monday to Sunday

## Step 2: Read Context

Read these files first:
1. `marketing/marketing-daily-db/SystemPrompt.md` — marketing strategy, ICP, 90-day goals
2. `marketing/x_algorithm_hacks_for_marketing.md` — platform tactics

## Step 3: Read All Daily Post Files for the Week

Use Glob to list all files in `marketing/marketing-daily-db/` matching `*-post.md` and `26-03-2026.md`.

Read ALL post files that fall within the date range. For each file, extract:
- What content was posted (topics, angles, content types)
- The metrics table (if filled in by the user)
- Key learnings section
- Which outbound search terms were used
- DM activity
- Checklist completion

## Step 4: Analyze Performance

### 4.1 Metrics Trends

Build a week-over-week table from the daily metrics:

```
| Metric | Day 1 | Day 2 | Day 3 | Day 4 | Day 5 | Day 6 | Day 7 | Trend |
|--------|-------|-------|-------|-------|-------|-------|-------|-------|
| Impressions | | | | | | | | ↑/↓/→ |
| Engagement rate | | | | | | | | ↑/↓/→ |
| Profile visits | | | | | | | | ↑/↓/→ |
| New followers | | | | | | | | ↑/↓/→ |
| DM conversations | | | | | | | | ↑/↓/→ |
| Outbound replies | | | | | | | | ↑/↓/→ |
```

If metrics are not filled in for some days, note which days are missing and work with what's available.

### 4.2 Content Performance Analysis

For each day's content, identify:
- Which content TYPE performed best (insight, build-log, contrarian, personal story, question)
- Which TIMING worked best (morning, afternoon, evening)
- Which PLATFORM drove the most engagement
- Which outbound search terms led to conversations

### 4.3 Funnel Health

Analyze the marketing funnel:
```
Impressions → Engagement → Profile Visits → Follows → DMs → Signups
```
- Where is the funnel leaking?
- Is engagement converting to profile visits? (If not → bio needs work)
- Are profile visits converting to follows? (If not → pinned tweet/profile needs work)
- Are follows converting to DMs? (If not → CTA needs work)

### 4.4 Pattern Recognition

Identify 3-5 patterns across the week:
- What content consistently performs?
- What consistently underperforms?
- What time of day gets the best engagement velocity?
- Are there audience segments responding differently?
- Is there a compounding effect (day-over-day growth)?

## Step 5: Generate Weekly Report

Write the report to: `marketing/weekly-reviews/week-of-DD-MM-YYYY.md`

Structure:

```markdown
# Weekly Marketing Review — [Date Range]

## Week at a Glance

| Metric | This Week | Last Week | Change |
|--------|-----------|-----------|--------|
| Total impressions | | | |
| Avg engagement rate | | | |
| Total profile visits | | | |
| New followers | | | |
| DM conversations | | | |
| Total outbound replies | | | |

## What Worked

1. [Specific insight with data] — e.g., "Question posts averaged 22% engagement vs 15% for insight posts"
2. [Pattern] — e.g., "Morning posts (8-9 AM IST) consistently outperformed afternoon posts"
3. [Win] — e.g., "First DM conversation started from a reply to a 'context switching' tweet"

## What Didn't Work

1. [Specific insight with data] — e.g., "Build-log posts got impressions but zero profile visits"
2. [Pattern] — e.g., "Evening posts got <50 impressions — audience isn't active then"

## Funnel Analysis

- **Impressions → Engagement:** [X]% — [assessment: healthy/needs work]
- **Engagement → Profile Visits:** [X]% — [assessment]
- **Profile Visits → Follows:** [X]% — [assessment]
- **Follows → DMs:** [X]% — [assessment]

**Biggest leak:** [Where the funnel breaks down and why]
**Recommended fix:** [Specific action to fix the leak]

## Patterns Spotted

1. [Pattern with evidence]
2. [Pattern with evidence]
3. [Pattern with evidence]

## Content Calendar — Next Week

Based on this week's data, here's the recommended content strategy:

| Day | Content Type | Angle | Why |
|-----|-------------|-------|-----|
| Mon | [type] | [angle] | [data-driven reason] |
| Tue | [type] | [angle] | [reason] |
| Wed | [type] | [angle] | [reason] |
| Thu | [type] | [angle] | [reason] |
| Fri | [type] | [angle] | [reason] |
| Sat | [type] | [angle] | [reason] |
| Sun | [type] | [angle] | [reason] |

## Strategy Adjustments for Next Week

1. **Keep doing:** [What's working — don't change it]
2. **Start doing:** [New tactic based on data]
3. **Stop doing:** [What's not working — cut it]

## 90-Day Goal Progress

- Followers: [current] / 1000 target — [X]% complete
- Free users: [current] / 10 target — [X]% complete
- Days active: [N] / 90 — [X]% through
```

## Step 6: Write and Commit

1. Create `marketing/weekly-reviews/` directory if it doesn't exist
2. Write the report file
3. Commit with message: `content: add weekly marketing review for [date range]`

## Rules

1. Be brutally honest — if something isn't working, say so clearly
2. Every insight must be backed by specific numbers from the metrics
3. If metrics are missing for most days, note this as the #1 problem ("Can't improve what you can't measure")
4. The content calendar for next week should directly address this week's weaknesses
5. Compare against the 90-day goals from SystemPrompt.md
6. Keep the report actionable — every section should end with what to DO, not just what happened
7. If this is the first week (no previous weekly review exists), skip the "Last Week" comparison column
