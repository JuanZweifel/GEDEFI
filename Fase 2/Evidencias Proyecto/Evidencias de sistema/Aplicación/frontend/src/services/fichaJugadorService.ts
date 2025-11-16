const URL_FICHAS = "http://localhost:8000/fichas_jugador";

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData || "Error en la solicitud");
    }
    const data: T = await response.json();
    return data;
}


export async function getFichasPorFiltro<T>(token?: string): Promise<T> {
    const response = await fetch(URL_FICHAS, {
        method: "GET",
        headers: {
            "content-type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    return handleResponse<T>(response);
}


export async function postFichaJugador<T>(fichaData: {
    rut_jugador: string;
    id_serie: number;
}): Promise<T> {
    const response = await fetch(`${URL_FICHAS}/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(fichaData),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Error al crear ficha del jugador");
    }

    const data: T = await response.json();
    return data;
}


export async function putFichaJugador<T>(rut_jugador: string, id_serie: number, fichaUpdate: Record<string, any>, token?: string): Promise<T> {
    const response = await fetch(`${URL_FICHAS}/${rut_jugador}/${id_serie}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(fichaUpdate),
    });

    return handleResponse<T>(response);
}


export async function deleteFichaJugador<T>(rut_jugador: string, id_serie: number, token?: string): Promise<T> {
    const response = await fetch(`${URL_FICHAS}/${rut_jugador}/${id_serie}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    return handleResponse<T>(response);
}