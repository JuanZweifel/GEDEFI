const URL_BASE = "http://localhost:8000/series"


async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorData = await response.json();
        console.log(errorData)
        const errorMsg = errorData?.detail || JSON.stringify(errorData) || 'Error en la solicitud';
        throw new Error(errorMsg)
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

export async function updateStateSerie<T>(id_serie: number, state: boolean): Promise<T> {
    const response = await fetch(`${URL_BASE}/${id_serie}`, {
        method: 'PUT',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({ state }) 
    })
    return handleResponse<T>(response)
}

export async function deleteSerie<T>(id_serie: number): Promise<T> {
    const response = await fetch(`${URL_BASE}/${id_serie}`, {
        method: "DELETE",
    })

    return handleResponse<T>(response)
}