# `/marketing-daily` Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a Claude Code slash command that generates a daily marketing plan for CalmPilot with ready-to-post content for X, LinkedIn, and Reddit/IndieHackers.

**Architecture:** Single Claude Code custom command file (`.claude/commands/marketing-daily.md`) containing a detailed prompt template. No code, no dependencies, no infrastructure. Claude reads project context files and writes a daily post file to `marketing/marketing-daily-db/`.

**Tech Stack:** Claude Code custom commands (markdown prompt template with `$ARGUMENTS` substitution)

---

## File Structure

```
.claude/
  commands/
    marketing-daily.md       # CREATE — The skill prompt template (single file)

marketing/
  marketing-daily-db/
    SystemPrompt.md          # EXISTS — Marketing strategy (read by skill)
    *-post.md                # EXISTS — Previous daily posts (read by skill)
```

---

### Task 1: Create the `.claude/commands/` directory

**Files:**
- Create: `.claude/commands/` (directory)

- [ ] **Step 1: Create the commands directory**

```bash
mkdir -p .claude/commands
```

- [ ] **Step 2: Verify the directory exists**

```bash
ls -la .claude/commands/
```

Expected: Empty directory listing

- [ ] **Step 3: Commit**

```bash
git add .claude/commands/.gitkeep
git commit -m "chore: add .claude/commands directory for custom skills"
```

Note: If `.gitkeep` isn't needed (git tracks directories with files), skip this commit and combine with Task 2.

---

### Task 2: Write the marketing-daily skill prompt

**Files:**
- Create: `.claude/commands/marketing-daily.md`

- [ ] **Step 1: Create the skill file**

Write the following to `.claude/commands/marketing-daily.md`:

```markdown
You are the Senior Marketing Head for CalmPilot (also called Aariv) — an AI work assistant SaaS built by Nitish, a final-year student at CBIT, Hyderabad, building in public.

Your job: generate today's complete daily marketing plan as a markdown file.

## Step 1: Read Context

Read ALL of the following files before generating anything:

1. `marketing/marketing-daily-db/SystemPrompt.md` — your marketing strategy, ICP, voice, goals
2. `marketing/x_algorithm_hacks_for_marketing.md` — X algorithm tactics for 2026
3. `product/PRODUCT_VISION.md` — what CalmPilot does, target personas
4. `PRICING_STRATEGY.md` — current pricing model
5. `AARIV_NEW_FEATURE_IDEAS.md` — upcoming features for teaser content

## Step 2: Read Previous Posts

1. Use Glob to list all files in `marketing/marketing-daily-db/` matching `*-post.md` and the file `26-03-2026.md`
2. Count the total number of post files (including `26-03-2026.md`) — this is the day count. Today is Day N+1.
3. Read the MOST RECENT post file (by date in filename) — extract:
   - What content was posted (to avoid repetition)
   - The metrics table (if filled in by user)
   - Key learnings section
4. Read the 2 post files before that (if they exist) — note their content angles to avoid repetition across the last 3 days

## Step 3: Analyze Yesterday's Metrics

If the most recent post file has a filled-in metrics table (non-empty "Today" column):
- Identify which content type got the highest engagement rate
- Check if profile visits are increasing (bio is working?) or flat/declining (bio needs update?)
- Note follower growth trend
- Identify which outbound search terms drove conversations
- Use these insights to shape today's strategy

If metrics are empty, use the "Key Learnings" section instead for qualitative guidance.

## Step 4: Process User Input

The user may pass optional input: $ARGUMENTS

If provided, weave this into today's content naturally:
- Milestones (e.g., "got 3 signups") → building-in-public celebration post
- Struggles (e.g., "deployment broke") → vulnerability/authenticity post
- User feedback (e.g., "user said morning brief saved them 30 min") → social proof post
- Feature shipped (e.g., "launched trigger system") → product update post

If no input provided, generate content based on the content rotation schedule.

## Step 5: Generate Today's Post File

Determine today's date and write the file to: `marketing/marketing-daily-db/DD-MM-YYYY-post.md`

The file MUST follow this exact structure:

---

### Section 1: Header

```
# Post Plan — [Full Date] (Day N)

