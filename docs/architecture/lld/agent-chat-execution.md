# Agent Chat Execution — Low-Level Design

**Files:** `python-agent/routers/chat.py`, `python-agent/services/session.py`
**Endpoint:** `POST /api/chat`

---

## Flow Diagram

```
Client (Next.js)
     |
     | POST /api/chat  {userId, message, model, conversationId, timezone, currentDate}
     v
chat_endpoint(request, _user)  [FastAPI route]
     |
     +-> JWT auth middleware (get_current_user)
     |         | 401 if invalid token
     |         v
     +-> userId match check (request.userId == token.userId)
     |         | 403 if mismatch
     |         v
     +-> _is_rate_limited(userId)  [sliding window 20 req/min]
     |         | 429 if exceeded
     |         v
     +-> _check_and_increment_chat_quota(userId)
     |         +-> _maybe_reset_billing_cycle(userId, data)  [lazy monthly reset]
     |         | quota_status.ok == False -> SSE: chat_quota_exceeded
     |         v
     +-> Model gate check (tier vs requested model)
     |         +-> Downgrade model if tier insufficient
     |         v
     +-> asyncio.create_task(run_agent_stream(...))
     |
     +-> StreamingResponse(event_generator(), media_type="text/event-stream")
                    |
                    v (background)
          run_agent_stream(userId, message, event_queue, ...)
                    |
                    +-> _ensure_conversation(userId, message, conversationId)
                    |         +-> Creates conversation row in Supabase if no ID
                    |         v
                    +-> composio_client.create(user_id=userId, toolkits=[...])
                    +-> session.tools()  [fetch Composio tools]
                    +-> Tier gate: strip COMPOSIO_MANAGE_CONNECTIONS for free users
                    |
                    +-> Build system prompt (tz_context + apps_context + tier-based connect text)
                    |
                    +-> Agent(name, instructions, model, tools)
                    +-> SupabaseSession(user_id, conversation_id)
                    |
                    +-> event_queue.put("log: Initializing assistant...")
                    |
                    +-> Runner.run_streamed(agent, input=message, session=memory)
                    |
                    +-- SSE event loop (async for event in stream.stream_events()) --+
                    |                                                                |
                    |   raw_response_event + ResponseOutputItemAddedEvent           |
                    |       -> put({"type": "log", "data": {label, "running"}})     |
                    |                                                                |
                    |   raw_response_event + ResponseOutputItemDoneEvent            |
                    |       -> update log status (success/error)                    |
                    |       -> if COMPOSIO_MANAGE_CONNECTIONS: extract redirect URL |
                    |           -> put({"type": "auth_required", "data": ...})      |
                    |       -> if COMPOSIO_MULTI_EXECUTE_TOOL: try_parse_data_card  |
                    |           -> put({"type": "data_card", "data": ...})          |
                    |       -> put({"type": "log", "data": updated_log})            |
                    |                                                                |
                    |   raw_response_event + ResponseCompletedEvent                 |
                    |       -> accumulate total_input_tokens + total_output_tokens  |
                    |                                                                |
                    |   raw_response_event + ResponseTextDeltaEvent                 |
                    |       -> put({"type": "token", "data": delta})                |
                    +----------------------------------------------------------------+
                    |
                    +-> put({"type": "result", "data": {response, conversationId, logs}})
                    |
                    +-> _fire_and_forget(save_interaction_to_db(...))
                    |
                    +-> put(None)  [signals stream end]
```

---

## Functions Reference

