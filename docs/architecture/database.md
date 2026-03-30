# Database Architecture

## Overview

CalmPilot uses Supabase (managed PostgreSQL) as its primary datastore. Every table has Row-Level Security (RLS) enabled so that users can only access their own data via the client SDK, while the Python backend uses the `service_role` key which bypasses RLS for administrative operations. Supabase real-time subscriptions are available on all tables; stored procedures are used for all atomic write operations (billing, trigger counters, briefing cursor) to prevent race conditions under concurrent requests.

---

## Schema Diagram

```
auth.users (1:1) → profiles
auth.users (1:1) → user_credits
auth.users (1:n) → billing_transactions
auth.users (1:n) → triggers → trigger_events
auth.users (1:n) → conversations → messages → tool_execution_logs
auth.users (1:n) → review_items
auth.users (1:n) → composio_entities
auth.users (1:n) → briefings
auth.users (1:1) → user_briefing_state
auth.users (1:n) → user_activity_log
auth.users (1:n) → feedback
```

`trigger_events` also has an optional FK → `review_items` (a review item can reference the event that created it).

---

## Tables

### profiles

Auto-created by the `handle_new_user` trigger when a row is inserted into `auth.users`. Never inserted manually.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | UUID | — | PK; FK → `auth.users(id) ON DELETE CASCADE` |
| `email` | TEXT | — | User's email address |
| `name` | TEXT | NULL | Display name (from OAuth metadata or email prefix) |
| `avatar_url` | TEXT | NULL | Profile picture URL |
| `history_retention_days` | INTEGER | NULL | Auto-delete conversations older than N days; NULL = keep forever |
| `created_at` | TIMESTAMPTZ | `NOW()` | Row creation timestamp |
| `last_login_at` | TIMESTAMPTZ | `NOW()` | Updated on every auth event via upsert |
| `timezone` | TEXT | `'UTC'` | User's local timezone (IANA format) |
| `onboarding_step` | INTEGER | `0` | 0=signed-up, 1=welcome-seen, 2=app-connected, 3=first-briefing-seen |
| `first_app_connected_at` | TIMESTAMPTZ | NULL | Timestamp of first Composio app connection |
| `first_briefing_seen_at` | TIMESTAMPTZ | NULL | Timestamp of first briefing viewed (FVM milestone) |
| `onboarding_skipped` | BOOLEAN | `FALSE` | Whether the user skipped onboarding |
| `preferred_model` | TEXT | `'gpt-4.1-mini'` | Default LLM model for this user's chat |
| `briefing_mode` | TEXT | `'smart'` | `'smart'` (event-driven) or `'fixed'` (scheduled time) |
| `briefing_time` | TIME / TEXT | `'08:00'` | Local time for fixed-mode briefings |
| `spend_alert_threshold` | NUMERIC(10,2) | `10.00` | Monthly spend threshold for email alerts |
| `spend_alert_sent_month` | TEXT | NULL | Month key (`YYYY-MM`) of last sent alert to prevent duplicates |

**Indexes**
- `idx_profiles_email` on `(email)`
- `idx_profiles_spend_threshold` on `(spend_alert_threshold) WHERE spend_alert_threshold IS NOT NULL`

**RLS policies**
- `SELECT`: `auth.uid() = id` — users read own row only
- `UPDATE`: `auth.uid() = id` — users update own row only
- `ALL` (service role): unrestricted

---

### user_credits

