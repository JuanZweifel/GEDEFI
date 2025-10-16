import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { AlertDialogHandle } from "../components/alert-dialog-component";
import { toast } from "sonner";
import { createCancha, updateCancha } from "../services/canchaService.ts";
import { type CanchaType } from "../types.tsx";

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
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full border rounded p-2"
                {...rest}
            />
        </div>
    );
}

export function CanchaForm({ cancha, isEdit, refreshCanchas, onSuccess }: CanchaFormProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState<CanchaType>(
        cancha || {
            id_cancha: 0,
            nombre_cancha: "",
            tipo_cancha: 1,
            direccion: "",
            disponibilidad: true,
            cancha_activa: true,
            fecha_creacion: new Date().toISOString(),
            fecha_modificacion: new Date().toISOString(),
        }
    );

    useEffect(() => {
        if (isEdit && cancha) setForm(cancha);
    }, [isEdit, cancha]);

    const handleAlert = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formEl = e.currentTarget;
        if (formEl.reportValidity()) setOpen(true);
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            if (isEdit && form.id_cancha) {
                await updateCancha(form.id_cancha, form);
                toast.success("Cancha modificada correctamente!");
            } else {
                await createCancha(form);
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
                    label="Nombre de la Cancha"
                    value={form.nombre_cancha}
                    onChange={(val) => setForm({ ...form, nombre_cancha: val })}
                    required
                    minLength={2}
                    maxLength={50}
                    title="Ingrese un nombre válido (2-50 caracteres)"
                />

                <div>
                    <label className="block text-sm font-medium">Tipo de Superficie</label>
                    <Select
                        value={String(form.tipo_cancha)}
                        onValueChange={(val) => setForm({ ...form, tipo_cancha: parseInt(val) })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccione tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1">Césped Natural</SelectItem>
                            <SelectItem value="2">Césped Sintético</SelectItem>
                            <SelectItem value="3">Tierra</SelectItem>
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

                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={form.disponibilidad}
                        onChange={(e) => setForm({ ...form, disponibilidad: e.target.checked })}
                    />
                    <span>Disponible</span>
                </label>

                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={form.cancha_activa}
                        onChange={(e) => setForm({ ...form, cancha_activa: e.target.checked })}
                    />
                    <span>Activa</span>
                </label>
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
