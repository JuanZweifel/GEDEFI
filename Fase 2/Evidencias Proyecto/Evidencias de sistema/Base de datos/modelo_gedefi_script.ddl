

CREATE TABLE ARCHIVO 
    ( 
     id_archivo          NUMBER  NOT NULL , 
     nombre_archivo      VARCHAR2 (255)  NOT NULL , 
     estado_archivo      NUMBER  NOT NULL , 
     ruta_archivo        VARCHAR2 (500)  NOT NULL , 
     tamano_archivo      NUMBER  NOT NULL , 
     tipo_archivo        VARCHAR2 (50)  NOT NULL , 
     fecha_carga_archivo DATE  NOT NULL , 
     USUARIO_rut_usuario VARCHAR2 (10)  NOT NULL 
    ) 
;

ALTER TABLE ARCHIVO 
    ADD CONSTRAINT ARCHIVO_PK PRIMARY KEY ( id_archivo ) ;

CREATE TABLE AUDITORIA 
    ( 
     id_auditoria        NUMBER  NOT NULL , 
     recurso             VARCHAR2 (100)  NOT NULL , 
     id_recurso          VARCHAR2 (20) , 
     descripcion         VARCHAR2 (500) , 
     fecha_cambio        DATE  NOT NULL , 
     accion_realizada    VARCHAR2 (20)  NOT NULL , 
     error               NUMBER  NOT NULL , 
     USUARIO_rut_usuario VARCHAR2 (10)  NOT NULL 
    ) 
;

ALTER TABLE AUDITORIA 
    ADD CONSTRAINT AUDITORIA_PK PRIMARY KEY ( id_auditoria ) ;

CREATE TABLE CANCHA 
    ( 
     id_cancha            NUMBER  NOT NULL , 
     nombre_cancha        VARCHAR2 (50)  NOT NULL , 
     superficie_cancha    UNKNOWN 
--  ERROR: Datatype UNKNOWN is not allowed 
                     NOT NULL , 
     direccion            VARCHAR2 (300)  NOT NULL , 
     cancha_activa        NUMBER  NOT NULL , 
     ultimo_mantenimiento DATE , 
     observaciones        VARCHAR2 (500)  NOT NULL , 
     fecha_creacion       DATE , 
     fecha_modificacion   DATE  NOT NULL 
    ) 
;

ALTER TABLE CANCHA 
    ADD 
    CHECK (superficie_cancha IN (CESPED_NATURAL, CESPED_SINTETICO, TIERRA)) 
;

ALTER TABLE CANCHA 
    ADD CONSTRAINT CANCHA_PK PRIMARY KEY ( id_cancha ) ;

CREATE TABLE CLUB 
    ( 
     id_club            NUMBER  NOT NULL , 
     rut_club           VARCHAR2 (10)  NOT NULL , 
     nombre_club        VARCHAR2 (250)  NOT NULL , 
     fecha_fundacion    DATE  NOT NULL , 
     fono_club          VARCHAR2 (12) , 
     direccion_club     VARCHAR2 (500)  NOT NULL , 
     email_club         VARCHAR2 (320)  NOT NULL , 
     logo_club          VARCHAR2 (255)  NOT NULL , 
     color_primario     VARCHAR2 (7)  NOT NULL , 
     color_secundario   VARCHAR2 (7)  NOT NULL , 
     color_respaldo     VARCHAR2 (7) , 
     club_activo        NUMBER  NOT NULL , 
     fecha_creacion     DATE  NOT NULL , 
     fecha_modificacion DATE  NOT NULL 
    ) 
;

ALTER TABLE CLUB 
    ADD CONSTRAINT CLUB_PK PRIMARY KEY ( id_club ) ;

CREATE TABLE DETALLE_ESTADO_PARTIDO 
    ( 
     fecha_estado             DATE  NOT NULL , 
     descripcion_estado       VARCHAR2 (1000)  NOT NULL , 
     ESTADO_PARTIDO_id_estado NUMBER  NOT NULL , 
     PARTIDO_id_partido       NUMBER  NOT NULL 
    ) 
