import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from 'react-router';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Plus, Calendar, MapPin, BarChart3, Edit, Eye, Trophy, Target, Star, Clock } from "lucide-react";
import { DialogHandle } from '../components/dialog-component';
import { useAuth } from "../contexts/authContext";
import { toast } from "sonner";
import { PartidoForm } from "../forms/partidoForm";
import { type PartidoType, type SerieType, type CanchaType } from "../types";
import { getPartidos } from "../services/partidosService";
import { getSeries } from "../services/jugadoresService";
import { getCanchas } from "../services/canchaService";


export const PartidosModule: React.FC = () => {
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState("matches");
  const [partidos, setPartidos] = useState<PartidoType[]>([]);
  const [selectedPartido, setSelectedPartido] = useState<PartidoType | undefined>();
  const [rendimientoPartido, setRendimientoPartido] = useState<RendimientoPartido[]>([]);
  const [action, setAction] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [series, setSeries] = useState<SerieType[]>([]);
  const [seriesMap, setSeriesMap] = useState<Record<number, SerieType>>({});
  const [canchas, setCanchas] = useState<CanchaType[]>([]);
  const [canchasMap, setCanchasMap] = useState<Record<number, CanchaType>>({});

  const { token, admin } = useAuth();

  // Enrutamiento
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams<{ id_partido?: string }>();
  const idPartido = params.id_partido ? Number(params.id_partido) : undefined;

  const fetchPartidos = async () => {
    if (!token) return;
    try {
      const data = await getPartidos<PartidoType[]>(token);
      setPartidos(data);

    } catch (error) {
      console.error(error);
      toast.error("No se pudieron cargar los datos de partidos");
    } finally {
      setIsFetching(false);
    }
  };

  const fetchSeries = async () => {
    if (!token) return;
    try {
      const data = await getSeries<SerieType[]>(token);
      setSeries(data);

      const map: Record<number, SerieType> = {};
      data.forEach((serie) => {
        map[serie.id_serie] = serie;
      });
      setSeriesMap(map);

    } catch (error) {
      console.error(error);
      toast.error("No se pudieron cargar las series");
    }
  };

  const fetchCanchas = async () => {
    if (!token) return;
    try {
      const data = await getCanchas<CanchaType[]>(token);
      setCanchas(data);

      const map: Record<number, CanchaType> = {};
      data.forEach((cancha) => {
        map[cancha.id_cancha] = cancha;
      });
      setCanchasMap(map);
    } catch (error) {
      console.error(error);
      toast.error("No se pudieron cargar las canchas");
    }
  };

  useEffect(() => {
    const path = location.pathname;

    switch (true) {
      case path.endsWith("/new"):
        setAction("new");
        setIsDialogOpen(true);
        break;

      case path.endsWith("/edit") && !!params.id_partido:
        setAction("edit");
        setIsDialogOpen(true);
        break;

      case !!params.id_partido:
        setAction("view");
        setIsDialogOpen(true);
        break;

      case path === "/dashboard/partidos":
      case path === "/dashboard/partidos/":
        setAction("");
        setIsDialogOpen(false);
        fetchPartidos()
        break;

      default:
        break;
    }
  }, [location.pathname, params.id_partido, admin]);

  useEffect(() => {
    if (!params.id_partido) return;
    if (isFetching) return;
    if (partidos.length === 0) {
      navigate("/dashboard/partidos", { replace: true });
      return;
    }

    const partidoEncontrado = partidos.find(
      (o) => o.id_partido === idPartido
    );

    if (partidoEncontrado) {
      setSelectedPartido(partidoEncontrado);
    } else {
      toast.warning("No se encontro la orden de pago");
      navigate("/dashboard/finanzas", { replace: true });
    }
  }, [params.id_partido, isFetching, partidos, navigate]);

  const handleCloseDialog = (open: boolean) => {
    if (!open) navigate("/dashboard/partidos");
  };

  useEffect(() => {
    if (token) {
      fetchPartidos();
      fetchSeries();
      fetchCanchas();
    }
  }, [token]);

  const renderBadge = (estado: string) => {
    switch (estado) {
      case "Finalizado":
        return <Badge className="bg-green-500">{estado}</Badge>;
      case "Pendiente":
        return <Badge className="bg-yellow-500">{estado}</Badge>;
      default:
        return <Badge>{estado}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2>Gestión de Partidos y Entrenamientos</h2>
        <div className="flex space-x-2">
          <Button style={{ backgroundColor: '#0000db' }} className="text-white" onClick={() => navigate('/dashboard/partidos/new')}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Partido
          </Button>
        </div>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="matches">Partidos</TabsTrigger>
          <TabsTrigger value="match-performance">Rendimiento</TabsTrigger>
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
                    {[
                      "Fecha/Hora",
                      "Serie",
                      "Partido",
                      "Tipo",
                      "Resultado",
                      "Cancha",
                      "Estado",
                      "Acciones"
                    ].map((h, i) => (
                      <TableHead key={i}>{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partidos.map((match: PartidoType) => {
                    const localSerie = seriesMap[match.id_serie_local];
                    const visitaSerie = seriesMap[match.id_serie_visitante];

                    return (
                      <TableRow key={match.id_partido}>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {match.fecha_partido} {match.hora_ini_partido}
                          </div>
                        </TableCell>
                        <TableCell>{localSerie?.nombre_serie ?? "-"}</TableCell>
                        <TableCell>
                          {localSerie?.nombre_club ?? "-"} vs {visitaSerie?.nombre_club ?? "-"}
                        </TableCell>
                        <TableCell>
                          {match.tipo_partido.charAt(0).toUpperCase() + match.tipo_partido.slice(1)}
                        </TableCell>
                        <TableCell>
                          {match.goles_local !== null && match.goles_visita !== null
                            ? `${match.goles_local} - ${match.goles_visita}`
                            : "-"}
                        </TableCell>
                        <TableCell>{canchasMap[match.id_cancha]?.nombre_cancha ?? "-"}</TableCell>
                        <TableCell>{renderBadge(match.estado_partido.charAt(0).toUpperCase() + match.estado_partido.slice(1))}</TableCell>
                        <TableCell className="flex space-x-1">
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate(`/dashboard/partidos/${match.id_partido}`, { replace: true })}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate(`/dashboard/partidos/${match.id_partido}/edit`, { replace: true })}>
                            <Edit className="w-4 h-4 mr-1" />
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

        {/* TAB RENDIMIENTO */}
        <TabsContent value="match-performance" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Rendimiento en Partidos</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    {['Jugador', 'Goles', 'Asistencias', 'Tarjetas', 'Minutos', 'Calificación', 'Observaciones'].map((h, i) => (
                      <TableHead key={i}>{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rendimientoPartido.map((perf) => (
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
                      <TableCell>{perf.observaciones}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {action === "new" && (
        <DialogHandle<PartidoType>
          title="Crear partido"
          trigger={<div />}
          open={isDialogOpen}
          onOpenChange={handleCloseDialog}
        >
          {() => <PartidoForm isEdit={false} onSuccess={handleCloseDialog} />}
        </DialogHandle>
      )}

      {action === "edit" && (
        <DialogHandle<PartidoType>
          title={selectedPartido ? `Modificar partido del ${selectedPartido.fecha_partido}` : "Cargando..."}
          trigger={<div />}
          open={isDialogOpen}
          onOpenChange={handleCloseDialog}
        >
          {() => {
            if (!selectedPartido) {
              return (
                <div className="p-6 flex items-center justify-center">
                  <span>Cargando detalles del partido ...</span>
                </div>
              );
            }

            return <PartidoForm partido={selectedPartido} isEdit={true} onSuccess={handleCloseDialog} />
          }}
        </DialogHandle>
      )}
    </div>
  );
};
