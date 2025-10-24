import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar, Clock, MapPin, Trophy, Target, Users, Star, Activity, TrendingUp, BarChart3, CheckCircle, Edit, Eye, Plus } from 'lucide-react';
import { getEntrenamientos } from '../services/entrenamientoServices';
import { useAuth } from "../contexts/authContext";
import { toast } from 'sonner';
import { getSeries } from "../services/serieService";
import { getClubs } from '../services/clubServices';
import { getUsers } from '../services/usuarioService';
import { getCanchas } from '../services/canchaService';
import { DialogEditEntrenamiento, DialogViewEntrenamiento, ButtonDeleteEntrenamiento, DialogAddEntrenamiento } from '../forms/entrenamiento-form';
import { getRendimientosEntrenamiento } from '../services/rendimientoEntrenamientoService';
import { getFichasPorFiltro } from '../services/fichaJugadorService';

interface Match {
  id: number;
  fecha_partido: string;
  hora_partido: string;
  serie_nombre: string;
  club_local: string;
  club_visitante: string;
  goles_local: number | null;
  goles_visitante: number | null;
  cancha_nombre: string;
  estado: string;
  arbitro_nombre: string;
}

interface Training {
  id: number;
  id_entrenamiento: number;
  fecha_entrenamiento: string;
  hora_inicio: string;
  hora_fin: string;
  club_nombre: string;
  entrenador_nombre: string;
  tipo_entrenamiento: string;
  objetivos: string;
  participantes: number;
  cancha_nombre: string;
  id_serie: number;
  nombre_serie: string;
  rut_usuario: string;
  id_cancha: number;
  descripcion_entrenamiento: string;
  activo: boolean;
}

interface MatchPerformance {
  id: number;
  id_partido: number;
  jugador_nombre: string;
  goles: number;
  asistencias: number;
  tarjetas_amarillas: number;
  tarjetas_rojas: number;
  minutos_jugados: number;
  calificacion: number;
  observaciones: string;
}

interface TrainingPerformance {
  id_: number;
  id_entrenamiento: number;
  jugador_nombre: string;
  asistencia: boolean;
  calificacion_tecnica: number;
  calificacion_fisica: number;
  observaciones: string;
  rut_jugador: string;
}

interface HistoryItem {
  fecha: string;
  accion: string;
  detalle: string;
}

interface MatchesTrainingModuleProps {
  matches?: Match[];
  trainings?: Training[];
  matchPerformance?: MatchPerformance[];
  trainingPerformance?: TrainingPerformance[];
  matchHistory?: HistoryItem[];
}



