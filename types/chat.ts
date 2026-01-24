export type ChatMessage =
    | UserMessage
    | AssistantMessage
    | SystemMessage
    | ToolExecutionMessage
    | DebugMessage;

export type UserMessage = {
    id: string;
    type: "user";
    text: string;
    timestamp: number;
};

export type AssistantMessage = {
    id: string;
    type: "assistant";
    text: string;
    tone?: "neutral" | "reassuring" | "focused";
    followUp?: string | null;
    suggestions?: SuggestedAction[];
    timestamp: number;
};

export type SuggestedAction = {
    id: string;
    label: string;
    intent: string; // The text to send or action ID
    app?: 'gmail' | 'calendar' | 'maps' | 'generic';
    priority?: "low" | "medium";
};

export type SystemMessage = {
    id: string;
    type: "system";
    text: string;
    level: "info" | "warning";
};

export type ToolExecutionMessage = {
    id: string;
    type: "tool_execution";
    tool: string;
    status: "started" | "success" | "error";
    input?: unknown;
    output?: unknown;
    durationMs?: number;
};

export type DebugMessage = {
    id: string;
    type: "debug";
    label: string;
    payload?: unknown;
};
