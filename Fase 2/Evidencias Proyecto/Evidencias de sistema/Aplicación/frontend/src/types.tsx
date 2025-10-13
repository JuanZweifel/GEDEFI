export type ClubType = {
    id_club: number;
    rut_club?: string;
    nombre_club: string;
    fecha_fundacion: string;
    fono_club: string;
    direccion_club: string;
    email_club: string;
    logo_club?: File;
    color_primario?: string;
    color_secundario?: string;
    color_respaldo?: string;
    club_activo: boolean
    fecha_creacion: string;
    fecha_modificacion: string;
    directiva: [UsuarioType];
    series: [SerieType];
    jugadores: [JugadorType];
}

export type SerieType = {
    id_serie?: number;
    nombre_serie: string;
    serie_activa?: boolean;
    id_club: number;
    nombre_club: string;
    fecha_creacion?: string;
    fecha_modificacion?: string;
    cantidad_jugadores: number;
    jugadores: [JugadorType]
}

export type SerieDetailsProps = {
    serie: SerieType;
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
    id_rol: number;
    nombre_rol: string;
};

export type UsuarioFormType = UsuarioType & {
    admin?: boolean;
    id_club?: number;
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
    club: ClubType;
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

export type RolType = {
    id_rol?: number;
    nombre_rol: string;
    desc_rol?: string;
    rol_activo: boolean;
};
