import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  Plus, Edit, Trash2, MapPin, Calendar, Clock, CheckCircle,
  XCircle, Settings, History, Eye, Activity, AlertTriangle
} from 'lucide-react';

// Enhanced Soccer Fields Module (CANCHA, HISTORIAL_CANCHA)
export const CanchasModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState('fields');
  const [isCreateFieldOpen, setIsCreateFieldOpen] = useState(false);
  const [isEditFieldOpen, setIsEditFieldOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<any>(null);

  const fields = [
    {
      id: 1, nombre: "Estadio Nacional", direccion: "Avenida Grecia 2001, Ñuñoa, Santiago",
      capacidad: 45000, tipo_superficie: "Césped Natural", disponible: true,
      fecha_construccion: "1938-12-03", ultimo_mantenimiento: "2024-08-15",
      costo_arriendo: 500000, observaciones: "Campo principal para partidos oficiales",
      instalaciones: ["Vestuarios", "Iluminación", "Tribunas", "Estacionamiento", "Cafetería", "Enfermería"],
      estado_actual: "Excelente"
    },
    {
      id: 2, nombre: "Santa Laura", direccion: "Independencia 2024, Santiago",
      capacidad: 22000, tipo_superficie: "Césped Sintético", disponible: true,
      fecha_construccion: "1922-05-20", ultimo_mantenimiento: "2024-09-01",
      costo_arriendo: 300000, observaciones: "Campo histórico con excelente acústica",
      instalaciones: ["Vestuarios", "Iluminación", "Tribunas", "Estacionamiento"],
      estado_actual: "Bueno"
    },
    {
      id: 3, nombre: "San Carlos de Apoquindo", direccion: "Las Condes, Santiago",
      capacidad: 14000, tipo_superficie: "Césped Natural", disponible: false,
      fecha_construccion: "1988-03-12", ultimo_mantenimiento: "2024-07-20",
      costo_arriendo: 400000, observaciones: "En mantenimiento por renovación de césped",
      instalaciones: ["Vestuarios", "Iluminación", "Tribunas", "Estacionamiento", "Cafetería", "Sala VIP"],
      estado_actual: "En Mantenimiento"
    },
    {
      id: 4, nombre: "Campo de Entrenamiento Norte", direccion: "Pudahuel, Santiago",
      capacidad: 500, tipo_superficie: "Tierra", disponible: true,
      fecha_construccion: "2010-06-15", ultimo_mantenimiento: "2024-09-10",
      costo_arriendo: 50000, observaciones: "Campo para entrenamientos y partidos menores",
      instalaciones: ["Vestuarios", "Iluminación"],
      estado_actual: "Regular"
    }
  ];

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

  const handleEditField = (field: any) => {
    setSelectedField(field);
    setIsEditFieldOpen(true);
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'Excelente': return 'bg-green-500';
      case 'Bueno': return 'bg-blue-500';
      case 'Regular': return 'bg-yellow-500';
      case 'En Mantenimiento': return 'bg-orange-500';
      case 'Malo': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2>Administración de Canchas de Fútbol</h2>
        <div className="flex space-x-2">
          <Dialog open={isCreateFieldOpen} onOpenChange={setIsCreateFieldOpen}>
            <DialogTrigger asChild>
              <Button style={{ backgroundColor: '#0000db' }} className="text-white">
                <Plus className="w-4 h-4 mr-2" />
                Registrar Cancha
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Registrar Nueva Cancha</DialogTitle>
              </DialogHeader>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2">Nombre de la Cancha</label>
                    <Input placeholder="Ej: Estadio Municipal" />
                  </div>
                  <div>
                    <label className="block mb-2">Capacidad</label>
                    <Input type="number" placeholder="Número de espectadores" />
                  </div>
                  <div className="col-span-2">
                    <label className="block mb-2">Dirección Completa</label>
                    <Input placeholder="Dirección completa de la cancha" />
                  </div>
                  <div>
                    <label className="block mb-2">Tipo de Superficie</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="natural">Césped Natural</SelectItem>
                        <SelectItem value="sintetico">Césped Sintético</SelectItem>
                        <SelectItem value="tierra">Tierra</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block mb-2">Fecha de Construcción</label>
                    <Input type="date" />
                  </div>
                  <div>
                    <label className="block mb-2">Costo de Arriendo (CLP)</label>
                    <Input type="number" placeholder="Costo por evento" />
                  </div>
                  <div>
                    <label className="block mb-2">Estado Actual</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excelente">Excelente</SelectItem>
                        <SelectItem value="bueno">Bueno</SelectItem>
                        <SelectItem value="regular">Regular</SelectItem>
                        <SelectItem value="malo">Malo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block mb-2">Instalaciones Disponibles</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Vestuarios", "Iluminación", "Tribunas", "Estacionamiento", "Cafetería", "Enfermería", "Sala VIP", "Tienda", "Sala de Prensa"].map((facility) => (
                      <div key={facility} className="flex items-center space-x-2">
                        <input type="checkbox" id={facility} />
                        <label htmlFor={facility} className="text-sm">{facility}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block mb-2">Observaciones</label>
                  <Textarea placeholder="Información adicional sobre la cancha" />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateFieldOpen(false)}>
                    Cancelar
                  </Button>
                  <Button style={{ backgroundColor: '#0000db' }} className="text-white">
                    Registrar Cancha
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="fields">Canchas (CANCHA)</TabsTrigger>
          <TabsTrigger value="schedule">Programación</TabsTrigger>
          <TabsTrigger value="maintenance">Mantenimiento</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="fields" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fields.map((field) => (
              <Card key={field.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{field.nombre}</CardTitle>
                    <div className="flex flex-col space-y-1">
                      <Badge className={field.disponible ? 'bg-green-500' : 'bg-red-500'}>
                        {field.disponible ? 'Disponible' : 'No Disponible'}
                      </Badge>
                      <Badge className={getStatusColor(field.estado_actual)}>
                        {field.estado_actual}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <MapPin className="w-4 h-4 mr-2 mt-1 text-gray-500" />
                      <p className="text-sm text-gray-600">{field.direccion}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Capacidad:</span>
                        <p>{field.capacidad.toLocaleString()} personas</p>
                      </div>
                      <div>
                        <span className="font-medium">Superficie:</span>
                        <p>{field.tipo_superficie}</p>
                      </div>
                      <div>
                        <span className="font-medium">Arriendo:</span>
                        <p>${field.costo_arriendo.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="font-medium">Construida:</span>
                        <p>{field.fecha_construccion}</p>
                      </div>
                    </div>

                    <div>
                      <span className="font-medium text-sm">Último Mantenimiento:</span>
                      <p className="text-sm text-gray-600">{field.ultimo_mantenimiento}</p>
                    </div>

                    <div>
                      <span className="font-medium text-sm">Instalaciones:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {field.instalaciones.map((facility, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {facility}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {field.observaciones && (
                      <div>
                        <span className="font-medium text-sm">Observaciones:</span>
                        <p className="text-sm text-gray-600">{field.observaciones}</p>
                      </div>
                    )}

                    <div className="flex space-x-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEditField(field)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Calendar className="w-4 h-4 mr-1" />
                        Programar
                      </Button>
                    </div>
                  </div>
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
