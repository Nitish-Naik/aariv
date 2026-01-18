import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert } from 'react-native';
import { EditActionScreen } from '../screens/EditActionScreen';
import { api } from '../services/api';
import { getCurrentUser } from '../services/auth';

export default function EditActionRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ 
      title?: string;
      description?: string; 
      platform?: string;
      id?: string;
  }>();

  const [loading, setLoading] = useState(false);

  const handleSave = async (title: string, description: string) => {
    setLoading(true);
    try {
        const user = await getCurrentUser();
        if (!user) {
             Alert.alert("Error", "User not logged in");
             setLoading(false);
             return;
        }

        const res = await api.post('/actions/execute', {
            userId: user.id,
            actionType: 'SAVE_DRAFT',
            actionData: {
                id: params.id,
                title: title,
                description: description,
                platform: params.platform,
            }
        });

        if (res.success || res.status === 'draft_created') {
            Alert.alert("Success", "Draft saved to Gmail.", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } else {
            Alert.alert("Error", "Failed to save draft: " + (res.message || "Unknown error"));
        }

    } catch (e: any) {
        Alert.alert("Error", e.message || "Failed to save");
    } finally {
        setLoading(false);
    }
  };

  return (
    <EditActionScreen 
        initialTitle={params.title}
        initialDescription={params.description}
        platform={params.platform}
        onSave={handleSave}
        onCancel={() => router.back()}
        isLoading={loading}
    />
  );
}