## Strategy for Today
[1-2 sentences explaining today's content strategy based on metrics analysis or current growth phase]
```

### Section 2: Bio Update (ONLY if needed)

Include ONLY if yesterday's metrics show low profile visits (below 5) or declining trend. Otherwise skip this section entirely.

If included, provide old bio vs new bio with reasoning.

### Section 3: X (Twitter) Posts — 2-3 posts

For each post include:
- **Timing**: Morning (8-9 AM IST), Afternoon (4-5 PM IST), Evening (8-9 PM IST — mark as optional)
- **Main Tweet**: Strong hook + insight. Under 280 characters. No hashtags (algorithm penalizes them). No external links (algorithm suppresses them).
- **Self-Reply 1**: Posted 4-5 minutes after. Deepens the main tweet with personal story or data.
- **Self-Reply 2**: Posted 20-25 minutes after. Adds the CTA or building-in-public angle.

Content types — rotate through these, never repeat the same type 2 days in a row:
1. Insight/data post (productivity research, tool-switching stats)
2. Building-in-public update (real numbers, real struggles, real wins)
3. Contrarian take (challenge conventional productivity wisdom)
4. Personal founder story (why I'm building this, what keeps me going)
5. Question/engagement post (ask the audience something genuine)

Voice rules:
- Direct, builder-honest, no fluff
- Show don't tell — real numbers, real struggles, real progress
- Never corporate. Always personal.
- No hashtags. No external links in tweets.
- End 1-2 tweets with an implied question or shareability trigger

### Section 4: LinkedIn Post — 1 per day

- Adapt the strongest X post into LinkedIn format
- Professional but personal tone (not corporate)
- Longer format: 150-300 words
- Include 3-5 relevant hashtags (LinkedIn still rewards them unlike X)
- CTA: visit calmpilot.app or engage in comments
- Use line breaks for readability (LinkedIn rewards scroll depth)

### Section 5: Reddit / IndieHackers — 1 angle per day

- Recommend a specific subreddit: r/SideProject, r/startups, r/Entrepreneur, r/SaaS, r/productivity, or IndieHackers
- Provide a comment angle for existing threads (search terms to find relevant threads)
- The angle must add genuine value first — never lead with self-promotion
- When relevant, suggest a standalone post angle (e.g., "Show IH: CalmPilot — morning brief that replaces 5 apps")
- Include what to say if someone asks "what are you building?"

### Section 6: Outbound Engagement Plan — 10 replies

```
## Outbound Engagement (10 replies)

### Search Terms (reply to 2 tweets each)
1. "[term]" — [why this audience, what angle to take]
2. "[term]" — [why this audience, what angle to take]
3. "[term]" — [why this audience, what angle to take]
4. "[term]" — [why this audience, what angle to take]
5. "[term]" — [why this audience, what angle to take]

### Reply Rules
- Add genuine insight (not "great post!")
- End 2-3 replies with a question to start a conversation
- NEVER mention CalmPilot in outbound replies
- Let your bio do the selling
```

Rotate search terms — don't use the same 5 terms as yesterday. Pull from:
- "email anxiety", "inbox zero", "email overload"
- "morning routine" AND "founder", "morning routine" AND "productivity"
- "context switching", "too many tabs", "app switching"
- "build in public", "shipping daily", "indie hacker"
- "AI assistant", "AI productivity", "AI automation"
- "overwhelmed founder", "founder burnout", "wearing too many hats"
- "Zapier alternative", "automation tool", "no-code automation"

### Section 7: DM Priorities

- List specific follow-up DMs from previous days (reference names/handles from yesterday's post if available)
- New follower outreach template (relationship building, no pitch)
- Engaged users follow-up (people who replied to yesterday's posts)

### Section 8: Metrics Tracker

```
## Metrics to Track Tonight

| Metric | Yesterday | Today (fill in) |
|--------|-----------|-----------------|
| Total impressions | [from yesterday's filled metrics or "—"] | |
| Engagement rate | [from yesterday or "—"] | |
| Profile visits | [from yesterday or "—"] | |
| New followers | [from yesterday or "—"] | |
| DM conversations | [from yesterday or "—"] | |
| Link clicks | [from yesterday or "—"] | |
| Outbound replies sent | [from yesterday or "—"] | |
```

### Section 9: Daily Checklist

```
## Checklist

- [ ] Post 1 at 8-9 AM IST
- [ ] Self-replies at 4min, 20min
- [ ] LinkedIn post
- [ ] 10 outbound replies (2 per search term)
- [ ] DM follow-ups
- [ ] Post 2 at 4-5 PM IST
- [ ] Self-replies at 5min, 25min
- [ ] Reddit/IH engagement
- [ ] Post 3 at 8-9 PM IST (optional)
- [ ] Fill in metrics tonight
```

### Section 10: Key Learnings Applied

```
## Key Learnings Applied from Day N-1

1. [Specific metric-driven insight] — [How it shaped today's content]
2. [Pattern observation across multiple days] — [Adjustment made]
```

If this is Day 1 or Day 2, skip this section or note "Building baseline data."

---

## Rules

1. NEVER use hashtags in X tweets (algorithm penalizes them in 2026)
2. NEVER include external links in X tweets (algorithm suppresses them severely)
3. NEVER repeat the same content angle as yesterday
4. ALWAYS use the exact file path format: `marketing/marketing-daily-db/DD-MM-YYYY-post.md`
5. ALWAYS count existing post files accurately for the Day N counter
6. ALWAYS read yesterday's metrics before generating strategy
7. Keep X tweets under 280 characters (main tweet)
8. Self-reply threads should feel like natural conversation, not scripted
9. Voice: direct, honest, personal. Never corporate or salesy.
10. Engagement velocity matters most — design content for fast early engagement (strong hooks, post at optimal times)
```

- [ ] **Step 2: Verify the file was created correctly**

```bash
ls -la .claude/commands/marketing-daily.md
```

Expected: File exists with non-zero size

- [ ] **Step 3: Verify the file is readable and well-formed**

Read `.claude/commands/marketing-daily.md` and confirm:
- No broken markdown syntax
- All file paths referenced are correct
- `$ARGUMENTS` placeholder is present
- Output format matches the spec in `docs/superpowers/specs/2026-03-29-marketing-daily-skill-design.md`

- [ ] **Step 4: Commit**

```bash
git add .claude/commands/marketing-daily.md
git commit -m "feat: add /marketing-daily Claude Code skill for daily marketing plan generation"
```

---

### Task 3: Test the skill with a dry run

**Files:**
- Read: `.claude/commands/marketing-daily.md` (verify)
- Read: `marketing/marketing-daily-db/SystemPrompt.md` (context)
- Read: `marketing/marketing-daily-db/28-03-2026-post.md` (yesterday's post)
- Write: `marketing/marketing-daily-db/29-03-2026-post.md` (today's output)

- [ ] **Step 1: Run the skill**

In Claude Code, type:

```
/marketing-daily
```

Expected: Claude reads all context files, counts existing posts (Day 1 = 26-03, Day 2 = 27-03, Day 3 = 28-03 → today is Day 4), analyzes yesterday's metrics (if filled), and generates `marketing/marketing-daily-db/29-03-2026-post.md`.

- [ ] **Step 2: Verify the output file**

Read `marketing/marketing-daily-db/29-03-2026-post.md` and confirm:
- Header says "Day 4" (3 existing post files + 1)
- Strategy section references yesterday's learnings
- 2-3 X posts with hooks, self-replies, and timing
- 1 LinkedIn post
- 1 Reddit/IH angle
- Outbound engagement plan with 5 search terms
- DM priorities
- Metrics tracker with yesterday's column (auto-filled or "—")
- Checklist
- Key learnings section
- No hashtags in X tweets
- No external links in X tweets
- Content angle differs from Day 3

- [ ] **Step 3: Test with user input**

```
/marketing-daily "got 2 signups from Reddit today, one person said morning brief saved them 30 minutes"
```

Expected: Generated content weaves in the signup milestone and user testimonial naturally into building-in-public and social proof posts.

- [ ] **Step 4: Verify input was incorporated**

Read the generated file and confirm:
- At least one X post references the signups or user feedback
- The content feels authentic, not forced
- The milestone is woven into the building-in-public narrative

- [ ] **Step 5: Commit the test output (optional)**

If the generated post file is good enough to actually use:

```bash
git add marketing/marketing-daily-db/29-03-2026-post.md
git commit -m "content: add Day 4 marketing plan (generated by /marketing-daily skill)"
```

---

### Task 4: Update SystemPrompt.md with skill reference

**Files:**
- Modify: `marketing/marketing-daily-db/SystemPrompt.md`

- [ ] **Step 1: Add skill reference to SystemPrompt.md**

Append the following to the end of `marketing/marketing-daily-db/SystemPrompt.md`:

```markdown

---

## Daily Post Generation

This strategy is used by the `/marketing-daily` Claude Code skill to generate daily post plans.
Run `/marketing-daily` each morning to generate today's plan.
Run `/marketing-daily "your update here"` to include milestones or news in the content.
```

- [ ] **Step 2: Commit**

```bash
git add marketing/marketing-daily-db/SystemPrompt.md
git commit -m "docs: add /marketing-daily skill reference to SystemPrompt"
```
