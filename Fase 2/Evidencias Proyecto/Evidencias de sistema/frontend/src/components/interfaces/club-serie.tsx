import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { DialogHandle } from '../dialog-component.tsx';
import { Input } from '../ui/input';
import {
    Plus, Edit, Eye, Users,
    Club,
    Trash2
} from 'lucide-react';

import { toast } from 'sonner';


import { getClubs, createClub, updateClub, deleteClub } from '../../services/clubServices.ts';
import { AlertDialogHandle } from '../alert-dialog-component.tsx';

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

type ClubFormProps = {
    club?: Club | null
    isEdit: boolean
    refreshClub: () => Promise<void>
    onSuccess: () => void // para cerrar el dialog
}

export function ClubForm({ club, isEdit, refreshClub, onSuccess }: ClubFormProps) {
    const [nombreClub, setNombreClub] = useState(club?.nombre_club ?? "")
    const [fechaFundacion, setFechaFundacion] = useState(club?.fecha_fundacion ?? "")
    const [direccionClub, setDireccionClub] = useState(club?.direccion_club ?? "")
    const [fonoClub, setFonoClub] = useState(club?.fono_club ?? "")
    const [emailClub, setEmailClub] = useState(club?.email_club ?? "")
    const [clubActivo, setClubActivo] = useState(club?.club_activo ?? true)
    const [isLoading, setIsLoading] = useState(false)
    console.log(club)

    useEffect(() => {
        if (isEdit && club) {
            setNombreClub(club.nombre_club ?? "")
            setFechaFundacion(club.fecha_fundacion ?? "")
            setDireccionClub(club.direccion_club ?? "")
            setFonoClub(club.fono_club ?? "")
            setEmailClub(club.email_club ?? "")
            setClubActivo(club.club_activo ?? true)
        }
    }, [club, isEdit])

    const handleSubmit = async () => {
        setIsLoading(true)
        try {
            const clubObject: ClubApi = {
                nombre_club: nombreClub,
                fecha_fundacion: fechaFundacion,
                fono_club: fonoClub,
                direccion_club: direccionClub,
                email_club: emailClub,
                ...(isEdit ? { club_activo: clubActivo } : {}),
            }

            if (isEdit && club?.id_club) {
                await updateClub<any>(clubObject, club.id_club)
                toast.success("¡Club modificado correctamente!")
            } else {
                await createClub<any>(clubObject)
                toast.success("¡Club registrado correctamente!")
            }

            refreshClub()
            onSuccess() // 👈 aquí cierras el diálogo
        } catch (error) {
            toast.error(String(error))
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSubmit() }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block mb-2">Nombre del club:</label>
                    <Input
                        placeholder="Ej: Estadio Municipal"
                        value={nombreClub}
                        onChange={(e) => setNombreClub(e.target.value)}
                        required
                        maxLength={120}
                        minLength={4}
                        pattern="^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$"
                    />
                </div>
                <div>
                    <label className="block mb-2">Fecha fundación:</label>
                    <Input
                        type="date"
                        value={fechaFundacion}
                        onChange={(e) => setFechaFundacion(e.target.value)}
                        required
                        max={new Date().toISOString().split("T")[0]}
                    />
                </div>
                <div className="col-span-2">
                    <label className="block mb-2">Dirección completa</label>
                    <Input
                        placeholder="Dirección del club"
                        value={direccionClub}
                        onChange={(e) => setDireccionClub(e.target.value)}
                        required
                        minLength={10}
                        maxLength={500}
                    />
                </div>
                <div>
                    <label className="block mb-2">Teléfono:</label>
                    <Input
                        placeholder="Ej: 987654321"
                        value={fonoClub}
                        onChange={(e) => setFonoClub(e.target.value)}
                        required
                        pattern="^[0-9]{9}$"
                    />
                </div>
                <div>
                    <label className="block mb-2">Correo electrónico:</label>
                    <Input
                        type="email"
                        placeholder="club@example.com"
                        value={emailClub}
                        onChange={(e) => setEmailClub(e.target.value)}
                        required
                    />
                </div>
                {isEdit && (
                    <div className="col-span-2 flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="club-activo"
                            checked={clubActivo}
                            onChange={(e) => setClubActivo(e.target.checked)}
                            className="w-4 h-4 rounded border"
                        />
                        <label htmlFor="club-activo" className="text-sm">
                            Club activo
                        </label>
                    </div>
                )}
                <div className="flex justify-end space-x-2 col-span-2">
                    <Button
                        variant="outline"
                        type="button"
                        disabled={isLoading}
                        onClick={onSuccess} // 👈 cancelar = cerrar
                    >
                        Cancelar
                    </Button>
                    <AlertDialogHandle
                        title={isEdit ? `Modificar club ${nombreClub}?` : `Registrar club ${nombreClub}?`}
                        description={
                            isEdit
                                ? `¿Estás seguro de querer guardar la modificación?`
                                : `¿Estás seguro de querer registrar al club ${nombreClub}?`
                        }
                        confirmLabel={isEdit ? "Modificar" : "Registrar"}
                        cancelLabel="Cancelar"
                        onConfirm={handleSubmit}
                    >
                        <Button style={{ backgroundColor: "#0000db" }} className="text-white">
                            {!isLoading && !isEdit && <Plus className="w-4 h-4 mr-2" />}
                            {isLoading ? "Guardando..." : "Guardar"}
                        </Button>
                    </AlertDialogHandle>
                </div>
            </div>
        </form>
    )
}

// Enhanced Clubs & Series Module (CLUB, SERIE, DETALLE_CLUB_JUGADOR, FICHA_JUGADOR)
export const ClubSeriesModule: React.FC = () => {
    const [activeTab, setActiveTab] = useState('clubs');
    const [clubList, setClubList] = useState<Club[]>([])
    //const [isEdit, setIsEdit] = useState(false)

    const fetchClubs = async () => {
        const data = await getClubs<Club[]>();
        console.log(data)
        setClubList(data);
    }

    useEffect(() => {
        fetchClubs(); // carga inicial
    }, [])

    const handleDelete = async (id_club: number) => {
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
                <DialogHandle<Club>
                    title="Crear nuevo club"
                    trigger={
                        <Button style={{ backgroundColor: "#0000db" }} className="text-white">
                            <Plus className="w-4 h-4 mr-2" /> Nuevo Club
                        </Button>
                    }
                >
                    {(close) => (
                        <ClubForm
                            isEdit={false}
                            refreshClub={fetchClubs}
                            onSuccess={close}
                        />
                    )}
                </DialogHandle>
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
                                            <DialogHandle<Club>
                                                title={`Modificar club ${club.nombre_club}`}
                                                trigger={
                                                    <Button variant="outline" size="sm">
                                                        <Edit className="w-4 h-4 mr-1" /> Editar
                                                    </Button>
                                                }
                                            >
                                                {(close) => (
                                                    <ClubForm
                                                        club={club}
                                                        isEdit={true}
                                                        refreshClub={fetchClubs}
                                                        onSuccess={close}
                                                    />
                                                )}
                                            </DialogHandle>
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