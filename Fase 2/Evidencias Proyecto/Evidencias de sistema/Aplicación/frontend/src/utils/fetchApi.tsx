import { API_BASE_URL } from "../config";

// TODO: Revisar si los cambios a esta funcion afectan a usuario y rol
export async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers, // allow overriding headers if needed
  };

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorMessage = `${res.status}`;
    try {
      const errorData = await res.json();
      if (errorData.detail) errorMessage += ` | ${errorData.detail}`;
    } catch {
      const text = await res.text();
      if (text) errorMessage += `: ${text}`;
    }
    throw new Error(errorMessage);
  }

  if (res.status === 204) {
    return null as unknown as T;
  }

  const text = await res.text();
  return text ? (JSON.parse(text) as T) : (null as unknown as T);
}