export const MatchesTrainingModule: React.FC<MatchesTrainingModuleProps> = ({
  matches = [],
  trainings = [],
  matchPerformance = [],
  trainingPerformance = [],
  matchHistory = [],
}) => {
  const [activeTab, setActiveTab] = useState("matches");
  const [trainingsFromDB, setTrainingsFromDB] = useState<Training[]>([]);
  const [series, setSeries] = useState<{ id_serie: number; nombre_serie: string; id_club: number }[]>([]);
  const [clubs, setClubs] = useState<{ id_club: number; nombre_club: string }[]>([]);
  const [users, setUsers] = useState<{ rut_usuario: string; nombre_usuario: string; apellido_usuario: string }[]>([]);
  const [canchas, setCanchas] = useState<{ id_cancha: number; nombre_cancha: string }[]>([]);
  const [trainingPerformanceFromDB, setTrainingPerformanceFromDB] = useState<TrainingPerformance[]>([]);
  const [selectedTrainingId, setSelectedTrainingId] = useState<number | null>(null);

  const { token } = useAuth();

  // ✅ 1. Definir la función de carga de datos
  const fetchData = async () => {
    if (!token) return;

    try {
      // 🔹 Obtener rendimientos
      const rendimientosEntrenamientos = await getRendimientosEntrenamiento<TrainingPerformance[]>(token);
      setTrainingPerformanceFromDB(rendimientosEntrenamientos);

      // 🔹 Obtener entrenamientos y tablas relacionadas
      const [entrenamientos, seriesData, clubsData, usersData, canchasData, fichasData] = await Promise.all([
        getEntrenamientos<Training[]>(token),
        getSeries<{ id_serie: number; nombre_serie: string; id_club: number }[]>(token),
        getClubs<{ id_club: number; nombre_club: string }[]>(token),
        getUsers<{ rut_usuario: string; nombre_usuario: string; apellido_usuario: string }[]>(token),
        getCanchas<{ id_cancha: number; nombre_cancha: string }[]>(token),
        getFichasPorFiltro<any[]>(token), // 👈 aquí traemos las fichas (jugadores de series)
      ]);

      console.log(entrenamientos)

      // 🔹 Fusionar datos
      const merged = entrenamientos.map((t: any) => {
        const serie = seriesData.find((s: any) => s.id_serie === t.id_serie);
        const club = clubsData.find((c: any) => c.id_club === serie?.id_club);

        const normalizeRut = (rut: string) => rut?.replace(/\D/g, "");
        const usuario = usersData.find(
          (u: any) => normalizeRut(u.rut_usuario || (u as any).rut) === normalizeRut(t.rut_usuario)
        );
        const cancha = canchasData.find((c: any) => c.id_cancha === t.id_cancha);

        // ✅ Contar jugadores de la serie
        const jugadoresDeSerie = fichasData.filter((f: any) => f.id_serie === t.id_serie);
        const totalJugadores = jugadoresDeSerie.length;

        return {
          ...t,
          nombre_serie: serie?.nombre_serie || "Sin serie",
          club_nombre: club?.nombre_club || "Sin club",
          entrenador_nombre: usuario
            ? `${usuario.nombre_usuario} ${usuario.apellido_usuario}`
            : "Sin asignar",
          cancha_nombre: cancha?.nombre_cancha || "Sin cancha",
          participantes: totalJugadores, // 👈 nuevo campo con el total
        };
      });

      // 🔹 Guardar en estado
      setTrainingsFromDB(merged);
      setSeries(seriesData);
      setClubs(clubsData);
      setUsers(usersData);
      setCanchas(canchasData);
    } catch (error) {
      console.error("❌ Error general al cargar datos:", error);
      toast.error("No se pudieron cargar los entrenamientos");
    }
  };

  // ✅ 2. Ejecutar la carga al montar el componente
  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2>Gestión de Partidos y Entrenamientos</h2>
        <div className="flex space-x-2">
          <Button className="bg-blue-700 text-white flex items-center">
            <Plus className="w-4 h-4 mr-1" /> Nuevo Partido
          </Button>
          <DialogAddEntrenamiento refreshEntrenamientos={fetchData} />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="matches">Partidos</TabsTrigger>
          <TabsTrigger value="trainings">Entrenamientos</TabsTrigger>
          <TabsTrigger value="match-performance">Rendimiento Partidos</TabsTrigger>
          <TabsTrigger value="training-performance">Rendimiento Entrenamientos</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        {/* TAB PARTIDOS */}
        <TabsContent value="matches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Partidos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    {['Fecha/Hora', 'Serie', 'Partido', 'Resultado', 'Cancha', 'Árbitro', 'Estado', 'Acciones'].map((h, i) => (
                      <TableHead key={i}>{h}</TableHead>
                    ))}
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
                      <TableCell>{match.club_local} vs {match.club_visitante}</TableCell>
                      <TableCell>
                        {match.goles_local !== null ? `${match.goles_local} - ${match.goles_visitante}` : <span className="text-gray-500">-</span>}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {match.cancha_nombre}
                        </div>
                      </TableCell>
                      <TableCell>{match.arbitro_nombre}</TableCell>
                      <TableCell>{renderBadge(match.estado)}</TableCell>
                      <TableCell className="flex space-x-1">
                        <Button variant="outline" size="sm"><Eye className="w-4 h-4" /></Button>
                        <Button variant="outline" size="sm"><Edit className="w-4 h-4" /></Button>
                        <Button variant="outline" size="sm"><BarChart3 className="w-4 h-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB ENTRENAMIENTOS */}
        <TabsContent value="trainings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Entrenamientos</CardTitle>
            </CardHeader>

            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    {[
                      "Fecha/Horario",
                      "Club",
                      "Serie",
                      "Entrenador",
                      "Cancha",
                      "Participantes",
                      "Acciones",
                    ].map((header, i) => (
                      <TableHead key={i}>{header}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {trainingsFromDB.length > 0 ? (
                    trainingsFromDB.map((training) => (
                      <TableRow key={training.id_entrenamiento || training.id}>
                        {/* 📅 Fecha y horario */}
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {training.fecha_entrenamiento || "—"}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {training.hora_inicio || "-"} - {training.hora_fin || "-"}
                            </div>
                          </div>
                        </TableCell>

                        {/* 🏟️ Club */}
                        <TableCell>{training.club_nombre || "Sin club"}</TableCell>

                        {/* 🏅 Serie */}
                        <TableCell>{training.nombre_serie || "Sin serie"}</TableCell>

                        {/* 🧑‍🏫 Entrenador */}
                        <TableCell>{training.entrenador_nombre || "Sin asignar"}</TableCell>

                        {/* 📍 Cancha */}
                        <TableCell>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {training.cancha_nombre || "Sin cancha"}
                          </div>
                        </TableCell>

                        {/* 👥 Participantes */}
                        <TableCell>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {training.participantes ?? 0}
                          </div>
                        </TableCell>

                        {/* ⚙️ Acciones */}
                        <TableCell>
                          <div className="flex space-x-1">
                            <DialogViewEntrenamiento key={training.id_entrenamiento} entrenamiento={training} />




                            <DialogEditEntrenamiento
                              entrenamiento={training}
                              refreshEntrenamientos={fetchData}
                            />


                            <ButtonDeleteEntrenamiento id_entrenamiento={training.id_entrenamiento}
                              descripcion={training.descripcion_entrenamiento}
                              refreshEntrenamientos={fetchData}
                            />


                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-gray-500 py-6">
                        No hay entrenamientos registrados.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB RENDIMIENTO PARTIDOS */}
        <TabsContent value="match-performance" className="space-y-4">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle>Rendimiento en Partidos</CardTitle>
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
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    {['Jugador', 'Goles', 'Asistencias', 'Tarjetas', 'Minutos', 'Calificación', 'Observaciones', 'Acciones'].map((h, i) => (
                      <TableHead key={i}>{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matchPerformance.map((perf) => (
                    <TableRow key={perf.id}>
                      <TableCell>{perf.jugador_nombre}</TableCell>
                      <TableCell className="flex items-center"><Trophy className="w-4 h-4 mr-1 text-[#FF8C00]" />{perf.goles}</TableCell>
                      <TableCell className="flex items-center"><Target className="w-4 h-4 mr-1 text-blue-500" />{perf.asistencias}</TableCell>
                      <TableCell className="flex space-x-1">
                        {perf.tarjetas_amarillas > 0 && <Badge className="bg-yellow-500">{perf.tarjetas_amarillas}A</Badge>}
                        {perf.tarjetas_rojas > 0 && <Badge className="bg-red-500">{perf.tarjetas_rojas}R</Badge>}
                        {perf.tarjetas_amarillas === 0 && perf.tarjetas_rojas === 0 && <span className="text-gray-500">-</span>}
                      </TableCell>
                      <TableCell className="flex items-center"><Clock className="w-4 h-4 mr-1" />{perf.minutos_jugados}'</TableCell>
                      <TableCell className="flex items-center"><Star className="w-4 h-4 mr-1 text-[#FFD700]" />{perf.calificacion}</TableCell>
                      <TableCell className="max-w-xs truncate">{perf.observaciones}</TableCell>
                      <TableCell><Button variant="outline" size="sm"><Edit className="w-4 h-4" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB RENDIMIENTO ENTRENAMIENTOS */}
        <TabsContent value="training-performance" className="space-y-4">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle>Rendimiento en Entrenamientos</CardTitle>

              {/* 🔹 Select para filtrar por entrenamiento (opcional) */}
              <Select onValueChange={(v: any) => setSelectedTrainingId(Number(v))}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Seleccionar entrenamiento" />
                </SelectTrigger>
                <SelectContent>
                  {trainingsFromDB.map((t) => (
                    <SelectItem key={t.id_entrenamiento} value={t.id_entrenamiento.toString()}>
                      {t.club_nombre} - {t.fecha_entrenamiento}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardHeader>

            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    {[
                      "Jugador",
                      "Asistencia",
                      "Calificación Técnica",
                      "Calificación Física",
                      "Promedio",
                      "Observaciones",
                      "Acciones",
                    ].map((h, i) => (
                      <TableHead key={i}>{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {/* 🔹 Filtramos si el usuario seleccionó un entrenamiento */}
                  {(selectedTrainingId
                    ? trainingPerformanceFromDB.filter(
                      (perf) => perf.id_entrenamiento === selectedTrainingId
                    )
                    : trainingPerformanceFromDB
                  ).map((perf) => (
                    <TableRow key={perf.id_entrenamiento}>
                      <TableCell>{perf.jugador_nombre || perf.rut_jugador}</TableCell>

                      <TableCell>
                        {perf.asistencia ? (
                          <Badge className="bg-green-500 flex items-center">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Presente
                          </Badge>
                        ) : (
                          <Badge className="bg-red-500">Ausente</Badge>
                        )}
                      </TableCell>

                      <TableCell className="flex items-center">
                        <Star className="w-4 h-4 mr-1 text-blue-500" />
                        {perf.calificacion_tecnica ?? "-"}
                      </TableCell>

                      <TableCell className="flex items-center">
                        <Activity className="w-4 h-4 mr-1 text-green-500" />
                        {perf.calificacion_fisica ?? "-"}
                      </TableCell>



                      <TableCell className="max-w-xs truncate">
                        {perf.observaciones ?? "-"}
                      </TableCell>

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

        {/* TAB HISTORIAL */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Historial de Partidos y Entrenamientos</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    {['Fecha', 'Acción', 'Detalle'].map((h, i) => <TableHead key={i}>{h}</TableHead>)}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matchHistory.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell>{item.fecha}</TableCell>
                      <TableCell><Badge variant="outline">{item.accion}</Badge></TableCell>
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