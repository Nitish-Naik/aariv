// services/api.ts
import { Platform } from 'react-native';

// Prefer env-driven API base for all platforms. Fallback to LAN/IP hints for local dev.
const ENV_API_URL = process.env.EXPO_PUBLIC_API_URL;

// Use your machine's local IP address if no env is set.
// For Android Emulator, you can often use '10.0.2.2' if running locally on the same machine.
const LOCAL_IP = '10.0.2.2';

const fallbackBase = Platform.select({
  ios: `http://${LOCAL_IP}:3000/api`,
  android: `http://${LOCAL_IP}:3000/api`,
  default: 'http://localhost:3000/api',
});

export const API_URL = ENV_API_URL ? ENV_API_URL.replace(/\/$/, '') : fallbackBase;

// Helper to handle API errors and token expiry
async function handleResponse(response: Response) {
  if (response.status === 401) {
    // Token expired or invalid; sign out
    await signOut();
    throw new Error("Session expired. Please log in again.");
  }
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }
  return response.json();
}

// Generic API client
export const api = {
  get: async (endpoint: string) => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`);
      return handleResponse(response);
    } catch (error) {
      console.error(`GET ${endpoint} failed:`, error);
      throw error;
    }
  },

  post: async (endpoint: string, body: any) => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`POST ${endpoint} failed:`, error);
      throw error;
    }
  },

  delete: async (endpoint: string, options?: { data?: any }) => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: options?.data ? JSON.stringify(options.data) : undefined,
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`DELETE ${endpoint} failed:`, error);
      throw error;
    }
  },
};

