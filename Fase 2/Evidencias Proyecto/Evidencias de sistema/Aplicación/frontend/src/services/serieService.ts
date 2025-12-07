const URL_BASE = "http://localhost:8000/series"


async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorData = await response.json();
        const errorMsg = errorData?.detail || JSON.stringify(errorData) || 'Error en la solicitud';
        throw new Error(errorMsg)
    }
    const data: T = await response.json()
    return data
}

export async function getSeries<T>(
    token?: string | null,
    search: string| null = null,
    estado: string | null = null,
    page: number | null = null,
    limit: number | null = null
): Promise<T> {
    const params = new URLSearchParams();

    // Solo enviar skip y limit si ambos fueron proporcionados
    if (page != null && limit != null) {
        console.log("Entre")
        const skip = (page - 1) * limit;
        params.append("skip", String(skip));
        params.append("limit", String(limit));
    }

    if (search) params.append("search", search);
    if (estado) params.append("estado", estado);

    const queryString = params.toString();
    const url = queryString ? `${URL_BASE}?${queryString}` : URL_BASE;
    const response = await fetch(url, {
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return handleResponse<T>(response);
}

export async function updateStateSerie<T>(id_serie: number, token:string | null): Promise<T> {
    const response = await fetch(`${URL_BASE}/${id_serie}`, {
        method: 'PUT',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    return handleResponse<T>(response)
}


export async function getUniqueSeries<T>(): Promise<T> {
    const response = await fetch(`${URL_BASE}/unicas`, {
        method: "GET",
    });
    return handleResponse<T>(response);
}