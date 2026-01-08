/**
 * Swipe Card Component for Action Queue
 */

import React from 'react';
import { View, Text, StyleSheet, Animated, PanResponder } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../theme';
import type { ActionItem } from '../types';
import { format } from 'date-fns';

interface SwipeCardProps {
  action: ActionItem;
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
  style?: any;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({
  action,
  onSwipeRight,
  onSwipeLeft,
  style,
}) => {
  const pan = React.useRef(new Animated.ValueXY()).current;

  const panResponder = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gestureState) => {
        const swipeThreshold = 100;
        
        if (gestureState.dx > swipeThreshold) {
          // Swipe right - approve
          Animated.spring(pan, {
            toValue: { x: 500, y: 0 },
            useNativeDriver: false,
          }).start(() => {
            onSwipeRight();
            pan.setValue({ x: 0, y: 0 });
          });
        } else if (gestureState.dx < -swipeThreshold) {
          // Swipe left - reject
          Animated.spring(pan, {
            toValue: { x: -500, y: 0 },
            useNativeDriver: false,
          }).start(() => {
            onSwipeLeft();
            pan.setValue({ x: 0, y: 0 });
          });
        } else {
          // Return to center
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const rotate = pan.x.interpolate({
    inputRange: [-200, 0, 200],
    outputRange: ['-10deg', '0deg', '10deg'],
  });

  const backgroundColor = pan.x.interpolate({
    inputRange: [-200, 0, 200],
    outputRange: [
      colors.action.reject + '20',
      colors.light.surface,
      colors.action.approve + '20',
    ],
  });

  return (
    <Animated.View
      style={[
        styles.card,
        {
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
            { rotate },
          ],
          backgroundColor,
        },
        style,
      ]}
      {...panResponder.panHandlers}
    >
      <View style={styles.header}>
        <Text style={styles.platform}>{action.platform.toUpperCase()}</Text>
        <Text style={styles.time}>
          {format(action.proposedAt, 'MMM d, h:mm a')}
        </Text>
      </View>
      
      <Text style={styles.title}>{action.title}</Text>
      <Text style={styles.description}>{action.description}</Text>
      
      <View style={styles.footer}>
        <View style={[styles.hint, styles.rejectHint]}>
          <Text style={styles.hintText}>← Reject</Text>
        </View>
        <View style={[styles.hint, styles.approveHint]}>
          <Text style={styles.hintText}>Approve →</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '90%',
    minHeight: 200,
    borderRadius: borderRadius.xl,
    padding: spacing[5],
    marginVertical: spacing[2],
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  platform: {
    ...typography.textStyles.caption,
    color: colors.primary[500],
    fontWeight: typography.fontWeight.semibold,
  },
  time: {
    ...typography.textStyles.caption,
    color: colors.neutral[500],
  },
  title: {
    ...typography.textStyles.h4,
    color: colors.neutral[900],
    marginBottom: spacing[2],
  },
  description: {
    ...typography.textStyles.body,
    color: colors.neutral[600],
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing[4],
  },
  hint: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.md,
  },
  rejectHint: {
    backgroundColor: colors.action.reject + '20',
  },
  approveHint: {
    backgroundColor: colors.action.approve + '20',
  },
  hintText: {
    ...typography.textStyles.caption,
    color: colors.neutral[600],
  },
});

