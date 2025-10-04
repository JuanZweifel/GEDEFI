import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import {
    Plus, Edit, Eye, Users,
    Club,
    Trash2
} from 'lucide-react';

import { toast } from 'sonner';


import { getClubs, createClub, updateClub, deleteClub } from '../../services/clubServices.ts';
import { AlertDialogHandle } from '../alert-dialog.tsx';

// Enhanced User & Roles Module (USUARIO, ROL, HISTORIAL_USUARIO)

type directiva = {
    rut_usuario: string;
    email_usuario: string;
    nombre_usuario: string;
    apellido_usuario: string;
    fecha_nacimiento: string;
    huella_pulgar: string;
    huella_indice: string;
    usuario_activo: boolean;
    id_rol: number;
    fecha_creacion: string;
    fecha_modificacion: string;
}
type Club = {
    id_club: number;
    nombre_club: string;
    fecha_fundacion: string;
    fono_club: string;
    direccion_club: string;
    email_club: string;
    club_activo: boolean
    fecha_creacion: string;
    fecha_modificacion: string;
    series: number
    jugadores: number;
    directiva: [directiva];
}

type ClubApi = {

    id_club?: number
    club_activo?: boolean;
    nombre_club: string;
    fecha_fundacion: string;
    fono_club: string;
    direccion_club: string;
    email_club: string;

}

type DialogFormClub = {
    club?: Club | null;
    isEdit: boolean;
    refreshClub: () => Promise<void>;
}

