export interface PermissionScope {
    id: string;
    label: string;
    description: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface Toolkit {
    id: string;
    name: string;
    description: string;
    category: 'Productivity' | 'Development' | 'Communication' | 'Finance' | 'Design' | 'Social' | 'Other';
    icon: string; // Ionicons name
    connected?: boolean;
    isPremium?: boolean;
    scopes: PermissionScope[];
}

export interface ToolkitBundle {
    id: string;
    title: string;
    description: string;
    toolkitIds: string[];
    savings: string; // e.g., "Save 20%" equivalent effort
    icon: string;
}

const COMMON_SCOPES: Record<string, PermissionScope> = {
    read_profile: { id: 'read_profile', label: 'View Profile', description: 'Access basic account info', riskLevel: 'low' },
    read_content: { id: 'read_content', label: 'Read Data', description: 'Read messages, files, or records', riskLevel: 'medium' },
    write_content: { id: 'write_content', label: 'Create/Edit Data', description: 'Send messages or create records', riskLevel: 'high' },
    admin_access: { id: 'admin_access', label: 'Admin Access', description: 'Full account control', riskLevel: 'critical' },
};

export const MOCK_BUNDLES: ToolkitBundle[] = [
    {
        id: 'bundle_startup',
        title: 'Founder Stack',
        description: 'Essential tools for running a modern startup.',
        toolkitIds: ['1', '2', '11', '15'], // Notion, Google, Slack, Stripe
        savings: 'Setup in 1 click',
        icon: 'rocket'
    },
    {
        id: 'bundle_dev',
        title: 'Code & Ship',
        description: 'Full developement lifecycle automation.',
        toolkitIds: ['6', '7', '10', '3'], // GitHub, Vercel, Sentry, Linear
        savings: 'Automate CI/CD',
        icon: 'code-slash'
    },
    {
        id: 'bundle_creator',
        title: 'Creator Studio',
        description: 'Manage content across platforms.',
        toolkitIds: ['20', '21', '22', '18'], // Twitter, LinkedIn, Instagram, Figma
        savings: 'Unified Analytics',
        icon: 'camera'
    }
];

export const MOCK_TOOLKITS: Toolkit[] = [
    // Productivity
    { 
        id: '1', name: 'Notion', description: 'Access pages, databases, and notes.', category: 'Productivity', icon: 'document-text', connected: true,
        scopes: [COMMON_SCOPES.read_content, COMMON_SCOPES.write_content]
    },
    { 
        id: '2', name: 'Google Workspace', description: 'Gmail, Calendar, Drive sync.', category: 'Productivity', icon: 'logo-google', connected: true,
        scopes: [COMMON_SCOPES.read_profile, COMMON_SCOPES.read_content, COMMON_SCOPES.write_content]
    },
    { 
        id: '3', name: 'Linear', description: 'Issue tracking and project management.', category: 'Productivity', icon: 'list-circle', isPremium: true,
        scopes: [COMMON_SCOPES.read_content, COMMON_SCOPES.write_content]
    },
    { 
        id: '4', name: 'Asana', description: 'Task tracking for teams.', category: 'Productivity', icon: 'checkbox',
        scopes: [COMMON_SCOPES.read_content]
    },
    { 
        id: '5', name: 'Airtable', description: 'Database functionality for spreadsheets.', category: 'Productivity', icon: 'grid',
        scopes: [COMMON_SCOPES.read_content, COMMON_SCOPES.write_content]
    },

    // Development
    { 
        id: '6', name: 'GitHub', description: 'Repositories, PRs, and Issues.', category: 'Development', icon: 'logo-github', connected: true,
        scopes: [COMMON_SCOPES.read_content, COMMON_SCOPES.write_content, COMMON_SCOPES.admin_access]
    },
    { 
        id: '7', name: 'Vercel', description: 'Deployments and serverless functions.', category: 'Development', icon: 'triangle', isPremium: true,
        scopes: [COMMON_SCOPES.read_content, COMMON_SCOPES.write_content]
    },
    { 
        id: '8', name: 'AWS', description: 'Cloud infrastructure monitoring.', category: 'Development', icon: 'cloud',
        scopes: [COMMON_SCOPES.read_content, COMMON_SCOPES.admin_access]
    },
    { 
        id: '9', name: 'Jira', description: 'Enterprise issue tracking.', category: 'Development', icon: 'layers',
        scopes: [COMMON_SCOPES.read_content]
    },
    { 
        id: '10', name: 'Sentry', description: 'Error tracking and monitoring.', category: 'Development', icon: 'bug',
        scopes: [COMMON_SCOPES.read_content]
    },

    // Communication
    { 
        id: '11', name: 'Slack', description: 'Channel messages and DMs.', category: 'Communication', icon: 'logo-slack', connected: true,
        scopes: [COMMON_SCOPES.read_content, COMMON_SCOPES.write_content]
    },
    { 
        id: '12', name: 'Discord', description: 'Community server management.', category: 'Communication', icon: 'logo-discord',
        scopes: [COMMON_SCOPES.read_content, COMMON_SCOPES.write_content]
    },
    { 
        id: '13', name: 'Zoom', description: 'Meeting scheduling and transcripts.', category: 'Communication', icon: 'videocam',
        scopes: [COMMON_SCOPES.read_content]
    },
    { 
        id: '14', name: 'Microsoft Teams', description: 'Corporate communication suite.', category: 'Communication', icon: 'people',
        scopes: [COMMON_SCOPES.read_content, COMMON_SCOPES.write_content]
    },

    // Finance
    { 
        id: '15', name: 'Stripe', description: 'Payment processing and analytics.', category: 'Finance', icon: 'card', isPremium: true,
        scopes: [COMMON_SCOPES.read_content, COMMON_SCOPES.admin_access]
    },
    { 
        id: '16', name: 'Quickbooks', description: 'Accounting and expense tracking.', category: 'Finance', icon: 'receipt',
        scopes: [COMMON_SCOPES.read_content]
    },
    { 
        id: '17', name: 'Xero', description: 'Small business accounting.', category: 'Finance', icon: 'calculator',
        scopes: [COMMON_SCOPES.read_content]
    },

    // Design
    { 
        id: '18', name: 'Figma', description: 'Design files and comments.', category: 'Design', icon: 'color-palette',
        scopes: [COMMON_SCOPES.read_content]
    },
    { 
        id: '19', name: 'Adobe suite', description: 'Creative cloud assets.', category: 'Design', icon: 'image',
        scopes: [COMMON_SCOPES.read_content]
    },

    // Social
    { 
        id: '20', name: 'Twitter (X)', description: 'Post and analyze tweets.', category: 'Social', icon: 'logo-twitter',
        scopes: [COMMON_SCOPES.read_content, COMMON_SCOPES.write_content]
    },
    { 
        id: '21', name: 'LinkedIn', description: 'Professional network updates.', category: 'Social', icon: 'logo-linkedin',
        scopes: [COMMON_SCOPES.read_content, COMMON_SCOPES.write_content]
    },
    { 
        id: '22', name: 'Instagram', description: 'Visual media management.', category: 'Social', icon: 'logo-instagram',
        scopes: [COMMON_SCOPES.read_content, COMMON_SCOPES.write_content]
    },
    
    // Fillers to simulate scale
    ...Array.from({ length: 20 }).map((_, i) => ({
        id: `filler-${i}`,
        name: `Toolkit ${i + 23}`,
        description: 'Generic connector for external API.',
        category: 'Other' as const,
        icon: 'cube',
        scopes: [COMMON_SCOPES.read_content]
    }))
];
