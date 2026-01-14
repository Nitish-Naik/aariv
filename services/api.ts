// services/api.ts
import { Platform } from 'react-native';

// Use your machine's local IP address. 
// For Android Emulator, you can often use '10.0.2.2' if running locally on the same machine.
// Or use the LAN IP found in the Expo start logs (e.g., 10.112.50.3).
const LOCAL_IP = '10.112.50.3'; 
const BASE_URL = Platform.select({
  ios: `http://${LOCAL_IP}:3000/api`,
  android: `http://${LOCAL_IP}:3000/api`,
  default: 'http://localhost:3000/api',
});

// Helper to handle API errors
async function handleResponse(response: Response) {
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
      const response = await fetch(`${BASE_URL}${endpoint}`);
      return handleResponse(response);
    } catch (error) {
      console.error(`GET ${endpoint} failed:`, error);
      throw error;
    }
  },

  post: async (endpoint: string, body: any) => {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
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
};
