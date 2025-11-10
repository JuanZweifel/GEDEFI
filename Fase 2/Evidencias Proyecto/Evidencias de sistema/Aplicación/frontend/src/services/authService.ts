import { fetchAPI } from "../utils/fetchApi";

export const loginUser = <T>(email: string, password: string): Promise<T> =>
    fetchAPI<T>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    });

export const recoverUser = <T>(email: string): Promise<T> =>
    fetchAPI<T>("/auth/recover", {
        method: "POST",
        body: JSON.stringify({ email }),
    });

