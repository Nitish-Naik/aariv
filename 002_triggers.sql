-- =============================================================================
-- Composio Triggers: Tables for storing trigger instances and event logs
-- =============================================================================

-- 1. triggers — stores user-created trigger instances from Composio
CREATE TABLE IF NOT EXISTS public.triggers (
  id TEXT PRIMARY KEY,                          -- Composio trigger instance ID (e.g. "ti_abc123")
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  connected_account_id TEXT NOT NULL,           -- Composio connected account ID
  toolkit TEXT NOT NULL,                        -- e.g. "github", "gmail", "slack"
  trigger_slug TEXT NOT NULL,                   -- e.g. "GITHUB_COMMIT_EVENT"
  trigger_name TEXT,                            -- Human-readable display name
  trigger_config JSONB DEFAULT '{}'::jsonb,     -- User-provided config (owner, repo, etc.)

  is_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  disabled_at TIMESTAMPTZ,

  -- Metrics (updated on event receipt)
  event_count INTEGER DEFAULT 0,
  last_event_at TIMESTAMPTZ,
  error_count INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_triggers_user_id ON public.triggers(user_id);
CREATE INDEX IF NOT EXISTS idx_triggers_toolkit ON public.triggers(toolkit);

-- 2. trigger_events — logs each incoming webhook event
CREATE TABLE IF NOT EXISTS public.trigger_events (
  id TEXT PRIMARY KEY,                          -- Composio event ID (e.g. "msg_abc123")
  trigger_id TEXT REFERENCES public.triggers(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  event_type TEXT NOT NULL,                     -- "composio.trigger.message"
  trigger_slug TEXT NOT NULL,                   -- "GITHUB_COMMIT_EVENT"
  payload JSONB NOT NULL,                       -- Full webhook payload
  
  status TEXT DEFAULT 'received',               -- received | processing | completed | failed
  error TEXT,
  processing_time_ms INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trigger_events_user_id ON public.trigger_events(user_id);
CREATE INDEX IF NOT EXISTS idx_trigger_events_trigger_id ON public.trigger_events(trigger_id);
CREATE INDEX IF NOT EXISTS idx_trigger_events_created_at ON public.trigger_events(created_at);

-- 3. Row-Level Security
ALTER TABLE public.triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trigger_events ENABLE ROW LEVEL SECURITY;

-- Service role has full access (backend uses service role key)
GRANT ALL ON public.triggers TO postgres;
GRANT ALL ON public.triggers TO service_role;
GRANT SELECT ON public.triggers TO authenticated;

GRANT ALL ON public.trigger_events TO postgres;
GRANT ALL ON public.trigger_events TO service_role;
GRANT SELECT ON public.trigger_events TO authenticated;

-- Users can only see their own triggers
CREATE POLICY triggers_select_own ON public.triggers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY trigger_events_select_own ON public.trigger_events
  FOR SELECT USING (auth.uid() = user_id);
