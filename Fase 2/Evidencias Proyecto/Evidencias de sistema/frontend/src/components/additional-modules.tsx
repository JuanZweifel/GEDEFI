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
import { Calendar } from './ui/calendar';
import { 
  Plus, AlertTriangle, Calendar as CalendarIcon, MapPin, Clock, 
  Edit, Trash2, CheckCircle, XCircle, Search, Filter
} from 'lucide-react';

// Penalties Management Module
export const PenaltiesModule: React.FC = () => {
  const [isCreatePenaltyOpen, setIsCreatePenaltyOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const penalties = [
    {
      id: 1,
      player: "Carlos Rodríguez",
      rut: "12345678-9",
      club: "FC Barcelona",
      description: "Conducta antideportiva hacia el árbitro",
      startDate: "2024-08-15",
      endDate: "2024-09-15",
      matchesSuspended: 3,
      series: "Serie A Masculina",
      status: "Activo"
    },
    {
      id: 2,
      player: "Miguel Santos",
      rut: "98765432-1",
      club: "Real Madrid",
      description: "Agresión a jugador rival",
      startDate: "2024-07-20",
      endDate: "2024-08-20",
      matchesSuspended: 4,
      series: "Serie A Masculina",
      status: "Cumplido"
    }
  ];

  const players = [
    { rut: "12345678-9", name: "Carlos Rodríguez", club: "FC Barcelona" },
    { rut: "98765432-1", name: "Miguel Santos", club: "Real Madrid" },
    { rut: "11111111-1", name: "Pedro González", club: "Universidad Chile" }
  ];

  const series = [
    { id: 1, name: "Serie A Masculina" },
    { id: 2, name: "Serie B Femenina" },
    { id: 3, name: "Serie Juvenil" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2>Gestión de Castigos y Sanciones</h2>
        <Dialog open={isCreatePenaltyOpen} onOpenChange={setIsCreatePenaltyOpen}>
          <DialogTrigger asChild>
            <Button style={{ backgroundColor: '#0000db' }} className="text-white">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Castigo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Castigo</DialogTitle>
            </DialogHeader>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2">Tipo de Sanción</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Jugador Individual</SelectItem>
                      <SelectItem value="series">Serie Completa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block mb-2">Jugador</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione jugador" />
                    </SelectTrigger>
                    <SelectContent>
                      {players.map((player) => (
                        <SelectItem key={player.rut} value={player.rut}>
                          {player.name} - {player.club}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block mb-2">Serie Afectada</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione serie" />
                    </SelectTrigger>
                    <SelectContent>
                      {series.map((s) => (
                        <SelectItem key={s.id} value={s.id.toString()}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block mb-2">Partidos Castigados</label>
                  <Input type="number" placeholder="Número de partidos" />
                </div>
                <div>
                  <label className="block mb-2">Fecha de Inicio</label>
                  <Input type="date" />
                </div>
                <div>
                  <label className="block mb-2">Fecha de Término</label>
                  <Input type="date" />
                </div>
              </div>
              <div>
                <label className="block mb-2">Descripción del Castigo</label>
                <Textarea placeholder="Describe la infracción y el castigo aplicado" />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreatePenaltyOpen(false)}>
                  Cancelar
                </Button>
                <Button style={{ backgroundColor: '#0000db' }} className="text-white">
                  Registrar Castigo
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Castigos Registrados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Jugador</TableHead>
                <TableHead>Club</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Partidos</TableHead>
                <TableHead>Fecha Inicio</TableHead>
                <TableHead>Fecha Término</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {penalties.map((penalty) => (
                <TableRow key={penalty.id}>
                  <TableCell className="font-medium">{penalty.player}</TableCell>
                  <TableCell>{penalty.club}</TableCell>
                  <TableCell className="max-w-xs truncate">{penalty.description}</TableCell>
                  <TableCell>{penalty.matchesSuspended}</TableCell>
                  <TableCell>{penalty.startDate}</TableCell>
                  <TableCell>{penalty.endDate}</TableCell>
                  <TableCell>
                    <Badge className={penalty.status === 'Activo' ? 'bg-red-500' : 'bg-green-500'}>
                      {penalty.status}
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
    </div>
  );
};

// Calendar Management Module
export const CalendarModule: React.FC = () => {
  const [isCreateMatchOpen, setIsCreateMatchOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const matches = [
    {
      id: 1,
      date: "2024-09-15",
      time: "15:00",
      local: "FC Barcelona",
      visitante: "Real Madrid",
      series: "Serie A Masculina",
      stadium: "Estadio Nacional",
      status: "Programado"
    },
    {
      id: 2,
      date: "2024-09-16",
      time: "17:00",
      local: "Universidad Chile",
      visitante: "Colo-Colo",
      series: "Serie A Masculina",
      stadium: "Santa Laura",
      status: "Programado"
    }
  ];

  const stadiums = [
    { id: 1, name: "Estadio Nacional", available: true },
    { id: 2, name: "Santa Laura", available: true },
    { id: 3, name: "San Carlos de Apoquindo", available: false }
  ];

  const clubs = [
    "FC Barcelona Santiago", "Real Madrid Chile", "Universidad de Chile", 
    "Colo-Colo", "Universidad Católica"
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2>Gestión de Calendario</h2>
        <Dialog open={isCreateMatchOpen} onOpenChange={setIsCreateMatchOpen}>
          <DialogTrigger asChild>
            <Button style={{ backgroundColor: '#0000db' }} className="text-white">
              <Plus className="w-4 h-4 mr-2" />
              Programar Partido
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Programar Nuevo Partido</DialogTitle>
            </DialogHeader>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2">Equipo Local</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione equipo local" />
                    </SelectTrigger>
                    <SelectContent>
                      {clubs.map((club, i) => (
                        <SelectItem key={i} value={club}>
                          {club}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block mb-2">Equipo Visitante</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione equipo visitante" />
                    </SelectTrigger>
                    <SelectContent>
                      {clubs.map((club, i) => (
                        <SelectItem key={i} value={club}>
                          {club}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block mb-2">Serie</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione serie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="serie-a">Serie A Masculina</SelectItem>
                      <SelectItem value="serie-b">Serie B Femenina</SelectItem>
                      <SelectItem value="juvenil">Serie Juvenil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block mb-2">Estadio</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione estadio" />
                    </SelectTrigger>
                    <SelectContent>
                      {stadiums.filter(s => s.available).map((stadium) => (
                        <SelectItem key={stadium.id} value={stadium.id.toString()}>
                          {stadium.name}
                        </SelectItem>
                      ))}
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
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateMatchOpen(false)}>
                  Cancelar
                </Button>
                <Button style={{ backgroundColor: '#0000db' }} className="text-white">
                  Programar Partido
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Partidos Programados</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Partido</TableHead>
                  <TableHead>Serie</TableHead>
                  <TableHead>Estadio</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matches.map((match) => (
                  <TableRow key={match.id}>
                    <TableCell>{match.date}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {match.time}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {match.local} vs {match.visitante}
                    </TableCell>
                    <TableCell>{match.series}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {match.stadium}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {match.status}
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

        <Card>
          <CardHeader>
            <CardTitle>Calendario</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
            
            <div className="mt-4 space-y-2">
              <h4 className="font-medium">Eventos del día</h4>
              <div className="space-y-2">
                <div className="p-2 border rounded text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">15:00</span>
                    <Badge variant="outline">Partido</Badge>
                  </div>
                  <p className="text-gray-600 mt-1">Barcelona vs Madrid</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Soccer Fields Management Module
export const SoccerFieldsModule: React.FC = () => {
  const [isCreateFieldOpen, setIsCreateFieldOpen] = useState(false);
  const [isEditFieldOpen, setIsEditFieldOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<any>(null);

  const fields = [
    {
      id: 1,
      name: "Estadio Nacional",
      address: "Avenida Grecia 2001, Ñuñoa",
      capacity: 45000,
      fieldType: "Césped Natural",
      available: true,
      facilities: ["Vestuarios", "Iluminación", "Tribunas", "Estacionamiento"]
    },
    {
      id: 2,
      name: "Santa Laura",
      address: "Independencia 2024, Santiago",
      capacity: 22000,
      fieldType: "Césped Sintético",
      available: true,
      facilities: ["Vestuarios", "Iluminación", "Tribunas"]
    },
    {
      id: 3,
      name: "San Carlos de Apoquindo",
      address: "Las Condes, Santiago",
      capacity: 14000,
      fieldType: "Césped Natural",
      available: false,
      facilities: ["Vestuarios", "Iluminación", "Tribunas", "Estacionamiento", "Cafetería"]
    }
  ];

  const handleEditField = (field: any) => {
    setSelectedField(field);
    setIsEditFieldOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2>Administración de Canchas</h2>
        <Dialog open={isCreateFieldOpen} onOpenChange={setIsCreateFieldOpen}>
          <DialogTrigger asChild>
            <Button style={{ backgroundColor: '#0000db' }} className="text-white">
              <Plus className="w-4 h-4 mr-2" />
              Registrar Cancha
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
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
                  <label className="block mb-2">Dirección</label>
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
                  <label className="block mb-2">Estado</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="disponible">Disponible</SelectItem>
                      <SelectItem value="mantenimiento">En Mantenimiento</SelectItem>
                      <SelectItem value="no-disponible">No Disponible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="block mb-2">Instalaciones Disponibles</label>
                <div className="grid grid-cols-2 gap-2">
                  {["Vestuarios", "Iluminación", "Tribunas", "Estacionamiento", "Cafetería", "Enfermería"].map((facility) => (
                    <div key={facility} className="flex items-center space-x-2">
                      <input type="checkbox" id={facility} />
                      <label htmlFor={facility} className="text-sm">{facility}</label>
                    </div>
                  ))}
                </div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fields.map((field) => (
          <Card key={field.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{field.name}</CardTitle>
                <Badge className={field.available ? 'bg-green-500' : 'bg-red-500'}>
                  {field.available ? 'Disponible' : 'No Disponible'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start">
                  <MapPin className="w-4 h-4 mr-2 mt-1 text-gray-500" />
                  <p className="text-sm text-gray-600">{field.address}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Capacidad:</span>
                    <p>{field.capacity.toLocaleString()} personas</p>
                  </div>
                  <div>
                    <span className="font-medium">Superficie:</span>
                    <p>{field.fieldType}</p>
                  </div>
                </div>
                
                <div>
                  <span className="font-medium text-sm">Instalaciones:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {field.facilities.map((facility, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {facility}
                      </Badge>
                    ))}
                  </div>
                </div>
                
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
                    <Trash2 className="w-4 h-4 mr-1" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Field Dialog */}
      <Dialog open={isEditFieldOpen} onOpenChange={setIsEditFieldOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Cancha: {selectedField?.name}</DialogTitle>
          </DialogHeader>
          {selectedField && (
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2">Nombre de la Cancha</label>
                  <Input defaultValue={selectedField.name} />
                </div>
                <div>
                  <label className="block mb-2">Capacidad</label>
                  <Input type="number" defaultValue={selectedField.capacity} />
                </div>
                <div className="col-span-2">
                  <label className="block mb-2">Dirección</label>
                  <Input defaultValue={selectedField.address} />
                </div>
                <div>
                  <label className="block mb-2">Estado</label>
                  <Select defaultValue={selectedField.available ? "disponible" : "no-disponible"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="disponible">Disponible</SelectItem>
                      <SelectItem value="mantenimiento">En Mantenimiento</SelectItem>
                      <SelectItem value="no-disponible">No Disponible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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