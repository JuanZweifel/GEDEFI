export type ClubType = {
    id_club: number;
    nombre_club: string;
    fecha_fundacion: string;
    fono_club: string;
    direccion_club: string;
    email_club: string;
    club_activo: boolean
    fecha_creacion: string;
    fecha_modificacion: string;
    series: number
    jugadores: number;
}

export type ClubApiType = {

    id_club?: number
    club_activo?: boolean;
    nombre_club: string;
    fecha_fundacion: string;
    fono_club: string;
    direccion_club: string;
    email_club: string;

}

export type SerieType = {
    id_serie?: number;
    nombre_serie: string;
    serie_activa?: boolean;
    id_club: number;
    fecha_creacion?: string;
    fecha_modificacion?: string;
}

export type UsuarioType = {
    rut_usuario: string;         
    email_usuario: string;
    pass_usuario?: string;
    nombre_usuario: string;
    apellido_usuario: string;
    fecha_nacimiento: string;    
    huella_pulgar?: string | null;
    huella_indice?: string | null;
    usuario_activo?: boolean;
    fecha_creacion?: string;
    fecha_modificacion?: string;
};

export type JugadorType = {
    rut_jugador: string;              
    primer_nombre: string;
    segundo_nombre?: string | null;
    primer_apellido: string;
    segundo_apellido?: string | null;
    genero: boolean;                  
    fecha_nacimiento: string;        
    enfermedades_cronicas?: string | null;
    fono_jugador?: string | null;
    jugador_activo?: boolean;
    fecha_creacion?: string;
    fecha_modificacion?: string;
};

export type ClubDetailsType = {
    club:ClubType;
}

export type serieResponseType = {
    series: SerieType[]
}
export type DirectivaResponseType = {
    usuarios: UsuarioType[]
}
export type JugadorResponseType = {
    jugadores: JugadorType[]
}
