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


export const getUsers = <T>(): Promise<T> => fetchAPI<T>("/usuarios/");

export const getUserById = <T>(rut: number | string): Promise<T> =>
    fetchAPI<T>(`/usuarios/${rut}/`);

export const createUser = <T>(data: unknown): Promise<T> =>
    fetchAPI<T>("/usuarios/", {
        method: "POST",
        body: JSON.stringify(data),
    });

export const updateUser = <T>(rut: number | string, data: unknown): Promise<T> =>
    fetchAPI<T>(`/usuarios/${rut}/`, {
        method: "PUT",
        body: JSON.stringify(data),
    });

export const deleteUser = <T>(rut: number | string): Promise<T> =>
    fetchAPI<T>(`/usuarios/${rut}/`, {
        method: "DELETE",
    });
