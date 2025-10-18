import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Plus, Edit, Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { AlertDialogHandle } from "../components/alert-dialog-component";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select";
import { useAuth } from "../contexts/authContext";
import { jwtDecode } from "jwt-decode";
import { postEntrenamiento, getSeries } from "../services/entrenamientoServices";



const getCanchas = async (token: string) => {
    const response = await fetch("http://localhost:8000/canchas/", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        throw new Error("Error al obtener canchas");
    }
    return response.json();
};



type Entrenamiento = {
    id_entrenamiento: number;
    fecha_entrenamiento: string;
    descripcion_entrenamiento: string;
    activo: boolean;
    rut_usuario: string;
    id_cancha?: number | null;
};

interface DialogAddEntrenamientoProps {
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
                const seriesUsuario = dataSeries.filter(serie => serie.id_club === decoded.club_id);
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

                        {/* Select Activo */}
                        <div className="flex flex-col">
                            <label>Activo</label>
                            <Select
                                value={activo ? "true" : "false"}
                                onValueChange={(v: string) => setActivo(v === "true")}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="true">Sí</SelectItem>
                                    <SelectItem value="false">No</SelectItem>
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
export const DialogEditEntrenamiento: React.FC<DialogEditEntrenamientoProps> = ({ entrenamiento, refreshEntrenamientos }) => {
    const [fechaEntrenamiento, setFechaEntrenamiento] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [activo, setActivo] = useState(true);

    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

    useEffect(() => {
        if (entrenamiento && isOpen) {
            setFechaEntrenamiento(entrenamiento.fecha_entrenamiento);
            setDescripcion(entrenamiento.descripcion_entrenamiento);
            setActivo(entrenamiento.activo);
        }
    }, [entrenamiento, isOpen]);

    const resetForm = () => {
        if (!entrenamiento) return;
        setFechaEntrenamiento(entrenamiento.fecha_entrenamiento);
        setDescripcion(entrenamiento.descripcion_entrenamiento);
        setActivo(entrenamiento.activo);
    };

    const handleSave = async () => {
        if (!entrenamiento) return;
        setIsLoading(true);
        try {
            await putEntrenamiento(entrenamiento.id_entrenamiento, {
                fecha_entrenamiento: fechaEntrenamiento,
                descripcion_entrenamiento: descripcion,
                activo,
            });
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
                            setIsConfirmDialogOpen(true);
                        }}
                        className="flex flex-col gap-4"
                    >
                        <div className="flex flex-col">
                            <label>Fecha Entrenamiento *</label>
                            <Input
                                type="date"
                                value={fechaEntrenamiento}
                                onChange={(e) => setFechaEntrenamiento(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex flex-col">
                            <label>Descripción *</label>
                            <Input
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex flex-col">
                            <label>Activo</label>
                            <Select value={activo ? "true" : "false"} onValueChange={(v) => setActivo(v === "true")}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="true">Sí</SelectItem>
                                    <SelectItem value="false">No</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <Button variant="outline" type="button" onClick={() => { resetForm(); setIsOpen(false); }}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isLoading}>
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
                    <div className="flex flex-col">
                        <label>Fecha Entrenamiento:</label>
                        <Input value={entrenamiento.fecha_entrenamiento} disabled />
                    </div>
                    <div className="flex flex-col">
                        <label>Descripción:</label>
                        <Input value={entrenamiento.descripcion_entrenamiento} disabled />
                    </div>
                    <div className="flex flex-col">
                        <label>Activo:</label>
                        <Select value={entrenamiento.activo ? "true" : "false"} disabled>
                            <SelectTrigger style={{ cursor: "not-allowed" }}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="true">Sí</SelectItem>
                                <SelectItem value="false">No</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
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
export const ButtonDeleteEntrenamiento: React.FC<ButtonDeleteEntrenamientoProps> = ({ id_entrenamiento, descripcion, refreshEntrenamientos }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            await deleteEntrenamiento(id_entrenamiento);
            toast.success("Entrenamiento eliminado correctamente");
            await refreshEntrenamientos();
        } catch (error: any) {
            toast.error(error.message || "Error al eliminar entrenamiento");
        } finally {
            setIsLoading(false);
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

