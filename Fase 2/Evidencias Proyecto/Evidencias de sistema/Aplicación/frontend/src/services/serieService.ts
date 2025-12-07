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

export async function getSeries<T>(token:string | null): Promise<T> {
    const response = await fetch(URL_BASE, {
        method: 'GET',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
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
