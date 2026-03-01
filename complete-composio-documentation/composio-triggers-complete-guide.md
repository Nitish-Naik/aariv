# COMPLETE DETAILED GUIDE TO COMPOSIO TRIGGERS

---

## **Part 1: What Are Triggers? (Fundamentals)**

### **1.1 Definition**

**Triggers** are event-driven mechanisms that automatically capture when something happens in an external app and send that data to your application. They enable **fully automated workflows** without manual intervention.

```
Real World Example:
┌─────────────────┐
│  User commits   │  ← Event occurs
│  code to GitHub │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ GitHub sends    │  ← Webhook notification
│ webhook to      │
│ Composio        │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Composio        │  ← Forwards to your endpoint
│ forwards to     │
│ your app        │
└────────┬────────┘
         │
         ↓
┌─────────────────────────┐
│ Your app receives JSON  │
│ with commit details     │
│ and can respond         │
│ automatically           │
└─────────────────────────┘
```

### **1.2 What Gets Triggered?**

Triggers fire when these events occur:

**GitHub Events:**
- New commit pushed
- Pull request created/updated/merged
- Issue created/closed/commented
- Stars added
- Repository events
- Push to specific branch

**Gmail Events:**
- New email arrives
- Email marked as read/unread
- Email moved to folder
- Email flagged/unflagged
- Email deleted

**Slack Events:**
- New message in channel
- User mentioned in message
- Message reaction added
- Channel created
- User joined/left channel

**Linear Events:**
- Issue created/updated/closed
- Comment added to issue
- Issue status changed
- Priority updated
- Assignee changed

**And 1000+ other apps...**

---

## **Part 2: Trigger Architecture**

