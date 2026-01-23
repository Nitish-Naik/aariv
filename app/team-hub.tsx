// ⚠️ PREVIEW-ONLY ROUTE - Temporary route for visual inspection
// TODO: Remove or integrate into production after review
import { useRouter } from "expo-router";
import React from "react";
import { TeamHubScreen } from "../screens/TeamHubScreen";

export default function TeamHubRoute() {
    const router = useRouter();

    // Mock team updates for preview
    const mockUpdates = [
        {
            id: '1',
            platform: 'slack',
            type: 'message' as const,
            title: 'New message in #engineering',
            description: 'Sarah: "Just pushed the new calendar feature to staging. Can someone review?"',
            author: 'Sarah Johnson',
            timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 min ago
            unread: true,
        },
        {
            id: '2',
            platform: 'gmail',
            type: 'mention' as const,
            title: 'You were mentioned in "Q4 Planning"',
            description: 'John mentioned you in the quarterly planning email thread',
            author: 'John Smith',
            timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
            unread: true,
        },
        {
            id: '3',
            platform: 'slack',
            type: 'task' as const,
            title: 'New task assigned: Update documentation',
            description: 'Please update the API documentation for the new endpoints',
            author: 'Project Manager',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            unread: false,
        },
        {
            id: '4',
            platform: 'google-calendar',
            type: 'update' as const,
            title: 'Meeting rescheduled: Sprint Review',
            description: 'Sprint review has been moved from 2pm to 4pm tomorrow',
            author: 'Calendar Bot',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
            unread: false,
        },
        {
            id: '5',
            platform: 'slack',
            type: 'message' as const,
            title: 'New message in #design',
            description: 'Mike: "Check out the new mockups I just posted!"',
            author: 'Mike Chen',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
            unread: false,
        },
    ];

    return (
        <TeamHubScreen
            updates={mockUpdates}
            onUpdatePress={(update) => console.log('Update pressed:', update)}
            onBack={() => router.back()}
        />
    );
}
