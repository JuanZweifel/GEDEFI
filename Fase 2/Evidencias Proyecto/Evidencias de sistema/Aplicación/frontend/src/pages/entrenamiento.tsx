import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Calendar, Clock, MapPin, Users, CheckCircle, Plus } from 'lucide-react';
import { getEntrenamientos } from '../services/entrenamientoServices';
import { useAuth } from "../contexts/authContext";
import { toast } from 'sonner';
import { getSeries } from "../services/serieService";
import { getClub } from '../services/clubServices';
import { getUsers } from '../services/usuarioService';
import { getCanchas } from '../services/canchaService';
import { DialogEditEntrenamiento, DialogViewEntrenamiento, ButtonDeleteEntrenamiento, DialogAddEntrenamiento } from '../forms/entrenamiento-form';
import { getRendimientosEntrenamiento } from '../services/rendimientoEntrenamientoService';
import { getFichasPorFiltro } from '../services/fichaJugadorService';
import { getJugadores } from '../services/jugadoresService';
import { DialogViewRendimientoEntrenamiento, DialogEditRendimientoEntrenamiento } from '../forms/rendimiento-entrenamiento-form';

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
    participantes: number;
    cancha_nombre: string;
    id_serie: number;
    nombre_serie: string;
    rut_usuario: string;
    id_cancha: number;
    descripcion_entrenamiento: string;
    activo: boolean;
    primer_nombre: string;
    segundo_nombre: string;
    primer_apellido: string;
    segundo_apellido: string;
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
    fecha_entrenamiento?: string;
    hora_ini?: string;
    hora_fin?: string;
    id_rendimiento: number;
    segundo_nombre: string;
    segundo_apellido: string;
    frecuencia_cardiaca: number;
    velocidad: number;
    duracion_recorrido: number;
    nivel_oxigeno: number;

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



