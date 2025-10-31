import { fetchAPI } from "../utils/fetchApi";

export const getSolicitudes = <T>(token: string): Promise<T> => fetchAPI<T>("/solicitudes/", {}, token);

export const getSolicitudById = <T>(id: string, token: string): Promise<T> =>
    fetchAPI<T>(`/solicitudes/${id}/`, {}, token);

export const createSolicitud = <T>(data: any, token: string): Promise<T> =>
    fetchAPI<T>("/solicitudes/", { method: "POST", body: JSON.stringify(data) }, token);

export const respondSolicitud = <T>(id: string, data: any, token: string): Promise<T> =>
    fetchAPI<T>(`/solicitudes/${id}/respond/`, { method: "PATCH", body: JSON.stringify(data) }, token);

export const deleteSolicitud = <T>(id: string, token: string): Promise<T> =>
    fetchAPI<T>(`/solicitudes/${id}/`, { method: "DELETE" }, token);
