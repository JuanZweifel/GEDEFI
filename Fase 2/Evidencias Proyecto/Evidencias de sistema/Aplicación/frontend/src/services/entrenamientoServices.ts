const URL_BASE = "http://localhost:8000/Entrenamiento/";
const URL_MODIFICAR_ENTRENAMIENTO = (id: number) => `${URL_BASE}${id}`;
const URL_BASE_SERIES = "http://localhost:8000/series"

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.detail || "Error en la solicitud");
    }
    return response.json() as Promise<T>;
}

// Obtener todos los entrenamientos
export async function getEntrenamientos<T>(token?: string): Promise<T> {
    const response = await fetch(URL_BASE, {
        method: "GET",
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}), 
        },
    });
    return handleResponse<T>(response);
}

// Crear un entrenamiento
export async function postEntrenamiento<T>(entrenamiento: Record<string, any>, token?: string): Promise<T> {
    const response = await fetch(URL_BASE, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}), 
        },
        body: JSON.stringify(entrenamiento),
    });

    let data: any;
    try {
        data = await response.json();
    } catch {
        data = {};
    }

    if (!response.ok) {
        if (response.status === 422 && Array.isArray(data.detail)) {
            throw { status: 422, data: data.detail };
        } else if (response.status === 409) {
            throw { status: 409, data };
        } else {
            throw { status: response.status, data };
        }
    }

    return data;
}

// Modificar un entrenamiento
export async function putEntrenamiento<T>(id: number, entrenamiento: Record<string, any>, token?: string): Promise<T> {
    const response = await fetch(URL_MODIFICAR_ENTRENAMIENTO(id), {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}), 
        },
        body: JSON.stringify(entrenamiento),
    });

    return handleResponse<T>(response);
}

// Eliminar un entrenamiento
export async function deleteEntrenamiento(id: number, token?: string): Promise<void> {
    const response = await fetch(URL_MODIFICAR_ENTRENAMIENTO(id), {
        method: "DELETE",
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}), 
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Error al eliminar el entrenamiento");
    }
}


// Obtener series de un usuario
// Servicio para traer todas las series o las del usuario logeado
export async function getSeries<T>(token?: string, rut?: string): Promise<T> {
    let url = URL_BASE_SERIES;
    if (rut) url += `?rut=${rut}`; // si se pasa rut, se filtra por usuario

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}), 
        },
    });

    return handleResponse<T>(response);
}