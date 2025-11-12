import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Plus, Edit, Eye, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { putJugador, postJugador, deleteJugador } from '../services/jugadoresService';
import { postFichaJugador } from '../services/fichaJugadorService'
import { postDetalleClubJugador } from '../services/detalleClubJugadorService';
import { AlertDialogHandle } from '../components/alert-dialog-component';
import { getSeries } from '../services/serieService';
import { useAuth } from '../contexts/authContext';

type DialogAddJugadorProps = {
    refreshJugadores: () => Promise<void>;
};

type DialogEditJugadorProps = {
    jugador: Jugador;
    refreshJugadores: () => Promise<void>;
};

type DialogViewJugadorProps = {
    jugador: Jugador;
    refreshJugadores: () => Promise<void>
};

type ButtonDeleteJugadorProps = {
    rutJugador: string;
    primerNombre: string;
    primerApellido: string;
    refreshJugadores: () => Promise<void>;
};

type Jugador = {
    rut_jugador: string;
    primer_nombre: string;
    segundo_nombre?: string | null;
    primer_apellido: string;
    segundo_apellido?: string | null;
    genero: boolean;
    fecha_nacimiento: string;
    enfermedades_cronicas?: string | null;
    fono_jugador?: string | null;
};


// Aqui comienza la logica de crear un jugador
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
    const [tieneEnfermedades, setTieneEnfermedades] = useState<boolean | null>(null);
    const [fonoJugador, setFonoJugador] = useState("");
    const [jugadorActivo, setJugadorActivo] = useState<string>("true");

    const [series, setSeries] = useState<{ id_serie: number; nombre_serie: string; id_club: number }[]>([]);
    const [selectedSerie, setSelectedSerie] = useState<number | null>(null);

    const { id_club, token } = useAuth();

    useEffect(() => {
        getSeries<{ id_serie: number; nombre_serie: string; id_club: number }[]>(token)
            .then(data => {
                if (id_club) {
                    const filtradas = data.filter(s => s.id_club === Number(id_club));
                    setSeries(filtradas);
                }
            })
            .catch(err => console.error("Error al cargar series:", err));
    }, [id_club]);

    const validarRut = (rut: string): boolean => {
        rut = rut.replace(/\s+/g, "").toUpperCase();
        const [numero, dv] = rut.split("-");
        if (!numero || !dv) return false;
        if (!/^\d+$/.test(numero)) return false;
        let suma = 0, factor = 2;
        for (let i = numero.length - 1; i >= 0; i--) {
            suma += parseInt(numero[i], 10) * factor;
            factor = factor === 7 ? 2 : factor + 1;
        }
        const dvCalculado = 11 - (suma % 11);
        let dvEsperado = dvCalculado === 11 ? "0" : dvCalculado === 10 ? "K" : dvCalculado.toString();
        return dv === dvEsperado;
    };

    const validarCelularChile = (numero: string): string => {
        const tel = numero.trim();
        const patrones = [/^\+569\d{8}$/, /^9\d{8}$/, /^41\d{8}$/];
        if (!patrones.some(p => p.test(tel))) throw new Error("Número de celular inválido");
        return tel;
    };

    const resetForm = () => {
        setRutJugador("");
        setPrimerNombreJugador("");
        setSegundoNombreJugador("");
        setPrimerApellidoJugador("");
        setSegundoApellidoJugador("");
        setGenero("");
        setFechaNacimiento("");
        setEnfermedadesCronicas("");
        setTieneEnfermedades(null);
        setFonoJugador("");
        setJugadorActivo("true");
        setSelectedSerie(null);
    };

    const handleAlert = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (e.currentTarget.reportValidity()) setIsConfirmDialogOpen(true);
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const jugadorCreado = await postJugador<Jugador>({
                rut_jugador: rutJugador,
                primer_nombre: primerNombreJugador,
                segundo_nombre: segundoNombreJugador || null,
                primer_apellido: primerApellidoJugador,
                segundo_apellido: segundoApellidoJugador || null,
                genero: genero === "true",
                fecha_nacimiento: fechaNacimiento,
                enfermedades_cronicas:
                    tieneEnfermedades === true ? enfermedadesCronicas : null,
                fono_jugador: fonoJugador || null,
                jugador_activo: jugadorActivo === "true",
            });

            if (selectedSerie) {
                await postFichaJugador({
                    rut_jugador: jugadorCreado.rut_jugador,
                    id_serie: selectedSerie,
                });
            }

            if (id_club) {
                await postDetalleClubJugador({
                    rut_jugador: jugadorCreado.rut_jugador,
                    id_club: Number(id_club),
                });
            }

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
                toast.error(error.data.detail || "Error al crear jugador");
            } else {
                toast.error(error.message || "Ocurrió un error inesperado al agregar el jugador.");
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
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo Jugador
                    </Button>
                </DialogTrigger>

                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Agregar Jugador</DialogTitle>
                    </DialogHeader>

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
                                        if (!validarRut(value)) {
                                            e.currentTarget.setCustomValidity("RUT inválido. Verifica el formato y dígito verificador.");
                                        } else {
                                            e.currentTarget.setCustomValidity("");
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
                                    minLength={3}
                                    maxLength={30}
                                    required
                                />
                            </div>

                            {/* Segundo Nombre */}
                            <div className="flex flex-col">
                                <label className="block mb-1">Segundo Nombre</label>
                                <Input
                                    value={segundoNombreJugador}
                                    onChange={(e) => setSegundoNombreJugador(e.target.value)}
                                    minLength={3}
                                    maxLength={30}
                                />
                            </div>

                            {/* Primer Apellido */}
                            <div className="flex flex-col">
                                <label className="block mb-1">Primer Apellido *</label>
                                <Input
                                    value={primerApellidoJugador}
                                    onChange={(e) => setPrimerApellidoJugador(e.target.value)}
                                    minLength={3}
                                    maxLength={30}
                                    required
                                />
                            </div>

                            {/* Segundo Apellido */}
                            <div className="flex flex-col">
                                <label className="block mb-1">Segundo Apellido</label>
                                <Input
                                    value={segundoApellidoJugador}
                                    onChange={(e) => setSegundoApellidoJugador(e.target.value)}
                                    minLength={3}
                                    maxLength={30}
                                />
                            </div>

                            {/* Género */}
                            <div className="flex flex-col">
                                <label className="block mb-1">Género *</label>
                                <Select value={genero} onValueChange={(value: string) => setGenero(value)} required>
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
                                    min={new Date(new Date().setFullYear(new Date().getFullYear() - 80))
                                        .toISOString()
                                        .split("T")[0]}
                                    max={new Date().toISOString().split("T")[0]}
                                />
                            </div>

                            {/* ✅ Pregunta Enfermedades Crónicas */}
                            <div className="col-span-2 flex flex-col">
                                <label className="block mb-1">¿El jugador tiene enfermedades crónicas?</label>
                                <div className="flex gap-6 mt-1">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="enfermedades"
                                            value="si"
                                            checked={tieneEnfermedades === true}
                                            onChange={() => setTieneEnfermedades(true)}
                                        />
                                        Sí
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="enfermedades"
                                            value="no"
                                            checked={tieneEnfermedades === false}
                                            onChange={() => {
                                                setTieneEnfermedades(false);
                                                setEnfermedadesCronicas("");
                                            }}
                                        />
                                        No
                                    </label>
                                </div>
                            </div>

                            {/* ✅ Campo solo si elige "Sí" */}
                            {tieneEnfermedades && (
                                <div className="col-span-2 flex flex-col">
                                    <label className="block mb-1">Enfermedades Crónicas</label>
                                    <Input
                                        value={enfermedadesCronicas}
                                        onChange={(e) => setEnfermedadesCronicas(e.target.value)}
                                        required
                                    />
                                </div>
                            )}

                            {/* Teléfono */}
                            <div className="col-span-2 flex flex-col">
                                <label className="block mb-1">Teléfono</label>
                                <Input
                                    value={fonoJugador}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setFonoJugador(value);
                                        try {
                                            validarCelularChile(value);
                                            e.currentTarget.setCustomValidity("");
                                        } catch (error: any) {
                                            e.currentTarget.setCustomValidity(error.message);
                                        }
                                    }}
                                    pattern="^(\+569\d{8}|9\d{8}|41\d{8})$"
                                    title="Ingrese un número de celular chileno válido (+569XXXXXXXX, 9XXXXXXXX o 41XXXXXXXX)"
                                />
                            </div>
                        </div>

                        {/* Serie */}
                        <div className="col-span-2 flex flex-col">
                            <label className="block mb-1">Serie *</label>
                            <Select
                                value={selectedSerie?.toString() || ""}
                                onValueChange={(value: string) => setSelectedSerie(Number(value))}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccione Serie" />
                                </SelectTrigger>
                                <SelectContent>
                                    {series.map((s) => (
                                        <SelectItem key={s.id_serie} value={s.id_serie.toString()}>
                                            {s.nombre_serie}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-sm text-gray-600 mt-2">
                                Los campos marcados con (*) son obligatorios
                            </p>
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
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Guardando..." : "Guardar"}
                            </Button>
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
// Aqui termina la logica de crear un jugador


// Aqui comienza la logica de editar un jugador
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
    const [tieneEnfermedades, setTieneEnfermedades] = useState<boolean | null>(null);
    const [series, setSeries] = useState<{ id_serie: number; nombre_serie: string; id_club: number }[]>([]);
    const [selectedSerie, setSelectedSerie] = useState<number | null>(null);

    const [isEditFormOpen, setIsEditFormOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

    const { id_club, token } = useAuth();

    // ✅ Cargar series del club
    useEffect(() => {
        getSeries<{ id_serie: number; nombre_serie: string; id_club: number }[]>(token)
            .then(data => {
                if (id_club) {
                    const filtradas = data.filter(s => s.id_club === Number(id_club));
                    setSeries(filtradas);
                }
            })
            .catch(err => console.error("Error al cargar series:", err));
    }, [id_club]);

    // ✅ Validar formato de celular
    const validarCelularChile = (numero: string): string => {
        const tel = numero.trim();
        const patrones = [/^\+569\d{8}$/, /^9\d{8}$/, /^41\d{8}$/];
        if (!patrones.some((p) => p.test(tel))) {
            throw new Error("Número de celular inválido");
        }
        return tel;
    };

    // ✅ Cargar datos del jugador al abrir el diálogo
    useEffect(() => {
        if (jugador && isEditFormOpen) {
            setPrimerNombreJugador(jugador.primer_nombre || "");
            setSegundoNombreJugador(jugador.segundo_nombre || "");
            setPrimerApellidoJugador(jugador.primer_apellido || "");
            setSegundoApellidoJugador(jugador.segundo_apellido || "");
            setGenero(jugador.genero ? "true" : "false");
            setFechaNacimiento(jugador.fecha_nacimiento || "");
            setFonoJugador(jugador.fono_jugador || "");
            setJugadorActivo(jugador.jugador_activo ? "true" : "false");

            // ✅ Si tiene texto en enfermedades_cronicas → true, si está vacío o null → false
            if (jugador.enfermedades_cronicas && jugador.enfermedades_cronicas.trim() !== "") {
                setTieneEnfermedades(true);
                setEnfermedadesCronicas(jugador.enfermedades_cronicas);
            } else {
                setTieneEnfermedades(false);
                setEnfermedadesCronicas("");
            }
        }
    }, [jugador, isEditFormOpen]);

    // ✅ Resetear formulario
    const resetForm = () => {
        if (!jugador) return;
        setPrimerNombreJugador(jugador.primer_nombre || "");
        setSegundoNombreJugador(jugador.segundo_nombre || "");
        setPrimerApellidoJugador(jugador.primer_apellido || "");
        setSegundoApellidoJugador(jugador.segundo_apellido || "");
        setGenero(jugador.genero ? "true" : "false");
        setFechaNacimiento(jugador.fecha_nacimiento || "");
        setFonoJugador(jugador.fono_jugador || "");
        setJugadorActivo(jugador.jugador_activo ? "true" : "false");
        setTieneEnfermedades(jugador.enfermedades_cronicas?.trim() ? true : false);
        setEnfermedadesCronicas(jugador.enfermedades_cronicas || "");
    };

    // ✅ Confirmar antes de guardar
    const handleAlert = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        if (form.reportValidity()) {
            setIsConfirmDialogOpen(true);
        }
    };

    // ✅ Guardar cambios
    const handleSave = async () => {
        if (!jugador || jugador.rut_jugador === undefined) {
            console.error("❌ Jugador no válido");
            return;
        }

        setIsLoading(true);
        try {
            // 🔹 Normalización del campo enfermedades_cronicas
            let enfermedadesValue: string | null = null;

            if (tieneEnfermedades === true) {
                enfermedadesValue =
                    enfermedadesCronicas.trim() !== "" ? enfermedadesCronicas.trim() : null;
            } else {
                enfermedadesValue = null;
                setEnfermedadesCronicas(""); // Limpia visualmente el input
            }

            const updatedData = {
                primer_nombre: primerNombreJugador,
                segundo_nombre: segundoNombreJugador || null,
                primer_apellido: primerApellidoJugador,
                segundo_apellido: segundoApellidoJugador || null,
                genero: genero === "true",
                fecha_nacimiento: fechaNacimiento,
                enfermedades_cronicas: enfermedadesValue, // 👈 Aquí se controla null correctamente
                fono_jugador: fonoJugador.trim() === "" ? null : fonoJugador.trim(),
                jugador_activo: jugadorActivo === "true",
            };

            await putJugador(jugador.rut_jugador, updatedData);
            toast.success("El jugador fue modificado correctamente");
            await refreshJugadores();

            setTimeout(() => setIsEditFormOpen(false), 100);
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
                                    min={new Date(new Date().setFullYear(new Date().getFullYear() - 80))
                                        .toISOString()
                                        .split("T")[0]}
                                    max={new Date().toISOString().split("T")[0]}
                                />
                            </div>




                            {/* ✅ Pregunta Enfermedades Crónicas */}
                            <div className="col-span-2 flex flex-col">
                                <label className="block mb-1">¿El jugador tiene enfermedades crónicas?</label>
                                <div className="flex gap-6 mt-1">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="enfermedades"
                                            value="si"
                                            checked={tieneEnfermedades === true}
                                            onChange={() => setTieneEnfermedades(true)}
                                        />
                                        Sí
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="enfermedades"
                                            value="no"
                                            checked={tieneEnfermedades === false}
                                            onChange={() => {
                                                setTieneEnfermedades(false);
                                                setEnfermedadesCronicas("");
                                            }}
                                        />
                                        No
                                    </label>
                                </div>
                            </div>

                            {/* ✅ Campo solo si elige "Sí" */}
                            {tieneEnfermedades && (
                                <div className="col-span-2 flex flex-col">
                                    <label className="block mb-1">Enfermedades Crónicas</label>
                                    <Input
                                        value={enfermedadesCronicas}
                                        onChange={(e) => setEnfermedadesCronicas(e.target.value)}
                                        required
                                    />
                                </div>
                            )}




                            <div className="col-span-2 flex flex-col">
                                <label className="block mb-1">Teléfono</label>
                                <Input
                                    value={fonoJugador}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setFonoJugador(value);
                                        try {
                                            validarCelularChile(value);
                                            e.currentTarget.setCustomValidity("");
                                        } catch (error: any) {
                                            e.currentTarget.setCustomValidity(error.message);
                                        }
                                    }}
                                    pattern="^(\+569\d{8}|9\d{8}|41\d{8})$"
                                    title="Ingrese un número de celular chileno válido (+569XXXXXXXX, 9XXXXXXXX o 41XXXXXXXX)"
                                />
                            </div>



                            {/* Serie */}
                            <div className="col-span-2 flex flex-col">
                                <label className="block mb-1">Serie *</label>
                                <Select
                                    value={selectedSerie?.toString() || ""}
                                    onValueChange={(value: string) => setSelectedSerie(Number(value))}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccione Serie" />
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



                        </div>

                        <p className="text-sm text-gray-600 mt-2">
                            Los campos marcados con (*) son obligatorios
                        </p>

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
// Aqui termina la logica de editar un jugador


// Aqui comienza la logica de ver un jugador
export const DialogViewJugador: React.FC<DialogViewJugadorProps> = ({
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
// Aqui termina la logica de ver un jugador


//aqui comienza la logica de eliminar un jugador
export const ButtonDeleteJugador: React.FC<ButtonDeleteJugadorProps> = ({
    rutJugador,
    primerNombre,
    primerApellido,
    refreshJugadores,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { token } = useAuth();


    const handleDelete = async () => {
        try {
            setIsLoading(true);
            await deleteJugador(rutJugador, token!);
            await refreshJugadores();
            toast.success(`Jugador ${primerNombre} ${primerApellido} eliminado correctamente`);
            setIsDialogOpen(false);
        } catch (error: any) {
            console.error("❌ Error al eliminar jugador:", error);
            toast.error(error.message || "No se pudo eliminar el jugador. Intenta nuevamente.");
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
//aqui comienza la logica de eliminar un jugador