/**
 * Review Queue Screen - Swipe to approve/reject actions
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SwipeCard } from '../components/SwipeCard';
import { colors, spacing, typography } from '../theme';
import type { ActionItem } from '../types';

const { width } = Dimensions.get('window');

interface ReviewQueueScreenProps {
  actions: ActionItem[];
  onApprove: (actionId: string) => void;
  onReject: (actionId: string) => void;
  onBack: () => void;
}

export const ReviewQueueScreen: React.FC<ReviewQueueScreenProps> = ({
  actions,
  onApprove,
  onReject,
  onBack,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const pendingActions = actions.filter(a => a.status === 'pending');

  const handleSwipeRight = (action: ActionItem) => {
    onApprove(action.id);
    setCurrentIndex(prev => Math.min(prev + 1, pendingActions.length - 1));
  };

  const handleSwipeLeft = (action: ActionItem) => {
    onReject(action.id);
    setCurrentIndex(prev => Math.min(prev + 1, pendingActions.length - 1));
  };

  if (pendingActions.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>All caught up!</Text>
          <Text style={styles.emptyText}>
            No actions waiting for approval. aariv will notify you when there are new suggestions.
          </Text>
        </View>
      </View>
    );
  }

  const currentAction = pendingActions[currentIndex];
  const remainingCount = pendingActions.length - currentIndex - 1;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Review Queue</Text>
        <Text style={styles.subtitle}>
          {remainingCount + 1} action{remainingCount !== 0 ? 's' : ''} remaining
        </Text>
      </View>

      <View style={styles.cardContainer}>
        {currentAction && (
          <SwipeCard
            action={currentAction}
            onSwipeRight={() => handleSwipeRight(currentAction)}
            onSwipeLeft={() => handleSwipeLeft(currentAction)}
            style={styles.card}
          />
        )}

        {/* Stack preview for next cards */}
        {remainingCount > 0 && (
          <View style={styles.stackContainer}>
            {[1, 2].map((offset) => {
              const nextAction = pendingActions[currentIndex + offset];
              if (!nextAction) return null;
              return (
                <View
                  key={nextAction.id}
                  style={[
                    styles.stackCard,
                    {
                      transform: [{ translateY: offset * 8 }],
                      opacity: 1 - offset * 0.3,
                      zIndex: -offset,
                    },
                  ]}
                />
              );
            })}
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Swipe right to approve • Swipe left to reject
        </Text>
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
  title: {
    ...typography.textStyles.h2,
    color: colors.neutral[900],
    marginBottom: spacing[1],
  },
  subtitle: {
    ...typography.textStyles.bodySmall,
    color: colors.neutral[600],
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[4],
  },
  card: {
    position: 'absolute',
  },
  stackContainer: {
    position: 'absolute',
    width: width * 0.9,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stackCard: {
    position: 'absolute',
    width: '100%',
    height: 200,
    backgroundColor: colors.light.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  footer: {
    padding: spacing[4],
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
  },
  footerText: {
    ...typography.textStyles.caption,
    color: colors.neutral[500],
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
  },
  emptyTitle: {
    ...typography.textStyles.h3,
    color: colors.neutral[900],
    marginBottom: spacing[3],
  },
  emptyText: {
    ...typography.textStyles.body,
    color: colors.neutral[600],
    textAlign: 'center',
    lineHeight: 24,
  },
});

