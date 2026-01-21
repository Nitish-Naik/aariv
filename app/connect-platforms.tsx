// app/connect-platforms.tsx
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation, useRouter } from 'expo-router'; // Added useNavigation
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Linking, View } from 'react-native';
import { ConnectPlatformsScreen } from '../screens/ConnectPlatformsScreen';
import { api } from '../services/api';
import { getCurrentUser } from '../services/auth';
import type { Platform, PlatformConnection } from '../types';
// List of supported platforms in our UI
const SUPPORTED_PLATFORMS: { id: Platform; name: string; icon: string }[] = [
  { id: 'gmail', name: 'Gmail', icon: 'logo-google' },
  { id: 'google-calendar', name: 'Google Calendar', icon: 'calendar' },
  { id: 'slack', name: 'Slack', icon: 'logo-slack' },
  { id: 'github', name: 'GitHub', icon: 'logo-github' },
  { id: 'linear', name: 'Linear', icon: 'list' },
  { id: 'notion', name: 'Notion', icon: 'document-text' },
];

export default function ConnectPlatformsRoute() {
  const router = useRouter();
  const navigation = useNavigation(); // Hook for navigation history
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState<PlatformConnection[]>([]);
  const [userId, setUserId] = useState<string | null>(null);



  const fetchConnections = useCallback(async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setUserId(user.id);

      // 1. Get integrations from backend
      // Backend returns: { integrations: [{ appName: 'gmail', status: 'ACTIVE' }] }
      const response = await api.get(`/integrations?userId=${user.id}`);
      const activeIntegrations = response.integrations || [];

      // 2. Map to UI model
      const mappedConnections: PlatformConnection[] = SUPPORTED_PLATFORMS.map(p => {
        const found = activeIntegrations.find((i: any) => {
          const backendName = (i.appName || '').toLowerCase();
          const uiId = p.id.toLowerCase();

          // Handle google-calendar vs google_calendar mismatch
          if (uiId === 'google-calendar' && backendName === 'google_calendar') return true;

          return backendName === uiId;
        });

        const status = (found?.status || '').toUpperCase();
        const isConnected = found && (status === 'ACTIVE' || status === 'CONNECTED');

        return {
          id: found?.id || `local-${p.id}`,
          platform: p.id,
          name: p.name,
          icon: p.icon,
          connected: !!isConnected,
          connectedAt: found?.connectedAt ? new Date(found.connectedAt) : undefined,
          permissions: []
        };
      });

      setConnections(mappedConnections);
    } catch (error) {
      console.error('Failed to load connections', error);
      Alert.alert('Error', 'Could not load integrations');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchConnections();
    }, [fetchConnections])
  );

  const handleConnect = async (platform: Platform) => {
    if (!userId) return;

    try {
      // 1. Call backend to initiate connection
      const response = await api.post('/integrations/connect', {
        userId,
        appName: platform // backend expects 'gmail', 'slack' etc.
      });

      if (response.url) {
        // 2. Open the redirect URL
        const supported = await Linking.canOpenURL(response.url);
        if (supported) {
          await Linking.openURL(response.url);
          // 3. Polling or manual refresh would happen on return
          // ideally we use WebBrowser.openAuthSessionAsync for better UX
        } else {
          Alert.alert("Error", "Can't open this URL: " + response.url);
        }
      } else {
        Alert.alert('Error', 'No connection URL returned');
      }
    } catch (error: any) {
      console.error('Connect failed:', error);
      Alert.alert('Connection Failed', error.message);
    }
  };

  const handleDisconnect = async (platform: Platform) => {
    if (!userId) return;
    try {
      await api.post('/integrations/disconnect', {
        userId,
        appName: platform
      });
      const platformName = SUPPORTED_PLATFORMS.find(p => p.id === platform)?.name || platform;
      Alert.alert('Success', `${platformName} disconnected`);
      // Refresh connections
      fetchConnections();
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to disconnect platform');
    }
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  if (loading && connections.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ConnectPlatformsScreen
      connections={connections}
      onConnect={handleConnect}
      onDisconnect={handleDisconnect}
      onBack={handleBack}
    />
  );
}
