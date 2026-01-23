// Knowledge Graph Consent Utility
// Manages user consent for knowledge graph feature

import AsyncStorage from '@react-native-async-storage/async-storage';

const KG_CONSENT_KEY = '@aariv_kg_consent';

export interface KGConsent {
    accepted: boolean;
    timestamp?: string;
}

/**
 * Check if user has accepted knowledge graph consent
 */
export const hasKGConsent = async (): Promise<boolean> => {
    try {
        const consent = await AsyncStorage.getItem(KG_CONSENT_KEY);
        if (!consent) return false;

        const parsed: KGConsent = JSON.parse(consent);
        return parsed.accepted === true;
    } catch (e) {
        console.error('Error checking KG consent:', e);
        return false;
    }
};

/**
 * Set knowledge graph consent
 */
export const setKGConsent = async (accepted: boolean): Promise<void> => {
    try {
        const consent: KGConsent = {
            accepted,
            timestamp: new Date().toISOString(),
        };
        await AsyncStorage.setItem(KG_CONSENT_KEY, JSON.stringify(consent));
    } catch (e) {
        console.error('Error setting KG consent:', e);
    }
};

/**
 * Get full consent object
 */
export const getKGConsent = async (): Promise<KGConsent | null> => {
    try {
        const consent = await AsyncStorage.getItem(KG_CONSENT_KEY);
        if (!consent) return null;
        return JSON.parse(consent);
    } catch (e) {
        console.error('Error getting KG consent:', e);
        return null;
    }
};

/**
 * Clear consent (for testing or user reset)
 */
export const clearKGConsent = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(KG_CONSENT_KEY);
    } catch (e) {
        console.error('Error clearing KG consent:', e);
    }
};
