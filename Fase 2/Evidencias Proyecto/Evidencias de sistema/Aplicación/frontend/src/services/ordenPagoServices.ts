const URL_BASE = "http://localhost:8000/ordenes-pago/"


async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail)
    }
    const data: T = await response.json()
    return data
}

export async function getOrdenesPago<T>(): Promise<T> {
    const response = await fetch(URL_BASE, {
        method: "GET"
    })
    return handleResponse(response)
}