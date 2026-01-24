import { ChatMessage } from "../types/chat";

// Enforce Dev vs Prod Visibility Rules
export const isDev = process.env.NODE_ENV !== "production";

export function shouldRenderMessage(message: ChatMessage): boolean {
    switch (message.type) {
        case "user":
        case "assistant":
            return true;

        case "system":
            return true;

        case "tool_execution":
        case "debug":
            return isDev;

        default:
            return false;
    }
}
