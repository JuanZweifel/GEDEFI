import React, { useEffect, useState } from "react"
import { useAuth } from "../contexts/authContext"
import { useLocation, useNavigate, useParams } from "react-router"
import { Button } from "../components/ui/button"
import { Calendar, Edit, Eye, FileText, Plus } from "lucide-react"
import { Badge } from "../components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import type { CanchaType, ClubType, PartidoType, SerieType } from "../types"
import { getPartidoById, getPartidos } from "../services/partidosService"
import { toast } from "sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { getSeries } from "../services/serieService"
import { getCanchas } from "../services/canchaService"
import { DialogHandle } from "../components/dialog-component"
import { CalendarioPartidoForm, PartidoDetailsForm, PartidoForm } from "../forms/partidoForms.tsx"
import { Loading } from "../components/loading-bar-component.tsx"


export const PartidoCoreModule: React.FC = () => {
    const [accion, setAccion] = useState("view")
    const [openCalendario, setOpenCalendario] = useState<boolean>(false)
    const [partidoList, setPartidoList] = useState<PartidoType[]>([])


    const { token, admin } = useAuth();

    const navigate = useNavigate()
    const params = useParams()

    useEffect(() => {
        if (!!admin) fetchPartidos(token)
        const acc = params.accion
        const id = params.id_partido
        const isInvalid = (!!acc && !["new", "edit", "details", "calendario"].includes(acc)) ||
            (acc === "edit" && !id)
        if (isInvalid) {
            navigate("/dashboard/partidos/", { replace: true })
        } else setAccion(!!acc ? acc : "view")
    }, [params.id_partido, params.accion])

    const getModule = (accion: string) => {
        switch (true) {
            case accion === "view":
                if (!!openCalendario && partidoList.length > 0) setOpenCalendario(false)
                return <PartidoListModule token={token} admin={admin} />
            case accion === "new":
                return <PartidoDialogModule token={token} isEdit={false} closeDialog={handleCloseDialog} />
            case !!params.id_partido && accion === "edit":
                return <PartidoDialogModule token={token} isEdit={true} closeDialog={handleCloseDialog} />
            case !!params.id_partido && accion === "details":
                return <PartidoRendimientoModule token={token} closeDialog={handleCloseDialog} isEdit />
            case params.accion === "calendario":
                return <CalendarioModule token={token} closeDialog={handleCloseDialog} isEdit />
            default:
                navigate("/dashboard/partidos/", { replace: true })
                break
        }
    }

    const fetchPartidos = async (token: string | null) => {
        try {
            console.log("Hola", partidoList.length
            )
            const data = await getPartidos<PartidoType[]>(token);
            setPartidoList(data);
        } catch (error) {
            toast.error(String(error));
        }
    }

    const handleCloseDialog = (open: boolean) => {
        if (!open) navigate("/dashboard/partidos/", { replace: true })
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2>Gestión de Partidos y Entrenamientos</h2>
                <div className="flex space-x-2">
                    <Button style={{ backgroundColor: '#0000db' }} className="text-white" onClick={() => navigate('/dashboard/partidos/new')}>
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo Partido
                    </Button>

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
                    {accion === "view" && getModule(accion)}
                </CardContent>
            </Card>

            {accion !== "view" && getModule(accion)}
        </div>
    );
}

type PropsPartidoType = {
    token: string | null
    id_club?: number | null;
    admin?: boolean | null;
}

