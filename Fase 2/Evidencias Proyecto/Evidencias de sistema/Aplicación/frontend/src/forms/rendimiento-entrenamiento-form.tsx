import { useState } from "react";
import { Eye } from "lucide-react";
import { Edit } from "lucide-react";
import { Trash2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
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
    primer_nombre: string;
    segundo_nombre: string;
    primer_apellido: string;
    segundo_apellido: string;
    frecuencia_cardiaca: number;
    velocidad: number;
    duracion_recorrido: number;
    nivel_oxigeno: number;
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

export const DialogViewRendimientoEntrenamiento: React.FC<DialogViewRendimientoEntrenamientoProps> = ({ rendimiento }) => {
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
                    <div className="flex gap-4">
                        <div className="flex flex-col flex-1">
                            <label className="text-sm font-medium">RUT Jugador:</label>
                            <Input value={rendimiento.rut_jugador} disabled />
                        </div>
                        <div className="flex flex-col flex-1">
                            <label className="text-sm font-medium">Nombre jugador:</label>
                            <Input value={`${rendimiento.primer_nombre} ${rendimiento.segundo_nombre} ${rendimiento.primer_apellido} ${rendimiento.segundo_apellido}`} disabled />
                        </div>
                    </div>


                    <div className="flex gap-4">
                        <div className="flex flex-col flex-1">
                            <label className="text-sm font-medium">Frecuencia cardiaca:</label>
                            <Input value={rendimiento.frecuencia_cardiaca} disabled />
                        </div>
                        <div className="flex flex-col flex-1">
                            <label className="text-sm font-medium">Velocidad:</label>
                            <Input value={rendimiento.velocidad} disabled />
                        </div>
                    </div>


                    <div className="flex gap-4">
                        <div className="flex flex-col flex-1">
                            <label className="text-sm font-medium">Duración de recorrido:</label>
                            <Input value={rendimiento.duracion_recorrido} disabled />
                        </div>
                        <div className="flex flex-col flex-1">
                            <label className="text-sm font-medium">Nivel de oxígeno:</label>
                            <Input value={rendimiento.nivel_oxigeno} disabled />
                        </div>
                    </div>



                    {/* 🟢 Asistencia */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium">Asistencia:</label>
                        <Input
                            value={rendimiento.asistencia ? "Presente" : "Ausente"}
                            disabled
                        />
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


export const DialogEditRendimientoEntrenamiento: React.FC<DialogEditRendimientoEntrenamientoProps> = ({
    rendimiento,
    refreshRendimientos,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

    // 🧠 Estados para los campos editables
    const [frecuenciaCardiaca, setFrecuenciaCardiaca] = useState<number | null>(rendimiento.frecuencia_cardiaca ?? null);
    const [velocidad, setVelocidad] = useState<number | null>(rendimiento.velocidad ?? null);
    const [duracionRecorrido, setDuracionRecorrido] = useState<number | null>(rendimiento.duracion_recorrido ?? null);
    const [nivelOxigeno, setNivelOxigeno] = useState<number | null>(rendimiento.nivel_oxigeno ?? null);
    const [observaciones, setObservaciones] = useState<string>(rendimiento.observaciones ?? "");

    const { token } = useAuth();

    const fechaFormateada = rendimiento.fecha_entrenamiento
        ? new Date(rendimiento.fecha_entrenamiento).toLocaleDateString("es-CL", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        })
        : "-";

    const horaInicio = rendimiento.hora_ini ?? "-";
    const horaFin = rendimiento.hora_fin ?? "-";

    // 💾 Guardar cambios
    const handleSave = async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            await putRendimientoEntrenamiento(
                rendimiento.rut_jugador,
                rendimiento.id_entrenamiento,
                {
                    frecuencia_cardiaca: frecuenciaCardiaca,
                    velocidad,
                    duracion_recorrido: duracionRecorrido,
                    nivel_oxigeno: nivelOxigeno,
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
            {/* ✏️ Botón para abrir modal */}
            <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
                <Edit className="w-4 h-4" />
            </Button>

            {/* 🪟 Modal */}
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
                        className="space-y-4"
                    >
                        {/* 📅 Fecha y Horario */}
                        <div className="flex flex-col">
                            <label className="text-sm font-medium">Fecha y Horario:</label>
                            <Input value={`${fechaFormateada} — ${horaInicio} a ${horaFin}`} disabled />
                        </div>

                        {/* 👤 Jugador */}
                        <div className="flex gap-4">
                            <div className="flex flex-col flex-1">
                                <label className="text-sm font-medium">RUT Jugador:</label>
                                <Input value={rendimiento.rut_jugador} disabled />
                            </div>
                            <div className="flex flex-col flex-1">
                                <label className="text-sm font-medium">Nombre jugador:</label>
                                <Input
                                    value={`${rendimiento.primer_nombre ?? ""} ${rendimiento.segundo_nombre ?? ""} ${rendimiento.primer_apellido ?? ""} ${rendimiento.segundo_apellido ?? ""}`}
                                    disabled
                                />
                            </div>
                        </div>

                        {/* 🫀 Datos físicos (EDITABLES) */}
                        <div className="flex gap-4">
                            <div className="flex flex-col flex-1">
                                <label className="text-sm font-medium">Frecuencia cardiaca:</label>
                                <Input
                                    type="number"
                                    value={frecuenciaCardiaca ?? ""}
                                    onChange={(e) => setFrecuenciaCardiaca(Number(e.target.value))}
                                    placeholder="Ej: 120"
                                />
                            </div>
                            <div className="flex flex-col flex-1">
                                <label className="text-sm font-medium">Velocidad:</label>
                                <Input
                                    type="number"
                                    value={velocidad ?? ""}
                                    onChange={(e) => setVelocidad(Number(e.target.value))}
                                    placeholder="Ej: 10"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex flex-col flex-1">
                                <label className="text-sm font-medium">Duración de recorrido (min):</label>
                                <Input
                                    type="number"
                                    value={duracionRecorrido ?? ""}
                                    onChange={(e) => setDuracionRecorrido(Number(e.target.value))}
                                    placeholder="Ej: 30"
                                />
                            </div>
                            <div className="flex flex-col flex-1">
                                <label className="text-sm font-medium">Nivel de oxígeno (%):</label>
                                <Input
                                    type="number"
                                    value={nivelOxigeno ?? ""}
                                    onChange={(e) => setNivelOxigeno(Number(e.target.value))}
                                    placeholder="Ej: 97"
                                />
                            </div>
                        </div>

                        {/* 📝 Observaciones */}
                        <div className="flex flex-col">
                            <label className="text-sm font-medium">Observaciones:</label>
                            <Input
                                value={observaciones}
                                onChange={(e) => setObservaciones(e.target.value)}
                                placeholder="Escribe tus observaciones..."
                            />
                        </div>

                        {/* 🔘 Botones de acción */}
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

            {/* ⚠️ Confirmación */}
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


export const ButtonDeleteRendimientoEntrenamiento: React.FC<ButtonDeleteRendimientoEntrenamientoProps> = ({ id_rendimiento, jugador_nombre, refreshRendimientos }) => {
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