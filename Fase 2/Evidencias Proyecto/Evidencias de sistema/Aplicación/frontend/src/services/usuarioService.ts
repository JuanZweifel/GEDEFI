import { fetchAPI } from "../utils/fetchApi";

export interface GetUsersParams {
    skip?: number;
    limit?: number;
    search?: string;
    estado?: number;
    club?: number;
}

export const getUsers = <T>(
    token?: string,
    params?: GetUsersParams
): Promise<T> => {
    const query = new URLSearchParams(
        Object.entries(params || {}).reduce((acc, [key, value]) => {
            if (value !== undefined && value !== null) acc[key] = String(value);
            return acc;
        }, {} as Record<string, string>)
    ).toString();

    const endpoint = query ? `/usuarios?${query}` : `/usuarios`;
    return fetchAPI<T>(endpoint, {}, token);
};

export const getUserById = <T>(rut: number | string, token: string): Promise<T> =>
    fetchAPI<T>(`/usuarios/${rut}/`, {}, token);

export const createUser = <T>(data: unknown, token: string): Promise<T> =>
    fetchAPI<T>("/usuarios/", {
        method: "POST",
        body: JSON.stringify(data),
    }, token);

export const updateUser = <T>(rut: number | string, data: unknown, token: string): Promise<T> =>
    fetchAPI<T>(`/usuarios/${rut}/`, {
        method: "PUT",
        body: JSON.stringify(data),
    }, token);

export const deleteUser = <T>(rut: number | string, token: string): Promise<T> =>
    fetchAPI<T>(`/usuarios/${rut}/`, {
        method: "DELETE",
    }, token);

export const updatePassword = <T>(rut: number | string, data: unknown, token: string): Promise<T> =>
    fetchAPI<T>(`/usuarios/${rut}/password/`, {
        method: "PUT",
        body: JSON.stringify(data),
    }, token);
