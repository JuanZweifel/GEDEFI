import { fetchAPI } from "../utils/fetchApi";

export const getCanchas = <T>(): Promise<T> => fetchAPI<T>("/canchas/");

export const getCanchaById = <T>(id: number): Promise<T> =>
    fetchAPI<T>(`/canchas/${id}/`);

export const createCancha = <T>(data: unknown): Promise<T> =>
    fetchAPI<T>("/canchas/", {
        method: "POST",
        body: JSON.stringify(data),
    });

export const updateCancha = <T>(id: number, data: unknown): Promise<T> =>
    fetchAPI<T>(`/canchas/${id}/`, {
        method: "PUT",
        body: JSON.stringify(data),
    });

export const deleteCancha = <T>(id: number): Promise<T> =>
    fetchAPI<T>(`/canchas/${id}/`, {
        method: "DELETE",
    });
