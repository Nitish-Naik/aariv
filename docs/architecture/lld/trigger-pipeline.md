# Trigger Pipeline — Low-Level Design

**File:** `python-agent/triggers.py`
**Class:** `TriggerDispatcher` (singleton instance: `dispatcher`)

---

## Flow Diagram

```
Composio Webhook / SDK Subscription
          |
          v
  handle_event(payload)
          |
          +-> _is_duplicate(payload)  --- YES --> DROP (log only)
          |         | NO
          |         v
          +-> _resolve_verified_user_id(raw_id, trigger_id, account_id)
          |         | NULL
          |         +-----------------------------> _dead_letter_event()
          |         | user_id resolved
          |         v
          +-> _log_event_to_db(user_id, trigger_slug, payload)
          |         +-> stores event_id back on payload["_db_event_id"]
          |         v
          +-> _is_noise(payload) ----- YES --> DROP (log only)
          |         | NO
          |         v
          +-> _queue_for_processing(debounce_key, payload)
                    |
                    +-> Buffers payload in event_buffer[key]
                    +-> Cancels existing timer for key (if any)
                    +-> Sets new call_later timer
                                |
                         [debounce window expires]
                                |
                                v
                   _process_quiet_window(key)
                                |
                    +-> Collect all buffered events
                    +-> Build context_string from event data
                    +-> _update_event_statuses(ids, "processing")
                    +-> _trigger_background_summary(user_id, context, slug, ids)
                                |
                    +-> try_increment_trigger_fire RPC (atomic check)
                    |         | BLOCKED -> update statuses "failed", return
                    |         | ALLOWED
                    +-> _get_cached_tools(user_id)
                    +-> Agent(name, instructions, model, tools)
                    +-> Runner.run(agent, input=context)
                    |         |
                    +-> notification_manager.push(user_id, summary)
                    +-> _update_event_statuses(ids, "completed")
                    +-> _extract_review_items(user_id, summary, slug, context, ids)
                                |
                    +-> gpt-4o-mini JSON classification call
                    +-> create_review_item() x N (max 3)
                    +-> _persist_notification(user_id, notification)
```

---

## Functions Reference

| Name | File:Line | Purpose | Inputs | Outputs |
|---|---|---|---|---|
| `handle_event` | triggers.py:296 | Main entry point for all incoming webhooks | `payload: Dict` | None (async) |
| `_is_duplicate` | triggers.py:279 | Dedup check using in-memory fingerprint dict | `payload: Dict` | `bool` |
| `_event_fingerprint` | triggers.py:254 | Compute dedup key from trigger_id + slug + data_hash | `payload: Dict` | `str` |
| `_resolve_verified_user_id` | triggers.py:866 | Map raw Composio user_id to verified Supabase UUID | `raw_user_id, trigger_id, connected_account_id` | `str or None` |
| `_is_real_user` | triggers.py:935 | Check if UUID exists in profiles table | `user_id: str` | `bool` |
| `_lookup_composio_entity` | triggers.py:977 | Query composio_entities for entity->auth mapping | `composio_entity_id: str` | `str or None` |
| `_lookup_user_from_trigger` | triggers.py:1014 | Query triggers table by trigger_id | `trigger_id: str` | `str or None` |
| `_lookup_user_from_connected_account` | triggers.py:1037 | Query triggers table by connected_account_id | `connected_account_id: str` | `str or None` |
| `_get_sole_real_user` | triggers.py:954 | Return only profile ID if exactly 1 user exists | None | `str or None` |
| `_store_composio_entity` | triggers.py:998 | Upsert entity->auth mapping for future resolution | `composio_entity_id, user_id, app_name` | None |
| `_log_event_to_db` | triggers.py:703 | Insert event into trigger_events, run DB-level dedup | `user_id, trigger_slug, payload` | None (mutates `payload["_db_event_id"]`) |
| `_auto_sync_trigger` | triggers.py:834 | Upsert a trigger record to local DB from webhook metadata | `supabase_admin, trigger_id, user_id, trigger_slug, metadata` | `bool` |
| `_is_noise` | triggers.py:1086 | L1 heuristic noise filter | `payload: Dict` | `bool` |
| `_queue_for_processing` | triggers.py:395 | Buffer event and (re)start debounce timer | `key: str, payload: Dict` | None (async) |
| `_process_quiet_window` | triggers.py:422 | Process all buffered events after quiet period | `key: str` | None (async) |
| `_trigger_background_summary` | triggers.py:464 | Orchestrate AI summary agent for buffered events | `user_id, context, trigger_slug, event_db_ids` | None (async) |
| `_extract_review_items` | triggers.py:575 | Use gpt-4o-mini to detect actionable items from summary | `user_id, summary, trigger_slug, context, event_db_ids` | None (async) |
| `_update_event_statuses` | triggers.py:1060 | Batch update trigger_events.status | `event_ids, status, processing_time_ms, error` | None (async) |
| `_dead_letter_event` | triggers.py:1122 | Log unmappable events as structured DEAD_LETTER_EVENT | `trigger_slug, payload` | None (async) |
| `_persist_notification` | triggers.py:1143 | Update trigger_events.status to "notified" | `user_id, notification` | None (async) |
| `_get_tier_and_fires` | triggers.py:205 | Fetch subscription_tier + trigger_fires_today | `user_id: str` | `tuple[str, int]` |
| `_increment_trigger_fires` | triggers.py:222 | Call increment_trigger_fires RPC | `user_id: str` | None |
| `_get_cached_tools` | triggers.py:18 | Return Composio tools list with 1h TTL cache | `user_id: str` | `list` |
| `_get_routing_prompt` | triggers.py:157 | Look up per-app system prompt from TRIGGER_PROMPTS | `trigger_slug: str` | `str` |
| `_get_notification_type` | triggers.py:165 | Map trigger slug to frontend notification category | `trigger_slug: str` | `str` |

