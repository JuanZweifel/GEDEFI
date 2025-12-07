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
    token?: string | null,
    search: string| null = null,
    estado: string | null = null,
    page: number | null = null,
    limit: number | null = null
): Promise<T> {
    const params = new URLSearchParams();

    // Solo enviar skip y limit si ambos fueron proporcionados
    if (page != null && limit != null) {
        const skip = (page - 1) * limit;
        params.append("skip", String(skip));
        params.append("limit", String(limit));
    }

    if (search) params.append("search", search);
    if (estado) params.append("estado", estado);

    const queryString = params.toString();
    const url = queryString ? `${URL_BASE}?${queryString}` : URL_BASE;
    const response = await fetch(url, {
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return handleResponse<T>(response);
}

export async function getClub<T>(
    id_club:number | null,
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

export async function disableClub<T>(id_club: number, token: string | null): Promise<T> {
    const response = await fetch(`${URL_BASE}${id_club}/disable`, {
        method: "PUT",
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    })

    return handleResponse(response)
}