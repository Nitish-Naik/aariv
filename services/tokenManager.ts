/**
 * Token management: refresh, validation, expiry
 */
import { jwtDecode } from "jwt-decode";
import { getEncryptedToken, storeEncryptedToken, removeToken } from "../utils/storage";
import { getUserData, storeUserData } from "../utils/storage"; // Keep for non-sensitive data if needed

interface TokenPayload {
  exp?: number;
  iat?: number;
  sub?: string;
  [key: string]: any;
}

/**
 * Decode JWT safely
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    return jwtDecode<TokenPayload>(token);
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string, bufferSeconds = 60): boolean {
  const payload = decodeToken(token);
  if (!payload?.exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return payload.exp <= now + bufferSeconds;
}

/**
 * Get stored token
 */
export async function getStoredToken(): Promise<string | null> {
  // Use SecureStore (via storage util)
  // We use 'session' as the platform key for the main auth token
  return getEncryptedToken("session");
}

/**
 * Check and refresh token if needed
 */
export async function ensureValidToken(): Promise<string | null> {
  const token = await getStoredToken();
  if (!token) return null;

  if (isTokenExpired(token)) {
    // Attempt refresh using stored Google ID token
    // We also move google_id_token to SecureStore for safety
    const idToken = await getEncryptedToken("google_id_token");
    
    if (!idToken) {
      console.warn("Token expired and no refresh token available. Re-login required.");
      return null;
    }

    try {
      // Re-authenticate with Google token
      const { api } = await import("./api");
      // Note: This call might fail if api.post itself calls ensureValidToken (circular dependency).
      // However, api.post usually just calls getStoredToken. 
      // We should ensure api.ts doesn't call ensureValidToken automatically for the refresh endpoint.
      const response = await api.post("/auth/google", { idToken });
      
      if (response.user && response.token) {
        await storeUserData("user", response.user);
        await storeToken(response.token);
        console.log("Token refreshed successfully");
        return response.token;
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      return null;
    }
  }

  return token;
}

/**
 * Store a new token with expiry tracking
 */
export async function storeToken(token: string): Promise<void> {
  await storeEncryptedToken("session", token);
  const payload = decodeToken(token);
  // We can still keep expiry in Async storage for quick access if needed, 
  // but decoding is fast enough.
}

/**
 * Store Google ID token for refresh
 */
export async function storeGoogleIdToken(idToken: string): Promise<void> {
  await storeEncryptedToken("google_id_token", idToken);
}

/**
 * Clear all auth tokens
 */
export async function clearTokens(): Promise<void> {
    await removeToken("session");
    await removeToken("google_id_token");
}
