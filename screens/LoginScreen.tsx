/**
 * Login Screen - Google Sign-In
 */

import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { useTheme } from '../context/ThemeContext';
import { signInWithGoogle } from '../services/auth';
import { spacing, typography } from '../theme';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

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
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
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
    </SafeAreaView>
  );
};

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
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
    fontSize: 40,
    color: colors.text,
    marginBottom: spacing[3],
  },
  subtitle: {
    ...typography.textStyles.body,
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  description: {
    marginBottom: spacing[8],
    paddingHorizontal: spacing[4],
  },
  descriptionText: {
    ...typography.textStyles.body,
    color: colors.textSecondary,
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
    color: colors.textTertiary,
    textAlign: 'center',
  },
});

