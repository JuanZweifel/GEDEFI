import { fetchAPI } from "../utils/fetchApi";

export const getPartidos = <T>(token: string | null, skip: number | null, limit: number | null): Promise<T> =>
    fetchAPI<T>("/partidos/", {}, !!token ? token : undefined);

export const getPartidoById = <T>(id: number, token: string): Promise<T> =>
    fetchAPI<T>(`/partidos/${id}/`, {}, token);

export const createPartido = <T>(data: unknown, token: string | null): Promise<T> =>
    fetchAPI<T>("/partidos/", {
        method: "POST",
        body: JSON.stringify(data),
    }, token);

export const updatePartido = <T>(id: number, data: unknown, token: string | null): Promise<T> =>
    fetchAPI<T>(`/partidos/${id}/`, {
        method: "PUT",
        body: JSON.stringify(data),
    }, token);

export const deletePartido = <T>(id: number, token: string): Promise<T> =>
    fetchAPI<T>(`/partidos/${id}/`, {
        method: "DELETE",
    }, token);

export const getRendimientosPartido = <T>(id_partido: number, token: string | null): Promise<T> =>
    fetchAPI<T>(`/rendimientos-partido/${id_partido}`, {}, token || "");

export const updateRendimientoPartido = <T>(token: string | null, id_partido: number, listaRendimientos: any): Promise<T> =>
    fetchAPI<T>(`/rendimientos-partido/${id_partido}`, {
        method: "PUT",
        body: JSON.stringify(listaRendimientos),
    }, !!token ? token : undefined)

export const generarCalendario= <T>(token: string | null, calendario: any): Promise<T> =>
    fetchAPI<T>(`/calendario/calendar/?start_date=${calendario.start_date}&total_jornadas=${calendario.total_jornadas}`, {
        method: "POST",
    }, !!token ? token : undefined)

export const getPartidosbySerie = <T>(token: string | null, id_serie: number): Promise<T> =>
    fetchAPI<T>(`/partidos/${id_serie}`, {}, !!token ? token : undefined);