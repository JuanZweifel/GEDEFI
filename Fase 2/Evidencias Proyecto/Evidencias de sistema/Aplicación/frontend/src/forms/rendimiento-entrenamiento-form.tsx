import { useState } from "react";
import { Eye } from "lucide-react";
import { Edit } from "lucide-react";
import { Trash2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { Select, SelectItem, SelectTrigger, SelectContent, SelectValue } from "../components/ui/select";
import { deleteRendimientoEntrenamiento } from "../services/rendimientoEntrenamientoService";
import { putRendimientoEntrenamiento } from "../services/rendimientoEntrenamientoService"; //
import { useAuth } from "../contexts/authContext";
import { AlertDialogHandle } from "../components/alert-dialog-component";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";

type RendimientoEntrenamiento = {
    id_rendimiento: number;
    id_entrenamiento: number;
    rut_jugador: string;
    asistencia: boolean;
    calificacion_tecnica?: number | null;
    calificacion_fisica?: number | null;
    observaciones?: string | null;
    fecha_entrenamiento?: string;
    hora_ini?: string;
    hora_fin?: string;
};

type DialogViewRendimientoEntrenamientoProps = {
    rendimiento: RendimientoEntrenamiento;
};

type DialogEditRendimientoEntrenamientoProps = {
    rendimiento: RendimientoEntrenamiento;
    refreshRendimientos: () => Promise<void>;
};

type ButtonDeleteRendimientoEntrenamientoProps = {
    id_rendimiento: number;
    jugador_nombre?: string;
    refreshRendimientos: () => Promise<void>;
};

export const DialogViewRendimientoEntrenamiento: React.FC< DialogViewRendimientoEntrenamientoProps > = ({ rendimiento }) => {
    const [isOpen, setIsOpen] = useState(false);

    if (!rendimiento) return null;

    //  Formatear la fecha al estilo chileno (dd-mm-aaaa)
    const fechaFormateada = rendimiento.fecha_entrenamiento
        ? new Date(`${rendimiento.fecha_entrenamiento}T00:00:00`)
            .toLocaleDateString("es-CL", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            })
        : "-";

    //  Formatear horas
    const horaInicio = rendimiento.hora_ini
        ? `${rendimiento.hora_ini.slice(0, 5)} hrs.`
        : "-";
    const horaFin = rendimiento.hora_fin
        ? `${rendimiento.hora_fin.slice(0, 5)} hrs.`
        : "-";

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
                    <Eye className="w-4 h-4" />
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Detalles del Rendimiento</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* 📅 Fecha y Horario */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium">Fecha y Horario:</label>
                        <Input value={`${fechaFormateada} — ${horaInicio} a ${horaFin}`} disabled />
                    </div>

                    {/* 👤 Jugador */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium">Jugador (RUT):</label>
                        <Input value={rendimiento.rut_jugador} disabled />
                    </div>

                    {/* 🟢 Asistencia */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium">Asistencia:</label>
                        <Input
                            value={rendimiento.asistencia ? "Presente" : "Ausente"}
                            disabled
                        />
                    </div>

                    {/* 🧩 Calificaciones */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium">Calificación Técnica:</label>
                        <Input value={rendimiento.calificacion_tecnica ?? "-"} disabled />
                    </div>

                    <div className="flex flex-col">
                        <label className="text-sm font-medium">Calificación Física:</label>
                        <Input value={rendimiento.calificacion_fisica ?? "-"} disabled />
                    </div>

                    {/* 📝 Observaciones */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium">Observaciones:</label>
                        <Input value={rendimiento.observaciones ?? "-"} disabled />
                    </div>

                    <div className="flex justify-end mt-4">
                        <Button variant="outline" onClick={() => setIsOpen(false)}>
                            Cerrar
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};


export const DialogEditRendimientoEntrenamiento: React.FC< DialogEditRendimientoEntrenamientoProps > = ({ rendimiento, refreshRendimientos }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

    const [asistencia, setAsistencia] = useState(rendimiento.asistencia);
    const [calTecnica, setCalTecnica] = useState(rendimiento.calificacion_tecnica ?? "");
    const [calFisica, setCalFisica] = useState(rendimiento.calificacion_fisica ?? "");
    const [observaciones, setObservaciones] = useState(rendimiento.observaciones ?? "");

    const { token } = useAuth();

    const handleSave = async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            await putRendimientoEntrenamiento(
                rendimiento.id_rendimiento,
                {
                    asistencia,
                    calificacion_tecnica: Number(calTecnica) || null,
                    calificacion_fisica: Number(calFisica) || null,
                    observaciones,
                },
                token
            );
            toast.success("Rendimiento actualizado correctamente");
            await refreshRendimientos();
            setIsOpen(false);
        } catch (error: any) {
            toast.error(error.message || "Error al actualizar rendimiento");
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
                        <DialogTitle>Editar Rendimiento</DialogTitle>
                    </DialogHeader>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            setIsConfirmDialogOpen(true);
                        }}
                        className="flex flex-col gap-4"
                    >
                        <div className="flex flex-col">
                            <label>Asistencia</label>
                            <Select
                                value={asistencia ? "true" : "false"}
                                onValueChange={(v: any) => setAsistencia(v === "true")}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="true">Presente</SelectItem>
                                    <SelectItem value="false">Ausente</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col">
                            <label>Calificación Técnica</label>
                            <Input
                                type="number"
                                value={calTecnica}
                                onChange={(e) => setCalTecnica(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-col">
                            <label>Calificación Física</label>
                            <Input
                                type="number"
                                value={calFisica}
                                onChange={(e) => setCalFisica(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-col">
                            <label>Observaciones</label>
                            <Input
                                value={observaciones}
                                onChange={(e) => setObservaciones(e.target.value)}
                            />
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <Button variant="outline" type="button" onClick={() => setIsOpen(false)}>
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
                description="¿Desea guardar los cambios en el rendimiento?"
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


export const ButtonDeleteRendimientoEntrenamiento: React.FC< ButtonDeleteRendimientoEntrenamientoProps > = ({ id_rendimiento, jugador_nombre, refreshRendimientos }) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            await deleteRendimientoEntrenamiento(id_rendimiento);
            toast.success(`Rendimiento de ${jugador_nombre ?? "jugador"} eliminado correctamente`);
            await refreshRendimientos();
        } catch (error: any) {
            toast.error(error.message || "Error al eliminar rendimiento");
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
                description={`¿Está seguro que desea eliminar el rendimiento de ${jugador_nombre ?? "este jugador"}?`}
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