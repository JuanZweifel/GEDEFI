import React, { useState, useEffect } from 'react';
import type {
    ClubType,
} from '../types.tsx';
import { useAuth } from '../contexts/authContext.tsx';
import { useLocation, useNavigate, useParams } from 'react-router';

// !import de estilos 

import { Button } from '../components/ui/button.tsx';
import { Badge } from '../components/ui/badge.tsx';
import { Input } from '../components/ui/input.tsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.tsx';
import {
    Plus, Edit, Eye, ArrowBigLeft, ArrowBigRight,
    Trash2,
    FileText,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { Progress } from '../components/ui/progress.tsx';

// !Componentes
import { AlertDialogHandle } from '../components/alert-dialog-component.tsx';
import { DialogHandle } from '../components/dialog-component.tsx';
import { ClubDetailsForm, ClubForm } from '../forms/club-forms.tsx';

// !Servicios

import {
    getClubs,
    deleteClub,
    getClub,
    disableClub
}
    from '../services/clubServices.ts';


export const ClubCoreModule: React.FC = () => {
    // ! Estados (UseState)
    const [action, setAction] = useState<string>("")

    // ! Auth
    const { token, id_club, asociacion } = useAuth();

    // ! Router
    const navigate = useNavigate();
    const params = useParams();

    // ! Control de estados (UseEffect)
    useEffect(() => {
        const acc = params.action;

        const isInvalid =
            acc === undefined ||
            !["new", "details", "edit", "view"].includes(acc) ||
            (acc === "view" && !!params.id_club); // view no debería tener ID

        if (isInvalid) {
            navigate("/dashboard/clubes/view", { replace: true });
        } else {
            setAction(acc);
        }
    }, [params.action, params.id_club]);

    // ! Funciones logicas (() =>)
    const getModule = (action: string) => {
        switch (action) {
            case "view":
                return <ClubListModule token={token} id_club={id_club} asociacion={asociacion} />
            case "details":
                return <ClubDetailsModule isOpen={true} token={token} id_club={id_club} asociacion={asociacion} handleClose={handleCloseDialog} />
            case "edit":
                return <ClubEditModule isOpen={true} token={token} id_club={id_club} asociacion={asociacion} handleClose={handleCloseDialog} />
            case "new":
                return <ClubNewModule isOpen={true} token={token} asociacion={asociacion} handleClose={handleCloseDialog} />
        }
    }

    const handleCloseDialog = (open: boolean) => {
        if (!open) navigate("/dashboard/clubes/view", { replace: true })
    }
    return (
        <>
            <div className='space-y-6'>
                <div className="flex justify-between items-center mb-3">
                    <h2>Gestión de Clubes</h2>
                    <div className='flex space-x-2'>
                        <Button
                            style={{ backgroundColor: "#0000db" }}
                            size="sm"
                            className="text-white flex-1"
                            onClick={() => navigate("/dashboard/clubes/new", { replace: true })}
                        >
                            <Plus className="w-2 h-2 mr-2" /> Nuevo Club
                        </Button>
                    </div>
                </div>
            </div>
            <div className='space-y-4'>
                <Card>
                    <CardHeader>
                        <CardTitle>Clubes registrados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {getModule(action)}
                    </CardContent>
                </Card>
                {action !== "view" && getModule(action)}
            </div>
        </>
    )
}

const ClubListModule: React.FC<{ token: string | null, id_club: number | null, asociacion: boolean | null }> = ({
    token,
    id_club,
    asociacion
}) => {
    // ! Estados (UseState)
    const [isLoading, setIsLoading] = useState<number>(0)
    const [page, setPage] = useState<number>(1)
    const [totalPages, setTotalPages] = useState<number>(0)
    const [clubList, setClubList] = useState<ClubType[]>([])
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [selectedEstado, setSelectedEstado] = useState<string | null>("");
    const [selectedDelete, setSelectedDelete] = useState<number | null>(null)

    // ! Router
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams();

    // ! Control de estados (UseEffect)
    useEffect(() => {
        if (!!asociacion) fetchClubs(false, token, searchTerm, selectedEstado);
        else fetchClub(token, id_club);
    }, [location.pathname])

    // Effect para búsqueda con debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            const rawTerm = searchTerm.trim();
            const term = rawTerm.toLowerCase();

            if (!term) {
                if (asociacion === true) {
                    fetchClubs(true, token, searchTerm, selectedEstado);
                }
                return;
            }

            const cacheToSearch =
                selectedEstado === "1"
                    ? clubList.filter(c => c.club_activo)
                    : selectedEstado === "2"
                        ? clubList.filter(c => !c.club_activo)
                        : clubList;

            const onlyDigits = /^\d+$/.test(rawTerm);
            const foundInCache = cacheToSearch.some(c => {
                const rut = (c.rut_club ?? "").toLowerCase();
                const nombre = (c.nombre_club ?? "").toLowerCase();
                const email = (c.email_club ?? "").toLowerCase();

                if (onlyDigits) return rut.includes(term);
                return nombre.includes(term) || email.includes(term);
            });

            if (foundInCache) {
                const filtered = cacheToSearch.filter(c => {
                    const rut = (c.rut_club ?? "").toLowerCase();
                    const nombre = (c.nombre_club ?? "").toLowerCase();
                    const email = (c.email_club ?? "").toLowerCase();

                    if (onlyDigits) return rut.includes(term);
                    return nombre.includes(term) || email.includes(term);
                });
                setClubList(filtered);
                return;
            }

            if (asociacion === true) {
                fetchClubs(true, token, searchTerm, selectedEstado);
            }

        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, selectedEstado, page, asociacion]);

    // ! Funciones Logicas (() => )
    const fetchClubs = async (filter: boolean, token: string | null, searchTerm: string, selectedEstado: string | null) => {
        try {
            setClubList([])
            const response = await getClubs<any>(token, searchTerm, selectedEstado, page)
            setIsLoading(50)
            let clubes: ClubType[] = response.items
            setClubList(clubes)
            setTotalPages((Math.ceil(response.total / 10)) | 0)
            setIsLoading(100)
            if (!filter && clubes.length == 0) toast.info("No hay clubes registrados en la base de datos")
        } catch (error) {
            toast.info(String(error))
        }
    }

    const fetchClub = async (token: string | null, id_club: number | null) => {
        try {
            setIsLoading(50)
            const response = await getClub<any>(id_club, token)
            let clubes: ClubType[] = [response]
            setClubList(clubes)
            setIsLoading(100)
        } catch (error) {
            toast.info(String(error))
        }
    }

    const handleDelete = async (id_club: number, activo: boolean) => {
        try {
            const response = activo ? await disableClub<any>(id_club, token) : await deleteClub<any>(id_club, token)
            toast.success(response.message);
            setSelectedDelete(null);
            setSearchTerm("")
            setSelectedEstado(null)
            if (!!asociacion) fetchClubs(false, token, searchTerm, selectedEstado);
            else fetchClub(token, id_club)
        } catch (error) {
            toast.error(String(error));
        }
    };

    return (
        <>
            {isLoading < 100 && <Loading component='Clubes' isLoading={isLoading} />}
            {isLoading === 100 && <>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-3'>
                    <div>
                        <Input
                            type="text"
                            disabled={!asociacion}
                            placeholder="Buscar club por Nombre, RUT o Email..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div>
                        <Select value={selectedEstado} disabled={!asociacion} onValueChange={(v: string) => setSelectedEstado(v)}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Seleccionar estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0">Todos</SelectItem>
                                <SelectItem value="1">Activo</SelectItem>
                                <SelectItem value="2">Inactivo</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {clubList.length > 0 &&
                        <div className='flex justify-end items-center space-x-2'>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                            >
                                <ArrowBigLeft className="w-2 h-2 mr-2" />
                            </Button>

                            <span className="text-sm font-medium">
                                {page} / {totalPages === 0 ? "-" : totalPages}
                            </span>

                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            >
                                <ArrowBigRight className="w-2 h-2 mr-2" />
                            </Button>
                        </div>
                    }
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    {clubList.map(c => (
                        <Card key={c.id_club}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <CardTitle>
                                        <div>{c.nombre_club}</div>
                                        <div>
                                            <span className="text-gray-400 text-sm">{c.rut_club}</span>
                                        </div>
                                    </CardTitle>
                                    <Badge className={c.club_activo ? "bg-green-500" : "bg-gray-500"}>
                                        {c.club_activo ? "Activo" : "Inactivo"}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {/* Club info */}
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium">Fecha fundacion:</span>
                                        <p>{c.fecha_fundacion}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium">Telefono:</span>
                                        <p>{c.fono_club}</p>
                                    </div>
                                </div>
                                <div className="text-sm">
                                    <span className="font-medium">Correo Electronico:</span>
                                    <p>{c.email_club}</p>
                                </div>

                                {/* Series & Players */}
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium">Series:</span>
                                        <p>{c.series.length}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium">Jugadores:</span>
                                        <p>{c.jugadores.length}</p>
                                    </div>
                                </div>

                                {/* Logo */}
                                <div className="text-sm">
                                    <img
                                        src={
                                            typeof c.logo_club === "string"
                                                ? c.logo_club
                                                : c.logo_club instanceof File
                                                    ? URL.createObjectURL(c.logo_club)
                                                    : undefined
                                        }
                                        alt="Preview logo"
                                        className="mt-2 h-32 w-32 object-contain border rounded"
                                        style={{ width: "1000px", height: "250px", objectFit: "contain" }}
                                    />
                                </div>

                                {/* Buttons */}
                                <div className="flex space-x-2 pt-2">
                                    <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate(`/dashboard/clubes/details/${c.id_club}`, { replace: true })}>
                                        <Eye className="w-4 h-4 mr-1" /> Ver Detalles
                                    </Button>
                                    <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate(`/dashboard/clubes/edit/${c.id_club}`, { replace: true })}>
                                        <Edit className="w-4 h-4 mr-1" /> Editar
                                    </Button>
                                </div>
                                <div className="flex space-x-2 pt-2">
                                    <Button
                                        onClick={() => setSelectedDelete(c.id_club)}
                                        variant="destructive"
                                        size="sm"
                                        className="flex-1"
                                    >
                                        {!c.club_activo && <Trash2 className="w-4 h-4 mr-1" />} {c.club_activo ? "Desactivar" : "Eliminar"}
                                    </Button>
                                    <AlertDialogHandle
                                        timer={5}
                                        title={`${c.club_activo ? "Desactivación" : "Eliminación"} de club ${c.nombre_club}`}
                                        description={
                                            c.club_activo ?
                                                `¿Estas seguro de querer desactivar al club ${c.nombre_club}?
                                            Esta acción desactivara las series, jugadores y usuarios asociados al club.` :
                                                `¿Estas seguro de querer Eliminar al club ${c.nombre_club}?
                                            Esta acción eliminara tambien sus series`

                                        }
                                        confirmLabel={c.club_activo ? "Desactivar" : "Eliminar"}
                                        cancelLabel="Cancelar"
                                        onConfirm={() => handleDelete(c.id_club, c.club_activo)}
                                        open={selectedDelete === c.id_club}
                                        onOpenChange={open => !open && setSelectedDelete(null)}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {isLoading === 100 && clubList.length === 0 &&
                        <div className="text-center py-8 text-gray-500 col-span-2">
                            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No se encontraron clubs que coincidan con la busqueda.</p>
                        </div>
                    }
                </div>
            </>}
        </>
    )
}

