import { useEffect, useState } from "react";
import { getReunionesUsuario } from "../services/reunionService";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { useAuth } from "../contexts/authContext";

export default function UserMeetings() {
  const [items, setItems] = useState([]);
  const { token, rut } = useAuth();

  async function load() {
    const data = await getReunionesUsuario(rut, token);
    setItems(data);
  }

  useEffect(() => {
    if (rut && token) {
      load();
    }
  }, [rut, token]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Mis reuniones</h2>

      {items.map(m => (
        <Card key={m.id_reunion}>
          <CardHeader>
            <CardTitle>{m.titulo_reunion}</CardTitle>
          </CardHeader>

          <CardContent>
            <p>{m.fecha_reunion} — {m.hora_reunion}</p>
            <p className="text-sm text-gray-600">{m.lugar_reunion}</p>
            <p className="text-sm text-gray-600">{m.descripcion}</p>

            <p className="mt-2 font-medium">
              Estado: {
                m.asistencia
                  ? "Asistencia registrada"
                  : "No asistió"
              }
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
