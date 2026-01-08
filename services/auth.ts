/**
 * Authentication service - Mock implementation for UI review
 * TODO: Replace with actual Google Sign-In when backend is ready
 */

import { storeUserData } from '../utils/storage';
import type { User } from '../types';

export interface AuthResult {
  user: User;
  idToken: string;
  accessToken: string;
}

/**
 * Mock sign in - for UI review only
 */
export async function signInWithGoogle(): Promise<AuthResult> {
  // Simulate a delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const mockUser: User = {
    id: 'mock-user-123',
    email: 'demo@aariv.app',
    name: 'Demo User',
    avatar: undefined,
    googleId: 'mock-google-id',
  };

  // Store mock user data
  await storeUserData('user', mockUser);

  return {
    user: mockUser,
    idToken: 'mock-id-token',
    accessToken: 'mock-access-token',
  };
}

/**
 * Mock sign out
 */
export async function signOut(): Promise<void> {
  await storeUserData('user', null);
}

/**
 * Get current user - returns mock user for UI review
 */
export async function getCurrentUser(): Promise<User | null> {
  // Return mock user for UI review
  return {
    id: 'mock-user-123',
    email: 'demo@aariv.app',
    name: 'Demo User',
    avatar: undefined,
    googleId: 'mock-google-id',
  };
}

/**
 * Check if user is signed in - always returns true for UI review
 */
export async function isSignedIn(): Promise<boolean> {
  // Always return true for UI review
  return true;
}

