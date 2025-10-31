import React, { useState } from "react";
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

export default function SolicitudesList({
  solicitudes,
  loading,
  refreshSolicitudes,
  currentUser,
}: {
  solicitudes: any[];
  loading: boolean;
  refreshSolicitudes: () => Promise<void>;
  currentUser?: { rol: string };
}) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any | null>(null);
  const [responseDialog, setResponseDialog] = useState<any | null>(null);

  const filtered = solicitudes.filter((s: any) => {
    const matchesSearch =
      s.descripcion?.toLowerCase().includes(search.toLowerCase()) ||
      s.usuario_solicitud?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "respondida" && s.estado === true) ||
      (filter === "pendiente" && s.estado === false);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-4">
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
      </div>

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
              <div>
                <p className="font-medium">{sol.descripcion}</p>
                <p className="text-sm text-gray-500">
                  Usuario: {sol.nombre_usuario} {sol.apellido_usuario} · Club: {sol.nombre_club} ·{" "}
                  Estado:{" "}
                  <Badge
                    variant={sol.estado ? "success" : "secondary"}
                    className="ml-1"
                  >
                    {sol.estado ? "Respondida" : "Pendiente"}
                  </Badge>
                </p>
              </div>

              <div className="flex gap-2">
                {(currentUser?.rol === "admin" || true) && !sol.estado && (
                  <Button
                    variant="ghost"
                    className="bg-green-500 text-white"
                    onClick={() => setResponseDialog(sol)}
                  >
                    Responder
                  </Button>
                )}

                <Button variant="outline" onClick={() => setSelected(sol)}>
                  Revisar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <DialogHandle
          title="Detalle de solicitud"
          open={!!selected}
          onOpenChange={(open) => {
            if (!open) setSelected(null);
          }}
          initialData={selected}
          size="max-w-3xl"
          trigger={<div />}
        >
          {(close, solicitud) => (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="block mb-2">Nombre completo</Label>
                  <Input
                    value={`${solicitud?.nombre_usuario} ${solicitud?.apellido_usuario}`}
                    readOnly
                  />
                </div>

                <div>
                  <Label className="block mb-2">Club</Label>
                  <Input
                    value={solicitud?.nombre_club || "Sin club asociado"}
                    readOnly
                  />
                </div>

                <div>
                  <Label className="block mb-2">Categoría</Label>
                  <Input
                    value={solicitud?.categoria || "Sin categoría"}
                    readOnly
                  />
                </div>

                <div>
                  <Label className="block mb-2">Estado</Label>
                  <Badge
                    className={`${solicitud?.estado ? "bg-green-500" : "bg-gray-500"
                      } w-fit px-3 py-1`}
                  >
                    {solicitud?.estado ? "Respondida" : "Pendiente"}
                  </Badge>
                </div>

                {/* Descripción - full width */}
                <div className="md:col-span-2">
                  <Label className="block mb-2">Descripción</Label>
                  <Textarea
                    value={solicitud?.descripcion || "Sin descripción"}
                    readOnly
                    className="resize-none w-full min-h-[100px]"
                  />
                </div>

                {/* Respuesta - full width if exists */}
                {solicitud?.respuesta && (
                  <div className="md:col-span-2">
                    <Label className="block mb-2">Respuesta</Label>
                    <Textarea
                      value={solicitud?.respuesta || "Sin respuesta"}
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

      {responseDialog && (
        <DialogHandle
          title={`Responder solicitud de ${responseDialog.usuario_solicitud}`}
          open={!!responseDialog}
          onOpenChange={(open) => {
            if (!open) setResponseDialog(null);
          }}
          size="max-w-2xl"
          trigger={<div />}
        >
          {(close) => (
            <SolicitudResponseForm
              solicitud={responseDialog}
              refreshSolicitudes={refreshSolicitudes}
              onSuccess={() => {
                close();
                setResponseDialog(null);
              }}
            />
          )}
        </DialogHandle>
      )}
    </div>
  );
}
