import React, { useState, useEffect } from 'react';
import type {
    ClubType,
    SerieType,
    JugadorType,
    UsuarioType,
    ClubDetailsType,
} from '../types.tsx';
import { useAuth } from '../contexts/authContext.tsx';
import { useLocation, useNavigate, NavLink, useParams } from 'react-router';

// !import de estilos 

import { Button } from '../components/ui/button.tsx';
import { Badge } from '../components/ui/badge.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs.tsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table.tsx';
import { Label } from '../components/ui/label.tsx';
import { Input } from '../components/ui/input.tsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.tsx';
import {
    Plus, Edit, Eye, ArrowBigLeft, ArrowBigRight,
    Trash2, RefreshCcw, FileText,
    Divide
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';

// !Componentes
import { AlertDialogHandle } from '../components/alert-dialog-component.tsx';
import { DialogHandle } from '../components/dialog-component.tsx';

// !Servicios

import {
    getClubs,
    deleteClub,
    getClub
}
    from '../services/clubServices.ts';


import { Progress } from '../components/ui/progress.tsx';

export const ClubCoreModule: React.FC = () => {
    // ! Estados (UseState)
    const [action, setAction] = useState<string>("")

    // ! Router
    const navigate = useNavigate();
    const params = useParams();

    // ! Control de estados (UseEffect)
    // ...
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
                return <ClubListModule />
            case "details":
                console.log("retornar details", params.id_club)
                break;
            case "edit":
                console.log("retornar editForm", params.id_club)
                break;
            case "new":
                console.log("retornar newClubForm", params.id_club)
                break;
        }
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

const ClubListModule: React.FC = () => {
    // ! Estados (UseState)
    const [isLoading, setIsLoading] = useState<number>(0)
    const [page, setPage] = useState<number>(1)
    const [totalPages, setTotalPages] = useState<number>(0)
    const [clubList, setClubList] = useState<ClubType[]>([])
    const [searchTerm, setSearchTerm] = useState<string | null>("");
    const [selectedEstado, setSelectedEstado] = useState<string | null>("");
    const [selectedDelete, setSelectedDelete] = useState<number | null>(null)

    // ! Auth
    const { token, id_club, admin } = useAuth();

    // ! Router
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams();

    // ! Control de estados (UseEffect)
    useEffect(() => {
        if (params.action === "view") {
            if (!!admin) fetchClubs(token);
            else fetchClub(token, id_club);
        }
    }, [location.pathname])

    // ! Funciones Logicas (() => )
    const fetchClubs = async (token: string | null) => {
        try {
            const response = await getClubs<any>(setIsLoading, token, searchTerm, selectedEstado, page)
            setIsLoading(80)
            let clubes: ClubType[] = response.items
            setClubList(clubes)
            setTotalPages((Math.ceil(response.total / 10)) | 0)
            setIsLoading(100)
            if (clubes.length === 0 && !searchTerm && !selectedEstado) toast.info("No hay clubes registrados en la base de datos")
        } catch (error) {
            toast.info(String(error))
        }
    }

    const fetchClub = async (token: string | null, id_club: number | null) => {
        try {
            const response = await getClub<any>(id_club, token)
            let clubes: ClubType[] = [response.items]
            setClubList(clubes)
        } catch (error) {
            toast.info(String(error))
        }
    }

    const handleDelete = async (id_club: number) => {
        try {
            const response = await deleteClub<any>(id_club, token);
            toast.success(response.message);
            setSelectedDelete(null);
            if (!!admin) fetchClubs(token);
            else fetchClub(token, id_club)
        } catch (error) {
            toast.error(String(error));
        }
    };

    return (
        <>
            {isLoading !== 100 && <Loading component='Clubes' isLoading={isLoading} />}
            {isLoading === 100 && <>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-3'>
                    <div>
                        <Input
                            type="text"
                            placeholder="Buscar club por Nombre, RUT o Email..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div>
                        <Select value={selectedEstado} onValueChange={(v: string) => setSelectedEstado(v)}>
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
                                    <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate(`/dashboard/clubes/${c.id_club}`, { replace: true })}>
                                        <Eye className="w-4 h-4 mr-1" /> Ver Detalles
                                    </Button>
                                    <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate(`/dashboard/clubes/${c.id_club}/edit`, { replace: true })}>
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
                                        <Trash2 className="w-4 h-4 mr-1" /> Eliminar
                                    </Button>
                                    <AlertDialogHandle
                                        title={`Eliminacion de club ${c.nombre_club}`}
                                        description={`¿Estas seguro de querer eliminar al club ${c.nombre_club}?`}
                                        confirmLabel="Eliminar"
                                        cancelLabel="Cancelar"
                                        onConfirm={() => handleDelete(c.id_club)}
                                        open={selectedDelete === c.id_club}
                                        onOpenChange={open => !open && setSelectedDelete(null)}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </>}
        </>
    )
}

const Loading: React.FC<{ isLoading: number, component: string }> = ({ isLoading, component }) => {

    return (
        <div>
            <p>Cargando {component}...</p>
            <Progress value={isLoading} />
        </div>

    )
}

const LoadingTest: React.FC = () => {
    const [progress, setProgress] = useState<number>(0);

    useEffect(() => {
        if (progress >= 100) return; // Detener cuando llega a 100%

        const timer = setTimeout(() => {
            setProgress(prev => Math.min(prev + 20, 100)); // Aumenta 20%
        }, 5000); // Cada 5 segundos

        return () => clearTimeout(timer);
    }, [progress]);

    return (
        <div>
            <Loading isLoading={progress} component="Club Management" />
        </div>
    );
};

export default LoadingTest;
