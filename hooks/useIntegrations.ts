import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export interface Integration {
    id: string;
    appName: string;
    status: string;
    connectedAt: string;
    email?: string;
}

export function useIntegrations() {
    const { user } = useAuth();
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchIntegrations = useCallback(async () => {
        if (!user) {
            setIsLoading(false);
            return;
        }

        try {
            setError(null);
            // Don't set loading to true on refetch to avoid flicker if we already have data
            // But initial load needs it. We handle this via initial state.

            const response = await api.get(`/integrations?userId=${user.id}`);
            if (response && response.integrations) {
                setIntegrations(response.integrations);
            }
        } catch (err: any) {
            console.error("Failed to load integrations", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    // Initial fetch
    useEffect(() => {
        fetchIntegrations();
    }, [fetchIntegrations]);

    const hasConnectedAccounts = useMemo(() => {
        return integrations.some(i => i.status === 'ACTIVE' || i.status === 'CONNECTED');
    }, [integrations]);

    // Central Guard: Recovery UI must only appear when NOT loading and NO accounts
    const shouldShowRecoveryState = !isLoading && !hasConnectedAccounts;

    return {
        integrations,
        isLoading,
        error,
        refetch: fetchIntegrations,
        hasConnectedAccounts,
        shouldShowRecoveryState
    };
}
