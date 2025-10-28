import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Edit, Eye, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { putLesion, postLesion, deleteLesion } from '../services/jugadoresService';
import { AlertDialogHandle } from '../components/alert-dialog-component';
import { useAuth } from '../contexts/authContext';



type DialogAddLesionProps = {
    refreshLesiones: () => Promise<void>;
};

type DialogViewLesionProps = {
    lesion: Lesion;
    refreshLesiones: () => Promise<void>;
};

type DialogEditLesionProps = {
    lesion: Lesion;
    refreshLesiones: () => Promise<void>;
};

type ButtonDeleteLesionProps = {
    id_lesion: number;
    refreshLesiones: () => Promise<void>;
};

type Lesion = {
    id_lesion: number;
    rut_jugador: string;
    nombre_lesion: string;
    tipo_lesion: boolean; 
    descripcion?: string;
    fecha_lesion: string;
    tiempo_recuperacion: string;
    fecha_fin_lesion?: string;
    activo?: boolean;
    fecha_creacion?: string;
    fecha_modificacion?: string;
};


// Aqui comienza la logica de creación de lesion
export const DialogAddLesion: React.FC<DialogAddLesionProps> = ({ refreshLesiones }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

    const [rutJugador, setRutJugador] = useState("");
    const [nombreLesion, setNombreLesion] = useState("");
    const [tipoLesion, setTipoLesion] = useState<boolean | null>(null);
    const [descripcion, setDescripcion] = useState("");
    const [fechaLesion, setFechaLesion] = useState("");
    const [tiempoRecuperacion, setTiempoRecuperacion] = useState("");
    const [fechaFinLesion, setFechaFinLesion] = useState("");
    const { token } = useAuth();
    const formRef = useRef<HTMLFormElement>(null);

    const validarRut = (rut: string): boolean => {
        rut = rut.replace(/\s+/g, "").toUpperCase();
        const [numero, dv] = rut.split("-");
        if (!numero || !dv) return false;
        if (!/^\d+$/.test(numero)) return false;

        let suma = 0;
        let factor = 2;
        for (let i = numero.length - 1; i >= 0; i--) {
            suma += parseInt(numero[i], 10) * factor;
            factor = factor === 7 ? 2 : factor + 1;
        }

        const dvCalculado = 11 - (suma % 11);
        const dvEsperado = dvCalculado === 11 ? "0" : dvCalculado === 10 ? "K" : dvCalculado.toString();
        return dv === dvEsperado;
    };

    const resetForm = () => {
        setRutJugador("");
        setNombreLesion("");
        setTipoLesion(false);
        setDescripcion("");
        setFechaLesion("");
        setTiempoRecuperacion("");
        setFechaFinLesion("");
    };

    const handleAlert = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (formRef.current && formRef.current.reportValidity()) {
            setIsConfirmDialogOpen(true);
        }
    };

    const handleSave = async () => {
        if (!token) {
            toast.error("No se encontró token. Por favor inicia sesión.");
            return;
        }

        // Validación: fecha de lesión no puede ser futura
        const hoy = new Date().toISOString().split("T")[0];
        if (fechaLesion > hoy) {
            toast.error("La fecha de la lesión no puede ser futura.");
            return;
        }

        setIsLoading(true);

        try {
            const nuevaLesion = {
                rut_jugador: rutJugador,
                nombre_lesion: nombreLesion,
                tipo_lesion: tipoLesion,
                descripcion,
                fecha_lesion: fechaLesion,
                tiempo_recuperacion: tiempoRecuperacion ? Number(tiempoRecuperacion) : null,
                fecha_fin_lesion: fechaFinLesion || null,
            };

            await postLesion(nuevaLesion, token);
            toast.success("La lesión se ha registrado correctamente");
            await refreshLesiones();
            resetForm();
            setIsOpen(false); // <-- cierra el modal

        } catch (err: any) {
            console.error("❌ Error al guardar lesión:", err);
            if (err?.status && err?.data?.detail) {
                toast.error(err.data.detail);
            } else {
                toast.error(err.message || "Ocurrió un error al registrar la lesión");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button style={{ backgroundColor: "#0000db" }} className="text-white">
                        + Agregar Lesión
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Agregar Lesión</DialogTitle>
                    </DialogHeader>

                    <form ref={formRef} onSubmit={handleAlert} className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* RUT del Jugador */}
                            <div className="flex flex-col">
                                <label className="block mb-1">RUT del Jugador *</label>
                                <Input
                                    value={rutJugador}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setRutJugador(value);
                                        if (!validarRut(value)) {
                                            e.currentTarget.setCustomValidity(
                                                "RUT inválido. Verifica el formato y dígito verificador."
                                            );
                                        } else {
                                            e.currentTarget.setCustomValidity("");
                                        }
                                    }}
                                    required
                                    pattern="^\d{7,8}-[0-9Kk]$"
                                    title="Ingrese un RUT válido (ej: 12345678-9)"
                                />
                            </div>

                            {/* Nombre Lesión */}
                            <div className="flex flex-col">
                                <label className="block mb-1">Nombre de la Lesión *</label>
                                <Input
                                    value={nombreLesion}
                                    onChange={(e) => setNombreLesion(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Tipo de Lesión */}
                            <div className="flex flex-col">
                                <label className="block mb-1">Tipo de Lesión *</label>
                                <Select
                                    value={tipoLesion !== null ? String(tipoLesion) : undefined}
                                    onValueChange={(v: string) => setTipoLesion(v === "true")}
                                    required
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Seleccione tipo de lesión" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="true">Fuera del club</SelectItem>
                                        <SelectItem value="false">Dentro del club</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Fecha de Lesión */}
                            <div className="flex flex-col">
                                <label className="block mb-1">Fecha de Lesión *</label>
                                <Input
                                    type="date"
                                    value={fechaLesion}
                                    onChange={(e) => setFechaLesion(e.target.value)}
                                    max={new Date().toISOString().split("T")[0]}
                                    required
                                />
                            </div>

                            {/* Tiempo de Recuperación */}
                            <div className="flex flex-col">
                                <label className="block mb-1">Tiempo de Recuperación (semanas)</label>
                                <Input
                                    type="number"
                                    value={tiempoRecuperacion}
                                    onChange={(e) => setTiempoRecuperacion(e.target.value)}
                                    min={0}
                                />
                            </div>

                            {/* Fecha Fin Lesión */}
                            <div className="flex flex-col">
                                <label className="block mb-1">Fecha Fin de Lesión</label>
                                <Input
                                    type="date"
                                    value={fechaFinLesion}
                                    onChange={(e) => setFechaFinLesion(e.target.value)}
                                />
                            </div>

                            <div className="col-span-2 w-full flex flex-col">
                                <label className="block mb-1">Descripción *</label>
                                <textarea
                                    value={descripcion}
                                    onChange={(e) => setDescripcion(e.target.value)}
                                    className="w-full border p-2 rounded"
                                    maxLength={500}
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2 mt-4">
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => {
                                    resetForm();
                                    setIsOpen(false);
                                    setIsConfirmDialogOpen(false);
                                }}
                                disabled={isLoading}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                style={{ backgroundColor: "#0000db" }}
                                className="text-white"
                            >
                                Guardar
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialogHandle
                title="Confirmar registro"
                description={`¿Desea registrar la lesión "${nombreLesion}" al jugador con el rut: ${rutJugador}?`}
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
// Aqui termina la logica de creción de lesion


