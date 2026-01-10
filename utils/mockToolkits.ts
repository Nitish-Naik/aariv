export interface Toolkit {
    id: string;
    name: string;
    description: string;
    category: 'Productivity' | 'Development' | 'Communication' | 'Finance' | 'Design' | 'Social' | 'Other';
    icon: string; // Ionicons name
    connected?: boolean;
    isPremium?: boolean;
}

export const MOCK_TOOLKITS: Toolkit[] = [
    // Productivity
    { id: '1', name: 'Notion', description: 'Access pages, databases, and notes.', category: 'Productivity', icon: 'document-text', connected: true },
    { id: '2', name: 'Google Workspace', description: 'Gmail, Calendar, Drive sync.', category: 'Productivity', icon: 'logo-google', connected: true },
    { id: '3', name: 'Linear', description: 'Issue tracking and project management.', category: 'Productivity', icon: 'list-circle', isPremium: true },
    { id: '4', name: 'Asana', description: 'Task tracking for teams.', category: 'Productivity', icon: 'checkbox' },
    { id: '5', name: 'Airtable', description: 'Database functionality for spreadsheets.', category: 'Productivity', icon: 'grid' },

    // Development
    { id: '6', name: 'GitHub', description: 'Repositories, PRs, and Issues.', category: 'Development', icon: 'logo-github', connected: true },
    { id: '7', name: 'Vercel', description: 'Deployments and serverless functions.', category: 'Development', icon: 'triangle', isPremium: true },
    { id: '8', name: 'AWS', description: 'Cloud infrastructure monitoring.', category: 'Development', icon: 'cloud' },
    { id: '9', name: 'Jira', description: 'Enterprise issue tracking.', category: 'Development', icon: 'layers' },
    { id: '10', name: 'Sentry', description: 'Error tracking and monitoring.', category: 'Development', icon: 'bug' },

    // Communication
    { id: '11', name: 'Slack', description: 'Channel messages and DMs.', category: 'Communication', icon: 'logo-slack', connected: true },
    { id: '12', name: 'Discord', description: 'Community server management.', category: 'Communication', icon: 'logo-discord' },
    { id: '13', name: 'Zoom', description: 'Meeting scheduling and transcripts.', category: 'Communication', icon: 'videocam' },
    { id: '14', name: 'Microsoft Teams', description: 'Corporate communication suite.', category: 'Communication', icon: 'people' },

    // Finance
    { id: '15', name: 'Stripe', description: 'Payment processing and analytics.', category: 'Finance', icon: 'card', isPremium: true },
    { id: '16', name: 'Quickbooks', description: 'Accounting and expense tracking.', category: 'Finance', icon: 'receipt' },
    { id: '17', name: 'Xero', description: 'Small business accounting.', category: 'Finance', icon: 'calculator' },

    // Design
    { id: '18', name: 'Figma', description: 'Design files and comments.', category: 'Design', icon: 'color-palette' },
    { id: '19', name: 'Adobe suite', description: 'Creative cloud assets.', category: 'Design', icon: 'image' },

    // Social
    { id: '20', name: 'Twitter (X)', description: 'Post and analyze tweets.', category: 'Social', icon: 'logo-twitter' },
    { id: '21', name: 'LinkedIn', description: 'Professional network updates.', category: 'Social', icon: 'logo-linkedin' },
    { id: '22', name: 'Instagram', description: 'Visual media management.', category: 'Social', icon: 'logo-instagram' },
    
    // Fillers to simulate scale
    ...Array.from({ length: 20 }).map((_, i) => ({
        id: `filler-${i}`,
        name: `Toolkit ${i + 23}`,
        description: 'Generic connector for external API.',
        category: 'Other' as const,
        icon: 'cube',
    }))
];
