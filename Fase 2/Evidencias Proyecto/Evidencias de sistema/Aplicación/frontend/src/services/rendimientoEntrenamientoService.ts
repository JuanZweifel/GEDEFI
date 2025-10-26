const URL_BASE = "http://localhost:8000/rendimientos_entrenamiento/";
const URL_RENDIMIENTO_BY_ID = (id: number) => `${URL_BASE}${id}`;

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.detail || "Error en la solicitud");
    }
    return response.json() as Promise<T>;
}



// Obtener todos los entrenamientos
export async function getRendimientosEntrenamiento<T>(token?: string): Promise<T> {
    const response = await fetch(URL_BASE, {
        method: "GET",
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
    return handleResponse<T>(response);
}



//  Crear rendimiento para un entrenamiento
export async function postRendimientoEntrenamiento<T>(
    data: Record<string, any>,
    token?: string
): Promise<T> {
    const response = await fetch(URL_BASE, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
    });

    return handleResponse<T>(response);
}



//  Modificar rendimiento
export async function putRendimientoEntrenamiento<T>(
    rut_jugador: string,
    id_entrenamiento: number,
    data: Record<string, any>,
    token?: string
): Promise<T> {
    const response = await fetch(
        `${URL_BASE}${rut_jugador}/${id_entrenamiento}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(data),
        }
    );

    return handleResponse<T>(response);
}



//  Eliminar rendimiento
export async function deleteRendimientoEntrenamiento(
    id: number,
    token?: string
): Promise<void> {
    const response = await fetch(URL_RENDIMIENTO_BY_ID(id), {
        method: "DELETE",
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error: any = new Error(
            errorData?.detail || errorData?.message || "Error al eliminar rendimiento"
        );
        error.status = response.status;
        throw error;
    }
}