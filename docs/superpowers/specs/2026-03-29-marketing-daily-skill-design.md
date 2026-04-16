# Design Spec: `/marketing-daily` Claude Code Skill

**Date:** 2026-03-29
**Status:** Draft
**Author:** Claude (Marketing Head Agent brainstorm)

---

## 1. Overview

A Claude Code skill invoked via `/marketing-daily` that generates a complete daily marketing plan for CalmPilot. The output is a markdown file written to `marketing/marketing-daily-db/DD-MM-YYYY-post.md`, ready for the founder to execute in ~1 hour/day.

### Problem

- Nitish spends cognitive energy planning what to post, when, and where every day
- Content needs to be consistent with CalmPilot's voice, product knowledge, and building-in-public narrative
- Multi-platform marketing (X, LinkedIn, Reddit/IndieHackers) requires different formats and tones
- Strategy needs to evolve daily based on what's working (metrics-driven)

### Solution

A zero-cost, zero-infrastructure Claude Code skill that reads project context and generates a daily marketing playbook with ready-to-post content for all platforms.

---

## 2. User Flow

```
User types: /marketing-daily
   or: /marketing-daily "got 3 signups today, one from Reddit"

Skill runs:
  1. Reads SystemPrompt.md (ICP, voice, goals)
  2. Reads yesterday's post file (metrics, content, learnings)
  3. Reads product docs (pricing, features, roadmap)
  4. Reads X algorithm hacks
  5. Counts existing post files → determines Day N
  6. Analyzes yesterday's metrics (if filled in)
  7. Generates today's post file
  8. Writes file to marketing/marketing-daily-db/DD-MM-YYYY-post.md

Output: "Daily marketing plan written to marketing/marketing-daily-db/29-03-2026-post.md (Day 4)"
```

---

## 3. Input Sources

| Source | Path | What it provides |
|--------|------|-----------------|
| System Prompt | `marketing/marketing-daily-db/SystemPrompt.md` | ICP, voice/tone, 90-day goals, competitor info |
| Yesterday's Post | `marketing/marketing-daily-db/DD-MM-YYYY-post.md` (most recent) | Previous content (avoid repetition), metrics, learnings |
| Product Vision | `product/PRODUCT_VISION.md` | Core problems solved, target personas |
| Pricing Strategy | `PRICING_STRATEGY.md` | Current pricing model, positioning |
| X Algorithm Hacks | `marketing/x_algorithm_hacks_for_marketing.md` | Platform-specific tactics |
| Feature Ideas | `AARIV_NEW_FEATURE_IDEAS.md` | Upcoming features for teaser content |
| Market Research | `product/MARKET_RESEARCH_2026.md` | Competitor landscape, market data |
| Optional user input | CLI argument | Latest updates, milestones, mood |

---

## 4. Output Format

The generated file follows the established format from existing post files. Each daily file contains:

### 4.1 Header
```markdown
# Post Plan — March 29, 2026 (Day N)

## Strategy for Today
[1-2 sentences based on yesterday's metrics analysis and current phase]
```

### 4.2 Bio Update (if needed)
Only included if metrics suggest the current bio isn't converting (e.g., low profile visits). Otherwise omitted.

### 4.3 X (Twitter) Posts (2-3 per day)

Each post includes:
- **Timing** — Morning (8-9 AM IST), Afternoon (4-5 PM IST), Evening (8-9 PM IST, optional)
- **Main tweet** — Hook + insight + subtle CTA
- **Self-reply thread** (1-2 replies) — Deepens the main tweet, adds personal story or data
- **Delay instructions** — When to post each self-reply (e.g., "4-5 min after")