| Name | File | Purpose | Inputs | Outputs |
|---|---|---|---|---|
| `chat_endpoint` | chat.py:679 | FastAPI route — auth, rate limit, quota gate, model gate, starts stream | `ChatRequest, _user: dict` | `StreamingResponse` |
| `_check_and_increment_chat_quota` | chat.py:64 | Read quota, lazy-reset if needed, increment used count | `user_id: str` | `dict {ok, tier, used, limit}` |
| `_maybe_reset_billing_cycle` | chat.py:23 | Lazy monthly cycle reset for free and paid users | `user_id: str, data: dict` | `dict` (mutated) |
| `_is_rate_limited` | chat.py:128 | Sliding window 20 req/min per user (in-memory deque) | `user_id: str` | `bool` |
| `run_agent_stream` | chat.py:312 | Build agent, stream events to queue, save to history | `userId, message, event_queue, conversationId, model, timezone, currentDate, userName` | None (async) |
| `_ensure_conversation` | chat.py:290 | Get or create conversation row, return its ID | `userId, message, conversationId` | `str` (conversation UUID) |
| `_friendly_tool_label` | chat.py:221 | Convert raw Composio tool names to human-readable labels | `tool_name: str, tool_args: dict or str` | `str` |
| `_fire_and_forget` | chat.py:103 | Schedule coroutine as background task with error logging | `coro, label: str` | `asyncio.Task` |
| `SupabaseSession.__init__` | session.py:29 | Initialize session with user_id + conversation_id | `user_id, conversation_id` | `SupabaseSession` |
| `SupabaseSession.get_items` | session.py:34 | Load prior messages from Supabase messages table | `limit: int or None` | `list[dict]` |
| `SupabaseSession.add_items` | session.py:89 | No-op (persistence handled by save_interaction_to_db) | `items: list` | None |

---

## Tool Selection

Tools are fetched per user via the Composio session at the start of every chat request.

**Flow:**
1. `composio_client.create(user_id=userId, toolkits=["gmail", "googlecalendar", "slack"])` — creates a scoped Composio session restricted to 3 supported apps
2. `session.tools()` — returns the tool list for those apps (includes COMPOSIO_SEARCH_TOOLS, COMPOSIO_MULTI_EXECUTE_TOOL, COMPOSIO_MANAGE_CONNECTIONS)
3. **Tier gate:** If `subscription_tier == "free"` and not in grace period, `COMPOSIO_MANAGE_CONNECTIONS` is removed from the tools list, preventing free users from generating new OAuth connection links inside chat

**Currently supported toolkits (launch phase):** `gmail`, `googlecalendar`, `slack`

All other apps (github, notion, etc.) are commented out in `ALLOWED_APPS` and will be unlocked as demand grows.

---

## Agent Construction

The `Agent` is built fresh for every request using the OpenAI Agents SDK.

**Parameters:**
```python
Agent(
    name="CalmPilot",
    instructions=<system_prompt>,  # built dynamically
    model=requested_model,          # gpt-4.1-mini / gpt-4.1 / gpt-4o / gpt-5 (tier-gated)
    tools=tools,                    # Composio tools fetched above
)
```

**System prompt composition:**
1. Core identity ("You are CalmPilot...") + supported app names
2. Tool usage instructions (COMPOSIO_SEARCH_TOOLS then COMPOSIO_MULTI_EXECUTE_TOOL)
3. Connecting apps section — tier-conditional:
   - Paid users: generate connection link via COMPOSIO_MANAGE_CONNECTIONS
   - Free users (post-grace): redirect to integrations page, no link generation
4. Confirmation rules (specific requests: do immediately; vague/destructive: ask first)
5. Sign-off with user's actual name (never "CalmPilot")
6. `tz_context` — injected if `timezone` or `currentDate` present in request
7. `apps_context` — injected if user has active connections (lists connected app slugs)

**Model tier gates:**

| Model | Minimum Tier |
|---|---|
| gpt-4.1-mini, gpt-4.1-nano, gpt-4o, gpt-4o-mini | free |
| gpt-4.1 | starter |
| gpt-5, gpt-5.1, gpt-5.2, gpt-5.4 | pro |

If user's tier is below minimum for requested model, they are downgraded to the best available model for their tier.

**Timeout:** `AGENT_TIMEOUT_SECONDS = 120` — enforced via `asyncio.timeout(120)`.

---

## SSE Streaming

Events are pushed from `run_agent_stream` to `event_queue: asyncio.Queue`, then consumed by `event_generator()` which formats them as `data: {json}\n\n`.

**Event types:**

| Type | When | Data shape |
|---|---|---|
| `log` | Tool call starts (status="running") or ends (status="success"/"error") | `{label, status, tool}` |
| `token` | Text delta arrives from model | `delta: str` |
| `data_card` | COMPOSIO_MULTI_EXECUTE_TOOL returns structured data | Parsed card object (emails, events, etc.) |
| `auth_required` | COMPOSIO_MANAGE_CONNECTIONS returns a redirect URL | `{appName, url}` |
| `result` | Agent run completes | `{response, auth_actions, logs, actions_taken, conversationId}` |
| `chat_quota_exceeded` | Quota check fails at route level | `{used, limit, reason}` |
| `error` | Exception or timeout in agent run | `string message` |

