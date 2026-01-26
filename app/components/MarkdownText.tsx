import React from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface MarkdownTextProps {
    content: string;
}

export const MarkdownText: React.FC<MarkdownTextProps> = ({ content }) => {
    const { colors, isDark } = useTheme();
    const styles = getStyles(colors, isDark);

    if (!content) return null;

    // Split by newlines to handle blocks
    const lines = content.split('\n');

    return (
        <View>
            {lines.map((line, index) => {
                const key = `line-${index}`;

                // Header detection (###, ##, #)
                if (line.startsWith('### ')) {
                    return <Text key={key} style={styles.h3}>{parseInline(line.replace('### ', ''), styles)}</Text>;
                }
                if (line.startsWith('## ')) {
                    return <Text key={key} style={styles.h2}>{parseInline(line.replace('## ', ''), styles)}</Text>;
                }
                if (line.startsWith('# ')) {
                    return <Text key={key} style={styles.h1}>{parseInline(line.replace('# ', ''), styles)}</Text>;
                }

                // List item detection
                if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
                    const indent = line.search(/\S/); // Count leading spaces
                    return (
                        <View key={key} style={[styles.listItem, { marginLeft: indent * 4 }]}>
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.text}>{parseInline(line.trim().substring(2), styles)}</Text>
                        </View>
                    );
                }

                // Default paragraph
                // Check if empty line (spacing)
                if (!line.trim()) {
                    return <View key={key} style={styles.spacer} />;
                }

                return (
                    <Text key={key} style={styles.text}>
                        {parseInline(line, styles)}
                    </Text>
                );
            })}
        </View>
    );
};

// Helper to parse inline styles: **bold**, [link](url)
const parseInline = (text: string, styles: any): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let i = 0;

    // Simple regex for **bold** and [link](url)
    // We process sequentially. A robust parser is complex, this is a lightweight heuristic.
    // Optimization: Just split by ** for bold first.

    // Strategy: tokenizing is hard without recursion.
    // Let's support BOLD first as it's most common.

    const boldChunks = text.split('**');
    for (let j = 0; j < boldChunks.length; j++) {
        const chunk = boldChunks[j];
        // Even indices are normal, Odd indices are bold (if closed properly)
        // e.g. "normal **bold** normal" -> ["normal ", "bold", " normal"]

        // Check if this was a valid bold pair. If split length is even, the last one isn't closed?
        // Let's assume valid markdown for simplicity or unclosed is strictly even.
        const isBold = (j % 2 === 1) && (j < boldChunks.length - 1 || boldChunks.length % 2 === 1);
        // Logic fix: "a **b** c" -> len 3. j=0(norm), j=1(bold), j=2(norm).

        if (j % 2 === 1) {
            parts.push(<Text key={`b-${i++}`} style={styles.bold}>{chunk}</Text>);
        } else {
            // Basic link parsing within non-bold text
            // Regex for [text](url)
            const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
            let lastIndex = 0;
            let match;

            while ((match = linkRegex.exec(chunk)) !== null) {
                // Push text before link
                if (match.index > lastIndex) {
                    parts.push(<Text key={`t-${i++}`} style={styles.text}>{chunk.substring(lastIndex, match.index)}</Text>);
                }

                const linkText = match[1];
                const linkUrl = match[2];

                parts.push(
                    <Text
                        key={`l-${i++}`}
                        style={styles.link}
                        onPress={() => Linking.openURL(linkUrl)}
                    >
                        {linkText}
                    </Text>
                );

                lastIndex = match.index + match[0].length;
            }

            // Remaining text after last link
            if (lastIndex < chunk.length) {
                parts.push(<Text key={`t-${i++}`} style={styles.text}>{chunk.substring(lastIndex)}</Text>);
            }
        }
    }

    return parts;
};

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
    text: {
        fontSize: 15,
        lineHeight: 24,
        color: colors.text,
    },
    bold: {
        fontWeight: 'bold',
        color: colors.text,
    },
    h1: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 8,
        marginTop: 12,
    },
    h2: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 6,
        marginTop: 10,
    },
    h3: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 4,
        marginTop: 8,
    },
    listItem: {
        flexDirection: 'row',
        marginBottom: 4,
        paddingLeft: 4,
    },
    bullet: {
        fontSize: 15,
        lineHeight: 24,
        color: colors.text,
        marginRight: 6,
    },
    spacer: {
        height: 8,
    },
    link: {
        color: colors.primary[500] || '#2196F3',
        textDecorationLine: 'underline',
    }
});
