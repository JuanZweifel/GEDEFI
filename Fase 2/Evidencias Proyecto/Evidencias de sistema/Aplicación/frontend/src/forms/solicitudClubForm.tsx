import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { AlertDialogHandle } from "../components/alert-dialog-component";
import { useAuth } from "../contexts/authContext";
import { createSolicitud } from "../services/solicitudService";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "../components/ui/select";

export function SolicitudClubForm({ refreshSolicitudes, }: {
    refreshSolicitudes: () => Promise<void>;
}) {
    const { token, rut } = useAuth();

    const [form, setForm] = useState({
        categoria: "",
        descripcion: "",
        usuario_solicitud: rut || "",
    });
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const categorias = [
        { id: 1, name: "Solicitud de Permiso" },
        { id: 2, name: "Cambio de Horario" },
        { id: 3, name: "Actualización de Datos" },
        { id: 4, name: "Otros" },
    ];

    const handleAlert = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (e.currentTarget.reportValidity()) setOpen(true);
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const payload = {
                ...form,
                categoria: parseInt(form.categoria, 10),
                usuario_solicitud: rut,
            };

            await createSolicitud(payload, token);
            toast.success("Solicitud enviada correctamente.");
            setForm({ categoria: "", descripcion: "", usuario_solicitud: rut });
            await refreshSolicitudes();

        } catch (error: any) {
            console.error("Solicitud error:", error.detail);
            toast.error(error.message || "Error de conexión con el servidor.");
        } finally {
            setIsLoading(false);
            setOpen(false);
        }
    };

    return (
        <form onSubmit={handleAlert} className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-1">Categoría *</label>
                <Select
                    value={form.categoria}
                    onValueChange={(val) => setForm({ ...form, categoria: val })}
                    required
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                        {categorias.map((cat) => (
                            <SelectItem key={cat.id} value={String(cat.id)}>
                                {cat.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Descripción *</label>
                <Textarea
                    value={form.descripcion}
                    onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                    required
                    placeholder="Describe la solicitud..."
                />
            </div>

            <div className="flex justify-end">
                <Button type="submit" className="bg-blue-500 text-white">
                    {!isLoading && <Plus className="w-4 h-4 mr-2" />}
                    {isLoading ? "Enviando..." : "Enviar solicitud"}
                </Button>
            </div>

            <AlertDialogHandle
                title="¿Desea enviar la solicitud?"
                description="Tu solicitud será enviada a la asociación."
                confirmLabel="Enviar"
                cancelLabel="Cancelar"
                onConfirm={handleSubmit}
                open={open}
                onOpenChange={setOpen}
            />
        </form>
    );
}
