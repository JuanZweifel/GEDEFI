import React, { useState, useEffect, useMemo } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Plus, Edit, Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { AlertDialogHandle } from "../components/alert-dialog-component";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select";
import { useAuth } from "../contexts/authContext";
import { jwtDecode } from "jwt-decode";
import { postEntrenamiento, getSeries, putEntrenamiento, deleteEntrenamiento } from "../services/entrenamientoServices";
import { getCanchas } from "../services/canchaService";


type Entrenamiento = {
    id_entrenamiento: number;
    fecha_entrenamiento: string;
    descripcion_entrenamiento: string;
    entrenador_nombre: string;
    activo: boolean;
    rut_usuario: string;
    id_cancha?: number | null;
    id_serie: number;
    hora_ini: string;
    hora_fin: string;
    cancha_nombre: string;
    participantes: number;
};

type DecodedToken = {
    id_club: number;
    [key: string]: any;
}

type DialogAddEntrenamientoProps = {
    refreshEntrenamientos: () => Promise<void>;
}

type DialogEditEntrenamientoProps = {
    entrenamiento: Entrenamiento;
    refreshEntrenamientos: () => Promise<void>;
};

type DialogViewEntrenamientoProps = {
    entrenamiento: Entrenamiento;
};

type ButtonDeleteEntrenamientoProps = {
    id_entrenamiento: number;
    descripcion: string;
    refreshEntrenamientos: () => Promise<void>;
};