One row per user. Holds prepaid credit balance, subscription tier, and usage-limit counters. Auto-created with a $5.00 default balance by `handle_new_user`.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `user_id` | UUID | — | PK; FK → `auth.users(id) ON DELETE CASCADE` |
| `balance` | NUMERIC(10,4) | `5.0000` | Current prepaid credit balance in USD |
| `total_spent` | NUMERIC(10,4) | `0.0000` | Lifetime cumulative spend |
| `auto_refill_enabled` | BOOLEAN | `FALSE` | Whether automatic top-up is active |
| `auto_refill_threshold` | NUMERIC(10,2) | `1.00` | Balance level that triggers auto-refill |
| `auto_refill_amount` | NUMERIC(10,2) | `10.00` | Amount added per auto-refill |
| `last_updated` | TIMESTAMPTZ | `NOW()` | Timestamp of last balance change |
| `created_at` | TIMESTAMPTZ | `NOW()` | Row creation timestamp |
| `subscription_tier` | TEXT | `'free'` | `'free'` \| `'starter'` \| `'pro'` |
| `dodo_subscription_id` | TEXT | NULL | Dodo Payments subscription ID; set on `subscription.active` webhook |
| `chat_messages_used` | INTEGER | `0` | Chat messages consumed this billing cycle |
| `chat_messages_limit` | INTEGER | `50` | Per-cycle limit: 50 (free) / 500 (starter) / 2000 (pro) |
| `trigger_fires_today` | INTEGER | `0` | AI trigger summaries fired today (resets daily) |
| `trigger_fires_limit` | INTEGER | `10` | Daily limit: 10 (free) / -1 = unlimited (starter/pro) |
| `trigger_fires_reset_at` | DATE | `CURRENT_DATE` | Date when `trigger_fires_today` was last reset |
| `billing_cycle_start` | DATE | NULL | Start date of the current billing cycle |
| `timezone` | TEXT | `'UTC'` | User timezone (kept in sync with `profiles.timezone`) |
| `spend_alert_threshold` | NUMERIC | `10.00` | Monthly spend threshold for alerts (mirrored from profiles) |
| `spend_alert_sent_month` | TEXT | NULL | Month of last spend alert |

**Indexes**
- Primary key on `user_id`

**RLS policies**
- `SELECT`: `auth.uid() = user_id`
- `ALL` (service role): unrestricted

---

### billing_transactions

Immutable ledger of all credit movements (charges, top-ups, refunds, bonuses).

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | UUID | `gen_random_uuid()` | PK |
| `user_id` | UUID | — | FK → `user_credits(user_id) ON DELETE CASCADE` |
| `type` | `transaction_type` | — | Enum: `'usage'` \| `'credit'` \| `'refund'` \| `'bonus'` |
| `description` | TEXT | — | Human-readable label (e.g. "Agent Interaction") |
| `amount` | NUMERIC(10,4) | — | Negative for charges, positive for credits |
| `balance_after` | NUMERIC(10,4) | — | Snapshot of balance immediately after this transaction |
| `model` | TEXT | NULL | LLM model used (for usage rows) |
| `input_tokens` | INTEGER | `0` | Input token count |
| `output_tokens` | INTEGER | `0` | Output token count |
| `cache_read_tokens` | INTEGER | `0` | Prompt cache read tokens |
| `cache_write_tokens` | INTEGER | `0` | Prompt cache write tokens |
| `created_at` | TIMESTAMPTZ | `NOW()` | Transaction timestamp |

**Indexes**
- `idx_billing_tx_user` on `(user_id)`
- `idx_billing_tx_created` on `(created_at DESC)`
- `idx_billing_tx_user_created` on `(user_id, created_at DESC)`

**RLS policies**
- `SELECT`: `auth.uid() = user_id`
- `ALL` (service role): unrestricted

---

### triggers

One row per Composio trigger registered by a user. Tracks configuration, enabled state, and fire-count metrics.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | TEXT | — | PK (Composio trigger ID) |
| `user_id` | UUID | — | FK → `auth.users(id) ON DELETE CASCADE` |
| `connected_account_id` | TEXT | — | Composio connected account ID |
| `toolkit` | TEXT | — | App toolkit (e.g. `'gmail'`, `'github'`) |
| `trigger_slug` | TEXT | — | Composio trigger identifier slug |
| `trigger_name` | TEXT | NULL | Human-readable trigger name |
| `trigger_config` | JSONB | `{}` | Trigger-specific configuration parameters |
| `is_enabled` | BOOLEAN | `TRUE` | Whether the trigger is active |
| `is_auto` | BOOLEAN | `FALSE` | Whether created automatically (vs. user-initiated) |
| `created_at` | TIMESTAMPTZ | `NOW()` | Registration timestamp |
| `disabled_at` | TIMESTAMPTZ | NULL | When the trigger was disabled |
| `event_count` | INTEGER | `0` | Total events received (incremented atomically) |
| `last_event_at` | TIMESTAMPTZ | NULL | Timestamp of most recent event |
| `error_count` | INTEGER | `0` | Count of processing errors |

