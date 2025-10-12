import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
    Plus, Edit, Trash2, Eye, Search,
    History, FileText, AlertCircle, CheckCircle,
    Upload, X
} from 'lucide-react';
import {
    getJugadores, uploadExcel, putJugador,
    postJugador, postLesion, getLesiones, putLesion,
    deleteJugador, deleteLesion
}
    from '../services/jugadoresService';
import { getClubs } from '../services/clubServices';
import { getFichasPorFiltro } from '../services/fichaJugadorService'
import { getSeries } from '../services/serieService';
import { AlertDialogHandle } from '../components/alert-dialog-component';
import { toast } from "sonner";
import { useAuth } from '../contexts/authContext';


type DialogFormJugadorProps = {
    jugador: Jugador;
    refreshJugadores: () => Promise<void>
};

type DialogAddJugadorProps = {
    refreshJugadores: () => Promise<void>;
};

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

type ButtonDeleteJugadorProps = {
    rutJugador: string;
    primerNombre: string;
    primerApellido: string;
    refreshJugadores: () => Promise<void>;
};

type ButtonDeleteLesionProps = {
    id_lesion: number;
    refreshLesiones: () => Promise<void>;
};

type UploadExcelProps = {
    refreshJugadores: () => Promise<void>;
    onUploadComplete?: (result: any[]) => void;
    openHistory?: () => void;
};

type DialogEditJugadorProps = {
    jugador: Jugador;
    refreshJugadores: () => Promise<void>;
};

type Club = {
    id_club: number;
    nombre_club: string
};

type Serie = {
    id_serie: number;
    nombre_serie: string
};

type Ficha = {
    id_ficha: number;
    rut_jugador: string;
    id_serie: number;
    fecha_creacion: string;
    fecha_modificacion: string;
};


type Lesion = {
    id_lesion: number;
    rut_jugador: string;
    nombre_lesion: string;
    tipo_lesion: boolean; // true = Grave, false = Leve
    descripcion?: string;
    fecha_lesion: string;
    tiempo_recuperacion: string;
    fecha_fin_lesion?: string;
    activo?: boolean;
    fecha_creacion?: string;
    fecha_modificacion?: string;
};

type Jugador = {
    rut_jugador: string;
    primer_nombre: string;
    segundo_nombre?: string;
    primer_apellido: string;
    segundo_apellido?: string;
    genero: boolean;
    fecha_nacimiento: string;
    enfermedades_cronicas?: string;
    fono_jugador?: string;
    jugador_activo: boolean;
    fecha_creacion: string;
    fecha_modificacion: string;
};


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


