import { supabase } from "./supabase";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

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

  if (response.status === 402) {
    throw new Error("INSUFFICIENT_CREDITS");
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

  get: async (endpoint: string, options?: RequestInit) => {
    const headers = await getAuthHeaders();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const signal = options?.signal || controller.signal;

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: { ...headers, ...options?.headers },
        signal,
      });
      clearTimeout(timeoutId);
      return handleResponse(response);
    } catch (error: unknown) {
      clearTimeout(timeoutId);
      const err = error instanceof Error ? error : new Error(String(error));
      if (err.name === "AbortError" && !options?.signal?.aborted) {
        throw new Error("Request timeout. Please try again.");
      }
      if (err.message?.includes("Failed to fetch")) {
        throw new Error("Could not connect to server. Is the backend running?");
      }
      throw err;
    }
  },

  post: async (endpoint: string, body: any, options?: RequestInit) => {
    const headers = await getAuthHeaders();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const signal = options?.signal || controller.signal;

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        method: "POST",
        headers: { ...headers, ...options?.headers },
        body: JSON.stringify(body),
        signal,
      });
      clearTimeout(timeoutId);
      return handleResponse(response);
    } catch (error: unknown) {
      clearTimeout(timeoutId);
      const err = error instanceof Error ? error : new Error(String(error));
      if (err.name === "AbortError" && !options?.signal?.aborted) {
        throw new Error("Request timeout. Please try again.");
      }
      if (err.message?.includes("Failed to fetch")) {
        throw new Error("Could not connect to server. Is the backend running?");
      }
      throw err;
    }
  },

  put: async (endpoint: string, body: any, options?: RequestInit) => {
    const headers = await getAuthHeaders();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const signal = options?.signal || controller.signal;

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        method: "PUT",
        headers: { ...headers, ...options?.headers },
        body: JSON.stringify(body),
        signal,
      });
      clearTimeout(timeoutId);
      return handleResponse(response);
    } catch (error: unknown) {
      clearTimeout(timeoutId);
      const err = error instanceof Error ? error : new Error(String(error));
      if (err.name === "AbortError" && !options?.signal?.aborted) {
        throw new Error("Request timeout. Please try again.");
      }
      if (err.message?.includes("Failed to fetch")) {
        throw new Error("Could not connect to server. Is the backend running?");
      }
      throw err;
    }
  },

  patch: async (endpoint: string, body: any, options?: RequestInit) => {
    const headers = await getAuthHeaders();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const signal = options?.signal || controller.signal;

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        method: "PATCH",
        headers: { ...headers, ...options?.headers },
        body: JSON.stringify(body),
        signal,
      });
      clearTimeout(timeoutId);
      return handleResponse(response);
    } catch (error: unknown) {
      clearTimeout(timeoutId);
      const err = error instanceof Error ? error : new Error(String(error));
      if (err.name === "AbortError" && !options?.signal?.aborted) {
        throw new Error("Request timeout. Please try again.");
      }
      if (err.message?.includes("Failed to fetch")) {
        throw new Error("Could not connect to server. Is the backend running?");
      }
      throw err;
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

  stream: async (endpoint: string, body: any, signal?: AbortSignal) => {
    const headers = await getAuthHeaders();
    return fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal,
    });
  },

  getConnections: async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/chat/connections`, {
      method: "GET",
      headers,
    });
    return handleResponse(response);
  },
};
