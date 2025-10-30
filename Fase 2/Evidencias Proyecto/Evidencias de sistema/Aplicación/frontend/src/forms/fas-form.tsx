import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { AlertDialogHandle } from "../components/alert-dialog-component";
import { Plus, Eye, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/authContext";
import { postFas, putFas, deleteFas } from "../services/fasServices";

type Fas = {
    id_fas: number;
    anio_fas: number;
    monto_inicial: number;
    monto_disponible: number;
    descripcion?: string;
    fecha_creacion: string;
    fecha_modificacion: string;
};

type DialogAddFasProps = {
    refreshFas: () => Promise<void>;
};

type DialogViewFasProps = {
    fas: Fas;
};

type DialogEditFasProps = {
    refreshFas: () => Promise<void>;
    fas: Fas;
}

type ButtonDeleteFasProps = {
    id_fas: number;
    anio_fas: number;
    refreshFas: () => Promise<void>;
};

// Aqui comienza la logica de crear un FAS
export const DialogAddFas: React.FC<DialogAddFasProps> = ({ refreshFas }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

    const [anioFas, setAnioFas] = useState<number | "">("");
    const [montoInicial, setMontoInicial] = useState<number | "">("");
    const [descripcion, setDescripcion] = useState("");
    const [activo, setActivo] = useState(true);

    const { token } = useAuth();

    const resetForm = () => {
        setAnioFas("");
        setMontoInicial("");
        setDescripcion("");
        setActivo(true);
    };

    const handleSave = async () => {
        if (!montoInicial) {
            toast.error("Debe ingresar el monto inicial");
            return;
        }

        setIsLoading(true);
        try {
            await postFas(
                {
                    monto_inicial: Number(montoInicial),
                    monto_disponible: Number(montoInicial),
                    descripcion,
                },
                token
            );
            toast.success("Fondo FAS creado correctamente");
            await refreshFas();
            setIsOpen(false);
            resetForm();
        } catch (error: any) {
            toast.error(error.message || "Error al crear FAS");
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
                        Nuevo Fondo FAS
                    </Button>
                </DialogTrigger>

                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Registrar nuevo Fondo FAS</DialogTitle>
                    </DialogHeader>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            setIsConfirmDialogOpen(true);
                        }}
                        className="flex flex-col gap-4"
                    >

                        {/* Monto inicial */}
                        <div className="flex flex-col">
                            <label>Monto Inicial *</label>
                            <Input
                                type="number"
                                min="0"
                                value={montoInicial}
                                onChange={(e) => setMontoInicial(Number(e.target.value))}
                                required
                            />
                        </div>

                        {/* Descripción */}
                        <div className="flex flex-col">
                            <label>Descripción</label>
                            <Input
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                                placeholder="Ej. Fondo solidario anual"
                            />
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
                title="Confirmar creación"
                description={`¿Desea crear el fondo FAS del año ${anioFas}?`}
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
// Aqui termina la logica de crear un FAS


// aqui comienza la logica de ver un FAS
export const DialogViewFas: React.FC<DialogViewFasProps> = ({ fas }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4" />
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Detalles del Fondo FAS</DialogTitle>
                </DialogHeader>

                <div className="space-y-3">
                    <div className="flex flex-col">
                        <label>Año:</label>
                        <Input value={fas.anio_fas} disabled />
                    </div>

                    <div className="flex flex-col">
                        <label>Monto Inicial:</label>
                        <Input value={`$${fas.monto_inicial.toLocaleString("es-CL")}`} disabled />
                    </div>

                    <div className="flex flex-col">
                        <label>Monto Disponible:</label>
                        <Input value={`$${fas.monto_disponible.toLocaleString("es-CL")}`} disabled />
                    </div>

                    <div className="flex flex-col">
                        <label>Descripción:</label>
                        <Input value={fas.descripcion || "-"} disabled />
                    </div>

                    <div className="flex flex-col">
                        <label>Fecha de creación:</label>
                        <Input
                            value={new Date(fas.fecha_creacion).toLocaleDateString("es-CL")}
                            disabled
                        />
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
// Aqui comienza la logica de editar un FAS


// Aqui comienza la logica de editar un FAS
export const DialogEditFas: React.FC<DialogEditFasProps> = ({ fas, refreshFas }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

    const [anioFas, setAnioFas] = useState(fas.anio_fas);
    const [montoInicial, setMontoInicial] = useState(fas.monto_inicial);
    const [montoDisponible, setMontoDisponible] = useState(fas.monto_disponible);
    const [descripcion, setDescripcion] = useState(fas.descripcion || "");

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await putFas(fas.id_fas, {
                anio_fas: anioFas,
                monto_inicial: Number(montoInicial),
                monto_disponible: Number(montoInicial),
                descripcion,
            });
            toast.success("Fondo FAS actualizado correctamente");
            await refreshFas();
            setIsOpen(false);
        } catch (error: any) {
            console.error("Error al actualizar FAS:", error);
            toast.error(error.message || "Error al actualizar el Fondo FAS");
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setAnioFas(fas.anio_fas);
        setMontoInicial(fas.monto_inicial);
        setMontoDisponible(fas.monto_disponible);
        setDescripcion(fas.descripcion || "");
    };

    return (
        <>
            <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
                <Edit className="w-4 h-4" />
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Editar Fondo FAS</DialogTitle>
                    </DialogHeader>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            setIsConfirmDialogOpen(true);
                        }}
                        className="space-y-4"
                    >

                        <div className="flex flex-col">
                            <label>Monto Inicial *</label>
                            <Input
                                type="number"
                                step="0.01"
                                value={montoInicial}
                                onChange={(e) => setMontoInicial(Number(e.target.value))}
                                required
                            />
                        </div>

                        <div className="flex flex-col">
                            <label>Descripción</label>
                            <Input
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                            />
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => {
                                    resetForm();
                                    setIsOpen(false);
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

            <AlertDialogHandle
                title="Confirmar modificación"
                description={`¿Está seguro que desea actualizar el fondo del año ${anioFas}?`}
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
// Aqui termina la logica de editar un FAS


// Aqui comienza la logica de eliminar un FAS
export const ButtonDeleteFas: React.FC<ButtonDeleteFasProps> = ({
    id_fas,
    anio_fas,
    refreshFas,
}) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            await deleteFas(id_fas);
            toast.success(`Fondo FAS del año ${anio_fas} eliminado correctamente.`);
            await refreshFas();
        } catch (error: any) {
            console.error("Error al eliminar FAS:", error);
            if (error.status === 404) {
                toast.error("El fondo FAS no existe o ya fue eliminado.");
            } else if (error.status === 400) {
                toast.error("No se puede eliminar este FAS.");
            } else {
                toast.error(error.message || "Error al eliminar el Fondo FAS.");
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
                description={`¿Está seguro que desea eliminar el Fondo FAS del año ${anio_fas}? Esta acción no se puede deshacer.`}
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
// Aqui Termina la logica de eliminar un FAS


