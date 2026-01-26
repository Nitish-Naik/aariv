/**
 * Infers the severity of a highlight based on keywords.
 * 
 * @param content The text content to analyze
 * @returns 'normal' | 'attention' | 'urgent'
 */
export function inferSeverity(content: string): 'normal' | 'attention' | 'urgent' {
    const text = content.toLowerCase();

    // Urgent keywords
    if (
        text.includes('urgent') ||
        text.includes('deadline') ||
        text.includes('asap') ||
        text.includes('immediate') ||
        text.includes('critical') ||
        text.includes('unpaid')
    ) {
        return 'urgent';
    }

    // Attention keywords
    if (
        text.includes('review') ||
        text.includes('confirm') ||
        text.includes('approve') ||
        text.includes('action required') ||
        text.includes('pending')
    ) {
        return 'attention';
    }

    return 'normal';
}
