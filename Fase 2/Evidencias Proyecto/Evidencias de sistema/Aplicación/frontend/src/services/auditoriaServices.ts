const URL_BASE = "http://localhost:8000/auditorias/"


async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail)
    }
    const data: T = await response.json()
    console.log(data)
    return data
}

export async function getAuditorias<T>(
    token: string | null,
    page: number = 1,
    limit: number = 20,
    action?: string | null,
    recurso?: string | null,
    fecha_ini?: string | null,
    fecha_fin?: string | null
): Promise<T> {
    const skip = (page - 1) * limit;

    const params = new URLSearchParams();
    params.append("skip", String(skip));
    params.append("limit", String(limit));

    if (action) params.append("accion_realizada", action);
    if (recurso) params.append("recurso", recurso);
    if (fecha_ini) params.append("fecha_ini", fecha_ini);
    if (fecha_fin) params.append("fecha_fin", fecha_fin);

    const response = await fetch(`${URL_BASE}?${params.toString()}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    return handleResponse(response);
}

export async function getResumenAuditorias<T>(token: string | null): Promise<T> {
    const response = await fetch(`${URL_BASE}resumen/`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    return handleResponse(response)
}