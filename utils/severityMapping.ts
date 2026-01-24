import { HighlightSeverity } from "../components/HighlightCard";

/**
 * Keyword tables for deterministic severity matching.
 * Keys are matched case-insensitively against alert titles and bodies.
 */
export const SeverityKeywords = {
    urgent: [
        "unauthorized",
        "breach",
        "suspicious",
        "revoked",
        "expired",
        "token expired",
        "permission denied",
        "auth failed",
        "account disabled",
        "security violation",
        "critical",
        "immediate action",
    ],
    attention: [
        "unusual",
        "review",
        "verify",
        "incomplete",
        "partial",
        "retry",
        "delayed",
        "sync issue",
        "warning",
        "needs action",
        "security",
        "alert",
    ],
    info: [
        "completed",
        "success",
        "connected",
        "indexed",
        "running",
        "in progress",
        "scheduled",
        "summary",
        "insight",
        "tip",
    ],
};

/**
 * documentation
 * To add new keywords:
 * 1. Add string to the relevant array in SeverityKeywords.
 * 2. Order does not matter within the array.
 * 3. Priority is enforced by the inferSeverity function (Urgent > Attention > Info).
 */

/**
 * Infers the severity of a highlight/alert based on its text content.
 * 
 * Priority Rules:
 * 1. URRENT keywords override everything.
 * 2. ATTENTION keywords override info.
 * 3. Default to INFO if no matches.
 * 
 * @param text The combined title and body of the alert
 * @returns 'urgent' | 'attention' | 'info'
 */
export function inferSeverity(text: string): HighlightSeverity {
    if (!text) return 'info';

    const lowerText = text.toLowerCase();

    // 1. Check Urgent
    if (SeverityKeywords.urgent.some(keyword => lowerText.includes(keyword))) {
        return 'urgent';
    }

    // 2. Check Attention
    if (SeverityKeywords.attention.some(keyword => lowerText.includes(keyword))) {
        return 'attention';
    }

    // 3. Default (includes Info keywords matches or no matches)
    return 'info';
}
