import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { DialogHandle } from "../components/dialog-component.tsx";
import { AlertDialogHandle } from "../components/alert-dialog-component.tsx";
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  Plus, Edit, Trash2, MapPin, Calendar, Clock, CheckCircle,
  XCircle, Settings, History, Eye, Activity, AlertTriangle
} from 'lucide-react';
import { CanchaForm } from '../forms/canchaForm.tsx';
import type { CanchaType } from '../types.tsx';
import { deleteCancha, getCanchas } from '../services/canchaService.ts';
import { toast } from "sonner";

export const CanchasModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState('fields');
  const [isCreateFieldOpen, setIsCreateFieldOpen] = useState(false);
  const [openSelected, setOpenSelected] = useState<number | null>(null)
  const [isEditFieldOpen, setIsEditFieldOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<any>(null);
  const [isFetchingCanchas, setIsFetchingCanchas] = useState(false);
  const [canchas, setCanchas] = useState<CanchaType[]>([]);

  useEffect(() => {
    fetchCanchas();
  }, [])

  const fetchCanchas = async () => {
    let data: CanchaType[] = []
    try {
      setIsFetchingCanchas(true)
      data = await getCanchas();
      setCanchas(data);
      if (data.length === 0) {
        toast.info("No hay clubes registrados en la base de datos.")
      }
    } catch (err: any) {
      toast.warning(String(err))
    } finally {
      if (data.length === 0) {
        setCanchas([]);
      }
      setIsFetchingCanchas(false)
    }
  };

  const handleDeleteCancha = async (id: number) => {
    try {
      const response = await deleteCancha(id);
      console.log(response)
      toast.success(response?.detail || "Cancha eliminada correctamente");
      setOpenSelected(null)
      fetchCanchas();
    } catch (error) {
      console.log(error)
      toast.error(String(error))
    }
  }

  const fieldSchedule = [
    {
      id: 1, id_cancha: 1, cancha_nombre: "Estadio Nacional", fecha: "2024-09-22",
      hora_inicio: "15:00", hora_fin: "17:00", tipo_evento: "Partido Oficial",
      descripcion: "Barcelona vs Real Madrid", estado: "Confirmado"
    },
    {
      id: 2, id_cancha: 2, cancha_nombre: "Santa Laura", fecha: "2024-09-23",
      hora_inicio: "18:00", hora_fin: "20:00", tipo_evento: "Entrenamiento",
      descripcion: "Entrenamiento Universidad Chile", estado: "Confirmado"
    },
    {
      id: 3, id_cancha: 1, cancha_nombre: "Estadio Nacional", fecha: "2024-09-25",
      hora_inicio: "20:00", hora_fin: "22:00", tipo_evento: "Partido Oficial",
      descripcion: "Universidad vs Colo-Colo", estado: "Pendiente"
    }
  ];

  const fieldHistory = [
    {
      id: 1, id_cancha: 1, fecha_cambio: "2024-09-15 10:30:00", campo_modificado: "estado_actual",
      valor_anterior: "Bueno", valor_nuevo: "Excelente", usuario_modificacion: "Juan Pérez",
      motivo: "Finalización de mantenimiento programado"
    },
    {
      id: 2, id_cancha: 3, fecha_cambio: "2024-09-10 14:20:00", campo_modificado: "disponible",
      valor_anterior: "true", valor_nuevo: "false", usuario_modificacion: "María González",
      motivo: "Inicio de renovación de césped"
    },
    {
      id: 3, id_cancha: 2, fecha_cambio: "2024-09-05 09:15:00", campo_modificado: "costo_arriendo",
      valor_anterior: "250000", valor_nuevo: "300000", usuario_modificacion: "Carlos Rojas",
      motivo: "Ajuste de precios por inflación"
    }
  ];

  const maintenanceRecords = [
    {
      id: 1, id_cancha: 1, cancha_nombre: "Estadio Nacional", fecha_mantenimiento: "2024-08-15",
      tipo_mantenimiento: "Preventivo", descripcion: "Corte de césped y marcado de líneas",
      costo: 150000, proveedor: "Servicios Deportivos Chile", estado: "Completado"
    },
    {
      id: 2, id_cancha: 3, cancha_nombre: "San Carlos de Apoquindo", fecha_mantenimiento: "2024-07-20",
      tipo_mantenimiento: "Correctivo", descripcion: "Renovación completa de césped",
      costo: 2500000, proveedor: "GreenField Solutions", estado: "En Progreso"
    }
  ];

  const getTipoCancha = (tipo: number) => {
    switch (tipo) {
      case 1:
        return "Césped Natural";
      case 2:
        return "Césped Sintético";
      case 3:
        return "Tierra";
      default:
        return "Desconocido";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2>Administración de Canchas de Fútbol</h2>
        <div className="flex space-x-2">
          <DialogHandle<any>
            title="Registrar Nueva Cancha"
            trigger={
              <Button style={{ backgroundColor: "#0000db" }} className="text-white">
                <Plus className="w-4 h-4 mr-2" />
                Nueva cancha
              </Button>
            }
          >
            {(close) => (
              <CanchaForm
                isEdit={false}
                refreshCanchas={fetchCanchas}
                onSuccess={close}
              />
            )}
          </DialogHandle>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="fields">Canchas</TabsTrigger>
          <TabsTrigger value="schedule">Programación</TabsTrigger>
          <TabsTrigger value="maintenance">Mantenimiento</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="fields" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {canchas.map((cancha) => (
              <Card key={cancha.id_cancha}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{cancha.nombre_cancha}</CardTitle>
                    <div className="flex flex-col space-y-1">
                      <Badge className={cancha.disponibilidad ? "bg-green-500" : "bg-red-500"}>
                        {cancha.disponibilidad ? "Disponible" : "No Disponible"}
                      </Badge>
                      <Badge className={cancha.cancha_activa ? "bg-blue-500" : "bg-gray-400"}>
                        {cancha.cancha_activa ? "Activa" : "Inactiva"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    {cancha.direccion && (
                      <div className="flex items-start">
                        <MapPin className="w-4 h-4 mr-2 mt-1 text-gray-500" />
                        <p className="text-sm text-gray-600">{cancha.direccion}</p>
                      </div>
                    )}

                    <div className="text-sm space-y-1">
                      <p>
                        <span className="font-medium">Tipo de superficie:</span>{" "}
                        {(getTipoCancha(cancha.tipo_cancha))}
                      </p>
                      <p>
                        <span className="font-medium">Creada:</span>{" "}
                        {new Date(cancha.fecha_creacion).toLocaleDateString()}
                      </p>
                      <p>
                        <span className="font-medium">Modificada:</span>{" "}
                        {new Date(cancha.fecha_modificacion).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex space-x-2 pt-2">
                    </div>
                  </div>
                  <DialogHandle<CanchaType>
                    title={`Modificar cancha ${cancha.nombre_cancha}`}
                    trigger={
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="w-4 h-4 mr-1" /> Editar
                      </Button>
                    }
                  >
                    {(close) => (
                      <CanchaForm
                        cancha={cancha}
                        isEdit={true}
                        refreshCanchas={fetchCanchas}
                        onSuccess={close}
                      />
                    )}
                  </DialogHandle>
                  <Button onClick={() => setOpenSelected(cancha.id_cancha)} variant="destructive" size="sm" className="flex-1">
                    <Trash2 className="w-4 h-4 mr-1" />
                    Eliminar
                  </Button>
                  <AlertDialogHandle
                    title={`Eliminacion de cancha ${cancha.nombre_cancha}`}
                    description={`¿Estas seguro de querer eliminar al cancha ${cancha.nombre_cancha}`}
                    confirmLabel='Eliminar'
                    cancelLabel='Cancelar'
                    onConfirm={() => handleDeleteCancha(cancha.id_cancha)}
                    open={openSelected === cancha.id_cancha}
                    onOpenChange={(Open) => {
                      if (!Open) setOpenSelected(null); // cerrar el dialog
                    }}
                  >
                  </AlertDialogHandle>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Programación de Canchas</CardTitle>
                <Button style={{ backgroundColor: '#0000db' }} className="text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Reserva
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cancha</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Horario</TableHead>
                    <TableHead>Tipo de Evento</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fieldSchedule.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell className="font-medium">{schedule.cancha_nombre}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {schedule.fecha}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {schedule.hora_inicio} - {schedule.hora_fin}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{schedule.tipo_evento}</Badge>
                      </TableCell>
                      <TableCell>{schedule.descripcion}</TableCell>
                      <TableCell>
                        <Badge className={schedule.estado === 'Confirmado' ? 'bg-green-500' : 'bg-yellow-500'}>
                          {schedule.estado}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Registros de Mantenimiento</CardTitle>
                <Button style={{ backgroundColor: '#0000db' }} className="text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Mantenimiento
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cancha</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Costo</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {maintenanceRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.cancha_nombre}</TableCell>
                      <TableCell>{record.fecha_mantenimiento}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{record.tipo_mantenimiento}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{record.descripcion}</TableCell>
                      <TableCell>${record.costo.toLocaleString()}</TableCell>
                      <TableCell>{record.proveedor}</TableCell>
                      <TableCell>
                        <Badge className={record.estado === 'Completado' ? 'bg-green-500' : 'bg-blue-500'}>
                          {record.estado}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Cambios (HISTORIAL_CANCHA)</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha/Hora</TableHead>
                    <TableHead>Cancha ID</TableHead>
                    <TableHead>Campo Modificado</TableHead>
                    <TableHead>Valor Anterior</TableHead>
                    <TableHead>Valor Nuevo</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Motivo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fieldHistory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.fecha_cambio}</TableCell>
                      <TableCell>{item.id_cancha}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.campo_modificado}</Badge>
                      </TableCell>
                      <TableCell className="text-red-600">{item.valor_anterior}</TableCell>
                      <TableCell className="text-green-600">{item.valor_nuevo}</TableCell>
                      <TableCell>{item.usuario_modificacion}</TableCell>
                      <TableCell className="max-w-xs truncate">{item.motivo}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Field Dialog */}
      <Dialog open={isEditFieldOpen} onOpenChange={setIsEditFieldOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Editar Cancha: {selectedField?.nombre}</DialogTitle>
          </DialogHeader>
          {selectedField && (
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2">Nombre de la Cancha</label>
                  <Input defaultValue={selectedField.nombre} />
                </div>
                <div>
                  <label className="block mb-2">Capacidad</label>
                  <Input type="number" defaultValue={selectedField.capacidad} />
                </div>
                <div className="col-span-2">
                  <label className="block mb-2">Dirección</label>
                  <Input defaultValue={selectedField.direccion} />
                </div>
                <div>
                  <label className="block mb-2">Tipo de Superficie</label>
                  <Select defaultValue={selectedField.tipo_superficie.toLowerCase().replace(' ', '')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cespednatural">Césped Natural</SelectItem>
                      <SelectItem value="cespedsintetico">Césped Sintético</SelectItem>
                      <SelectItem value="tierra">Tierra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block mb-2">Estado Actual</label>
                  <Select defaultValue={selectedField.estado_actual.toLowerCase()}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excelente">Excelente</SelectItem>
                      <SelectItem value="bueno">Bueno</SelectItem>
                      <SelectItem value="regular">Regular</SelectItem>
                      <SelectItem value="malo">Malo</SelectItem>
                      <SelectItem value="en mantenimiento">En Mantenimiento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block mb-2">Costo de Arriendo</label>
                  <Input type="number" defaultValue={selectedField.costo_arriendo} />
                </div>
                <div>
                  <label className="block mb-2">Disponibilidad</label>
                  <Select defaultValue={selectedField.disponible ? "true" : "false"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Disponible</SelectItem>
                      <SelectItem value="false">No Disponible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block mb-2">Observaciones</label>
                <Textarea defaultValue={selectedField.observaciones} />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditFieldOpen(false)}>
                  Cancelar
                </Button>
                <Button style={{ backgroundColor: '#0000db' }} className="text-white">
                  Guardar Cambios
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