export const DialogFormClub: React.FC<DialogFormClub> = ({ club, isEdit, refreshClub }) => {
    const [formOpen, setFormOpen] = useState(false)
    const [nombreClub, setNombreClub] = useState("")
    const [fechaFundacion, setFechaFundacion] = useState("")
    const [direccionClub, setDireccionClub] = useState("")
    const [fonoClub, setFonoClub] = useState("")
    const [emailClub, setEmailClub] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [clubActivo, setClubActivo] = useState(true)

    useEffect(() => {
        if (isEdit && club) {
            setNombreClub(club.nombre_club ?? "");
            setFechaFundacion(club.fecha_fundacion ?? "");
            setDireccionClub(club.direccion_club ?? "");
            setFonoClub(club.fono_club ?? "");
            setEmailClub(club.email_club ?? "");
        } else {
            // reset en caso de "Nuevo Club"
            setNombreClub("");
            setFechaFundacion("");
            setDireccionClub("");
            setFonoClub("");
            setEmailClub("");
        }
    }, [isEdit, club, formOpen]);

    const formRef = React.useRef<HTMLFormElement>(null);

    const handleSubmit = async (isEdit: boolean) => {
        setIsLoading(true)
        try {
            const clubObject: ClubApi = {
                nombre_club: nombreClub,
                fecha_fundacion: fechaFundacion,
                fono_club: fonoClub,
                direccion_club: direccionClub,
                email_club: emailClub,
                ...(isEdit ? { club_activo: clubActivo } : {})
            }
            if (isEdit && club?.id_club) {
                console.log()
                const response = await updateClub<any>(clubObject, club?.id_club)
                console.log(response)
                if (response) {
                    toast.success("¡Club modificado correctamente")
                    setFormOpen(false)
                    setIsLoading(false)
                    refreshClub();
                }
            } else {
                const response = await createClub<any>(clubObject)
                console.log(response)
                if (response) {
                    toast.success("¡Club registrado correctamente!")
                    setFormOpen(false)
                    setIsLoading(false)
                    refreshClub();
                }
            }
        } catch (error) {
            toast.error(String(error))
        }
    }
    return (
        <>

            <Dialog open={formOpen} onOpenChange={setFormOpen}>
                <DialogTrigger asChild>
                    {isEdit ? (
                        <Button variant="outline" size="sm" className="flex-1">
                            <Edit className="w-4 h-4 mr-1" />
                            Editar
                        </Button>
                    ) : (
                        <Button style={{ backgroundColor: '#0000db' }} className="text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Nuevo Club
                        </Button>
                    )}
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>{isEdit ? "Modificar club" : "Crear nuevo club"}</DialogTitle>
                    </DialogHeader>
                    <form className="space-y-4" ref={formRef}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-2">Nombre del club:</label>
                                <Input placeholder="Ej: Estadio Municipal"
                                    value={nombreClub} onChange={(e) => setNombreClub(e.target.value)}
                                    required
                                    maxLength={120}
                                    minLength={4}
                                    pattern="^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$"
                                />
                            </div>
                            <div>
                                <label className="block mb-2">Fecha fundacion:</label>
                                <Input type="date" placeholder={new Date().toISOString()}
                                    value={fechaFundacion}
                                    onChange={(e) => setFechaFundacion(e.target.value)}
                                    required
                                    max={new Date().toISOString().split("T")[0]}
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block mb-2">Dirección Completa</label>
                                <Input placeholder="Dirección del club"
                                    value={direccionClub}
                                    onChange={(e) => setDireccionClub(e.target.value)}
                                    required
                                    minLength={10}
                                    maxLength={500}
                                />
                            </div>

                            <div>
                                <label className="block mb-2">Telefono:</label>
                                <Input placeholder="Ej: 9 8765 4321"
                                    value={fonoClub}
                                    onChange={(e) => setFonoClub(e.target.value)}
                                    required
                                    pattern="^[0-9]{9}$"
                                />
                            </div>
                            <div>
                                <label className="block mb-2">Correo electronico:</label>
                                <Input type="email" placeholder="club@example.com"
                                    value={emailClub}
                                    onChange={(e) => setEmailClub(e.target.value)}
                                    required
                                />
                            </div>
                            { isEdit && 
                                <div className="col-span-2 flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="club-activo"
                                    checked={club?.club_activo}
                                    onChange={(e) => { console.log(e.target.checked); setClubActivo(e.target.checked)}}
                                    className="w-4 h-4 rounded border"
                                />
                                <label htmlFor="club-activo" className="text-sm">
                                    Club activo
                                </label>
                            </div>
                            }
                            <div className="flex justify-end space-x-2 col-span-2">
                                <Button variant="outline" type='button' disabled={isLoading} onClick={() => setFormOpen(false)}>
                                    Cancelar
                                </Button>
                                <AlertDialogHandle
                                            title={isEdit ? `Modificar club ${nombreClub}?` :`Registrar club ${nombreClub}?`}
                                            description={isEdit ? `¿Estas seguro de querer modificar al club ${nombreClub}?` :
                                            `¿Estas seguro de querer registrar al club ${nombreClub}?`}
                                            confirmLabel={isEdit ? 'Modificar' : 'Registrar'}
                                            cancelLabel='Cancelar'
                                            onConfirm={() => handleSubmit(isEdit)}
                                            >
                                                <Button style={{ backgroundColor: '#0000db' }} className="text-white">
                                                    {!isLoading && isEdit === false && <Plus className="w-4 h-4 mr-2" />}
                                                    {isLoading ? "Guardando" : "Guardar"}
                                                </Button>
                                            </AlertDialogHandle>
                            </div>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}

// Enhanced Clubs & Series Module (CLUB, SERIE, DETALLE_CLUB_JUGADOR, FICHA_JUGADOR)
export const ClubSeriesModule: React.FC = () => {
    const [activeTab, setActiveTab] = useState('clubs');
    const [clubList, setClubList] = useState<Club[]>([])

    const fetchClubs = async () => {
        const data = await getClubs<Club[]>();
        console.log(data)
        setClubList(data);
    }

    useEffect(() => {
        fetchClubs(); // carga inicial
    }, [])

    const handleDelete = async (id_club:number) => {
        try {
            const response = await deleteClub<{ detail: string }>(id_club)
            console.log(response)
            toast.success(response.detail)
            fetchClubs();
        } catch (error) {
            toast.error(String(error))
        }
        
    }
    const series = [
        {
            id: 1, nombre: "Serie A Masculina", id_club: 1, club_nombre: "FC Barcelona Santiago",
            categoria: "Adultos", activo: true, fecha_inicio: "2024-03-01", jugadores_inscritos: 22
        },
        {
            id: 2, nombre: "Serie Juvenil", id_club: 1, club_nombre: "FC Barcelona Santiago",
            categoria: "Sub-18", activo: true, fecha_inicio: "2024-03-01", jugadores_inscritos: 18
        }
    ];

    const clubHistory = [
        { fecha: "2024-09-15", accion: "Registro nueva serie", club: "FC Barcelona Santiago", detalle: "Serie Femenina agregada" },
        { fecha: "2024-09-10", accion: "Actualización directiva", club: "Real Madrid Chile", detalle: "Cambio de tesorero" }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2>Gestión de Clubes y Series</h2>
                <DialogFormClub isEdit={false} refreshClub={fetchClubs} />
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="clubs">Clubes (CLUB)</TabsTrigger>
                    <TabsTrigger value="series">Series (SERIE)</TabsTrigger>
                    <TabsTrigger value="history">Historial</TabsTrigger>
                </TabsList>

                <TabsContent value="clubs" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {clubList.map((club) => (
                            <Card key={club.id_club}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <CardTitle className="text-lg">{club.nombre_club}</CardTitle>
                                        <Badge className={club.club_activo ? 'bg-green-500' : 'bg-gray-500'}>
                                            {club.club_activo ? 'Activo' : 'Inactivo'}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
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
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="font-medium">Series:</span>
                                                <p>{club.series}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium">Jugadores:</span>
                                                <p>{club.jugadores}</p>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2 pt-2">
                                            <Button variant="outline" size="sm" className="flex-1">
                                                <Eye className="w-4 h-4 mr-1" />
                                                Ver Detalles
                                            </Button>
                                            <DialogFormClub club={club} isEdit={true} refreshClub={fetchClubs} />
                                        </div>
                                        <div className="flex space-x-2 pt-2">
                                            <AlertDialogHandle
                                            title={`Eliminacion de club ${club.nombre_club}`}
                                            description={`¿Estas seguro de querer eliminar al club ${club.nombre_club}`}
                                            confirmLabel='Eliminar'
                                            cancelLabel='Cancelar'
                                            onConfirm={() => handleDelete(club.id_club)}
                                            >
                                                <Button variant="destructive" size="sm" className="flex-1">
                                                    <Trash2 className="w-4 h-4 mr-1" />
                                                    Eliminar
                                                </Button>
                                            </AlertDialogHandle>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="series" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Series Registradas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nombre Serie</TableHead>
                                        <TableHead>Club</TableHead>
                                        <TableHead>Categoría</TableHead>
                                        <TableHead>Jugadores</TableHead>
                                        <TableHead>Fecha Inicio</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {series.map((serie) => (
                                        <TableRow key={serie.id}>
                                            <TableCell className="font-medium">{serie.nombre}</TableCell>
                                            <TableCell>{serie.club_nombre}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{serie.categoria}</Badge>
                                            </TableCell>
                                            <TableCell>{serie.jugadores_inscritos}</TableCell>
                                            <TableCell>{serie.fecha_inicio}</TableCell>
                                            <TableCell>
                                                <Badge className={serie.activo ? 'bg-green-500' : 'bg-gray-500'}>
                                                    {serie.activo ? 'Activa' : 'Inactiva'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex space-x-1">
                                                    <Button variant="outline" size="sm">
                                                        <Users className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="outline" size="sm">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
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
        </div>
    );
};