;

ALTER TABLE DETALLE_ESTADO_PARTIDO 
    ADD CONSTRAINT DETALLE_ESTADO_PARTIDO_PK PRIMARY KEY ( fecha_estado, ESTADO_PARTIDO_id_estado, PARTIDO_id_partido ) ;

CREATE TABLE DETALLE_JUGADOR_CLUB 
    ( 
     fecha_ini           DATE  NOT NULL , 
     fecha_fin           DATE , 
     CLUB_id_club        NUMBER  NOT NULL , 
     JUGADOR_rut_jugador VARCHAR2 (10)  NOT NULL 
    ) 
;

ALTER TABLE DETALLE_JUGADOR_CLUB 
    ADD CONSTRAINT DETALLE_JUGADOR_CLUB_PK PRIMARY KEY ( fecha_ini, CLUB_id_club, JUGADOR_rut_jugador ) ;

CREATE TABLE DETALLE_USUARIO_CLUB 
    ( 
     fecha_ini           DATE  NOT NULL , 
     fecha_fin           DATE , 
     CLUB_id_club        NUMBER  NOT NULL , 
     USUARIO_rut_usuario VARCHAR2 (10)  NOT NULL 
    ) 
;

ALTER TABLE DETALLE_USUARIO_CLUB 
    ADD CONSTRAINT DETALLE_USUARIO_CLUB_PK PRIMARY KEY ( fecha_ini, CLUB_id_club, USUARIO_rut_usuario ) ;

CREATE TABLE ENTRENAMIENTO 
    ( 
     id_entrenamiento          NUMBER  NOT NULL , 
     fecha_entrenamiento       DATE  NOT NULL , 
     hora_ini                  DATE  NOT NULL , 
     hora_fin                  DATE  NOT NULL , 
     descripcion_entrenamiento VARCHAR2 (500) , 
     activo                    NUMBER  NOT NULL , 
     fecha_creacion            DATE  NOT NULL , 
     fecha_modificacion        DATE  NOT NULL , 
     USUARIO_rut_usuario       VARCHAR2 (10)  NOT NULL 
    ) 
;

ALTER TABLE ENTRENAMIENTO 
    ADD CONSTRAINT ENTRENAMIENTO_PK PRIMARY KEY ( id_entrenamiento ) ;

CREATE TABLE ESTADO_PARTIDO 
    ( 
     id_estado          NUMBER  NOT NULL , 
     estado_partido     UNKNOWN 
--  ERROR: Datatype UNKNOWN is not allowed 
                     NOT NULL , 
     fecha_creacion     DATE  NOT NULL , 
     fecha_modificacion DATE  NOT NULL 
    ) 
;

ALTER TABLE ESTADO_PARTIDO 
    ADD 
    CHECK (estado_partido IN (CANCELADO, EN_CURSO, FINALIZADO, PROGRAMADO)) 
;

ALTER TABLE ESTADO_PARTIDO 
    ADD CONSTRAINT ESTADO_PARTIDO_PK PRIMARY KEY ( id_estado ) ;

CREATE TABLE FAS 
    ( 
     id_fas             NUMBER  NOT NULL , 
     anio_fas           NUMBER  NOT NULL , 
     monto_inicial      NUMBER  NOT NULL , 
     monto_disponible   NUMBER  NOT NULL , 
     descripcion        VARCHAR2 (255) , 
     fecha_creacion     DATE  NOT NULL , 
     fecha_modificacion DATE  NOT NULL 
    ) 
;

ALTER TABLE FAS 
    ADD CONSTRAINT FAS_PK PRIMARY KEY ( id_fas ) ;

