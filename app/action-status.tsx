// Action Status Screen - Shows execution status after approve/reject in zen-mode
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ExecutionStatusScreen } from "../screens/ExecutionStatusScreen";

export default function ActionStatusRoute() {
    const router = useRouter();
    const params = useLocalSearchParams();

    // Parse action data from route params
    const actionData = params.actionData
        ? JSON.parse(params.actionData as string)
        : null;

    if (!actionData) {
        // Fallback if no action data provided
        router.back();
        return null;
    }

    return (
        <ExecutionStatusScreen
            action={actionData}
            onBack={() => router.back()}
        />
    );
}