// Aqui comienza la logica de editar una lesion
export const DialogEditLesion: React.FC<DialogEditLesionProps> = ({ lesion, refreshLesiones }) => {
    const [rutJugador, setRutJugador] = useState("");
    const [nombreLesion, setNombreLesion] = useState("");
    const [tipoLesion, setTipoLesion] = useState<boolean>(false);
    const [descripcion, setDescripcion] = useState("");
    const [fechaLesion, setFechaLesion] = useState("");
    const [tiempoRecuperacion, setTiempoRecuperacion] = useState("");
    const [fechaFinLesion, setFechaFinLesion] = useState("");
    const [isEditFormOpen, setIsEditFormOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (lesion) {
            setRutJugador(lesion.rut_jugador || "");
            setNombreLesion(lesion.nombre_lesion);
            setTipoLesion(lesion.tipo_lesion);
            setDescripcion(lesion.descripcion || "");
            setFechaLesion(lesion.fecha_lesion);
            setTiempoRecuperacion(lesion.tiempo_recuperacion || "");
            setFechaFinLesion(lesion.fecha_fin_lesion || "");
        }
    }, [lesion]);

    const handleSave = async () => {
        if (!lesion || lesion.id_lesion === undefined) {
            console.error("❌ Lesión no válida");
            return;
        }

        setIsLoading(true);
        try {
            const updatedData = {
                nombre_lesion: nombreLesion,
                tipo_lesion: tipoLesion,
                descripcion: descripcion || null,
                fecha_lesion: fechaLesion,
                tiempo_recuperacion: tiempoRecuperacion,
                fecha_fin_lesion: fechaFinLesion || null,
            };

            await putLesion(lesion.id_lesion, updatedData);
            toast.success("Lesión modificada correctamente");
            await refreshLesiones();
            setIsEditFormOpen(false);
        } catch (error: any) {
            console.error("❌ Error al actualizar lesión:", error);
            alert(error.message || "❌ Error al actualizar lesión");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Dialog open={isEditFormOpen} onOpenChange={setIsEditFormOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                    </Button>
                </DialogTrigger>

                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Editar Lesión</DialogTitle>
                    </DialogHeader>

                    <form
                        ref={formRef}
                        onSubmit={(e) => { e.preventDefault(); setIsConfirmDialogOpen(true); }}
                        className="flex flex-col gap-4"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            {/* Nombre Lesión */}
                            <div className="flex flex-col">
                                <label className="block mb-1">Nombre de la Lesión *</label>
                                <Input
                                    value={nombreLesion}
                                    onChange={(e) => setNombreLesion(e.target.value)}
                                    required
                                    className="w-full border p-2 rounded"
                                />
                            </div>

                            {/* Tipo de Lesión */}
                            <div className="flex flex-col">
                                <label className="block mb-1">Tipo de Lesión *</label>
                                <Select
                                    value={String(tipoLesion)}
                                    onValueChange={(v: string) => setTipoLesion(v === "true")}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Seleccione tipo de lesión" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="true">Fuera del club</SelectItem>
                                        <SelectItem value="false">Dentro del club</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Fecha de Lesión */}
                            <div className="flex flex-col">
                                <label className="block mb-1">Fecha de Lesión *</label>
                                <Input
                                    type="date"
                                    value={fechaLesion}
                                    onChange={(e) => setFechaLesion(e.target.value)}
                                    required
                                    className="w-full border p-2 rounded"
                                />
                            </div>

                            {/* Tiempo de Recuperación */}
                            <div className="flex flex-col">
                                <label className="block mb-1">Tiempo de Recuperación (semanas)</label>
                                <Input
                                    type="number"
                                    value={tiempoRecuperacion}
                                    onChange={(e) => setTiempoRecuperacion(e.target.value)}
                                    min={0}
                                    className="w-full border p-2 rounded"
                                />
                            </div>

                            {/* Fecha Fin Lesión */}
                            <div className="flex flex-col">
                                <label className="block mb-1">Fecha Fin de Lesión</label>
                                <Input
                                    type="date"
                                    value={fechaFinLesion}
                                    onChange={(e) => setFechaFinLesion(e.target.value)}
                                    className="w-full border p-2 rounded"
                                />
                            </div>

                            {/* Descripción */}
                            <div className="col-span-2 w-full flex flex-col">
                                <label className="block mb-1">Descripción *</label>
                                <textarea
                                    value={descripcion}
                                    onChange={(e) => setDescripcion(e.target.value)}
                                    className="w-full border p-2 rounded"
                                    maxLength={500}
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2 mt-4">
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => setIsEditFormOpen(false)}
                                disabled={isLoading}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                style={{ backgroundColor: '#0000db' }}
                                className="text-white"
                                disabled={isLoading}
                            >
                                Guardar
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialogHandle
                title="Confirmar actualización"
                description="¿Deseas guardar los cambios en esta lesión?"
                confirmLabel="Guardar"
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
// Aqui termina la logica de editar una lesion


// Aqui comienza la logica de ver la lesion de un jugador
export const DialogViewLesion: React.FC<DialogViewLesionProps> = ({ lesion }) => {
    const [rutJugador, setRutJugador] = useState("");
    const [nombreLesion, setNombreLesion] = useState("");
    const [tipoLesion, setTipoLesion] = useState<boolean | null>(null);
    const [descripcion, setDescripcion] = useState("");
    const [fechaLesion, setFechaLesion] = useState("");
    const [tiempoRecuperacion, setTiempoRecuperacion] = useState("");
    const [fechaFinLesion, setFechaFinLesion] = useState("");
    const [isViewFormOpen, setIsViewFormOpen] = useState(false);

    useEffect(() => {
        if (lesion) {
            setRutJugador(lesion.rut_jugador || "");
            setNombreLesion(lesion.nombre_lesion);
            setTipoLesion(lesion.tipo_lesion);
            setDescripcion(lesion.descripcion || "");
            setFechaLesion(lesion.fecha_lesion);
            setTiempoRecuperacion(lesion.tiempo_recuperacion || "");
            setFechaFinLesion(lesion.fecha_fin_lesion || "");
        }
    }, [lesion]);

    return (
        <Dialog open={isViewFormOpen} onOpenChange={setIsViewFormOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4" />
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Detalles de la Lesión</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* RUT del Jugador */}
                        <div className="flex flex-col">
                            <label className="block mb-1">RUT del Jugador</label>
                            <Input value={rutJugador} disabled style={{ color: 'black', WebkitTextFillColor: 'black', opacity: 1 }}  />
                        </div>

                        {/* Nombre Lesión */}
                        <div className="flex flex-col">
                            <label className="block mb-1">Nombre de la Lesión</label>
                            <Input value={nombreLesion} disabled style={{ color: 'black', WebkitTextFillColor: 'black', opacity: 1 }} />
                        </div>

                        {/* Tipo de Lesión */}
                        <div className="flex flex-col">
                            <label className="block mb-1">Tipo de Lesión</label>
                            <Select value={tipoLesion ? "true" : "false"} disabled>
                                <SelectTrigger style={{ color: 'black', WebkitTextFillColor: 'black', opacity: 1 }}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="true">Grave</SelectItem>
                                    <SelectItem value="false">Leve</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Fecha de Lesión */}
                        <div className="flex flex-col">
                            <label className="block mb-1">Fecha de Lesión</label>
                            <Input type="date" value={fechaLesion} disabled style={{ color: 'black', WebkitTextFillColor: 'black', opacity: 1 }} />
                        </div>

                        {/* Tiempo de Recuperación */}
                        <div className="flex flex-col">
                            <label className="block mb-1">Tiempo de Recuperación (semanas)</label>
                            <Input type="number" value={tiempoRecuperacion} disabled style={{ color: 'black', WebkitTextFillColor: 'black', opacity: 1 }} />
                        </div>

                        {/* Fecha Fin Lesión */}
                        <div className="flex flex-col">
                            <label className="block mb-1">Fecha Fin de Lesión</label>
                            <Input type="date" value={fechaFinLesion} disabled style={{ color: 'black', WebkitTextFillColor: 'black', opacity: 1 }} />
                        </div>

                        {/* Descripción */}
                        <div className="col-span-2 w-full flex flex-col">
                            <label className="block mb-1">Descripción</label>
                            <textarea value={descripcion} disabled style={{ color: 'black', WebkitTextFillColor: 'black', opacity: 1 }} />
                        </div>
                    </div>

                    <div className="flex justify-end mt-4">
                        <Button variant="outline" onClick={() => setIsViewFormOpen(false)}>
                            Cerrar
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
// Aqui termina la logica de ver la lesion de un jugador


// Aqui comienza la logica de eliminar una lesion
export const ButtonDeleteLesion: React.FC<ButtonDeleteLesionProps> = ({ id_lesion, refreshLesiones }) => {

    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

    const handleDelete = async () => {
        if (!id_lesion) {
            alert("❌ Lesión no válida");
            return;
        }

        try {
            await deleteLesion(id_lesion);
            toast.success("La lesion se a eliminado correctamente")
            await refreshLesiones();
        } catch (error: any) {
            console.error("❌ Error al eliminar lesión:", error);
            alert(error.message || "❌ Error al eliminar lesión");
        }
    };

    return (
        <>
            <Button variant="destructive" size="sm" onClick={() => setIsDialogOpen(true)}>
                <Trash2 className="w-4 h-4" />
            </Button>

            <AlertDialogHandle
                title="Confirmar eliminación"
                description="¿Estás seguro de que deseas eliminar esta lesión?"
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
// Aqui termina la logica de eliminar una lesion