Content types to rotate:
- Insight/data posts (tool-switching stats, productivity research)
- Building-in-public updates (real numbers, struggles, wins)
- Contrarian takes (challenge conventional productivity advice)
- Personal story (founder journey, why I'm building this)
- Question/engagement posts (ask the audience)

### 4.4 LinkedIn Post (1 per day)

- Professional tone adaptation of the strongest X post
- Longer format (150-300 words)
- Includes relevant hashtags (3-5)
- CTA: visit calmpilot.app or comment

### 4.5 Reddit / IndieHackers Angle (1 per day)

- Target subreddit or IH section recommendation
- Comment angle (not self-promotion — add value first)
- Suggested thread topics to reply to (search terms)
- When relevant: a standalone post angle for r/SideProject, r/startups, or IH

### 4.6 Outbound Engagement Plan

```markdown
## Outbound Engagement (10 replies)

### Search Terms (reply to 2 tweets each)
1. "[search term]" — [why this audience matters]
2. "[search term]" — [angle to take]
...

### Reply Rules
- Add genuine insight (not "great post!")
- End 2-3 replies with a question
- NEVER mention CalmPilot in outbound replies
- Let your bio do the selling
```

### 4.7 DM Priorities

- Follow up with warm leads from previous days
- New follower outreach (relationship building, no pitch)
- People who engaged with yesterday's posts

### 4.8 Metrics Tracker

```markdown
## Metrics to Track Tonight

| Metric | Yesterday | Today (fill in) |
|--------|-----------|-----------------|
| Total impressions | [auto-filled from yesterday] | |
| Engagement rate | [auto-filled] | |
| Profile visits | [auto-filled] | |
| New followers | [auto-filled] | |
| DM conversations | [auto-filled] | |
| Link clicks | [auto-filled] | |
| Outbound replies sent | [auto-filled] | |
| Platform | X / LinkedIn / Reddit | |
```

### 4.9 Daily Checklist

```markdown
## Checklist

- [ ] Post 1 at 8-9 AM IST
- [ ] Self-replies at Xmin, Xmin
- [ ] LinkedIn post
- [ ] 10 outbound replies (2 per search term)
- [ ] DM follow-ups
- [ ] Post 2 at 4-5 PM IST
- [ ] Self-replies at Xmin, Xmin
- [ ] Reddit/IH engagement
- [ ] Post 3 at 8-9 PM IST (optional)
- [ ] Fill in metrics tonight
```

### 4.10 Key Learnings Applied

```markdown
## Key Learnings Applied from Day N-1

1. [Metric-driven insight] — [How it shaped today's content]
2. [Pattern observation] — [Adjustment made]
```

---

## 5. Smart Features

### 5.1 Auto Day Counter
- Scans all files in `marketing/marketing-daily-db/` matching `*-post.md`
- Counts total post files to determine the current day number
- Starts from Day 1 if no post files exist

### 5.2 Yesterday's Metrics Analysis
- Reads the most recent post file
- If the metrics table is filled in, analyzes:
  - Which content type got highest engagement rate?
  - Are profile visits increasing? (bio working?)
  - Is follower growth trending up?
  - Which outbound search terms drove conversations?
- Uses analysis to adjust today's strategy and content angles
- If metrics table is empty, uses qualitative learnings instead

### 5.3 Content Deduplication
- Reads last 3-5 post files
- Avoids repeating the same hooks, angles, or content types
- Rotates through content categories (insight, build-log, vulnerability, data, question)

### 5.4 Optional User Input
- If user provides input via CLI argument (e.g., `/marketing-daily "got 3 signups"`), weaves it into today's content naturally
- Milestones become building-in-public posts
- Struggles become vulnerability/authenticity posts
- User feedback becomes social proof posts

---

## 6. Technical Implementation

### 6.1 Skill Definition

The skill is a Claude Code custom skill defined in the project's `.claude/` configuration. It consists of:

- **Skill metadata** — name, description, trigger
- **Prompt template** — instructions for Claude on how to generate the daily plan
- **File operations** — read context files, write output file

### 6.2 File Structure

```
.claude/
  commands/
    marketing-daily.md    # The skill prompt template

marketing/
  marketing-daily-db/
    SystemPrompt.md       # Persistent marketing strategy (existing)
    26-03-2026.md         # Day 1 (existing)
    27-03-2026-post.md    # Day 2 (existing)
    28-03-2026-post.md    # Day 3 (existing)
    29-03-2026-post.md    # Day 4 (generated by skill)
```

### 6.3 Skill Prompt Structure

The skill prompt (`.claude/commands/marketing-daily.md`) will:

1. Instruct Claude to act as Senior Marketing Head (per SystemPrompt.md)
2. List all files to read for context
3. Define the output format (as specified in Section 4)
4. Include rules for metrics analysis, day counting, and content rotation
5. Accept optional `$ARGUMENTS` for user input

---

## 7. What This Does NOT Do

- No API calls to any platform (X, LinkedIn, Reddit)
- No auto-posting — user manually copies and posts
- No web scraping or trend analysis
- No image generation
- No cost beyond existing Claude Code subscription
- No new dependencies or infrastructure

---

## 8. Future Enhancements (Not in scope now)

- **X API integration** — auto-post when budget allows ($5-10 credit pack)
- **Metrics auto-import** — scrape X analytics to auto-fill metrics table
- **Weekly summary skill** — `/marketing-weekly` to analyze the week's performance
- **A/B testing** — generate 2 versions of each post, track which performs better
- **Content calendar** — `/marketing-calendar` for 7-day planning
- **LinkedIn API** — auto-post to LinkedIn