---

## Deduplication

Two layers of deduplication prevent the same event from being processed twice (webhook and SDK subscription can both deliver the same event; poll-based triggers like Gmail re-deliver each cycle).

### Layer 1 — In-Memory (`_is_duplicate`)

- **Structure:** `_seen_events: Dict[str, float]` — maps fingerprint to timestamp
- **TTL:** `_seen_ttl = 3600` seconds (1 hour), pruned when dict exceeds 1000 entries
- **Lock:** `asyncio.Lock` (`_seen_lock`) prevents concurrent writes
- **Fingerprint logic (`_event_fingerprint`):**
  ```
  fingerprint = trigger_id + ":" + trigger_slug + ":" + md5(data)[:12]
  ```
  - `log_id`, `timestamp`, `receivedAt` are intentionally excluded — poll triggers re-deliver with new log_ids but identical data
  - Empty fingerprint (`:::`) is never deduplicated

### Layer 2 — Database (`_log_event_to_db`)

Two DB checks run inside `_log_event_to_db` before inserting:

1. **Payload fingerprint dedup:** MD5 of `user_id:trigger_slug:stable_data` (excluding volatile fields) — checked against `trigger_events` for events in the past 1 hour
2. **Per-message ID dedup:** Checks `messageId` / `message_id` in payload JSONB against the past 24 hours

If either check matches, `payload["_db_event_id"] = None` is set and the insert is skipped.

---

## Noise Filtering

`_is_noise(payload)` — L1 heuristic, runs synchronously before debounce queue.

**Content fields checked** (across all supported trigger types):

| Field | Trigger types |
|---|---|
| `text` | Slack messages |
| `subject` | Gmail emails |
| `title` | GitHub issues/PRs, Calendar events |
| `message` | GitHub commits, generic |
| `body` | Email/issue body |
| `summary` | Calendar, generic |
| `description` | Issues, PRs |
| `name` | Notion pages |

**Logic:**
1. Concatenate all non-empty fields
2. If combined length < 3 chars — noise (empty event)
3. If any noise keyword is present — noise

**Noise keywords:** `["joined the channel", "set the channel description", "has left", "channel was archived", "pinned a message"]`

Returns `True` (is noise) — event is dropped silently after logging.

---

## Debouncing

The "quiet window" strategy collapses rapid flurries of events (e.g. 10 Slack messages in 5 seconds) into a single AI call.

| Tier | Debounce Window | Constant |
|---|---|---|
| free | 1800 seconds (30 min) | `FREE_TIER_DEBOUNCE_SECS` |
| starter / pro | 30 seconds | `PAID_TIER_DEBOUNCE_SECS` |

**Mechanism:**
- `event_buffer: Dict[str, List[Dict]]` — keyed by `"{user_id}:{app_name}:{channel_key}"`
- `active_timers: Dict[str, asyncio.TimerHandle]` — one timer per debounce key
- Each new event appends to buffer and **resets** (cancels + restarts) the timer
- Timer fires `_process_quiet_window(key)` which drains the entire buffer for that key
- `channel_key` = `data.channel_id` or `data.thread_id` or `"global"`, so each Slack channel has its own independent quiet window

---

## AI Summarization

**Entry point:** `_trigger_background_summary()`

**Prompt routing:** `_get_routing_prompt(trigger_slug)` — splits slug on `_`, takes prefix (`GMAIL_NEW_GMAIL_MESSAGE` -> `GMAIL`), looks up `TRIGGER_PROMPTS` dict. Falls back to `DEFAULT_PROMPT` for unknown apps.

