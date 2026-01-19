/**
 * Authentication service - Real implementation using backend
 */

import type { User } from "../types";
import { getUserData, storeUserData } from "../utils/storage";
import { api } from "./api";

export interface AuthResult {
  user: User;
  token: string;
}

/**
 * Sign in with Google ID Token (received from Frontend Google SDK)
 * @param idToken The Identity Token from Google Sign-In
 */
export async function signInWithGoogle(idToken: string): Promise<AuthResult> {
  try {
    const response = await api.post("/auth/google", { idToken });

    if (response.user && response.token) {
      await storeUserData("user", response.user);
      await storeUserData("token", response.token); // Store session token
      return response;
    } else {
      throw new Error("Invalid response from server");
    }
  } catch (error) {
    console.error("Sign In Failed:", error);
    throw error;
  }
}

/**
 * Mock sign out
 */
export async function signOut(): Promise<void> {
  await storeUserData("user", null);
  await storeUserData("token", null);
}

/**
 * Get current user from storage
 */
export async function getCurrentUser(): Promise<User | null> {
  return getUserData("user");
}

/**
 * Check if user is signed in
 */
export async function isSignedIn(): Promise<boolean> {
  const user = await getCurrentUser();
  return !!user;
}

/**
 * Delete account
 */
export async function deleteAccount(userId: string): Promise<void> {
  try {
    const response = await api.delete("/auth/delete", {
      data: { userId } // Send body with DELETE request
    });

    // Clear local storage regardless of backend result for safety
    await signOut();

    if (response.error) {
      throw new Error(response.error);
    }
  } catch (error) {
    console.error("Delete Account Failed:", error);
    // Still clear local data
    await signOut();
    throw error;
  }
}

