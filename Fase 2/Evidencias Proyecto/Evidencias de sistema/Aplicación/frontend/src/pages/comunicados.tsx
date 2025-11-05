import React, { useState, useEffect } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../components/ui/select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import { getRoles } from "../services/rolService";
import { sendComunicado } from "../services/comunicadoService";
import { useAuth } from "../contexts/authContext";
import { type RolType } from "../types";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const ComunicadosModule: React.FC = () => {
  const [asunto, setAsunto] = useState("");
  const [cuerpo, setCuerpo] = useState("");
  const [destinatarios, setDestinatarios] = useState("all");
  const [roles, setRoles] = useState<RolType[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [charCount, setCharCount] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await getRoles(token);
        setRoles(data);
      } catch (err) {
        console.error("Error fetching roles:", err);
      }
    };
    fetchRoles();
  }, [token]);

  const handleSend = async () => {
    const payload = {
      asunto,
      cuerpo,
      destinatarios: destinatarios === "all" ? "all" : selectedRoles,
    };

    try {
      setIsSending(true);
      await sendComunicado(payload, token!);
      toast.success("Comunicado enviado con éxito");
      setAsunto("");
      setCuerpo("");
      setSelectedRoles([]);
      setCharCount(0);
      setDestinatarios("all");
    } catch (err) {
      toast.error("Error al enviar el comunicado");
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setCuerpo(text);
    setCharCount(text.length);
  };

  const isFormValid =
    asunto.trim() !== "" &&
    cuerpo.trim() !== "" &&
    (destinatarios === "all" || selectedRoles.length > 0);

  return (
    <div className="flex justify-center p-6">
      <Card className="w-full max-w-2xl shadow-lg border border-gray-200">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-center">
            Enviar Comunicado
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <div>
            <label className="text-sm font-medium">Asunto</label>
            <Input
              placeholder="Ej: Recordatorio de reunión"
              value={asunto}
              onChange={(e) => setAsunto(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Mensaje</label>
            <Textarea
              placeholder="Escribe tu mensaje..."
              rows={6}
              value={cuerpo}
              onChange={handleBodyChange}
              maxLength={1000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {charCount}/1000 caracteres
            </div>
          </div>

          <div className="mb-3">
            <label className="text-sm font-medium">Destinatarios</label>
            <Select
              onValueChange={setDestinatarios}
              value={destinatarios}
              defaultValue="all"
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar destinatarios" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los usuarios</SelectItem>
                <SelectItem value="roles">Por roles</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {destinatarios === "roles" && (
            <div className="border rounded-lg mt-3 mb-3 p-3 bg-gray-50">
              <p className="text-sm font-medium mb-3">Selecciona roles:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {roles.map((role) => (
                  <label
                    key={role.id_rol}
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(role.nombre_rol)}
                      onChange={(e) =>
                        setSelectedRoles((prev) =>
                          e.target.checked
                            ? [...prev, role.nombre_rol]
                            : prev.filter((r) => r !== role.nombre_rol)
                        )
                      }
                    />
                    {role.nombre_rol}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="pt-3 text-center">
            <Button
              onClick={handleSend}
              disabled={!isFormValid || isSending}
              className="px-8 px-4 bg-green-500 hover:bg-green-600 text-white"
            >
              {isSending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando...
                </span>
              ) : (
                "Enviar Comunicado"
              )}
            </Button>

            {!isFormValid && !isSending && (
              <p className="text-xs text-gray-500 mt-1">
                Completa todos los campos antes de enviar.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