const Loading: React.FC<{ isLoading: number, component: string }> = ({ isLoading, component }) => {

    return (
        <div className="flex flex-col items-center justify-center space-y-4 p-6 text-center">
            <p className="text-lg font-medium text-foreground">
                Cargando {component}...
            </p>
            <Progress value={isLoading} label="Cargando módulo" />
        </div>

    )
}

const ClubNewModule: React.FC<{ isOpen: boolean, token: string | null, asociacion: boolean | null, handleClose: (open: boolean) => void }> = ({
    isOpen,
    token,
    asociacion,
    handleClose
}) => {
    // !Estados (UseState)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    // !Router
    const navigate = useNavigate()

    // !Control de estados (UseEffect)
    useEffect(() => {
        if (!asociacion) navigate("/dashboard/clubes/view", { replace: true })
        setIsDialogOpen(isOpen)
    }, [])

    return (
        <DialogHandle<ClubType>
            title="Crear nuevo club"
            trigger={<div />}
            open={isDialogOpen}
            onOpenChange={handleClose}
        >
            {() => <ClubForm isEdit={false} onSuccess={handleClose} />}
        </DialogHandle>
    )
}

const ClubEditModule: React.FC<{ isOpen: boolean, token: string | null, id_club: number | null, asociacion: boolean | null, handleClose: (open: boolean) => void }> = ({
    isOpen,
    token,
    id_club,
    asociacion,
    handleClose
}) => {
    // !Estados (UseState)
    const [club, setClub] = useState<ClubType>()
    const [isLoading, setIsLoading] = useState<number>(0)

    // !Router
    const params = useParams()
    const navigate = useNavigate();

    // !Control de estados (UseEffect)
    useEffect(() => {
        try {
            let id = params.id_club
            if (!!id && (!!asociacion || id_club === Number(id))) fetchClub(token, Number(id));
        } catch (error) {
            navigate("/dashboard/clubes/view", { replace: true })
        }

    }, [])

    // !Funciones logicas (() =>)
    const fetchClub = async (token: string | null, id_club: number | null) => {
        try {
            const response = await getClub<any>(id_club, token)
            setClub(response)
            setIsLoading(100)
            if (!response) navigate("/dashboard/clubes/view", { replace: true })
        } catch (error) {
            console.log(error)
            toast.info(String(error))
            navigate("/dashboard/clubes/view", {replace:true})
        }
    }
    return (
        <DialogHandle<ClubType>
            title={club ? `Modificar club ${club.nombre_club}` : "Cargando..."}
            trigger={<div />}
            open={isOpen}
            onOpenChange={handleClose}
        >
            {() => {
                if (isLoading < 100 || !club) {
                    return (
                        <Loading isLoading={isLoading} component='Club' />
                    );
                }

                return <ClubForm club={club} isEdit={true} onSuccess={handleClose} />
            }}
        </DialogHandle>
    )
}