// Aqui comienza la logica de crear un entrenamiento
export const DialogAddEntrenamiento: React.FC<DialogAddEntrenamientoProps> = ({ refreshEntrenamientos }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

    const [fechaEntrenamiento, setFechaEntrenamiento] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [activo, setActivo] = useState(true);

    // Estados para canchas y series
    const [canchas, setCanchas] = useState<{ id_cancha: number; nombre_cancha: string }[]>([]);
    const [idCancha, setIdCancha] = useState<number | null>(null);

    const [series, setSeries] = useState<{ id_serie: number; nombre_serie: string; id_club?: number }[]>([]);
    const [idSerie, setIdSerie] = useState<number | null>(null);

    const [horaInicio, setHoraInicio] = useState("");
    const [horaFin, setHoraFin] = useState("");

    const { token } = useAuth();

    // Cargar canchas y series solo cuando se abre el diálogo
    useEffect(() => {
        if (!token || !isOpen) return;

        const fetchData = async () => {
            try {
                // Log del token completo
                console.log("Token JWT:", token);

                // Decodificar token
                const decoded: any = jwtDecode(token);
                console.log("Token decodificado:", decoded);

                // Log de cada parámetro dentro del token
                console.log("RUT del usuario:", decoded.rut);
                console.log("ID del club:", decoded.club_id);

                // Cargar canchas
                const dataCanchas = await getCanchas(token);
                setCanchas(dataCanchas);

                // Traer todas las series
                const dataSeries = await getSeries<{ id_serie: number; nombre_serie: string; id_club: number }[]>(token);

                // Filtrar solo las series del club del usuario
                const seriesUsuario = dataSeries.filter(serie => serie.id_club === decoded.id_club);
                setSeries(seriesUsuario);
            } catch (error) {
                console.error("Error al cargar canchas o series:", error);
                toast.error("No se pudieron cargar canchas o series");
            }
        };

        fetchData();
    }, [token, isOpen]);

    const resetForm = () => {
        setFechaEntrenamiento("");
        setDescripcion("");
        setActivo(true);
        setIdCancha(null);
        setIdSerie(null);
    };

    const handleSave = async () => {
        if (!token) {
            toast.error("Usuario no autenticado");
            return;
        }

        let decoded: { rut: string };
        try {
            decoded = jwtDecode<{ rut: string }>(token);
        } catch {
            toast.error("Token inválido");
            return;
        }

        if (!idCancha) {
            toast.error("Debe seleccionar una cancha");
            return;
        }

        if (!idSerie) {
            toast.error("Debe seleccionar una serie");
            return;
        }

        setIsLoading(true);
        try {
            await postEntrenamiento(
                {
                    fecha_entrenamiento: fechaEntrenamiento,
                    descripcion_entrenamiento: descripcion,
                    activo,
                    rut_usuario: decoded.rut,
                    id_cancha: idCancha,
                    id_serie: idSerie,
                    hora_ini: horaInicio,
                    hora_fin: horaFin,

                },
                token
            );
            toast.success("Entrenamiento creado correctamente");
            await refreshEntrenamientos();
            setIsOpen(false);
            resetForm();
        } catch (error: any) {
            toast.error(error.message || "Error al crear entrenamiento");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button style={{ backgroundColor: "#0000db" }} className="text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo Entrenamiento
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Agregar Entrenamiento</DialogTitle>
                    </DialogHeader>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            setIsConfirmDialogOpen(true);
                        }}
                        className="flex flex-col gap-4"
                    >
                        {/* Fecha */}
                        <div className="flex flex-col">
                            <label>Fecha Entrenamiento *</label>
                            <Input
                                type="date"
                                value={fechaEntrenamiento}
                                onChange={(e) => setFechaEntrenamiento(e.target.value)}
                                required
                                min={new Date().toISOString().split("T")[0]}
                            />
                        </div>

                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Hora Inicio */}
                            <div className="flex flex-col flex-1">
                                <label>Hora de Inicio *</label>
                                <Select
                                    value={horaInicio}
                                    onValueChange={(v: string) => setHoraInicio(v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona hora de inicio" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: 48 }, (_, i) => {
                                            const hours = Math.floor(i / 2);
                                            const minutes = i % 2 === 0 ? "00" : "30";
                                            const time = `${hours.toString().padStart(2, "0")}:${minutes}`;
                                            return (
                                                <SelectItem key={time} value={time}>
                                                    {time}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Hora Fin */}
                            <div className="flex flex-col flex-1">
                                <label>Hora de Fin *</label>
                                <Select
                                    value={horaFin}
                                    onValueChange={(v: string) => setHoraFin(v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona hora de fin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: 48 }, (_, i) => {
                                            const hours = Math.floor(i / 2);
                                            const minutes = i % 2 === 0 ? "00" : "30";
                                            const time = `${hours.toString().padStart(2, "0")}:${minutes}`;
                                            return (
                                                <SelectItem key={time} value={time}>
                                                    {time}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Descripción */}
                        <div className="flex flex-col">
                            <label>Descripción *</label>
                            <Input
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                                required
                            />
                        </div>

                        {/* Select Cancha */}
                        <div className="flex flex-col">
                            <label>Cancha *</label>
                            <Select
                                value={idCancha ? idCancha.toString() : ""}
                                onValueChange={(v: string) => setIdCancha(Number(v))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona una cancha" />
                                </SelectTrigger>
                                <SelectContent>
                                    {canchas.map((cancha) => (
                                        <SelectItem key={cancha.id_cancha} value={cancha.id_cancha.toString()}>
                                            {cancha.nombre_cancha}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Select Serie */}
                        <div className="flex flex-col">
                            <label>Serie *</label>
                            <Select
                                value={idSerie ? idSerie.toString() : ""}
                                onValueChange={(v: string) => setIdSerie(Number(v))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona una serie" />
                                </SelectTrigger>
                                <SelectContent>
                                    {series.map((serie) => (
                                        <SelectItem key={serie.id_serie} value={serie.id_serie.toString()}>
                                            {serie.nombre_serie}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Botones */}
                        <div className="flex justify-end gap-2 mt-4">
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => {
                                    setIsOpen(false);
                                    resetForm();
                                }}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Guardando..." : "Guardar"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialogHandle
                title="Confirmar registro"
                description={`¿Está seguro que desea registrar el entrenamiento "${descripcion}"?`}
                confirmLabel="Registrar"
                cancelLabel="Cancelar"
                open={isConfirmDialogOpen}
                onOpenChange={setIsConfirmDialogOpen}
                onConfirm={async () => {
                    setIsConfirmDialogOpen(false);
                    await handleSave();
                }}
            />
        </>
    );
};
// Aqui termina la logica de crear un entrenamiento


// Aqui comienza la logica de editar un entrenamiento
export const DialogEditEntrenamiento: React.FC<DialogEditEntrenamientoProps> = ({
    entrenamiento,
    refreshEntrenamientos,
}) => {
    const [fechaEntrenamiento, setFechaEntrenamiento] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [activo, setActivo] = useState(true);
    const [idCancha, setIdCancha] = useState<number | null>(null);
    const [idSerie, setIdSerie] = useState<number | null>(null);

    const [series, setSeries] = useState<{ id_serie: number; nombre_serie: string; id_club: number }[]>([]);
    const [canchas, setCanchas] = useState<{ id_cancha: number; nombre_cancha: string }[]>([]);
    const [listasCargadas, setListasCargadas] = useState(false);

    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

    const [soloLectura, setSoloLectura] = useState(false);

    const { token } = useAuth();

    useEffect(() => {
        // Si el entrenamiento está finalizado (activo = false), se bloquea la edición
        setSoloLectura(!entrenamiento.activo);
    }, [entrenamiento]);

    // 🔹 Cargar listas al abrir el modal
    useEffect(() => {
        const cargarListas = async () => {
            if (!isOpen || !token) return;
            try {
                const decoded: DecodedToken = jwtDecode(token);
                const idClub = decoded.id_club;

                const [seriesData, canchasData] = await Promise.all([
                    getSeries<{ id_serie: number; nombre_serie: string; id_club: number }[]>(token),
                    getCanchas<{ id_cancha: number; nombre_cancha: string }[]>(token),
                ]);

                // 🔹 Filtrar solo las series del club del usuario
                const seriesUsuario = seriesData.filter((s) => s.id_club === idClub);

                setSeries(seriesUsuario);
                setCanchas(canchasData);
                setListasCargadas(true);
            } catch (error) {
                toast.error("No se pudieron cargar series o canchas");
                console.error("Error al cargar listas:", error);
            }
        };
        cargarListas();
    }, [isOpen, token]);

    // 🔹 Asignar valores del entrenamiento solo cuando existan las listas
    useEffect(() => {
        if (entrenamiento && listasCargadas && isOpen) {
            setFechaEntrenamiento(entrenamiento.fecha_entrenamiento);
            setDescripcion(entrenamiento.descripcion_entrenamiento);
            setActivo(entrenamiento.activo);
            setIdCancha(entrenamiento.id_cancha || null);
            setIdSerie(entrenamiento.id_serie || null);
        }
    }, [entrenamiento, listasCargadas, isOpen]);

    // 🔹 Resetear formulario
    const resetForm = () => {
        if (!entrenamiento) return;
        setFechaEntrenamiento(entrenamiento.fecha_entrenamiento);
        setDescripcion(entrenamiento.descripcion_entrenamiento);
        setActivo(entrenamiento.activo);
        setIdCancha(entrenamiento.id_cancha || null);
        setIdSerie(entrenamiento.id_serie || null);
    };

    // 🔹 Guardar cambios
    const handleSave = async () => {
        if (!entrenamiento || !token) return;
        setIsLoading(true);
        try {
            await putEntrenamiento(
                entrenamiento.id_entrenamiento,
                {
                    fecha_entrenamiento: fechaEntrenamiento,
                    descripcion_entrenamiento: descripcion,
                    activo,
                    id_cancha: idCancha,
                    id_serie: idSerie,
                },
                token
            );
            toast.success("Entrenamiento modificado correctamente");
            await refreshEntrenamientos();
            setIsOpen(false);
        } catch (error: any) {
            toast.error(error.message || "Error al modificar entrenamiento");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
                <Edit className="w-4 h-4" />
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Modificar Entrenamiento</DialogTitle>
                    </DialogHeader>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (!soloLectura) setIsConfirmDialogOpen(true);
                        }}
                        className="flex flex-col gap-4"
                    >
                        {/* 📅 Fecha */}
                        <div className="flex flex-col">
                            <label>Fecha Entrenamiento *</label>
                            <Input
                                type="date"
                                value={fechaEntrenamiento}
                                onChange={(e) => setFechaEntrenamiento(e.target.value)}
                                required
                                min={new Date().toISOString().split("T")[0]}
                                disabled={soloLectura} // 👈 Bloqueado si finalizado
                            />
                        </div>

                        {/* 📝 Descripción */}
                        <div className="flex flex-col">
                            <label>Descripción *</label>
                            <Input
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                                required
                                disabled={soloLectura} // 👈 Bloqueado si finalizado
                            />
                        </div>

                        {/* 🏟️ Cancha */}
                        <div className="flex flex-col">
                            <label>Cancha *</label>
                            <Select
                                value={idCancha?.toString() || ""}
                                onValueChange={(v: any) => setIdCancha(Number(v))}
                                required
                                disabled={soloLectura} // 👈
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar Cancha" />
                                </SelectTrigger>
                                <SelectContent>
                                    {canchas.map((c) => (
                                        <SelectItem key={c.id_cancha} value={c.id_cancha.toString()}>
                                            {c.nombre_cancha}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* 🏅 Serie */}
                        <div className="flex flex-col">
                            <label>Serie *</label>
                            <Select
                                value={idSerie?.toString() || ""}
                                onValueChange={(v: any) => setIdSerie(Number(v))}
                                required
                                disabled={soloLectura} // 👈
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar Serie" />
                                </SelectTrigger>
                                <SelectContent>
                                    {series.map((s) => (
                                        <SelectItem key={s.id_serie} value={s.id_serie.toString()}>
                                            {s.nombre_serie}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* 🔘 Estado */}
                        <div className="flex flex-col">
                            <label>Estado</label>
                            <Select
                                value={activo ? "true" : "false"}
                                onValueChange={(v: any) => setActivo(v === "true")}
                                disabled={soloLectura} // 👈 no puede cambiarlo si ya está finalizado
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="true">Programado</SelectItem>
                                    <SelectItem value="false">Finalizado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* 🧭 Botones */}
                        <div className="flex justify-end gap-2 mt-4">
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => {
                                    resetForm();
                                    setIsOpen(false);
                                }}
                            >
                                Cerrar
                            </Button>
                            <Button type="submit" disabled={soloLectura || isLoading}>
                                {isLoading ? "Guardando..." : "Guardar Cambios"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialogHandle
                title="Confirmar modificación"
                description={`¿Está seguro que desea modificar el entrenamiento "${descripcion}"?`}
                confirmLabel="Modificar"
                cancelLabel="Cancelar"
                open={isConfirmDialogOpen}
                onOpenChange={setIsConfirmDialogOpen}
                onConfirm={async () => {
                    setIsConfirmDialogOpen(false);
                    await handleSave();
                }}
            />
        </>
    );
};
// Aqui termina la logica de editar un entrenamiento


// Aqui comienza la logica de ver un entrenamiento
export const DialogViewEntrenamiento: React.FC<DialogViewEntrenamientoProps> = ({ entrenamiento }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
                    <Eye className="w-4 h-4" />
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Detalles del Entrenamiento</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">

                    {/* 🔹 Fila 1: Fecha + Entrenador (ocupan todo el ancho) */}
                    <div className="flex gap-4">
                        <div className="flex flex-col flex-1">
                            <label>Fecha Entrenamiento:</label>
                            <Input
                                value={
                                    entrenamiento.fecha_entrenamiento
                                        ? entrenamiento.fecha_entrenamiento
                                            .split("T")[0]
                                            .split("-")
                                            .reverse()
                                            .join("/")
                                        : ""
                                }
                                disabled
                            />
                        </div>
                        <div className="flex flex-col flex-1">
                            <label>Entrenador:</label>
                            <Input value={entrenamiento.entrenador_nombre} disabled />
                        </div>
                    </div>

                    {/* 🔹 Fila 2: Hora Inicio + Hora Fin */}
                    <div className="flex gap-4">
                        <div className="flex flex-col flex-1">
                            <label>Hora Inicio:</label>
                            <Input value={entrenamiento.hora_ini} disabled />
                        </div>
                        <div className="flex flex-col flex-1">
                            <label>Hora Fin:</label>
                            <Input value={entrenamiento.hora_fin} disabled />
                        </div>
                    </div>

                    {/* 🔹 Fila 3: cancha y participantes */}
                    <div className="flex gap-4">
                        <div className="flex flex-col flex-1">
                            <label>Cancha:</label>
                            <Input value={entrenamiento.cancha_nombre} disabled />
                        </div>
                        <div className="flex flex-col flex-1">
                            <label>Total de participantes:</label>
                            <Input value={entrenamiento.participantes} disabled />
                        </div>
                    </div>

                    {/* 🔹 Fila 4: Descripción */}
                    <div className="flex flex-col">
                        <label>Descripción:</label>
                        <Input value={entrenamiento.descripcion_entrenamiento} disabled />
                    </div>

                    {/* 🔹 Fila 5: Activo */}
                    <div className="flex flex-col">
                        <label>Estado:</label>
                        <Select value={entrenamiento.activo ? "true" : "false"} disabled>
                            <SelectTrigger style={{ cursor: "not-allowed" }}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="true">Programado</SelectItem>
                                <SelectItem value="false">Finalizado</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* 🔹 Botón */}
                    <div className="flex justify-end mt-4">
                        <Button variant="outline" onClick={() => setIsOpen(false)}>Cerrar</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
// Aqui termina la logica de ver un entrenamiento


// Aqui comienza la logica de eliminar un entrenamiento
export const ButtonDeleteEntrenamiento: React.FC<ButtonDeleteEntrenamientoProps> = ({
    id_entrenamiento,
    descripcion,
    refreshEntrenamientos,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            await deleteEntrenamiento(id_entrenamiento);
            toast.success(`Entrenamiento "${descripcion}" eliminado correctamente.`);
            await refreshEntrenamientos();
        } catch (error: any) {
            // 🔹 Manejo de errores personalizados
            if (error.response && error.response.status === 400) {
                toast.error("No se puede eliminar un entrenamiento finalizado.");
            } else if (error.response && error.response.status === 404) {
                toast.error("El entrenamiento no existe o ya fue eliminado.");
            } else {
                toast.error(error.message || "Error al eliminar entrenamiento.");
            }
        } finally {
            setIsLoading(false);
            setIsDialogOpen(false);
        }
    };

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-red-600 hover:bg-red-100"
                onClick={() => setIsDialogOpen(true)}
                disabled={isLoading}
            >
                <Trash2 className="w-4 h-4" />
            </Button>

            <AlertDialogHandle
                title="Confirmar eliminación"
                description={`¿Está seguro que desea eliminar el entrenamiento "${descripcion}"?`}
                confirmLabel="Eliminar"
                cancelLabel="Cancelar"
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onConfirm={async () => {
                    setIsDialogOpen(false);
                    await handleDelete();
                }}
            />
        </>
    );
};
// Aqui termina la logica de eliminar un entrenamiento

