import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { SolicitudClubForm } from "../forms/solicitudClubForm";
import SolicitudesList from "../components/solicitudes-list";
import { getSolicitudes, getUserSolicitudes } from "../services/solicitudService";
import { useAuth } from "../contexts/authContext";
import { RefreshCcw } from "lucide-react";
import { toast } from "sonner";

export const SolicitudesModule: React.FC = () => {
  const { admin, token } = useAuth();
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSolicitudes = async () => {
    try {
      setLoading(true);

      const data = admin
        ? await getSolicitudes(token)         // Admin → all solicitudes
        : await getUserSolicitudes(token);     // Regular user → only their own solicitudes

      setSolicitudes(data);

      if (data.length === 0) {
        toast.info(
          admin
            ? "No hay solicitudes registradas."
            : "Aún no has enviado ninguna solicitud."
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("No se pudieron cargar las solicitudes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSolicitudes();
  }, [admin]);

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Solicitudes</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">

          {/* ADMIN VIEW */}
          {admin && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Solicitudes registradas</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchSolicitudes}
                  disabled={loading}
                >
                  <RefreshCcw className="w-4 h-4 mr-1" />
                  {loading ? "Recargando..." : "Recargar"}
                </Button>
              </div>

              <SolicitudesList
                solicitudes={solicitudes}
                loading={loading}
                refreshSolicitudes={fetchSolicitudes}
              />
            </div>
          )}

          {/* USER VIEW */}
          {!admin && (
            <>
              <div className="border p-4 rounded-lg bg-gray-50">
                <h2 className="text-lg font-semibold mb-3">Nueva solicitud</h2>
                <SolicitudClubForm refreshSolicitudes={fetchSolicitudes} />
              </div>

              <div className="border p-4 rounded-lg bg-gray-50">
                <h2 className="text-lg font-semibold mb-3">Mis solicitudes</h2>

                <SolicitudesList
                  solicitudes={solicitudes}
                  loading={loading}
                  refreshSolicitudes={fetchSolicitudes}
                />
              </div>
            </>
          )}

        </CardContent>
      </Card>
    </div>
  );
};
