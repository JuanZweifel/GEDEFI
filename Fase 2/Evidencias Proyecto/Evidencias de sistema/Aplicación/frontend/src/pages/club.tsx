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
    Plus, Edit, Eye,
    Trash2, RefreshCcw, FileText
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';

import { getClubs, deleteClub } from '../services/clubServices.ts';
import { AlertDialogHandle } from '../components/alert-dialog-component.tsx';
import { ClubForm } from '../forms/club-forms.tsx';
import {
    type ClubType,
    type SerieType,
    type JugadorType,
    type UsuarioType,
    type ClubDetailsType,
} from '../types.tsx';
import { useAuth } from '../contexts/authContext.tsx';
import { useLocation, useNavigate, NavLink, useParams } from 'react-router';

export const ClubDetailsContent: React.FC<ClubDetailsType> = ({ club }) => {
    const [series, setSeries] = useState<SerieType[]>([])
    const [directiva, setDirectiva] = useState<UsuarioType[]>([])
    const [jugadores, setJugadores] = useState<JugadorType[]>([])
    const [activeTab, setActiveTab] = useState("directiva")

    useEffect(() => {
        setDirectiva(club.directiva)
        setSeries(club.series)
        setJugadores(club.jugadores)
    }, [club])

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <Label className="block mb-2">RUT</Label>
                    <Input value={club.rut_club} disabled />
                </div>
                <div>
                    <Label className="block mb-2">Fecha fundacion</Label>
                    <Input value={club.fecha_fundacion} disabled />
                </div>
                <div>
                    <Label className="block mb-2">Nombre</Label>
                    <Input value={club.nombre_club} disabled />
                </div>
                <div>
                    <Label className="block mb-2">Dirección</Label>
                    <Input value={club.nombre_club} disabled />
                </div>
                <div>
                    <Label className="block mb-2">Telefono</Label>
                    <Input value={club.fono_club} disabled />
                </div>
                <div>
                    <Label className="block mb-2">Correo Electronico</Label>
                    <Input value={club.email_club} disabled />
                </div>
                <div>
                    <Label className="block mb-2">Color primario</Label>
                    <Input
                        type='color'
                        value={club.color_primario}
                        disabled
                    />
                </div>
                <div>
                    <Label className="block mb-2">Color secundario</Label>
                    <Input
                        type='color'
                        value={club.color_secundario}
                        disabled
                    />
                </div>
                <div>
                    <Label className="block mb-2">Color respaldo</Label>
                    <Input
                        type='color'
                        value={club.color_respaldo}
                        disabled
                    />
                </div>
                <div>
                    <Label className="block mb-0">Estado</Label>
                    <Badge className={club.club_activo ? 'bg-green-500' : 'bg-gray-500'}>
                        {club.club_activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                </div>
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="directiva">Directiva</TabsTrigger>
                    <TabsTrigger value="series">Series</TabsTrigger>
                    <TabsTrigger value="jugadores">Jugadores</TabsTrigger>
                </TabsList>

                <TabsContent value="directiva" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className='font-medium'>Usuarios directivos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {directiva.length > 0 &&
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>RUT</TableHead>
                                            <TableHead>Nombre completo</TableHead>
                                            <TableHead>Fecha nacimiento</TableHead>
                                            <TableHead>Correo electronico</TableHead>
                                            <TableHead>Huella registrada</TableHead>
                                            <TableHead>ROL</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead>Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {directiva.map((d) => (
                                            <TableRow key={d.rut_usuario}>
                                                <TableCell className="font-medium">{d.rut_usuario}</TableCell>
                                                <TableCell className="font-medium">{d.nombre_usuario} {d.apellido_usuario}</TableCell>
                                                <TableCell className="font-medium">{d.fecha_nacimiento}</TableCell>
                                                <TableCell className="font-medium">{d.email_usuario}</TableCell>
                                                <TableCell className="font-medium">
                                                    <Badge className={d.huella_indice || d.huella_pulgar ? 'bg-green-500' : 'bg-red-500'}>
                                                        {d.huella_indice || d.huella_pulgar ? 'Registrada' : 'Sin registrar'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    <Badge className='bg-blue-500'>
                                                        {d.nombre_rol?.toUpperCase()}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    <Badge className={d.usuario_activo ? 'bg-green-500' : 'bg-gray-500'}>
                                                        {d.usuario_activo ? 'Activo' : 'Inactivo'}
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
                            {directiva.length === 0 &&
                                <div className="text-center py-8 text-gray-500">
                                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>Este club no tiene directiva asociada.</p>
                                </div>
                            }
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="series" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className='font-medium'>Series registradas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {series.length > 0 &&
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nombre Serie</TableHead>
                                            <TableHead>Jugadores</TableHead>
                                            <TableHead>Fecha Inicio</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead>Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {series.map((serie) => (
                                            <TableRow key={serie.id_serie ?? serie.nombre_serie}>
                                                <TableCell className="font-medium">{serie.nombre_serie}</TableCell>
                                                <TableCell className="font-medium">{serie.cantidad_jugadores}</TableCell>
                                                <TableCell className="font-medium">{serie.fecha_creacion?.split("T")[0]}</TableCell>
                                                <TableCell className="font-medium">
                                                    <Badge className={serie.serie_activa ? 'bg-green-500' : 'bg-gray-500'}>
                                                        {serie.serie_activa ? 'Activo' : 'Inactivo'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    <NavLink to={`/dashboard/series/${serie.id_serie}`}>
                                                        <Button variant="outline" size="sm">
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                    </NavLink>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            }
                            {series.length === 0 &&
                                <div className="text-center py-8 text-gray-500">
                                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>Este club no tiene series registradas.</p>
                                </div>
                            }
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="jugadores" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className='font-medium'>Usuarios directivos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {jugadores.length > 0 &&
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
                                            <TableRow key={j.rut_jugador}>
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
                            {jugadores.length === 0 &&
                                <div className="text-center py-8 text-gray-500">
                                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>Este club no tiene jugadores asociados.</p>
                                </div>
                            }
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export const ClubModule: React.FC = () => {
    const [activeTab, setActiveTab] = useState('clubs');
    const [clubList, setClubList] = useState<ClubType[]>([]);
    const [isFetching, setIsFetching] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedEstado, setSelectedEstado] = useState<string | undefined>(undefined);
    const [selectedClub, setSelectedClub] = useState<ClubType | undefined>()
    const [selectedDelete, setSelectedDelete] = useState<number | null>(null)
    const [action, setAction] = useState<string>("")
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams();
    const { token } = useAuth();

    useEffect(() => {
        fetchClubs();
    }, []);


    useEffect(() => {
        if (!params.id_club) return; // no hay id
        if (isFetching) return; // todavía cargando
        if (clubList.length === 0) navigate("/dashboard/clubes", {replace:true});

        const clubEncontrado = clubList.find(
            (c) => c.id_club === Number(params.id_club)
        );

        if (clubEncontrado) {
            setSelectedClub(clubEncontrado);
        } else {
            toast.warning("La serie solicitada no existe.");
            navigate("/dashboard/clubes", {replace:true});
        }
    }, [params.id_club, isFetching, clubList]);

    useEffect(() => {
        const path = location.pathname;

        switch (true) {
            case path.endsWith("/new"):
                setAction("new");
                setIsDialogOpen(true);
                break;

            case path.endsWith("/edit") && !!params.id_club:
                setAction("edit");
                setIsDialogOpen(true);
                break;

            case !!params.id_club:
                setAction("view");
                setIsDialogOpen(true);
                break;

            default:
                setAction("");
                setIsDialogOpen(false);
                fetchClubs()
                break;
        }
    }, [location.pathname, params.id_club]);

    const fetchClubs = async () => {
        let data: ClubType[] = [];
        try {
            setIsFetching(true);
            data = await getClubs<ClubType[]>(token);
            setClubList(data);
            if (data.length === 0) toast.info("No hay clubs registrados en la base de datos.");
        } catch (error: any) {
            toast.warning(String(error));
        } finally {
            if (data.length === 0) setClubList([]);
            setIsFetching(false);
        }
    };

    const handleCloseDialog = (open: boolean) => {
        if (!open) navigate("/dashboard/clubes");
    };

    const handleDelete = async (id_club: number) => {
        try {
            const response = await deleteClub<any>(id_club, token);
            toast.success(response.message);
            setSelectedClub(undefined);
            fetchClubs();
        } catch (error) {
            toast.error(String(error));
        }
    };

    const filteredClubs = (() => {
        let baseList = clubList;
        if (selectedEstado === "1") baseList = clubList.filter(c => c.club_activo);
        else if (selectedEstado === "2") baseList = clubList.filter(c => !c.club_activo);

        if (!searchTerm.trim()) return baseList;

        if (/^\d+$/.test(searchTerm)) return baseList.filter(c => c.rut_club?.includes(searchTerm));

        const term = searchTerm.toLowerCase();
        const byName = baseList.filter(c => c.nombre_club.toLowerCase().includes(term));
        const byEmail = baseList.filter(c => !byName.includes(c) && c.email_club.toLowerCase().includes(term));
        return [...byName, ...byEmail];
    })();

    const clubHistory = [
        { fecha: "2024-09-15", accion: "Registro nueva serie", club: "FC Barcelona Santiago", detalle: "Serie Femenina agregada" },
        { fecha: "2024-09-10", accion: "Actualización directiva", club: "Real Madrid Chile", detalle: "Cambio de tesorero" }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2>Gestión de Clubes</h2>
                <div className="flex space-x-2">
                    {isFetching ? (
                        <Button variant="outline" size="sm" className="flex-1" disabled>
                            <RefreshCcw className="w-4 h-4 mr-1" /> Recargando...
                        </Button>
                    ) : (
                        <>
                            <Button variant="outline" size="sm" className="flex-1" onClick={fetchClubs}>
                                <RefreshCcw className="w-4 h-4 mr-1" /> Recargar
                            </Button>
                            <Button
                                style={{ backgroundColor: "#0000db" }}
                                size="sm"
                                className="text-white flex-1"
                                onClick={() => navigate("/dashboard/clubes/new", { replace: true })}
                            >
                                <Plus className="w-2 h-2 mr-2" /> Nuevo Club
                            </Button>
                        </>
                    )}
                </div>
            </div>
            {/* === Tabs === */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="clubs">Clubes</TabsTrigger>
                    <TabsTrigger value="history">Historial</TabsTrigger>
                </TabsList>

                <TabsContent value="clubs" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Clubes registrados</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input
                                    type="text"
                                    placeholder="Buscar club por Nombre, RUT o Email..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-64"
                                />
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

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredClubs.map((club) => (
                                    <Card key={club.id_club}>
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <CardTitle>
                                                    <div>{club.nombre_club}</div>
                                                    <div>
                                                        <span className="text-gray-400 text-sm">{club.rut_club}</span>
                                                    </div>
                                                </CardTitle>
                                                <Badge className={club.club_activo ? "bg-green-500" : "bg-gray-500"}>
                                                    {club.club_activo ? "Activo" : "Inactivo"}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            {/* Club info */}
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="font-medium">Fecha fundacion:</span>
                                                    <p>{club.fecha_fundacion}</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium">Telefono:</span>
                                                    <p>{club.fono_club}</p>
                                                </div>
                                            </div>
                                            <div className="text-sm">
                                                <span className="font-medium">Correo Electronico:</span>
                                                <p>{club.email_club}</p>
                                            </div>

                                            {/* Series & Players */}
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="font-medium">Series:</span>
                                                    <p>{club.series.length}</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium">Jugadores:</span>
                                                    <p>{club.jugadores.length}</p>
                                                </div>
                                            </div>

                                            {/* Logo */}
                                            <div className="text-sm">
                                                <img
                                                    src={
                                                        typeof club.logo_club === "string"
                                                            ? club.logo_club
                                                            : club.logo_club instanceof File
                                                                ? URL.createObjectURL(club.logo_club)
                                                                : undefined
                                                    }
                                                    alt="Preview logo"
                                                    className="mt-2 h-32 w-32 object-contain border rounded"
                                                    style={{ width: "1000px", height: "250px", objectFit: "contain" }}
                                                />
                                            </div>

                                            {/* Buttons */}
                                            <div className="flex space-x-2 pt-2">
                                                <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate(`/dashboard/clubes/${club.id_club}`, {replace:true})}>
                                                    <Eye className="w-4 h-4 mr-1" /> Ver Detalles
                                                </Button>
                                                <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate(`/dashboard/clubes/${club.id_club}/edit`, {replace: true})}>
                                                    <Edit className="w-4 h-4 mr-1" /> Editar
                                                </Button>
                                            </div>
                                            <div className="flex space-x-2 pt-2">
                                                <Button
                                                    onClick={() => setSelectedDelete(club.id_club)}
                                                    variant="destructive"
                                                    size="sm"
                                                    className="flex-1"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-1" /> Eliminar
                                                </Button>
                                                <AlertDialogHandle
                                                    title={`Eliminacion de club ${club.nombre_club}`}
                                                    description={`¿Estas seguro de querer eliminar al club ${club.nombre_club}?`}
                                                    confirmLabel="Eliminar"
                                                    cancelLabel="Cancelar"
                                                    onConfirm={() => handleDelete(club.id_club)}
                                                    open={selectedDelete === club.id_club}
                                                    onOpenChange={open => !open && setSelectedDelete(null)}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                            {clubList.length === 0 &&
                                <div className="text-center py-8 text-gray-500">
                                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No hay clubes registrados.</p>
                                </div>
                            }
                            {filteredClubs.length === 0 && clubList.length > 0 &&
                                <div className="text-center py-8 text-gray-500">
                                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No se encontraron clubs que coincidan con la busqueda.</p>
                                </div>
                            }
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Historial de Clubes y Series</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>Acción</TableHead>
                                        <TableHead>Club</TableHead>
                                        <TableHead>Detalle</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {clubHistory.map((item, i) => (
                                        <TableRow key={i}>
                                            <TableCell>{item.fecha}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{item.accion}</Badge>
                                            </TableCell>
                                            <TableCell>{item.club}</TableCell>
                                            <TableCell>{item.detalle}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {action === "view" && (
                <DialogHandle<ClubType>
                    title={selectedClub ? `Detalles del club: ${selectedClub.nombre_club}` : 'Detalles del club'}
                    trigger={<div />}
                    open={isDialogOpen}
                    onOpenChange={handleCloseDialog}
                    initialData={selectedClub}
                    size='w-full'
                >
                    {() => {
                        if (!selectedClub) {
                            return (
                                <div className="p-6 flex items-center justify-center">
                                    <span>Cargando detalles del club...</span>
                                </div>
                            );
                        }

                        return <ClubDetailsContent club={selectedClub} />;
                    }}
                </DialogHandle>
            )}

            {action === "new" && (
                <DialogHandle<ClubType>
                    title="Crear nuevo club"
                    trigger={<div />}
                    open={isDialogOpen}
                    onOpenChange={handleCloseDialog}
                >
                    {() => <ClubForm isEdit={false} onSuccess={handleCloseDialog} />}
                </DialogHandle>
            )}

            {action === "edit" && (
                <DialogHandle<ClubType>
                    title={selectedClub ? `Modificar club ${selectedClub.nombre_club}` : "Cargando..."}
                    trigger={<div />}
                    open={isDialogOpen}
                    onOpenChange={handleCloseDialog}
                >
                    {() => {
                        if (!selectedClub) {
                            return (
                                <div className="p-6 flex items-center justify-center">
                                    <span>Cargando detalles de la serie...</span>
                                </div>
                            );
                        }

                        return <ClubForm club={selectedClub} isEdit={true} onSuccess={handleCloseDialog} />
                    }}
                </DialogHandle>
            )}
        </div>
    );
};