const ClubDetailsModule: React.FC<{ isOpen: boolean, token: string | null, id_club: number | null, asociacion: boolean | null, handleClose: (open: boolean) => void }> = ({
    isOpen,
    token,
    id_club,
    asociacion,
    handleClose
}) => {
    // !Estados (UseState)
    const [isLoading, setIsLoading] = useState<number>(0)
    const [club, setClub] = useState<ClubType>()

    // !Router
    const params = useParams()
    const navigate = useNavigate();

    // !Control de estados (UseEffect)
    useEffect(() => {
        try {
            let id = Number(params.id_club)
            if (Number.isNaN(id)) throw new Error("ID no numerico")
            if (!!id || (!!asociacion || id_club === id)) fetchClub(token, id);
        } catch (error) {
            navigate("/dashboard/clubes/view", { replace: true })
        }
    }, [])

    // !Funciones logicas (() =>)
    const fetchClub = async (token: string | null, id_club: number | null) => {
        try {
            const response = await getClub<any>(id_club, token)
            setClub(response)
            setIsLoading(100)
            if (!response) navigate("/dashboard/clubes/view", { replace: true })
        } catch (error) {
            toast.info(String(error))
            navigate("/dashboard/clubes/view", { replace: true })
        }
    }

    return (
        <DialogHandle<ClubType>
            title={club ? `Detalles del club: ${club.nombre_club}` : 'Detalles del club'}
            trigger={<div />}
            open={isOpen}
            onOpenChange={handleClose}
            initialData={club}
            size='w-full'
        >
            {() => {
                if (isLoading < 100 || !club) {
                    return (
                        <Loading isLoading={isLoading} component='Club' />
                    );
                }

                return <ClubDetailsForm club={club} setIsLoading={setIsLoading} />;
            }}
        </DialogHandle>
    )
}