**Indexes**
- `idx_triggers_user` on `(user_id)`
- `idx_triggers_toolkit` on `(toolkit)`

**RLS policies**
- `SELECT`: `auth.uid() = user_id`
- `ALL` (service role): unrestricted

---

### trigger_events

Every inbound webhook / polled event from Composio. Child of `triggers`.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | TEXT | — | PK (Composio event ID) |
| `trigger_id` | TEXT | NULL | FK → `triggers(id) ON DELETE SET NULL` |
| `user_id` | UUID | — | FK → `auth.users(id) ON DELETE CASCADE` |
| `event_type` | TEXT | — | Composio event type string |
| `trigger_slug` | TEXT | — | Slug of the trigger that fired |
| `payload` | JSONB | — | Full raw event payload |
| `status` | TEXT | `'received'` | Processing status: `received`, `processed`, `error`, `skipped` |
| `error` | TEXT | NULL | Error message if processing failed |
| `processing_time_ms` | INTEGER | NULL | Processing latency in milliseconds |
| `created_at` | TIMESTAMPTZ | `NOW()` | Event arrival timestamp |
| `source` | TEXT | `'composio'` | Origin: `'composio'` \| `'bootstrap'` \| `'poll_aariv'` |

**Indexes**
- `idx_tevents_user` on `(user_id)`
- `idx_tevents_trigger` on `(trigger_id)`
- `idx_tevents_created` on `(created_at DESC)`
- `idx_tevents_user_created` on `(user_id, created_at DESC)` — covers feed query
- `idx_tevents_user_status` on `(user_id, status)` — covers status-filtered feed
- `idx_tevents_source` on `(source) WHERE source != 'composio'` — partial, for non-Composio sources
- `idx_trigger_events_user_id` on `(user_id)` (added by later migration)

**RLS policies**
- `SELECT`: `auth.uid() = user_id`
- `ALL` (service role): unrestricted

---

### composio_entities

Maps Composio entity IDs (which can differ from Supabase UUIDs) to `auth.users`. Prevents phantom user creation when a webhook arrives with an entity ID that is not a valid UUID.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `composio_entity_id` | TEXT | — | PK; Composio-assigned entity identifier |
| `user_id` | UUID | — | FK → `auth.users(id) ON DELETE CASCADE` |
| `app_name` | TEXT | NULL | Optional app context (e.g. `'gmail'`) |
| `created_at` | TIMESTAMPTZ | `NOW()` | Row creation timestamp |

**Indexes**
- `idx_composio_entities_user` on `(user_id)`

**RLS policies**
- `SELECT`: `auth.uid() = user_id`
- `ALL` (service role): unrestricted

---

### review_items

AI-processed action items surfaced from trigger events for the user to review, approve, or dismiss.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | TEXT | — | PK |
| `user_id` | UUID | — | FK → `auth.users(id) ON DELETE CASCADE` |
| `source_app` | TEXT | — | App that generated this item (e.g. `'gmail'`) |
| `trigger_slug` | TEXT | NULL | Trigger slug that produced this item |
| `trigger_event_id` | TEXT | NULL | FK → `trigger_events(id) ON DELETE SET NULL` |
| `title` | TEXT | — | Short title shown in the UI |
| `description` | TEXT | — | Full description / body |
| `priority` | TEXT | `'medium'` | `'low'` \| `'medium'` \| `'high'` \| `'urgent'` |
| `category` | TEXT | `'general'` | Item category (e.g. `'email'`, `'pr'`, `'meeting'`) |
| `status` | TEXT | `'pending'` | `'pending'` \| `'actioned'` \| `'dismissed'` \| `'snoozed'` |
| `actions` | JSONB | `[]` | List of available action objects |
| `action_context` | JSONB | `{}` | Extra context for action execution |
| `ai_confidence` | FLOAT | NULL | Model confidence score (0–1) |
| `snoozed_until` | TIMESTAMPTZ | NULL | Wake time if status = `'snoozed'` |
| `resolved_at` | TIMESTAMPTZ | NULL | When the item was actioned or dismissed |
| `resolved_action` | TEXT | NULL | Which action was taken |
| `created_at` | TIMESTAMPTZ | `NOW()` | Creation timestamp |

