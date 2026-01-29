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
    let i = 0;

    // 1. Split by bold **
    const boldChunks = text.split('**');
    for (let j = 0; j < boldChunks.length; j++) {
        const chunk = boldChunks[j];
        const isBold = (j % 2 === 1) && (j < boldChunks.length - 1 || boldChunks.length % 2 === 1);

        if (isBold) {
            parts.push(<Text key={`b-${i++}`} style={styles.bold}>{chunk}</Text>);
            continue;
        }

        // 2. Parse links, entities, and hashtags within normal text
        // Entity regex for @username, #hashtag
        const entityLinkRegex = /(\[([^\]]+)\]\(([^)]+)\))|(@\w+)|(#\w+)/g;
        let lastIndex = 0;
        let match;

        while ((match = entityLinkRegex.exec(chunk)) !== null) {
            // Text before match
            if (match.index > lastIndex) {
                parts.push(<Text key={`t-${i++}`} style={styles.text}>{chunk.substring(lastIndex, match.index)}</Text>);
            }

            if (match[1]) { // Markdown Link [text](url)
                const linkText = match[2];
                const linkUrl = match[3];
                parts.push(
                    <Text key={`l-${i++}`} style={styles.link} onPress={() => Linking.openURL(linkUrl)}>
                        {linkText}
                    </Text>
                );
            } else if (match[4]) { // @username
                parts.push(<Text key={`at-${i++}`} style={styles.entity}>{match[4]}</Text>);
            } else if (match[5]) { // #hashtag
                parts.push(<Text key={`hash-${i++}`} style={styles.entity}>{match[5]}</Text>);
            }

            lastIndex = match.index + match[0].length;
        }

        if (lastIndex < chunk.length) {
            parts.push(<Text key={`t-${i++}`} style={styles.text}>{chunk.substring(lastIndex)}</Text>);
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
    entity: {
        color: colors.primary[400] || '#60A5FA',
        fontWeight: '600',
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
        marginBottom: 8, // Increased spacing
        paddingLeft: 4,
        alignItems: 'flex-start',
    },
    bullet: {
        fontSize: 15,
        lineHeight: 24,
        color: colors.primary[500], // Brand colored bullet
        marginRight: 8,
        fontWeight: 'bold',
    },
    spacer: {
        height: 12, // Increased spacing
    },
    link: {
        color: colors.primary[500] || '#2196F3',
        textDecorationLine: 'underline',
    }
});