// Aqui comienza la logica de editar una lesion
export const DialogEditLesion: React.FC<DialogEditLesionProps> = ({ lesion, refreshLesiones }) => {
    const [rutJugador, setRutJugador] = useState("");
    const [nombreLesion, setNombreLesion] = useState("");
    const [tipoLesion, setTipoLesion] = useState<boolean>(false); // Inicializamos como false
    const [descripcion, setDescripcion] = useState("");
    const [fechaLesion, setFechaLesion] = useState("");
    const [tiempoRecuperacion, setTiempoRecuperacion] = useState("");
    const [fechaFinLesion, setFechaFinLesion] = useState("");
    const [isEditFormOpen, setIsEditFormOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

    useEffect(() => {
        if (lesion) {
            setNombreLesion(lesion.nombre_lesion);
            setTipoLesion(lesion.tipo_lesion);
            setDescripcion(lesion.descripcion || "");
            setFechaLesion(lesion.fecha_lesion);
            setTiempoRecuperacion(lesion.tiempo_recuperacion);
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

            toast.success("lesión modificada correctamente")
            await putLesion(lesion.id_lesion, updatedData);
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
                    <Button variant="outline" size="sm" onClick={() => setIsEditFormOpen(true)}>
                        <Edit className="w-4 h-4" />
                    </Button>
                </DialogTrigger>

                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Editar Lesión</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3">
                        <div>
                            <label className="text-sm font-medium">Nombre de la Lesión</label>
                            <Input value={nombreLesion} onChange={(e) => setNombreLesion(e.target.value)} className="w-full border p-2 rounded" />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Tipo de Lesión</label>
                            <Select
                                value={String(tipoLesion)}
                                onValueChange={(v: string) => setTipoLesion(v === "true")}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Seleccione tipo de lesión" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="true">Grave</SelectItem>
                                    <SelectItem value="false">Leve</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="text-sm font-medium">Descripción</label>
                            <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className="w-full border p-2 rounded" />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Fecha de Lesión</label>
                            <Input type="date" value={fechaLesion} onChange={(e) => setFechaLesion(e.target.value)} className="w-full border p-2 rounded" />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Tiempo de Recuperación (semanas)</label>
                            <Input type="number" value={tiempoRecuperacion} onChange={(e) => setTiempoRecuperacion(e.target.value)} className="w-full border p-2 rounded" min={0} />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Fecha Fin de Lesión</label>
                            <Input type="date" value={fechaFinLesion} onChange={(e) => setFechaFinLesion(e.target.value)} className="w-full border p-2 rounded" />
                        </div>

                        <div className="flex justify-end space-x-2 mt-4">
                            <Button variant="outline" onClick={() => setIsEditFormOpen(false)} disabled={isLoading}>
                                Cancelar
                            </Button>
                            <Button
                                style={{ backgroundColor: '#0000db' }}
                                className="text-white"
                                onClick={() => setIsConfirmDialogOpen(true)}
                                disabled={isLoading}
                            >
                                Guardar
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* --- Confirmación personalizada antes de guardar --- */}
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
export const DialogViewLesion: React.FC<DialogViewLesionProps> = ({
    lesion,
    refreshLesiones
}) => {
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
            setRutJugador(lesion.rut_jugador);
            setNombreLesion(lesion.nombre_lesion);
            setTipoLesion(lesion.tipo_lesion);
            setDescripcion(lesion.descripcion || "");
            setFechaLesion(lesion.fecha_lesion);
            setTiempoRecuperacion(lesion.tiempo_recuperacion);
            setFechaFinLesion(lesion.fecha_fin_lesion || "");
        }
    }, [lesion]);

    return (
        <Dialog open={isViewFormOpen} onOpenChange={setIsViewFormOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => setIsViewFormOpen(true)}>
                    <Eye className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Detalles de la Lesión</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block mb-2">Rut del Jugador:</label>
                            <Input value={rutJugador} disabled style={{ color: 'black', WebkitTextFillColor: 'black', opacity: 1 }} />
                        </div>
                        <div>
                            <label className="block mb-2">Nombre de la Lesión:</label>
                            <Input value={nombreLesion} disabled style={{ color: 'black', WebkitTextFillColor: 'black', opacity: 1 }} />
                        </div>
                        <div>
                            <label className="block mb-2">Tipo de Lesión:</label>
                            <Select value={tipoLesion ? "true" : "false"} disabled>
                                <SelectTrigger style={{ color: 'black', WebkitTextFillColor: 'black', opacity: 1, backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="true">Grave</SelectItem>
                                    <SelectItem value="false">Leve</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="block mb-2">Descripción:</label>
                            <textarea value={descripcion} disabled className="w-full border p-2 rounded" />
                        </div>
                        <div>
                            <label className="block mb-2">Fecha de Lesión:</label>
                            <Input type="date" value={fechaLesion} disabled style={{ color: 'black', WebkitTextFillColor: 'black', opacity: 1 }} />
                        </div>
                        <div>
                            <label className="block mb-2">Tiempo de Recuperación (semanas):</label>
                            <Input type="number" value={tiempoRecuperacion} disabled style={{ color: 'black', WebkitTextFillColor: 'black', opacity: 1 }} />
                        </div>
                        <div>
                            <label className="block mb-2">Fecha Fin de Lesión:</label>
                            <Input type="date" value={fechaFinLesion} disabled style={{ color: 'black', WebkitTextFillColor: 'black', opacity: 1 }} />
                        </div>
                        <div className="flex justify-end">
                            <Button variant="outline" onClick={() => setIsViewFormOpen(false)}>
                                Cerrar
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
// Aqui termina la logica de ver la lesion de un jugador


// Aqui comienza la logica de creación de lesion
export const DialogAddLesion: React.FC<DialogAddLesionProps> = ({ refreshLesiones }) => {
    const [open, setOpen] = useState(false);
    const [rutJugador, setRutJugador] = useState("");
    const [nombreLesion, setNombreLesion] = useState("");
    const [tipoLesion, setTipoLesion] = useState<boolean>(false);
    const [descripcion, setDescripcion] = useState("");
    const [fechaLesion, setFechaLesion] = useState("");
    const [tiempoRecuperacion, setTiempoRecuperacion] = useState("");
    const [fechaFinLesion, setFechaFinLesion] = useState("");
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

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

    // Limpiar formulario
    const resetForm = () => {
        setRutJugador("");
        setNombreLesion("");
        setTipoLesion(false);
        setDescripcion("");
        setFechaLesion("");
        setTiempoRecuperacion("");
        setFechaFinLesion("");
    };

    // Abrir alerta antes de guardar
    const handleAlert = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (formRef.current && formRef.current.reportValidity()) {
            setIsConfirmDialogOpen(true);
        }
    };

    // Guardar lesión
    const handleSave = async () => {
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

            await postLesion(nuevaLesion);
            toast.success("La lesión se ha registrado correctamente");
            await refreshLesiones();
            setOpen(false);
            resetForm();

        } catch (err: any) {
            console.error("❌ Error al guardar lesión:", err);

            // Manejo de errores del backend
            if (err?.status && err?.data?.detail) {
                toast.error(err.data.detail); // muestra el mensaje que viene del backend
            } else {
                toast.error(err.message || "Ocurrió un error al registrar la lesión");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button style={{ backgroundColor: "#0000db" }} className="text-white">
                        + Agregar Lesión
                    </Button>
                </DialogTrigger>

                <DialogContent className="max-w-md">
                    <form ref={formRef} onSubmit={handleAlert} className="space-y-3">
                        {/* RUT */}
                        <div>
                            <label className="text-sm font-medium">RUT del Jugador</label>
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
                        <div>
                            <label className="text-sm font-medium">Nombre de la Lesión</label>
                            <Input
                                value={nombreLesion}
                                onChange={(e) => setNombreLesion(e.target.value)}
                                required
                            />
                        </div>

                        {/* Tipo de Lesión */}
                        <div>
                            <label className="text-sm font-medium">Tipo de Lesión</label>
                            <Select
                                value={String(tipoLesion)}
                                onValueChange={(v: string) => setTipoLesion(v === "true")}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Seleccione tipo de lesión" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="true">Grave</SelectItem>
                                    <SelectItem value="false">Leve</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Descripción */}
                        <div>
                            <label className="text-sm font-medium">Descripción</label>
                            <textarea
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                                className="w-full border p-2 rounded"
                                required
                            />
                        </div>

                        {/* Fecha de Lesión */}
                        <div>
                            <label className="text-sm font-medium">Fecha de Lesión</label>
                            <Input
                                type="date"
                                value={fechaLesion}
                                onChange={(e) => setFechaLesion(e.target.value)}
                                required
                            />
                        </div>

                        {/* Tiempo de recuperación */}
                        <div>
                            <label className="text-sm font-medium">Tiempo de Recuperación (semanas)</label>
                            <Input
                                type="number"
                                value={tiempoRecuperacion}
                                onChange={(e) => setTiempoRecuperacion(e.target.value)}
                                min={0}
                            />
                        </div>

                        {/* Fecha fin de lesión */}
                        <div>
                            <label className="text-sm font-medium">Fecha Fin de Lesión</label>
                            <Input
                                type="date"
                                value={fechaFinLesion}
                                onChange={(e) => setFechaFinLesion(e.target.value)}
                            />
                        </div>

                        {/* Botones */}
                        <div className="flex justify-end space-x-2 mt-4">
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => {
                                    resetForm();
                                    setOpen(false);
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

            {/* Confirmación */}
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


// Aqui comienza la logica de agregar jugador
export const DialogAddJugador: React.FC<DialogAddJugadorProps> = ({ refreshJugadores }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

    const [rutJugador, setRutJugador] = useState("");
    const [primerNombreJugador, setPrimerNombreJugador] = useState("");
    const [segundoNombreJugador, setSegundoNombreJugador] = useState("");
    const [primerApellidoJugador, setPrimerApellidoJugador] = useState("");
    const [segundoApellidoJugador, setSegundoApellidoJugador] = useState("");
    const [genero, setGenero] = useState<string>("");
    const [fechaNacimiento, setFechaNacimiento] = useState("");
    const [enfermedadesCronicas, setEnfermedadesCronicas] = useState("");
    const [fonoJugador, setFonoJugador] = useState("");
    const [jugadorActivo, setJugadorActivo] = useState<string>("true");


    const validarRut = (rut: string): boolean => {
        // Limpiar espacios y mayúsculas
        rut = rut.replace(/\s+/g, "").toUpperCase();

        // Separar número y dígito verificador
        const [numero, dv] = rut.split("-");
        if (!numero || !dv) return false;

        // Validar que el número sea solo dígitos
        if (!/^\d+$/.test(numero)) return false;

        // Calcular dígito verificador
        let suma = 0;
        let factor = 2;
        for (let i = numero.length - 1; i >= 0; i--) {
            suma += parseInt(numero[i], 10) * factor;
            factor = factor === 7 ? 2 : factor + 1;
        }

        const dvCalculado = 11 - (suma % 11);
        let dvEsperado = "";
        if (dvCalculado === 11) dvEsperado = "0";
        else if (dvCalculado === 10) dvEsperado = "K";
        else dvEsperado = dvCalculado.toString();

        return dv === dvEsperado;
    };


    const validarCelularChile = (numero: string): string => {
        // Limpiar espacios al inicio y fin
        const tel = numero.trim();

        // Patrones permitidos
        const patrones = [
            /^\+569\d{8}$/,  // +569XXXXXXXX
            /^9\d{8}$/,      // 9XXXXXXXX
            /^41\d{8}$/      // 41XXXXXXXX (ej: Concepción)
        ];

        // Verificar si alguno de los patrones coincide
        const valido = patrones.some(p => p.test(tel));

        if (!valido) {
            throw new Error("Número de celular inválido");
        }

        return tel;
    };


    // Función para limpiar todos los campos del formulario
    const resetForm = () => {
        setRutJugador("");
        setPrimerNombreJugador("");
        setSegundoNombreJugador("");
        setPrimerApellidoJugador("");
        setSegundoApellidoJugador("");
        setGenero("");
        setFechaNacimiento("");
        setEnfermedadesCronicas("");
        setFonoJugador("");
        setJugadorActivo("true");
    };

    const handleAlert = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        if (form.reportValidity()) {
            setIsConfirmDialogOpen(true);
        }
    };

    const handleSave = async () => {
        setIsLoading(true);

        try {
            await postJugador({
                rut_jugador: rutJugador,
                primer_nombre: primerNombreJugador,
                segundo_nombre: segundoNombreJugador || null,
                primer_apellido: primerApellidoJugador,
                segundo_apellido: segundoApellidoJugador || null,
                genero: genero === "true",
                fecha_nacimiento: fechaNacimiento,
                enfermedades_cronicas: enfermedadesCronicas || null,
                fono_jugador: fonoJugador || null,
                jugador_activo: jugadorActivo === "true",
            });

            toast.success("El jugador fue registrado correctamente!");
            await refreshJugadores();
            setIsOpen(false);
            resetForm();

        } catch (error: any) {
            if (error?.status) {
                if (error.status === 409) {
                    toast.error(error.data.detail || "El RUT ingresado ya se encuentra registrado.");
                    return;
                }

                if (error.status === 422) {
                    const firstError = Array.isArray(error.data) ? error.data[0] : error.data;
                    if (firstError?.loc?.includes("rut_jugador")) {
                        toast.error("RUT inválido. Verifica el formato 12345678-9");
                    } else {
                        toast.error(firstError?.msg || "Error de validación en los datos enviados");
                    }
                    return;
                }

                // Otros errores
                toast.error(error.data.detail || "Error al crear jugador");
            } else {
                toast.error(error.message || "Ocurrió un error inesperado al agregar el jugador.");
            }
        }
    };
    return (
        <>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button style={{ backgroundColor: '#0000db' }} className="text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo Jugador
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Agregar Jugador</DialogTitle>
                    </DialogHeader>

                    {/* Contenedor principal vertical */}
                    <form onSubmit={handleAlert} className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Rut Jugador */}
                            <div className="flex flex-col">
                                <label className="block mb-1">Rut Jugador *</label>
                                <Input
                                    value={rutJugador}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setRutJugador(value);

                                        // Validación con tu función
                                        if (!validarRut(value)) {
                                            e.currentTarget.setCustomValidity("RUT inválido. Verifica el formato y dígito verificador.");
                                        } else {
                                            e.currentTarget.setCustomValidity(""); // limpio el mensaje si es válido
                                        }
                                    }}
                                    required
                                    pattern="^\d{7,8}-[0-9Kk]$"
                                    title="Ingrese un RUT válido (ej: 12345678-9)"
                                />
                            </div>

                            {/* Primer Nombre */}
                            <div className="flex flex-col">
                                <label className="block mb-1">Primer Nombre *</label>
                                <Input
                                    value={primerNombreJugador}
                                    onChange={(e) => setPrimerNombreJugador(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Segundo Nombre */}
                            <div className="flex flex-col">
                                <label className="block mb-1">Segundo Nombre</label>
                                <Input
                                    value={segundoNombreJugador}
                                    onChange={(e) => setSegundoNombreJugador(e.target.value)}
                                />
                            </div>

                            {/* Primer Apellido */}
                            <div className="flex flex-col">
                                <label className="block mb-1">Primer Apellido *</label>
                                <Input
                                    value={primerApellidoJugador}
                                    onChange={(e) => setPrimerApellidoJugador(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Segundo Apellido */}
                            <div className="flex flex-col">
                                <label className="block mb-1">Segundo Apellido</label>
                                <Input
                                    value={segundoApellidoJugador}
                                    onChange={(e) => setSegundoApellidoJugador(e.target.value)}
                                />
                            </div>

                            {/* Género */}
                            <div className="flex flex-col">
                                <label className="block mb-1">Género *</label>
                                <Select
                                    value={genero}
                                    onValueChange={(value: string) => setGenero(value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccione Género" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="true">Masculino</SelectItem>
                                        <SelectItem value="false">Femenino</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Fecha de Nacimiento */}
                            <div className="flex flex-col">
                                <label className="block mb-1">Fecha de Nacimiento *</label>
                                <Input
                                    type="date"
                                    value={fechaNacimiento}
                                    onChange={(e) => setFechaNacimiento(e.target.value)}
                                    required
                                    min={new Date(new Date().setFullYear(new Date().getFullYear() - 80)).toISOString().split("T")[0]}
                                    max={new Date().toISOString().split("T")[0]}
                                />
                            </div>

                            {/* Enfermedades Crónicas */}
                            <div className="col-span-2 flex flex-col">
                                <label className="block mb-1">Enfermedades Crónicas</label>
                                <Input
                                    value={enfermedadesCronicas}
                                    onChange={(e) => setEnfermedadesCronicas(e.target.value)}
                                />
                            </div>

                            {/* Teléfono */}
                            <div className="col-span-2 flex flex-col">
                                <label className="block mb-1">Teléfono</label>
                                <Input
                                    value={fonoJugador}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setFonoJugador(value);

                                        try {
                                            // Validación con tu función
                                            validarCelularChile(value);
                                            e.currentTarget.setCustomValidity(""); // limpio el mensaje si es válido
                                        } catch (error: any) {
                                            e.currentTarget.setCustomValidity(error.message); // mensaje de error
                                        }
                                    }}
                                    pattern="^(\+569\d{8}|9\d{8}|41\d{8})$"
                                    title="Ingrese un número de celular chileno válido (+569XXXXXXXX, 9XXXXXXXX o 41XXXXXXXX)"
                                />
                                {/* Párrafo debajo del teléfono */}
                                <p className="text-sm text-gray-600 mt-2">
                                    Los campos marcados con (*) son campos obligatorios
                                </p>
                            </div>
                        </div>

                        {/* Botones */}
                        <div className="flex justify-end space-x-2">
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => {
                                    resetForm();
                                    setIsOpen(false);
                                    setIsConfirmDialogOpen(false);
                                }}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit">Guardar</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialogHandle
                title="Confirmar registro"
                description={`¿Está seguro que desea registrar al jugador ${primerNombreJugador} ${primerApellidoJugador}?`}
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
// Aqui termina la logica de agregar jugador


// Aqui comienza la logica de eliminar un jugador
export const ButtonDeleteJugador: React.FC<ButtonDeleteJugadorProps> = ({ rutJugador, primerNombre, primerApellido, refreshJugadores }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleDelete = async () => {
        try {
            toast.success("El jugador fue eliminado correctamente!");
            setIsLoading(true);
            await deleteJugador(rutJugador);
            await refreshJugadores();
        } catch (error) {
            console.error("❌ Error al eliminar jugador:", error);
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
                description={`¿Estás seguro de que deseas eliminar al jugador ${primerNombre} ${primerApellido}?`}
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
// Aqui termina la logica de eliminar un jugador


// Aqui comienza la logica de visualizar jugador
export const DialogViewJugador: React.FC<DialogFormJugadorProps> = ({
    jugador,
    refreshJugadores
}) => {
    const [rutJugador, setRutJugador] = useState("");
    const [primerNombreJugador, setPrimerNombreJugador] = useState("");
    const [segundoNombreJugador, setSegundoNombreJugador] = useState("");
    const [primerApellidoJugador, setPrimerApellidoJugador] = useState("");
    const [segundoApellidoJugador, setSegundoApellidoJugador] = useState("");
    const [genero, setGenero] = useState<boolean | null>(null);
    const [fechaNacimiento, setFechaNacimiento] = useState("");
    const [enfermedadesCronicas, setEnfermedadesCronicas] = useState("");
    const [fonoJugador, setFonoJugador] = useState("");
    const [jugadorActivo, setJugadorActivo] = useState<boolean | null>(null);
    const [isEditFormOpen, setIsEditFormOpen] = useState(false);

    useEffect(() => {
        if (jugador) {
            setRutJugador(jugador.rut_jugador);
            setPrimerNombreJugador(jugador.primer_nombre);
            setSegundoNombreJugador(jugador.segundo_nombre || "");
            setPrimerApellidoJugador(jugador.primer_apellido);
            setSegundoApellidoJugador(jugador.segundo_apellido || "");
            setGenero(jugador.genero);
            setFechaNacimiento(jugador.fecha_nacimiento);
            setEnfermedadesCronicas(jugador.enfermedades_cronicas || "");
            setFonoJugador(jugador.fono_jugador || "");
            setJugadorActivo(jugador.jugador_activo);
        }
    }, [jugador]);

    return (
        <Dialog open={isEditFormOpen} onOpenChange={setIsEditFormOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        //setSelectedPlayer(player);
                        setIsEditFormOpen(true);
                    }}
                >
                    <Eye className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Detalles del jugador</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-2">Rut Jugador:</label>
                            <Input value={rutJugador} disabled style={{ color: 'black', WebkitTextFillColor: 'black', opacity: 1 }} />
                        </div>
                        <div>
                            <label className="block mb-2">Primer Nombre:</label>
                            <Input value={primerNombreJugador} disabled style={{ color: 'black', WebkitTextFillColor: 'black', opacity: 1 }} />
                        </div>
                        <div>
                            <label className="block mb-2">Segundo Nombre:</label>
                            <Input value={segundoNombreJugador} disabled style={{ color: 'black', WebkitTextFillColor: 'black', opacity: 1 }} />
                        </div>
                        <div>
                            <label className="block mb-2">Primer Apellido:</label>
                            <Input tabIndex={-1} value={primerApellidoJugador} style={{ color: 'black', WebkitTextFillColor: 'black', opacity: 1 }} />
                        </div>
                        <div>
                            <label className="block mb-2">Segundo Apellido:</label>
                            <Input value={segundoApellidoJugador} disabled style={{ color: 'black', WebkitTextFillColor: 'black', opacity: 1 }} />
                        </div>
                        <div>
                            <label className="block mb-2">Género:</label>
                            <Select value={String(genero)} disabled>
                                <SelectTrigger
                                    style={{
                                        color: 'black',
                                        WebkitTextFillColor: 'black',
                                        opacity: 1,
                                        backgroundColor: '#f3f4f6',
                                        cursor: 'not-allowed'
                                    }}
                                >
                                    <SelectValue placeholder="Seleccione género" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="true">Masculino</SelectItem>
                                    <SelectItem value="false">Femenino</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="block mb-2">Fecha de Nacimiento:</label>
                            <Input type="date" value={fechaNacimiento} disabled style={{ color: 'black', WebkitTextFillColor: 'black', opacity: 1 }} />
                        </div>
                        <div className="col-span-2">
                            <label className="block mb-2">Enfermedades Crónicas:</label>
                            <Input value={enfermedadesCronicas} disabled style={{ color: 'black', WebkitTextFillColor: 'black', opacity: 1 }} />
                        </div>
                        <div>
                            <label className="block mb-2">Teléfono:</label>
                            <Input value={fonoJugador} disabled style={{ color: 'black', WebkitTextFillColor: 'black', opacity: 1 }} />
                        </div>
                        <div>
                            <label className="block mb-2">Jugador Activo:</label>
                            <Select value={String(jugadorActivo)} disabled>
                                <SelectTrigger
                                    style={{
                                        color: 'black',
                                        WebkitTextFillColor: 'black',
                                        opacity: 1,
                                        backgroundColor: '#f3f4f6',
                                        cursor: 'not-allowed'
                                    }}
                                >
                                    <SelectValue placeholder="Seleccione si está activo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="true">Sí</SelectItem>
                                    <SelectItem value="false">No</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-end col-span-2">
                            <Button variant="outline" onClick={() => setIsEditFormOpen(false)}>
                                Cerrar
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
// Aqui termina la logica de visualizar jugador


// Aqui comienza la logica y formulario del modificar jugador
export const DialogEditJugador: React.FC<DialogEditJugadorProps> = ({
    jugador,
    refreshJugadores,
}) => {
    const [primerNombreJugador, setPrimerNombreJugador] = useState("");
    const [segundoNombreJugador, setSegundoNombreJugador] = useState("");
    const [primerApellidoJugador, setPrimerApellidoJugador] = useState("");
    const [segundoApellidoJugador, setSegundoApellidoJugador] = useState("");
    const [genero, setGenero] = useState<string>("true");
    const [fechaNacimiento, setFechaNacimiento] = useState("");
    const [enfermedadesCronicas, setEnfermedadesCronicas] = useState("");
    const [fonoJugador, setFonoJugador] = useState("");
    const [jugadorActivo, setJugadorActivo] = useState<string>("true");

    const [isEditFormOpen, setIsEditFormOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

    // ✅ Cargar datos cuando se abra el diálogo
    useEffect(() => {
        if (jugador && isEditFormOpen) {
            setPrimerNombreJugador(jugador.primer_nombre || "");
            setSegundoNombreJugador(jugador.segundo_nombre || "");
            setPrimerApellidoJugador(jugador.primer_apellido || "");
            setSegundoApellidoJugador(jugador.segundo_apellido || "");
            setGenero(jugador.genero ? "true" : "false");
            setFechaNacimiento(jugador.fecha_nacimiento || "");
            setEnfermedadesCronicas(jugador.enfermedades_cronicas || "");
            setFonoJugador(jugador.fono_jugador || "");
            setJugadorActivo(jugador.jugador_activo ? "true" : "false");
        }
    }, [jugador, isEditFormOpen]);

    // ✅ Resetea el formulario
    const resetForm = () => {
        if (!jugador) return;
        setPrimerNombreJugador(jugador.primer_nombre || "");
        setSegundoNombreJugador(jugador.segundo_nombre || "");
        setPrimerApellidoJugador(jugador.primer_apellido || "");
        setSegundoApellidoJugador(jugador.segundo_apellido || "");
        setGenero(jugador.genero ? "true" : "false");
        setFechaNacimiento(jugador.fecha_nacimiento || "");
        setEnfermedadesCronicas(jugador.enfermedades_cronicas || "");
        setFonoJugador(jugador.fono_jugador || "");
        setJugadorActivo(jugador.jugador_activo ? "true" : "false");
    };

    // ✅ Al presionar "Guardar Cambios", abre el diálogo de confirmación
    const handleAlert = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        if (form.reportValidity()) {
            setIsConfirmDialogOpen(true);
        }
    };

    // ✅ Confirmar y guardar cambios
    const handleSave = async () => {
        if (!jugador || jugador.rut_jugador === undefined) {
            console.error("❌ Jugador no válido");
            return;
        }

        setIsLoading(true);
        try {
            const updatedData = {
                primer_nombre: primerNombreJugador,
                segundo_nombre: segundoNombreJugador || null,
                primer_apellido: primerApellidoJugador,
                segundo_apellido: segundoApellidoJugador || null,
                genero: genero === "true",
                fecha_nacimiento: fechaNacimiento,
                enfermedades_cronicas: enfermedadesCronicas || null,
                fono_jugador: fonoJugador || null,
                jugador_activo: jugadorActivo === "true",
            };

            await putJugador(jugador.rut_jugador, updatedData);
            toast.success("El jugador fue modificado correctamente");
            await refreshJugadores();
            setIsEditFormOpen(false);
        } catch (error: any) {
            console.error("❌ Error al modificar jugador:", error);
            toast.error(error.message || "Ocurrió un error al modificar el jugador");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Botón para abrir el diálogo */}
            <Button variant="outline" size="sm" onClick={() => setIsEditFormOpen(true)}>
                <Edit className="w-4 h-4" />
            </Button>

            {/* Diálogo principal */}
            <Dialog open={isEditFormOpen} onOpenChange={setIsEditFormOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Modificar Jugador</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleAlert} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col">
                                <label className="block mb-1">Primer Nombre *</label>
                                <Input
                                    value={primerNombreJugador}
                                    onChange={(e) => setPrimerNombreJugador(e.target.value)}
                                    required
                                    minLength={3}
                                    maxLength={50}
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className="block mb-1">Segundo Nombre</label>
                                <Input
                                    value={segundoNombreJugador}
                                    onChange={(e) => setSegundoNombreJugador(e.target.value)}
                                    minLength={3}
                                    maxLength={50}
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className="block mb-1">Primer Apellido *</label>
                                <Input
                                    value={primerApellidoJugador}
                                    onChange={(e) => setPrimerApellidoJugador(e.target.value)}
                                    required
                                    minLength={3}
                                    maxLength={50}
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className="block mb-1">Segundo Apellido</label>
                                <Input
                                    value={segundoApellidoJugador}
                                    onChange={(e) => setSegundoApellidoJugador(e.target.value)}
                                    minLength={3}
                                    maxLength={50}
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className="block mb-1">Género *</label>
                                <Select value={genero} onValueChange={setGenero}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccione Género" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="true">Masculino</SelectItem>
                                        <SelectItem value="false">Femenino</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex flex-col">
                                <label className="block mb-1">Fecha de Nacimiento *</label>
                                <Input
                                    type="date"
                                    value={fechaNacimiento}
                                    onChange={(e) => setFechaNacimiento(e.target.value)}
                                    required
                                    min={new Date(new Date().setFullYear(new Date().getFullYear() - 80)).toISOString().split("T")[0]}
                                    max={new Date().toISOString().split("T")[0]}
                                />
                            </div>
                            <div className="col-span-2 flex flex-col">
                                <label className="block mb-1">Enfermedades Crónicas</label>
                                <Input
                                    value={enfermedadesCronicas}
                                    onChange={(e) => setEnfermedadesCronicas(e.target.value)}
                                />
                            </div>
                            <div className="col-span-2 flex flex-col">
                                <label className="block mb-1">Teléfono</label>
                                <Input
                                    value={fonoJugador}
                                    onChange={(e) => setFonoJugador(e.target.value)}
                                />
                                <p className="text-sm text-gray-600 mt-2">
                                    Los campos marcados con (*) son obligatorios
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2">
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => {
                                    resetForm();
                                    setIsEditFormOpen(false);
                                    setIsConfirmDialogOpen(false);
                                }}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Guardando..." : "Guardar Cambios"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Diálogo de confirmación */}
            <AlertDialogHandle
                title="Confirmar modificación"
                description={`¿Está seguro que desea modificar al jugador ${primerNombreJugador} ${primerApellidoJugador}?`}
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
// Aqui termina la logica y el formulario de modificar jugador


// Aqui empieza la logica de cargar el excel
export const UploadExcel: React.FC<UploadExcelProps> = ({
    refreshJugadores,
    onUploadComplete,
    openHistory
}) => {
    const { token } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [pendingFile, setPendingFile] = useState<FormData | null>(null);

    const showAlert = (message: string) => {
        setAlertMessage(message);
        setIsAlertOpen(true);
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
            showAlert("Por favor seleccione un archivo Excel (.xlsx o .xls)");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        setPendingFile(formData);

        showAlert("¿Desea agregar a todos los jugadores que aparecen en el archivo?");

        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleConfirmUpload = async () => {
        // Validamos que haya archivo y token
        if (!pendingFile) return;
        if (!token) {
            toast.error("No se encontró token de autenticación. Por favor inicia sesión.");
            return;
        }

        try {
            // ✅ Cast a string para que TypeScript no se queje
            const response = await uploadExcel<{
                message: string;
                insertados: number;
                saltados: number;
                results: any[];
            }>(pendingFile, token);

            const results = response.results ?? [];

            const processedResults = results.map(item => ({
                ...item,
                fecha_creacion: new Date().toLocaleString(),
                rut: item.rut,
                nombreCompleto: `${item.primer_nombre} ${item.segundo_nombre ?? ''} ${item.primer_apellido} ${item.segundo_apellido ?? ''}`.trim()
            }));

            if (onUploadComplete) onUploadComplete(processedResults);

            await refreshJugadores();

            toast.success("Archivo procesado correctamente");
            if (openHistory) openHistory();
        } catch (error: any) {
            console.error(error);
            toast.warning("Error al subir el archivo ⚠️");
        } finally {
            setPendingFile(null);
        }
    };

    return (
        <>
            <input
                type="file"
                accept=".xlsx, .xls"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileUpload}
            />

            <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                style={{ borderColor: "#0000db", color: "#0000db" }}
            >
                <Upload className="w-4 h-4 mr-2" />
                Upload Excel
            </Button>

            <AlertDialogHandle
                title="Mensaje"
                description={alertMessage}
                confirmLabel="Aceptar"
                cancelLabel="Cancelar"
                open={isAlertOpen}
                onOpenChange={(open) => {
                    if (!open && pendingFile) setPendingFile(null);
                    setIsAlertOpen(open);
                }}
                onConfirm={async () => {
                    if (alertMessage.includes("¿Desea agregar")) {
                        await handleConfirmUpload();
                    }
                    setIsAlertOpen(false);
                }}
            />
        </>
    );
};
// Aqui termina la logica de cargar el excel 





export const PlayerRecordsModule: React.FC = () => {
    const [activeTab, setActiveTab] = useState('players');

    const [isUploadHistoryOpen, setIsUploadHistoryOpen] = useState(false);
    const [uploadHistory, setUploadHistory] = useState<any[]>([]);
    const [historyFilter, setHistoryFilter] = useState('ALL');
    const [injuries, setInjuries] = useState<any[]>([]);
    const [playerHistory, setPlayerHistory] = useState<any[]>([]);
    const [players, setPlayers] = useState<Jugador[]>([]);

    // 🔹 Fichas y filtros
    const [selectedClub, setSelectedClub] = useState<string | undefined>(undefined);
    const [selectedSerie, setSelectedSerie] = useState<string | null>(null);
    const [fichas, setFichas] = useState<any[]>([]);
    const [clubs, setClubs] = useState<{ id_club: number; nombre: string }[]>([]);
    const [allSeries, setAllSeries] = useState<{ id_serie: number; nombre_serie: string; id_club: number }[]>([]);
    const [series, setSeries] = useState<{ id_serie: number; nombre_serie: string }[]>([]);

    // 🔹 Obtener jugadores
    const fetchJugadores = async () => {
        try {
            const data = await getJugadores<Jugador[]>();
            setPlayers(data);
        } catch (error) {
            console.error("Error al obtener jugadores:", error);
        }
    };

    // 🔹 Obtener lesiones
    const fetchLesiones = async (): Promise<void> => {
        try {
            const data = await getLesiones<any[]>();
            setInjuries(data);
        } catch (error) {
            console.error("Error cargando lesiones:", error);
        }
    };

    // 🔹 Obtener clubes
    const fetchClubs = async () => {
        try {
            const data = await getClubs<any[]>();
            const mapped = data.map(club => ({
                id_club: club.id_club,
                nombre: club.nombre_club
            }));
            setClubs(mapped);
        } catch (error) {
            console.error("Error al obtener clubes:", error);
        }
    };

    // 🔹 Obtener todas las series (sin filtrar)
    const fetchSeries = async () => {
        try {
            const data = await getSeries<{ id_serie: number; nombre_serie: string; id_club: number }[]>();
            setAllSeries(data);
        } catch (error) {
            console.error("Error al obtener series:", error);
        }
    };

    useEffect(() => {
        fetchJugadores();
        fetchLesiones();
        fetchClubs();
        fetchSeries();
    }, []);

    // 🔹 Filtrar series según club seleccionado
    useEffect(() => {
        if (selectedClub) {
            const filtered = allSeries
                .filter(s => s.id_club === Number(selectedClub))
                .map(s => ({ id_serie: s.id_serie, nombre_serie: s.nombre_serie }));
            setSeries(filtered);
        } else {
            setSeries([]); // Limpiar si no hay club seleccionado
        }
        setSelectedSerie(null);
    }, [selectedClub, allSeries]);

    // 🔹 Filtrado del historial
    const filteredHistory = uploadHistory.filter(item => {
        if (historyFilter === 'ALL') return true;
        if (historyFilter === 'SUCCESS') return item.status === 'success';
        if (historyFilter === 'ERROR') return item.status === 'error';
        return true;
    });

    const totalProcesados = uploadHistory.length;
    const totalExitosos = uploadHistory.filter(item => item.status === 'success').length;
    const totalErrores = uploadHistory.filter(item => item.status === 'error').length;

    // 🔹 Buscar fichas (club y serie obligatorios)
    const buscarFichas = async () => {
        if (!selectedClub || !selectedSerie) {
            alert("Seleccione un club y una serie");
            return;
        }

        try {
            // Traemos todas las fichas
            const data = await getFichasPorFiltro<any[]>();

            // Asociamos cada ficha con su club usando allSeries
            const fichasConClub = data.map(ficha => {
                const serie = allSeries.find(s => s.id_serie === ficha.id_serie);
                return {
                    ...ficha,
                    id_club: serie?.id_club // agregamos id_club temporalmente
                };
            });

            // Filtramos por club y serie
            const filtered = fichasConClub.filter(ficha =>
                ficha.id_club === Number(selectedClub) &&
                ficha.id_serie === Number(selectedSerie)
            );

            setFichas(filtered);
        } catch (error) {
            console.error("Error al obtener fichas:", error);
            setFichas([]);
            alert("No se encontraron fichas con esos filtros");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2>Gestión de Jugadores y Registros Médicos</h2>
                <div className="flex space-x-2 items-center">
                    {/* 🔹 Upload Excel */}
                    <UploadExcel
                        refreshJugadores={fetchJugadores}
                        onUploadComplete={(result) => setUploadHistory(prev => [...prev, ...result])}
                        openHistory={() => setIsUploadHistoryOpen(true)}
                    />

                    {/* 🔹 Botón de historial solo si hay registros cargados */}
                    {uploadHistory.length > 0 && (
                        <Button
                            variant="outline"
                            onClick={() => setIsUploadHistoryOpen(true)}
                            style={{ borderColor: '#FF8C00', color: '#FF8C00' }}
                        >
                            <History className="w-4 h-4 mr-2" />
                            Historial ({uploadHistory.length})
                        </Button>
                    )}

                    {/* 🔹 Nuevo jugador */}
                    <DialogAddJugador refreshJugadores={fetchJugadores} />
                </div>
            </div>

            {/* 🔹 Modal de Historial de Cargas */}
            <Dialog open={isUploadHistoryOpen} onOpenChange={setIsUploadHistoryOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Historial de Cargas Excel</DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-hidden flex flex-col space-y-4">
                        {/* 🔹 Resumen */}
                        <div className="grid grid-cols-3 gap-4">
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">Total Procesados</p>
                                            <p className="text-2xl font-bold text-[#0000db]">{totalProcesados}</p>
                                        </div>
                                        <FileText className="w-8 h-8 text-[#0000db]" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">Exitosos</p>
                                            <p className="text-2xl font-bold text-green-600">{totalExitosos}</p>
                                        </div>
                                        <CheckCircle className="w-8 h-8 text-green-500" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">Con Errores</p>
                                            <p className="text-2xl font-bold text-red-600">{totalErrores}</p>
                                        </div>
                                        <AlertCircle className="w-8 h-8 text-red-500" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* 🔹 Filtros */}
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                                <label className="text-sm font-medium">Filtrar por estado:</label>
                                <Select value={historyFilter} onValueChange={setHistoryFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">Todos</SelectItem>
                                        <SelectItem value="SUCCESS">Solo exitosos</SelectItem>
                                        <SelectItem value="ERROR">Solo errores</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setUploadHistory([])}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Limpiar Historial
                            </Button>
                        </div>

                        {/* 🔹 Tabla de historial */}
                        <div className="flex-1 overflow-auto border rounded-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Fecha/Hora</TableHead>
                                        <TableHead>RUT</TableHead>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Observaciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredHistory.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                                {uploadHistory.length === 0
                                                    ? "No hay registros en el historial"
                                                    : "No hay registros que coincidan con el filtro seleccionado"}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredHistory.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="text-sm">{item.fecha_creacion}</TableCell>
                                                <TableCell className="font-medium">{item.rut}</TableCell>
                                                <TableCell>{item.nombreCompleto}</TableCell>
                                                <TableCell>
                                                    {item.status === 'success' ? (
                                                        <Badge className="bg-green-500 text-white">
                                                            <CheckCircle className="w-3 h-3 mr-1" />
                                                            Exitoso
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="destructive">
                                                            <X className="w-3 h-3 mr-1" />
                                                            Error
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {item.status === 'error' && item.reason ? (
                                                        <span className="text-red-600 text-sm">{item.reason}</span>
                                                    ) : (
                                                        <span className="text-green-600 text-sm">
                                                            Jugador registrado correctamente
                                                        </span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button
                            onClick={() => setIsUploadHistoryOpen(false)}
                            style={{ backgroundColor: '#0000db' }}
                            className="text-white"
                        >
                            Cerrar
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>


            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="players">Jugadores (JUGADOR)</TabsTrigger>
                    <TabsTrigger value="injuries">Lesiones (LESION)</TabsTrigger>
                    <TabsTrigger value="records">Fichas (FICHA_JUGADOR)</TabsTrigger>
                    <TabsTrigger value="history">Historial</TabsTrigger>
                </TabsList>

                <TabsContent value="players" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Jugadores Registrados</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>RUT</TableHead>
                                        <TableHead>Nombre Completo</TableHead>
                                        <TableHead>Fecha Nac.</TableHead>
                                        <TableHead>Condiciones</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {players.length > 0 ? (
                                        players.map((player) => (
                                            <TableRow key={player.rut_jugador}>
                                                <TableCell className="font-medium">{player.rut_jugador}</TableCell>
                                                <TableCell>
                                                    {player.primer_nombre} {player.segundo_nombre} {player.primer_apellido} {player.segundo_apellido}
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(player.fecha_nacimiento).toLocaleDateString('es-CL')}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={player.enfermedades_cronicas === "Ninguna" ? "outline" : "destructive"}>
                                                        {player.enfermedades_cronicas}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={player.jugador_activo ? 'bg-green-500' : 'bg-red-500'}>
                                                        {player.jugador_activo ? 'Activo' : 'Inactivo'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex space-x-1">
                                                        <DialogEditJugador jugador={player} refreshJugadores={fetchJugadores} />
                                                        <DialogViewJugador jugador={player} refreshJugadores={fetchJugadores} />
                                                        <ButtonDeleteJugador
                                                            rutJugador={player.rut_jugador}
                                                            primerNombre={player.primer_nombre}
                                                            primerApellido={player.primer_apellido}
                                                            refreshJugadores={fetchJugadores} />
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center text-gray-500 py-4">
                                                No hay jugadores registrados
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="injuries" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Gestión de Lesiones</CardTitle>
                                <DialogAddLesion refreshLesiones={fetchLesiones} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Jugador</TableHead>
                                        <TableHead>Tipo de Lesión</TableHead>
                                        <TableHead>Descripción</TableHead>
                                        <TableHead>Fecha Lesión</TableHead>
                                        <TableHead>Recuperación (Semanas)</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {injuries.map((injury) => (
                                        <TableRow key={injury.id}>
                                            <TableCell className="font-medium">{injury.rut_jugador}</TableCell>
                                            <TableCell>{injury.tipo_lesion ? "Grave" : "Leve"}</TableCell>
                                            <TableCell className="max-w-xs truncate">{injury.descripcion}</TableCell>
                                            <TableCell>{injury.fecha_lesion}</TableCell>
                                            <TableCell>{injury.tiempo_recuperacion}</TableCell>
                                            <TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={
                                                            injury.fecha_fin_lesion
                                                                ? new Date(injury.fecha_fin_lesion) >= new Date()
                                                                    ? 'bg-red-500'
                                                                    : 'bg-green-500'
                                                                : 'bg-red-500'
                                                        }
                                                    >
                                                        {injury.fecha_fin_lesion
                                                            ? new Date(injury.fecha_fin_lesion) >= new Date()
                                                                ? 'Lesión Activa'
                                                                : 'Lesión Terminada'
                                                            : 'Lesión Activa'}
                                                    </Badge>
                                                </TableCell>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex space-x-1">
                                                    <DialogEditLesion lesion={injury} refreshLesiones={fetchLesiones} />
                                                    <DialogViewLesion lesion={injury} refreshLesiones={fetchLesiones} />
                                                    <ButtonDeleteLesion id_lesion={injury.id_lesion} refreshLesiones={fetchLesiones} />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="records" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Fichas de Jugadores por Club/Serie</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* 🔹 Filtros */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Selección de Club */}
                                    <Select value={selectedClub} onValueChange={setSelectedClub}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar Club" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {clubs.map(club => (
                                                <SelectItem key={club.id_club} value={club.id_club.toString()}>
                                                    {club.nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    {/* Selección de Serie */}
                                    <Select value={selectedSerie || ''} onValueChange={setSelectedSerie} disabled={!selectedClub}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar Serie" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {series.map(serie => (
                                                <SelectItem key={serie.id_serie} value={serie.id_serie.toString()}>
                                                    {serie.nombre_serie}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    {/* Botón de búsqueda */}
                                    <Button style={{ backgroundColor: '#0000db' }} className="text-white" onClick={buscarFichas}>
                                        <Search className="w-4 h-4 mr-2" />
                                        Buscar Fichas
                                    </Button>
                                </div>

                                {/* 🔹 Tabla de fichas */}
                                {fichas.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p>Seleccione un club y serie para ver las fichas de jugadores</p>
                                    </div>
                                ) : (
                                    <div className="overflow-auto border rounded-lg">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>RUT</TableHead>
                                                    <TableHead>Nombre Completo</TableHead>
                                                    <TableHead>Club</TableHead>
                                                    <TableHead>Serie</TableHead>
                                                    <TableHead>Fecha Creación</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {fichas.map(ficha => (
                                                    <TableRow key={ficha.id_ficha}>
                                                        <TableCell>{ficha.rut_jugador}</TableCell>
                                                        <TableCell>
                                                            {ficha.primer_nombre} {ficha.segundo_nombre || ''} {ficha.primer_apellido} {ficha.segundo_apellido || ''}
                                                        </TableCell>
                                                        <TableCell>{ficha.nombre_club}</TableCell>
                                                        <TableCell>{ficha.nombre_serie}</TableCell>
                                                        <TableCell>{new Date(ficha.fecha_creacion).toLocaleDateString('es-CL')}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="history" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Historial de Jugadores</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>RUT Jugador</TableHead>
                                        <TableHead>Acción</TableHead>
                                        <TableHead>Detalle</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {playerHistory.map((item, i) => (
                                        <TableRow key={i}>
                                            <TableCell>{item.fecha}</TableCell>
                                            <TableCell>{item.rut_jugador}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{item.accion}</Badge>
                                            </TableCell>
                                            <TableCell>{item.detalle}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div >
    );
};