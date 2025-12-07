const URL_BASE_SERIES = "http://localhost:8000/series/";

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.detail || 'Error en la solicitud');
    }
    return response.json() as Promise<T>;
}

export async function getSeries<T>(): Promise<T> {
    const response = await fetch(URL_BASE_SERIES, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse<T>(response);
}