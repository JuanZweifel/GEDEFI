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
import { Calendar } from '../components/ui/calendar';
import {
  Plus, AlertTriangle, Calendar as CalendarIcon, MapPin, Clock,
  Edit, Trash2, CheckCircle, XCircle, Search, Filter
} from 'lucide-react';

export const CalendarioModule: React.FC = () => {
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
