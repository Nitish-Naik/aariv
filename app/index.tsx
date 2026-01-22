import { useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { isSignedIn } from '../services/auth';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const signedIn = await isSignedIn();
        const isOnLogin = segments[0] === 'login';
        if (signedIn) {
          router.replace('/(tabs)');
        } else if (!isOnLogin) {
          router.replace('/login');
        }
      } catch {
        if (segments[0] !== 'login') {
          router.replace('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return null;
}