CREATE TABLE FICHA_JUGADOR 
    ( 
     fecha_ini           DATE  NOT NULL , 
     fecha_fin           DATE , 
     talla_camiseta      VARCHAR2 (5) , 
     talla_short         VARCHAR2 (5) , 
     talla_media         VARCHAR2 (2) , 
     talla_botin         VARCHAR2 (2) , 
     estatura            UNKNOWN 
--  ERROR: Datatype UNKNOWN is not allowed 
                    , 
     peso                UNKNOWN 
--  ERROR: Datatype UNKNOWN is not allowed 
                    , 
     IMC                 UNKNOWN 
--  ERROR: Datatype UNKNOWN is not allowed 
                    , 
     fecha_creacion      DATE  NOT NULL , 
     fecha_modificacion  DATE  NOT NULL , 
     SERIE_id_serie      NUMBER  NOT NULL , 
     JUGADOR_rut_jugador VARCHAR2 (10)  NOT NULL 
    ) 
;

ALTER TABLE FICHA_JUGADOR 
    ADD CONSTRAINT FICHA_JUGADOR_PK PRIMARY KEY ( fecha_ini, SERIE_id_serie, JUGADOR_rut_jugador ) ;

CREATE TABLE JUGADOR 
    ( 
     rut_jugador           VARCHAR2 (10)  NOT NULL , 
     primer_nombre         VARCHAR2 (30)  NOT NULL , 
     segundo_nombre        VARCHAR2 (30) , 
     primer_apellido       VARCHAR2 (30)  NOT NULL , 
     segundo_apellido      VARCHAR2 (30) , 
     genero                NUMBER  NOT NULL , 
     fecha_nacimiento      DATE  NOT NULL , 
     enfermedades_cronicas VARCHAR2 (500) , 
     fono_jugador          VARCHAR2 (12) , 
     jugador_activo        NUMBER  NOT NULL , 
     fecha_creacion        DATE  NOT NULL , 
     fecha_modificacion    DATE  NOT NULL 
    ) 
;

ALTER TABLE JUGADOR 
    ADD CONSTRAINT JUGADOR_PK PRIMARY KEY ( rut_jugador ) ;

CREATE TABLE LESION 
    ( 
     id_lesion           NUMBER  NOT NULL , 
     nombre_lesion       VARCHAR2 (100) , 
     tipo_lesion         NUMBER  NOT NULL , 
     descripcion         VARCHAR2 (500)  NOT NULL , 
     tiempo_recuperacion NUMBER , 
     fecha_lesion        DATE  NOT NULL , 
     fecha_fin_lesion    DATE , 
     fecha_creacion      DATE  NOT NULL , 
     fecha_modificacion  DATE  NOT NULL , 
     JUGADOR_rut_jugador VARCHAR2 (10)  NOT NULL 
    ) 
;

ALTER TABLE LESION 
    ADD CONSTRAINT LESION_PK PRIMARY KEY ( id_lesion ) ;

CREATE TABLE ORDEN_PAGO 
    ( 
     id                   NUMBER  NOT NULL , 
     id_orden_pago        VARCHAR2 (12)  NOT NULL , 
     tipo_orden           VARCHAR2 (40)  NOT NULL , 
     tipo_movimiento      VARCHAR2 (30)  NOT NULL , 
     tipo_pago            VARCHAR2 (30) , 
     monto                NUMBER  NOT NULL , 
     metodo_pago          VARCHAR2 (20) , 
     numero_transaccion   VARCHAR2 (50) , 
     descripcion          VARCHAR2 (500) , 
     estado_orden         VARCHAR2 (30)  NOT NULL , 
     fecha_emision        DATE  NOT NULL , 
     fecha_vencimiento    DATE , 
     fecha_pago           DATE , 
     fecha_modificacion   DATE  NOT NULL , 
     USUARIO_rut_usuario1 VARCHAR2 (10)  NOT NULL , 
     USUARIO_rut_usuario  VARCHAR2 (10)  NOT NULL , 
     CLUB_id_club         NUMBER 
    ) 
;

ALTER TABLE ORDEN_PAGO 
    ADD 
    CHECK (tipo_orden IN ('donacion', 'mensualidad', 'multa', 'otro', 'pase', 'servicio_basico', 'subvencion')) 
;

