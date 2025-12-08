import { fetchAPI } from "../utils/fetchApi";

export const getReuniones = <T>(token: string): Promise<T> =>
    fetchAPI<T>("/reuniones/", {}, token);

export const createReunion = <T>(data: unknown, token: string): Promise<T> =>
    fetchAPI<T>("/reuniones/", {
        method: "POST",
        body: JSON.stringify(data),
    }, token);

export const updateReunion = <T>(id: number | string, data: unknown, token: string): Promise<T> =>
    fetchAPI<T>(`/reuniones/${id}/`, {
        method: "PUT",
        body: JSON.stringify(data),
    }, token);

export const deleteReunion = <T>(id: number | string, token: string): Promise<T> =>
    fetchAPI<T>(`/reuniones/${id}/`, {
        method: "DELETE",
    }, token);

export const assistReunion = <T>(data: unknown, token: string): Promise<T> =>
    fetchAPI<T>(`/reuniones/asistencia/`, {
        method: "POST",
        body: JSON.stringify(data),
    }, token);

export const getReunionAsistencia = <T>(id: number, token: string): Promise<T> =>
    fetchAPI<T>(`/reuniones/${id}/asistencia`, {}, token);

export const getReunionesUsuario = <T>(rut: string, token: string): Promise<T> =>
    fetchAPI<T>(`/reuniones/${rut}/reuniones/`, {}, token);
