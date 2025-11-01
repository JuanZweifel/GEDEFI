import { fetchAPI } from "../utils/fetchApi";

export const getPartidos = <T>(token: string): Promise<T> =>
    fetchAPI<T>("/partidos/", {}, token);

export const getPartidoById = <T>(id: number, token: string): Promise<T> =>
    fetchAPI<T>(`/partidos/${id}/`, {}, token);

export const createPartido = <T>(data: unknown, token: string): Promise<T> =>
    fetchAPI<T>("/partidos/", {
        method: "POST",
        body: JSON.stringify(data),
    }, token);

export const updatePartido = <T>(id: number, data: unknown, token: string): Promise<T> =>
    fetchAPI<T>(`/partidos/${id}/`, {
        method: "PUT",
        body: JSON.stringify(data),
    }, token);

export const deletePartido = <T>(id: number, token: string): Promise<T> =>
    fetchAPI<T>(`/partidos/${id}/`, {
        method: "DELETE",
    }, token);

export const getRendimientosPartidoClub = <T>(id_club: number, id_partido: number, token: string): Promise<T> =>
    fetchAPI<T>(`/rendimientos-partido/${id_club}/${id_partido}`, {}, token);

//http://localhost:8000/rendimientos-partido/1/4