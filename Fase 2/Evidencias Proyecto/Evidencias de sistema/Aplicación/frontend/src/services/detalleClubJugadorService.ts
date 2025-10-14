const URL_DETALLE_CLUB_JUGADOR = "http://localhost:8000/detalle_club_jugador";

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.detail || "Error en la solicitud");
    }
    const data: T = await response.json();
    return data;
}

export async function postDetalleClubJugador<T>(detalleData: {
    rut_jugador: string;
    id_club: number;
}): Promise<T> {
    const response = await fetch(`${URL_DETALLE_CLUB_JUGADOR}/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(detalleData),
    });

    return handleResponse<T>(response);
}




export async function getDetallesClubJugador<T>(token: string): Promise<T> {
    const response = await fetch(`${URL_DETALLE_CLUB_JUGADOR}/`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error cargando detalles de club-jugador");
    }

    return response.json() as Promise<T>;
}