> Ref: [Composio Docs - Managing Triggers](https://docs.composio.dev/docs/setting-up-triggers/managing-triggers)

### **2.1 Two Delivery Types**

#### **A. Webhook Triggers (Real-Time) - Recommended** ✅

**How it works:**
- External app (GitHub, Slack) supports outgoing webhooks
- When event occurs, app **immediately sends HTTP POST** to Composio
- Composio **forwards within seconds** to your endpoint
- **Latency**: ~1-5 seconds

**Best for:**
- GitHub (commits, PRs, issues)
- Slack (new messages)
- Linear (issue updates)
- Discord (messages)
- Any app with webhook support

**Setup:**
```
External App (GitHub)
         ↓ (immediate webhook)
    Composio
         ↓ (immediate forward)
    Your API Endpoint
         ↓ (you process immediately)
    Your Database/Agent/Logic
```

#### **B. Polling Triggers (Delayed)**

**How it works:**
- Apps that **don't support webhooks** (Gmail, Google Calendar, Airtable)
- Composio **polls every minute** for new data
- When found, sends to your endpoint
- **Latency**: ~1-2 minutes

**Best for:**
- Gmail (checks every minute for new emails)
- Google Calendar (checks for new events)
- Airtable (checks for new records)
- Notion (checks for new pages)

**Setup:**
```
External App (Gmail)
    ↓ (waits)
    ↓ (waits)
    ↓ (1 minute passes)
Composio polls Gmail API
    ↓ (finds new email)
    Your API Endpoint
    ↓ (you process it)
    Your Database/Agent/Logic
```

---

## **Part 3: Complete Implementation Guide**

> Ref: [Composio Docs - Managing Triggers](https://docs.composio.dev/docs/setting-up-triggers/managing-triggers)

### **3.1 Prerequisites Before Creating Triggers**

You MUST have these before creating triggers:

```
✓ Auth Config for the toolkit (GitHub, Gmail, etc.)
  - This is the blueprint for how to authenticate with the external app
  - Created automatically by Composio when user connects via OAuth

✓ Connected Account (user's authenticated connection)
  - User must have authenticated with that service
  - Their OAuth token stored securely in Composio

✓ Webhook Endpoint (your server)
  - POST endpoint that can receive JSON payloads
  - Example: https://your-app.com/webhooks/composio
```

### **3.2 Step-by-Step: Creating a Trigger**

#### **Step 1: Inspect Trigger Type Configuration**

```python
from composio import Composio

composio = Composio()

# Before creating, check what config is required
trigger_type = composio.triggers.get_type("GITHUB_COMMIT_EVENT")

print(trigger_type.config)
# Output:
# {
#   "properties": {
#     "owner": {
#       "type": "string",
#       "description": "Repository owner (GitHub username or org)"
#     },
#     "repo": {
#       "type": "string",
#       "description": "Repository name"
#     }
#   },
#   "required": ["owner", "repo"]
# }

# Also check what data you'll receive
print(trigger_type.payload)
# Output:
# {
#   "properties": {
#     "commit_sha": {"type": "string"},
#     "message": {"type": "string"},
#     "author": {"type": "string"},
#     "url": {"type": "string"},
#     "timestamp": {"type": "string"}
#   }
# }
```

#### **Step 2: Create the Trigger Instance**

```python
from composio import Composio

composio = Composio()

# Create trigger for a specific user's GitHub account
trigger = composio.triggers.create(
    slug="GITHUB_COMMIT_EVENT",           # Type of event to watch
    user_id="user-123",                   # Which user's GitHub account
    trigger_config={
        "owner": "ComposioHQ",            # GitHub org/user
        "repo": "composio"                # Repository to watch
    }
)

print(f"✓ Trigger created successfully!")
print(f"  Trigger ID: {trigger.trigger_id}")  # ti_abc123xyz
print(f"  Status: {trigger.status}")           # "active"
print(f"  Created: {trigger.created_at}")      # timestamp
```

#### **Step 3: Register Your Webhook Endpoint**

```bash
curl -X POST https://backend.composio.dev/api/v3/webhook_subscriptions \
  -H "X-API-KEY: your_composio_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "webhook_url": "https://your-app.com/webhooks/composio",
    "enabled_events": ["composio.trigger.message", "composio.connected_account.expired"]
  }'

# Response:
# {
#   "subscription_id": "ws_def456",
#   "webhook_url": "https://your-app.com/webhooks/composio",
#   "secret": "whsec_abcd1234...",  ← SAVE THIS! Needed for signature verification
#   "enabled_events": [...]
# }
```

#### **Step 4: Create FastAPI Webhook Handler**

```python
from fastapi import FastAPI, Request, HTTPException
from composio import WebhookEventType
import hmac
import hashlib
import json
import os

app = FastAPI()

WEBHOOK_SECRET = os.getenv("COMPOSIO_WEBHOOK_SECRET")

@app.post("/webhooks/composio")
async def webhook_handler(request: Request):
    """
    Receives event notifications from Composio
    """

    # Get signature from header for verification
    signature = request.headers.get("X-Composio-Signature")
    body = await request.body()

    # Verify webhook is authentic
    expected = hmac.new(
        WEBHOOK_SECRET.encode(),
        body,
        hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(signature, expected):
        raise HTTPException(status_code=401, detail="Invalid signature")

    # Parse payload
    payload = json.loads(body)
    event_type = payload.get("type")

    # Handle trigger message events
    if event_type == "composio.trigger.message":
        metadata = payload["metadata"]
        trigger_slug = metadata["trigger_slug"]
        user_id = metadata["user_id"]
        event_data = payload["data"]

        print(f"✓ Event received from {trigger_slug}")
        print(f"  User: {user_id}")
        print(f"  Data: {event_data}")

        # Route to handler based on trigger type
        if trigger_slug == "GITHUB_COMMIT_EVENT":
            await handle_github_commit(user_id, event_data)

        elif trigger_slug == "GMAIL_NEW_EMAIL":
            await handle_new_email(user_id, event_data)

        elif trigger_slug == "SLACK_NEW_MESSAGE":
            await handle_slack_message(user_id, event_data)

    # Handle connection expiry events
    elif event_type == "composio.connected_account.expired":
        metadata = payload["metadata"]
        user_id = metadata["user_id"]
        toolkit = metadata.get("toolkit", "unknown")

        print(f"⚠️  Connection expired for {user_id}'s {toolkit}")
        await notify_user_reauth_needed(user_id, toolkit)

    return {"status": "ok"}


async def handle_github_commit(user_id: str, data: dict):
    """Process GitHub commit event"""
    print(f"[GitHub] New commit by {data['author']}: {data['message']}")

    # Save to database
    await db.commits.insert({
        "user_id": user_id,
        "sha": data["commit_sha"],
        "message": data["message"],
        "author": data["author"],
        "url": data["url"],
        "timestamp": data["timestamp"]
    })

    # Optionally trigger agent to analyze code changes
    agent = get_agent_config(user_id)
    prompt = f"New commit: {data['message']} by {data['author']}"
    response = await AgentService.chat(user_id, prompt, agent)


async def handle_new_email(user_id: str, data: dict):
    """Process new email event"""
    print(f"[Gmail] New email from {data['from']}: {data['subject']}")

    # Save to database
    await db.emails.insert({
        "user_id": user_id,
        "from": data["from"],
        "subject": data["subject"],
        "body": data["body"],
        "timestamp": data["timestamp"]
    })

    # Trigger agent to categorize and draft response
    agent = get_agent_config(user_id)
    prompt = f"""
    New email from {data['from']}
    Subject: {data['subject']}
    Body: {data['body']}

    Categorize this email and suggest a response.
    """
    analysis = await AgentService.chat(user_id, prompt, agent)

    # Queue for user approval before sending
    await db.draft_responses.insert({
        "user_id": user_id,
        "email_id": data["id"],
        "draft": extract_draft(analysis),
        "status": "pending_approval"
    })


async def handle_slack_message(user_id: str, data: dict):
    """Process new Slack message event"""
    print(f"[Slack] New message in {data['channel']}: {data['text']}")

    # Save to database
    await db.slack_messages.insert({
        "user_id": user_id,
        "channel": data["channel"],
        "text": data["text"],
        "user": data.get("user"),
        "timestamp": data["timestamp"]
    })
```

---

## **Part 4: Complete Webhook Payload Structure**

### **4.1 Trigger Message Payload (When Event Occurs)**

```json
{
  "id": "msg_abc123",
  "type": "composio.trigger.message",
  "metadata": {
    "log_id": "log_xyz789",
    "trigger_slug": "GITHUB_COMMIT_EVENT",
    "trigger_id": "ti_abc123",
    "connected_account_id": "ca_def456",
    "auth_config_id": "ac_xyz789",
    "user_id": "user-123",
    "timestamp": "2026-02-28T22:30:00Z"
  },
  "data": {
    "commit_sha": "a1b2c3d4e5f6",
    "message": "fix: resolve null pointer exception",
    "author": "jane_developer",
    "url": "https://github.com/composio/composio/commit/a1b2c3d4e5f6",
    "timestamp": "2026-02-28T22:30:00Z",
    "branch": "main",
    "files_changed": 3,
    "additions": 15,
    "deletions": 8
  },
  "timestamp": "2026-02-28T22:30:00Z"
}
```

**Key Fields Explained:**

| Field | What It Means | Why It's Useful |
|-------|--------------|-----------------|
| `id` | Unique event ID | Prevent duplicate processing |
| `type` | Event category | Route to correct handler |
| `metadata.trigger_slug` | Type of trigger | Know what happened (GitHub, Gmail, etc) |
| `metadata.trigger_id` | Which trigger fired | Track which specific trigger is working |
| `metadata.user_id` | Which user | Process with correct user context |
| `metadata.connected_account_id` | Which account | Handle multiple accounts per toolkit |
| `data` | Actual event data | Process the real event information |

### **4.2 Connection Expiry Payload**

```json
{
  "id": "msg_def456",
  "type": "composio.connected_account.expired",
  "metadata": {
    "log_id": "log_abc123",
    "user_id": "user-123",
    "toolkit": "gmail",
    "connected_account_id": "ca_xyz789",
    "auth_config_id": "ac_abc123",
    "timestamp": "2026-02-28T22:31:00Z"
  },
  "data": {
    "reason": "token_expired",
    "expired_at": "2026-02-28T22:31:00Z"
  },
  "timestamp": "2026-02-28T22:31:00Z"
}
```

---

## **Part 5: Managing Triggers**

> Ref: [Composio Docs - Managing Triggers](https://docs.composio.dev/docs/setting-up-triggers/managing-triggers)

### **5.1 List All Active Triggers**

```python
from composio import Composio

composio = Composio()

# List all triggers for a connected account
active_triggers = composio.triggers.list_active(
    connected_account_ids=["ca_def456"]
)

for trigger in active_triggers.items:
    print(f"✓ {trigger.id}: {trigger.trigger_name}")
    print(f"  Enabled: {trigger.enabled}")
    print(f"  Created: {trigger.created_at}")
    if trigger.disabled_at:
        print(f"  Disabled at: {trigger.disabled_at}")

# Pagination support
if active_triggers.next_cursor:
    next_page = composio.triggers.list_active(
        cursor=active_triggers.next_cursor
    )
```

### **5.2 Filter Triggers by Multiple Criteria**

```python
from composio import Composio

composio = Composio()

# Filter by connected account IDs
by_account = composio.triggers.list_active(
    connected_account_ids=["ca_def456", "ca_xyz789"]
)

# Filter by trigger IDs
by_id = composio.triggers.list_active(
    trigger_ids=["ti_abc123", "ti_def456"]
)

# Filter by trigger type (slug)
github_triggers = composio.triggers.list_active(
    trigger_names=["GITHUB_COMMIT_EVENT", "GITHUB_PULL_REQUEST_EVENT"]
)

# Filter by auth config
gmail_triggers = composio.triggers.list_active(
    auth_config_ids=["ac_gmail_001"]
)

# Include disabled triggers in results
all_including_disabled = composio.triggers.list_active(
    show_disabled=True
)
```

**Filter Options:**

| Filter | Type | Example | Use Case |
|--------|------|---------|----------|
| `connected_account_ids` | Array[str] | `["ca_def456"]` | Get triggers for specific user's accounts |
| `trigger_ids` | Array[str] | `["ti_abc123"]` | Get specific trigger instances |
| `trigger_names` | Array[str] | `["GITHUB_COMMIT_EVENT"]` | Get all GitHub commit triggers |
| `auth_config_ids` | Array[str] | `["ac_xyz789"]` | Get triggers by auth method |
| `show_disabled` | Boolean | `True` | Include/exclude disabled triggers |

### **5.3 Enable/Disable Triggers (Pause Without Deleting)**

```python
from composio import Composio

composio = Composio()

# Disable a trigger temporarily
composio.triggers.disable(trigger_id="ti_abc123")
print("✓ Trigger disabled - events will not be processed")

# Later, re-enable it
composio.triggers.enable(trigger_id="ti_abc123")
print("✓ Trigger enabled - events will resume")

# Common use cases:
# 1. User pauses automations while on vacation
# 2. Temporarily stop processing while debugging
# 3. Maintenance window - disable, fix issues, re-enable
# 4. User settings - toggle automation on/off from UI
```

### **5.4 Delete Triggers (Permanent Removal)**

```python
from composio import Composio

composio = Composio()

# Permanently delete a trigger
composio.triggers.delete(trigger_id="ti_abc123")
print("✓ Trigger deleted permanently - cannot be recovered")

# ⚠️  WARNING: Deletion is permanent!
# Use disable() instead if you might want to use it again

# When to delete:
# 1. User wants to stop monitoring specific repo
# 2. User disconnects the app
# 3. Cleanup when deleting user account
# 4. No longer needed after project completion
```

---

## **Part 6: Real-World Implementation Examples**

### **6.1 GitHub Issue Auto-Responder**

```python
from fastapi import FastAPI, Request
import json

app = FastAPI()

@app.post("/webhooks/composio")
async def webhook_handler(request: Request):
    """Auto-respond to GitHub issues"""

    payload = json.loads(await request.body())

    if payload["metadata"]["trigger_slug"] == "GITHUB_ISSUE_OPENED_EVENT":
        user_id = payload["metadata"]["user_id"]
        data = payload["data"]

        # Extract issue details
        issue_number = data["issue_number"]
        issue_title = data["title"]
        issue_body = data["body"]
        author = data["author"]
        repo = data["repo"]
        owner = data["owner"]

        # Get user's agent
        agent_config = db.agents.find_one({"user_id": user_id})

        # Generate response using AI agent
        prompt = f"""
        A GitHub issue was just created in {owner}/{repo}:

        Title: {issue_title}
        Author: {author}
        Description: {issue_body}

        Generate a helpful response that:
        1. Acknowledges the issue
        2. Asks clarifying questions if needed
        3. Provides initial suggestions
        """

        session = composio_service.create_session(user_id)
        tools = composio_service.get_tools(session)

        from agents import Agent, Runner
        agent = Agent(
            name=agent_config["name"],
            instructions=agent_config["instructions"],
            tools=tools
        )

        result = Runner.run_sync(
            starting_agent=agent,
            input=prompt
        )

        response_text = result.final_output

        # Post comment to GitHub issue using Composio tools
        github_response = await execute_tool(
            session,
            "GITHUB_CREATE_COMMENT",
            {
                "owner": owner,
                "repo": repo,
                "issue_number": issue_number,
                "body": response_text
            }
        )

        # Log this action
        db.trigger_logs.insert({
            "user_id": user_id,
            "trigger_slug": "GITHUB_ISSUE_OPENED_EVENT",
            "action": "auto_response_posted",
            "issue_number": issue_number,
            "response_id": github_response.get("id"),
            "timestamp": datetime.utcnow()
        })

        print(f"✓ Auto-response posted to issue #{issue_number}")

    return {"status": "ok"}
```

### **6.2 Email Categorization & Draft Response**

```python
@app.post("/webhooks/composio")
async def webhook_handler(request: Request):
    """Categorize emails and draft responses"""

    payload = json.loads(await request.body())

    if payload["metadata"]["trigger_slug"] == "GMAIL_NEW_EMAIL_EVENT":
        user_id = payload["metadata"]["user_id"]
        data = payload["data"]

        # Email details
        email_id = data["id"]
        from_email = data["from"]
        subject = data["subject"]
        body = data["body"]
        timestamp = data["timestamp"]

        # Get user's agent
        agent_config = db.agents.find_one({"user_id": user_id})

        # Analyze email
        prompt = f"""
        Analyze this email:

        From: {from_email}
        Subject: {subject}
        Body: {body}

        Please:
        1. Categorize it (urgent, follow-up, info, spam, etc.)
        2. Suggest whether it needs a response
        3. Draft a professional response if needed
        """

        # Use agent to analyze
        session = composio_service.create_session(user_id)
        result = await AgentService.chat(user_id, prompt, agent_config)

        # Parse response
        analysis = {
            "category": extract_category(result),
            "needs_response": extract_bool(result, "needs_response"),
            "draft_response": extract_text(result, "draft_response"),
            "sentiment": extract_sentiment(result),
            "urgency": extract_urgency(result)
        }

        # Store in database with "pending_review" status
        db.email_analyses.insert({
            "user_id": user_id,
            "email_id": email_id,
            "from_email": from_email,
            "subject": subject,
            "analysis": analysis,
            "status": "pending_review",  # User must approve before sending
            "created_at": datetime.utcnow()
        })

        # Notify user via push/email
        await notify_user(user_id, {
            "type": "email_analysis_ready",
            "email_from": from_email,
            "category": analysis["category"],
            "draft_ready": analysis["needs_response"]
        })

        print(f"✓ Email analysis ready for {from_email}")

    return {"status": "ok"}
```

### **6.3 Slack Channel Auto-Summarizer**

```python
from datetime import datetime, timedelta
import asyncio

@app.post("/webhooks/composio")
async def webhook_handler(request: Request):
    """Summarize Slack channel activity"""

    payload = json.loads(await request.body())

    if payload["metadata"]["trigger_slug"] == "SLACK_NEW_MESSAGE_EVENT":
        user_id = payload["metadata"]["user_id"]
        data = payload["data"]

        channel_id = data["channel_id"]
        channel_name = data["channel"]
        message_text = data["text"]
        message_user = data.get("user")
        timestamp = data["timestamp"]

        # Store message
        db.slack_messages.insert({
            "user_id": user_id,
            "channel_id": channel_id,
            "channel_name": channel_name,
            "message": message_text,
            "user": message_user,
            "timestamp": timestamp
        })

        # Check if it's time to summarize (every 2 hours)
        last_summary = db.slack_summaries.find_one(
            {"user_id": user_id, "channel_id": channel_id},
            sort=[("created_at", -1)]
        )

        should_summarize = (
            last_summary is None or
            datetime.utcnow() - last_summary["created_at"] > timedelta(hours=2)
        )

        if should_summarize:
            # Get all messages from past 2 hours
            two_hours_ago = datetime.utcnow() - timedelta(hours=2)
            recent_messages = db.slack_messages.find({
                "user_id": user_id,
                "channel_id": channel_id,
                "timestamp": {"$gte": two_hours_ago}
            })

            # Format messages for agent
            messages_text = "\n".join([
                f"[{msg['user']}]: {msg['message']}"
                for msg in recent_messages
            ])

            # Use agent to summarize
            agent_config = db.agents.find_one({"user_id": user_id})
            prompt = f"""
            Summarize the key discussion points from this Slack channel:

            Channel: {channel_name}
            Messages:
            {messages_text}

            Provide:
            1. Main topics discussed
            2. Action items
            3. Any decisions made
            """

            session = composio_service.create_session(user_id)
            result = await AgentService.chat(user_id, prompt, agent_config)

            summary_text = result["response"]

            # Post summary to Slack
            slack_response = await execute_tool(
                session,
                "SLACK_SEND_MESSAGE",
                {
                    "channel_id": channel_id,
                    "text": f"📊 **2-Hour Summary**\n{summary_text}"
                }
            )

            # Save summary record
            db.slack_summaries.insert({
                "user_id": user_id,
                "channel_id": channel_id,
                "channel_name": channel_name,
                "summary": summary_text,
                "message_count": len(list(recent_messages)),
                "posted_message_id": slack_response.get("ts"),
                "created_at": datetime.utcnow()
            })

            print(f"✓ Summary posted to {channel_name}")

    return {"status": "ok"}
```

---

## **Part 7: Advanced Trigger Patterns**

### **7.1 Multi-Trigger Workflows (Chaining)**

```python
# When GitHub commit happens, trigger email check, which triggers Slack notification

async def handle_github_commit(user_id: str, data: dict):
    """
    Trigger 1: GitHub commit
    ↓
    Trigger 2: Check email
    ↓
    Trigger 3: Post to Slack
    """

    commit_message = data["message"]

    # Trigger email check
    session = composio_service.create_session(user_id)

    email_prompt = f"Find emails mentioning: {commit_message}"
    emails = await execute_tool(
        session,
        "GMAIL_SEARCH_EMAILS",
        {"query": commit_message}
    )

    if emails:
        # Trigger Slack notification
        slack_msg = f"""
        New commit: {commit_message}

        Related emails found:
        {format_emails(emails)}
        """

        await execute_tool(
            session,
            "SLACK_SEND_MESSAGE",
            {
                "channel": "#dev-notifications",
                "text": slack_msg
            }
        )
```

### **7.2 Conditional Triggers (If/Else Logic)**

```python
async def handle_github_issue(user_id: str, data: dict):
    """
    Only respond to issues with "bug" label
    """

    labels = data.get("labels", [])
    is_bug = any(label.lower() == "bug" for label in labels)

    if not is_bug:
        print("⊘ Not a bug report, skipping auto-response")
        return

    # Only process bugs with severity "critical"
    severity = next(
        (label for label in labels if label.startswith("severity:")),
        None
    )

    if severity == "severity:critical":
        # High priority response
        response_template = "CRITICAL_BUG_RESPONSE"
    elif severity == "severity:high":
        response_template = "HIGH_PRIORITY_RESPONSE"
    else:
        response_template = "NORMAL_RESPONSE"

    # Generate and post response...
```

### **7.3 Rate Limiting & Throttling**

```python
from fastapi import FastAPI, HTTPException, Request
from functools import wraps
import time
from collections import defaultdict
from typing import Dict, Tuple
import asyncio
from datetime import datetime, timedelta

app = FastAPI()

class RateLimiter:
    def __init__(self):
        self.requests: Dict[str, list] = defaultdict(list)
        self.max_requests = 100
        self.window_seconds = 60

    def is_rate_limited(self, client_id: str) -> bool:
        """Check if client has exceeded rate limit"""
        now = time.time()
        cutoff = now - self.window_seconds

        # Remove old requests outside the window
        self.requests[client_id] = [
            req_time for req_time in self.requests[client_id]
            if req_time > cutoff
        ]

        # Check if limit exceeded
        if len(self.requests[client_id]) >= self.max_requests:
            return True

        self.requests[client_id].append(now)
        return False

    def get_reset_time(self, client_id: str) -> int:
        """Get when the rate limit resets (in seconds)"""
        if not self.requests[client_id]:
            return 0
        oldest_request = min(self.requests[client_id])
        reset_time = oldest_request + self.window_seconds
        return max(0, int(reset_time - time.time()))

rate_limiter = RateLimiter()

@app.post("/webhook/trigger")
async def handle_trigger(request: Request):
    """Handle incoming webhook triggers with rate limiting"""
    client_id = request.headers.get("X-Composio-Client-ID", "unknown")

    if rate_limiter.is_rate_limited(client_id):
        reset_in = rate_limiter.get_reset_time(client_id)
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit exceeded. Reset in {reset_in}s"
        )

    payload = await request.json()

    # Process trigger asynchronously to not block webhook
    asyncio.create_task(process_trigger_async(payload))

    return {"status": "queued"}

async def process_trigger_async(payload: dict):
    """Process trigger events asynchronously"""
    try:
        print(f"Processing trigger: {payload}")
    except Exception as e:
        print(f"Error processing trigger: {e}")
```

**Queue-based Throttling (Celery):**

```python
from celery import Celery

celery_app = Celery('triggers')
celery_app.conf.update(
    broker_url='redis://localhost:6379/0',
    result_backend='redis://localhost:6379/0',
    task_default_rate_limit='100/m',
)

@celery_app.task(rate_limit='10/s', time_limit=30)
def process_trigger_event(trigger_data: dict):
    """Process trigger with per-second rate limiting"""
    connected_account_id = trigger_data['connected_account_id']
    trigger_name = trigger_data['trigger_name']
    print(f"Processing {trigger_name} for account {connected_account_id}")
    execute_trigger_action(trigger_data)
    return {"status": "completed"}
```

**Adaptive Rate Limiting:**

```python
class AdaptiveRateLimiter:
    def __init__(self):
        self.response_times = []
        self.current_limit = 100
        self.min_limit = 10
        self.max_limit = 1000

    def adjust_limit(self, response_time: float):
        """Adjust rate limit based on performance"""
        self.response_times.append(response_time)

        if len(self.response_times) > 100:
            self.response_times.pop(0)

        avg_response = sum(self.response_times) / len(self.response_times)

        if avg_response > 1.0:
            self.current_limit = max(self.min_limit, int(self.current_limit * 0.9))
        elif avg_response < 0.1:
            self.current_limit = min(self.max_limit, int(self.current_limit * 1.1))

        return self.current_limit
```

### **7.4 Deduplication (Prevent Duplicate Processing)**

```python
import hashlib
import json

@app.post("/webhooks/composio")
async def webhook_handler(request: Request):
    """Prevent processing the same event twice"""

    payload = json.loads(await request.body())

    # === Event ID Deduplication ===
    event_id = payload.get("id")
    dedup_key = f"processed:{event_id}"

    already_processed = redis_client.get(dedup_key)
    if already_processed:
        print(f"⊘ Event {event_id} already processed")
        return {"status": "duplicate"}

    redis_client.setex(dedup_key, 3600, "1")  # Expire after 1 hour

    # === Content Hash Deduplication ===
    payload_str = json.dumps(payload, sort_keys=True)
    payload_hash = hashlib.sha256(payload_str.encode()).hexdigest()
    hash_key = f"hash:{payload_hash}"

    exists = redis_client.getex(hash_key, ex=300)  # 5 minute window
    if exists:
        print(f"⊘ Duplicate event detected")
        return {"status": "duplicate"}

    redis_client.set(hash_key, datetime.utcnow().isoformat())

    # === Webhook Replay Protection ===
    event_timestamp = payload.get("timestamp")
    current_time = datetime.utcnow()
    event_time = datetime.fromisoformat(event_timestamp)
    time_diff = (current_time - event_time).total_seconds()

    if time_diff > 300:
        print(f"⚠️  Event is {time_diff}s old, possible replay")
        return {"status": "replay_detected"}

    await process_trigger_event(payload)
    return {"status": "ok"}
```

### **7.5 Error Handling & Retries**

```python
import asyncio

@app.post("/webhooks/composio")
async def webhook_handler(request: Request):
    """Handle errors and implement retry logic"""

    payload = json.loads(await request.body())
    user_id = payload["metadata"]["user_id"]
    trigger_id = payload["metadata"]["trigger_id"]

    max_retries = 3
    retry_delay = 2

    for attempt in range(max_retries):
        try:
            result = await process_trigger_event(payload)

            db.trigger_logs.insert({
                "trigger_id": trigger_id,
                "user_id": user_id,
                "status": "success",
                "result": result,
                "attempts": attempt + 1,
                "processed_at": datetime.utcnow()
            })

            return {"status": "ok", "result": result}

        except TemporaryError as e:
            if attempt < max_retries - 1:
                print(f"⚠️  Temporary error (attempt {attempt + 1}): {e}")
                await asyncio.sleep(retry_delay)
                retry_delay *= 2
                continue
            else:
                db.failed_events.insert({
                    "trigger_id": trigger_id,
                    "user_id": user_id,
                    "payload": payload,
                    "error": str(e),
                    "failed_at": datetime.utcnow(),
                    "retry_count": max_retries
                })
                await notify_user_error(user_id, {
                    "trigger_id": trigger_id,
                    "error": "Failed after 3 retries",
                    "action_required": True
                })
                return {"status": "failed", "error": str(e)}

        except PermanentError as e:
            print(f"❌ Permanent error: {e}")
            composio.triggers.disable(trigger_id=trigger_id)
            await notify_user_error(user_id, {
                "trigger_id": trigger_id,
                "error": "Trigger disabled due to persistent error",
                "action_required": True
            })
            return {"status": "failed", "error": str(e)}
```

**Background Retry Job:**

```python
@app.on_event("startup")
async def setup_retry_job():
    """Periodically retry failed events"""

    async def retry_failed_events():
        while True:
            try:
                one_hour_ago = datetime.utcnow() - timedelta(hours=1)
                failed = db.failed_events.find({
                    "failed_at": {"$gte": one_hour_ago},
                    "retry_count": {"$lt": 5}
                })

                for event in failed:
                    try:
                        result = await process_trigger_event(event["payload"])
                        db.failed_events.delete_one({"_id": event["_id"]})
                    except Exception as e:
                        db.failed_events.update_one(
                            {"_id": event["_id"]},
                            {"$inc": {"retry_count": 1}}
                        )

                await asyncio.sleep(300)  # Retry every 5 minutes
            except Exception as e:
                print(f"Error in retry job: {e}")
                await asyncio.sleep(60)

    asyncio.create_task(retry_failed_events())
```

### **7.6 Circuit Breaker Pattern**

```python
from typing import Callable, Any

class CircuitBreaker:
    def __init__(self, failure_threshold: int = 5, timeout: int = 60):
        self.failure_threshold = failure_threshold
        self.timeout = timeout
        self.failure_count = 0
        self.last_failure_time = None
        self.state = "closed"  # closed, open, half-open

    async def call(self, func: Callable, *args, **kwargs) -> Any:
        """Execute function with circuit breaker protection"""
        if self.state == "open":
            if self._should_attempt_reset():
                self.state = "half-open"
            else:
                raise Exception("Circuit breaker is open")

        try:
            result = await func(*args, **kwargs)
            self._on_success()
            return result
        except Exception as e:
            self._on_failure()
            raise

    def _on_success(self):
        self.failure_count = 0
        self.state = "closed"

    def _on_failure(self):
        self.failure_count += 1
        self.last_failure_time = datetime.now()
        if self.failure_count >= self.failure_threshold:
            self.state = "open"

    def _should_attempt_reset(self) -> bool:
        if not self.last_failure_time:
            return True
        elapsed = (datetime.now() - self.last_failure_time).seconds
        return elapsed >= self.timeout
```

### **7.7 Idempotent Trigger Processing**

```python
class IdempotentTriggerProcessor:
    def __init__(self, cache_db):
        self.cache = cache_db  # Redis or similar

    async def process_idempotent(
        self,
        trigger_id: str,
        trigger_data: dict,
        processor: Callable
    ) -> dict:
        """
        Process trigger ensuring idempotency.
        If same trigger is received twice, return cached result.
        """
        idempotency_key = f"trigger_{trigger_id}_{trigger_data['event_id']}"

        cached_result = await self.cache.get(idempotency_key)
        if cached_result:
            return json.loads(cached_result)

        result = await processor(trigger_data)

        await self.cache.setex(
            idempotency_key,
            86400,  # 24 hours
            json.dumps(result)
        )

        return result
```

---

## **Part 8: Database Schema for Triggers**

```python
from sqlalchemy import Column, String, Boolean, DateTime, JSON, Integer
from datetime import datetime

class Trigger(Base):
    """Stores trigger configurations"""
    __tablename__ = "triggers"

    trigger_id = Column(String, primary_key=True)  # "ti_abc123" from Composio
    user_id = Column(String, index=True)
    connected_account_id = Column(String, index=True)
    toolkit = Column(String)  # "github", "gmail", "slack"
    trigger_slug = Column(String)  # "GITHUB_COMMIT_EVENT"
    trigger_config = Column(JSON)  # {"owner": "...", "repo": "..."}

    is_enabled = Column(Boolean, default=True)
    webhook_url = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    disabled_at = Column(DateTime, nullable=True)

    # Metrics
    event_count = Column(Integer, default=0)
    last_event_at = Column(DateTime, nullable=True)
    error_count = Column(Integer, default=0)


class TriggerEvent(Base):
    """Logs individual trigger events"""
    __tablename__ = "trigger_events"

    id = Column(String, primary_key=True)
    trigger_id = Column(String, index=True)
    user_id = Column(String, index=True)

    event_type = Column(String)  # "composio.trigger.message"
    trigger_slug = Column(String)  # "GITHUB_COMMIT_EVENT"
    payload = Column(JSON)  # Full webhook payload

    status = Column(String)  # "received", "processing", "completed", "failed"
    result = Column(JSON)  # What was done
    error = Column(String, nullable=True)

    processing_time_ms = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)


class TriggerLog(Base):
    """Summary logs for debugging/monitoring"""
    __tablename__ = "trigger_logs"

    id = Column(String, primary_key=True)
    trigger_id = Column(String, index=True)
    user_id = Column(String, index=True)

    action = Column(String)  # "auto_response", "email_drafted", "summary_posted"
    status = Column(String)  # "success", "failed"
    details = Column(JSON)

    created_at = Column(DateTime, default=datetime.utcnow)


class FailedEvent(Base):
    """Tracks events that failed and need retry"""
    __tablename__ = "failed_events"

    id = Column(String, primary_key=True)
    trigger_id = Column(String, index=True)
    user_id = Column(String, index=True)

    payload = Column(JSON)
    error = Column(String)
    error_type = Column(String)  # "temporary", "permanent"

    retry_count = Column(Integer, default=1)
    max_retries = Column(Integer, default=5)

    failed_at = Column(DateTime, default=datetime.utcnow, index=True)
    last_retry_at = Column(DateTime, nullable=True)
```

---

## **Part 9: Monitoring & Metrics**

```python
from prometheus_client import Counter, Histogram, Gauge
import time

trigger_events_total = Counter(
    'trigger_events_total',
    'Total trigger events received',
    ['trigger_slug', 'status']
)

trigger_processing_time = Histogram(
    'trigger_processing_seconds',
    'Trigger processing time in seconds',
    ['trigger_slug']
)

trigger_errors_total = Counter(
    'trigger_errors_total',
    'Total trigger errors',
    ['trigger_slug', 'error_type']
)

active_triggers = Gauge(
    'active_triggers',
    'Number of active triggers',
    ['user_id']
)

@app.post("/webhooks/composio")
async def monitored_webhook_handler(request: Request):
    """Webhook handler with full monitoring"""
    start_time = time.time()
    payload = json.loads(await request.body())

    trigger_slug = payload["metadata"]["trigger_slug"]

    try:
        result = await process_trigger_event(payload)

        trigger_events_total.labels(
            trigger_slug=trigger_slug,
            status='success'
        ).inc()

        processing_time = time.time() - start_time
        trigger_processing_time.labels(
            trigger_slug=trigger_slug
        ).observe(processing_time)

        return result

    except Exception as e:
        trigger_events_total.labels(
            trigger_slug=trigger_slug,
            status='error'
        ).inc()

        trigger_errors_total.labels(
            trigger_slug=trigger_slug,
            error_type=type(e).__name__
        ).inc()

        raise
```

---

## **Quick Reference: Responsibility Matrix**

| Task | Developer | End User | Composio |
|------|-----------|----------|----------|
| Define trigger types | ✗ | ✗ | ✓ Provides pre-built |
| Set up webhook endpoint | ✓ One-time | ✗ | ✗ |
| Create trigger instances | Expose via UI/API | ✓ Per need | Stores them |
| Configure accounts | ✗ | ✓ Per trigger | ✗ |
| Process events | ✓ Ongoing | ✗ | Forwards to you |
| Signature verification | ✓ | ✗ | Provides secret |
| Rate limiting | ✓ | ✗ | ✗ |
| Error handling & retries | ✓ | ✗ | ✗ |