const PartidoListModule: React.FC<PropsPartidoType> = ({ token, admin }) => {
    const [isLoading, setIsLoading] = useState<number>(0)
    const [partidoList, setPartidoList] = useState<PartidoType[]>([])
    const [page, setPage] = useState<number>(1)
    const [totalPages, setTotalPages] = useState<number>(0)
    const [selectedDelete, setSelectedDelete] = useState<number | null>(null)
    const [series, setSeries] = useState<SerieType[]>([]);
    const [canchas, setCanchas] = useState<CanchaType[]>([]);

    const location = useLocation()
    const navigate = useNavigate()
    const params = useParams()

    useEffect(() => {
        fetchPartidos(token);
        fetchSeries(token);
        fetchCanchas(token);
    }, [])

    const fetchPartidos = async (token: string | null) => {
        try {
            setIsLoading(20)
            const data = await getPartidos<PartidoType[]>(token);
            setIsLoading(60)
            setPartidoList(data);
            setIsLoading(100)
        } catch (error) {
            setIsLoading(100)
            toast.error(String(error));
        }
    }

    const fetchSeries = async (token: string | null) => {
        if (!token) return;
        try {
            const data = await getSeries<SerieType[]>(token);
            setSeries(data);
        } catch (error) {
            toast.error("No se pudieron cargar las series");
        }
    };

    const fetchCanchas = async (token: string | null) => {
        if (!token) return;
        try {
            const data = await getCanchas<CanchaType[]>(token);
            setCanchas(data);
        } catch (error) {
            toast.error("No se pudieron cargar las canchas");
        }
    };
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
            {isLoading < 100 && <Loading isLoading={isLoading} component="Modulo de partidos" />}
            {isLoading === 100 && partidoList.length === 0 &&
                <div className="text-center py-8 text-gray-500 col-span-2">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No hay partidos registrados</p>
                </div>

            }
            {isLoading === 100 && partidoList.length > 0 &&
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
                            const serie_local: SerieType | undefined = series.find((s: SerieType) => s.id_serie === p.id_serie_local)
                            const serie_visita: SerieType | undefined = series.find((s: SerieType) => s.id_serie === p.id_serie_visitante)
                            const cancha: CanchaType | undefined = canchas.find((c: CanchaType) => c.id_cancha === p.id_cancha)

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
                                                <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate(`/dashboard/partidos/details/${p.id_partido}`, { replace: true })}>
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate(`/dashboard/partidos/edit/${p.id_partido}`, { replace: true })}>
                                                    <Edit className="w-4 h-4 mr-1" />
                                                </Button>
                                            </>
                                        ) : (
                                            <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate(`/dashboard/partidos/details/${p.id_partido}`, { replace: true })}>
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            }
        </>
    )
}

type PropsPartidoFormType = PropsPartidoType & {
    isEdit: boolean;
    closeDialog: (open: boolean) => void
}

const PartidoDialogModule: React.FC<PropsPartidoFormType> = ({ token, isEdit, closeDialog }) => {
    const [partido, setPartido] = useState<PartidoType>()
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(true)

    const params = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const id = Number(params.id_partido)
        if (Number.isNaN(id) && !!isEdit) navigate("/dashboard/partidos/", { replace: true })
        if (!!isEdit) {
            fetchPartido(token, id)
        }
    }, [params.id_partido])

    const fetchPartido = async (token: string | null, id_partido: number | undefined) => {
        try {
            if (!id_partido || !token) return
            const data = await getPartidoById<PartidoType>(id_partido, token);
            setPartido(data)
        } catch (error) {
            toast.error(String(error));
        }
    }
    return (
        <DialogHandle<PartidoType>
            title="Crear partido"
            trigger={<div />}
            open={isDialogOpen}
            onOpenChange={closeDialog}
        >
            {() => !!isEdit ? <PartidoForm token={token} isEdit={isEdit} onSuccess={closeDialog} partido={partido} /> : <PartidoForm token={token} isEdit={isEdit} onSuccess={closeDialog} />}
        </DialogHandle>
    )
}

const PartidoRendimientoModule: React.FC<PropsPartidoFormType> = ({ token, closeDialog }) => {
    const [partido, setPartido] = useState<PartidoType>()
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(true)

    const params = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const id = Number(params.id_partido)
        if (Number.isNaN(id)) navigate("/dashboard/partidos", { replace: true })
        fetchPartido(token, id)
    }, [params.id_partido])

    const fetchPartido = async (token: string | null, id_partido: number | undefined) => {
        try {
            if (!id_partido || !token) return
            const data = await getPartidoById<PartidoType>(id_partido, token);
            setPartido(data)
        } catch (error) {
            toast.error(String(error));
        }
    }
    return (
        <DialogHandle<PartidoType>
            title="Crear partido"
            size="w-full"
            trigger={<div />}
            open={isDialogOpen}
            onOpenChange={closeDialog}
        >
            {() => <PartidoDetailsForm partido={partido} onSuccess={closeDialog} token={token} />}
        </DialogHandle>
    )
}

const CalendarioModule: React.FC<PropsPartidoFormType> = ({ token, closeDialog }) => {
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(true)

    const handleOpenChange = (open: boolean) => {
        setIsDialogOpen(open)
        closeDialog(open)
    }

    return (
        <DialogHandle
            title="Crear calendario"
            size="w-auto"
            trigger={<div />}
            open={isDialogOpen}
            onOpenChange={handleOpenChange}
        >
            {() => <CalendarioPartidoForm token={token} onSuccess={handleOpenChange} />}
        </DialogHandle>
    )
}