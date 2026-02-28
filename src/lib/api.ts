import { supabase } from "./supabase";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

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

async function handleResponse(response: Response) {
  if (response.status === 401) {
    await supabase.auth.signOut();
    window.location.href = "/login";
    throw new Error("Session expired. Please log in again.");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (errorData.error === "USER_NOT_FOUND") {
      await supabase.auth.signOut();
      window.location.href = "/login";
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

export const api = {
  getBaseUrl: () => API_URL,

  get: async (endpoint: string) => {
    const headers = await getAuthHeaders();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return handleResponse(response);
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === "AbortError") {
        throw new Error("Request timeout. Please try again.");
      }
      if (error.message?.includes("Failed to fetch")) {
        throw new Error("Could not connect to server. Is the backend running?");
      }
      throw error;
    }
  },

  post: async (endpoint: string, body: any) => {
    const headers = await getAuthHeaders();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return handleResponse(response);
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === "AbortError") {
        throw new Error("Request timeout. Please try again.");
      }
      if (error.message?.includes("Failed to fetch")) {
        throw new Error("Could not connect to server. Is the backend running?");
      }
      throw error;
    }
  },

  delete: async (endpoint: string, options?: { data?: any }) => {
    const headers = await getAuthHeaders();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "DELETE",
        headers,
        body: options?.data ? JSON.stringify(options.data) : undefined,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return handleResponse(response);
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === "AbortError") {
        throw new Error("Request timeout. Please try again.");
      }
      throw error;
    }
  },

  stream: async (endpoint: string, body: any) => {
    const headers = await getAuthHeaders();
    return fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
  },

  getConnections: async (userId: string) => {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${API_URL}/chat/connections?userId=${userId}`,
      {
        method: "GET",
        headers,
      },
    );
    return handleResponse(response);
  },
};