**Client disconnect handling:** `event_generator()` wraps the queue drain in a try/finally. When the client disconnects, `agent_task.cancel()` is called to stop token generation and avoid wasting credits on a dead stream.

**Data cards:** When `COMPOSIO_MULTI_EXECUTE_TOOL` completes, `try_parse_data_card(action_name, tool_output)` attempts to parse structured results (email lists, calendar events, etc.) into typed card objects for rich frontend rendering.

---

## Billing Integration

Chat billing uses **quota-based subscription enforcement** (not per-token charging).

**Quota gate (`_check_and_increment_chat_quota`):**
1. Reads `user_credits` row: `subscription_tier, chat_messages_used, chat_messages_limit, billing_cycle_start`
2. Runs lazy billing cycle reset if needed
3. If `used < limit`: increments `chat_messages_used` and allows the request
4. If `used >= limit`: returns `{ok: False}` — all tiers are hard-blocked (no overage)

**Monthly limits per tier:**

| Tier | chat_messages_limit |
|---|---|
| free | 50 |
| starter | 500 |
| pro | 2000 |

**Billing cycle reset logic:**
- Free users: reset on the 1st of each calendar month (`cycle_start.month != today.month`)
- Paid users: reset 30 days after `billing_cycle_start` (rolling 30-day window)

**In-request rate limit (not billing):** Separate sliding window — `_is_rate_limited()` allows max 20 requests/60 seconds per user using an in-memory `deque`. This prevents abuse even within quota.

Token counts (`total_input_tokens`, `total_output_tokens`) are collected from `ResponseCompletedEvent` for analytics logging only — no per-token charge is applied.

---

## Conversation Persistence

**`SupabaseSession`** implements the OpenAI Agents SDK `Session` protocol.

**On request start:**
1. `_ensure_conversation()` creates a row in `conversations` table if `conversationId` is None
2. `SupabaseSession(user_id, conversation_id)` is constructed
3. `Runner.run_streamed(session=memory)` calls `memory.get_items()` to load prior context

**`get_items()`:**
- Queries `messages` table: `WHERE conversation_id = ? ORDER BY timestamp`
- Only returns `user` and `assistant` role messages (skips `tool`, `system`)
- Returns list of `{role, content}` dicts — directly consumable by OpenAI API
- Returns `[]` if no `conversation_id` (new conversation)

**`add_items()` — no-op.** Persistence after the run is handled by `save_interaction_to_db()` called via `_fire_and_forget()` after the stream completes.

**`save_interaction_to_db()`** (in `routers/history.py`) inserts:
- User message row: `{role: "user", content: message}`
- Assistant response row: `{role: "assistant", content: final_output}`
- Tool execution logs if any

This fire-and-forget approach means history is saved even if the client disconnects before the stream ends.

---

## Error Handling

| Error | Where | Handling |
|---|---|---|
| Invalid/expired JWT | `get_current_user` middleware | 401 Unauthorized |
| `userId` mismatch between token and body | `chat_endpoint` | 403 Forbidden |
| Rate limit exceeded | `_is_rate_limited()` | 429 Too Many Requests |
| Quota exceeded | `_check_and_increment_chat_quota()` | SSE stream with `chat_quota_exceeded` event |
| Composio client not initialized | `chat_endpoint` | 500 Internal Server Error |
| `asyncio.TimeoutError` (120s exceeded) | `run_agent_stream` try/except | SSE `error` event: "Request timed out. Please try a simpler query." |
| General exception in agent run | `run_agent_stream` try/except | SSE `error` event with exception string |
| `save_interaction_to_db` failure | `_fire_and_forget` done callback | Logs error, does not affect the user response |
| Auth link extraction failure (COMPOSIO_MANAGE_CONNECTIONS) | Inside SSE event loop | Logs warning, continues stream without auth_required event |
| Data card parse failure | Inside SSE event loop | Logs warning, continues stream without data_card event |
