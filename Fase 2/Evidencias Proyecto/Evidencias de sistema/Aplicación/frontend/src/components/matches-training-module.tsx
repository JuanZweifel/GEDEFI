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
import { 
  Plus, Edit, Eye, Trophy, Activity, Clock, MapPin, Target, 
  Users, Calendar, Star, TrendingUp, BarChart3, History, CheckCircle
} from 'lucide-react';

// Enhanced Matches & Training Module (PARTIDO, ENTRENAMIENTO, RENDIMIENTO_PARTIDO, RENDIMIENTO_ENTRENAMIENTO)
export const MatchesTrainingModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState('matches');
  const [selectedMatch, setSelectedMatch] = useState<any>(null);

  const matches = [
    {
      id: 1, fecha_partido: "2024-09-22", hora_partido: "15:00", id_serie: 1, serie_nombre: "Serie A Masculina",
      id_club_local: 1, club_local: "FC Barcelona Santiago", id_club_visitante: 2, club_visitante: "Real Madrid Chile",
      goles_local: 2, goles_visitante: 1, id_cancha: 1, cancha_nombre: "Estadio Nacional",
      estado: "Finalizado", id_arbitro: 1, arbitro_nombre: "Carlos Mendoza", observaciones: "Partido intenso con buen nivel"
    },
    {
      id: 2, fecha_partido: "2024-09-25", hora_partido: "17:00", id_serie: 1, serie_nombre: "Serie A Masculina",
      id_club_local: 3, club_local: "Universidad Chile", id_club_visitante: 4, club_visitante: "Colo-Colo",
      goles_local: null, goles_visitante: null, id_cancha: 2, cancha_nombre: "Santa Laura",
      estado: "Programado", id_arbitro: 2, arbitro_nombre: "Ana Silva", observaciones: null
    }
  ];

  const trainings = [
    {
      id: 1, fecha_entrenamiento: "2024-09-20", hora_inicio: "18:00", hora_fin: "20:00",
      id_club: 1, club_nombre: "FC Barcelona Santiago", id_cancha: 3, cancha_nombre: "Campo de Entrenamiento",
      id_entrenador: 1, entrenador_nombre: "Diego López", tipo_entrenamiento: "Técnico",
      objetivos: "Mejorar precisión en pases cortos", participantes: 22, observaciones: "Excelente sesión"
    },
    {
      id: 2, fecha_entrenamiento: "2024-09-21", hora_inicio: "16:00", hora_fin: "18:00",
      id_club: 2, club_nombre: "Real Madrid Chile", id_cancha: 4, cancha_nombre: "Cancha Sintética Norte",
      id_entrenador: 2, entrenador_nombre: "Roberto Fernández", tipo_entrenamiento: "Físico",
      objetivos: "Resistencia cardiovascular", participantes: 18, observaciones: "Intensidad alta"
    }
  ];

  const matchPerformance = [
    {
      id: 1, id_partido: 1, rut_jugador: "12345678-9", jugador_nombre: "Carlos Rodríguez",
      goles: 1, asistencias: 1, tarjetas_amarillas: 0, tarjetas_rojas: 0,
      minutos_jugados: 90, calificacion: 8.5, observaciones: "Excelente partido"
    },
    {
      id: 2, id_partido: 1, rut_jugador: "98765432-1", jugador_nombre: "Miguel Santos",
      goles: 1, asistencias: 0, tarjetas_amarillas: 1, tarjetas_rojas: 0,
      minutos_jugados: 85, calificacion: 7.2, observaciones: "Buen rendimiento general"
    }
  ];

  const trainingPerformance = [
    {
      id: 1, id_entrenamiento: 1, rut_jugador: "12345678-9", jugador_nombre: "Carlos Rodríguez",
      asistencia: true, calificacion_tecnica: 9.0, calificacion_fisica: 8.5,
      observaciones: "Liderazgo en ejercicios técnicos"
    },
    {
      id: 2, id_entrenamiento: 1, rut_jugador: "98765432-1", jugador_nombre: "Miguel Santos",
      asistencia: true, calificacion_tecnica: 7.5, calificacion_fisica: 9.0,
      observaciones: "Destacó en preparación física"
    }
  ];

  const matchHistory = [
    { fecha: "2024-09-15", accion: "Partido finalizado", detalle: "Barcelona 2-1 Real Madrid, actualizado resultado" },
    { fecha: "2024-09-10", accion: "Partido programado", detalle: "Universidad vs Colo-Colo para el 25/09" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2>Gestión de Partidos y Entrenamientos</h2>
        <div className="flex space-x-2">
          <Button style={{ backgroundColor: '#0000db' }} className="text-white">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Partido
          </Button>
          <Button variant="outline" style={{ borderColor: '#0000db', color: '#0000db' }}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Entrenamiento
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="matches">Partidos (PARTIDO)</TabsTrigger>
          <TabsTrigger value="trainings">Entrenamientos</TabsTrigger>
          <TabsTrigger value="match-performance">Rendimiento Partidos</TabsTrigger>
          <TabsTrigger value="training-performance">Rendimiento Entrenamientos</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="matches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Partidos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha/Hora</TableHead>
                    <TableHead>Serie</TableHead>
                    <TableHead>Partido</TableHead>
                    <TableHead>Resultado</TableHead>
                    <TableHead>Cancha</TableHead>
                    <TableHead>Árbitro</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matches.map((match) => (
                    <TableRow key={match.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {match.fecha_partido} {match.hora_partido}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{match.serie_nombre}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {match.club_local} vs {match.club_visitante}
                        </div>
                      </TableCell>
                      <TableCell>
                        {match.goles_local !== null ? (
                          <div className="font-bold text-[#0000db]">
                            {match.goles_local} - {match.goles_visitante}
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {match.cancha_nombre}
                        </div>
                      </TableCell>
                      <TableCell>{match.arbitro_nombre}</TableCell>
                      <TableCell>
                        <Badge className={match.estado === 'Finalizado' ? 'bg-green-500' : 'bg-blue-500'}>
                          {match.estado}
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
                          <Button variant="outline" size="sm">
                            <BarChart3 className="w-4 h-4" />
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

        <TabsContent value="trainings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Entrenamientos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha/Horario</TableHead>
                    <TableHead>Club</TableHead>
                    <TableHead>Entrenador</TableHead>
                    <TableHead>Cancha</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Participantes</TableHead>
                    <TableHead>Objetivos</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trainings.map((training) => (
                    <TableRow key={training.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {training.fecha_entrenamiento}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {training.hora_inicio} - {training.hora_fin}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{training.club_nombre}</TableCell>
                      <TableCell>{training.entrenador_nombre}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {training.cancha_nombre}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{training.tipo_entrenamiento}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {training.participantes}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{training.objetivos}</TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Target className="w-4 h-4" />
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

        <TabsContent value="match-performance" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Rendimiento en Partidos (RENDIMIENTO_PARTIDO)</CardTitle>
                <div className="flex space-x-2">
                  <Select>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Seleccionar partido" />
                    </SelectTrigger>
                    <SelectContent>
                      {matches.filter(m => m.estado === 'Finalizado').map((match) => (
                        <SelectItem key={match.id} value={match.id.toString()}>
                          {match.club_local} vs {match.club_visitante} ({match.fecha_partido})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Jugador</TableHead>
                    <TableHead>Goles</TableHead>
                    <TableHead>Asistencias</TableHead>
                    <TableHead>Tarjetas</TableHead>
                    <TableHead>Minutos</TableHead>
                    <TableHead>Calificación</TableHead>
                    <TableHead>Observaciones</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matchPerformance.map((performance) => (
                    <TableRow key={performance.id}>
                      <TableCell className="font-medium">{performance.jugador_nombre}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Trophy className="w-4 h-4 mr-1 text-[#FF8C00]" />
                          {performance.goles}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Target className="w-4 h-4 mr-1 text-blue-500" />
                          {performance.asistencias}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          {performance.tarjetas_amarillas > 0 && (
                            <Badge className="bg-yellow-500">{performance.tarjetas_amarillas}A</Badge>
                          )}
                          {performance.tarjetas_rojas > 0 && (
                            <Badge className="bg-red-500">{performance.tarjetas_rojas}R</Badge>
                          )}
                          {performance.tarjetas_amarillas === 0 && performance.tarjetas_rojas === 0 && (
                            <span className="text-gray-500">-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {performance.minutos_jugados}'
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-1 text-[#FFD700]" />
                          <span className="font-medium">{performance.calificacion}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{performance.observaciones}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training-performance" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Rendimiento en Entrenamientos (RENDIMIENTO_ENTRENAMIENTO)</CardTitle>
                <div className="flex space-x-2">
                  <Select>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Seleccionar entrenamiento" />
                    </SelectTrigger>
                    <SelectContent>
                      {trainings.map((training) => (
                        <SelectItem key={training.id} value={training.id.toString()}>
                          {training.club_nombre} - {training.fecha_entrenamiento}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Jugador</TableHead>
                    <TableHead>Asistencia</TableHead>
                    <TableHead>Calificación Técnica</TableHead>
                    <TableHead>Calificación Física</TableHead>
                    <TableHead>Promedio</TableHead>
                    <TableHead>Observaciones</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trainingPerformance.map((performance) => (
                    <TableRow key={performance.id}>
                      <TableCell className="font-medium">{performance.jugador_nombre}</TableCell>
                      <TableCell>
                        {performance.asistencia ? (
                          <Badge className="bg-green-500">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Presente
                          </Badge>
                        ) : (
                          <Badge className="bg-red-500">Ausente</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-1 text-blue-500" />
                          <span className="font-medium">{performance.calificacion_tecnica}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Activity className="w-4 h-4 mr-1 text-green-500" />
                          <span className="font-medium">{performance.calificacion_fisica}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <TrendingUp className="w-4 h-4 mr-1 text-[#0000db]" />
                          <span className="font-medium">
                            {((performance.calificacion_tecnica + performance.calificacion_fisica) / 2).toFixed(1)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{performance.observaciones}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
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
              <CardTitle>Historial de Partidos y Entrenamientos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Acción</TableHead>
                    <TableHead>Detalle</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matchHistory.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell>{item.fecha}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.accion}</Badge>
                      </TableCell>
                      <TableCell>{item.detalle}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};