**Indexes**
- `idx_review_user_status` on `(user_id, status)`
- `idx_review_created` on `(created_at DESC)`
- `idx_review_priority` on `(priority)`
- `idx_review_items_user_status` on `(user_id, status)` (added by later migration)

**RLS policies**
- `SELECT`: `auth.uid() = user_id`
- `ALL` (service role): unrestricted

---

### conversations

Top-level chat sessions. Each conversation belongs to one user and holds an ordered list of messages.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | UUID | `gen_random_uuid()` | PK |
| `user_id` | UUID | — | FK → `auth.users(id) ON DELETE CASCADE` |
| `title` | TEXT | NULL | Auto-generated or user-set conversation title |
| `created_at` | TIMESTAMPTZ | `NOW()` | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | `NOW()` | Updated whenever a new message is added |

**Indexes**
- `idx_conversations_user` on `(user_id)`
- `idx_conversations_user_updated` on `(user_id, updated_at DESC)` — covers sidebar list query

**RLS policies**
- `ALL` (user): `auth.uid() = user_id` — full CRUD for own conversations
- `ALL` (service role): unrestricted

---

### messages

Individual messages within a conversation. Role follows the OpenAI/Anthropic convention.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | UUID | `gen_random_uuid()` | PK |
| `conversation_id` | UUID | — | FK → `conversations(id) ON DELETE CASCADE` |
| `role` | TEXT | — | `'user'` \| `'assistant'` \| `'system'` \| `'tool'`; enforced by CHECK |
| `content` | TEXT | NULL | Message body (may be NULL for tool-result messages) |
| `timestamp` | TIMESTAMPTZ | `NOW()` | Message timestamp |

**Indexes**
- `idx_messages_conv` on `(conversation_id)`
- `idx_messages_conv_ts` on `(conversation_id, timestamp)` — covers history load query

**RLS policies**
- `ALL` (user): `conversation_id IN (SELECT id FROM conversations WHERE user_id = auth.uid())` — access inherited via conversation ownership
- `ALL` (service role): unrestricted

---

### tool_execution_logs

Lightweight log of tool calls made during message processing. Linked to the assistant message that triggered them.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | UUID | `gen_random_uuid()` | PK |
| `message_id` | UUID | — | FK → `messages(id) ON DELETE CASCADE` |
| `tool_name` | TEXT | NULL | Name of the tool called |
| `label` | TEXT | NULL | Display label shown in the UI |
| `status` | TEXT | NULL | `'running'` \| `'success'` \| `'error'` |
| `timestamp` | TIMESTAMPTZ | `NOW()` | Execution timestamp |

**Indexes**
- `idx_tool_logs_msg` on `(message_id)`

**RLS policies**
- `ALL` (service role): unrestricted (no user-level read policy; accessed only via backend)

---

### user_briefing_state

One row per user. Tracks the cursor used by the smart briefing system to know which trigger events have already been summarised.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `user_id` | UUID | — | PK; FK → `auth.users(id) ON DELETE CASCADE` |
| `events_cursor_at` | TIMESTAMPTZ | NULL | Watermark — events after this timestamp are "unseen" |
| `last_briefing_at` | TIMESTAMPTZ | NULL | When the last briefing was generated |
| `last_seen_at` | TIMESTAMPTZ | NULL | When the user last opened the briefing |
| `briefing_version` | INTEGER | `0` | Monotonically increasing generation counter |
| `created_at` | TIMESTAMPTZ | `NOW()` | Row creation timestamp |
| `updated_at` | TIMESTAMPTZ | `NOW()` | Updated on every cursor advance |

**Indexes**
- Primary key on `user_id`

**RLS policies**
- `SELECT`: `auth.uid() = user_id`
- `ALL` (service role): unrestricted

---

### user_activity_log

Records the first app open per user per calendar day. Used by the briefing scheduler to determine when to push a daily briefing.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `user_id` | UUID | — | Part of composite PK |
| `activity_date` | DATE | — | Part of composite PK (local calendar date) |
| `first_open_at` | TIMESTAMPTZ | — | Timestamp of the first open on that date |
| `timezone` | TEXT | `'UTC'` | User timezone at time of logging |

