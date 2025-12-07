import React, { useEffect, useState } from "react"
import { useAuth } from "../contexts/authContext"
import { useLocation, useNavigate, useParams } from "react-router"
import type { CanchaType, SerieType, PartidoType } from "../types"
import { getPartidoById, getPartidos } from "../services/partidosService"
import { toast } from "sonner"
import { Calendar, Edit, Eye, FileText, Plus } from "lucide-react"
import { Loading } from "../components/loading-bar-component"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Button } from "../components/ui/button"
import { DialogHandle } from "../components/dialog-component"
import { CalendarioPartidoForm, PartidoDetailsForm, PartidoEditForm, PartidoForm } from "../forms/partidoForms"
import { ReportePartidosDialog } from "../components/reporte-partido-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { getSeries } from "../services/serieService"
import { getCanchas } from "../services/canchaService"


export const PartidoModule: React.FC = () => {
    const [accion, setAccion] = useState<string>("view")
    const [partidoList, setPartidoList] = useState<PartidoType[]>([])
    const [page, setPage] = useState<number>(1)
    const [totalPage, setTotalPage] = useState<number>(1)
    const [isLoading, setIsLoading] = useState<number>(0)
    const [canchaList, setCanchaList] = useState<CanchaType[]>([])
    const [serieList, setSerieList] = useState<SerieType[]>([])

    const { token, admin } = useAuth();

    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams();

    useEffect(() => {
        const loadData = async () => {
            try {
                await Promise.all([
                    fetchSeries(),
                    fetchCanchas(),
                    fetchPartidos()
                ]);
            } finally {
                setIsLoading(100);
            }
        };
        loadData();
    }, [])

    useEffect(() => {
        switch (true) {
            case location.pathname === "/dashboard/partidos/":
                fetchPartidos();
                setAccion("view")
                break
            case location.pathname === "/dashboard/partidos/calendario":
                setAccion("calendar")
                break;
            case location.pathname === "/dashboard/partidos/new":
                setAccion("new")
                break;
            case !!params.id_partido && params.accion === "edit":
                setAccion("edit")
                break
            case !!params.id_partido && !params.accion:
                setAccion("details")
                break;
            case location.pathname === "dashboard/partidos/":
                setAccion("view")
                break;
            default:
                navigate("/dashboard/partidos/", { replace: true })
                break;
        }
    }, [location, params])

    const getModule = (accion: string) => {
        switch (true) {
            case accion === "calendar":
                return <CalendarioModule onSuccess={handleCloseDialog} />
            case accion === "edit":
                return <EditPartidoModule onSuccess={handleCloseDialog}/>
            case accion === "details":
                return <PartidoDetailsModule onSuccess={handleCloseDialog}/>
            case accion === "new":
                return <NewPartidoModule onSuccess={handleCloseDialog} />
        }
    }

    const fetchPartidos = async () => {
        try {
            const data = await getPartidos<any>(token, null, null);
            setPartidoList(data.items);
            setTotalPage(Math.ceil(data.total / 20))
        } catch (error) {
            toast.error(String(error));
        }
    }
    const fetchSeries = async () => {
        if (!token) return;
        try {
            const data = await getSeries<any>(token);
            setSerieList(data.items);
        } catch (error) {
            toast.error("No se pudieron cargar las series");
        }
    };

    const fetchCanchas = async () => {
        if (!token) return;
        try {
            const data = await getCanchas<CanchaType[]>(token);
            setCanchaList(data);
        } catch (error) {
            toast.error("No se pudieron cargar las canchas");
        }
    };
    const handleCloseDialog = (open: boolean) => {
        if (!open) navigate("/dashboard/partidos/", { replace: true })
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
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                <h2>Gestión de Partidos y Entrenamientos</h2>
                <div className="flex space-x-2">
                    <Button style={{ backgroundColor: '#0000db' }} className="text-white" onClick={() => navigate('/dashboard/partidos/new', {replace: true})}>
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo Partido
                    </Button>

                    <ReportePartidosDialog token={token} />

                    <Button style={{ backgroundColor: '#0000db' }} className="text-white" onClick={() => navigate('/dashboard/partidos/calendario')}>
                        <Plus className="w-4 h-4 mr-2" />
                        Crear calendario
                    </Button>
                </div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Gestión de Partidos</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading === 100 && partidoList.length === 0 &&
                <div className="text-center py-8 text-gray-500 col-span-2">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No hay partidos registrados</p>
                </div>

            }
            {isLoading < 100 && <Loading isLoading={isLoading} component="Modulo de partidos" />}
            {isLoading === 100 && partidoList.length > 0 &&
                <>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha/Hora</TableHead>
                                <TableHead>Serie</TableHead>
                                <TableHead>Partido</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Resultado</TableHead>
                                <TableHead>Cancha</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {partidoList.map((p: PartidoType) => {
                                const serie_local: SerieType | undefined = serieList.find((s: SerieType) => s.id_serie === p.id_serie_local)
                                const serie_visita: SerieType | undefined = serieList.find((s: SerieType) => s.id_serie === p.id_serie_visitante)
                                const cancha: CanchaType | undefined = canchaList.find((c: CanchaType) => c.id_cancha === p.id_cancha)

                                return (
                                    <TableRow key={p.id_partido}>
                                        <TableCell>
                                            <div className="flex items-center">
                                                <Calendar className="w-4 h-4 mr-1" />
                                                {p.fecha_partido} {p.hora_ini_partido}
                                            </div>
                                        </TableCell>
                                        <TableCell>{serie_local?.nombre_serie}</TableCell>
                                        <TableCell>
                                            {serie_local?.nombre_club} vs {serie_visita?.nombre_club}
                                        </TableCell>
                                        <TableCell>
                                            {p.tipo_partido.charAt(0).toUpperCase() + p.tipo_partido.slice(1)}
                                        </TableCell>
                                        <TableCell>
                                            {p.goles_local !== null && p.goles_visita !== null
                                                ? `${p.goles_local} - ${p.goles_visita}`
                                                : "-"}
                                        </TableCell>
                                        <TableCell>{cancha?.nombre_cancha ?? "-"}</TableCell>
                                        <TableCell>{renderBadge(p.estado_partido.charAt(0).toUpperCase() + p.estado_partido.slice(1))}</TableCell>
                                        <TableCell className="flex space-x-1">
                                            {admin ? (
                                                <>
                                                    <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate(`/dashboard/partidos/${p.id_partido}`, { replace: true })}>
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate(`/dashboard/partidos/${p.id_partido}/edit`, { replace: true })}>
                                                        <Edit className="w-4 h-4 mr-1" />
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate(`/dashboard/partidos/${p.id_partido}`, { replace: true })}>
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>

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
                </>
            }
                </CardContent>
            </Card>
            </div>
            {accion !== "view" && getModule(accion)}
        </>
    )
}

type PartidoDialogProps = {
    onSuccess: (open: boolean) => void
}
export const NewPartidoModule: React.FC<PartidoDialogProps> = ({ onSuccess }) => {
    const [isOpen] = useState<boolean>(true)

    const { token } = useAuth();

    return (
        <DialogHandle<PartidoType>
            title="Crear partido"
            size="w-full"
            trigger={<div />}
            open={isOpen}
            onOpenChange={onSuccess}
        >
            {() => <PartidoForm token={token} onSuccess={onSuccess} />}
        </DialogHandle>
    )
}

const CalendarioModule: React.FC<PartidoDialogProps> = ({ onSuccess }) => {
    const [isOpen] = useState<boolean>(true)

    const { token } = useAuth();
    return (
        <DialogHandle
            title="Crear calendario"
            size="w-auto"
            trigger={<div />}
            open={isOpen}
            onOpenChange={onSuccess}
        >
            {() => <CalendarioPartidoForm token={token} onSuccess={onSuccess} />}
        </DialogHandle>
    )
}

export const EditPartidoModule: React.FC<PartidoDialogProps> = ({ onSuccess }) => {
    const [isOpen] = useState<boolean>(true)
    const [partido, setPartido] = useState<PartidoType>()

    const { token } = useAuth();

    const params = useParams();


    useEffect(() => {
        fetchPartido()
    }, [])
    const fetchPartido = async () => {
        try {
            let id = Number(params.id_partido)
            if(!id || isNaN(id) || !token) return
            const response = await getPartidoById<PartidoType>(id, token)
            setPartido(response)
        } catch (error) {
            toast.info(String(error))
            onSuccess(false)
        }
    }
    return (
        <DialogHandle<PartidoType>
            title="Crear partido"
            size="w-full"
            trigger={<div />}
            open={isOpen}
            onOpenChange={onSuccess}
        >
            {() => <PartidoEditForm token={token} onSuccess={onSuccess} partido={partido}/>}
        </DialogHandle>
    )
}

export const PartidoDetailsModule: React.FC<PartidoDialogProps> = ({onSuccess}) => {
    const [isOpen] = useState<boolean>(true)
    const [partido, setPartido] = useState<PartidoType>()

    const { token } = useAuth();

    const params = useParams();


    useEffect(() => {
        fetchPartido()
    }, [])
    const fetchPartido = async () => {
        try {
            let id = Number(params.id_partido)
            if(!id || isNaN(id) || !token) return
            const response = await getPartidoById<PartidoType>(id, token)
            setPartido(response)
        } catch (error) {
            toast.info(String(error))
            onSuccess(false)
        }
    }
    return (
        <DialogHandle<PartidoType>
            title={`Detalle de partido ${partido?.club_local} vs ${partido?.club_visitante}`}
            size="w-full"
            trigger={<div />}
            open={isOpen}
            onOpenChange={onSuccess}
        >
            {() => <PartidoDetailsForm token={token} onSuccess={onSuccess} partido={partido}/>}
        </DialogHandle>
    )
}
