import { fetchAPI } from "../utils/fetchApi";

export const getUsers = <T>(token: string): Promise<T> => fetchAPI<T>("/usuarios/", {}, token);

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