**Indexes**
- Composite PK `(user_id, activity_date)`
- `idx_user_activity_user_date` on `(user_id, activity_date DESC)`

**RLS policies**
- `SELECT`: `auth.uid() = user_id`
- `ALL` (service role): unrestricted

---

### briefings

Stores pre-generated daily briefing documents. One row per user per date (unique constraint).

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | UUID | `gen_random_uuid()` | PK |
| `user_id` | UUID | — | Owner |
| `briefing_date` | DATE | — | Local date of the briefing |
| `data` | JSONB | — | Full briefing payload (sections, summaries, action items) |
| `emailed_at` | TIMESTAMPTZ | NULL | When the briefing email was sent; NULL if not yet sent |
| `created_at` | TIMESTAMPTZ | `NOW()` | Generation timestamp |

**Constraints**
- `UNIQUE (user_id, briefing_date)` — one briefing per user per day

**Indexes**
- Primary key on `id`
- Unique index on `(user_id, briefing_date)`

**RLS policies**
- `SELECT`: `auth.uid() = user_id`
- `ALL` (service role): unrestricted

---

### feedback

User-submitted feedback (bugs, feature requests, UX issues, general comments).

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | UUID | `gen_random_uuid()` | PK |
| `user_id` | UUID | — | FK → `auth.users(id) ON DELETE CASCADE` |
| `category` | TEXT | — | `'bug'` \| `'feature'` \| `'ux'` \| `'general'`; enforced by CHECK |
| `rating` | SMALLINT | NULL | Optional 1–5 star rating; enforced by CHECK |
| `message` | TEXT | — | Feedback body |
| `page` | TEXT | NULL | App page / route where feedback was submitted |
| `created_at` | TIMESTAMPTZ | `NOW()` | Submission timestamp |

**Indexes**
- `idx_feedback_user_id` on `(user_id)`
- `idx_feedback_category` on `(category)`
- `idx_feedback_created_at` on `(created_at DESC)`

**RLS policies**
- `INSERT`: `auth.uid() = user_id` — users can submit their own feedback only; no SELECT for users
- `ALL` (service role): unrestricted (backend reads all feedback)

---

## Enums

### `transaction_type`

Defined in `production_schema_v2.sql`.

| Value | Meaning |
|-------|---------|
| `usage` | Debit for AI model consumption |
| `credit` | Top-up or manual credit grant |
| `refund` | Refund of a previous charge |
| `bonus` | Promotional or loyalty credit |

Used by the `type` column of `billing_transactions`.

---

## Stored Procedures

| Name | Purpose | Parameters | Returns |
|------|---------|------------|---------|
| `handle_new_user()` | AFTER INSERT trigger on `auth.users`; creates a `profiles` row and seeds `user_credits` with $5.00 | — (trigger function) | TRIGGER |
| `charge_user_atomic(p_user_id, p_amount, p_description, p_model, p_input_tokens, p_output_tokens)` | Atomically deducts `p_amount` from `user_credits.balance` and inserts a `billing_transactions` row | UUID, NUMERIC, TEXT, TEXT, INT, INT | NUMERIC (new balance) |
| `charge_overage_atomic(p_user_id, p_cost)` | Like `charge_user_atomic` but with a row-level lock; returns `-999` if balance is insufficient | UUID, NUMERIC | NUMERIC (new balance or -999) |
| `credit_user_atomic(p_user_id, p_amount, p_description)` | Atomically adds `p_amount` to `user_credits.balance` and logs a `billing_transactions` credit row | UUID, NUMERIC, TEXT | NUMERIC (new balance) |
| `increment_trigger_event_count(p_trigger_id)` | Increments `triggers.event_count` and updates `last_event_at` | TEXT | VOID |
| `increment_trigger_fires(p_user_id)` | Increments `user_credits.trigger_fires_today`, resetting counter first if the calendar date has changed | UUID | VOID |
| `try_increment_trigger_fire(p_user_id, p_free_limit)` | Atomic check-and-increment for trigger fires; returns FALSE (blocked) if free-tier cap is reached | UUID, INT (default 10) | BOOLEAN |
| `reset_daily_trigger_fires()` | Resets `trigger_fires_today = 0` for all users where `trigger_fires_reset_at < CURRENT_DATE`; intended for pg_cron | — | VOID |
| `advance_briefing_cursor(p_user_id, p_now)` | Upserts `user_briefing_state`, advancing `events_cursor_at` and incrementing `briefing_version` | UUID, TIMESTAMPTZ | VOID |
| `count_events_since_cursor(p_user_id)` | Returns count of `trigger_events` for the user after their briefing cursor timestamp | UUID | INTEGER |
| `cleanup_expired_conversations()` | Deletes conversations (and cascaded messages/tool logs) older than `profiles.history_retention_days` for each user that has the setting set | — | INTEGER (deleted count) |

