import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.tsx';
import { Button } from '../components/ui/button.tsx';
import { Badge } from '../components/ui/badge.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs.tsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table.tsx';
import { Label } from '../components/ui/label.tsx';
import { DialogHandle } from '../components/dialog-component.tsx';
import { Input } from '../components/ui/input.tsx';
import {
    Eye,
    RefreshCcw, FileText
} from 'lucide-react';

import { toast } from 'sonner';
import { type SerieType, type SerieDetailsProps, type JugadorType, type PartidoType } from '../types.tsx';
import { getSeries, updateStateSerie } from '../services/serieService.ts';
import { AlertDialogHandle } from '../components/alert-dialog-component.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { NavLink, useLocation, useNavigate, useParams } from 'react-router';
import { useAuth } from '../contexts/authContext.tsx';
import { Loading } from '../components/loading-bar-component.tsx';
import { getPartidosbySerie } from '../services/partidosService.ts';

export const SerieDetailsContent: React.FC<SerieDetailsProps> = ({ serie }) => {
    const [activeTab, setActiveTab] = useState("jugadores")
    const [jugadores, setJugadores] = useState<JugadorType[]>([])
    const [isLoading, setIsLoading] = useState(0)
    // TODO: Se utilizaran los partidos y entrenamientos cuando esten sus modulos listos
    const [partidos, setPartidos] = useState<PartidoType[]>([])
    const [entrenamientos, setEntrenamientos] = useState([])

    const { token, admin } = useAuth()
    useEffect(() => {
        setJugadores(serie.jugadores)
        fetchPartidos()
        fetchEntrenamientos()
    }, [serie])

    const fetchPartidos = async () => {
        try {
            setIsLoading(40)
            const response = await getPartidosbySerie<PartidoType[]>(token, serie.id_serie)
            setPartidos(response)
            setIsLoading(100)
        } catch (error) {
            toast.info(String(error))
        }
    }
    const fetchEntrenamientos = async () => {
        //logica de entrenamiento
    }
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <Label className="block mb-2">Nombre</Label>
                    <Input value={`${serie.nombre_club} - ${serie.nombre_serie}`} disabled />
                </div>
                <div>
                    <Label className="block mb-2">Fecha fundacion</Label>
                    <Input value={serie.fecha_creacion?.split("T")[0]} disabled />
                </div>
                <div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className='block mb-2'>
                            <Label className="block mb-0">Estado</Label>
                            <Badge className={serie.serie_activa ? 'bg-green-500' : 'bg-gray-500'}>
                                {serie.serie_activa ? 'Activo' : 'Inactivo'}
                            </Badge>
                        </div>
                        <div className='block mb-2'>
                            <Label className="block mb-0">Jugadores</Label>
                            <Badge className={serie.cantidad_jugadores > 0 ? 'bg-blue-500' : 'bg-gray-500'}>
                                {serie.cantidad_jugadores}
                            </Badge>
                        </div>
                        <div className='block mb-2'>
                            <Label className="block mb-0">Partidos jugados</Label>
                            <Badge className={false ? 'bg-green-500' : 'bg-gray-500'}>
                                0
                            </Badge>
                        </div>
                        <div className='block mb-2'>
                            <Label className="block mb-0">Sanciones</Label>
                            <Badge className={false ? 'bg-red-500' : 'bg-gray-500'}>
                                0
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="jugadores">Jugadores</TabsTrigger>
                    <TabsTrigger value="partidos">Partidos</TabsTrigger>
                    <TabsTrigger value="entrenamientos">Entrenamientos</TabsTrigger>
                </TabsList>

                <TabsContent value="jugadores" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className='font-medium'>Usuarios directivos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {serie.cantidad_jugadores > 0 &&
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>RUT</TableHead>
                                            <TableHead>Nombre completo</TableHead>
                                            <TableHead>Genero</TableHead>
                                            <TableHead>Fecha nacimiento</TableHead>
                                            <TableHead>Enfermedades cronicas</TableHead>
                                            <TableHead>Telefono</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead>Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {jugadores.map((j) => (
                                            <TableRow >
                                                <TableCell className="font-medium">{j.rut_jugador}</TableCell>
                                                <TableCell className="font-medium">{j.primer_nombre} {j.segundo_nombre} {j.primer_apellido} {j.segundo_apellido}</TableCell>
                                                <TableCell className="font-medium">{j.genero ? "Masculino" : "Femenino"}</TableCell>
                                                <TableCell className="font-medium">{j.fecha_nacimiento}</TableCell>
                                                <TableCell className="font-medium">{j.enfermedades_cronicas}</TableCell>
                                                <TableCell className="font-medium">{j.fono_jugador}</TableCell>
                                                <TableCell className="font-medium">
                                                    <Badge className={j.jugador_activo ? 'bg-green-500' : 'bg-gray-500'}>
                                                        {j.jugador_activo ? 'Activo' : 'Inactivo'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            }
                            {serie.cantidad_jugadores === 0 &&
                                <div className="text-center py-8 text-gray-500">
                                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>La serie no tiene jugadores inscritos.</p>
                                </div>
                            }
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="partidos" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className='font-medium'>Partidos jugados</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {partidos.length > 0 &&
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Fecha partido</TableHead>
                                            <TableHead>Horario</TableHead>
                                            <TableHead>Club</TableHead>
                                            <TableHead>Serie</TableHead>
                                            <TableHead>Resultado</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead>Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {partidos.map((p) => (
                                            <TableRow >
                                                <TableCell className="font-medium">{p.fecha_partido}</TableCell>
                                                <TableCell className="font-medium">{p.hora_ini_partido} - {p.hora_fin_partido}</TableCell>
                                                <TableCell className="font-medium">{p.club_local} vs {p.club_visitante}</TableCell>
                                                <TableCell className="font-medium">{p.nombre_serie}</TableCell>
                                                <TableCell className="font-medium">{p.goles_local} - {p.goles_visita}</TableCell>
                                                <TableCell className="font-medium">{renderBadge(p.estado_partido)}</TableCell>
                                                <TableCell className="font-medium">
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            }
                            {partidos.length === 0 &&
                                <div className="text-center py-8 text-gray-500">
                                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>La serie no tiene partidos jugados.</p>
                                </div>
                            }
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export const SerieModule: React.FC = () => {
    const [activeTab, setActiveTab] = useState('series');
    const [serieList, setSerieList] = useState<SerieType[]>([]);
    const [isFetching, setIsFetching] = useState(0)
    const [isSelected, setIsSelected] = useState<number | null>(null)
    const [selectedAction, setSelectedAction] = useState<'delete' | 'toggle' | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedEstado, setSelectedEstado] = useState<string | null>("");
    const [page, setPage] = useState(1)
    const [totalPage, setTotalPage] = useState(0)

    // auth
    const { token, logout } = useAuth()

    // logica de router y dialog
    const [selectedSerie, setSelectedSerie] = useState<SerieType | null>(null)
    const [action, setAction] = useState<string>("")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams();

    const handleCloseDialog = (open: boolean) => {
        if (!open) navigate("/dashboard/series");
    };

    // Filtro con debounce de series por estado y nombre
    useEffect(() => {
        const timer = setTimeout(() => {
            const rawTerm = searchTerm.trim();
            const term = rawTerm.toLowerCase();

            if (!term) {
                fetchSeries(false, token, searchTerm, selectedEstado);
                return;
            }

            const cacheToSearch =
                selectedEstado === "1"
                    ? serieList.filter(s => s.serie_activa === true)
                    : selectedEstado === "2"
                        ? serieList.filter(s => s.serie_activa === false)
                        : serieList;

            const foundInCache = cacheToSearch.some(s => {
                const nombre_serie = (s.nombre_serie ?? "").toLowerCase();
                const nombre_club = (s.nombre_club ?? "").toLowerCase();

                return nombre_serie.includes(term) || nombre_club.includes(term);
            });

            if (foundInCache) {
                const filtered = cacheToSearch.filter(s => {
                    const nombre_serie = (s.nombre_serie ?? "").toLowerCase();
                    const nombre_club = (s.nombre_club ?? "").toLowerCase();

                    return nombre_serie.includes(term) || nombre_club.includes(term);
                });
                setSerieList(filtered);
                return;
            }

            fetchSeries(false, token, searchTerm, selectedEstado);

        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, selectedEstado, page]);

    const fetchSeries = async (filter: boolean, token: string | null, searchTerm: string, selectedEstado: string | null) => {
        try {
            setSerieList([])
            if (filter) {
                setIsFetching(40)
            }
            const response = await getSeries<any>(token, searchTerm, selectedEstado, page, 10)
            if (filter) {
                setIsFetching(60)
            }
            let series: SerieType[] = response.items
            setSerieList(series)
            setTotalPage((Math.ceil(response.total / 10)) | 0)
            if (filter) {
                setIsFetching(100)
            }
            if (!filter && series.length === 0) toast.info("No hay series registradas en la base de datos")
        } catch (error) {
            toast.info(String(error))
        }
    }

    useEffect(() => {
        fetchSeries(true, token, "", selectedEstado);
    }, [])

    useEffect(() => {
        switch (true) {
            case !!params.id_serie:
                setAction("view");
                setIsDialogOpen(true);
                break;

            default:
                setAction("");
                setIsDialogOpen(false);;
                break;
        }

    }, [location.pathname, params.id_serie])

    // REVISAR
    useEffect(() => {
        if (!params.id_serie) return; // no hay id
        if (isFetching < 100) return; // todavía cargando
        if (serieList.length === 0) navigate("/dashboard/series", { replace: true });

        const serieEncontrada = serieList.find(
            (s) => s.id_serie === Number(params.id_serie)
        );

        if (serieEncontrada) {
            setSelectedSerie(serieEncontrada);
        } else {
            toast.warning("La serie solicitada no existe.");
            navigate("/dashboard/series", { replace: true });
        }
    }, [params.id_serie, isFetching, serieList]);

    const handleDesactivate = async (id_serie: number) => {
        let data: { message: string }
        try {
            setIsLoading(true)
            const serie = serieList.find(s => s.id_serie === id_serie);
            data = await updateStateSerie(id_serie, token)
            toast.success(data.message)
        } catch (error) {
            toast.warning(String(error))
        } finally {
            setIsSelected(null)
            setSelectedAction(null)
            setIsLoading(false)
            fetchSeries(true, token, searchTerm, selectedEstado);
        }
    }

    const handleRefresh = () => {
        fetchSeries(true, token, "", selectedEstado);
    }
    return (
        <>
            {isFetching < 100 &&
                <Loading isLoading={isFetching} component='Serie' />
            }
            {isFetching === 100 &&
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2>Gestión de Series</h2>
                        <div className="flex space-x-2">
                            {isFetching < 100 &&
                                <Button variant="outline" size="sm" className="flex-1" disabled>
                                    <RefreshCcw className="w-4 h-4 mr-1" />
                                    Recargando...
                                </Button>
                            }

                            {isFetching === 100 && (
                                !isLoading ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={handleRefresh}
                                    >
                                        <RefreshCcw className="w-4 h-4 mr-1" />
                                        Recargar
                                    </Button>
                                ) : (
                                    <Button
                                        disabled
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={handleRefresh}
                                    >
                                        <RefreshCcw className="w-4 h-4 mr-1" />
                                        Recargar
                                    </Button>
                                )
                            )}
                        </div>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Series Registradas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* Filtros */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <Input
                                    type="text"
                                    placeholder="Buscar serie por nombre..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-64"
                                />
                                <Select
                                    value={selectedEstado}
                                    onValueChange={(value: string) => setSelectedEstado(value)}
                                >
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Seleccionar estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0">Todos</SelectItem>
                                        <SelectItem value="1">Activa</SelectItem>
                                        <SelectItem value="2">Inactiva</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {/* Tabla */}
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nombre Serie</TableHead>
                                        <TableHead>Club</TableHead>
                                        <TableHead>Jugadores</TableHead>
                                        <TableHead>Fecha Inicio</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {serieList.map((serie) => (
                                        <TableRow key={serie.id_serie}>
                                            <TableCell className="font-medium">{serie.nombre_serie}</TableCell>
                                            <TableCell>{serie.nombre_club}</TableCell>
                                            <TableCell>{serie.cantidad_jugadores}</TableCell>
                                            <TableCell>{serie.fecha_creacion?.split("T")[0]}</TableCell>
                                            <TableCell>
                                                <Badge className={serie.serie_activa ? "bg-green-500" : "bg-gray-500"}>
                                                    {serie.serie_activa ? "Activa" : "Inactiva"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">

                                                    {!isLoading &&
                                                        <>
                                                            <NavLink to={`/dashboard/series/${serie.id_serie}/`} onClick={() => setSelectedSerie(serie)}>
                                                                <Button variant="outline" size="sm" className="flex items-center">
                                                                    <Eye className="w-4 h-4" />
                                                                </Button>
                                                            </NavLink>
                                                            <Button
                                                                onClick={() => {
                                                                    setIsSelected(serie.id_serie);
                                                                    setSelectedAction('toggle');
                                                                }}
                                                                variant={serie.serie_activa ? "destructive" : "outline"}
                                                                size="sm"
                                                                className="flex items-center"
                                                            >
                                                                {serie.serie_activa ? "Desactivar" : "Activar"}
                                                            </Button>

                                                            <AlertDialogHandle
                                                                title={`${serie.serie_activa ? "Desactivar" : "Activar"} ${serie.nombre_club} - ${serie.nombre_serie}`}
                                                                description={
                                                                    serie.serie_activa
                                                                        ? `¿Estas seguro de querer desactivar la serie ${serie.nombre_serie}?`
                                                                        : `¿Estas seguro de querer activar la serie ${serie.nombre_serie}?`
                                                                }
                                                                confirmLabel={serie.serie_activa ? "Desactivar" : "Activar"}
                                                                cancelLabel="Cancelar"
                                                                onConfirm={() => handleDesactivate(serie.id_serie)}
                                                                open={isSelected === serie.id_serie && selectedAction === 'toggle'}
                                                                onOpenChange={(open) => {
                                                                    if (!open) {
                                                                        setIsSelected(null);
                                                                        setSelectedAction(null);
                                                                    }
                                                                }}
                                                            />
                                                        </>
                                                    }
                                                    {isLoading &&
                                                        <>
                                                            <Button variant="outline" size="sm" className="flex items-center" disabled>
                                                                <Eye className="w-4 h-4 mr-1" />
                                                            </Button>

                                                            <Button
                                                                disabled
                                                                variant={serie.serie_activa ? "destructive" : "outline"}
                                                                size="sm"
                                                                className="flex items-center"
                                                            >
                                                                {serie.serie_activa ? "Desactivar" : "Activar"}
                                                            </Button>
                                                        </>
                                                    }
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {/* Mensajes de estado */}
                            {serieList.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No hay series registradas o no coinciden con la búsqueda.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex justify-between items-center mt-4">
                        <span className="text-sm text-gray-500">
                            Página {page} de {totalPage || 1}
                        </span>
                        <div className="space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                disabled={page === 1}
                            >
                                Anterior
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((prev) => prev + 1)}
                                disabled={page >= totalPage}
                            >
                                Siguiente
                            </Button>
                        </div>
                    </div>

                    {/* DIALOGS DE RUTA*/}
                    {action === "view" && (
                        <DialogHandle
                            title={selectedSerie ? `Detalles de la serie: ${selectedSerie.nombre_serie}` : "Cargando..."}
                            trigger={<div />}
                            open={isDialogOpen}
                            onOpenChange={handleCloseDialog}
                            initialData={selectedSerie}
                            size='w-full'
                        >
                            {() => {
                                if (!selectedSerie) {
                                    return (
                                        <div className="p-6 flex items-center justify-center">
                                            <span>Cargando detalles de la serie...</span>
                                        </div>
                                    );
                                }

                                return <SerieDetailsContent serie={selectedSerie} />;
                            }}
                        </DialogHandle>
                    )}
                </div >
            }
        </>
    );
};

