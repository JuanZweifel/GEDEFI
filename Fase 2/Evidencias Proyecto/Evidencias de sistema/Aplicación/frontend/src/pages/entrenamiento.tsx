import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
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
import { getJugadores } from '../services/jugadoresService';
import { DialogViewRendimientoEntrenamiento } from '../forms/rendimiento-entrenamiento-form';

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
    hora_ini: string;
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
    primer_nombre: string;
    primer_apellido: string;
    fecha_entrenamiento: string;
    hora_ini: string;
    hora_fin: string;
    id_rendimiento: number;
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



export const MatchesTrainingModule: React.FC<MatchesTrainingModuleProps> = ({ }) => {
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

            // 🔹 Obtener entrenamientos y tablas relacionadas
            const [entrenamientos, seriesData, clubsData, usersData, canchasData, fichasData, jugadoresData] =
                await Promise.all([
                    getEntrenamientos<Training[]>(token),
                    getSeries<{ id_serie: number; nombre_serie: string; id_club: number }[]>(token),
                    getClubs<{ id_club: number; nombre_club: string }[]>(token),
                    getUsers<{ rut_usuario: string; nombre_usuario: string; apellido_usuario: string }[]>(token),
                    getCanchas<{ id_cancha: number; nombre_cancha: string }[]>(token),
                    getFichasPorFiltro<any[]>(token), // jugadores por serie
                    getJugadores<any[]>(token), // 👈 traemos también todos los jugadores
                ]);

            // 🔹 Fusionar entrenamientos con datos relacionados
            const mergedTrainings = entrenamientos.map((t: any) => {
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
                    participantes: totalJugadores,
                };
            });

            // 🔹 Fusionar rendimientos con datos del jugador
            const mergedPerformance = rendimientosEntrenamientos.map((r) => {
                const jugador = jugadoresData.find((j: any) => j.rut_jugador === r.rut_jugador);
                const entrenamiento = entrenamientos.find((t: any) => t.id_entrenamiento === r.id_entrenamiento);

                return {
                    ...r,
                    primer_nombre: jugador?.primer_nombre || "Desconocido",
                    primer_apellido: jugador?.primer_apellido || "",
                    fecha_entrenamiento: entrenamiento?.fecha_entrenamiento || null,
                    hora_ini: entrenamiento?.hora_ini || null,
                    hora_fin: entrenamiento?.hora_fin || null,
                };
            });

            // 🔹 Guardar en estado
            setTrainingsFromDB(mergedTrainings);
            setTrainingPerformanceFromDB(mergedPerformance);
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
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="trainings">Entrenamientos</TabsTrigger>

                    <TabsTrigger value="training-performance">Rendimiento Entrenamientos</TabsTrigger>
                    <TabsTrigger value="history">Historial</TabsTrigger>
                </TabsList>


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
                                                            {training.fecha_entrenamiento
                                                                ? training.fecha_entrenamiento
                                                                    .split("T")[0]                
                                                                    .split("-")                   
                                                                    .reverse()                    
                                                                    .join("/")                    
                                                                : "—"}
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Clock className="w-4 h-4 mr-1" />
                                                            {training.hora_ini ? training.hora_ini.slice(0, 5) : "-"} - {training.hora_fin ? training.hora_fin.slice(0, 5) : "-"}
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

                {/* TAB RENDIMIENTO ENTRENAMIENTOS */}
                <TabsContent value="training-performance" className="space-y-4">
                    <Card key={selectedTrainingId}>
                        <CardHeader className="flex justify-between items-center">
                            <CardTitle>Rendimiento en Entrenamientos</CardTitle>

                            {/* 🔹 Select para filtrar por entrenamiento */}
                            <Select
                                value={selectedTrainingId?.toString() ?? "0"} // mantiene el valor seleccionado
                                onValueChange={(v: string) => {
                                    const id = Number(v);
                                    setSelectedTrainingId(id === 0 ? null : id); // 0 = mostrar todos
                                }}
                            >
                                <SelectTrigger className="w-64">
                                    <SelectValue placeholder="Seleccionar entrenamiento" />
                                </SelectTrigger>

                                <SelectContent>
                                    {/* 🟢 Opción para mostrar todos */}
                                    <SelectItem value="0">Todos los entrenamientos</SelectItem>

                                    {/* 🟠 Entrenamientos individuales */}
                                    {trainingsFromDB.map((t) => (
                                        <SelectItem key={t.id_entrenamiento} value={t.id_entrenamiento.toString()}>
                                            {t.club_nombre} -{" "}
                                            {t.fecha_entrenamiento
                                                ? new Date(`${t.fecha_entrenamiento}T00:00:00`).toLocaleDateString("es-CL", {
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                    year: "numeric",
                                                })
                                                : "-"}
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
                                            "RUT JUGADOR",
                                            "NOMBRE JUGADOR",
                                            "ASISTENCIA",
                                            "FECHA",
                                            "HORA INICIO",
                                            "HORA FIN",
                                            "OBSERVACIONES",
                                            "ACCIONES",
                                        ].map((h, i) => (
                                            <TableHead key={i}>{h}</TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>

                                <TableBody key={selectedTrainingId}>
                                    {(selectedTrainingId
                                        ? trainingPerformanceFromDB.filter(
                                            (perf) => perf.id_entrenamiento === selectedTrainingId
                                        )
                                        : trainingPerformanceFromDB // 👈 Si es null → muestra todos
                                    ).map((perf) => (
                                        <TableRow key={`${perf.id_entrenamiento}-${perf.rut_jugador}`}>
                                            {/* 🧾 RUT */}
                                            <TableCell className="text text-sm">{perf.rut_jugador}</TableCell>

                                            {/* 👤 Nombre */}
                                            <TableCell className="text">
                                                {perf.primer_nombre && perf.primer_apellido
                                                    ? `${perf.primer_nombre} ${perf.primer_apellido}`
                                                    : "Nombre no disponible"}
                                            </TableCell>

                                            {/* ✅ Asistencia */}
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

                                            {/* 📅 Fecha en formato chileno */}
                                            <TableCell>
                                                {perf.fecha_entrenamiento
                                                    ? new Date(`${perf.fecha_entrenamiento}T00:00:00`).toLocaleDateString("es-CL", {
                                                        day: "2-digit",
                                                        month: "2-digit",
                                                        year: "numeric",
                                                    })
                                                    : "-"}
                                            </TableCell>

                                            {/* 🕒 Hora inicio */}
                                            <TableCell>
                                                {perf.hora_ini ? `${perf.hora_ini.slice(0, 5)} hrs.` : "-"}
                                            </TableCell>

                                            {/* 🕞 Hora fin */}
                                            <TableCell>
                                                {perf.hora_fin ? `${perf.hora_fin.slice(0, 5)} hrs.` : "-"}
                                            </TableCell>

                                            {/* 🗒️ Observaciones */}
                                            <TableCell className="max-w-xs truncate">
                                                {perf.observaciones ?? "-"}
                                            </TableCell>

                                            {/* ⚙️ Acciones */}
                                            <TableCell>
                                                <DialogViewRendimientoEntrenamiento rendimiento={perf} />
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
                                    {/*{matchHistory.map((item, i) => (
                                        <TableRow key={i}>
                                            <TableCell>{item.fecha}</TableCell>
                                            <TableCell><Badge variant="outline">{item.accion}</Badge></TableCell>
                                            <TableCell>{item.detalle}</TableCell>
                                        </TableRow>
                                    ))}*/}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};