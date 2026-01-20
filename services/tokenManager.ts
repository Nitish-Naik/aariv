/**
 * Token management: refresh, validation, expiry
 */
import { getUserData, storeUserData } from "../utils/storage";

interface TokenPayload {
  exp?: number;
  iat?: number;
  sub?: string;
}

/**
 * Decode JWT (basic client-side decode, no validation)
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const decoded = JSON.parse(atob(parts[1]));
    return decoded;
  } catch {
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
  return getUserData("token");
}

/**
 * Check and refresh token if needed
 */
export async function ensureValidToken(): Promise<string | null> {
  const token = await getStoredToken();
  if (!token) return null;

  if (isTokenExpired(token)) {
    // Attempt refresh using stored Google ID token
    const idToken = await getUserData("google_id_token");
    if (!idToken) {
      console.warn("Token expired and no refresh token available. Re-login required.");
      return null;
    }

    try {
      // Re-authenticate with Google token
      const { api } = await import("./api");
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
  await storeUserData("token", token);
  const payload = decodeToken(token);
  if (payload?.exp) {
    await storeUserData("token_exp", String(payload.exp));
  }
}

/**
 * Store Google ID token for refresh
 */
export async function storeGoogleIdToken(idToken: string): Promise<void> {
  await storeUserData("google_id_token", idToken);
}
