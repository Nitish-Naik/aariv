import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SwipeCard } from '../components/SwipeCard';
import { useTheme } from '../context/ThemeContext';
import { spacing, typography } from '../theme';
import { MOCK_ACTIONS } from '../utils/mockData';

export default function ZenModeScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  
  const [actions, setActions] = useState(MOCK_ACTIONS);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSwipe = (direction: 'left' | 'right') => {
    // In a real app, we would perform an API call here (approve/reject)
    // For now, we just move to the next item
    setTimeout(() => {
        setActions((prev) => prev.filter((_, i) => i !== currentIndex));
        // Reset index isn't strictly necessary since we filter, but if we were keeping array
        // and moving index, we would. Here we remove the item at index 0 effectively.
        // Actually, since we remove it, the next item becomes index 0.
        // But wait, `currentIndex` state is used? No, let's just use the first item in the array.
    }, 200);
  };
  
  // We always render the first item in the array
  const currentAction = actions[0];

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
            <Ionicons name="checkmark-circle" size={64} color={colors.semantic.success} />
        </View>
        <Text style={styles.emptyTitle}>All Caught Up</Text>
        <Text style={styles.emptySubtitle}>You've reviewed all pending items for today.</Text>
        
        <View style={styles.statsContainer}>
            <View style={styles.statItem}>
                <Text style={styles.statValue}>12</Text>
                <Text style={styles.statLabel}>Approved</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
                <Text style={styles.statValue}>5</Text>
                <Text style={styles.statLabel}>Deferred</Text>
            </View>
        </View>

        <View style={styles.closeButtonContainer}>
            <Text onPress={() => router.back()} style={styles.closeButtonText}>Return/Home</Text>
        </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
            <Ionicons onPress={() => router.back()} name="close" size={28} color={colors.textSecondary} />
        </View>
        <Text style={styles.headerTitle}>Review Queue</Text>
        <View style={styles.headerRight}>
            <Text style={styles.counter}>{actions.length} left</Text>
        </View>
      </View>

      <View style={styles.content}>
        {actions.length > 0 && currentAction ? (
           <View style={styles.cardContainer}>
             {/* Background cards for stack effect */}
             {actions.length > 1 && (
                 <View style={[styles.stackCard, styles.stackCard2]} />
             )}
             {actions.length > 2 && (
                 <View style={[styles.stackCard, styles.stackCard3]} />
             )}
             
             <SwipeCard 
                key={currentAction.id} // Key is important for animation reset when component replaces
                action={currentAction}
                onSwipeLeft={() => handleSwipe('left')}
                onSwipeRight={() => handleSwipe('right')}
                style={styles.mainCard}
             />
           </View>
        ) : (
            renderEmptyState()
        )}
      </View>
      
      {actions.length > 0 && (
          <View style={styles.footer}>
              <Text style={styles.instruction}>Swipe right to approve, left to defer</Text>
          </View>
      )}

    </SafeAreaView>
  );
}

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[4],
  },
  headerLeft: {
      width: 40,
  },
  headerRight: {
      width: 40,
      alignItems: 'flex-end',
  },
  headerTitle: {
      ...typography.textStyles.body,
      fontWeight: '600',
      color: colors.text,
  },
  counter: {
      ...typography.textStyles.caption,
      color: colors.textTertiary,
  },
  content: {
    flex: 1,
    padding: spacing[6],
    justifyContent: 'center',
  },
  cardContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      maxHeight: 500, // Limit card height impact
  },
  mainCard: {
      width: '100%',
      // height is determined by content, but we could enforce it if needed
      zIndex: 10,
  },
  stackCard: {
      position: 'absolute',
      width: '95%',
      height: '100%', // Match main card roughly
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
  },
  stackCard2: {
      top: 10,
      width: '92%',
      zIndex: 5,
      opacity: 0.5,
      transform: [{ scale: 0.95 }],
  },
  stackCard3: {
      top: 20,
      width: '88%',
      zIndex: 1,
      opacity: 0.3,
      transform: [{ scale: 0.9 }],
  },
  footer: {
      padding: spacing[6],
      alignItems: 'center',
  },
  instruction: {
      color: colors.textTertiary,
      fontSize: 14,
  },
  
  // Empty State
  emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
  },
  emptyIconContainer: {
      marginBottom: spacing[6],
      transform: [{ scale: 1.2 }],
  },
  emptyTitle: {
      ...typography.textStyles.h2,
      color: colors.text,
      marginBottom: spacing[2],
  },
  emptySubtitle: {
      ...typography.textStyles.body,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: spacing[8],
      maxWidth: 250,
  },
  statsContainer: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: spacing[4],
      marginBottom: spacing[8],
      borderWidth: 1,
      borderColor: colors.border,
  },
  statItem: {
      alignItems: 'center',
      paddingHorizontal: spacing[6],
  },
  statValue: {
      ...typography.textStyles.h3,
      color: colors.text,
  },
  statLabel: {
      ...typography.textStyles.caption,
      color: colors.textSecondary,
      marginTop: 2,
  },
  statDivider: {
      width: 1,
      backgroundColor: colors.border,
  },
  closeButtonContainer: {
      marginTop: spacing[4],
  },
  closeButtonText: {
      color: colors.primary[500],
      fontSize: 16,
      fontWeight: '600',
  }

});
