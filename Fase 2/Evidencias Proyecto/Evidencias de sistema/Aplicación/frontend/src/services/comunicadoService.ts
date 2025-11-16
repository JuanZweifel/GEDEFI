import { fetchAPI } from "../utils/fetchApi";

export const sendComunicado = <T>(data: unknown, token: string): Promise<T> =>
    fetchAPI<T>("/correos/send_comunicado", {
        method: "POST",
        body: JSON.stringify(data),
    }, token);
