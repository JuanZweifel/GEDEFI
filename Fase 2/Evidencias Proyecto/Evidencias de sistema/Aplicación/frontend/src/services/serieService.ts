const URL_BASE = "http://localhost:8000/series"


async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData || 'Error en la solicitud')
    }
    const data: T = await response.json()
    return data
}

export async function getSeries<T>(): Promise<T> {
    const response = await fetch(URL_BASE, {
        method: 'GET',
        headers: {
            'content-type': 'application/json'
        }
    })
    return handleResponse<T>(response);
}