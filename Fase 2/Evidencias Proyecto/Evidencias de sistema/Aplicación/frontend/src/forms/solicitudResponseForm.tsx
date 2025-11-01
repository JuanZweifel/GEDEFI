import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectItem, SelectContent } from "../components/ui/select";
import { AlertDialogHandle } from "../components/alert-dialog-component";
import { toast } from "sonner";
import { useAuth } from "../contexts/authContext";
import { respondSolicitud } from "../services/solicitudService";

type Solicitud = {
    id_solicitud: number;
    categoria: string;
    descripcion: string;
    estado: boolean;
    respuesta?: string;
    usuario_solicitud: number;
};

export function SolicitudResponseForm({
    solicitud,
    refreshSolicitudes,
    onSuccess,
}: {
    solicitud: Solicitud;
    refreshSolicitudes: () => Promise<void>;
    onSuccess: () => void;
}) {
    const { token } = useAuth();
    const [form, setForm] = useState({
        respuesta: solicitud.respuesta || "",
        estado: solicitud.estado,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const handleAlert = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (e.currentTarget.reportValidity()) setOpen(true);
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const payload = {
                respuesta: form.respuesta,
                estado: form.estado = true,
            };

            await respondSolicitud(solicitud.id_solicitud, payload, token);

            toast.success("Solicitud actualizada correctamente!");
            await refreshSolicitudes();
            onSuccess();
        } catch (error: any) {
            toast.error(error.message || "Error de conexión con el servidor.");
        } finally {
            setIsLoading(false);
            setOpen(false);
        }
    };

    return (
        <form onSubmit={handleAlert} className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-1">Categoría</label>
                <p className="border rounded p-2 bg-gray-100">{solicitud.categoria}</p>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <p className="border rounded p-2 bg-gray-100">{solicitud.descripcion}</p>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Respuesta</label>
                <Textarea
                    value={form.respuesta}
                    onChange={(e) => setForm({ ...form, respuesta: e.target.value })}
                    required
                    placeholder="Ingrese la respuesta..."
                />
            </div>

            <div className="flex justify-end">
                <Button type="submit" style={{ backgroundColor: "#0000db" }} className="text-white">
                    {isLoading ? "Guardando..." : "Guardar respuesta"}
                </Button>
            </div>

            <AlertDialogHandle
                title="¿Confirmar respuesta?"
                description="La respuesta será enviada al club solicitante."
                confirmLabel="Confirmar"
                cancelLabel="Cancelar"
                onConfirm={handleSubmit}
                open={open}
                onOpenChange={setOpen}
            />
        </form>
    );
}
