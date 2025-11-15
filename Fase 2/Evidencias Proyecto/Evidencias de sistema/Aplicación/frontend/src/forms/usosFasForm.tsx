import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { AlertDialogHandle } from "../components/alert-dialog-component";
import { Plus, Eye, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/authContext";
import { postUsoFas, putUsoFas, deleteUsoFas } from "../services/fasServices";

// ---------- Tipos ----------
type UsoFas = {
    id_uso_fas: number;
    id_fas: number;
    rut_jugador: string;
    monto_usado: number;
    fecha_uso: string;
    descripcion_gasto: string;
};
type Fas = {
    id_fas: number;
    anio_fas: number;
    monto_inicial: number;
    monto_disponible: number;
    descripcion?: string;
    activo: boolean;
    fecha_creacion: string;
    fecha_modificacion: string;
};

type DialogAddUsoFasProps = {
    fasList: Fas[];
    refreshUsosFas: () => Promise<void>;
};

type DialogViewUsoFasProps = {
    uso: UsoFas;
};

type DialogEditUsoFasProps = {
    uso: UsoFas;
    refreshUsosFas: () => Promise<void>;
};

type ButtonDeleteUsoFasProps = {
    id_uso_fas: number;
    refreshUsosFas: () => Promise<void>;
};


// Aqui comienza la logica de crear un uso del FAS
export const DialogAddUsoFas: React.FC<DialogAddUsoFasProps> = ({ fasList, refreshUsosFas }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

    const [id_fas, setIdFas] = useState<number | "">("")
    const [rutJugador, setRutJugador] = useState("");
    const [montoUsado, setMontoUsado] = useState<number | "">("");
    const [descripcion, setDescripcion] = useState("");

    const { token } = useAuth();

    const currentYear = new Date().getFullYear();
    const fasActual = fasList?.find(f => f.anio_fas === currentYear);

    useEffect(() => {
        console.log("TOKEN ACTUAL:", token);
        if (!isOpen) {
            setIdFas("");
            setRutJugador("");
            setMontoUsado("");
            setDescripcion("");
        }
    }, [isOpen]);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await postUsoFas(
                {
                    id_fas: fasActual?.id_fas,
                    rut_jugador: rutJugador.trim(),
                    monto_usado: Number(montoUsado),
                    descripcion_gasto: descripcion,
                    fecha_uso: new Date().toISOString().split("T")[0],
                },
                token!
            );
            toast.success("Uso de FAS registrado correctamente");
            await refreshUsosFas();
            setIdFas("");
            setRutJugador("");
            setMontoUsado("");
            setDescripcion("");

        } catch (error: any) {
            console.log("❌ Error recibido del backend:", error);

            const backendMessage =
                error?.data?.detail ||
                error?.data?.message ||
                "Error al registrar el uso del FAS.";

            toast.error(backendMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button style={{ backgroundColor: "#0000db" }} className="text-white">
                        <Plus className="w-4 h-4 mr-2" /> Nuevo Uso
                    </Button>
                </DialogTrigger>

                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Registrar uso del Fondo FAS</DialogTitle>
                    </DialogHeader>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            setIsConfirmDialogOpen(true);
                        }}
                        className="flex flex-col gap-4"
                    >
                        <div className="flex flex-col">
                            <label>RUT Jugador *</label>
                            <Input value={rutJugador} onChange={(e) => setRutJugador(e.target.value)} required />
                        </div>

                        <div className="flex flex-col">
                            <label>Monto Utilizado *</label>
                            <Input
                                type="number"
                                min="0"
                                value={montoUsado}
                                onChange={(e) => setMontoUsado(Number(e.target.value))}
                                required
                            />
                        </div>

                        <div className="flex flex-col">
                            <label>Descripción</label>
                            <Input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
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
                description="¿Desea registrar este uso del fondo FAS?"
                confirmLabel="Registrar"
                cancelLabel="Cancelar"
                open={isConfirmDialogOpen}
                onOpenChange={setIsConfirmDialogOpen}
                onConfirm={async () => {
                    await handleSave();
                    setIsConfirmDialogOpen(false);
                    setIsOpen(false);
                }}
            />
        </>
    );
};
// Aqui termina la logica de crear un uso del FAS



// Aqui comienza la logica de editar un uso del FAS
export const DialogEditUsoFas: React.FC<DialogEditUsoFasProps> = ({ uso, refreshUsosFas }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

    const [montoUtilizado, setMontoUtilizado] = useState(uso.monto_usado);
    const [descripcion, setDescripcion] = useState(uso.descripcion_gasto || "");

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await putUsoFas(uso.id_uso_fas, {
                monto_usado: Number(montoUtilizado),
                descripcion_gasto: descripcion,
            });
            toast.success("Uso de FAS actualizado correctamente");
            await refreshUsosFas();
            setIsOpen(false);
        } catch (error: any) {
            toast.error(error.message || "Error al actualizar el uso del FAS");
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
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Editar Uso del FAS</DialogTitle>
                    </DialogHeader>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            setIsConfirmDialogOpen(true);
                        }}
                        className="space-y-4"
                    >
                        <div className="flex flex-col">
                            <label>Monto Utilizado *</label>
                            <Input
                                type="number"
                                value={montoUtilizado}
                                onChange={(e) => setMontoUtilizado(Number(e.target.value))}
                                required
                            />
                        </div>

                        <div className="flex flex-col">
                            <label>Descripción</label>
                            <Input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <Button variant="outline" onClick={() => setIsOpen(false)}>
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
                description="¿Desea actualizar este registro de uso del FAS?"
                confirmLabel="Actualizar"
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
// Aqui termina la logica de editar un uso del FAS


// Aqui comienza la logica de eliminar un uso del FAS
export const ButtonDeleteUsoFas: React.FC<ButtonDeleteUsoFasProps> = ({
    id_uso_fas,
    refreshUsosFas,
}) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            await deleteUsoFas(id_uso_fas);
            toast.success("Uso del FAS eliminado correctamente.");
            await refreshUsosFas();
        } catch (error: any) {
            toast.error(error.message || "Error al eliminar el uso del FAS.");
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
                description="¿Está seguro que desea eliminar este uso del FAS? Esta acción no se puede deshacer."
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
// Aqui termina la logica de eliminar un uso del FAS