ALTER TABLE ORDEN_PAGO 
    ADD 
    CHECK (tipo_movimiento IN ('egreso', 'ingreso')) 
;

ALTER TABLE ORDEN_PAGO 
    ADD 
    CHECK (tipo_pago IN ('efectivo', 'na', 'otro', 'pago_linea', 'transferencia')) 
;

ALTER TABLE ORDEN_PAGO 
    ADD 
    CHECK (estado_orden IN ('anulada', 'pagada', 'pendiente', 'vencida')) 
;

ALTER TABLE ORDEN_PAGO 
    ADD CONSTRAINT ORDEN_PAGO_PK PRIMARY KEY ( id ) ;

CREATE TABLE PARTIDO 
    ( 
     SERIE_id_serie     NUMBER  NOT NULL , 
     SERIE_id_serie1    NUMBER  NOT NULL , 
     CANCHA_id_cancha   NUMBER  NOT NULL , 
     id_partido         NUMBER  NOT NULL , 
     fecha_partido      DATE  NOT NULL , 
     hora_ini_partido   DATE  NOT NULL , 
     hora_fin_partido   DATE , 
     goles_local        NUMBER  NOT NULL , 
     goles_visita       NUMBER  NOT NULL , 
     tipo_partido       UNKNOWN 
--  ERROR: Datatype UNKNOWN is not allowed 
                     NOT NULL , 
     observaciones      VARCHAR2 (500) , 
     fecha_creacion     DATE  NOT NULL , 
     fecha_modificacion DATE  NOT NULL , 
     estado_partido     UNKNOWN 
--  ERROR: Datatype UNKNOWN is not allowed 
                     NOT NULL 
    ) 
;

ALTER TABLE PARTIDO 
    ADD 
    CHECK (tipo_partido IN (AMISTOSO, CAMPEONATO, FINAL, PLAYOFF)) 
;

ALTER TABLE PARTIDO 
    ADD 
    CHECK (estado_partido IN (CANCELADO, EN_CURSO, FINALIZADO, PROGRAMADO)) 
;

ALTER TABLE PARTIDO 
    ADD CONSTRAINT PARTIDO_PK PRIMARY KEY ( id_partido ) ;

CREATE TABLE RECUPERACION_CONTRASENA 
    ( 
     id                  NUMBER  NOT NULL , 
     token               VARCHAR2 
--  ERROR: VARCHAR2 size not specified 
                     NOT NULL , 
     expiracion          DATE  NOT NULL , 
     USUARIO_rut_usuario VARCHAR2 (10)  NOT NULL 
    ) 
;

ALTER TABLE RECUPERACION_CONTRASENA 
    ADD CONSTRAINT RECUPERACION_CONTRASENA_PK PRIMARY KEY ( id ) ;

CREATE TABLE RENDIMIENTO_ENTRENAMIENTO 
    ( 
     frecuencia_cardiaca            NUMBER , 
     velocidad                      NUMBER , 
     duracion_recorrido             NUMBER , 
     nivel_oxigeno                  NUMBER , 
     observaciones                  VARCHAR2 (500) , 
     asistencia                     NUMBER  NOT NULL , 
     JUGADOR_rut_jugador            VARCHAR2 (10)  NOT NULL , 
     ENTRENAMIENTO_id_entrenamiento NUMBER  NOT NULL 
    ) 
;

ALTER TABLE RENDIMIENTO_ENTRENAMIENTO 
    ADD CONSTRAINT RENDIMIENTO_ENTRENAMIENTO_PK PRIMARY KEY ( JUGADOR_rut_jugador, ENTRENAMIENTO_id_entrenamiento ) ;

