import { fetchAPI } from "../utils/fetchApi";

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
