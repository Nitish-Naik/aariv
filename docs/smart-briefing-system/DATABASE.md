# Database — Smart Briefing System

## New Table: `user_briefing_state`

```sql
CREATE TABLE IF NOT EXISTS public.user_briefing_state (
    user_id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    events_cursor_at  TIMESTAMPTZ,
    last_briefing_at  TIMESTAMPTZ,
    last_seen_at      TIMESTAMPTZ,
    briefing_version  INTEGER NOT NULL DEFAULT 0,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE public.user_briefing_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own briefing state"
    ON public.user_briefing_state FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Service role full access"
    ON public.user_briefing_state FOR ALL
    USING (true) WITH CHECK (true);
```

### Column Definitions

| Column | Type | Purpose |
|--------|------|---------|
| `user_id` | UUID PK | Links to auth.users |
| `events_cursor_at` | TIMESTAMPTZ | "Show events after this timestamp." Advances when user views briefing. NULL = first time (show all recent). |
| `last_briefing_at` | TIMESTAMPTZ | When the most recent briefing was generated (for debugging/analytics) |
| `last_seen_at` | TIMESTAMPTZ | When the user last viewed any briefing (for engagement tracking) |
| `briefing_version` | INTEGER | Increments each generation (for cache invalidation) |

### State Machine

```
Sign up:
  events_cursor_at = NULL
  last_seen_at = NULL

First briefing viewed:
  events_cursor_at = NOW()
  last_seen_at = NOW()
  briefing_version = 1

Morning briefing viewed:
  events_cursor_at = NOW()  (advances past overnight events)
  last_seen_at = NOW()
  briefing_version = 2

Midday check (no new events):
  events_cursor_at = unchanged  (nothing to advance past)
  last_seen_at = NOW()          (user still visited)
  briefing_version = unchanged

Pre-gen cron runs:
  NO CHANGES (cursor only advances when user views)
```

## RPC Function: `advance_briefing_cursor`

Atomic cursor advancement to prevent race conditions (two tabs open).

```sql
CREATE OR REPLACE FUNCTION public.advance_briefing_cursor(
    p_user_id UUID,
    p_now TIMESTAMPTZ DEFAULT NOW()
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.user_briefing_state (
        user_id, last_briefing_at, last_seen_at,
        events_cursor_at, briefing_version, updated_at
    )
    VALUES (p_user_id, p_now, p_now, p_now, 1, p_now)
    ON CONFLICT (user_id) DO UPDATE SET
        last_briefing_at = p_now,
        last_seen_at = p_now,
        events_cursor_at = p_now,
        briefing_version = user_briefing_state.briefing_version + 1,
        updated_at = p_now;
END;
$$;

GRANT EXECUTE ON FUNCTION public.advance_briefing_cursor(UUID, TIMESTAMPTZ)
    TO service_role;
```

## RPC Function: `count_events_since_cursor`

Fast event count without loading full rows.

```sql
CREATE OR REPLACE FUNCTION public.count_events_since_cursor(
    p_user_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_cursor TIMESTAMPTZ;
    v_count INTEGER;
BEGIN
    -- Get the cursor
    SELECT events_cursor_at INTO v_cursor
    FROM public.user_briefing_state
    WHERE user_id = p_user_id;

    -- Count events since cursor (or last 24h if no cursor)
    IF v_cursor IS NULL THEN
        SELECT COUNT(*) INTO v_count
        FROM public.trigger_events
        WHERE user_id = p_user_id
          AND created_at > NOW() - INTERVAL '24 hours';
    ELSE
        SELECT COUNT(*) INTO v_count
        FROM public.trigger_events
        WHERE user_id = p_user_id
          AND created_at > v_cursor;
    END IF;

    RETURN COALESCE(v_count, 0);
END;
$$;

GRANT EXECUTE ON FUNCTION public.count_events_since_cursor(UUID)
    TO service_role;
```

## Auto-Create on Signup

Add to existing `handle_new_user()` trigger function:

```sql
-- Inside the existing handle_new_user() function body, add:
INSERT INTO public.user_briefing_state (user_id)
VALUES (NEW.id)
ON CONFLICT (user_id) DO NOTHING;
```

## Backfill Existing Users

One-time migration for users who already exist:

```sql
INSERT INTO public.user_briefing_state (user_id)
SELECT id FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_briefing_state)
ON CONFLICT DO NOTHING;
```

## Existing Indexes (Already Sufficient)

The `trigger_events` table already has:
```sql
CREATE INDEX idx_tevents_user_created ON trigger_events (user_id, created_at DESC);
```

This covers all cursor-based queries. No new indexes needed.

## Supabase Realtime

Enable on `trigger_events` table:
- Supabase Dashboard → Database → Replication → Enable for `trigger_events`
- RLS already configured → users only see their own events via Realtime
