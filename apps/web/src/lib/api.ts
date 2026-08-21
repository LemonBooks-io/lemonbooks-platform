export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export class ApiError extends Error {
  constructor(message: string, public status: number, public code?: string) { super(message); }
}

export async function api<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const response = await fetch(`${API_URL}/api/v3${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(payload.error ?? "Request failed", response.status, payload.code);
  return payload.data as T;
}

export function post<T>(path: string, body: unknown, token?: string) {
  return api<T>(path, { method: "POST", body: JSON.stringify(body) }, token);
}

export function patch<T>(path: string, body: unknown, token?: string) {
  return api<T>(path, { method: "PATCH", body: JSON.stringify(body) }, token);
}

export async function postForm<T>(path: string, body: FormData, token?: string): Promise<T> {
  const response = await fetch(`${API_URL}/api/v3${path}`, { method: "POST", body, headers: token ? { Authorization: `Bearer ${token}` } : {} });
  const payload = await response.json().catch(() => ({})); if (!response.ok) throw new ApiError(payload.error ?? "Request failed", response.status, payload.code); return payload.data as T;
}
