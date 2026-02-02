import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useTheme } from '../context/ThemeContext';
import { spacing, typography } from '../theme';
import type { KnowledgeGraphNode } from '../types';

interface KnowledgeGraphViewerScreenProps {
  nodes: KnowledgeGraphNode[];
  onDeleteNode: (nodeId: string) => void;
  onClearAll: () => void;
  onBack: () => void;
}

export const KnowledgeGraphViewerScreen: React.FC<KnowledgeGraphViewerScreenProps> = ({
  nodes,
  onDeleteNode,
  onClearAll,
  onBack,
}) => {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const filteredNodes = nodes;

  const getNodeIcon = (type: string) => {
    switch (type) {
        case 'pattern': return 'git-network-outline';
        case 'preference': return 'heart-outline';
        case 'ritual': return 'repeat-outline';
        case 'cadence': return 'time-outline';
        default: return 'ellipse-outline';
    }
  };

  const renderNode = (node: KnowledgeGraphNode) => {
    const isExpired = new Date(node.expiresAt) < new Date();

    return (
      <Card
        key={node.id}
        style={[styles.nodeCard, isExpired && styles.expiredCard]}
      >
        <View style={styles.nodeHeader}>
          <View
            style={[
              styles.nodeTypeBadge,
              {
                backgroundColor:
                  node.type === 'pattern'
                    ? colors.primary[500] + '15'
                    : node.type === 'preference'
                    ? colors.semantic.info + '15'
                    : node.type === 'ritual'
                    ? colors.semantic.warning + '15'
                    : colors.semantic.success + '15',
                borderColor: 
                   node.type === 'pattern'
                    ? colors.primary[500] + '30'
                    : node.type === 'preference'
                    ? colors.semantic.info + '30'
                    : node.type === 'ritual'
                    ? colors.semantic.warning + '30'
                    : colors.semantic.success + '30',
                borderWidth: 1,
              },
            ]}
          >
            <Ionicons 
                name={getNodeIcon(node.type)} 
                size={12} 
                color={
                    node.type === 'pattern'
                      ? colors.primary[500]
                      : node.type === 'preference'
                      ? colors.semantic.info
                      : node.type === 'ritual'
                      ? colors.semantic.warning
                      : colors.semantic.success
                }
                style={{ marginRight: spacing[1] }}
            />
            <Text
              style={[
                styles.nodeTypeText,
                {
                  color:
                    node.type === 'pattern'
                      ? colors.primary[500]
                      : node.type === 'preference'
                      ? colors.semantic.info
                      : node.type === 'ritual'
                      ? colors.semantic.warning
                      : colors.semantic.success,
                },
              ]}
            >
              {node.type.toUpperCase()}
            </Text>
          </View>
          {isExpired && (
            <View style={styles.expiredBadge}>
                <Ionicons name="alert-circle-outline" size={12} color={colors.semantic.error} style={{ marginRight: spacing[1] }}/>
                <Text style={styles.expiredLabel}>EXPIRED</Text>
            </View>
          )}
        </View>

        <Text style={styles.nodeLabel}>{node.label}</Text>
        <Text style={styles.nodeDescription}>{node.description}</Text>

        <View style={styles.divider} />

        <View style={styles.nodeMetaContainer}>
            <View style={styles.nodeMeta}>
                <Ionicons name="calendar-outline" size={12} color={colors.textTertiary} style={{ marginRight: spacing[1] }}/>
                <Text style={styles.nodeMetaText}>
                    Created: {format(node.createdAt, 'MMM d, yyyy')}
                </Text>
            </View>
            <View style={styles.nodeMeta}>
                <Ionicons name="hourglass-outline" size={12} color={colors.textTertiary} style={{ marginRight: spacing[1] }}/>
                <Text style={styles.nodeMetaText}>
                    Expires: {format(node.expiresAt, 'MMM d, yyyy')}
                </Text>
            </View>
        </View>

        {node.connections.length > 0 && (
          <View style={styles.connections}>
            <Ionicons name="git-merge-outline" size={14} color={colors.textSecondary} style={{ marginRight: spacing[1.5] }}/>
            <Text style={styles.connectionsLabel}>
              Connected to {node.connections.length} node(s)
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDeleteNode(node.id)}
        >
            <Ionicons name="trash-outline" size={16} color={colors.semantic.error} style={{ marginRight: spacing[1.5] }}/>
            <Text style={styles.deleteButtonText}>Remove Node</Text>
        </TouchableOpacity>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.navigationRow}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color={colors.text} />
                <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
        </View>
        <Text style={styles.title}>Knowledge Graph</Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>
            {filteredNodes.length === 0 ? (
            <View style={styles.emptyContainer}>
                <Ionicons name="cube-outline" size={64} color={colors.textTertiary} />
                <Text style={styles.emptyText}>No knowledge nodes found</Text>
                <Text style={styles.emptySubtext}>Your graph is currently empty.</Text>
            </View>
            ) : (
            filteredNodes.map(renderNode)
            )}
            
            {filteredNodes.length > 0 && (
                <View style={styles.footer}>
                    <Button
                    title="Clear All Nodes"
                    onPress={onClearAll}
                    variant="outline"
                    style={styles.clearButton}
                    textStyle={{ color: colors.semantic.error }}
                    />
                </View>
            )}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  navigationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  backText: {
    ...typography.textStyles.body,
    color: colors.text,
  },
  title: {
    ...typography.textStyles.h2,
    color: colors.text,
    marginBottom: spacing[2],
  },
  
  // Content
  contentContainer: {
    padding: spacing[4],
    gap: spacing[4], // Add gap for generous spacing between cards
  },
  nodeCard: {
    borderRadius: 16, // More rounded corners
    backgroundColor: isDark ? colors.surfaceElevated : '#fff',
    borderColor: colors.border,
    borderWidth: 1,
  },
  expiredCard: {
    opacity: 0.7,
    borderColor: colors.semantic.error + '40',
  },
  nodeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  nodeTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  nodeTypeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  expiredBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.semantic.error + '10',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
  },
  expiredLabel: {
    fontSize: 10,
    color: colors.semantic.error,
    fontWeight: '700',
  },
  nodeLabel: {
    ...typography.textStyles.h4,
    color: colors.text,
    marginBottom: spacing[1],
  },
  nodeDescription: {
    ...typography.textStyles.body,
    color: colors.textSecondary,
    marginBottom: spacing[3],
    lineHeight: 20,
  },
  divider: {
      height: 1,
      backgroundColor: colors.border,
      marginBottom: spacing[3],
  },
  nodeMetaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[3],
  },
  nodeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nodeMetaText: {
    ...typography.textStyles.caption,
    color: colors.textTertiary,
  },
  connections: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    backgroundColor: colors.surface, // Subtle contrast BG
    borderRadius: 8,
    marginBottom: spacing[3],
  },
  connectionsLabel: {
    ...typography.textStyles.caption,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  deleteButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[3],
    borderWidth: 1,
    borderColor: colors.neutral[300], // Softer border
    borderRadius: 12,
    backgroundColor: colors.neutral[100], // Softer background
  },
  deleteButtonText: {
    ...typography.textStyles.bodySmall,
    color: colors.textSecondary, // Softer text color
    fontWeight: typography.fontWeight.semibold,
  },
  emptyContainer: {
    padding: spacing[8],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
  },
  emptyText: {
    ...typography.textStyles.h4,
    color: colors.textSecondary,
    marginTop: spacing[4],
  },
  emptySubtext: {
      ...typography.textStyles.body,
      color: colors.textTertiary,
      textAlign: 'center',
      marginTop: spacing[2],
  },
  footer: {
    paddingTop: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing[2],
  },
  clearButton: {
    borderColor: colors.semantic.error,
  },
});

