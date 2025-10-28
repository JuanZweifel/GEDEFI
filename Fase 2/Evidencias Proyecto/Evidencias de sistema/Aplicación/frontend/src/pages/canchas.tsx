import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { DialogHandle } from "../components/dialog-component.tsx";
import { AlertDialogHandle } from "../components/alert-dialog-component.tsx";
import { NavLink, useLocation, useNavigate, useParams } from 'react-router';
import { Plus, Edit, Trash2, MapPin, RefreshCcw } from 'lucide-react';
import { CanchaForm } from '../forms/canchaForm.tsx';
import type { CanchaType } from '../types.tsx';
import { deleteCancha, getCanchas } from '../services/canchaService.ts';
import { toast } from "sonner";
import { useAuth } from '../contexts/authContext.tsx';

export const CanchasModule: React.FC = () => {
  const [openSelected, setOpenSelected] = useState<number | null>(null);
  const [selectedField, setSelectedField] = useState<CanchaType | null>(null);
  const [isFetchingCanchas, setIsFetchingCanchas] = useState(false);
  const [canchas, setCanchas] = useState<CanchaType[]>([]);
  const { token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ id_cancha?: string }>();

  const isFieldNewRoute = /\/dashboard\/canchas\/new/.test(location.pathname);
  const isFieldEditRoute = /\/dashboard\/canchas\/[^/]+\/edit$/.test(location.pathname);

  useEffect(() => {
    fetchCanchas();
  }, []);

  const fetchCanchas = async () => {
    let data: CanchaType[] = [];
    try {
      setIsFetchingCanchas(true);
      data = await getCanchas(token);
      setCanchas(data);
      if (data.length === 0) {
        toast.info("No hay canchas registradas en la base de datos.");
      }
    } catch (err: any) {
      toast.warning(String(err));
    } finally {
      if (data.length === 0) setCanchas([]);
      setIsFetchingCanchas(false);
    }
  };

  const handleDeleteCancha = async (id: number) => {
    try {
      const response = await deleteCancha(token, id);
      toast.success(response?.detail || "Cancha eliminada correctamente");
      setOpenSelected(null);
      fetchCanchas();
    } catch (error) {
      toast.error(String(error));
    }
  };

  useEffect(() => {
    if (!isFieldEditRoute) {
      setSelectedField(null);
      return;
    }
    if (!params.id_cancha) {
      setSelectedField(null);
      return;
    }
    if (canchas.length === 0) {
      if (!isFetchingCanchas) fetchCanchas();
      return;
    }
    const idNumber = Number(params.id_cancha);
    if (!Number.isNaN(idNumber)) {
      const found = canchas.find(c => c.id_cancha === idNumber);
      if (found) {
        setSelectedField(found);
      } else if (!isFetchingCanchas) {
        toast.warning("La cancha solicitada no existe.");
        navigate("/dashboard/canchas/");
      }
    } else {
      toast.warning("ID de cancha inválido en la ruta.");
      navigate("/dashboard/canchas/");
    }
  }, [params.id, canchas, isFetchingCanchas, navigate, isFieldEditRoute]);

  const getTipoCancha = (tipo: number) => {
    switch (tipo) {
      case 1: return "Césped Natural";
      case 2: return "Césped Sintético";
      case 3: return "Tierra";
      default: return "Desconocido";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2>Administración de Canchas de Fútbol</h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={fetchCanchas}
            disabled={isFetchingCanchas}
          >
            <RefreshCcw className="w-4 h-4 mr-1" />
            {isFetchingCanchas ? "Recargando..." : "Recargar"}
          </Button>
          <NavLink to="/dashboard/canchas/new">
            <Button style={{ backgroundColor: "#0000db" }} className="text-white">
              <Plus className="w-4 h-4 mr-2" /> Nueva cancha
            </Button>
          </NavLink>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {canchas.map((cancha) => (
          <Card key={cancha.id_cancha}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{cancha.nombre_cancha}</CardTitle>
                <div className="flex flex-col space-y-1">
                  <Badge className={cancha.cancha_activa ? "bg-blue-500" : "bg-gray-400"}>
                    {cancha.cancha_activa ? "Activa" : "Inactiva"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start">
                  <MapPin className="w-4 h-4 mr-2 mt-1 text-gray-500" />
                  <p className="text-sm text-gray-600">{cancha.direccion ? cancha.direccion : "N/A"}</p>
                </div>

                <div className="text-sm space-y-1">
                  <p>
                    <span className="font-medium">Superficie:</span> {cancha.superficie_cancha}
                  </p>

                  <p>
                    <span className="font-medium">Último mantenimiento:</span>{" "}
                    {cancha.ultimo_mantenimiento
                      ? new Date(cancha.ultimo_mantenimiento).toLocaleDateString()
                      : "N/A"}
                  </p>

                  <span className="font-medium">Instalaciones:</span>
                  <div className="flex flex-wrap gap-1 mt-2 mb-2">
                    {cancha.instalaciones.map((inst) => (
                      <div
                        key={inst}
                        className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded-md border border-gray-300 text-xs font-medium"
                      >
                        {inst}
                      </div>
                    ))}
                  </div>

                  {cancha.observaciones && (
                    <p>
                      <span className="font-medium">Observaciones:</span> {cancha.observaciones}
                    </p>
                  )}

                  <p>
                    <span className="font-medium">Creada:</span>{" "}
                    {new Date(cancha.fecha_creacion).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-medium">Modificada:</span>{" "}
                    {new Date(cancha.fecha_modificacion).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <NavLink
                  to={`/dashboard/canchas/${cancha.id_cancha}/edit`}
                  className="flex-1"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" /> Editar
                  </Button>
                </NavLink>

                <Button
                  onClick={() => setOpenSelected(cancha.id_cancha)}
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                >
                  <Trash2 className="w-4 h-4 mr-1" /> Eliminar
                </Button>
              </div>

              <AlertDialogHandle
                title={`Eliminación de cancha ${cancha.nombre_cancha}`}
                description={`¿Estás seguro de querer eliminar la cancha ${cancha.nombre_cancha}?`}
                confirmLabel="Eliminar"
                cancelLabel="Cancelar"
                onConfirm={() => handleDeleteCancha(cancha.id_cancha)}
                open={openSelected === cancha.id_cancha}
                onOpenChange={(open) => {
                  if (!open) setOpenSelected(null);
                }}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {isFieldNewRoute && (
        <DialogHandle<CanchaType>
          title="Registrar Nueva Cancha"
          trigger={<div />}
          open={true}
          size="max-w-2xl"
          onOpenChange={(open) => { if (!open) navigate("/dashboard/canchas/"); }}
        >
          {(close) => (
            <CanchaForm
              isEdit={false}
              refreshCanchas={fetchCanchas}
              onSuccess={() => { close(); navigate("/dashboard/canchas/"); }}
            />
          )}
        </DialogHandle>
      )}

      {isFieldEditRoute && (
        <DialogHandle<CanchaType>
          title={selectedField ? `Modificar cancha ${selectedField.nombre_cancha}` : 'Modificar cancha'}
          trigger={<div />}
          open={true}
          onOpenChange={(open) => { if (!open) navigate("/dashboard/canchas/"); }}
          initialData={selectedField ?? undefined}
        >
          {() => {
            if (!selectedField) {
              return (
                <div className="p-6 flex items-center justify-center">
                  <span>Cargando detalles de la cancha...</span>
                </div>
              );
            }
            return (
              <CanchaForm
                cancha={selectedField}
                isEdit={true}
                refreshCanchas={fetchCanchas}
                onSuccess={() => { navigate("/dashboard/canchas/"); }}
              />
            );
          }}
        </DialogHandle>
      )}
    </div>
  );
};
