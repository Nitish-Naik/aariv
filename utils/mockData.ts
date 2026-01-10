import { ActionItem, CalendarEvent, ChatMessage, InboxItem, PlatformConnection } from '../types';

export const MOCK_CONNECTIONS: PlatformConnection[] = [
  {
    id: '1',
    platform: 'gmail',
    name: 'Work Email',
    icon: 'mail',
    connected: true,
    connectedAt: new Date(),
    permissions: ['read', 'write'],
  },
  {
    id: '2',
    platform: 'slack',
    name: 'Company Slack',
    icon: 'slack',
    connected: true,
    connectedAt: new Date(),
    permissions: ['read'],
  },
  {
    id: '3',
    platform: 'google-calendar',
    name: 'Primary Calendar',
    icon: 'calendar',
    connected: true,
    connectedAt: new Date(),
    permissions: ['read', 'write'],
  },
];

export const MOCK_ACTIONS: ActionItem[] = [
  {
    id: '1',
    type: 'email',
    title: 'Draft reply to Sarah',
    description: 'Regarding the Q3 roadmap review meeting.',
    platform: 'gmail',
    proposedAt: new Date(),
    expiresAt: new Date(Date.now() + 86400000), // 24h
    status: 'pending',
    requiresApproval: true,
  },
  {
    id: '2',
    type: 'calendar',
    title: 'Reschedule Weekly Sync',
    description: 'Conflict with client call. Propose moving to 3 PM.',
    platform: 'google-calendar',
    proposedAt: new Date(),
    expiresAt: new Date(Date.now() + 86400000),
    status: 'pending',
    requiresApproval: true,
  },
];

export const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    title: 'Team Standup',
    startTime: new Date(new Date().setHours(10, 0)),
    endTime: new Date(new Date().setHours(10, 30)),
    platform: 'google-calendar',
    color: '#6366F1',
  },
  {
    id: '2',
    title: 'Project Review',
    startTime: new Date(new Date().setHours(14, 0)),
    endTime: new Date(new Date().setHours(15, 0)),
    platform: 'google-calendar',
    color: '#4338CA',
  },
];

export const MOCK_INBOX_ITEMS: InboxItem[] = [
  {
    id: '1',
    platform: 'gmail',
    from: 'Sarah Johnson',
    subject: 'Q3 Roadmap Review',
    preview: 'Hi team, checking in on the Q3 roadmap progress. Can we review this Friday?',
    receivedAt: new Date(Date.now() - 3600000), // 1h ago
    unread: true,
    priority: 'high',
  },
  {
    id: '2',
    platform: 'slack',
    from: 'Alex Chen',
    subject: '#engineering',
    preview: 'Deployment to staging was successful.',
    receivedAt: new Date(Date.now() - 7200000), // 2h ago
    unread: false,
    priority: 'low',
  },
];

export const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    role: 'assistant',
    content: 'Good morning, Nitish. You have 2 actions pending approval and a meeting in 1 hour.',
    timestamp: new Date(Date.now() - 300000),
    suggestions: ['Show actions', 'Brief me on the meeting'],
  },
];
