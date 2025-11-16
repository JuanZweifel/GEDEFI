import React, { useState, useEffect, useRef } from "react";
import { Button } from "../components/ui/button";
import { AlertDialogHandle } from "../components/alert-dialog-component";
import { toast } from "sonner";
import { putFichaJugador, deleteFichaJugador } from "../services/fichaJugadorService";
import { Input } from "../components/ui/input";
import { Dialog } from "../components/ui/dialog";
import { Edit, Eye, Trash2 } from "lucide-react";
import { DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { useAuth } from "../contexts/authContext";

interface DialogEditFichaJugadorProps {
    ficha: FichaJugador;
    refreshFichas: () => Promise<void>;
    jugador?: Jugador; 
}

interface DialogViewFichaJugadorProps {
    ficha: FichaJugador;
    jugador?: Jugador; 
}

interface DialogDeleteFichaJugadorProps {
    fichaRut: string;
    fichaIdSerie: number;
    refreshFichas: () => Promise<void>;
}

type FichaJugador = {
    rut_jugador: string;
    id_serie: number;
    fecha_ini: string;
    fecha_fin?: string | null;
    talla_camiseta?: string | null;
    talla_short?: string | null;
    talla_media?: string | null;
    talla_botin?: string | null;
    estatura?: number | null;
    Peso?: number | null;
    imc?: number | null;
    fecha_creacion: string;
    fecha_modificacion: string;
};

type Jugador = {
    rut_jugador: string;
    primer_nombre: string;
    segundo_nombre?: string | null;
    primer_apellido: string;
    segundo_apellido?: string | null;
};

// Aqui comienza la logica de editar una ficha
export const DialogEditFichaJugador: React.FC<DialogEditFichaJugadorProps> = ({
    ficha,
    refreshFichas,
    jugador,
}) => {
    const [fechaIni, setFechaIni] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [tallaCamiseta, setTallaCamiseta] = useState("");
    const [tallaShort, setTallaShort] = useState("");
    const [tallaMedia, setTallaMedia] = useState("");
    const [tallaBotin, setTallaBotin] = useState("");
    const [estatura, setEstatura] = useState<number | null>(null);
    const [peso, setPeso] = useState<number | null>(null);
    const [imc, setImc] = useState<number | null>(null);

    const [isEditFormOpen, setIsEditFormOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

    const formRef = useRef<HTMLFormElement>(null);

    // Inicializa los campos al cargar la ficha
    useEffect(() => {
        if (ficha) {
            setFechaIni(ficha.fecha_ini || "");
            setFechaFin(ficha.fecha_fin || "");
            setTallaCamiseta(ficha.talla_camiseta || "");
            setTallaShort(ficha.talla_short || "");
            setTallaMedia(ficha.talla_media || "");
            setTallaBotin(ficha.talla_botin || "");
            setEstatura(ficha.estatura ?? null);
            setPeso(ficha.Peso ?? null);
            setImc(ficha.imc ?? null);
        }
    }, [ficha]);

    const handleSave = async () => {
        if (!ficha) return;

        if (fechaFin && new Date(fechaFin) < new Date(fechaIni)) {
            toast.error("La fecha de fin no puede ser anterior a la fecha de inicio.");
            return;
        }

        setIsLoading(true);
        try {
            const updatedData = {
                fecha_ini: fechaIni || null,
                fecha_fin: fechaFin || null,
                talla_camiseta: tallaCamiseta || null,
                talla_short: tallaShort || null,
                talla_media: tallaMedia || null,
                talla_botin: tallaBotin || null,
                estatura,
                Peso: peso,
                imc,
            };

            await putFichaJugador(ficha.rut_jugador, ficha.id_serie, updatedData);
            toast.success("Ficha actualizada correctamente");
            await refreshFichas();
            setIsEditFormOpen(false);
        } catch (err: any) {
            console.error("❌ Error al actualizar ficha:", err);
            toast.error(err.message || "Ocurrió un error al actualizar la ficha");
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
                        <DialogTitle>Editar Ficha Jugador</DialogTitle>
                        {jugador && (
                            <p className="text-sm text-gray-600 mt-1">
                                <strong>Jugador:</strong> {jugador.primer_nombre} {jugador.segundo_nombre || ''} {jugador.primer_apellido} {jugador.segundo_apellido || ''}<br />
                                <strong>RUT:</strong> {jugador.rut_jugador}
                            </p>
                        )}
                    </DialogHeader>

                    <form
                        ref={formRef}
                        onSubmit={(e) => {
                            e.preventDefault();
                            setIsConfirmDialogOpen(true);
                        }}
                        className="flex flex-col gap-4"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            {/* Tallas */}
                            <div className="flex flex-col">
                                <label className="block mb-1">Talla Camiseta</label>
                                <Input
                                    value={tallaCamiseta}
                                    onChange={(e) => setTallaCamiseta(e.target.value)}
                                />
                            </div>

                            <div className="flex flex-col">
                                <label className="block mb-1">Talla Short</label>
                                <Input value={tallaShort} onChange={(e) => setTallaShort(e.target.value)} />
                            </div>

                            <div className="flex flex-col">
                                <label className="block mb-1">Talla Media</label>
                                <Input value={tallaMedia} onChange={(e) => setTallaMedia(e.target.value)} />
                            </div>

                            <div className="flex flex-col">
                                <label className="block mb-1">Talla Botín</label>
                                <Input value={tallaBotin} onChange={(e) => setTallaBotin(e.target.value)} />
                            </div>

                            {/* Medidas */}
                            <div className="flex flex-col">
                                <label className="block mb-1">Estatura (cm)</label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={estatura ?? ""}
                                    onChange={(e) =>
                                        setEstatura(e.target.value ? Number(e.target.value) : null)
                                    }
                                />
                            </div>

                            <div className="flex flex-col">
                                <label className="block mb-1">Peso (kg)</label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={peso ?? ""}
                                    onChange={(e) => setPeso(e.target.value ? Number(e.target.value) : null)}
                                />
                            </div>

                            <div className="flex flex-col">
                                <label className="block mb-1">IMC</label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={imc ?? ""}
                                    onChange={(e) => setImc(e.target.value ? Number(e.target.value) : null)}
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
                                style={{ backgroundColor: "#0000db" }}
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
                description="¿Deseas guardar los cambios en esta ficha?"
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
// Aqui termina la logica de editar una ficha


// Aqui comienza la logica de ver una ficha
export const DialogViewFichaJugador: React.FC<DialogViewFichaJugadorProps> = ({ ficha, jugador }) => {
    const [fechaIni, setFechaIni] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [tallaCamiseta, setTallaCamiseta] = useState("");
    const [tallaShort, setTallaShort] = useState("");
    const [tallaMedia, setTallaMedia] = useState("");
    const [tallaBotin, setTallaBotin] = useState("");
    const [estatura, setEstatura] = useState<number | null>(null);
    const [peso, setPeso] = useState<number | null>(null);
    const [imc, setImc] = useState<number | null>(null);

    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (ficha) {
            setFechaIni(ficha.fecha_ini || "");
            setFechaFin(ficha.fecha_fin || "");
            setTallaCamiseta(ficha.talla_camiseta || "");
            setTallaShort(ficha.talla_short || "");
            setTallaMedia(ficha.talla_media || "");
            setTallaBotin(ficha.talla_botin || "");
            setEstatura(ficha.estatura ?? null);
            setPeso(ficha.Peso ?? null);
            setImc(ficha.imc ?? null);
        }
    }, [ficha]);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4" />
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Ficha Jugador</DialogTitle>
                    {jugador && (
                        <p className="text-sm text-gray-600 mt-1">
                            <strong>Jugador:</strong> {jugador.primer_nombre} {jugador.segundo_nombre || ''} {jugador.primer_apellido} {jugador.segundo_apellido || ''}<br />
                            <strong>RUT:</strong> {jugador.rut_jugador}
                        </p>
                    )}
                </DialogHeader>

                <form ref={formRef} className="flex flex-col gap-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col">
                            <label className="block mb-1">Fecha Inicio</label>
                            <Input type="date" value={fechaIni} disabled />
                        </div>

                        <div className="flex flex-col">
                            <label className="block mb-1">Fecha Fin</label>
                            <Input type="date" value={fechaFin} disabled />
                        </div>

                        <div className="flex flex-col">
                            <label className="block mb-1">Talla Camiseta</label>
                            <Input value={tallaCamiseta} disabled />
                        </div>

                        <div className="flex flex-col">
                            <label className="block mb-1">Talla Short</label>
                            <Input value={tallaShort} disabled />
                        </div>

                        <div className="flex flex-col">
                            <label className="block mb-1">Talla Media</label>
                            <Input value={tallaMedia} disabled />
                        </div>

                        <div className="flex flex-col">
                            <label className="block mb-1">Talla Botín</label>
                            <Input value={tallaBotin} disabled />
                        </div>

                        <div className="flex flex-col">
                            <label className="block mb-1">Estatura (cm)</label>
                            <Input type="number" value={estatura ?? ""} disabled />
                        </div>

                        <div className="flex flex-col">
                            <label className="block mb-1">Peso (kg)</label>
                            <Input type="number" value={peso ?? ""} disabled />
                        </div>

                        <div className="flex flex-col">
                            <label className="block mb-1">IMC</label>
                            <Input type="number" value={imc ?? ""} disabled />
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
// Aqui termina la logica de ver una ficha


// Aqui comienza la logica de eliminar una ficha
export const DialogDeleteFichaJugador: React.FC<DialogDeleteFichaJugadorProps> = ({
    fichaRut,
    fichaIdSerie,
    refreshFichas,
}) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { token } = useAuth()

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            await deleteFichaJugador(fichaRut, fichaIdSerie, token!);
            toast.success("Ficha eliminada correctamente");
            await refreshFichas();
        } catch (err: any) {
            console.error("❌ Error al eliminar ficha:", err);
            toast.error(err.message || "Ocurrió un error al eliminar la ficha");
        } finally {
            setIsLoading(false);
            setIsDialogOpen(false);
        }
    };

    return (
        <>
            <Button
                variant="destructive"
                size="sm"
                onClick={() => setIsDialogOpen(true)}
            >
                <Trash2 className="w-4 h-4 mr-1"/>
            </Button>

            <AlertDialogHandle
                title="Confirmar eliminación"
                description="¿Estás seguro que deseas eliminar esta ficha? Esta acción no se puede deshacer."
                confirmLabel="Eliminar"
                cancelLabel="Cancelar"
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onConfirm={handleDelete}
            />
        </>
    );
};
// Aqui termina la logica de eliminar una ficha