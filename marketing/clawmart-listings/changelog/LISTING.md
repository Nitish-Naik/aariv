# Claw Mart Listing — Build-in-Public Changelog Generator

## Listing Metadata

| Field | Value |
|-------|-------|
| **Name** | Build-in-Public Changelog Generator |
| **Type** | Skill |
| **Category** | Engineering |
| **Price** | $9 |
| **Version** | 1 |
| **License** | One-time purchase |
| **Compatible With** | Any git repository — works with any language, any framework |
| **Required Tools** | Claude Code (or any OpenClaw-compatible agent), a git repository |

## Short Description (100 chars)

Turn git commits into shareable changelogs — formatted for X, LinkedIn, and release notes

## About (Listing Body)

Stop manually writing changelogs. This skill reads your git history and generates a human-readable changelog with ready-to-post social media formats — perfect for founders building in public.

**What it does:**

- Reads your git commits for any time range (last 7 days, 10 commits, since v1.0, today)
- Auto-categorizes by type: New features, Improvements, Fixes, Behind the Scenes
- Generates a clean markdown changelog with commit stats
- Outputs a ready-to-post X/Twitter thread (hook → content → CTA)
- Outputs a ready-to-post LinkedIn post (professional tone, 150-200 words)
- Auto-detects your project name from package.json, pyproject.toml, Cargo.toml, or go.mod
- Works with conventional commits or plain commit messages

**Built for builders who ship fast and want to show it.**

The X thread format follows 2026 algorithm best practices:
- No hashtags (penalized by algorithm)
- No external links in tweets (suppressed by algorithm)
- Hook-first structure optimized for engagement
- Each tweet under 280 characters

Just run the skill, copy-paste into X or LinkedIn, and you've got a build-in-public post in under 60 seconds.

**Works with any project** — React, Python, Rust, Go, mobile apps, CLI tools. If it's in git, this skill can changelog it.

## Core Capabilities

- changelog
- git-history
- release-notes
- build-in-public
- x-posts
- linkedin
- social-media-content
- developer-marketing

## Example Output

```
Tweet 1: Week 12 building MyApp in public. Here's what I shipped:

Tweet 2:
- Real-time notifications for team mentions
- 40% faster dashboard load (lazy loading + caching)
- Fixed the auth redirect loop on mobile Safari

Tweet 3: The caching layer was the big win. Went from 3.2s to 0.8s on the dashboard by adding a 15-min TTL on the briefing endpoint. Sometimes the boring fix is the best fix.

Tweet 4: Follow the journey → @yourhandle
```

## API Payload (for programmatic listing)

```json
{
  "type": "skill",
  "name": "Build-in-Public Changelog Generator",
  "description": "Turn git commits into shareable changelogs — formatted for X, LinkedIn, and release notes",
  "category": "Engineering",
  "price": 900,
  "capabilities": ["changelog", "git-history", "release-notes", "build-in-public", "x-posts", "linkedin"]
}
```