CREATE TABLE RENDIMIENTO_PARTIDO 
    ( 
     FICHA_JUGADOR_fecha_ini           DATE  NOT NULL , 
     FICHA_JUGADOR_SERIE_id_serie      NUMBER  NOT NULL , 
--  ERROR: Column name length exceeds maximum allowed length(30) 
     FICHA_JUGADOR_JUGADOR_rut_jugador VARCHAR2 (10)  NOT NULL , 
     PARTIDO_id_partido                NUMBER  NOT NULL , 
     tiempo_jugado                     NUMBER  NOT NULL , 
     goles                             NUMBER  NOT NULL , 
     asistencias                       NUMBER  NOT NULL , 
     amonestaciones                    NUMBER  NOT NULL , 
     amonestaciones_amarillas          NUMBER  NOT NULL , 
     amonestaciones_rojas              NUMBER  NOT NULL 
    ) 
;

ALTER TABLE RENDIMIENTO_PARTIDO 
    ADD CONSTRAINT RENDIMIENTO_PARTIDO_PK PRIMARY KEY ( FICHA_JUGADOR_fecha_ini, FICHA_JUGADOR_SERIE_id_serie, FICHA_JUGADOR_JUGADOR_rut_jugador, PARTIDO_id_partido ) ;

CREATE TABLE REUNION 
    ( 
     id_reunion         NUMBER  NOT NULL , 
     tipo_reunion       NUMBER  NOT NULL , 
     fecha_reunion      DATE  NOT NULL , 
     hora_reunion       DATE  NOT NULL , 
     titulo_reunion     VARCHAR2 (320)  NOT NULL , 
     lugar_reunion      VARCHAR2 (500)  NOT NULL , 
     fecha_creacion     DATE  NOT NULL , 
     fecha_modificacion DATE  NOT NULL 
    ) 
;

ALTER TABLE REUNION 
    ADD CONSTRAINT REUNION_PK PRIMARY KEY ( id_reunion ) ;

CREATE TABLE ROL 
    ( 
     id_rol             NUMBER  NOT NULL , 
     nombre_rol         VARCHAR2 (50)  NOT NULL , 
     desc_rol           VARCHAR2 (500) , 
     rol_activo         NUMBER  NOT NULL , 
     fecha_creacion     DATE  NOT NULL , 
     fecha_modificacion DATE  NOT NULL 
    ) 
;

ALTER TABLE ROL 
    ADD CONSTRAINT ROL_PK PRIMARY KEY ( id_rol ) ;

CREATE TABLE SERIE 
    ( 
     id_serie           NUMBER  NOT NULL , 
     nombre_serie       VARCHAR2 (30)  NOT NULL , 
     serie_activa       NUMBER  NOT NULL , 
     fecha_creacion     DATE  NOT NULL , 
     fecha_modificacion DATE  NOT NULL , 
     CLUB_id_club       NUMBER  NOT NULL 
    ) 
;

ALTER TABLE SERIE 
    ADD CONSTRAINT SERIE_PK PRIMARY KEY ( id_serie ) ;

CREATE TABLE SOLICITUD 
    ( 
     id_solicitud         NUMBER  NOT NULL , 
     categoria            NUMBER  NOT NULL , 
     descripcion          VARCHAR2 (500) , 
     estado               NUMBER  NOT NULL , 
     respuesta            VARCHAR2 (500) , 
     fecha_creacion       DATE  NOT NULL , 
     fecha_modificacion   DATE  NOT NULL , 
     USUARIO_rut_usuario1 VARCHAR2 (10)  NOT NULL , 
     USUARIO_rut_usuario  VARCHAR2 (10)  NOT NULL 
    ) 
;

ALTER TABLE SOLICITUD 
    ADD CONSTRAINT SOLICITUD_PK PRIMARY KEY ( id_solicitud ) ;

CREATE TABLE USO_FAS 
    ( 
     id_uso_fas          NUMBER  NOT NULL , 
     descripcion_gasto   VARCHAR2 (500) , 
     monto_uso           NUMBER  NOT NULL , 
     fecha_uso           DATE  NOT NULL , 
     fecha_creacion      DATE  NOT NULL , 
     fecha_modificacion  DATE  NOT NULL , 
     JUGADOR_rut_jugador VARCHAR2 (10)  NOT NULL , 
     FAS_id_fas          NUMBER  NOT NULL 
    ) 