**Supported apps with specialized prompts:** GitHub, Gmail, Slack, Google Calendar, Notion, Linear, Discord, Outlook, Google Drive, Google Docs, Stripe, Jira, Trello, Todoist, Pipedrive, Salesforce, Spotify, YouTube, Fireflies, OneDrive, Coda, TimelinesAI.

**Model selection (tier-based):**

| Tier | Summary Model |
|---|---|
| free | `gpt-4.1-mini` |
| starter / pro | `gpt-4o` |

**Review item extraction:** After the summary is generated, a second `gpt-4o-mini` call with JSON-mode extracts up to 3 actionable items for the review queue. Each item has `title`, `description`, `priority` (high/medium/low), and `confidence` (0.0–1.0). Category is mapped from trigger slug prefix (e.g. `gmail` -> `email`, `slack` -> `message`, `googlecalendar` -> `calendar`).

---

## Rate Limiting

**Trigger fires per day** (`try_increment_trigger_fire` PostgreSQL stored procedure):

| Tier | Daily Limit | Constant |
|---|---|---|
| free | 10 | `FREE_TIER_FIRES_LIMIT = 10` |
| starter | unlimited (-1) | — |
| pro | unlimited (-1) | — |

**Enforcement:**
- Primary: `supabase.rpc("try_increment_trigger_fire", {p_user_id, p_free_limit})` — atomic row-level lock (`FOR UPDATE`), resets counter if date changed, returns `BOOLEAN`
- Fallback (if RPC fails): reads `trigger_fires_today` from `user_credits`, compares against limit, calls `increment_trigger_fires` RPC to increment separately

If limit is reached, `_update_event_statuses(ids, "failed", error="Free tier daily limit reached")` is called and the function returns early without running the AI agent.

**Tools cache** to avoid per-fire Composio API calls:
- `_tools_cache: Dict[str, tuple]` — `user_id -> (tools_list, cached_at_ts)`
- TTL: 3600s (1 hour), max 500 entries (LRU-evicts oldest key when full)

---

## Error Handling

| Stage | Error | Handling |
|---|---|---|
| `_is_duplicate` | Lock contention | `asyncio.Lock` blocks; no timeout |
| `_resolve_verified_user_id` | All lookups fail | Returns `None` -> `_dead_letter_event()` logs structured JSON to stdout, function returns |
| `_log_event_to_db` | Supabase unavailable | Logs warning, returns; `payload["_db_event_id"]` not set; event still proceeds through pipeline |
| `_log_event_to_db` | FK violation on trigger_id | `_auto_sync_trigger()` creates trigger record; if that also fails, `trigger_id = None` (event stored without FK link) |
| `_queue_for_processing` | Timer fires but buffer is empty | `_process_quiet_window` returns early |
| `_trigger_background_summary` | `try_increment_trigger_fire` RPC fails | Falls back to non-atomic check + `_increment_trigger_fires` |
| `_trigger_background_summary` | Agent/Runner exception | Catches all exceptions; updates statuses to "failed"; pushes fallback notification: `"New {app} activity detected. AI summary temporarily unavailable."` |
| `_extract_review_items` | JSON parse failure or API error | Catches exception; creates fallback review item with `ai_confidence=0.5` and `priority="medium"` |
| `_dead_letter_event` | Exception in logging | Wrapped in try/except; logs error and returns silently |

---

## Key Architectural Decisions

1. **Single global dispatcher instance** — `TriggerDispatcher` is a module-level singleton. All state (timers, buffers, seen-events) is in-process. This works for a single pod but would require Redis pub/sub for horizontal scaling.

2. **Quiet window over immediate processing** — Batching events prevents a burst of 20 Slack messages from making 20 separate AI calls. Free users get a 30-minute window to further reduce costs.

3. **Two-layer deduplication** — In-memory layer is fast (O(1) dict lookup) and handles same-event delivery within seconds. DB layer catches cases where in-memory dict was cleared (server restart) or the event re-arrives later via poll.

4. **Optimistic noise filtering** — The noise filter is deliberately lenient (only blocks empty content and explicit bot phrases) to avoid silently dropping valid events.

5. **Model tiering** — Free users get `gpt-4.1-mini` (~6x cheaper than `gpt-4o`), making the free tier economically viable.

6. **Dead-letter logging** — Events with unresolvable user IDs are logged as structured JSON (`DEAD_LETTER_EVENT`) rather than silently dropped, enabling diagnosis in production log search.

7. **Lazy user resolution cascade** — `_resolve_verified_user_id` tries 5 strategies before giving up, handling the case where Composio entity IDs diverge from Supabase UUIDs after account migrations.
