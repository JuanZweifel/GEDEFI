import { API_BASE_URL } from "../config";

async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
            "Content-Type": "application/json",
        },
        ...options,
    });

    if (!res.ok) {
        const errorData = await res.text();
        throw new Error(`Error ${res.status}: ${errorData}`);
    }

    return res.json() as Promise<T>;
}

export const getRoles = <T>(): Promise<T> => fetchAPI<T>("/roles/");

export const getRoleById = <T>(roleId: number | string): Promise<T> =>
    fetchAPI<T>(`/roles/${roleId}/`);

export const createRole = <T>(data: unknown): Promise<T> =>
    fetchAPI<T>("/roles/", {
        method: "POST",
        body: JSON.stringify(data),
    });

export const updateRole = <T>(roleId: number | string, data: unknown): Promise<T> =>
    fetchAPI<T>(`/roles/${roleId}/`, {
        method: "PUT",
        body: JSON.stringify(data),
    });

export const deleteRole = <T>(roleId: number | string): Promise<T> =>
    fetchAPI<T>(`/roles/${roleId}/`, {
        method: "DELETE",
    });