;

ALTER TABLE USO_FAS 
    ADD CONSTRAINT USO_FAS_PK PRIMARY KEY ( id_uso_fas, JUGADOR_rut_jugador, FAS_id_fas ) ;

CREATE TABLE USUARIO 
    ( 
     rut_usuario        VARCHAR2 (10)  NOT NULL , 
     email_usuario      VARCHAR2 (320)  NOT NULL , 
     pass_usuario       VARCHAR2 (300)  NOT NULL , 
     nombre_usuario     VARCHAR2 (50)  NOT NULL , 
     apellido_usuario   VARCHAR2 (50)  NOT NULL , 
     fecha_nacimiento   DATE  NOT NULL , 
     huella_pulgar      VARCHAR2 (256) , 
     huella_indice      VARCHAR2 (256) , 
     usuario_activo     NUMBER  NOT NULL , 
     asociacion         NUMBER  NOT NULL , 
     fecha_creacion     DATE  NOT NULL , 
     fecha_modificacion DATE  NOT NULL , 
     ROL_id_rol         NUMBER  NOT NULL 
    ) 
;

ALTER TABLE USUARIO 
    ADD CONSTRAINT USUARIO_PK PRIMARY KEY ( rut_usuario ) ;

CREATE TABLE usuario_reunion 
    ( 
     USUARIO_rut_usuario VARCHAR2 (10)  NOT NULL , 
     REUNION_id_reunion  NUMBER  NOT NULL 
    ) 
;

ALTER TABLE usuario_reunion 
    ADD CONSTRAINT usuario_reunion_PK PRIMARY KEY ( USUARIO_rut_usuario, REUNION_id_reunion ) ;

ALTER TABLE ARCHIVO 
    ADD CONSTRAINT ARCHIVO_USUARIO_FK FOREIGN KEY 
    ( 
     USUARIO_rut_usuario
    ) 
    REFERENCES USUARIO 
    ( 
     rut_usuario
    ) 
;

ALTER TABLE AUDITORIA 
    ADD CONSTRAINT AUDITORIA_USUARIO_FK FOREIGN KEY 
    ( 
     USUARIO_rut_usuario
    ) 
    REFERENCES USUARIO 
    ( 
     rut_usuario
    ) 
;

--  ERROR: FK name length exceeds maximum allowed length(30) 
ALTER TABLE DETALLE_ESTADO_PARTIDO 
    ADD CONSTRAINT DETALLE_ESTADO_PARTIDO_ESTADO_PARTIDO_FK FOREIGN KEY 
    ( 
     ESTADO_PARTIDO_id_estado
    ) 
    REFERENCES ESTADO_PARTIDO 
    ( 
     id_estado
    ) 
;

--  ERROR: FK name length exceeds maximum allowed length(30) 
ALTER TABLE DETALLE_ESTADO_PARTIDO 
    ADD CONSTRAINT DETALLE_ESTADO_PARTIDO_PARTIDO_FK FOREIGN KEY 
    ( 
     PARTIDO_id_partido
    ) 
    REFERENCES PARTIDO 
    ( 
     id_partido
    ) 
;

ALTER TABLE DETALLE_JUGADOR_CLUB 
    ADD CONSTRAINT DETALLE_JUGADOR_CLUB_CLUB_FK FOREIGN KEY 
    ( 
     CLUB_id_club
    ) 
    REFERENCES CLUB 
    ( 
     id_club
    ) 
;

--  ERROR: FK name length exceeds maximum allowed length(30) 
ALTER TABLE DETALLE_JUGADOR_CLUB 
    ADD CONSTRAINT DETALLE_JUGADOR_CLUB_JUGADOR_FK FOREIGN KEY 
    ( 
     JUGADOR_rut_jugador
    ) 
    REFERENCES JUGADOR 
    ( 
     rut_jugador
    ) 
;

