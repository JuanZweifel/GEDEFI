import { fetchAPI } from "../utils/fetchApi";

export const getCanchas = <T>(token: string): Promise<T> => fetchAPI<T>("/canchas/", {}, token);

export const getCanchaById = <T>(token: string, id: number): Promise<T> =>
    fetchAPI<T>(`/canchas/${id}/`, {}, token);

export const createCancha = <T>(token: string, data: unknown): Promise<T> =>
    fetchAPI<T>("/canchas/", {
        method: "POST",
        body: JSON.stringify(data),
    }, token);

export const updateCancha = <T>(token: string, id: number, data: unknown): Promise<T> =>
    fetchAPI<T>(`/canchas/${id}/`, {
        method: "PUT",
        body: JSON.stringify(data),
    }, token);

export const deleteCancha = <T>(token: string, id: number): Promise<T> =>
    fetchAPI<T>(`/canchas/${id}/`, {
        method: "DELETE",
    }, token);
