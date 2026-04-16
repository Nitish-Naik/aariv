export interface Integration {
  slug: string;
  name: string;
  logo: string;
  tagline: string;
  description: string;
  category: string;
  useCases: { title: string; description: string }[];
  features: string[];
  keywords: string[];
  faq: { question: string; answer: string }[];
}

export const INTEGRATIONS: Integration[] = [
  {
    slug: "gmail",
    name: "Gmail",
    logo: "/images/google-gmail-svgrepo-com.svg",
    tagline: "AI Assistant for Gmail — Automate Your Inbox",
    description:
      "CalmPilot connects to Gmail via OAuth and handles email triage, drafting, labeling, and follow-ups automatically — so your inbox stays clean without you lifting a finger.",
    category: "Email",
    useCases: [
      {
        title: "Inbox Triage",
        description:
          "CalmPilot reads your inbox, categorizes emails by priority, and surfaces only what matters in your daily briefing.",
      },
      {
        title: "Auto-Draft Replies",
        description:
          "Tell CalmPilot to draft replies to common emails — investor updates, client follow-ups, support tickets — in your voice.",
      },
      {
        title: "Smart Labeling",
        description:
          "Automatically label, archive, and organize emails based on rules you describe in plain English.",
      },
      {
        title: "Follow-up Reminders",
        description:
          "CalmPilot tracks emails that need a reply and nudges you when threads go cold.",
      },
    ],
    features: [
      "Read and summarize emails",
      "Draft and send replies",
      "Label and archive automatically",
      "Search your inbox with natural language",
      "Set follow-up reminders",
      "Forward emails to other apps",
    ],
    keywords: [
      "AI Gmail assistant",
      "Gmail automation",
      "automate Gmail",
      "AI email assistant",
      "Gmail AI agent",
      "email triage AI",
      "Gmail inbox automation",
    ],
    faq: [
      {
        question: "Does CalmPilot read all my emails?",
        answer:
          "CalmPilot only accesses emails relevant to the tasks you configure. It uses OAuth — no passwords are stored — and you can revoke access at any time.",
      },
      {
        question: "Can CalmPilot send emails on my behalf?",
        answer:
          "Yes. You can ask CalmPilot to draft and send emails. Sensitive sends can be routed through the review queue so you approve before anything goes out.",
      },
      {
        question: "What Gmail actions does CalmPilot support?",
        answer:
          "Read, search, draft, send, label, archive, delete, forward, and reply — all controllable via natural language chat.",
      },
    ],
  },
  {
    slug: "slack",
    name: "Slack",
    logo: "/images/slack-svgrepo-com.svg",
    tagline: "AI Assistant for Slack — Never Miss What Matters",
    description:
      "CalmPilot monitors your Slack workspace, surfaces important messages in your daily briefing, and can send messages, create reminders, and summarize channels automatically.",
    category: "Communication",
    useCases: [
      {
        title: "Daily Channel Summaries",
        description:
          "Get a digest of key Slack activity in your morning briefing — decisions made, tasks assigned, blockers raised.",
      },
      {
        title: "Send Messages Automatically",
        description:
          "Tell CalmPilot to notify your team on a schedule, ping someone when a trigger fires, or post standup updates.",
      },
      {
        title: "Trigger-Based Alerts",
        description:
          "When something happens in another app (e.g., a GitHub PR merged), CalmPilot posts a Slack message automatically.",
      },
      {
        title: "Search Slack History",
        description:
          "Ask CalmPilot to find a message, decision, or file from any channel using natural language.",
      },
    ],
    features: [
      "Send messages to any channel or DM",
      "Summarize channel activity",
      "Search message history",
      "Set reminders",
      "React to messages with triggers",
      "Post automated updates",
    ],
    keywords: [
      "AI Slack assistant",
      "Slack automation",
      "automate Slack",
      "Slack AI agent",
      "Slack message automation",
      "AI Slack bot",
      "Slack workflow automation",
    ],
    faq: [
      {
        question: "Does CalmPilot read private Slack messages?",
        answer:
          "CalmPilot only accesses channels and DMs you explicitly grant permission to via OAuth scopes. You control exactly what it can see.",
      },
      {
        question: "Can CalmPilot post to Slack automatically?",
        answer:
          "Yes — you can set up triggers so CalmPilot posts to Slack when events happen in other apps, like a new GitHub issue or a Stripe payment.",
      },
      {
        question: "Which Slack plans does CalmPilot support?",
        answer:
          "CalmPilot works with all Slack plans including Free, Pro, Business+, and Enterprise Grid via standard OAuth.",
      },
    ],
  },
  /* ── Commented out for launch: only Gmail, Google Calendar, Slack active ──
  {
    slug: "notion",
    name: "Notion",
    logo: "/images/notion-svgrepo-com.svg",
    tagline: "AI Assistant for Notion — Keep Your Workspace Updated Automatically",
    description:
      "CalmPilot connects to Notion via OAuth to create pages, update databases, log meeting notes, and sync information from other apps — all without manual entry.",
    category: "Productivity",
    useCases: [
      {
        title: "Auto-Log Meeting Notes",
        description:
          "After a meeting, tell CalmPilot to create a Notion page with the summary, action items, and attendees.",
      },
      {
        title: "Database Updates",
        description:
          "Keep your Notion databases current — CalmPilot adds rows, updates status fields, and syncs data from other tools.",
      },
      {
        title: "Content Drafting",
        description:
          "Ask CalmPilot to draft blog posts, SOPs, or project plans directly into Notion pages in seconds.",
      },
      {
        title: "Cross-App Sync",
        description:
          "When a GitHub issue closes or a Stripe payment lands, CalmPilot logs it to your Notion database automatically.",
      },
    ],
    features: [
      "Create and update pages",
      "Add and query database records",
      "Search across your workspace",
      "Draft content into pages",
      "Sync data from other apps",
      "Append blocks to existing pages",
    ],
    keywords: [
      "AI Notion assistant",
      "Notion automation",
      "automate Notion",
      "Notion AI agent",
      "Notion database automation",
      "AI productivity Notion",
      "Notion workflow automation",
    ],
    faq: [
      {
        question: "Can CalmPilot create Notion pages automatically?",
        answer:
          "Yes — you can trigger page creation from events in other apps or ask CalmPilot directly via chat.",
      },
      {
        question: "Does CalmPilot work with Notion databases?",
        answer:
          "Fully. CalmPilot can query, filter, add, and update records in any Notion database you grant access to.",
      },
      {
        question: "Is my Notion data secure with CalmPilot?",
        answer:
          "CalmPilot uses OAuth — no passwords stored — and only accesses the pages and databases you explicitly share with it.",
      },
    ],
  },
  {
    slug: "github",
    name: "GitHub",
    logo: "/images/github-142-svgrepo-com.svg",
    tagline: "AI Assistant for GitHub — Automate Issues, PRs, and Code Reviews",
    description:
      "CalmPilot connects to GitHub to summarize pull requests, triage issues, post comments, and surface repository activity in your daily briefing.",
    category: "Development",
    useCases: [
      {
        title: "PR Summaries",
        description:
          "CalmPilot summarizes open pull requests in your morning briefing — what changed, who reviewed, what's blocked.",
      },
      {
        title: "Issue Triage",
        description:
          "Automatically label, assign, and prioritize new GitHub issues based on rules you define.",
      },
      {
        title: "Automated Comments",
        description:
          "Post structured comments on PRs or issues triggered by events — like a checklist when a PR opens.",
      },
      {
        title: "Release Tracking",
        description:
          "Get notified and briefed when releases publish, CI fails, or repos reach activity thresholds.",
      },
    ],
    features: [
      "Search and read issues and PRs",
      "Create issues and comments",
      "Label and assign issues",
      "Summarize repository activity",
      "Trigger actions on PR events",
      "Track releases and deployments",
    ],
    keywords: [
      "AI GitHub assistant",
      "GitHub automation",
      "automate GitHub",
      "GitHub AI agent",
      "GitHub issue automation",
      "PR automation AI",
      "GitHub workflow automation",
    ],
    faq: [
      {
        question: "Can CalmPilot create GitHub issues automatically?",
        answer:
          "Yes — you can ask CalmPilot via chat or set up a trigger so issues are created when events occur in other tools.",
      },
      {
        question: "Does CalmPilot support private repositories?",
        answer:
          "Yes — CalmPilot uses GitHub OAuth with the scopes you grant. Private repos are accessible if you include them in the authorization.",
      },
      {
        question: "Can CalmPilot review pull requests?",
        answer:
          "CalmPilot can summarize PR diffs and post review comments, but final approval decisions stay with your team.",
      },
    ],
  },
  ── End commented section 1 (Notion, GitHub) */
  {
    slug: "google-calendar",
    name: "Google Calendar",
    logo: "/images/google-calendar-svgrepo-com.svg",
    tagline: "AI Assistant for Google Calendar — Own Your Schedule",
    description:
      "CalmPilot connects to Google Calendar to schedule meetings, summarize your day, set reminders, and protect your focus time — automatically.",
    category: "Scheduling",
    useCases: [
      {
        title: "Daily Schedule Briefing",
        description:
          "Each morning, CalmPilot tells you exactly what's on your calendar, who you're meeting, and what to prepare.",
      },
      {
        title: "Smart Scheduling",
        description:
          "Tell CalmPilot to schedule a meeting with a contact and it finds a mutual open slot and creates the event.",
      },
      {
        title: "Focus Time Blocks",
        description:
          "Ask CalmPilot to block focus time on your calendar around key deadlines automatically.",
      },
      {
        title: "Meeting Summaries",
        description:
          "After events, CalmPilot logs summaries and action items from your notes to Notion or elsewhere.",
      },
    ],
    features: [
      "Read today's and upcoming events",
      "Create and update events",
      "Find free time slots",
      "Send calendar invites",
      "Set reminders",
      "Sync with other apps on event triggers",
    ],
    keywords: [
      "AI Google Calendar assistant",
      "Google Calendar automation",
      "automate Google Calendar",
      "AI scheduling assistant",
      "calendar AI agent",
      "meeting automation AI",
      "smart calendar assistant",
    ],
    faq: [
      {
        question: "Can CalmPilot create calendar events for me?",
        answer:
          "Yes — just tell CalmPilot what the event is, when, and with whom. It creates the event and sends invites.",
      },
      {
        question: "Does CalmPilot work with Google Workspace calendars?",
        answer:
          "Yes — CalmPilot works with personal Gmail and Google Workspace accounts via standard OAuth.",
      },
      {
        question: "Can CalmPilot reschedule meetings automatically?",
        answer:
          "CalmPilot can find alternative slots and update events, but will route sensitive changes through the review queue for your approval first.",
      },
    ],
  },
  /* ── Commented out for launch: uncomment as you add integrations ──
  {
    slug: "google-drive",
    name: "Google Drive",
    logo: "/images/google-drive-svgrepo-com.svg",
    tagline: "AI Assistant for Google Drive — Find and Organize Files Instantly",
    description:
      "CalmPilot connects to Google Drive to search, organize, share, and summarize documents — giving you instant access to anything in your Drive through natural language.",
    category: "Storage",
    useCases: [
      {
        title: "Instant File Search",
        description:
          "Ask CalmPilot to find any document, spreadsheet, or presentation using plain language — no folder digging required.",
      },
      {
        title: "Document Summaries",
        description:
          "CalmPilot reads and summarizes Google Docs so you can understand long documents in seconds.",
      },
      {
        title: "File Organization",
        description:
          "Automatically move, rename, and organize files based on triggers or commands.",
      },
      {
        title: "Cross-App Sync",
        description:
          "When a trigger fires in another app, CalmPilot can create a folder, copy a template, or share a file automatically.",
      },
    ],
    features: [
      "Search files by natural language",
      "Read and summarize documents",
      "Create folders and files",
      "Move and organize files",
      "Share files with specific people",
      "Trigger file actions from other apps",
    ],
    keywords: [
      "AI Google Drive assistant",
      "Google Drive automation",
      "automate Google Drive",
      "Google Drive AI agent",
      "Drive file search AI",
      "document automation AI",
      "Google Drive workflow automation",
    ],
    faq: [
      {
        question: "Can CalmPilot access all my Google Drive files?",
        answer:
          "Only the files and folders you grant access to via OAuth. You control the scope during connection.",
      },
      {
        question: "Can CalmPilot read Google Docs content?",
        answer:
          "Yes — CalmPilot can read, summarize, and extract information from Google Docs, Sheets, and Slides.",
      },
      {
        question: "Can CalmPilot create Google Docs automatically?",
        answer:
          "Yes — you can ask CalmPilot to draft a document or trigger document creation based on events in other apps.",
      },
    ],
  },
  {
    slug: "linear",
    name: "Linear",
    logo: "/images/linear-svgrepo-com.svg",
    tagline: "AI Assistant for Linear — Run Your Engineering Sprints on Autopilot",
    description:
      "CalmPilot connects to Linear to create issues, update priorities, track sprint progress, and surface blockers in your daily briefing — keeping your team moving without status meetings.",
    category: "Project Management",
    useCases: [
      {
        title: "Sprint Briefings",
        description:
          "Start each day knowing exactly what's in progress, what's blocked, and what shipped — pulled from Linear automatically.",
      },
      {
        title: "Issue Creation",
        description:
          "Ask CalmPilot to create a Linear issue from a Slack message, GitHub comment, or plain text — in seconds.",
      },
      {
        title: "Priority Updates",
        description:
          "CalmPilot updates issue priorities and status based on your instructions or automated triggers.",
      },
      {
        title: "Cross-App Issue Sync",
        description:
          "When a bug report comes via email or Slack, CalmPilot creates a Linear issue with context automatically.",
      },
    ],
    features: [
      "Create and update issues",
      "Search and filter issues",
      "Track sprint progress",
      "Assign and label issues",
      "Comment on issues",
      "Trigger issue creation from other apps",
    ],
    keywords: [
      "AI Linear assistant",
      "Linear automation",
      "automate Linear",
      "Linear AI agent",
      "Linear issue automation",
      "engineering sprint automation",
      "Linear workflow AI",
    ],
    faq: [
      {
        question: "Can CalmPilot create Linear issues from Slack?",
        answer:
          "Yes — set up a trigger so when a specific Slack message pattern is detected, CalmPilot creates a Linear issue automatically.",
      },
      {
        question: "Does CalmPilot work with Linear teams and projects?",
        answer:
          "Yes — CalmPilot respects your Linear workspace structure including teams, projects, cycles, and views.",
      },
      {
        question: "Can CalmPilot close or update Linear issues automatically?",
        answer:
          "Yes — issue state transitions can be triggered by events in other apps or via direct chat commands.",
      },
    ],
  },
  {
    slug: "airtable",
    name: "Airtable",
    logo: "/images/airtable-svgrepo-com.svg",
    tagline: "AI Assistant for Airtable — Keep Your Databases Always Up to Date",
    description:
      "CalmPilot connects to Airtable to read, create, update, and sync records across your bases — so your data stays current without manual entry.",
    category: "Database",
    useCases: [
      {
        title: "Automatic Record Creation",
        description:
          "When events happen in other apps, CalmPilot adds rows to Airtable — new leads, support tickets, payments, and more.",
      },
      {
        title: "Data Querying",
        description:
          "Ask CalmPilot to find records in your Airtable base using natural language instead of building complex filters.",
      },
      {
        title: "Status Updates",
        description:
          "CalmPilot updates record fields — status, assignee, notes — based on triggers or chat commands.",
      },
      {
        title: "Cross-Base Sync",
        description:
          "Keep multiple Airtable bases synchronized or sync Airtable with external apps automatically.",
      },
    ],
    features: [
      "Create and update records",
      "Search and filter records",
      "Read field values",
      "Delete records",
      "Trigger actions on record changes",
      "Sync data from other apps",
    ],
    keywords: [
      "AI Airtable assistant",
      "Airtable automation",
      "automate Airtable",
      "Airtable AI agent",
      "Airtable database automation",
      "Airtable workflow AI",
      "no-code Airtable automation",
    ],
    faq: [
      {
        question: "Can CalmPilot add rows to Airtable automatically?",
        answer:
          "Yes — set up triggers from any other app to create Airtable records when events happen.",
      },
      {
        question: "Does CalmPilot work with all Airtable field types?",
        answer:
          "CalmPilot supports all standard Airtable field types including text, number, date, select, linked records, and attachments.",
      },
      {
        question: "Can CalmPilot query Airtable with natural language?",
        answer:
          "Yes — describe what you're looking for in plain English and CalmPilot translates it into Airtable filters automatically.",
      },
    ],
  },
  {
    slug: "asana",
    name: "Asana",
    logo: "/images/asana-svgrepo-com.svg",
    tagline: "AI Assistant for Asana — Automate Task and Project Management",
    description:
      "CalmPilot connects to Asana to create tasks, update projects, track deadlines, and surface overdue items in your daily briefing — automatically.",
    category: "Project Management",
    useCases: [
      {
        title: "Task Creation from Chat",
        description:
          "Tell CalmPilot what needs to be done and it creates an Asana task with the right assignee, due date, and project.",
      },
      {
        title: "Deadline Alerts",
        description:
          "CalmPilot surfaces overdue and upcoming Asana tasks in your morning briefing so nothing slips.",
      },
      {
        title: "Cross-App Task Sync",
        description:
          "When an email or Slack message needs follow-up, CalmPilot creates an Asana task with full context.",
      },
      {
        title: "Project Status Summaries",
        description:
          "Get a plain-English summary of any Asana project's progress — tasks completed, blocked, and upcoming.",
      },
    ],
    features: [
      "Create and assign tasks",
      "Update task status and due dates",
      "Search tasks and projects",
      "Add comments to tasks",
      "Track project milestones",
      "Trigger task creation from other apps",
    ],
    keywords: [
      "AI Asana assistant",
      "Asana automation",
      "automate Asana",
      "Asana AI agent",
      "Asana task automation",
      "project management AI",
      "Asana workflow automation",
    ],
    faq: [
      {
        question: "Can CalmPilot create Asana tasks from emails?",
        answer:
          "Yes — set up a trigger to convert emails matching certain criteria into Asana tasks with full context.",
      },
      {
        question: "Does CalmPilot work with Asana teams and portfolios?",
        answer:
          "CalmPilot supports Asana workspaces, teams, projects, sections, and tasks via the official Asana API.",
      },
      {
        question: "Can CalmPilot mark Asana tasks complete automatically?",
        answer:
          "Yes — tasks can be completed or updated based on triggers from other apps or direct chat commands.",
      },
    ],
  },
  {
    slug: "hubspot",
    name: "HubSpot",
    logo: "/images/hubspot-svgrepo-com.svg",
    tagline: "AI Assistant for HubSpot — Automate Your CRM and Sales Pipeline",
    description:
      "CalmPilot connects to HubSpot to update contacts, log activities, track deals, and surface pipeline insights in your daily briefing — keeping your CRM accurate without manual entry.",
    category: "CRM",
    useCases: [
      {
        title: "Contact Updates",
        description:
          "CalmPilot updates HubSpot contact records automatically when emails are received or meetings completed.",
      },
      {
        title: "Deal Tracking",
        description:
          "Get a daily briefing on deal stage changes, new leads, and at-risk opportunities in your HubSpot pipeline.",
      },
      {
        title: "Activity Logging",
        description:
          "Automatically log calls, emails, and meetings to HubSpot contacts without manual data entry.",
      },
      {
        title: "Lead Enrichment",
        description:
          "When new leads come in, CalmPilot enriches their HubSpot records with context from emails and other sources.",
      },
    ],
    features: [
      "Create and update contacts",
      "Log calls, emails, and activities",
      "Update deal stages",
      "Search CRM records",
      "Create tasks and follow-ups",
      "Trigger CRM actions from other apps",
    ],
    keywords: [
      "AI HubSpot assistant",
      "HubSpot automation",
      "automate HubSpot",
      "HubSpot AI agent",
      "CRM automation AI",
      "HubSpot CRM automation",
      "sales pipeline AI",
    ],
    faq: [
      {
        question: "Can CalmPilot log emails to HubSpot automatically?",
        answer:
          "Yes — CalmPilot can log Gmail conversations to the relevant HubSpot contact record automatically.",
      },
      {
        question: "Does CalmPilot work with HubSpot deals and pipelines?",
        answer:
          "Yes — CalmPilot can read, create, and update deals including stage, amount, and associated contacts.",
      },
      {
        question: "Which HubSpot plan is required?",
        answer:
          "CalmPilot works with HubSpot Free, Starter, Professional, and Enterprise via OAuth API access.",
      },
    ],
  },
  {
    slug: "trello",
    name: "Trello",
    logo: "/images/trello-svgrepo-com.svg",
    tagline: "AI Assistant for Trello — Manage Boards and Cards Automatically",
    description:
      "CalmPilot connects to Trello to create cards, move items between lists, add comments, and surface overdue cards in your daily briefing — without opening the app.",
    category: "Project Management",
    useCases: [
      {
        title: "Card Creation from Chat",
        description:
          "Tell CalmPilot what needs to be tracked and it creates a Trello card in the right board and list.",
      },
      {
        title: "Automated Card Moves",
        description:
          "When tasks complete in other apps, CalmPilot moves Trello cards to the appropriate list automatically.",
      },
      {
        title: "Board Summaries",
        description:
          "Get a plain-English summary of any Trello board — what's in progress, what's overdue, what's done.",
      },
      {
        title: "Cross-App Sync",
        description:
          "New emails, GitHub issues, or form submissions automatically become Trello cards with full context.",
      },
    ],
    features: [
      "Create and update cards",
      "Move cards between lists",
      "Add labels and due dates",
      "Comment on cards",
      "Archive and delete cards",
      "Trigger card creation from other apps",
    ],
    keywords: [
      "AI Trello assistant",
      "Trello automation",
      "automate Trello",
      "Trello AI agent",
      "Trello card automation",
      "kanban board automation AI",
      "Trello workflow automation",
    ],
    faq: [
      {
        question: "Can CalmPilot create Trello cards automatically?",
        answer:
          "Yes — from chat, from triggers in other apps, or on a schedule.",
      },
      {
        question: "Does CalmPilot work with all Trello boards?",
        answer:
          "CalmPilot accesses the boards you grant permission to during OAuth — both personal and workspace boards.",
      },
      {
        question: "Can CalmPilot move Trello cards based on events?",
        answer:
          "Yes — set up a trigger so cards move automatically when related tasks complete in GitHub, Asana, or other apps.",
      },
    ],
  },
  {
    slug: "discord",
    name: "Discord",
    logo: "/images/discord-icon-svgrepo-com.svg",
    tagline: "AI Assistant for Discord — Automate Your Server and Stay Informed",
    description:
      "CalmPilot connects to Discord to send messages, monitor channels, post alerts, and summarize server activity — keeping your community and team in sync automatically.",
    category: "Communication",
    useCases: [
      {
        title: "Automated Announcements",
        description:
          "CalmPilot posts announcements to Discord channels when events happen in other apps — new releases, payments, milestones.",
      },
      {
        title: "Channel Summaries",
        description:
          "Get a digest of important Discord activity in your morning briefing without having to scroll through every channel.",
      },
      {
        title: "Alert Routing",
        description:
          "Route alerts from GitHub, Stripe, or any other app directly to the right Discord channel automatically.",
      },
      {
        title: "Community Updates",
        description:
          "CalmPilot keeps your Discord community updated with automated posts about product updates, events, and news.",
      },
    ],
    features: [
      "Send messages to channels",
      "Send direct messages",
      "Read channel history",
      "Post embeds and rich messages",
      "Trigger messages from other apps",
      "Search message history",
    ],
    keywords: [
      "AI Discord assistant",
      "Discord automation",
      "automate Discord",
      "Discord AI agent",
      "Discord bot automation",
      "Discord webhook alternative",
      "Discord workflow automation",
    ],
    faq: [
      {
        question: "Does CalmPilot need a Discord bot?",
        answer:
          "CalmPilot uses OAuth to connect to Discord — no bot setup required on your end.",
      },
      {
        question: "Can CalmPilot post to private Discord channels?",
        answer:
          "CalmPilot can post to any channel it has access to based on the OAuth permissions you grant.",
      },
      {
        question: "Can CalmPilot monitor Discord for specific keywords?",
        answer:
          "Yes — set up triggers that fire when specific keywords appear in Discord channels and route them to your review queue.",
      },
    ],
  },
  {
    slug: "stripe",
    name: "Stripe",
    logo: "/images/stripe-v2-svgrepo-com.svg",
    tagline: "AI Assistant for Stripe — Monitor Payments and Revenue Automatically",
    description:
      "CalmPilot connects to Stripe to surface payment activity, revenue trends, failed charges, and subscription changes in your daily briefing — keeping you on top of your business without dashboard visits.",
    category: "Payments",
    useCases: [
      {
        title: "Daily Revenue Briefing",
        description:
          "Every morning, CalmPilot tells you yesterday's revenue, new subscriptions, and any failed charges from Stripe.",
      },
      {
        title: "Failed Payment Alerts",
        description:
          "When a charge fails, CalmPilot immediately notifies you and can trigger a follow-up email or Slack message.",
      },
      {
        title: "New Customer Actions",
        description:
          "When a new Stripe customer subscribes, CalmPilot creates a HubSpot contact, sends a welcome email, or logs it to Notion.",
      },
      {
        title: "Churn Detection",
        description:
          "CalmPilot surfaces subscription cancellations and flags at-risk accounts in your review queue.",
      },
    ],
    features: [
      "Read payment and charge data",
      "Monitor subscription status",
      "Track revenue metrics",
      "Get alerts on failed payments",
      "Trigger actions on payment events",
      "Search customers and invoices",
    ],
    keywords: [
      "AI Stripe assistant",
      "Stripe automation",
      "automate Stripe",
      "Stripe AI agent",
      "payment monitoring AI",
      "Stripe revenue automation",
      "Stripe webhook automation",
    ],
    faq: [
      {
        question: "Can CalmPilot process Stripe refunds automatically?",
        answer:
          "CalmPilot can initiate refunds based on triggers, but sensitive financial actions are routed through the review queue for your approval first.",
      },
      {
        question: "Does CalmPilot work with Stripe test mode?",
        answer:
          "Yes — you can connect a Stripe test account for development and staging before going live.",
      },
      {
        question: "What Stripe events can CalmPilot react to?",
        answer:
          "Payment succeeded, payment failed, subscription created, subscription cancelled, invoice paid, customer created, and more.",
      },
    ],
  },
  {
    slug: "todoist",
    name: "Todoist",
    logo: "/images/todoist-svgrepo-com.svg",
    tagline: "AI Assistant for Todoist — Never Forget a Task Again",
    description:
      "CalmPilot connects to Todoist to create tasks, manage projects, surface due items in your daily briefing, and sync tasks from other apps — keeping your to-do list complete without manual effort.",
    category: "Task Management",
    useCases: [
      {
        title: "Daily Task Briefing",
        description:
          "CalmPilot starts your day with a summary of today's Todoist tasks, overdue items, and upcoming deadlines.",
      },
      {
        title: "Task Creation from Anywhere",
        description:
          "Convert emails, Slack messages, or GitHub issues into Todoist tasks automatically — nothing falls through the cracks.",
      },
      {
        title: "Project Management",
        description:
          "Create sections, assign priorities, and organize your Todoist projects via natural language chat.",
      },
      {
        title: "Recurring Task Automation",
        description:
          "Set up recurring tasks and have CalmPilot manage completion and rescheduling automatically.",
      },
    ],
    features: [
      "Create and complete tasks",
      "Set due dates and priorities",
      "Organize into projects and sections",
      "Add labels and comments",
      "Search tasks",
      "Trigger task creation from other apps",
    ],
    keywords: [
      "AI Todoist assistant",
      "Todoist automation",
      "automate Todoist",
      "Todoist AI agent",
      "task management AI",
      "Todoist workflow automation",
      "AI to-do list assistant",
    ],
    faq: [
      {
        question: "Can CalmPilot add tasks to Todoist from Gmail?",
        answer:
          "Yes — set up a trigger to convert specific emails into Todoist tasks with subject, sender, and a link to the original email.",
      },
      {
        question: "Does CalmPilot work with Todoist Free?",
        answer:
          "CalmPilot works with both Todoist Free and Pro via OAuth. Some advanced features require Todoist Pro.",
      },
      {
        question: "Can CalmPilot mark Todoist tasks as complete automatically?",
        answer:
          "Yes — tasks can be completed based on events in other apps or direct chat commands.",
      },
    ],
  },
  {
    slug: "jira",
    name: "Jira",
    logo: "/images/atlassian-svgrepo-com.svg",
    tagline: "AI Assistant for Jira — Automate Ticket Management and Sprint Tracking",
    description:
      "CalmPilot connects to Jira to create tickets, update status, track sprint progress, and surface blockers in your daily briefing — without logging into Jira.",
    category: "Development",
    useCases: [
      {
        title: "Sprint Progress Briefing",
        description:
          "Every morning, CalmPilot tells you sprint velocity, blockers, and what shipped — pulled directly from Jira.",
      },
      {
        title: "Ticket Creation",
        description:
          "Create Jira tickets from emails, Slack messages, or chat commands with proper labels, components, and assignees.",
      },
      {
        title: "Status Transitions",
        description:
          "Move Jira tickets through workflow stages based on triggers from GitHub, CI, or chat commands.",
      },
      {
        title: "Bug Report Triage",
        description:
          "When errors surface in monitoring tools, CalmPilot creates Jira bugs with full context automatically.",
      },
    ],
    features: [
      "Create and update tickets",
      "Transition ticket status",
      "Search and filter issues",
      "Add comments",
      "Track sprint progress",
      "Trigger actions on ticket events",
    ],
    keywords: [
      "AI Jira assistant",
      "Jira automation",
      "automate Jira",
      "Jira AI agent",
      "Atlassian automation",
      "Jira ticket automation",
      "agile sprint automation AI",
    ],
    faq: [
      {
        question: "Can CalmPilot create Jira tickets from Slack?",
        answer:
          "Yes — set up a trigger so Slack messages matching specific patterns create Jira tickets automatically.",
      },
      {
        question: "Does CalmPilot work with Jira Software, Service Management, and Work Management?",
        answer:
          "CalmPilot supports all Jira product lines via the Atlassian OAuth API.",
      },
      {
        question: "Can CalmPilot close Jira tickets when GitHub PRs merge?",
        answer:
          "Yes — set up a trigger linking GitHub PR merges to Jira ticket transitions automatically.",
      },
    ],
  },
  {
    slug: "google-sheets",
    name: "Google Sheets",
    logo: "https://logos.composio.dev/api/googlesheets",
    tagline: "AI Assistant for Google Sheets — Automate Spreadsheet Workflows",
    description: "CalmPilot connects to Google Sheets to read, write, and automate spreadsheet data — trigger actions when rows change, create reports, and sync data across apps.",
    category: "Productivity",
    useCases: [
      { title: "Data Sync", description: "Automatically push CRM updates, form submissions, or event data into Sheets." },
      { title: "Report Generation", description: "Generate weekly summary sheets from your email, calendar, and project data." },
      { title: "Row Triggers", description: "Trigger automations when new rows appear or values change in a sheet." },
    ],
    features: ["Read and write cells", "Create spreadsheets", "Append rows", "Trigger on changes", "Format data"],
    keywords: ["Google Sheets automation", "AI spreadsheet assistant", "automate Google Sheets"],
    faq: [{ question: "Can CalmPilot create charts?", answer: "CalmPilot can write data and format cells, but chart creation requires manual setup in Sheets." }],
  },
  {
    slug: "google-docs",
    name: "Google Docs",
    logo: "https://logos.composio.dev/api/googledocs",
    tagline: "AI Assistant for Google Docs — Automate Document Workflows",
    description: "CalmPilot connects to Google Docs to create, read, and manage documents automatically — draft meeting notes, generate reports, and keep docs in sync with your workflow.",
    category: "Productivity",
    useCases: [
      { title: "Meeting Notes", description: "Auto-generate meeting notes from your calendar events and briefings." },
      { title: "Document Templates", description: "Create documents from templates with dynamic data from other apps." },
    ],
    features: ["Create documents", "Read content", "Append text", "Search docs"],
    keywords: ["Google Docs automation", "AI document assistant"],
    faq: [{ question: "Can CalmPilot edit existing docs?", answer: "Yes — CalmPilot can read and append content to existing Google Docs." }],
  },
  {
    slug: "google-tasks",
    name: "Google Tasks",
    logo: "https://logos.composio.dev/api/googletasks",
    tagline: "AI Assistant for Google Tasks — Automate Task Management",
    description: "CalmPilot connects to Google Tasks to create, complete, and organize tasks from any trigger — emails, Slack messages, or scheduled routines.",
    category: "Productivity",
    useCases: [
      { title: "Email to Task", description: "Automatically create tasks from flagged emails or specific senders." },
      { title: "Daily Planning", description: "CalmPilot creates a prioritized task list in your morning briefing." },
    ],
    features: ["Create tasks", "Complete tasks", "List tasks", "Set due dates"],
    keywords: ["Google Tasks automation", "AI task manager"],
    faq: [{ question: "Does it sync with Google Calendar?", answer: "Tasks with due dates appear in Google Calendar automatically." }],
  },
  {
    slug: "google-meet",
    name: "Google Meet",
    logo: "https://logos.composio.dev/api/googlemeet",
    tagline: "AI Assistant for Google Meet — Automate Meeting Workflows",
    description: "CalmPilot connects to Google Meet to create meeting links, manage scheduling, and prepare you with pre-meeting briefings.",
    category: "Communication",
    useCases: [
      { title: "Auto Meeting Links", description: "Generate Meet links automatically when scheduling via CalmPilot." },
      { title: "Pre-Meeting Briefs", description: "Get context about attendees and agenda before each meeting." },
    ],
    features: ["Create meetings", "Generate links", "Calendar integration"],
    keywords: ["Google Meet automation", "AI meeting assistant"],
    faq: [{ question: "Can CalmPilot join meetings?", answer: "CalmPilot prepares you for meetings but does not join them directly." }],
  },
  {
    slug: "confluence",
    name: "Confluence",
    logo: "https://logos.composio.dev/api/confluence",
    tagline: "AI Assistant for Confluence — Automate Knowledge Base Management",
    description: "CalmPilot connects to Confluence to create pages, search documentation, and keep your knowledge base updated automatically.",
    category: "Productivity",
    useCases: [
      { title: "Page Creation", description: "Create Confluence pages from meeting notes, Slack threads, or Jira tickets." },
      { title: "Knowledge Search", description: "Ask CalmPilot to find relevant docs across your Confluence spaces." },
    ],
    features: ["Create pages", "Search content", "Update pages", "Manage spaces"],
    keywords: ["Confluence automation", "AI knowledge base assistant"],
    faq: [{ question: "Does CalmPilot work with Confluence Cloud?", answer: "Yes — CalmPilot supports Confluence Cloud via Atlassian OAuth." }],
  },
  {
    slug: "salesforce",
    name: "Salesforce",
    logo: "https://logos.composio.dev/api/salesforce",
    tagline: "AI Assistant for Salesforce — Automate CRM Workflows",
    description: "CalmPilot connects to Salesforce to update records, track deals, and surface CRM insights in your daily briefing.",
    category: "CRM",
    useCases: [
      { title: "Deal Tracking", description: "Get daily updates on pipeline changes, new leads, and closed deals." },
      { title: "Contact Updates", description: "Automatically log emails and meetings to Salesforce contact records." },
    ],
    features: ["Read/write records", "Search contacts", "Update opportunities", "Track pipeline"],
    keywords: ["Salesforce automation", "AI CRM assistant", "automate Salesforce"],
    faq: [{ question: "Which Salesforce editions are supported?", answer: "CalmPilot works with all Salesforce editions that support API access." }],
  },
  {
    slug: "mailchimp",
    name: "Mailchimp",
    logo: "https://logos.composio.dev/api/mailchimp",
    tagline: "AI Assistant for Mailchimp — Automate Email Marketing",
    description: "CalmPilot connects to Mailchimp to manage campaigns, track subscribers, and trigger automations based on audience activity.",
    category: "Marketing",
    useCases: [
      { title: "Campaign Monitoring", description: "Get briefed on open rates, clicks, and unsubscribes each morning." },
      { title: "List Management", description: "Add subscribers from forms, events, or other apps automatically." },
    ],
    features: ["Manage lists", "Track campaigns", "Add subscribers", "View analytics"],
    keywords: ["Mailchimp automation", "AI email marketing assistant"],
    faq: [{ question: "Can CalmPilot send campaigns?", answer: "CalmPilot can create and schedule campaigns, and monitor their performance." }],
  },
  {
    slug: "outlook",
    name: "Outlook",
    logo: "https://logos.composio.dev/api/outlook",
    tagline: "AI Assistant for Outlook — Automate Email and Calendar",
    description: "CalmPilot connects to Microsoft Outlook to triage emails, manage calendar events, and automate email workflows — just like Gmail but for Microsoft 365.",
    category: "Email",
    useCases: [
      { title: "Email Triage", description: "CalmPilot reads your Outlook inbox, prioritizes messages, and drafts replies." },
      { title: "Calendar Sync", description: "Track meetings, conflicts, and free slots across Outlook Calendar." },
    ],
    features: ["Read emails", "Send emails", "Manage calendar", "Search messages"],
    keywords: ["Outlook automation", "AI Outlook assistant", "Microsoft 365 automation"],
    faq: [{ question: "Does it work with personal Outlook accounts?", answer: "CalmPilot supports both Microsoft 365 business and personal Outlook accounts." }],
  },
  {
    slug: "pipedrive",
    name: "Pipedrive",
    logo: "https://logos.composio.dev/api/pipedrive",
    tagline: "AI Assistant for Pipedrive — Automate Sales Pipeline",
    description: "CalmPilot connects to Pipedrive to track deals, update contacts, and surface pipeline insights automatically.",
    category: "CRM",
    useCases: [
      { title: "Deal Updates", description: "Get daily summaries of new deals, stage changes, and won/lost outcomes." },
      { title: "Activity Logging", description: "Automatically log calls and emails to Pipedrive deal records." },
    ],
    features: ["Track deals", "Update contacts", "Log activities", "Search pipeline"],
    keywords: ["Pipedrive automation", "AI sales assistant"],
    faq: [{ question: "Can CalmPilot move deals between stages?", answer: "Yes — set up triggers to automatically advance deals based on events." }],
  },
  {
    slug: "zendesk",
    name: "Zendesk",
    logo: "https://logos.composio.dev/api/zendesk",
    tagline: "AI Assistant for Zendesk — Automate Support Workflows",
    description: "CalmPilot connects to Zendesk to monitor tickets, triage support requests, and surface critical issues in your briefing.",
    category: "Support",
    useCases: [
      { title: "Ticket Monitoring", description: "Get alerted about high-priority tickets and SLA breaches." },
      { title: "Ticket Creation", description: "Create Zendesk tickets from Slack messages or email triggers." },
    ],
    features: ["Read tickets", "Create tickets", "Update status", "Track SLAs"],
    keywords: ["Zendesk automation", "AI support assistant"],
    faq: [{ question: "Does CalmPilot work with Zendesk Chat?", answer: "CalmPilot integrates with Zendesk Support. Chat integration depends on Composio API coverage." }],
  },
  {
    slug: "zoom",
    name: "Zoom",
    logo: "https://logos.composio.dev/api/zoom",
    tagline: "AI Assistant for Zoom — Automate Meeting Management",
    description: "CalmPilot connects to Zoom to schedule meetings, generate links, and prepare you with pre-meeting context.",
    category: "Communication",
    useCases: [
      { title: "Meeting Scheduling", description: "Create Zoom meetings from calendar events or chat commands." },
      { title: "Pre-Meeting Prep", description: "CalmPilot briefs you on attendees and topics before each Zoom call." },
    ],
    features: ["Create meetings", "List meetings", "Generate join links"],
    keywords: ["Zoom automation", "AI meeting assistant"],
    faq: [{ question: "Can CalmPilot record meetings?", answer: "CalmPilot can schedule and create meetings but recording depends on your Zoom plan settings." }],
  },
  {
    slug: "youtube",
    name: "YouTube",
    logo: "https://logos.composio.dev/api/youtube",
    tagline: "AI Assistant for YouTube — Automate Channel Management",
    description: "CalmPilot connects to YouTube to monitor channel analytics, track comments, and manage video metadata.",
    category: "Marketing",
    useCases: [
      { title: "Comment Monitoring", description: "Get notified about new comments and respond via CalmPilot." },
      { title: "Analytics Briefing", description: "Daily view counts, subscriber growth, and engagement metrics." },
    ],
    features: ["Track analytics", "Monitor comments", "Manage videos"],
    keywords: ["YouTube automation", "AI YouTube assistant"],
    faq: [{ question: "Can CalmPilot upload videos?", answer: "CalmPilot can manage metadata and monitor analytics but does not handle video uploads." }],
  },
  {
    slug: "spotify",
    name: "Spotify",
    logo: "https://logos.composio.dev/api/spotify",
    tagline: "AI Assistant for Spotify — Automate Playlist and Listening Workflows",
    description: "CalmPilot connects to Spotify to manage playlists, track listening activity, and automate music-related workflows.",
    category: "Entertainment",
    useCases: [
      { title: "Playlist Management", description: "Create and update playlists based on triggers or mood preferences." },
      { title: "Listening Insights", description: "Track your listening habits and recently played tracks." },
    ],
    features: ["Manage playlists", "Search tracks", "Track listening activity"],
    keywords: ["Spotify automation", "AI music assistant"],
    faq: [{ question: "Does CalmPilot need Spotify Premium?", answer: "Basic features work with free Spotify, but playback control requires Premium." }],
  },
  {
    slug: "box",
    name: "Box",
    logo: "https://logos.composio.dev/api/box",
    tagline: "AI Assistant for Box — Automate Cloud Storage Workflows",
    description: "CalmPilot connects to Box to manage files, monitor shared folders, and automate document workflows across your organization.",
    category: "Productivity",
    useCases: [
      { title: "File Monitoring", description: "Get notified when files are added or changed in key folders." },
      { title: "Document Sharing", description: "Share files and generate links automatically from triggers." },
    ],
    features: ["Upload files", "Search content", "Manage folders", "Share links"],
    keywords: ["Box automation", "AI cloud storage assistant"],
    faq: [{ question: "Does CalmPilot work with Box Enterprise?", answer: "Yes — CalmPilot supports Box accounts with API access enabled." }],
  },
  {
    slug: "microsoft_teams",
    name: "Microsoft Teams",
    logo: "https://logos.composio.dev/api/microsoft_teams",
    tagline: "AI Assistant for Microsoft Teams — Automate Team Communication",
    description: "CalmPilot connects to Microsoft Teams to monitor channels, send messages, and surface important conversations in your briefing.",
    category: "Communication",
    useCases: [
      { title: "Channel Monitoring", description: "Track key channels and get briefed on important messages you missed." },
      { title: "Message Automation", description: "Send automated updates to Teams channels from other app triggers." },
    ],
    features: ["Send messages", "Monitor channels", "Search conversations"],
    keywords: ["Microsoft Teams automation", "AI Teams assistant"],
    faq: [{ question: "Does CalmPilot work with Teams free?", answer: "CalmPilot supports Microsoft Teams accounts with Microsoft Graph API access." }],
  },
  ── End commented section 2 (Google Drive through Microsoft Teams) */
];

export function getIntegration(slug: string): Integration | undefined {
  return INTEGRATIONS.find((i) => i.slug === slug);
}

export const INTEGRATION_SLUGS = INTEGRATIONS.map((i) => i.slug);