ALTER TABLE DETALLE_USUARIO_CLUB 
    ADD CONSTRAINT DETALLE_USUARIO_CLUB_CLUB_FK FOREIGN KEY 
    ( 
     CLUB_id_club
    ) 
    REFERENCES CLUB 
    ( 
     id_club
    ) 
;

--  ERROR: FK name length exceeds maximum allowed length(30) 
ALTER TABLE DETALLE_USUARIO_CLUB 
    ADD CONSTRAINT DETALLE_USUARIO_CLUB_USUARIO_FK FOREIGN KEY 
    ( 
     USUARIO_rut_usuario
    ) 
    REFERENCES USUARIO 
    ( 
     rut_usuario
    ) 
;

ALTER TABLE ENTRENAMIENTO 
    ADD CONSTRAINT ENTRENAMIENTO_USUARIO_FK FOREIGN KEY 
    ( 
     USUARIO_rut_usuario
    ) 
    REFERENCES USUARIO 
    ( 
     rut_usuario
    ) 
;

ALTER TABLE FICHA_JUGADOR 
    ADD CONSTRAINT FICHA_JUGADOR_JUGADOR_FK FOREIGN KEY 
    ( 
     JUGADOR_rut_jugador
    ) 
    REFERENCES JUGADOR 
    ( 
     rut_jugador
    ) 
;

ALTER TABLE FICHA_JUGADOR 
    ADD CONSTRAINT FICHA_JUGADOR_SERIE_FK FOREIGN KEY 
    ( 
     SERIE_id_serie
    ) 
    REFERENCES SERIE 
    ( 
     id_serie
    ) 
;

ALTER TABLE LESION 
    ADD CONSTRAINT LESION_JUGADOR_FK FOREIGN KEY 
    ( 
     JUGADOR_rut_jugador
    ) 
    REFERENCES JUGADOR 
    ( 
     rut_jugador
    ) 
;

ALTER TABLE ORDEN_PAGO 
    ADD CONSTRAINT ORDEN_PAGO_CLUB_FK FOREIGN KEY 
    ( 
     CLUB_id_club
    ) 
    REFERENCES CLUB 
    ( 
     id_club
    ) 
;

ALTER TABLE ORDEN_PAGO 
    ADD CONSTRAINT ORDEN_PAGO_USUARIO_FK FOREIGN KEY 
    ( 
     USUARIO_rut_usuario
    ) 
    REFERENCES USUARIO 
    ( 
     rut_usuario
    ) 
;

ALTER TABLE ORDEN_PAGO 
    ADD CONSTRAINT ORDEN_PAGO_USUARIO_FKv1 FOREIGN KEY 
    ( 
     USUARIO_rut_usuario1
    ) 
    REFERENCES USUARIO 
    ( 
     rut_usuario
    ) 
;

ALTER TABLE PARTIDO 
    ADD CONSTRAINT PARTIDO_CANCHA_FK FOREIGN KEY 
    ( 
     CANCHA_id_cancha
    ) 
    REFERENCES CANCHA 
    ( 
     id_cancha
    ) 
;

ALTER TABLE PARTIDO 
    ADD CONSTRAINT PARTIDO_SERIE_FK FOREIGN KEY 
    ( 
     SERIE_id_serie
    ) 
    REFERENCES SERIE 
    ( 
     id_serie
    ) 
;

ALTER TABLE PARTIDO 
    ADD CONSTRAINT PARTIDO_SERIE_FKv1 FOREIGN KEY 
    ( 
     SERIE_id_serie1
    ) 
    REFERENCES SERIE 
    ( 
     id_serie
    ) 
;

--  ERROR: FK name length exceeds maximum allowed length(30) 
ALTER TABLE RECUPERACION_CONTRASENA 
    ADD CONSTRAINT RECUPERACION_CONTRASENA_USUARIO_FK FOREIGN KEY 
    ( 
     USUARIO_rut_usuario
    ) 
    REFERENCES USUARIO 
    ( 
     rut_usuario
    ) 
;

