/**
 * Knowledge Graph Viewer Screen - View and manage knowledge graph
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { colors, spacing, typography } from '../theme';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import type { KnowledgeGraphNode } from '../types';
import { format } from 'date-fns';

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
  const [filter, setFilter] = useState<'all' | KnowledgeGraphNode['type']>('all');

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
                    ? colors.primary[500] + '20'
                    : node.type === 'preference'
                    ? colors.semantic.info + '20'
                    : node.type === 'ritual'
                    ? colors.semantic.warning + '20'
                    : colors.semantic.success + '20',
              },
            ]}
          >
            <Text
              style={[
                styles.nodeTypeText,
                {
                  color:
                    node.type === 'pattern'
                      ? colors.primary[700]
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
            <Text style={styles.expiredLabel}>EXPIRED</Text>
          )}
        </View>

        <Text style={styles.nodeLabel}>{node.label}</Text>
        <Text style={styles.nodeDescription}>{node.description}</Text>

        <View style={styles.nodeMeta}>
          <Text style={styles.nodeMetaText}>
            Created: {format(node.createdAt, 'MMM d, yyyy')}
          </Text>
          <Text style={styles.nodeMetaText}>
            Expires: {format(node.expiresAt, 'MMM d, yyyy')}
          </Text>
        </View>

        {node.connections.length > 0 && (
          <View style={styles.connections}>
            <Text style={styles.connectionsLabel}>
              Connected to {node.connections.length} node(s)
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDeleteNode(node.id)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Knowledge Graph</Text>
      </View>

      <View style={styles.stats}>
        <Card style={styles.statsCard}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Nodes:</Text>
            <Text style={styles.statValue}>{nodes.length}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Patterns:</Text>
            <Text style={styles.statValue}>{nodeTypeCounts.pattern}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Preferences:</Text>
            <Text style={styles.statValue}>{nodeTypeCounts.preference}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Rituals:</Text>
            <Text style={styles.statValue}>{nodeTypeCounts.ritual}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Cadence:</Text>
            <Text style={styles.statValue}>{nodeTypeCounts.cadence}</Text>
          </View>
        </Card>
      </View>

      <View style={styles.filters}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'all' && styles.filterButtonActive,
          ]}
          onPress={() => setFilter('all')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'all' && styles.filterTextActive,
            ]}
          >
            All
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
              onPress={() => setFilter(type)}
            >
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
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {filteredNodes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No nodes found</Text>
          </View>
        ) : (
          filteredNodes.map(renderNode)
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Clear All Nodes"
          onPress={onClearAll}
          variant="outline"
          style={styles.clearButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  header: {
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  backButton: {
    marginBottom: spacing[2],
  },
  backButtonText: {
    ...typography.textStyles.body,
    color: colors.primary[500],
  },
  title: {
    ...typography.textStyles.h2,
    color: colors.neutral[900],
  },
  stats: {
    padding: spacing[4],
  },
  statsCard: {
    padding: spacing[4],
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  statLabel: {
    ...typography.textStyles.body,
    color: colors.neutral[600],
  },
  statValue: {
    ...typography.textStyles.body,
    color: colors.neutral[900],
    fontWeight: typography.fontWeight.semibold,
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[4],
  },
  filterButton: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: 8,
    backgroundColor: colors.light.surface,
  },
  filterButtonActive: {
    backgroundColor: colors.primary[500],
  },
  filterText: {
    ...typography.textStyles.bodySmall,
    color: colors.neutral[600],
  },
  filterTextActive: {
    color: colors.light.text,
    fontWeight: typography.fontWeight.semibold,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing[4],
  },
  nodeCard: {
    marginBottom: spacing[4],
  },
  expiredCard: {
    opacity: 0.6,
  },
  nodeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  nodeTypeBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: 4,
  },
  nodeTypeText: {
    ...typography.textStyles.caption,
    fontWeight: typography.fontWeight.semibold,
  },
  expiredLabel: {
    ...typography.textStyles.caption,
    color: colors.semantic.error,
    fontWeight: typography.fontWeight.semibold,
  },
  nodeLabel: {
    ...typography.textStyles.h4,
    color: colors.neutral[900],
    marginBottom: spacing[2],
  },
  nodeDescription: {
    ...typography.textStyles.body,
    color: colors.neutral[700],
    marginBottom: spacing[3],
  },
  nodeMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  nodeMetaText: {
    ...typography.textStyles.caption,
    color: colors.neutral[500],
  },
  connections: {
    marginTop: spacing[2],
    paddingTop: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
  },
  connectionsLabel: {
    ...typography.textStyles.caption,
    color: colors.neutral[600],
  },
  deleteButton: {
    marginTop: spacing[3],
    padding: spacing[2],
    alignItems: 'center',
  },
  deleteButtonText: {
    ...typography.textStyles.bodySmall,
    color: colors.semantic.error,
    fontWeight: typography.fontWeight.semibold,
  },
  emptyContainer: {
    padding: spacing[8],
    alignItems: 'center',
  },
  emptyText: {
    ...typography.textStyles.body,
    color: colors.neutral[500],
  },
  footer: {
    padding: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
  },
  clearButton: {
    borderColor: colors.semantic.error,
  },
});

