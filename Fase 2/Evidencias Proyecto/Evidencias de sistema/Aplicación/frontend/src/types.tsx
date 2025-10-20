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
    id_club?: number;
    nombre_club?: string;
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

export type OrdenPagoType = {
    id_orden_pago: string;
    tipo_orden: string;
    tipo_movimiento: string;
    monto: number;
    descripcion?: string | null;
    fecha_vencimiento?: string | null; // ISO string
    id_club?: number | null;
    tipo_pago?: string | null;
    orden_paga: boolean;
    metodo_pago?: number | null;
    numero_transaccion?: string | null;
    orden_activa: boolean;
    fecha_pago?: string | null; // ISO string
    nombre_club?: string | null;
    fecha_emision: string; // ISO string
    fecha_modificacion: string; // ISO string
};

export type BalanceType = {
    tipo?: string;
    balance?: number;
    variacion?: string;
}

export type CanchaType = {
    id_cancha: number;
    nombre_cancha: string;
    tipo_cancha: number;
    direccion?: string;
    disponibilidad: boolean;
    cancha_activa: boolean;
    fecha_creacion: string;
    fecha_modificacion: string;
}

export type UploadExcelProps = {
    refreshJugadores: () => Promise<void>;
    onUploadComplete?: (result: any[]) => void;
    openHistory?: () => void;
};
