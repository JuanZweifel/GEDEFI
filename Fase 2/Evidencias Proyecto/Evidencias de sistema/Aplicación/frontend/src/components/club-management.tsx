import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft, Users, Trophy, UserPlus, Plus, Eye, Crown, Star } from 'lucide-react';

interface ClubManagementProps {
  onBack: () => void;
}

export const ClubManagement: React.FC<ClubManagementProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);
  const [isAddSeriesOpen, setIsAddSeriesOpen] = useState(false);

  const clubData = {
    id: 1,
    name: "FC Barcelona Santiago",
    founded: "1995-03-15",
    monthlyFeeActive: true,
    association: "Asociación Metropolitana"
  };

  const boardMembers = [
    { name: "Roberto Silva", position: "Presidente", email: "roberto.silva@fcbarcelona.cl", phone: "+56 9 1234 5678" },
    { name: "Carmen López", position: "Vicepresidente", email: "carmen.lopez@fcbarcelona.cl", phone: "+56 9 8765 4321" },
    { name: "Luis Martín", position: "Tesorero", email: "luis.martin@fcbarcelona.cl", phone: "+56 9 5555 1234" },
    { name: "Ana Torres", position: "Secretario", email: "ana.torres@fcbarcelona.cl", phone: "+56 9 9999 5678" }
  ];

  const registeredSeries = [
    { id: 1, name: "Serie A Masculina", active: true, players: 25, matches: 16 },
    { id: 2, name: "Serie B Femenina", active: true, players: 22, matches: 14 },
    { id: 3, name: "Serie Juvenil", active: false, players: 18, matches: 12 }
  ];

  const clubPlayers = [
    { rut: "12345678-9", name: "Carlos Rodríguez", position: "Delantero", series: "Serie A Masculina", status: "Activo" },
    { rut: "98765432-1", name: "María Fernández", position: "Defensa", series: "Serie B Femenina", status: "Activo" },
    { rut: "11111111-1", name: "Pedro González", position: "Portero", series: "Serie A Masculina", status: "Lesionado" },
    { rut: "22222222-2", name: "Sofía Herrera", position: "Mediocampo", series: "Serie B Femenina", status: "Activo" },
    { rut: "33333333-3", name: "Diego Morales", position: "Delantero", series: "Serie Juvenil", status: "Suspendido" }
  ];

  const availablePlayers = [
    { rut: "44444444-4", name: "Juan Pérez", position: "Defensa" },
    { rut: "55555555-5", name: "Laura Jiménez", position: "Mediocampo" },
    { rut: "66666666-6", name: "Miguel Santos", position: "Delantero" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Activo': return 'bg-green-500';
      case 'Lesionado': return 'bg-yellow-500';
      case 'Suspendido': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div>
            <h2>{clubData.name}</h2>
            <p className="text-sm text-gray-600">Gestión completa del club</p>
          </div>
        </div>
        <Badge style={{ backgroundColor: '#0000db' }} className="text-white">
          Club Activo
        </Badge>
      </div>

      {/* Club Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Crown className="w-8 h-8 mx-auto text-[#0000db] mb-2" />
            <div className="text-2xl font-bold">{boardMembers.length}</div>
            <p className="text-sm text-gray-600">Miembros Directorio</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Trophy className="w-8 h-8 mx-auto text-[#FF8C00] mb-2" />
            <div className="text-2xl font-bold">{registeredSeries.length}</div>
            <p className="text-sm text-gray-600">Series Registradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 mx-auto text-green-500 mb-2" />
            <div className="text-2xl font-bold">{clubPlayers.length}</div>
            <p className="text-sm text-gray-600">Jugadores Registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Star className="w-8 h-8 mx-auto text-purple-500 mb-2" />
            <div className="text-2xl font-bold">{clubPlayers.filter(p => p.status === 'Activo').length}</div>
            <p className="text-sm text-gray-600">Jugadores Activos</p>
          </CardContent>
        </Card>
      </div>

      {/* Club Details Tabs */}
      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Información General</TabsTrigger>
              <TabsTrigger value="board">Directorio</TabsTrigger>
              <TabsTrigger value="series">Series</TabsTrigger>
              <TabsTrigger value="players">Jugadores</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-4">Datos del Club</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Nombre del Club</label>
                      <p className="font-medium">{clubData.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Fecha de Fundación</label>
                      <p className="font-medium">{clubData.founded}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Asociación</label>
                      <p className="font-medium">{clubData.association}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Mensualidad Activa</label>
                      <Badge className={clubData.monthlyFeeActive ? 'bg-green-500' : 'bg-red-500'}>
                        {clubData.monthlyFeeActive ? 'Sí' : 'No'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-4">Estadísticas Rápidas</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Series Activas</span>
                      <span className="font-medium">{registeredSeries.filter(s => s.active).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Jugadores</span>
                      <span className="font-medium">{clubPlayers.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Jugadores Activos</span>
                      <span className="font-medium">{clubPlayers.filter(p => p.status === 'Activo').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Partidos Totales</span>
                      <span className="font-medium">{registeredSeries.reduce((acc, s) => acc + s.matches, 0)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="board" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Miembros del Directorio</h3>
                <Button style={{ backgroundColor: '#0000db' }} className="text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Miembro
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {boardMembers.map((member, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{member.name}</h4>
                          <Badge variant="outline" className="mt-1">
                            {member.position}
                          </Badge>
                          <div className="mt-3 space-y-1 text-sm text-gray-600">
                            <p>{member.email}</p>
                            <p>{member.phone}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="series" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Series Registradas</h3>
                <Dialog open={isAddSeriesOpen} onOpenChange={setIsAddSeriesOpen}>
                  <DialogTrigger asChild>
                    <Button style={{ backgroundColor: '#0000db' }} className="text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Registrar Nueva Serie
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Registrar Nueva Serie</DialogTitle>
                    </DialogHeader>
                    <form className="space-y-4">
                      <div>
                        <label className="block mb-2">Nombre de la Serie</label>
                        <Input placeholder="Ej: Serie A Masculina 2024" />
                      </div>
                      <div>
                        <label className="block mb-2">Categoría</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione categoría" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="serie-a">Serie A</SelectItem>
                            <SelectItem value="serie-b">Serie B</SelectItem>
                            <SelectItem value="serie-c">Serie C</SelectItem>
                            <SelectItem value="juvenil">Juvenil</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block mb-2">Género</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione género" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="masculino">Masculino</SelectItem>
                            <SelectItem value="femenino">Femenino</SelectItem>
                            <SelectItem value="mixto">Mixto</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsAddSeriesOpen(false)}>
                          Cancelar
                        </Button>
                        <Button style={{ backgroundColor: '#0000db' }} className="text-white">
                          Registrar Serie
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Jugadores</TableHead>
                    <TableHead>Partidos</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registeredSeries.map((series) => (
                    <TableRow key={series.id}>
                      <TableCell className="font-medium">{series.name}</TableCell>
                      <TableCell>
                        <Badge className={series.active ? 'bg-green-500' : 'bg-gray-500'}>
                          {series.active ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </TableCell>
                      <TableCell>{series.players}</TableCell>
                      <TableCell>{series.matches}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          Ver Detalles
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="players" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Jugadores del Club</h3>
                <Dialog open={isAddPlayerOpen} onOpenChange={setIsAddPlayerOpen}>
                  <DialogTrigger asChild>
                    <Button style={{ backgroundColor: '#0000db' }} className="text-white">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Registrar Jugador
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Registrar Nuevo Jugador</DialogTitle>
                    </DialogHeader>
                    <form className="space-y-4">
                      <div>
                        <label className="block mb-2">Seleccionar Jugador</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione un jugador disponible" />
                          </SelectTrigger>
                          <SelectContent>
                            {availablePlayers.map((player) => (
                              <SelectItem key={player.rut} value={player.rut}>
                                {player.name} - {player.position}
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
                            {registeredSeries.filter(s => s.active).map((series) => (
                              <SelectItem key={series.id} value={series.id.toString()}>
                                {series.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsAddPlayerOpen(false)}>
                          Cancelar
                        </Button>
                        <Button style={{ backgroundColor: '#0000db' }} className="text-white">
                          Registrar
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>RUT</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Posición</TableHead>
                    <TableHead>Serie</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clubPlayers.map((player) => (
                    <TableRow key={player.rut}>
                      <TableCell className="font-medium">{player.rut}</TableCell>
                      <TableCell>{player.name}</TableCell>
                      <TableCell>{player.position}</TableCell>
                      <TableCell>{player.series}</TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(player.status)} text-white`}>
                          {player.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          Ver Ficha
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};