const URL_FICHAS = "http://localhost:8000/fichas_jugador"; 

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData || "Error en la solicitud");
    }
    const data: T = await response.json();
    return data;
}

/**
 * Obtiene todas las fichas sin filtrar.
 */
export async function getFichasPorFiltro<T>(): Promise<T> {
    const response = await fetch(URL_FICHAS, {
        method: "GET",
        headers: {
            "content-type": "application/json",
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