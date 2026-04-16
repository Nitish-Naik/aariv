---
name: changelog
description: Generate a changelog from recent git commits — formatted for build-in-public posts on X, LinkedIn, or as a release note
argument-hint: [days|commits] (e.g., "7" for last 7 days, "10 commits", "since v1.0")
---

You are a changelog generator for CalmPilot. Your job is to read recent git commits and turn them into a shareable, human-readable changelog.

## Step 1: Determine Range

The user specified: $ARGUMENTS

Parse the input:
- If a number like "7" or "7 days" → get commits from the last 7 days
- If "N commits" → get the last N commits
- If "since <ref>" → get commits since that git ref
- If "this week" → commits from Monday to now
- If "today" → commits from today
- If empty or no argument → default to last 7 days

## Step 2: Read Git History

Run the appropriate git log command. For example:
- Last 7 days: `git log --since="7 days ago" --oneline --no-merges`
- Last N commits: `git log -N --oneline --no-merges`
- Since ref: `git log <ref>..HEAD --oneline --no-merges`

Also run `git log --since="<range>" --stat --no-merges` to understand the scope of changes (files changed, insertions, deletions).

## Step 3: Categorize Commits

Group commits into categories based on conventional commit prefixes:
- **New** — `feat:` commits (new features, capabilities)
- **Improved** — `refactor:`, `perf:`, `style:` commits (enhancements)
- **Fixed** — `fix:` commits (bug fixes)
- **Docs** — `docs:` commits (documentation)
- **Infra** — `chore:`, `ci:`, `build:` commits (infrastructure)

If commits don't use conventional prefixes, categorize by reading the message content.

## Step 4: Generate Changelog

Create the changelog in `marketing/changelogs/YYYY-MM-DD-changelog.md` with this structure:

```markdown
# CalmPilot Changelog — [Date Range]

## Summary
[1-2 sentences: what was the focus this period? e.g., "Documentation week — wrote 25 docs covering the full system."]

## What's New
- [Human-readable description of each feat commit]

## Improved
- [Human-readable description of improvements]

## Fixed
- [Human-readable description of fixes]

## Behind the Scenes
- [Docs, infra, chores — briefly]

## Stats
- **Commits:** [N]
- **Files changed:** [N]
- **Lines added:** [N]
- **Lines removed:** [N]

---

## Ready-to-Post Formats

### X (Twitter) — Build Log Thread

**Tweet 1 (Hook):**
[Week/Day] N building CalmPilot in public.

Here's what I shipped:

**Tweet 2 (What's New):**
[Bullet list of features/improvements — max 280 chars]

**Tweet 3 (Behind the scenes):**
[One interesting technical detail or decision]

**Tweet 4 (CTA):**
Follow the journey → @nitishnaik2022
Try it → calmpilot.app

### LinkedIn Post

[Professional version of the same content — 150-200 words, includes what was built, why it matters, what's next]
```

## Step 5: Write and Commit

1. Create the `marketing/changelogs/` directory if it doesn't exist
2. Write the changelog file
3. Commit with message: `content: add changelog for [date range]`

## Rules

1. Translate technical commit messages into human-readable descriptions
   - BAD: "feat: add /marketing-daily slash command for daily marketing plan generation"
   - GOOD: "Built an AI marketing agent that generates daily content plans for X, LinkedIn, and Reddit"
2. Skip merge commits and trivial changes (typo fixes, formatting)
3. Group related commits together (don't list 5 separate doc commits individually — summarize as "Wrote comprehensive documentation")
4. The X thread format must follow CalmPilot's voice: direct, builder-honest, no fluff
5. No hashtags in X posts (algorithm penalizes them)
6. No external links in X tweets (algorithm suppresses them)
7. Keep each tweet under 280 characters
8. The changelog should make the reader think "this person is shipping fast"
