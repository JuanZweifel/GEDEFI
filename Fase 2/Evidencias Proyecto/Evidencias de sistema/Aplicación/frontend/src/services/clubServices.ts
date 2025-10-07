
const URL_BASE = "http://localhost:8000/clubs"


async function handleResponse<T>(response: Response): Promise<T> {
    if(!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData || 'Error en la solicitud')
    }
    const data:T = await response.json()
    return data
}

export async function getClubs<T>(): Promise<T> {
    const response = await fetch(URL_BASE, {
        method: 'GET',
        headers: {
            'content-type': 'application/json'
        }
    })
    return handleResponse<T>(response);
}

export async function createClub<T>(club: Record<string, any>): Promise<T> {
    console.log(club)
    const response = await fetch(URL_BASE, {
        method: "POST",
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify(club)
    })

    return handleResponse<T>(response);
}

export async function updateClub<T>(club: Record<string, any>, id_club:number): Promise<T> {
    console.log(club)
    const response = await fetch(`${URL_BASE}/${id_club}`, {
        method: "PUT",
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify(club)
    })

    return handleResponse(response)
}

export async function deleteClub<T>(id_club: number): Promise<T> {
    const response = await fetch(`${URL_BASE}/${id_club}`, {
        method: "DELETE",
        headers: {
            'content-type': 'application/json'
        },
    })

    return handleResponse(response)
}

export async function getSeriesClub<T>(id_club: number): Promise<T> {
    const response = await fetch(`${URL_BASE}/${id_club}/series`, {
        method: "GET",
        headers: {
            'content-type': 'application/json'
        },
    })
    return handleResponse(response)
}

export async function getUsuariosClub<T>(id_club: number): Promise<T> {
    const response = await fetch(`${URL_BASE}/${id_club}/usuarios`, {
        method: "GET",
        headers: {
            'content-type': 'application/json'
        },
    })
    return handleResponse(response)
}

export async function getJugadoresClub<T>(id_club: number): Promise<T> {
    const response = await fetch(`${URL_BASE}/${id_club}/jugadores`, {
        method: "GET",
        headers: {
            'content-type': 'application/json'
        },
    })
    return handleResponse(response)
}