const URL_BASE = "http://localhost:8000/clubs/"


async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail)
    }
    const data: T = await response.json()
    return data
}

export async function getClubs<T>(token?: string | null): Promise<T> {
    const response = await fetch(URL_BASE, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        }
    });
    return handleResponse<T>(response);
}

export async function createClub<T>(club: Record<string, any>, token?: string, logo_club?: File): Promise<T> {
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

export async function updateClub<T>(club: Record<string, any>, id_club: number, token?: string, logo_club?: File): Promise<T> {
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
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        }
    })
    return handleResponse(response)
}

export async function deleteClub<T>(id_club: number): Promise<T> {
    const response = await fetch(`${URL_BASE}${id_club}`, {
        method: "DELETE",
        headers: {
            'content-type': 'application/json'
        },
    })

    return handleResponse(response)
}