const URL_BASE = "http://localhost:8000/clubs/"


async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail)
    }
    const data: T = await response.json()
    return data
}

export async function getClubs<T>(
    page = 1,          // página 1 = primer bloque
    limit = 10,        // cantidad de items por página
    search?: string,
    estado?: string,
    token?: string | null
): Promise<T> {
    // --- calcular skip consistente con backend ---
    // página 1 => skip = 0
    // página 2 => skip = 20
    // página 3 => skip = 40
    const skip = (page - 1) * limit;

    const params = new URLSearchParams();
    params.append("skip", String(skip));
    params.append("limit", String(limit));
    if (search) params.append("search", search);
    if (estado) params.append("estado", estado);

    const url = `${URL_BASE}?${params.toString()}`;

    const response = await fetch(url, {
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    return handleResponse<T>(response);
}

export async function getClub<T>(
    id_club:number,
    token?: string | null
): Promise<T> {

    const url = `${URL_BASE}${id_club}`;

    const response = await fetch(url, {
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    return handleResponse<T>(response);
}

export async function createClub<T>(club: Record<string, any>, token?: string | null, logo_club?: File): Promise<T> {
    const formData = new FormData();
    formData.append("nombre_club", club.nombre_club);
    formData.append("rut_club", club.rut_club);
    formData.append("fecha_fundacion", club.fecha_fundacion);
    formData.append("fono_club", club.fono_club);
    formData.append("direccion_club", club.direccion_club);
    formData.append("email_club", club.email_club);
    formData.append("color_primario", club.color_primario);
    formData.append("color_secundario", club.color_secundario);
    if (club.color_respaldo) {
        formData.append("color_respaldo", club.color_respaldo);
    }
    if (logo_club) {
        formData.append("logo_club", logo_club); // logoFile es tipo File de input
    }
    const response = await fetch(URL_BASE, {
        method: "POST",
        body: formData,
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        }
    })

    return handleResponse(response);
}

export async function updateClub<T>(club: Record<string, any>, id_club: number, token?: string | null, logo_club?: File): Promise<T> {
    const formData = new FormData();
    formData.append("nombre_club", club.nombre_club);
    formData.append("rut_club", club.rut_club);
    formData.append("fecha_fundacion", club.fecha_fundacion);
    formData.append("fono_club", club.fono_club);
    formData.append("direccion_club", club.direccion_club);
    formData.append("email_club", club.email_club);
    formData.append("color_primario", club.color_primario);
    formData.append("color_secundario", club.color_secundario);
    if (club.color_respaldo) {
        formData.append("color_respaldo", club.color_respaldo);
    }
    if (logo_club instanceof File) {
        formData.append("logo_club", logo_club); // logoFile es tipo File de input
    }
    formData.append("club_activo", club.club_activo)
    const response = await fetch(`${URL_BASE}${id_club}`, {
        method: "PUT",
        body: formData,
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    return handleResponse(response)
}

export async function deleteClub<T>(id_club: number, token: string | null): Promise<T> {
    const response = await fetch(`${URL_BASE}${id_club}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    })

    return handleResponse(response)
}