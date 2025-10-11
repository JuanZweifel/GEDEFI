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