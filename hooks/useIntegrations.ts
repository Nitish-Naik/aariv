import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { Alert } from 'react-native';

// This would typically be a more robust API client
const api = {
  get: async (path: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    const headers = { 'Authorization': `Bearer ${session?.access_token}` };
    const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}${path}`, { headers });
    if (!res.ok) throw new Error('Network response was not ok');
    return res.json();
  },
  post: async (path: string, body: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    const headers = { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token}` 
    };
    const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Network response was not ok');
    }
    return res.json();
  },
  delete: async (path: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    const headers = { 'Authorization': `Bearer ${session?.access_token}` };
    await fetch(`${process.env.EXPO_PUBLIC_API_URL}${path}`, { method: 'DELETE', headers });
  }
};


export interface Integration {
  id: string;
  appName: string;
  status: 'ACTIVE' | 'INACTIVE';
  connectedAt: string;
  email: string | null;
  label: string;
}

export function useIntegrations(userId?: string) {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIntegrations = useCallback(async (): Promise<Integration[] | undefined> => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await api.get(`/integrations?userId=${userId}`);
      const fetched = data.integrations || [];
      setIntegrations(fetched);
      return fetched;
    } catch (error) {
      console.error('Failed to fetch integrations', error);
      Alert.alert('Error', 'Failed to fetch integrations.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const connectIntegration = async (appName: string) => {
    if (!userId) return;
    try {
      const { url } = await api.post('/integrations/connect', { userId, appName });
      return url;
    } catch (error: any) {
      console.error(`Failed to connect ${appName}`, error);
      Alert.alert('Error', error.message || `Failed to connect ${appName}.`);
    }
  };

  const disconnectIntegration = async (connectionId: string) => {
    if (!userId) return;
    try {
      await api.post('/integrations/disconnect', { userId, connectionId });
      await fetchIntegrations(); // Refresh list after disconnecting
    } catch (error) {
      console.error(`Failed to disconnect integration`, error);
      Alert.alert('Error', 'Failed to disconnect integration.');
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  return { 
    integrations, 
    loading, 
    refetch: fetchIntegrations,
    connectIntegration, 
    disconnectIntegration 
  };
}