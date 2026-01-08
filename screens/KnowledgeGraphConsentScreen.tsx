/**
 * Knowledge Graph Consent Screen - Consent for knowledge graph usage
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { colors, spacing, typography } from '../theme';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

interface KnowledgeGraphConsentScreenProps {
  onAccept: () => void;
  onDecline: () => void;
  onBack: () => void;
}

export const KnowledgeGraphConsentScreen: React.FC<KnowledgeGraphConsentScreenProps> = ({
  onAccept,
  onDecline,
  onBack,
}) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Knowledge Graph</Text>
        <Text style={styles.subtitle}>
          Help aariv learn your patterns and preferences
        </Text>
      </View>

      <Card style={styles.infoCard}>
        <Text style={styles.infoTitle}>What is the Knowledge Graph?</Text>
        <Text style={styles.infoText}>
          The Knowledge Graph is a privacy-first way for aariv to learn about your
          work patterns, preferences, and habits. It helps aariv provide better
          suggestions without storing raw messages or sensitive data.
        </Text>
      </Card>

      <Card style={styles.featuresCard}>
        <Text style={styles.featuresTitle}>What aariv learns:</Text>
        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <Text style={styles.featureBullet}>•</Text>
            <Text style={styles.featureText}>
              Your reply style and communication patterns
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureBullet}>•</Text>
            <Text style={styles.featureText}>
              How you prioritize tasks and manage time
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureBullet}>•</Text>
            <Text style={styles.featureText}>
              Your work rituals and daily cadence
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureBullet}>•</Text>
            <Text style={styles.featureText}>
              Preferences for scheduling and notifications
            </Text>
          </View>
        </View>
      </Card>

      <Card style={styles.privacyCard}>
        <Text style={styles.privacyTitle}>Privacy & Security</Text>
        <View style={styles.privacyList}>
          <View style={styles.privacyItem}>
            <Text style={styles.privacyBullet}>✓</Text>
            <Text style={styles.privacyText}>
              All data is encrypted in transit and at rest
            </Text>
          </View>
          <View style={styles.privacyItem}>
            <Text style={styles.privacyBullet}>✓</Text>
            <Text style={styles.privacyText}>
              Knowledge graph nodes have TTL (auto-forget)
            </Text>
          </View>
          <View style={styles.privacyItem}>
            <Text style={styles.privacyBullet}>✓</Text>
            <Text style={styles.privacyText}>
              Raw messages are never stored
            </Text>
          </View>
          <View style={styles.privacyItem}>
            <Text style={styles.privacyBullet}>✓</Text>
            <Text style={styles.privacyText}>
              You can view and delete your data anytime
            </Text>
          </View>
        </View>
      </Card>

      <View style={styles.actions}>
        <Button
          title="Decline"
          onPress={onDecline}
          variant="outline"
          style={styles.button}
        />
        <Button
          title="Accept & Enable"
          onPress={onAccept}
          style={styles.button}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  content: {
    padding: spacing[4],
  },
  header: {
    marginBottom: spacing[6],
  },
  title: {
    ...typography.textStyles.h2,
    color: colors.neutral[900],
    marginBottom: spacing[2],
  },
  subtitle: {
    ...typography.textStyles.body,
    color: colors.neutral[600],
  },
  infoCard: {
    marginBottom: spacing[4],
  },
  infoTitle: {
    ...typography.textStyles.h4,
    color: colors.neutral[900],
    marginBottom: spacing[3],
  },
  infoText: {
    ...typography.textStyles.body,
    color: colors.neutral[700],
    lineHeight: 24,
  },
  featuresCard: {
    marginBottom: spacing[4],
  },
  featuresTitle: {
    ...typography.textStyles.h4,
    color: colors.neutral[900],
    marginBottom: spacing[3],
  },
  featureList: {
  },
  featureItem: {
    flexDirection: 'row',
  },
  featureBullet: {
    ...typography.textStyles.body,
    color: colors.primary[500],
    fontWeight: typography.fontWeight.bold,
  },
  featureText: {
    ...typography.textStyles.body,
    color: colors.neutral[700],
    flex: 1,
  },
  privacyCard: {
    marginBottom: spacing[6],
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[200],
  },
  privacyTitle: {
    ...typography.textStyles.h4,
    color: colors.neutral[900],
    marginBottom: spacing[3],
  },
  privacyList: {
  },
  privacyItem: {
    flexDirection: 'row',
  },
  privacyBullet: {
    ...typography.textStyles.body,
    color: colors.primary[500],
    fontWeight: typography.fontWeight.bold,
  },
  privacyText: {
    ...typography.textStyles.body,
    color: colors.neutral[700],
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    marginBottom: spacing[4],
  },
  button: {
    flex: 1,
  },
});

