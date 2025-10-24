const URL_BASE = "http://localhost:8000/rendimientos_entrenamiento/";

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