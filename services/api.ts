// services/api.ts
import { signOut } from "./auth";
import { supabase } from "./supabaseClient";

// Prefer env-driven API base for all platforms.
const ENV_API_URL = process.env.EXPO_PUBLIC_API_URL;


export const API_URL = ENV_API_URL
  ? ENV_API_URL.replace(/\/$/, "")
  : "http://localhost:3000/api";

// Helper to get auth headers from Supabase
async function getAuthHeaders(): Promise<HeadersInit> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  }

  return headers;
}

// Helper to handle API errors and token expiry
async function handleResponse(response: Response, endpoint: string) {
  if (response.status === 401) {
    // Session is invalid, sign out
    await signOut();
    throw new Error("Session expired. Please log in again.");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    // 4. Global API Auto-Recovery Guard
    if (errorData.error === "USER_NOT_FOUND") {
      console.warn("Global Guard: User not found in backend. Forcing logout.");
      await signOut();
      // Throwing error will stop execution, UI will likely rerender to login due to auth state change
      throw new Error("Account invalid or deleted. Please log in again.");
    }

    throw new Error(
      errorData.message ||
      errorData.error ||
      `Request failed with status ${response.status}`,
    );
  }

  return response.json();
}

// Generic API client
export const api = {
  get: async (endpoint: string) => {
    try {
      const headers = await getAuthHeaders();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const response = await fetch(`${API_URL}${endpoint}`, {
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return handleResponse(response, endpoint);
    } catch (error: any) {
      if (error.name === "AbortError") {
        throw new Error("Request timeout. Please try again.");
      }
      if (
        error.message?.includes("Network request failed") ||
        error.message?.includes("Failed to fetch")
      ) {
        console.warn(
          `API Connection Error: Could not reach ${API_URL}${endpoint}. Is the backend server running?`,
        );
        throw new Error(
          "Could not connect to server. Please check your internet connection or try again later.",
        );
      }
      console.error(`GET ${endpoint} failed:`, error);
      throw error;
    }
  },

  post: async (endpoint: string, body: any) => {
    try {
      const headers = await getAuthHeaders();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return handleResponse(response, endpoint);
    } catch (error: any) {
      if (error.name === "AbortError") {
        throw new Error("Request timeout. Please try again.");
      }
      if (
        error.message?.includes("Network request failed") ||
        error.message?.includes("Failed to fetch")
      ) {
        console.warn(
          `API Connection Error: Could not reach ${API_URL}${endpoint}. Is the backend server running?`,
        );
        throw new Error("Could not connect to server. Is the backend running?");
      }
      console.error(`POST ${endpoint} failed:`, error);
      throw error;
    }
  },

  delete: async (endpoint: string, options?: { data?: any }) => {
    try {
      const headers = await getAuthHeaders();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "DELETE",
        headers,
        body: options?.data ? JSON.stringify(options.data) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return handleResponse(response, endpoint);
    } catch (error: any) {
      if (error.name === "AbortError") {
        throw new Error("Request timeout. Please try again.");
      }
      console.error(`DELETE ${endpoint} failed:`, error);
      throw error;
    }
  },

  getConnections: async (userId: string) => {
    const headers = await getAuthHeaders(); // Helper from existing api.ts
    const response = await fetch(`${API_URL}/chat/connections?userId=${userId}`, {
      method: 'GET',
      headers,
    });
    return handleResponse(response, '/chat/connections');
  },
};