All functions use `SECURITY DEFINER` so they run with the definer's privileges regardless of the calling role. Service-role `GRANT EXECUTE` is applied where the Python backend calls them via RPC.

---

## Migration Pattern

SQL migration files live in `python-agent/supabase/`. There is no migration framework — files are applied manually in the Supabase SQL Editor or via the Supabase CLI (`supabase db push`).

**Existing migration files (apply in this order on a fresh database):**

1. `production_schema_v2.sql` — full schema, all base tables, core stored procedures
2. `onboarding_migration.sql` — adds onboarding columns to `profiles`; adds `source` to `trigger_events`
3. `subscription_tier_migration.sql` — adds subscription/usage-limit columns to `user_credits`; adds tier-aware RPCs
4. `smart_briefing_state.sql` — creates `user_briefing_state`; adds briefing cursor RPCs
5. `user_activity_log_briefings.sql` — creates `user_activity_log` and `briefings`; adds `timezone` to `user_credits`
6. `feedback_table.sql` — creates `feedback` table
7. `add_subscription_columns.sql` — adds `dodo_subscription_id` to `user_credits` (if not present)
8. `fix_missing_columns.sql` — backfill of any missing `profiles` and `user_credits` columns; additional indexes
9. `pre-launch-checklist.sql` — adds `preferred_model`, `briefing_mode`, `briefing_time`, `spend_alert_*` to `profiles`; additional performance indexes

All migrations use `IF NOT EXISTS` / `IF NOT EXISTS` guards where possible, making them safe to re-run on a live database.

---

## Common Tasks

### How do I add a new table?

1. Create a new SQL file in `python-agent/supabase/` named after the feature (e.g. `my_feature.sql`).

2. Write the `CREATE TABLE` statement with a UUID primary key and a `user_id` FK:

   ```sql
   CREATE TABLE IF NOT EXISTS public.my_table (
       id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
       -- ... columns ...
       created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
   );
   ```

3. Enable RLS and add the standard policies:

   ```sql
   ALTER TABLE public.my_table ENABLE ROW LEVEL SECURITY;

   CREATE POLICY "Users can view own my_table rows"
       ON public.my_table FOR SELECT
       USING (auth.uid() = user_id);

   CREATE POLICY "Service role full access on my_table"
       ON public.my_table FOR ALL
       USING (true) WITH CHECK (true);
   ```

4. Add any indexes needed for your query patterns.

5. Run the file in the Supabase SQL Editor (dashboard → SQL Editor → paste → Run).

6. Update this document with the new table's column reference.

---

### How do I add a stored procedure?

1. In your migration SQL file, write a `CREATE OR REPLACE FUNCTION` block:

   ```sql
   CREATE OR REPLACE FUNCTION public.my_function(
       p_user_id UUID,
       p_value   TEXT
   )
   RETURNS VOID
   LANGUAGE plpgsql
   SECURITY DEFINER
   AS $$
   BEGIN
       -- implementation
   END;
   $$;

   GRANT EXECUTE ON FUNCTION public.my_function(UUID, TEXT) TO service_role;
   ```

2. Use `SECURITY DEFINER` so the function can write to tables beyond the caller's RLS scope.

3. Grant execute to `service_role` if the Python backend calls it via `supabase.rpc()`.

4. Call it from Python:

   ```python
   supabase.rpc("my_function", {"p_user_id": str(user_id), "p_value": "..."}).execute()
   ```

5. Run the SQL file in the Supabase SQL Editor.

6. Add the new function to the **Stored Procedures** table in this document.
