import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { createRole, updateRole } from "../services/rolService.ts";
import { AlertDialogHandle } from "../components/alert-dialog-component.tsx";
import { Input } from "../components/ui/input";
import { type RolType } from "../types.tsx";
import { useAuth } from "../contexts/authContext.tsx";

type RoleFormProps = {
  role?: RolType;
  isEdit: boolean;
  refreshRoles: () => Promise<void>;
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

export function RoleForm({ role, isEdit, refreshRoles, onSuccess }: RoleFormProps) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<RolType>(
    role || {
      nombre_rol: "",
      desc_rol: "",
      rol_activo: true,
    }
  );
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    if (isEdit && role) setForm(role);
  }, [role, isEdit]);

  const handleAlert = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;

    if (form.reportValidity()) {
      setOpen(true) //disparamos el alert
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      if (isEdit && form.id_rol) {
        await updateRole(form.id_rol, form, token);
        toast.success("Rol modificado correctamente!");
      } else {
        await createRole(form, token);
        toast.success("Rol registrado correctamente!");
      }
      refreshRoles();
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
          label="Nombre del rol"
          value={form.nombre_rol}
          onChange={(val) => setForm({ ...form, nombre_rol: val })}
          required
          minLength={2}
          maxLength={50}
          title="Ingrese un nombre de rol entre 2 y 50 caracteres"
        />

        <InputField
          label="Descripción"
          value={form.desc_rol || ""}
          onChange={(val) => setForm({ ...form, desc_rol: val })}
          maxLength={200}
          title="Ingrese una descripción de máximo 200 caracteres (opcional)"
        />
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={form.rol_activo}
            onChange={(e) => setForm({ ...form, rol_activo: e.target.checked })}
          />
          <span>Activo</span>
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
          title={isEdit ? `Modificar rol ${form.nombre_rol}?` : `Registrar rol ${form.nombre_rol}?`}
          description={isEdit ? "¿Desea guardar los cambios?" : "¿Desea registrar el rol?"}
          confirmLabel={isEdit ? "Modificar" : "Registrar"}
          cancelLabel="Cancelar"
          onConfirm={handleSubmit}
          open={open}
          onOpenChange={setOpen}
        >
        </AlertDialogHandle>
      </div>
    </form>
  );
}
