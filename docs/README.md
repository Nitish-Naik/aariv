# CalmPilot Documentation

> **New here?** Start with [System Overview](architecture/system-overview.md) to understand how everything fits together.

## Architecture

Developer documentation for understanding the CalmPilot system.

| Document | Description |
|----------|-------------|
| [System Overview](architecture/system-overview.md) | High-level architecture, service map, local dev setup |
| [Backend](architecture/backend.md) | FastAPI app structure, routers, middleware, agent setup |
| [Frontend](architecture/frontend.md) | Next.js pages, components, contexts, API client |
| [Database](architecture/database.md) | Supabase tables, relationships, RLS policies |
| [Integrations](architecture/integrations.md) | Composio SDK, OAuth flow, tool library |
| [Triggers](architecture/triggers.md) | Event-driven automation pipeline |

### Low-Level Design

Function-level documentation for the 4 most complex flows.

| Document | Description |
|----------|-------------|
| [Trigger Pipeline](architecture/lld/trigger-pipeline.md) | Webhook → dedup → filter → debounce → AI summary → notify |
| [Agent Chat Execution](architecture/lld/agent-chat-execution.md) | Message → auth → tools → agent → SSE stream → billing |
| [OAuth Connection](architecture/lld/oauth-connection.md) | App select → Composio OAuth → callback → auto-triggers |
| [Billing & Credits](architecture/lld/billing-credits.md) | Credit check → LLM call → token count → debit → topup |

## API Reference

Complete endpoint documentation for the FastAPI backend.

| Document | Description |
|----------|-------------|
| [API Overview](api/README.md) | Base URL, authentication, rate limits, error format |
| [Chat](api/chat.md) | AI assistant chat with SSE streaming |
| [Integrations](api/integrations.md) | App connection and OAuth endpoints |
| [Triggers](api/triggers.md) | Trigger CRUD and event management |
| [Dashboard](api/dashboard.md) | Morning briefing and activity feed |
| [Billing](api/billing.md) | Credits, subscriptions, and transactions |
| [Webhooks](api/webhooks.md) | Composio and payment webhook receivers |

## User Guide

End-user documentation for CalmPilot features.

| Document | Description |
|----------|-------------|
| [Getting Started](user-guide/getting-started.md) | Sign up, connect apps, first briefing |
| [Morning Briefing](user-guide/morning-briefing.md) | How briefings work |
| [AI Assistant](user-guide/assistant.md) | Chat with the AI, example prompts |
| [Integrations](user-guide/integrations.md) | Connecting and managing apps |
| [Triggers](user-guide/triggers.md) | Setting up automations |
| [Billing](user-guide/billing.md) | Credits, plans, and topping up |
| [FAQ](user-guide/faq.md) | Common questions answered |

## Other Resources

| Document | Description |
|----------|-------------|
| [PROJECT_CONTEXT.md](../PROJECT_CONTEXT.md) | Practical contributor onboarding guide |
| [PRODUCTION_README.md](../python-agent/PRODUCTION_README.md) | Production deployment, workers, monitoring |
| [PRICING_STRATEGY.md](../PRICING_STRATEGY.md) | Pricing model analysis and GTM strategy |
| [REMAINING_ITEMS.md](../REMAINING_ITEMS.md) | Phase 2-4 implementation gaps |
| [Product Specs](../product/) | Feature specifications per page |
