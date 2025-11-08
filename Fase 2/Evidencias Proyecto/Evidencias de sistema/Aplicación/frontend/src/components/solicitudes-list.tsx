import React, { useState, useMemo } from "react";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../components/ui/select";
import { Button } from "../components/ui/button";
import { DialogHandle } from "./dialog-component";
import { Badge } from "../components/ui/badge";
import { SolicitudResponseForm } from "../forms/solicitudResponseForm.tsx";
import { Label } from "./ui/label.tsx";
import { Textarea } from "./ui/textarea.tsx";
import { useNavigate, useParams, useLocation } from "react-router";
import { useAuth } from "../contexts/authContext.tsx";

export default function SolicitudesList({
  solicitudes,
  loading,
  refreshSolicitudes,
}: {
  solicitudes: any[];
  loading: boolean;
  refreshSolicitudes: () => Promise<void>;
  currentUser?: { rol: string };
}) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState("all");
  const navigate = useNavigate();
  const { id, action } = useParams();
  const location = useLocation();

  const truncate = (text: string, maxLength = 90) =>
    text.length > maxLength ? text.slice(0, maxLength) + "…" : text;

  const categorias = [
    { id: 1, name: "Solicitud de Permiso" },
    { id: 2, name: "Cambio de Horario" },
    { id: 3, name: "Actualización de Datos" },
    { id: 4, name: "Otros" },
  ];

  const filtered = useMemo(() => {
    return solicitudes.filter((s: any) => {
      const matchesSearch =
        s.descripcion?.toLowerCase().includes(search.toLowerCase()) ||
        s.usuario_solicitud?.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filter === "all" ||
        (filter === "respondida" && s.estado === true) ||
        (filter === "pendiente" && s.estado === false);

      const matchesCategoria =
        categoriaFilter === "all" || Number(s.categoria) === Number(categoriaFilter);

      return matchesSearch && matchesFilter && matchesCategoria;
    });
  }, [solicitudes, search, filter, categoriaFilter]);

  const selectedSolicitud = solicitudes.find(
    (s) => String(s.id_solicitud) === id
  );

  const openDetail = (solicitud: any) => navigate(`/dashboard/solicitudes/${solicitud.id_solicitud}`);
  const openResponder = (solicitud: any) =>
    navigate(`/dashboard/solicitudes/${solicitud.id_solicitud}/responder`);
  const closeDialog = () => navigate("/dashboard/solicitudes", { replace: true });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <Input
          placeholder="Buscar por descripción o usuario..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="respondida">Respondidas</SelectItem>
            <SelectItem value="pendiente">Pendientes</SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {categorias.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>


      {/* List */}
      {loading ? (
        <p className="text-gray-500">Cargando solicitudes...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500">No hay solicitudes disponibles.</p>
      ) : (
        <div className="border rounded-lg divide-y">
          {filtered.map((sol: any) => (
            <div
              key={sol.id_solicitud}
              className="p-3 flex justify-between items-center hover:bg-gray-50 transition"
            >
              <div className="max-w-[70%]">
                <p className="font-medium truncate" title={sol.descripcion}>
                  {truncate(sol.descripcion)}
                </p>

                <p className="text-sm text-gray-500 flex flex-wrap gap-x-2">
                  <span>
                    Usuario: {sol.nombre_usuario} {sol.apellido_usuario}
                  </span>
                  <span>· Club: {sol.nombre_club}</span>
                  <span>
                    · Categoría:{" "}
                    {categorias.find((c) => c.id === Number(sol.categoria))?.name || "N/A"}
                  </span>
                  <span>
                    · Estado:{" "}
                    <Badge
                      variant={sol.estado ? "success" : "secondary"}
                      className="ml-1"
                    >
                      {sol.estado ? "Respondida" : "Pendiente"}
                    </Badge>
                  </span>
                </p>
              </div>

              <div className="flex gap-2">
                {!sol.estado && (
                  <Button
                    variant="ghost"
                    className="bg-green-500 text-white"
                    onClick={() => openResponder(sol)}
                  >
                    Responder
                  </Button>
                )}
                <Button variant="outline" onClick={() => openDetail(sol)}>
                  Revisar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail dialog */}
      {id && !action && selectedSolicitud && (
        <DialogHandle
          title="Detalle de solicitud"
          open
          onOpenChange={(open) => !open && closeDialog()}
          initialData={selectedSolicitud}
          size="max-w-3xl"
          trigger={<div />}
        >
          {(close) => (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="block mb-2">Nombre completo</Label>
                  <Input
                    value={`${selectedSolicitud.nombre_usuario} ${selectedSolicitud.apellido_usuario}`}
                    readOnly
                  />
                </div>
                <div>
                  <Label className="block mb-2">Club</Label>
                  <Input
                    value={selectedSolicitud.nombre_club || "Sin club asociado"}
                    readOnly
                  />
                </div>
                <div>
                  <Label className="block mb-2">Categoría</Label>
                  <Input
                    value={
                      categorias.find((c) => c.id === Number(selectedSolicitud.categoria))?.name ||
                      "Sin categoría"
                    }
                    readOnly
                  />
                </div>
                <div>
                  <Label className="block mb-2">Estado</Label>
                  <Badge
                    className={`${selectedSolicitud.estado
                      ? "bg-green-500"
                      : "bg-gray-500"
                      } w-fit px-3 py-1`}
                  >
                    {selectedSolicitud.estado ? "Respondida" : "Pendiente"}
                  </Badge>
                </div>
                <div className="md:col-span-2">
                  <Label className="block mb-2">Descripción</Label>
                  <Textarea
                    value={selectedSolicitud.descripcion}
                    readOnly
                    className="resize-none w-full min-h-[100px]"
                  />
                </div>
                {selectedSolicitud.respuesta && (
                  <div className="md:col-span-2">
                    <Label className="block mb-2">Respuesta</Label>
                    <Textarea
                      value={selectedSolicitud.respuesta}
                      readOnly
                      className="resize-none w-full min-h-[100px]"
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-6">
                <Button variant="outline" onClick={close}>
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogHandle>
      )}

      {/* Response dialog */}
      {id && action === "responder" && selectedSolicitud && (
        <DialogHandle
          title={`Responder solicitud de ${selectedSolicitud.usuario_solicitud}`}
          open
          onOpenChange={(open) => !open && closeDialog()}
          size="max-w-2xl"
          trigger={<div />}
        >
          {(close) => (
            <SolicitudResponseForm
              solicitud={selectedSolicitud}
              refreshSolicitudes={refreshSolicitudes}
              onSuccess={() => closeDialog()}
            />
          )}
        </DialogHandle>
      )}
    </div>
  );
}
