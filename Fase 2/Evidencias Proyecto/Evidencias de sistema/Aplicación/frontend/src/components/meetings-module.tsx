import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar, Plus, Users, Clock, MapPin, CheckCircle, XCircle } from 'lucide-react';

export const MeetingsModule: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);

  const meetingHistory = [
    {
      id: 1,
      title: "Reunión Mensual Presidente",
      type: "Presidente",
      date: "2024-08-15",
      time: "19:00",
      location: "Sala de Reuniones Principal",
      description: "Revisión de estados financieros y planificación del próximo mes",
      status: "Finalizada",
      attendees: [
        { name: "Juan Pérez", role: "Presidente", attended: true },
        { name: "María González", role: "Vicepresidente", attended: true },
        { name: "Carlos Rojas", role: "Tesorero", attended: false },
        { name: "Ana Silva", role: "Secretario", attended: true }
      ]
    },
    {
      id: 2,
      title: "Asamblea de Delegados",
      type: "Delegados",
      date: "2024-08-22",
      time: "18:00",
      location: "Auditorio Central",
      description: "Votación de nuevas reglas y discusión de presupuesto anual",
      status: "Finalizada",
      attendees: [
        { name: "Pedro López", role: "Delegado FC Barcelona", attended: true },
        { name: "Luis Martín", role: "Delegado Real Madrid", attended: true },
        { name: "Carmen Ruiz", role: "Delegado Universidad", attended: false },
        { name: "Roberto Castro", role: "Delegado Colo-Colo", attended: true },
        { name: "Isabel Torres", role: "Delegado Católica", attended: true }
      ]
    },
    {
      id: 3,
      title: "Reunión Extraordinaria - Nuevas Regulaciones",
      type: "Extraordinaria",
      date: "2024-09-10",
      time: "20:00",
      location: "Sala Virtual (Zoom)",
      description: "Discusión urgente sobre nuevas regulaciones FIFA",
      status: "Programada",
      attendees: [
        { name: "Juan Pérez", role: "Presidente", attended: null },
        { name: "María González", role: "Vicepresidente", attended: null },
        { name: "Carlos Rojas", role: "Tesorero", attended: null }
      ]
    }
  ];

  const usersList = [
    { email: "juan.perez@asociacion.cl", name: "Juan Pérez", role: "Presidente" },
    { email: "maria.gonzalez@asociacion.cl", name: "María González", role: "Vicepresidente" },
    { email: "carlos.rojas@asociacion.cl", name: "Carlos Rojas", role: "Tesorero" },
    { email: "ana.silva@asociacion.cl", name: "Ana Silva", role: "Secretario" },
    { email: "pedro.lopez@fcbarcelona.cl", name: "Pedro López", role: "Delegado FC Barcelona" },
    { email: "luis.martin@realmadrid.cl", name: "Luis Martín", role: "Delegado Real Madrid" }
  ];

  const getMeetingTypeColor = (type: string) => {
    switch (type) {
      case 'Presidente': return 'bg-[#0000db]';
      case 'Delegados': return 'bg-[#FF8C00]';
      case 'Extraordinaria': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Finalizada': return 'bg-green-500';
      case 'Programada': return 'bg-blue-500';
      case 'En Curso': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2>Gestión de Reuniones</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button style={{ backgroundColor: '#0000db' }} className="text-white">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Reunión
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nueva Reunión</DialogTitle>
            </DialogHeader>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2">Título de la Reunión</label>
                  <Input placeholder="Ingrese el título" />
                </div>
                <div>
                  <label className="block mb-2">Tipo de Reunión</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="presidente">Presidente</SelectItem>
                      <SelectItem value="delegados">Delegados</SelectItem>
                      <SelectItem value="extraordinaria">Extraordinaria</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block mb-2">Fecha</label>
                  <Input type="date" />
                </div>
                <div>
                  <label className="block mb-2">Hora</label>
                  <Input type="time" />
                </div>
                <div className="col-span-2">
                  <label className="block mb-2">Ubicación</label>
                  <Input placeholder="Sala de reuniones, dirección, enlace virtual, etc." />
                </div>
                <div className="col-span-2">
                  <label className="block mb-2">Descripción</label>
                  <Textarea placeholder="Describe el propósito y agenda de la reunión" />
                </div>
              </div>
              
              <div>
                <label className="block mb-2">Participantes Invitados</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {usersList.map((user, i) => (
                    <div key={i} className="flex items-center space-x-2 p-2 border rounded">
                      <input type="checkbox" id={`user-${i}`} />
                      <label htmlFor={`user-${i}`} className="text-sm">
                        {user.name} ({user.role})
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button style={{ backgroundColor: '#0000db' }} className="text-white">
                  Crear Reunión
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming">Próximas Reuniones</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reuniones Programadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {meetingHistory.filter(m => m.status === 'Programada').map((meeting) => (
                  <div key={meeting.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium">{meeting.title}</h3>
                          <Badge className={`${getMeetingTypeColor(meeting.type)} text-white`}>
                            {meeting.type}
                          </Badge>
                          <Badge className={`${getStatusColor(meeting.status)} text-white`}>
                            {meeting.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {meeting.date}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {meeting.time}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {meeting.location}
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-700 mb-3">{meeting.description}</p>
                        
                        <div className="flex items-center text-sm">
                          <Users className="w-4 h-4 mr-1" />
                          <span>{meeting.attendees.length} participantes invitados</span>
                        </div>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedMeeting(meeting)}
                      >
                        Ver Detalles
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Reuniones</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Participantes</TableHead>
                    <TableHead>Asistencia</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {meetingHistory.filter(m => m.status === 'Finalizada').map((meeting) => {
                    const attendedCount = meeting.attendees.filter(a => a.attended).length;
                    const totalCount = meeting.attendees.length;
                    
                    return (
                      <TableRow key={meeting.id}>
                        <TableCell className="font-medium">{meeting.title}</TableCell>
                        <TableCell>
                          <Badge className={`${getMeetingTypeColor(meeting.type)} text-white`}>
                            {meeting.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{meeting.date}</TableCell>
                        <TableCell>{totalCount}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <span>{attendedCount}/{totalCount}</span>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ width: `${(attendedCount/totalCount)*100}%` }}
                              ></div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(meeting.status)} text-white`}>
                            {meeting.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedMeeting(meeting)}
                          >
                            Ver Detalles
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Meeting Details Dialog */}
      {selectedMeeting && (
        <Dialog open={!!selectedMeeting} onOpenChange={() => setSelectedMeeting(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedMeeting.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium">Tipo</label>
                  <Badge className={`${getMeetingTypeColor(selectedMeeting.type)} text-white block text-center mt-1`}>
                    {selectedMeeting.type}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Fecha</label>
                  <p className="mt-1">{selectedMeeting.date}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Hora</label>
                  <p className="mt-1">{selectedMeeting.time}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Estado</label>
                  <Badge className={`${getStatusColor(selectedMeeting.status)} text-white block text-center mt-1`}>
                    {selectedMeeting.status}
                  </Badge>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Ubicación</label>
                <p className="mt-1">{selectedMeeting.location}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium">Descripción</label>
                <p className="mt-1 text-gray-700">{selectedMeeting.description}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium">Lista de Asistencia</label>
                <div className="mt-2 space-y-2">
                  {selectedMeeting.attendees.map((attendee: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{attendee.name}</p>
                        <p className="text-sm text-gray-600">{attendee.role}</p>
                      </div>
                      <div className="flex items-center">
                        {attendee.attended === true && (
                          <Badge className="bg-green-500 text-white">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Asistió
                          </Badge>
                        )}
                        {attendee.attended === false && (
                          <Badge className="bg-red-500 text-white">
                            <XCircle className="w-3 h-3 mr-1" />
                            No Asistió
                          </Badge>
                        )}
                        {attendee.attended === null && (
                          <Badge variant="outline">
                            Pendiente
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};