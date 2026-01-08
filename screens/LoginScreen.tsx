/**
 * Login Screen - Google Sign-In
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Button } from '../components/Button';
import { colors, spacing, typography } from '../theme';
import { signInWithGoogle } from '../services/auth';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      // Mock sign in - just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 800));
      await signInWithGoogle();
      onLoginSuccess();
    } catch (error: any) {
      Alert.alert('Sign In Error', error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={styles.logo}>Aariv</Text>
        <Text style={styles.subtitle}>
          Your calm, wise, lovable personal copilot
        </Text>
      </View>

      <View style={styles.description}>
        <Text style={styles.descriptionText}>
          Aariv helps you stay focused by unifying context and delegating actions
          only with your approval. Privacy-first, distraction-free.
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Continue with Google"
          onPress={handleGoogleSignIn}
          loading={loading}
          size="large"
          style={styles.button}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          By continuing, you agree to our privacy policy
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  content: {
    flexGrow: 1,
    padding: spacing[6],
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  logo: {
    ...typography.textStyles.h1,
    color: colors.light.text,
    marginBottom: spacing[3],
  },
  subtitle: {
    ...typography.textStyles.body,
    color: colors.dark.textSecondary,
    textAlign: 'center',
  },
  description: {
    marginBottom: spacing[8],
    paddingHorizontal: spacing[4],
  },
  descriptionText: {
    ...typography.textStyles.body,
    color: colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    marginBottom: spacing[6],
  },
  button: {
    width: '100%',
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing[4],
  },
  footerText: {
    ...typography.textStyles.caption,
    color: colors.dark.textTertiary,
    textAlign: 'center',
  },
});

