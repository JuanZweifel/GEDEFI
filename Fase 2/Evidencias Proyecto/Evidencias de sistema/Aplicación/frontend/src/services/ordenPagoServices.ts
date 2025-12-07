const URL_BASE = "http://localhost:8000/ordenes-pago/"


async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail)
    }
    const data: T = await response.json()
    return data
}

export async function getOrdenesPago<T>(token:string | null): Promise<T> {
    const response = await fetch(URL_BASE, {
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    return handleResponse(response)
}

export async function getIngresos<T>(): Promise<T> {
    const response = await fetch(`${URL_BASE}ingresos-mes`, {
        method: "GET"
    })

    return handleResponse(response)
}

export async function getEgresos<T>(): Promise<T> {
    const response = await fetch(`${URL_BASE}egresos-mes`, {
        method: "GET"
    })

    return handleResponse(response)
}

export async function cancelOrden<T>(id_orden_pago: string, token: string | null): Promise<T> {
    const response = await fetch(`${URL_BASE}${id_orden_pago}/anular`, {
        method: "PUT",
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    })

    return handleResponse(response);
}

export async function createOrden<T>(orden: any, token: string | null): Promise<T> {
    const response = await fetch(URL_BASE, {
        method: "POST",
        body: JSON.stringify(orden),  // 👈 convertir a JSON
        headers: {
            "Content-Type": "application/json", // 👈 indicar que es JSON
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
    })

    return handleResponse(response);
}

export async function payOrden<T>(id_orden_pago:string, orden:any, token:string | null): Promise<T> {
    const response = await fetch(`${URL_BASE}${id_orden_pago}/pay`, {
        method: "PUT",
        body: JSON.stringify(orden),  // 👈 convertir a JSON
        headers: {
            "Content-Type": "application/json", // 👈 indicar que es JSON
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
    })

    return handleResponse(response)
}

export async function pendingOrder<T>(id_orden_pago:string, token:string | null): Promise<T> {
    const response = await fetch(`${URL_BASE}${id_orden_pago}/pending`, {
        method: "PUT",
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
    })

    return handleResponse(response)
}

export async function deleteOrden<T>(id_orden: string, token: string | null): Promise<T> {
    const response = await fetch(`${URL_BASE}${id_orden}`, {
        method: "DELETE",
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
    })

    return handleResponse(response)
}