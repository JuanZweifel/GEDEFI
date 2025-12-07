import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useAuth } from "../contexts/authContext";
import { getUserById, updateUser, updatePassword } from "../services/usuarioService";
import { toast } from "sonner";

export const PerfilUsuarioModule = () => {
  const { rut, token } = useAuth();

  const [formData, setFormData] = useState({
    nombre_usuario: "",
    apellido_usuario: "",
    pass_usuario: "",
    confirmPassword: "",
    act_pass_usuario: "",
  });

  const [originalData, setOriginalData] = useState({
    nombre_usuario: "",
    apellido_usuario: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!rut) return;

    const fetchUser = async () => {
      try {
        const data = await getUserById(rut, token);
        const base = {
          nombre_usuario: data.nombre_usuario || "",
          apellido_usuario: data.apellido_usuario || "",
        };

        setFormData((prev) => ({ ...prev, ...base }));
        setOriginalData(base);
      } catch (err) {
        console.error(err);
        toast.error("Error al cargar los datos del usuario");
      }
    };

    fetchUser();
  }, [rut, token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre_usuario.trim())
      newErrors.nombre_usuario = "El nombre es obligatorio.";
    if (!formData.apellido_usuario.trim())
      newErrors.apellido_usuario = "El apellido es obligatorio.";

    const changingPassword = formData.pass_usuario.trim() !== "";

    if (changingPassword) {
      if (!formData.act_pass_usuario.trim()) {
        newErrors.act_pass_usuario = "Debe ingresar su contraseña actual.";
      }

      if (formData.pass_usuario.length < 6) {
        newErrors.pass_usuario =
          "La nueva contraseña debe tener al menos 6 caracteres.";
      }

      if (formData.pass_usuario !== formData.confirmPassword) {
        newErrors.confirmPassword = "Las contraseñas no coinciden.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const hasChanges = () => {
    return (
      formData.nombre_usuario !== originalData.nombre_usuario ||
      formData.apellido_usuario !== originalData.apellido_usuario ||
      formData.pass_usuario !== ""
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (!hasChanges()) {
      toast.info("No hay cambios para guardar.");
      return;
    }

    setLoading(true);

    try {
      await updateUser(rut, {
        nombre_usuario: formData.nombre_usuario,
        apellido_usuario: formData.apellido_usuario,
      }, token);

      if (formData.pass_usuario.trim() !== "") {
        await updatePassword(rut, {
          current_password: formData.act_pass_usuario,
          new_password: formData.pass_usuario,
        }, token);
      }

      toast.success("Perfil actualizado correctamente");

      setOriginalData({
        nombre_usuario: formData.nombre_usuario,
        apellido_usuario: formData.apellido_usuario,
      });

      setFormData((prev) => ({
        ...prev,
        act_pass_usuario: "",
        pass_usuario: "",
        confirmPassword: "",
      }));

    } catch (err) {
      toast.error(err.message || "Error actualizando el perfil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow space-y-6">
      <h2 className="text-2xl font-semibold text-center">Editar Perfil</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          { label: "Nombre", name: "nombre_usuario" },
          { label: "Apellido", name: "apellido_usuario" }
        ].map(({ label, name }) => (
          <div key={name}>
            <label className="text-sm font-medium">{label}</label>
            <Input
              name={name}
              value={formData[name as keyof typeof formData]}
              onChange={handleChange}
            />
            {errors[name] && (
              <p className="text-sm text-red-500">{errors[name]}</p>
            )}
          </div>
        ))}

        <div>
          <label className="text-sm font-medium">Contraseña Actual</label>
          <Input
            type="password"
            name="act_pass_usuario"
            value={formData.act_pass_usuario}
            onChange={handleChange}
          />
          {errors.act_pass_usuario && (
            <p className="text-sm text-red-500">{errors.act_pass_usuario}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium">Nueva Contraseña</label>
          <Input
            type="password"
            name="pass_usuario"
            value={formData.pass_usuario}
            onChange={handleChange}
          />
          {errors.pass_usuario && (
            <p className="text-sm text-red-500">{errors.pass_usuario}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium">
            Confirmar Nueva Contraseña
          </label>
          <Input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-500">{errors.confirmPassword}</p>
          )}
        </div>

        <div className="flex justify-end space-x-2 col-span-2">
          <Button
            type="submit"
            style={{ backgroundColor: "#0000db" }}
            className="text-white"
          >
            {loading ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </div>
  );
};