export const MatchesTrainingModule: React.FC<MatchesTrainingModuleProps> = () => {
    const [activeTab, setActiveTab] = useState("matches");
    const [trainingsFromDB, setTrainingsFromDB] = useState<Training[]>([]);
    const [series, setSeries] = useState<{ id_serie: number; nombre_serie: string; id_club: number }[]>([]);
    const [club, setClub] = useState<{ id_club: number; nombre_club: string } | null>(null);
    const [users, setUsers] = useState<{ rut_usuario: string; nombre_usuario: string; apellido_usuario: string }[]>([]);
    const [canchas, setCanchas] = useState<{ id_cancha: number; nombre_cancha: string }[]>([]);
    const [trainingPerformanceFromDB, setTrainingPerformanceFromDB] = useState<TrainingPerformance[]>([]);
    const [selectedTrainingId, setSelectedTrainingId] = useState<number | null>(null);

    const { id_club, token } = useAuth();

    // enrutamiento react router
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams();

    //Use effect de ruta dashboard
    useEffect(() => {
    const path = location.pathname;

    switch (true) {
        case path === "/dashboard":
        case path === "/dashboard/":
            navigate("/dashboard/entrenamientos", { replace: true });
            setActiveTab("entrenamientos");
            break;

        case path.includes("rendimiento_entrenamiento"):
            setActiveTab("rendimiento_entrenamiento");
            break;

        case path.includes("entrenamientos"):
            setActiveTab("entrenamientos");
            break;

        default:
            navigate("/dashboard/entrenamientos", { replace: true });
            setActiveTab("entrenamientos");
            break;
    }
}, [location.pathname, navigate]);

    const fetchData = async () => {
        if (!token || !id_club) return;

        try {
            const rendimientosEntrenamientos = await getRendimientosEntrenamiento<TrainingPerformance[]>(token);

            const clubId = Number(id_club);

            const [entrenamientos, seriesData, clubsData, usersData, canchasData, fichasData, jugadoresData] =
                await Promise.all([
                    getEntrenamientos<Training[]>(token),
                    getSeries<{ id_serie: number; nombre_serie: string; id_club: number }[]>(token),
                    getClub<{ id_club: number; nombre_club: string }>(clubId, token),
                    getUsers<{ rut_usuario: string; nombre_usuario: string; apellido_usuario: string }[]>(token),
                    getCanchas<{ id_cancha: number; nombre_cancha: string }[]>(token),
                    getFichasPorFiltro<any[]>(token),
                    getJugadores<any[]>(token),
                ]);

            const mergedTrainings = entrenamientos.map((t: any) => {
                const serie = seriesData.find((s: any) => s.id_serie === t.id_serie);
                const cancha = canchasData.find((c: any) => c.id_cancha === t.id_cancha);
                const usuario = usersData.find((u: any) => u.rut_usuario === t.rut_usuario);
                const jugadoresDeSerie = fichasData.filter((f: any) => f.id_serie === t.id_serie);
                const totalJugadores = jugadoresDeSerie.length;

                return {
                    ...t,
                    nombre_serie: serie?.nombre_serie || "Sin serie",
                    club_nombre: clubsData?.nombre_club || "Sin club",
                    entrenador_nombre: usuario
                        ? `${usuario.nombre_usuario} ${usuario.apellido_usuario}`
                        : "Sin asignar",
                    cancha_nombre: cancha?.nombre_cancha || "Sin cancha",
                    participantes: totalJugadores,
                };
            });

            const mergedPerformance = rendimientosEntrenamientos.map((r) => {
                const jugador = jugadoresData.find((j: any) => j.rut_jugador === r.rut_jugador);
                const entrenamiento = entrenamientos.find((t: any) => t.id_entrenamiento === r.id_entrenamiento);

                return {
                    ...r,
                    primer_nombre: jugador?.primer_nombre || "Desconocido",
                    segundo_nombre: jugador?.segundo_nombre || "",
                    primer_apellido: jugador?.primer_apellido || "",
                    segundo_apellido: jugador?.segundo_apellido || "",
                    fecha_entrenamiento: entrenamiento?.fecha_entrenamiento || undefined,
                    hora_ini: entrenamiento?.hora_ini || undefined,
                    hora_fin: entrenamiento?.hora_fin || undefined,
                };
            });

            setTrainingsFromDB(mergedTrainings);
            setTrainingPerformanceFromDB(mergedPerformance);
            setSeries(seriesData);
            setClub(clubsData);
            setUsers(usersData);
            setCanchas(canchasData);
        } catch (error) {
            console.error("❌ Error general al cargar datos:", error);
            toast.error("No se pudieron cargar los entrenamientos");
        }
    };

    // ✅ Ejecutar al montar o si cambia el token o id_club
    useEffect(() => {
        if (token && id_club) {
            console.log("🏟️ ID del club desde contexto:", id_club);
            fetchData();
        }
    }, [token, id_club]);

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
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="entrenamientos" onClick={() => navigate("/dashboard/entrenamientos")}>Entrenamientos</TabsTrigger>
                    <TabsTrigger value="rendimiento_entrenamiento" onClick={() => navigate("/dashboard/entrenamientos/rendimiento_entrenamiento")}>Rendimiento Entrenamientos</TabsTrigger>
                </TabsList>


                {/* TAB ENTRENAMIENTOS */}
                <TabsContent value="entrenamientos" className="space-y-4">
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
                                            "Estado",
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

                                                {/* Estado */}
                                                <TableCell>
                                                    {training.activo ? (
                                                        <Badge className="bg-green-500 flex items-center">
                                                            <CheckCircle className="w-3 h-3 mr-1" />
                                                            Programado
                                                        </Badge>
                                                    ) : (
                                                        <Badge className="bg-red-500">Finalizado</Badge>
                                                    )}
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
                <TabsContent value="rendimiento_entrenamiento" className="space-y-4">
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
                                                <div className="flex space-x-1">
                                                    <DialogViewRendimientoEntrenamiento rendimiento={perf} />
                                                    <DialogEditRendimientoEntrenamiento
                                                        rendimiento={perf}
                                                        refreshRendimientos={fetchData}
                                                    />
                                                </div>
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