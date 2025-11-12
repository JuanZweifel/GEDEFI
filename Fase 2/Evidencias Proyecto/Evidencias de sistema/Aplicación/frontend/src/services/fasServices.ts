const URL_BASE_FAS = "http://localhost:8000/fas/";
const URL_MODIFICAR_FAS = (id: number) => `${URL_BASE_FAS}${id}`;
const URL_BASE_USO_FAS = "http://localhost:8000/uso_fas/";
const URL_FAS_PUBLICO = "http://localhost:8000/fas/publico";
const URL_FAS_USOS_PUBLICO = "http://localhost:8000/uso_fas/publico";


//  Manejo genérico de respuestas
async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.detail || "Error en la solicitud");
    }
    return response.json() as Promise<T>;
}


//  Crear un FAS
export async function postFas<T>(fas: Record<string, any>, token?: string): Promise<T> {
    console.log(fas)
    const response = await fetch(URL_BASE_FAS, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(fas),
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


//  Modificar un FAS
export async function putFas<T>(id: number, fas: Record<string, any>, token?: string): Promise<T> {
    const response = await fetch(URL_MODIFICAR_FAS(id), {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(fas),
    });

    return handleResponse<T>(response);
}


//  Obtener todos los FAS
export async function getFas<T>(token?: string): Promise<T> {
    const response = await fetch(URL_BASE_FAS, {
        method: "GET",
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
    return handleResponse<T>(response);
}


//  Eliminar un FAS
export async function deleteFas(id: number, token?: string): Promise<void> {
    const response = await fetch(URL_MODIFICAR_FAS(id), {
        method: "DELETE",
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error: any = new Error(
            errorData?.detail || errorData?.message || "Error al eliminar el FAS"
        );
        error.status = response.status;
        throw error;
    }
}


// --------------------------------------------------------------------------------------------------------------------------------------------

//  Registrar un nuevo uso del FAS
export async function postUsoFas<T>(usoFas: Record<string, any>, token?: string): Promise<T> {
    const response = await fetch(URL_BASE_USO_FAS, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(usoFas),
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


//  Modificar un uso del FAS
export async function putUsoFas<T>(id: number, usoFas: Record<string, any>, token?: string): Promise<T> {
    const response = await fetch(`${URL_BASE_USO_FAS}${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(usoFas),
    });

    return handleResponse<T>(response);
}


//  Obtener todos los usos del FAS
export async function getUsosFas<T>(token?: string): Promise<T> {
    const response = await fetch(URL_BASE_USO_FAS, {
        method: "GET",
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
    return handleResponse<T>(response);
}


//  Eliminar un uso del FAS
export async function deleteUsoFas(id: number, token?: string): Promise<void> {
    const response = await fetch(`${URL_BASE_USO_FAS}${id}`, {
        method: "DELETE",
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error: any = new Error(
            errorData?.detail || errorData?.message || "Error al eliminar el uso del FAS"
        );
        error.status = response.status;
        throw error;
    }
}


export async function getFasPublico(): Promise<any> {
    const response = await fetch(URL_FAS_PUBLICO, {
        method: "GET",
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error al obtener FAS público");
    }

    return response.json();
}



export async function getFasUsosPublico(): Promise<any[]> {
    const response = await fetch(URL_FAS_USOS_PUBLICO, { 
        method: "GET" 
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error al obtener usos públicos del FAS");
    }

    return response.json();
}