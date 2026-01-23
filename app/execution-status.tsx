// ⚠️ PREVIEW-ONLY ROUTE - Temporary route for visual inspection
// TODO: Integrate into zen-mode flow or action history
import { useRouter } from "expo-router";
import React from "react";
import { ExecutionStatusScreen } from "../screens/ExecutionStatusScreen";

export default function ExecutionStatusRoute() {
    const router = useRouter();

    // Mock action with execution status
    const mockAction = {
        id: '1',
        title: 'Reply to Sarah about Q4 Planning',
        description: 'Draft and send email response discussing Q4 roadmap priorities and team allocation',
        platform: 'gmail' as any,
        type: 'email',
        status: 'executed' as any, // Try: approved, rejected, executed, expired, pending
        proposedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        priority: 'high' as any,
        metadata: {
            recipients: 'sarah@company.com',
            cc: 'team@company.com',
            sentAt: new Date().toISOString(),
            messageId: 'msg_abc123',
        },
    };

    return (
        <ExecutionStatusScreen
            action={mockAction}
            onBack={() => router.back()}
        />
    );
}
