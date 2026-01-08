/**
 * Secure storage utilities for tokens and sensitive data
 */

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

const TOKEN_PREFIX = 'token_';
const ENCRYPTED_PREFIX = 'encrypted_';

/**
 * Store encrypted token for a platform
 */
export async function storeEncryptedToken(
  platform: string,
  token: string
): Promise<void> {
  try {
    // In production, you'd use proper encryption
    // For now, using SecureStore which provides encryption at rest
    await SecureStore.setItemAsync(`${TOKEN_PREFIX}${platform}`, token);
  } catch (error) {
    console.error(`Error storing token for ${platform}:`, error);
    throw error;
  }
}

/**
 * Retrieve encrypted token for a platform
 */
export async function getEncryptedToken(platform: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(`${TOKEN_PREFIX}${platform}`);
  } catch (error) {
    console.error(`Error retrieving token for ${platform}:`, error);
    return null;
  }
}

/**
 * Remove token for a platform
 */
export async function removeToken(platform: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(`${TOKEN_PREFIX}${platform}`);
  } catch (error) {
    console.error(`Error removing token for ${platform}:`, error);
  }
}

/**
 * Store user data (non-sensitive)
 */
export async function storeUserData(key: string, value: any): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error storing user data ${key}:`, error);
  }
}

/**
 * Get user data
 */
export async function getUserData<T>(key: string): Promise<T | null> {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error(`Error getting user data ${key}:`, error);
    return null;
  }
}

/**
 * Clear all stored data
 */
export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.clear();
    // Note: SecureStore doesn't have a clear all method
    // You'd need to track and delete each item individually
  } catch (error) {
    console.error('Error clearing data:', error);
  }
}

/**
 * Generate encryption key (for future use)
 */
export async function generateKey(): Promise<string> {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${Date.now()}-${Math.random()}`
  );
}

