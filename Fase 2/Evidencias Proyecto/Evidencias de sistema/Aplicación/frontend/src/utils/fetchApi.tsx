import { API_BASE_URL } from "../config";

// TODO: Revisar si los cambios a esta funcion afectan a usuario y rol
export async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!res.ok) {
    let errorMessage = `${res.status}`;
    try {
      const errorData = await res.json();
      if (errorData.detail) {
        errorMessage += ` | ${errorData.detail}`;
      }
    } catch {
      // En caso de que la respuesta no sea JSON
      const text = await res.text();
      if (text) errorMessage += `: ${text}`;
    }
    throw new Error(errorMessage);
  }

  if (res.status === 204) {
    return null as unknown as T;
  }

  const text = await res.text();
  if (!text) {
    return null as unknown as T;
  }

  return JSON.parse(text) as T;
}
