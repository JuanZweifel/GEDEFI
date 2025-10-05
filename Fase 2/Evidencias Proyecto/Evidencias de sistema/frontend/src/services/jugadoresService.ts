const URL_BASE = "http://localhost:8000/jugadores/"
const URL_UPLOAD_EXCEL = "http://localhost:8000/upload_excel/"
const URL_MODIFICAR_JUGADOR = (rut_jugador: string) => `http://localhost:8000/jugadores/${rut_jugador}`;
const URL_BASE_LESION = "http://localhost:8000/lesiones/";
const URL_MODIFICAR_LESION = (id_lesion: number) => `http://localhost:8000/lesiones/${id_lesion}`;


async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData || 'Error en la solicitud')
    }
    console.log(response);
    return response.json() as Promise<T>;
}


export async function getJugadores<T>(): Promise<T> {
    const response = await fetch(`${URL_BASE}`, {
        method: 'GET',
        headers: {
            'content-type': 'application/json'
        }
    })
    return handleResponse<T>(response);
}


export async function uploadExcel<T>(formData: FormData): Promise<T> {

    const response = await fetch(`${URL_UPLOAD_EXCEL}`, {
        method: "POST",
        body: formData,
    });
    return handleResponse<T>(response);
}


export async function putJugador<T>(rut_jugador: string, jugador: Record<string, any>): Promise<T> {

    const response = await fetch(URL_MODIFICAR_JUGADOR(rut_jugador), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jugador),
    });
    return handleResponse<T>(response);
}


export async function postJugador<T>(jugador: Record<string, any>): Promise<T> {

    const response = await fetch(URL_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jugador),
    });
    return handleResponse<T>(response);
}


export async function postLesion<T>(data: any): Promise<T> {

    const response = await fetch(URL_BASE_LESION, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return handleResponse<T>(response);
}


export async function getLesiones<T>(): Promise<T> {

    const response = await fetch(URL_BASE_LESION);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData || "Error cargando lesiones");
    }
    return response.json() as Promise<T>;
}


export async function putLesion<T>(id_lesion: number, lesion: Record<string, any>): Promise<T> {
    
    const response = await fetch(URL_MODIFICAR_LESION(id_lesion), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lesion),
    });
    return handleResponse<T>(response);
}


