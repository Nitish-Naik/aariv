import { useRouter } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Card } from '../../components/Card';

export default function HomeTab() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome to Aariv</Text>
        <Text style={styles.subtitle}>
          Your AI-powered productivity assistant
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction}>
            <Card style={styles.quickActionCard}>
              <Text style={styles.quickActionTitle}>Review Queue</Text>
              <Text style={styles.quickActionCount}>0</Text>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => router.push('/(tabs)/calendar')}
          >
            <Card style={styles.quickActionCard}>
              <Text style={styles.quickActionTitle}>Calendar</Text>
              <Text style={styles.quickActionSubtitle}>View schedule</Text>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => router.push('/(tabs)/inbox')}
          >
            <Card style={styles.quickActionCard}>
              <Text style={styles.quickActionTitle}>Inbox</Text>
              <Text style={styles.quickActionSubtitle}>Messages</Text>
            </Card>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Getting Started</Text>
        <Card>
          <Text style={styles.cardText}>
            Connect your platforms to start managing your workflow with AI assistance.
          </Text>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => router.push('/(tabs)/settings')}
          >
            <Text style={styles.buttonText}>Go to Settings</Text>
          </TouchableOpacity>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickAction: {
    flex: 1,
  },
  quickActionCard: {
    padding: 16,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  quickActionCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  cardText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
