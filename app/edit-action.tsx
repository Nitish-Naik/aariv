import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { EditActionScreen } from '../screens/EditActionScreen';

export default function EditActionRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ 
      title?: string;
      description?: string; 
      platform?: string;
      id?: string;
  }>();

  const handleSave = (title: string, description: string) => {
    // In a real app, this would mutate the store/backend
    console.log('Saved:', { id: params.id, title, description });
    router.back();
  };

  return (
    <EditActionScreen 
        initialTitle={params.title}
        initialDescription={params.description}
        platform={params.platform}
        onSave={handleSave}
        onCancel={() => router.back()}
    />
  );
}
