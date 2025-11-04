import { API_BASE_URL } from "./constants";

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      error: {
        code: "UNKNOWN_ERROR",
        message: `HTTP ${response.status}: ${response.statusText}`,
      },
    }));
    throw new Error(error.error.message);
  }
  return response.json();
}

export async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  // Only set Content-Type for requests with a body (POST, PUT, PATCH)
  // GET and DELETE requests without a body should not have Content-Type
  const hasBody = options?.body !== undefined && options?.body !== null;
  const headers: Record<string, string> = {};

  if (hasBody) {
    headers["Content-Type"] = "application/json";
  }

  // Merge with any custom headers from options
  if (options?.headers) {
    Object.assign(headers, options.headers);
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // Include cookies for Better-Auth
  });

  return handleResponse<T>(response);
}

export async function apiUpload<T>(endpoint: string, formData: FormData): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  return handleResponse<T>(response);
}
