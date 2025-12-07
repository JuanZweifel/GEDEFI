import { fetchAPI } from "../utils/fetchApi";

export const getRoles = <T>(token: string): Promise<T> => fetchAPI<T>("/roles/", {}, token);

export const getRoleById = <T>(roleId: number | string, token: string): Promise<T> =>
    fetchAPI<T>(`/roles/${roleId}/`, {}, token);

export const createRole = <T>(data: unknown, token: string): Promise<T> =>
    fetchAPI<T>("/roles/", {
        method: "POST",
        body: JSON.stringify(data),
    }, token);

export const updateRole = <T>(roleId: number | string, data: unknown, token: string): Promise<T> =>
    fetchAPI<T>(`/roles/${roleId}/`, {
        method: "PUT",
        body: JSON.stringify(data),
    }, token);

export const deleteRole = <T>(roleId: number | string, token: string): Promise<T> =>
    fetchAPI<T>(`/roles/${roleId}/`, {
        method: "DELETE",
    }, token);