--  ERROR: FK name length exceeds maximum allowed length(30) 
ALTER TABLE RENDIMIENTO_ENTRENAMIENTO 
    ADD CONSTRAINT RENDIMIENTO_ENTRENAMIENTO_ENTRENAMIENTO_FK FOREIGN KEY 
    ( 
     ENTRENAMIENTO_id_entrenamiento
    ) 
    REFERENCES ENTRENAMIENTO 
    ( 
     id_entrenamiento
    ) 
;

--  ERROR: FK name length exceeds maximum allowed length(30) 
ALTER TABLE RENDIMIENTO_ENTRENAMIENTO 
    ADD CONSTRAINT RENDIMIENTO_ENTRENAMIENTO_JUGADOR_FK FOREIGN KEY 
    ( 
     JUGADOR_rut_jugador
    ) 
    REFERENCES JUGADOR 
    ( 
     rut_jugador
    ) 
;

--  ERROR: FK name length exceeds maximum allowed length(30) 
ALTER TABLE RENDIMIENTO_PARTIDO 
    ADD CONSTRAINT RENDIMIENTO_PARTIDO_FICHA_JUGADOR_FK FOREIGN KEY 
    ( 
     FICHA_JUGADOR_fecha_ini,
     FICHA_JUGADOR_SERIE_id_serie,
     FICHA_JUGADOR_JUGADOR_rut_jugador
    ) 
    REFERENCES FICHA_JUGADOR 
    ( 
     fecha_ini,
     SERIE_id_serie,
     JUGADOR_rut_jugador
    ) 
;

ALTER TABLE RENDIMIENTO_PARTIDO 
    ADD CONSTRAINT RENDIMIENTO_PARTIDO_PARTIDO_FK FOREIGN KEY 
    ( 
     PARTIDO_id_partido
    ) 
    REFERENCES PARTIDO 
    ( 
     id_partido
    ) 
;

ALTER TABLE SERIE 
    ADD CONSTRAINT SERIE_CLUB_FK FOREIGN KEY 
    ( 
     CLUB_id_club
    ) 
    REFERENCES CLUB 
    ( 
     id_club
    ) 
;

ALTER TABLE SOLICITUD 
    ADD CONSTRAINT SOLICITUD_USUARIO_FK FOREIGN KEY 
    ( 
     USUARIO_rut_usuario
    ) 
    REFERENCES USUARIO 
    ( 
     rut_usuario
    ) 
;

ALTER TABLE SOLICITUD 
    ADD CONSTRAINT SOLICITUD_USUARIO_FKv1 FOREIGN KEY 
    ( 
     USUARIO_rut_usuario1
    ) 
    REFERENCES USUARIO 
    ( 
     rut_usuario
    ) 
;

ALTER TABLE USO_FAS 
    ADD CONSTRAINT USO_FAS_FAS_FK FOREIGN KEY 
    ( 
     FAS_id_fas
    ) 
    REFERENCES FAS 
    ( 
     id_fas
    ) 
;

ALTER TABLE USO_FAS 
    ADD CONSTRAINT USO_FAS_JUGADOR_FK FOREIGN KEY 
    ( 
     JUGADOR_rut_jugador
    ) 
    REFERENCES JUGADOR 
    ( 
     rut_jugador
    ) 
;

ALTER TABLE usuario_reunion 
    ADD CONSTRAINT usuario_reunion_REUNION_FK FOREIGN KEY 
    ( 
     REUNION_id_reunion
    ) 
    REFERENCES REUNION 
    ( 
     id_reunion
    ) 
;

ALTER TABLE usuario_reunion 
    ADD CONSTRAINT usuario_reunion_USUARIO_FK FOREIGN KEY 
    ( 
     USUARIO_rut_usuario
    ) 
    REFERENCES USUARIO 
    ( 
     rut_usuario
    ) 
;

ALTER TABLE USUARIO 
    ADD CONSTRAINT USUARIO_ROL_FK FOREIGN KEY 
    ( 
     ROL_id_rol
    ) 
    REFERENCES ROL 
    ( 
     id_rol
    ) 
;

