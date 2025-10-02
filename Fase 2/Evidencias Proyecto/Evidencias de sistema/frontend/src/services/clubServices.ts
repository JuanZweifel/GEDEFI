const URL_BASE = "http://localhost:8000/club/"

async function handleResponse<T>(response: Response): Promise<T> {
    if(!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData || 'Error en la solicitud')
    }
    console.log(response);
    return response.json() as Promise<T>;
}

export async function getClubs<T>(): Promise<T> {
    const response = await fetch(`${URL_BASE}`, {
        method: 'GET',
        headers: {
            'content-type': 'application/json'
        }
    })
    return handleResponse<T>(response);
}