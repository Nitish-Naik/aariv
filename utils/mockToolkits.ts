export interface Toolkit {
    id: string;
    name: string;
    description: string;
    icon: string;
    connected: boolean;
    category: string;
    popular?: boolean;
    comingSoon?: boolean;
}

export interface ToolkitBundle {
    id: string;
    title: string;
    description: string;
    icon: string; // Ionicons name
    toolkits: string[]; // IDs of included toolkits
}

export const MOCK_TOOLKITS: Toolkit[] = [
    {
        id: '1',
        name: 'Gmail',
        description: 'Read emails, draft replies, and organize your inbox.',
        icon: 'mail',
        connected: false,
        category: 'Communication',
        popular: true,
    },
    {
        id: '2',
        name: 'Google Calendar',
        description: 'Schedule meetings, check availability, and manage events.',
        icon: 'calendar',
        connected: false,
        category: 'Productivity',
        popular: true,
    },
    {
        id: '3',
        name: 'Slack',
        description: 'Send messages, read channels, and manage workspace.',
        icon: 'logo-slack',
        connected: false,
        category: 'Communication',
    },
    {
        id: '4',
        name: 'Notion',
        description: 'Access pages, databases, and manage knowledge base.',
        icon: 'document-text',
        connected: false,
        category: 'Productivity',
    },
    {
        id: '5',
        name: 'GitHub',
        description: 'Manage repositories, issues, and pull requests.',
        icon: 'logo-github',
        connected: false,
        category: 'Developer',
    },
    {
        id: '6',
        name: 'Linear',
        description: 'Track issues, projects, and roadmap progress.',
        icon: 'list',
        connected: false,
        category: 'Developer',
    }
];

export const MOCK_BUNDLES: ToolkitBundle[] = [
    {
        id: 'b1',
        title: 'Executive Assistant',
        description: 'The core set for email, calendar, and scheduling.',
        icon: 'briefcase',
        toolkits: ['1', '2']
    },
    {
        id: 'b2',
        title: 'Developer Productivity',
        description: 'Manage code and tasks without leaving your chat.',
        icon: 'code-slash',
        toolkits: ['5', '6', '3']
    }
];
