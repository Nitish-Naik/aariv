import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import React, { useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useTheme } from '../context/ThemeContext';
import { spacing, typography } from '../theme';
import type { KnowledgeGraphNode } from '../types';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface KnowledgeGraphViewerScreenProps {
  nodes: KnowledgeGraphNode[];
  onDeleteNode: (nodeId: string) => void;
  onClearAll: () => void;
  onBack: () => void;
  onVisualize?: () => void;
}

export const KnowledgeGraphViewerScreen: React.FC<KnowledgeGraphViewerScreenProps> = ({
  nodes,
  onDeleteNode,
  onClearAll,
  onBack,
  onVisualize,
}) => {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const [filter, setFilter] = useState<'all' | KnowledgeGraphNode['type']>('all');

  const handleFilterChange = (newFilter: 'all' | KnowledgeGraphNode['type']) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFilter(newFilter);
  };

  const filteredNodes =
    filter === 'all'
      ? nodes
      : nodes.filter(node => node.type === filter);

  const nodeTypeCounts = {
    pattern: nodes.filter(n => n.type === 'pattern').length,
    preference: nodes.filter(n => n.type === 'preference').length,
    ritual: nodes.filter(n => n.type === 'ritual').length,
    cadence: nodes.filter(n => n.type === 'cadence').length,
  };

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
                style={{ marginRight: 4 }}
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
                <Ionicons name="alert-circle-outline" size={12} color={colors.semantic.error} style={{ marginRight: 4 }}/>
                <Text style={styles.expiredLabel}>EXPIRED</Text>
            </View>
          )}
        </View>

        <Text style={styles.nodeLabel}>{node.label}</Text>
        <Text style={styles.nodeDescription}>{node.description}</Text>

        <View style={styles.divider} />

        <View style={styles.nodeMetaContainer}>
            <View style={styles.nodeMeta}>
                <Ionicons name="calendar-outline" size={12} color={colors.textTertiary} style={{ marginRight: 4 }}/>
                <Text style={styles.nodeMetaText}>
                    Created: {format(node.createdAt, 'MMM d, yyyy')}
                </Text>
            </View>
            <View style={styles.nodeMeta}>
                <Ionicons name="hourglass-outline" size={12} color={colors.textTertiary} style={{ marginRight: 4 }}/>
                <Text style={styles.nodeMetaText}>
                    Expires: {format(node.expiresAt, 'MMM d, yyyy')}
                </Text>
            </View>
        </View>

        {node.connections.length > 0 && (
          <View style={styles.connections}>
            <Ionicons name="git-merge-outline" size={14} color={colors.textSecondary} style={{ marginRight: 6 }}/>
            <Text style={styles.connectionsLabel}>
              Connected to {node.connections.length} node(s)
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDeleteNode(node.id)}
        >
            <Ionicons name="trash-outline" size={16} color={colors.semantic.error} style={{ marginRight: 6 }}/>
            <Text style={styles.deleteButtonText}>Remove Node</Text>
        </TouchableOpacity>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
           <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Knowledge Graph</Text>
        {onVisualize ? (
            <TouchableOpacity onPress={onVisualize} style={styles.backButton}>
                 <Ionicons name="git-network-outline" size={24} color={colors.primary[500]} />
            </TouchableOpacity>
        ) : (
            <View style={{ width: 24 }} />
        )}
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[1]} // Make filters sticky
      >
        <View style={styles.statsContainer}>
            <Card style={styles.statsCard}>
            <View style={styles.statHeader}>
                <Ionicons name="analytics" size={20} color={colors.primary[500]} />
                <Text style={styles.statTitle}>Graph Insights</Text>
            </View>
            <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{nodes.length}</Text>
                    <Text style={styles.statLabel}>Total Nodes</Text>
                </View>
                <View style={styles.verticalDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{nodeTypeCounts.pattern}</Text>
                    <Text style={styles.statLabel}>Patterns</Text>
                </View>
                <View style={styles.verticalDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{nodeTypeCounts.preference}</Text>
                    <Text style={styles.statLabel}>Prefs</Text>
                </View>
            </View>
            </Card>
        </View>

        <View style={styles.filtersContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
                <TouchableOpacity
                style={[
                    styles.filterButton,
                    filter === 'all' && styles.filterButtonActive,
                ]}
                onPress={() => handleFilterChange('all')}
                >
                <Text
                    style={[
                    styles.filterText,
                    filter === 'all' && styles.filterTextActive,
                    ]}
                >
                    All Nodes
                </Text>
                </TouchableOpacity>
                {(['pattern', 'preference', 'ritual', 'cadence'] as const).map(
                (type) => (
                    <TouchableOpacity
                    key={type}
                    style={[
                        styles.filterButton,
                        filter === type && styles.filterButtonActive,
                    ]}
                    onPress={() => handleFilterChange(type)}
                    >
                    <Ionicons 
                        name={getNodeIcon(type)} 
                        size={14} 
                        color={filter === type ? '#FFF' : colors.textSecondary} 
                        style={{ marginRight: 6 }}
                    />
                    <Text
                        style={[
                        styles.filterText,
                        filter === type && styles.filterTextActive,
                        ]}
                    >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                    </TouchableOpacity>
                )
                )}
            </ScrollView>
        </View>

        <View style={styles.contentContainer}>
            {filteredNodes.length === 0 ? (
            <View style={styles.emptyContainer}>
                <Ionicons name="cube-outline" size={64} color={colors.textTertiary} />
                <Text style={styles.emptyText}>No knowledge nodes found</Text>
                <Text style={styles.emptySubtext}>Your graph is currently empty for this category.</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background, // Ensure header is opaque
  },
  backButton: {
    padding: 4,
  },
  title: {
    ...typography.textStyles.h3,
    color: colors.text,
  },
  statsContainer: {
    padding: spacing[4],
  },
  statsCard: {
    padding: spacing[4],
    backgroundColor: isDark ? colors.surfaceElevated : '#fff',
    borderColor: colors.border,
    borderWidth: 1,
  },
  statHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing[4],
      gap: 8,
  },
  statTitle: {
      ...typography.textStyles.h4,
      color: colors.text,
  },
  statsGrid: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
  },
  statItem: {
      alignItems: 'center',
  },
  verticalDivider: {
      width: 1,
      height: 24,
      backgroundColor: colors.border,
  },
  statLabel: {
    ...typography.textStyles.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statValue: {
    ...typography.textStyles.h3,
    color: colors.primary[500],
  },
  
  // Filters
  filtersContainer: {
    backgroundColor: colors.background,
    paddingVertical: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filtersScroll: {
    paddingHorizontal: spacing[4],
    gap: spacing[2],
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterButtonActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  filterText: {
    ...typography.textStyles.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },

  // Content
  contentContainer: {
    padding: spacing[4],
  },
  nodeCard: {
    marginBottom: spacing[4],
    backgroundColor: isDark ? colors.surfaceElevated : '#fff',
    borderColor: colors.border,
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
    borderColor: colors.semantic.error + '30',
    borderRadius: 12,
    backgroundColor: colors.semantic.error + '05',
  },
  deleteButtonText: {
    ...typography.textStyles.bodySmall,
    color: colors.semantic.error,
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

