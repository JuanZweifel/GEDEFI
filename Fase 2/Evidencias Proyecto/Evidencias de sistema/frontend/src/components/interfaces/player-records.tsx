import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
    Plus, Edit, Trash2, Eye, Search,
    History, FileText, AlertCircle, CheckCircle,
    Upload, X
} from 'lucide-react';
import { getJugadores, uploadExcel, putJugador, postJugador, postLesion, getLesiones, putLesion, deleteJugador } from '../../services/jugadoresService';


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
    refreshJugadores: () => Promise<void>;
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

// Aqui comienza la logica de editar una lesion
export const DialogEditLesion: React.FC<DialogEditLesionProps> = ({ lesion, refreshLesiones }) => {
    const [rutJugador, setRutJugador] = useState("");
    const [nombreLesion, setNombreLesion] = useState("");
    const [tipoLesion, setTipoLesion] = useState<boolean | null>(null);
    const [descripcion, setDescripcion] = useState("");
    const [fechaLesion, setFechaLesion] = useState("");
    const [tiempoRecuperacion, setTiempoRecuperacion] = useState("");
    const [fechaFinLesion, setFechaFinLesion] = useState("");
    const [isEditFormOpen, setIsEditFormOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

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

    const handleSave = async () => {
        if (!lesion || lesion.id_lesion === undefined) {
            alert("Error: lesión no válida");
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

            // <-- usamos id_lesion
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
                        <label className="text-sm font-medium">RUT del Jugador</label>
                        <Input
                            value={rutJugador}
                            className="w-full border p-2 rounded"
                            disabled
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Nombre de la Lesión</label>
                        <Input
                            value={nombreLesion}
                            onChange={(e) => setNombreLesion(e.target.value)}
                            className="w-full border p-2 rounded"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Tipo de Lesión</label>
                        <Select
                            value={tipoLesion ? "true" : "false"}
                            onValueChange={(value: string) => setTipoLesion(value === "true")}
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
                        <textarea
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            className="w-full border p-2 rounded"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Fecha de Lesión</label>
                        <Input
                            type="date"
                            value={fechaLesion}
                            onChange={(e) => setFechaLesion(e.target.value)}
                            className="w-full border p-2 rounded"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Tiempo de Recuperación (semanas)</label>
                        <Input
                            type="number"
                            value={tiempoRecuperacion}
                            onChange={(e) => setTiempoRecuperacion(e.target.value)}
                            className="w-full border p-2 rounded"
                            min={0}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Fecha Fin de Lesión</label>
                        <Input
                            type="date"
                            value={fechaFinLesion}
                            onChange={(e) => setFechaFinLesion(e.target.value)}
                            className="w-full border p-2 rounded"
                        />
                    </div>

                    <div className="flex justify-end space-x-2 mt-4">
                        <Button variant="outline" onClick={() => setIsEditFormOpen(false)} disabled={isLoading}>
                            Cancelar
                        </Button>
                        <Button
                            style={{ backgroundColor: '#0000db' }}
                            className="text-white"
                            onClick={handleSave}
                            disabled={isLoading}
                        >
                            Guardar
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
// Aqui termina la logica de editar una lesion

// Aqui comienza la logica de verla lesion de un jugador
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
    const [tipoLesion, setTipoLesion] = useState(false); // booleano
    const [descripcion, setDescripcion] = useState("");
    const [fechaLesion, setFechaLesion] = useState("");
    const [tiempoRecuperacion, setTiempoRecuperacion] = useState("");
    const [fechaFinLesion, setFechaFinLesion] = useState("");

    const handleSubmit = async () => {
        if (!rutJugador || !nombreLesion || !descripcion || !fechaLesion) {
            alert("Por favor completa los campos obligatorios (RUT, Nombre, Descripción y Fecha).");
            return;
        }

        const nuevaLesion = {
            rut_jugador: rutJugador,
            nombre_lesion: nombreLesion,
            tipo_lesion: tipoLesion,
            descripcion,
            fecha_lesion: fechaLesion,
            tiempo_recuperacion: tiempoRecuperacion ? Number(tiempoRecuperacion) : null,
            fecha_fin_lesion: fechaFinLesion || null,
        };

        try {
            await postLesion(nuevaLesion);
            await refreshLesiones();
            setOpen(false);

            // Limpiar formulario
            setRutJugador("");
            setNombreLesion("");
            setTipoLesion(true);
            setDescripcion("");
            setFechaLesion("");
            setTiempoRecuperacion("");
            setFechaFinLesion("");
        } catch (err) {
            console.error(err);
            alert("Ocurrió un error al registrar la lesión.");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button style={{ backgroundColor: "#0000db" }} className="text-white">
                    + Agregar Lesión
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Registrar Lesión</DialogTitle>
                </DialogHeader>

                <div className="space-y-3">
                    <div>
                        <label className="text-sm font-medium">RUT del Jugador</label>
                        <input
                            type="text"
                            value={rutJugador}
                            onChange={(e) => setRutJugador(e.target.value)}
                            className="w-full border p-2 rounded"
                            placeholder="Ej: 12.345.678-9"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Nombre de la Lesión</label>
                        <input
                            type="text"
                            value={nombreLesion}
                            onChange={(e) => setNombreLesion(e.target.value)}
                            className="w-full border p-2 rounded"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Tipo de Lesión</label>
                        <select
                            value={tipoLesion ? "true" : "false"}
                            onChange={(e) => setTipoLesion(e.target.value === "true")}
                            className="w-full border p-2 rounded"
                        >
                            <option value="true">Grave</option>
                            <option value="false">Leve</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-sm font-medium">Descripción</label>
                        <textarea
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            className="w-full border p-2 rounded"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Fecha de Lesión</label>
                        <input
                            type="date"
                            value={fechaLesion}
                            onChange={(e) => setFechaLesion(e.target.value)}
                            className="w-full border p-2 rounded"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Tiempo de Recuperación (semanas)</label>
                        <input
                            type="number"
                            value={tiempoRecuperacion}
                            onChange={(e) => setTiempoRecuperacion(e.target.value)}
                            className="w-full border p-2 rounded"
                            min={0}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Fecha Fin de Lesión</label>
                        <input
                            type="date"
                            value={fechaFinLesion}
                            onChange={(e) => setFechaFinLesion(e.target.value)}
                            className="w-full border p-2 rounded"
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-2 mt-4">
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancelar
                    </Button>
                    <Button
                        style={{ backgroundColor: "#0000db" }}
                        className="text-white"
                        onClick={handleSubmit}
                    >
                        Guardar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
// Aqui termina la logica de creción de lesion

// Aqui comienza la logica de agregar jugador
export const DialogAddJugador: React.FC<DialogAddJugadorProps> = ({ refreshJugadores }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

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
            await refreshJugadores();
            setIsOpen(false);
            // Limpiar campos
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
        } catch (error) {
            console.error(error);
            alert("Error al agregar jugador");
        } finally {
            setIsLoading(false);
        }
    };

    return (
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

                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Rut Jugador" value={rutJugador} onChange={setRutJugador} />
                        <InputField label="Primer Nombre" value={primerNombreJugador} onChange={setPrimerNombreJugador} />
                        <InputField label="Segundo Nombre" value={segundoNombreJugador} onChange={setSegundoNombreJugador} />
                        <InputField label="Primer Apellido" value={primerApellidoJugador} onChange={setPrimerApellidoJugador} />
                        <InputField label="Segundo Apellido" value={segundoApellidoJugador} onChange={setSegundoApellidoJugador} />
                        <SelectField
                            label="Género"
                            value={genero}
                            onChange={setGenero}
                            options={[
                                { value: "true", label: "Masculino" },
                                { value: "false", label: "Femenino" },
                            ]}
                        />
                        <InputField label="Fecha de Nacimiento" type="date" value={fechaNacimiento} onChange={setFechaNacimiento} />
                        <InputField label="Enfermedades Crónicas" value={enfermedadesCronicas} onChange={setEnfermedadesCronicas} />
                        <InputField label="Teléfono" value={fonoJugador} onChange={setFonoJugador} />
                        <SelectField
                            label="Jugador Activo"
                            value={jugadorActivo}
                            onChange={setJugadorActivo}
                            options={[
                                { value: "true", label: "Sí" },
                                { value: "false", label: "No" },
                            ]}
                        />
                    </div>

                    <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSave} disabled={isLoading}>
                            Guardar
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

// Componentes auxiliares
const InputField = ({ label, value, onChange, type = "text" }: any) => (
    <div>
        <label className="block mb-2">{label}</label>
        <Input value={value} type={type} onChange={(e) => onChange(e.target.value)} />
    </div>
);

const SelectField = ({ label, value, onChange, options }: any) => (
    <div>
        <label className="block mb-2">{label}</label>
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger>
                <SelectValue placeholder={`Seleccione ${label}`} />
            </SelectTrigger>
            <SelectContent>
                {options.map((opt: any) => (
                    <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    </div>
);
// Aqui termina la logica de agregar jugador

// Aqui comienza la logica de eliminar un jugador
export const ButtonDeleteJugador: React.FC<ButtonDeleteJugadorProps> = ({ rutJugador, refreshJugadores }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleDelete = async () => {
        const confirmDelete = confirm("⚠️ ¿Estás seguro que deseas eliminar este jugador?");
        if (!confirmDelete) return;

        try {
            setIsLoading(true);
            await deleteJugador(rutJugador); // Llamada a tu servicio backend
            await refreshJugadores(); // Actualiza la lista
            alert("✅ Jugador eliminado correctamente");
        } catch (error) {
            console.error("❌ Error al eliminar jugador:", error);
            alert("❌ No se pudo eliminar el jugador");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            variant="outline"
            size="sm"
            className="text-red-600 border-red-600 hover:bg-red-100"
            onClick={handleDelete}
            disabled={isLoading}
        >
            <Trash2 className="w-4 h-4" />
        </Button>
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
export const DialogFormJugador: React.FC<DialogFormJugadorProps> = ({
    jugador,
    refreshJugadores

}) => {
    const [primerNombreJugador, setPrimerNombreJugador] = useState("");
    const [segundoNombreJugador, setSegundoNombreJugador] = useState("");
    const [primerApellidoJugador, setPrimerApellidoJugador] = useState("");
    const [segundoApellidoJugador, setSegundoApellidoJugador] = useState("");
    const [genero, setGenero] = useState<boolean | null>(null);
    const [fechaNacimiento, setFechaNacimiento] = useState("");
    const [enfermedadesCronicas, setEnfermedadesCronicas] = useState("");
    const [fonoJugador, setFonoJugador] = useState("");
    const [jugadorActivo, setJugadorActivo] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditFormOpen, setIsEditFormOpen] = useState(false);

    // Cargar datos al abrir el diálogo
    useEffect(() => {
        if (jugador) {
            console.log(jugador)
            setPrimerNombreJugador(jugador.primer_nombre);
            setSegundoNombreJugador(jugador.segundo_nombre ? jugador.segundo_nombre : "");
            setPrimerApellidoJugador(jugador.primer_apellido);
            setSegundoApellidoJugador(jugador.segundo_apellido ? jugador.segundo_apellido : "");
            setGenero(jugador.genero);
            setFechaNacimiento(jugador.fecha_nacimiento);
            setEnfermedadesCronicas(jugador.enfermedades_cronicas ? jugador.enfermedades_cronicas : "");
            setFonoJugador(jugador.fono_jugador ? jugador.fono_jugador : "");
            setJugadorActivo(jugador.jugador_activo);
        }
    }, [jugador]);

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        await sleep(3000);
        setIsLoading(false);
        alert("Jugador modificado exitosamente");
    };

    const handleSave = async () => {
        if (!jugador) return;
        try {
            const updatedData = {
                primer_nombre: primerNombreJugador,
                segundo_nombre: segundoNombreJugador || null,
                primer_apellido: primerApellidoJugador,
                segundo_apellido: segundoApellidoJugador || null,
                genero: genero,
                fecha_nacimiento: fechaNacimiento,
                enfermedades_cronicas: enfermedadesCronicas || null,
                fono_jugador: fonoJugador || null,
                jugador_activo: jugadorActivo,
            };

            const data = await putJugador<{ message: string }>(
                jugador.rut_jugador,
                updatedData
            );

            await refreshJugadores();
            setIsEditFormOpen(false);
            setIsLoading(false);

        } catch (error: any) {
            console.error("❌ Error al actualizar jugador:", error);
            alert(error.message || "❌ Error al actualizar jugador");
            setIsLoading(false);
        }
    };

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
                    <Edit className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Modificar jugador</DialogTitle>
                </DialogHeader>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-2">Primer Nombre:</label>
                            <Input
                                placeholder="Primer Nombre"
                                value={primerNombreJugador}
                                onChange={(e) => setPrimerNombreJugador(e.target.value)}
                                required
                                maxLength={50}
                            />
                        </div>
                        <div>
                            <label className="block mb-2">Segundo Nombre:</label>
                            <Input
                                placeholder="Segundo Nombre"
                                value={segundoNombreJugador}
                                onChange={(e) => setSegundoNombreJugador(e.target.value)}
                                maxLength={50}
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="block mb-2">Primer Apellido:</label>
                            <Input
                                placeholder="Primer Apellido"
                                value={primerApellidoJugador}
                                onChange={(e) => setPrimerApellidoJugador(e.target.value)}
                                required
                                maxLength={50}
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="block mb-2">Segundo Apellido:</label>
                            <Input
                                placeholder="Segundo Apellido"
                                value={segundoApellidoJugador}
                                onChange={(e) => setSegundoApellidoJugador(e.target.value)}
                                maxLength={50}
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="block mb-2">Género:</label>
                            <Select value={String(genero)} onValueChange={(value: string) => setGenero(value === "true")} >
                                <SelectTrigger>
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
                            <Input
                                type="date"
                                value={fechaNacimiento}
                                onChange={(e) => setFechaNacimiento(e.target.value)}
                                max={new Date().toISOString().split("T")[0]}
                                className="input"
                                required
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block mb-2">Enfermedades Crónicas:</label>
                            <Input
                                placeholder="Detalle enfermedades crónicas"
                                value={enfermedadesCronicas}
                                onChange={(e) => setEnfermedadesCronicas(e.target.value)}
                                maxLength={200}
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="block mb-2">Teléfono:</label>
                            <Input
                                placeholder="Ej: 987654321"
                                value={fonoJugador}
                                onChange={(e) => setFonoJugador(e.target.value)}
                                pattern="^[0-9]{9}$"
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="block mb-2">Jugador Activo:</label>
                            <Select value={String(jugadorActivo)} onValueChange={(value: string) => setJugadorActivo(value === "true")} >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccione si esta activo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="true">Si</SelectItem>
                                    <SelectItem value="false">No</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-end space-x-2 col-span-2">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={isLoading}
                                onClick={() => setIsEditFormOpen(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                style={{ backgroundColor: '#0000db' }}
                                className="text-white"
                                onClick={handleSave}
                            >
                                Guardar
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
// Aqui termina la logica y el formulario de modificar jugador



// Aqui empieza la logica de cargar el excel
type UploadExcelProps = {
    refreshJugadores: () => Promise<void>;
}

export const UploadExcel: React.FC<UploadExcelProps> = ({ refreshJugadores }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, refreshJugadores: () => Promise<void>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
            alert('Por favor seleccione un archivo Excel (.xlsx o .xls)');
            return;
        }

        // Crear el FormData para enviar el archivo al backend
        const formData = new FormData();
        formData.append("file", file);

        try {
            const data = await uploadExcel(formData)
            alert(data);
            await refreshJugadores()
        } catch (error) {
            console.error("❌ Error al subir el archivo:", error);
            alert("❌ Error al subir el archivo");
        }

        // Limpiar el input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const openFileDialog = () => {
        fileInputRef.current?.click();
    };
    return (<>
        <input
            type="file"
            accept=".xlsx, .xls"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={(event) => handleFileUpload(event, refreshJugadores)}
        />
        <Button
            variant="outline"
            onClick={openFileDialog}
            style={{ borderColor: '#0000db', color: '#0000db' }}
        >
            <Upload className="w-4 h-4 mr-2" />
            Upload Excel
        </Button>
    </>
    )
}


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

export const PlayerRecordsModule: React.FC = () => {
    const [activeTab, setActiveTab] = useState('players');
    const [selectedPlayer, setSelectedPlayer] = useState<Jugador | null>(null);
    const [isUploadHistoryOpen, setIsUploadHistoryOpen] = useState(false);
    const [uploadHistory, setUploadHistory] = useState<any[]>([]);
    const [historyFilter, setHistoryFilter] = useState('ALL');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [injuries, setInjuries] = useState<any[]>([]); // Para lesiones
    const [playerHistory, setPlayerHistory] = useState<any[]>([]); // Para historial
    const [players, setPlayers] = useState<Jugador[]>([]);
    const [jugadores, setJugadores] = useState<Jugador[]>([]);
    const [jugadorSeleccionado, setJugadorSeleccionado] = useState<Jugador | null>(null);
    const [verDialogAbierto, setVerDialogAbierto] = useState(false);

    const [formData, setFormData] = useState({
        primer_nombre: "",
        segundo_nombre: "",
        primer_apellido: "",
        segundo_apellido: "",
        fecha_nacimiento: "",
        genero: true,
    });

    useEffect(() => {
        if (selectedPlayer) {
            setFormData({
                primer_nombre: selectedPlayer.primer_nombre,
                segundo_nombre: selectedPlayer.segundo_nombre || "",
                primer_apellido: selectedPlayer.primer_apellido,
                segundo_apellido: selectedPlayer.segundo_apellido || "",
                fecha_nacimiento: selectedPlayer.fecha_nacimiento || "",
                genero: selectedPlayer.genero,
            });
        }
    }, [selectedPlayer]);


    const openFileDialog = () => {
        fileInputRef.current?.click();
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
            alert('Por favor seleccione un archivo Excel (.xlsx o .xls)');
            return;
        }

        // Crear FormData para enviar al backend
        const formData = new FormData();
        formData.append("file", file);

        try {
            const data = await uploadExcel(formData)
            //alert(data.message);
        } catch (error) {
            console.error(error);
            alert("❌ Error al subir el archivo");
        }

        // Limpiar input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };


    const fetchJugadores = async () => {
        try {
            const data = await getJugadores<Jugador[]>();
            setPlayers(data);
        } catch (error) {
            console.error("Error al obtener jugadores:", error);
        }
    };
    useEffect(() => {
        fetchJugadores();
    }, []);
    // Aqui termina la logica de cargar el excel


    const fetchLesiones = async (): Promise<void> => {
        try {
            const data = await getLesiones<any[]>();
            setInjuries(data);
        } catch (error) {
            console.error("Error cargando lesiones:", error);
        }
    };

    // Llamas al montar el componente padre
    useEffect(() => {
        fetchLesiones();
    }, []);

    const filteredHistory = uploadHistory.filter(item => {
        if (historyFilter === 'ALL') return true;
        if (historyFilter === 'SUCCESS') return item.status === 'success';
        if (historyFilter === 'ERROR') return item.status === 'error';
        return true;
    });

    const successCount = uploadHistory.filter(item => item.status === 'success').length;
    const errorCount = uploadHistory.filter(item => item.status === 'error').length;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2>Gestión de Jugadores y Registros Médicos</h2>
                <div className="flex space-x-2">
                    <UploadExcel refreshJugadores={fetchJugadores} />
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
                    <DialogAddJugador refreshJugadores={fetchJugadores} />
                </div>
            </div>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
            />

            {/* Upload History Modal */}
            <Dialog open={isUploadHistoryOpen} onOpenChange={setIsUploadHistoryOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Historial de Cargas Excel</DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-hidden flex flex-col space-y-4">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-3 gap-4">
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">Total Procesados</p>
                                            <p className="text-2xl font-bold text-[#0000db]">{uploadHistory.length}</p>
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
                                            <p className="text-2xl font-bold text-green-600">{successCount}</p>
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
                                            <p className="text-2xl font-bold text-red-600">{errorCount}</p>
                                        </div>
                                        <AlertCircle className="w-8 h-8 text-red-500" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Filter Controls */}
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

                        {/* History Table */}
                        <div className="flex-1 overflow-auto border rounded-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Fecha/Hora</TableHead>
                                        <TableHead>RUT</TableHead>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Observaciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredHistory.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                                {uploadHistory.length === 0 ?
                                                    "No hay registros en el historial" :
                                                    "No hay registros que coincidan con el filtro seleccionado"
                                                }
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredHistory.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="text-sm">{item.fecha}</TableCell>
                                                <TableCell className="font-medium">{item.rut}</TableCell>
                                                <TableCell>{item.nombre}</TableCell>
                                                <TableCell>{item.email || '-'}</TableCell>
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
                                                    {item.error ? (
                                                        <span className="text-red-600 text-sm">{item.error}</span>
                                                    ) : (
                                                        <span className="text-green-600 text-sm">Jugador registrado correctamente</span>
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
                                                        <DialogFormJugador jugador={player} refreshJugadores={fetchJugadores} />
                                                        <DialogViewJugador jugador={player} refreshJugadores={fetchJugadores} />
                                                        <ButtonDeleteJugador rutJugador={player.rut_jugador} refreshJugadores={fetchJugadores} />
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
                                                    <Button variant="destructive" size="sm">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
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
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar Club" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">FC Barcelona Santiago</SelectItem>
                                            <SelectItem value="2">Real Madrid Chile</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar Serie" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">Serie A Masculina</SelectItem>
                                            <SelectItem value="2">Serie Juvenil</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button style={{ backgroundColor: '#0000db' }} className="text-white">
                                        <Search className="w-4 h-4 mr-2" />
                                        Buscar Fichas
                                    </Button>
                                </div>

                                <div className="text-center py-8 text-gray-500">
                                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>Seleccione un club y serie para ver las fichas de jugadores</p>
                                </div>
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