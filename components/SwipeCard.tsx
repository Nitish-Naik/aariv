/**
 * Swipe Card Component for Action Queue
 */

import { format } from 'date-fns';
import React from 'react';
import { Animated, PanResponder, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { borderRadius, spacing, typography } from '../theme';
import type { ActionItem } from '../types';
import { PlatformIcon } from './PlatformIcon';

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
  const { colors } = useTheme();
  const styles = getStyles(colors);
  
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
      colors.surface,
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
          backgroundColor, // This uses the interpolated background color
        },
        style,
      ]}
      {...panResponder.panHandlers}
    >
      <View style={styles.header}>
        <PlatformIcon platform={action.platform} size={24} />
        <Text style={styles.platform}>{action.platform.toUpperCase()}</Text>
        <Text style={styles.time}>
          {format(action.proposedAt, 'MMM d, h:mm a')}
        </Text>
      </View>

      <Text style={styles.title}>{action.title}</Text>
      <Text style={styles.description}>{action.description}</Text>

      <View style={styles.footer}>
        <View style={[styles.badge, styles.badgePending]}>
          <Text style={styles.badgeText}>Pending Review</Text>
        </View>
        <Text style={styles.swipeHint}>Current Task</Text>
      </View>
      
      {/* Visual cues for swipe directions - only visible when dragging */}
      <Animated.View 
        style={[
          styles.overlay, 
          { 
            opacity: pan.x.interpolate({
              inputRange: [50, 150],
              outputRange: [0, 1],
              extrapolate: 'clamp',
            }),
            backgroundColor: colors.action.approve + '10', // Very light green
          }
        ]} 
      >
         <Text style={[styles.overlayText, { color: colors.action.approve }]}>APPROVE</Text>
      </Animated.View>

      <Animated.View 
        style={[
          styles.overlay, 
          { 
            opacity: pan.x.interpolate({
              inputRange: [-150, -50],
              outputRange: [1, 0],
              extrapolate: 'clamp',
            }),
            backgroundColor: colors.action.reject + '10', // Very light red
          }
        ]} 
      >
         <Text style={[styles.overlayText, { color: colors.action.reject, right: 20, left: undefined }]}>REJECT</Text>
      </Animated.View>
    </Animated.View>
  );
};

const getStyles = (colors: any) => StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing[5],
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 200,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  platform: {
    ...typography.textStyles.caption,
    fontWeight: 'bold',
    color: colors.textSecondary,
    marginLeft: spacing[2],
    flex: 1,
  },
  time: {
    ...typography.textStyles.caption,
    color: colors.textTertiary,
  },
  title: {
    ...typography.textStyles.h3,
    color: colors.text,
    marginBottom: spacing[2],
  },
  description: {
    ...typography.textStyles.body,
    color: colors.textSecondary,
    marginBottom: spacing[4],
    lineHeight: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  badge: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
  },
  badgePending: {
    backgroundColor: colors.action.pending + '20',
  },
  badgeText: {
    ...typography.textStyles.caption,
    fontWeight: 'bold',
    color: colors.action.pending,
  },
  swipeHint: {
    ...typography.textStyles.caption,
    color: colors.textTertiary,
    fontStyle: 'italic',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 20,
  },
  overlayText: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
    transform: [{ rotate: '-15deg' }],
  }
});
