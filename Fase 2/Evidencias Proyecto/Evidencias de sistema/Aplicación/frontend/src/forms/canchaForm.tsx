import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { AlertDialogHandle } from "../components/alert-dialog-component";
import { toast } from "sonner";
import { createCancha, updateCancha } from "../services/canchaService.ts";
import { type CanchaType, type InstalacionesEnum, type SuperficiesEnum } from "../types.tsx";
import { useAuth } from "../contexts/authContext.tsx";

type CanchaFormProps = {
    cancha?: CanchaType;
    isEdit: boolean;
    refreshCanchas: () => Promise<void>;
    onSuccess: () => void;
};

function InputField({ label, value, onChange, type = "text", ...rest }: any) {
    return (
        <div>
            <label className="block text-sm font-medium">{label}</label>
            <Input
                type={type}
                value={value ?? ""}
                onChange={(e) => onChange(e.target.value)}
                className="w-full border rounded p-2"
                {...rest}
            />
        </div>
    );
}

const INSTALACIONES_OPCIONES: InstalacionesEnum[] = [
    "Iluminación",
    "Tribunas",
    "Camarines",
    "Estacionamiento",
    "Baños",
    "Enfermería",
];

const SUPERFICIES_OPCIONES: SuperficiesEnum = ["Césped Natural", "Césped Sintético", "Tierra"];

export function CanchaForm({ cancha, isEdit, refreshCanchas, onSuccess }: CanchaFormProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState<CanchaType>(
        cancha || {
            id_cancha: 0,
            nombre_cancha: "",
            superficie_cancha: SUPERFICIES_OPCIONES[0],
            direccion: "",
            cancha_activa: true,
            ultimo_mantenimiento: null,
            observaciones: "",
            instalaciones: [],
            fecha_creacion: new Date().toISOString(),
            fecha_modificacion: new Date().toISOString(),
        }
    );
    const { token } = useAuth();

    useEffect(() => {
        if (isEdit && cancha) setForm(cancha);
    }, [isEdit, cancha]);

    const handleAlert = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formEl = e.currentTarget;
        if (formEl.reportValidity()) setOpen(true);
    };

    const handleSubmit = async () => {

        const hoy = new Date().toISOString().split("T")[0];
        if (form.ultimo_mantenimiento && form.ultimo_mantenimiento > hoy) {
            toast.error("La fecha de la lesión no puede ser futura.");
            return;
        }

        setIsLoading(true);
        try {
            if (isEdit && form.id_cancha) {
                await updateCancha(token, form.id_cancha, form);
                toast.success("Cancha modificada correctamente!");
            } else {
                await createCancha(token, form);
                toast.success("Cancha registrada correctamente!");
            }
            await refreshCanchas();
            onSuccess();
        } catch (error) {
            toast.error(String(error));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form
            className="space-y-4"
            onSubmit={(e) => {
                e.preventDefault();
                handleAlert(e);
            }}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                    label="Nombre de la Cancha *"
                    value={form.nombre_cancha}
                    onChange={(val) => setForm({ ...form, nombre_cancha: val })}
                    required
                    minLength={2}
                    maxLength={50}
                    title="Ingrese un nombre válido (2-50 caracteres)"
                />

                <div>
                    <label className="block text-sm font-medium mb-1">Superficie de la Cancha *</label>
                    <Select
                        value={form.superficie_cancha}
                        onValueChange={(val: string) =>
                            setForm({ ...form, superficie_cancha: val as SuperficiesEnum })
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccione una superficie" />
                        </SelectTrigger>
                        <SelectContent>
                            {SUPERFICIES_OPCIONES.map((sup) => (
                                <SelectItem key={sup} value={sup}>
                                    {sup}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <InputField
                    label="Dirección Completa"
                    value={form.direccion || ""}
                    onChange={(val) => setForm({ ...form, direccion: val })}
                    maxLength={300}
                    title="Máximo 300 caracteres"
                />

                <InputField
                    label="Último Mantenimiento"
                    type="date"
                    max={new Date().toISOString().split("T")[0]}
                    value={form.ultimo_mantenimiento || ""}
                    onChange={(val) => setForm({ ...form, ultimo_mantenimiento: val })}
                />

                <div>
                    <label className="block text-sm font-medium mb-1">Instalaciones</label>
                    <div className="grid grid-cols-2 gap-2">
                        {INSTALACIONES_OPCIONES.map((inst) => (
                            <label key={inst} className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={form.instalaciones.includes(inst)}
                                    onChange={(e) => {
                                        const checked = e.target.checked;
                                        setForm({
                                            ...form,
                                            instalaciones: checked
                                                ? [...form.instalaciones, inst]
                                                : form.instalaciones.filter((i) => i !== inst),
                                        });
                                    }}
                                />
                                <span>{inst}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="md:col-span-3">
                    <label className="block text-sm font-medium mb-1">Observaciones</label>
                    <Textarea
                        value={form.observaciones || ""}
                        onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
                        rows={3}
                        placeholder="Notas sobre el estado o uso de la cancha..."
                        maxLength={500}
                    />
                </div>
            </div>

            <div className="flex justify-end space-x-2">
                <Button variant="outline" type="button" disabled={isLoading} onClick={onSuccess}>
                    Cancelar
                </Button>
                <Button type="submit" style={{ backgroundColor: "#0000db" }} className="text-white">
                    {isLoading ? "Guardando..." : "Guardar"}
                </Button>
                <AlertDialogHandle
                    title={isEdit ? `Modificar cancha ${form.nombre_cancha}?` : `Registrar cancha ${form.nombre_cancha}?`}
                    description={isEdit ? "¿Desea guardar los cambios?" : "¿Desea registrar la cancha?"}
                    confirmLabel={isEdit ? "Modificar" : "Registrar"}
                    cancelLabel="Cancelar"
                    onConfirm={handleSubmit}
                    open={open}
                    onOpenChange={setOpen}
                />
            </div>
        </form>
    );
}
