import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Plus, Edit, Eye, Shield, Trash2, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { getUsers, createUser, updateUser, deleteUser } from "../services/usuarioService.ts";
import { AlertDialogHandle } from "../components/alert-dialog-component.tsx";
import { Input } from "../components/ui/input";
import { validarRut } from "../utils/validacion_rut.tsx";
import { type ClubType, type RolType, type UsuarioType, type UsuarioFormType } from "../types.tsx";
import { useAuth } from "../contexts/authContext.tsx";

type UserFormProps = {
  user?: UsuarioType;
  isEdit: boolean;
  roles: RolType[];
  clubs: ClubType[];
  refreshRoles: () => Promise<void>;
  refreshUsers: () => Promise<void>;
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

export function UserForm({ user, isEdit, roles, clubs, refreshRoles, refreshUsers, onSuccess }: UserFormProps) {
  const [availableRoles, setAvailableRoles] = useState<RolType[]>([]);
  const [rutError, setRutError] = useState("");

  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<UsuarioFormType>(
    user || {
      rut_usuario: "",
      email_usuario: "",
      nombre_usuario: "",
      apellido_usuario: "",
      fecha_nacimiento: "",
      usuario_activo: true,
      id_rol: 0,
      admin: false,
      id_club: undefined,
      pass_usuario: "",
    }
  );
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth()

  const ensureRoles = async () => {
    if (!roles || roles.length === 0) {
      const data = await refreshRoles();
      if (data) setAvailableRoles(data);
      else setAvailableRoles([]);
    } else {
      setAvailableRoles(roles);
    }
  };

  useEffect(() => {
    ensureRoles();
    if (isEdit && user) setForm(user);
  }, [user, isEdit, roles]);

  const handleAlert = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form_html = e.currentTarget;

    if (!isEdit && !validarRut(form.rut_usuario)) {
      setRutError("RUT inválido");
      return;
    }

    if (form_html.reportValidity()) {
      setOpen(true) //disparamos el alert
    }

  }

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      if (isEdit) {
        await updateUser(form.rut_usuario, form, token);
        toast.success("Usuario modificado correctamente!");
      } else {
        await createUser(form, token);
        toast.success("Usuario registrado correctamente!");
      }
      await refreshUsers();
      onSuccess();
    } catch (error) {
      setOpen(false)
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
        {!isEdit && (
          <InputField
            label="RUT *"
            value={form.rut_usuario}
            onChange={(val) => {
              setForm({ ...form, rut_usuario: val });
              console.log(form.rut_usuario)
              if (val) setRutError("");
            }}
            onBlur={() => {
              if (form.rut_usuario && !validarRut(form.rut_usuario)) {
                setRutError("RUT inválido");
              } else {
                setRutError("");
              }
            }}
            className={rutError ? "border-red-500" : ""}
            required
            pattern="^\d{7,8}-[0-9kK]$"
            minLength={7}
            title="Ingrese un RUT válido (ej: 12345678-9)"
          />
        )}

        <InputField
          label="Nombre *"
          value={form.nombre_usuario}
          onChange={(val) => setForm({ ...form, nombre_usuario: val })}
          required
          minLength={2}
          maxLength={50}
          title="Ingrese un nombre entre 2 y 50 caracteres"
        />

        <InputField
          label="Apellido *"
          value={form.apellido_usuario}
          onChange={(val) => setForm({ ...form, apellido_usuario: val })}
          required
          minLength={2}
          maxLength={50}
          title="Ingrese un apellido entre 2 y 50 caracteres"
        />

        <InputField
          label="Email *"
          type="email"
          value={form.email_usuario}
          onChange={(val) => setForm({ ...form, email_usuario: val })}
          required
          title="Ingrese un correo electrónico válido"
        />

        <InputField
          label="Fecha de Nacimiento *"
          type="date"
          value={form.fecha_nacimiento}
          onChange={(val) => setForm({ ...form, fecha_nacimiento: val })}
          required
          max={new Date().toISOString().split("T")[0]}
          min={new Date(new Date().setFullYear(new Date().getFullYear() - 80)).toISOString().split("T")[0]} // 80 años antes
          title="Seleccione una fecha válida"
        />

        <InputField
          label="Contraseña"
          type="password"
          value={form.pass_usuario}
          onChange={(val) => setForm({ ...form, pass_usuario: val })}
          required={!isEdit}
          minLength={isEdit ? undefined : 8}
          placeholder={isEdit ? "Dejar vacío para no cambiar" : undefined}
          title={isEdit ? "Dejar vacío para no cambiar la contraseña" : "La contraseña debe tener al menos 8 caracteres"}
        />

        <div>
          <label className="block text-sm font-medium mb-1">Rol *</label>
          <select
            value={form.id_rol || ""}
            onChange={(e) => setForm({ ...form, id_rol: Number(e.target.value) })}
            className="w-full border rounded p-2"
            required
          >
            <option value="">Seleccione un rol</option>
            {availableRoles.map((r) => (
              <option key={r.id_rol} value={r.id_rol}>
                {r.nombre_rol}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Club</label>
          <select
            value={form.id_club ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              setForm({
                ...form,
                id_club: value === "null" || value === "" ? null : Number(value),
              });
            }}
            className="w-full border rounded p-2"
          >
            <option value="">Seleccione un club</option>
            <option value="null">Sin club</option>
            {clubs.map((club) => (
              <option key={club.id_club} value={club.id_club}>
                {club.nombre_club}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex space-x-4">
        {!isEdit && (
          <label>
            <input
              type="checkbox"
              checked={form.admin}
              onChange={(e) => setForm({ ...form, admin: e.target.checked })}
            />{" "}
            Admin
          </label>
        )}
        {isEdit && (
          <label>
            <input
              type="checkbox"
              checked={form.usuario_activo}
              onChange={(e) => setForm({ ...form, usuario_activo: e.target.checked })}
            />{" "}
            Activo
          </label>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" type="button" disabled={isLoading} onClick={onSuccess}>
          Cancelar
        </Button>
        <Button type="submit" style={{ backgroundColor: "#0000db" }} className="text-white">
          {!isLoading && !isEdit && <Plus className="w-4 h-4 mr-2" />}
          {isLoading ? "Guardando..." : "Guardar"}
        </Button>
        <AlertDialogHandle
          title={isEdit ? `Modificar usuario ${form.nombre_usuario}?` : `Registrar usuario ${form.nombre_usuario}?`}
          description={isEdit ? "¿Desea guardar los cambios?" : "¿Desea registrar al usuario?"}
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
