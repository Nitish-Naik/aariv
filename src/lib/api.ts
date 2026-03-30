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
    const errorData = await response.json().catch(() => ({}));
    const detail = errorData.detail;
    const code = typeof detail === "object" ? detail?.code : undefined;
    const err = new Error(code || "QUOTA_EXCEEDED");
    (err as any).response = { status: 402, data: errorData };
    throw err;
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

/**
 * Centralised HTTP client for all backend requests.
 *
 * - Automatically attaches the Supabase JWT as a `Bearer` token.
 * - Enforces a 30-second timeout on every request (except `stream`).
 * - Handles 401 (session expiry) by signing out and redirecting to `/login`.
 * - Handles 402 (quota exceeded) by throwing a typed error with the quota code.
 * - Throws a friendly `"Could not connect to server"` error on network failure.
 *
 * @example
 * ```ts
 * const data = await api.get("/user/profile");
 * await api.post("/chat/send", { message: "Hello" });
 * ```
 */
export const api = {
  getBaseUrl: () => API_URL,

  /**
   * Sends a `GET` request to the given API endpoint.
   *
   * @param endpoint - Path relative to `NEXT_PUBLIC_API_URL` (e.g. `"/user/me"`).
   * @param options - Optional `RequestInit` overrides (e.g. a custom `signal`).
   * @returns Parsed JSON response.
   * @throws On timeout, network failure, 401, 402, or non-2xx status.
   */
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

  /**
   * Sends a `POST` request with a JSON-serialised body.
   *
   * @param endpoint - Path relative to `NEXT_PUBLIC_API_URL`.
   * @param body - Request payload; will be JSON-stringified.
   * @param options - Optional `RequestInit` overrides.
   * @returns Parsed JSON response.
   */
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

  /**
   * Sends a `PUT` request with a JSON-serialised body.
   *
   * @param endpoint - Path relative to `NEXT_PUBLIC_API_URL`.
   * @param body - Full replacement payload; will be JSON-stringified.
   * @param options - Optional `RequestInit` overrides.
   * @returns Parsed JSON response.
   */
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

  /**
   * Sends a `PATCH` request with a JSON-serialised partial body.
   *
   * @param endpoint - Path relative to `NEXT_PUBLIC_API_URL`.
   * @param body - Partial update payload; will be JSON-stringified.
   * @param options - Optional `RequestInit` overrides.
   * @returns Parsed JSON response.
   */
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

  /**
   * Sends a `DELETE` request, optionally including a JSON body.
   *
   * @param endpoint - Path relative to `NEXT_PUBLIC_API_URL`.
   * @param options - Optional `{ data }` object whose value is JSON-stringified as the body.
   * @returns Parsed JSON response.
   */
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

  /**
   * Opens a streaming `POST` request and returns the raw `Response` so the
   * caller can read it as a `ReadableStream` (e.g. for SSE or chunked JSON).
   * Unlike other methods, `stream` does NOT enforce a timeout or parse the
   * response body — callers are responsible for handling both.
   *
   * @param endpoint - Path relative to `NEXT_PUBLIC_API_URL`.
   * @param body - Request payload; will be JSON-stringified.
   * @param signal - Optional `AbortSignal` to cancel the stream.
   * @returns The raw `Response` object.
   */
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
