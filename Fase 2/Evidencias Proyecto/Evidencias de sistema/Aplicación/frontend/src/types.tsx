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
    asociacion?: boolean;
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
    id_club: number;
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
    metodo_pago?: string | null;
    numero_transaccion?: string | null;
    estado_orden: string;
    fecha_pago?: string | null; // ISO string
    nombre_club?: string | null;
    usuario_emisor: string;
    usuario_pago: string | null;
    fecha_emision: string; // ISO string
    fecha_modificacion: string; // ISO string
};

export type BalanceType = {
    tipo?: string;
    balance?: number;
    variacion?: string;
}

export type SuperficiesEnum =
    | "Césped Natural"
    | "Césped Sintético"
    | "Tierra"

export type InstalacionesEnum =
    | "Iluminación"
    | "Tribunas"
    | "Camarines"
    | "Estacionamiento"
    | "Baños"
    | "Enfermería"

export type TipoOrdenEnum =
    | "Mensualidad"
    | "Multa"
    | "Pase"
    | "Servicio Basico"
    | "Donacion"
    | "Subvencion"
    | "Otro"

export type CanchaType = {
    id_cancha: number;
    nombre_cancha: string;
    superficie_cancha: SuperficiesEnum;
    direccion?: string;
    cancha_activa: boolean;
    ultimo_mantenimiento?: string | null;
    observaciones?: string | null;
    instalaciones: InstalacionesEnum[];
    fecha_creacion: string;
    fecha_modificacion: string;
}

export type UploadExcelProps = {
    refreshJugadores: () => Promise<void>;
    onUploadComplete?: (result: any[]) => void;
    openHistory?: () => void;
};

export type OrdenDetailsType = {
    orden: OrdenPagoType;
}


export type PartidoType = {
    id_partido: number;
    fecha_partido: string;
    hora_ini_partido: string;
    hora_fin_partido: string | null;
    goles_local: number | null;
    goles_visita: number | null;
    estado_partido: "programado" | "en_curso" | "finalizado" | "cancelado";
    tipo_partido: "campeonato" | "amistoso" | "playoff" | "final";
    observaciones: string;
    fecha_creacion: string;
    fecha_modificacion: string;
    id_cancha: number;
    id_serie_local: number;
    id_serie_visitante: number;
    nombre_serie: string;
    club_local: string;
    club_visitante: string;
}

export type RendimientoPartidoType = {
    id_partido: number;
    rut_jugador: string;
    goles: number;
    asistencias: number;
    amonestaciones: number;
    amonestaciones_amarillas: Boolean;
    amonestaciones_rojas: boolean;
    tiempo_jugado: number;
    primer_nombre: string;
    segundo_nombre: string | null;
    primer_apellido: string;
    segundo_apellido: string | null;
}

export type AuditoriaType = {
    id_auditoria: number;
    recurso: string;
    id_recurso: string;
    descripcion: string;
    fecha_cambio: string;
    accion_realizada: string;
    error: boolean;
    rut_usuario: string;
    nombre_usuario: string;
    apellido_usuario: string
}

export type ResumenAuditoriaType = {
    acciones_hoy: number;
    exitos_hoy: number;
    errores_hoy: number;
    modulos_auditados: number;
}

export type Solicitud = {
    id_solicitud: number;
    usuario_solicitud: number;
    usuario_respuesta?: number | null;
    categoria: number;
    descripcion?: string;
    estado: boolean;
    respuesta?: string;
    fecha_creacion: string;
    fecha_modificacion: string;
}
