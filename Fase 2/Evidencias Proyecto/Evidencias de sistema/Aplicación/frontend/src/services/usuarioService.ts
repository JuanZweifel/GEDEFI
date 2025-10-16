import { fetchAPI } from "../utils/fetchApi";

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
