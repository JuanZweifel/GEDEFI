import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
    Plus, Edit, Eye, Users
} from 'lucide-react';

import { getClubs } from '../../services/clubServices.ts';

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

// Enhanced Clubs & Series Module (CLUB, SERIE, DETALLE_CLUB_JUGADOR, FICHA_JUGADOR)
export const ClubSeriesModule: React.FC = () => {
    const [activeTab, setActiveTab] = useState('clubs');
    const [selectedClub, setSelectedClub] = useState<any>(null);
    const [clubList, setClubList] = useState<Club[]>([]);
    const [isEditClubOpen, setIsEditClubOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState<any>(null);
    const [isCreateClub, setIsCreateClub] = useState(false);
    const [estadoClub, setEstadoClub] = useState("inactivo");

    useEffect(() => {
        const fetchClubs = async () => {
            try {
                const data = await getClubs<Club[]>();
                setClubList([...data]);
                console.log(data)
            } catch (error) {
                console.log(error)
            }
        }
        fetchClubs();
    }, []);

    useEffect(() => {
        if (selectedClub) {
            setEstadoClub(selectedClub.club_activo ? "activo" : "inactivo");
        }
    }, [selectedClub])

    const handleClickEditClub = (club: Club) => {
        setSelectedClub(club);
        setIsEditClubOpen(true);
    }

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms)); // espera forzada para loading
    const handleSaveButtonClick = async () => {
        setIsLoading(true);
        try {
            await sleep(3000);  // tu función que llama al service
        } finally {
            setIsLoading(false);
            alert("Club modificado exitosamente");
            setIsEditClubOpen(false);
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
                {activeTab === 'clubs' &&
                    <div className="flex space-x-2">
                        <Dialog open={isCreateClub} onOpenChange={setIsCreateClub}>
                            <DialogTrigger asChild>
                                <Button style={{ backgroundColor: '#0000db' }} className="text-white">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Registrar nuevo club
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                    <DialogTitle>Registrar Nueva Cancha</DialogTitle>
                                </DialogHeader>
                                <form className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block mb-2">Nombre de la Cancha</label>
                                            <Input placeholder="Ej: Estadio Municipal" />
                                        </div>
                                        <div>
                                            <label className="block mb-2">Capacidad</label>
                                            <Input type="number" placeholder="Número de espectadores" />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block mb-2">Dirección Completa</label>
                                            <Input placeholder="Dirección completa de la cancha" />
                                        </div>
                                        <div>
                                            <label className="block mb-2">Tipo de Superficie</label>
                                            <Select>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione tipo" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="natural">Césped Natural</SelectItem>
                                                    <SelectItem value="sintetico">Césped Sintético</SelectItem>
                                                    <SelectItem value="tierra">Tierra</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="block mb-2">Fecha de Construcción</label>
                                            <Input type="date" />
                                        </div>
                                        <div>
                                            <label className="block mb-2">Costo de Arriendo (CLP)</label>
                                            <Input type="number" placeholder="Costo por evento" />
                                        </div>
                                        <div>
                                            <label className="block mb-2">Estado Actual</label>
                                            <Select>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione estado" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="excelente">Excelente</SelectItem>
                                                    <SelectItem value="bueno">Bueno</SelectItem>
                                                    <SelectItem value="regular">Regular</SelectItem>
                                                    <SelectItem value="malo">Malo</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block mb-2">Instalaciones Disponibles</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {["Vestuarios", "Iluminación", "Tribunas", "Estacionamiento", "Cafetería", "Enfermería", "Sala VIP", "Tienda", "Sala de Prensa"].map((facility) => (
                                                <div key={facility} className="flex items-center space-x-2">
                                                    <input type="checkbox" id={facility} />
                                                    <label htmlFor={facility} className="text-sm">{facility}</label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block mb-2">Observaciones</label>
                                        <Textarea placeholder="Información adicional sobre la cancha" />
                                    </div>

                                    <div className="flex justify-end space-x-2">
                                        <Button variant="outline" onClick={() => setIsCreateClub(false)}>
                                            Cancelar
                                        </Button>
                                        <Button style={{ backgroundColor: '#0000db' }} className="text-white">
                                            Registrar Cancha
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                }
                {activeTab === 'series' &&
                    <div className="flex space-x-2">
                        <Button style={{ backgroundColor: '#0000db' }} className="text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Nueva serie
                        </Button>
                    </div>
                }

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
                                        <div className="text-sm">
                                            <span className="font-medium">Fundación:</span>
                                            <p>{club.fecha_fundacion}</p>
                                        </div>

                                        <div className="text-sm">
                                            <span className="font-medium">Dirección:</span>
                                            <p className="text-gray-600">{club.direccion_club}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="font-medium">Correo electronico:</span>
                                                <p>{club.email_club}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium">Telefono:</span>
                                                <p>{club.fono_club}</p>
                                            </div>
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
                                            <Dialog open={isEditClubOpen} onOpenChange={setIsEditClubOpen}>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleClickEditClub(club)}>
                                                        <Edit className="w-4 h-4 mr-1" />
                                                        Editar club
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-3xl">
                                                    <DialogHeader>
                                                        <DialogTitle>Registrar Nuevo club</DialogTitle>
                                                    </DialogHeader>
                                                    {selectedClub && (
                                                        <form className="space-y-4">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div>
                                                                    <label className="block mb-2">Nombre del club</label>
                                                                    <Input defaultValue={selectedClub?.nombre_club} />
                                                                </div>
                                                                <div>
                                                                    <label className="block mb-2">Fecha fundación:</label>
                                                                    <Input type="date" defaultValue={
                                                                        selectedClub?.fecha_fundacion ?
                                                                            selectedClub.fecha_fundacion
                                                                            : ''
                                                                    } />
                                                                </div>
                                                                <div className="col-span-2">
                                                                    <label className="block mb-2">Dirección: </label>
                                                                    <Input defaultValue={selectedClub?.direccion_club} />
                                                                </div>
                                                                <div>
                                                                    <label className="block mb-2">Telefono club:</label>
                                                                    <Input defaultValue={selectedClub?.fono_club} />
                                                                </div>
                                                                <div>
                                                                    <label className="block mb-2">Correo electronico:</label>
                                                                    <Input defaultValue={selectedClub?.email_club} />
                                                                </div>
                                                                <div className="col-span-2">
                                                                    <label className="block mb-2">Estado Actual</label>
                                                                    <Select onValueChange={setEstadoClub} value={estadoClub}>
                                                                        <SelectTrigger>
                                                                            <SelectValue />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="activo">Activo</SelectItem>
                                                                            <SelectItem value="inactivo">Inactivo</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                            </div>
                                                            <div className="flex justify-end space-x-2">
                                                                <Button
                                                                    variant="outline"
                                                                    onClick={() => setIsEditClubOpen(false)}
                                                                    disabled={isLoading === true}
                                                                >
                                                                    Cancelar
                                                                </Button>

                                                                <Button
                                                                    style={{ backgroundColor: '#0000db' }}
                                                                    className="text-white flex items-center justify-center gap-2"
                                                                    onClick={handleSaveButtonClick}
                                                                    disabled={isLoading === true}
                                                                >
                                                                    {isLoading ? (
                                                                        <>
                                                                            Guardando...
                                                                        </>
                                                                    ) : (
                                                                        "Guardar Cambios"
                                                                    )}
                                                                </Button>
                                                            </div>
                                                        </form>
                                                    )}
                                                </DialogContent>
                                            </Dialog>
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

            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Detalles club: {selectedClub?.nombre_club}</DialogTitle>
                    </DialogHeader>
                    {selectedClub && (
                        <form className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-2">Nombre del club</label>
                                    <Input defaultValue={selectedClub?.nombre_club} />
                                </div>
                                <div>
                                    <label className="block mb-2">Fecha fundación:</label>
                                    <Input type="date" defaultValue={
                                        selectedClub?.fecha_fundacion ?
                                            selectedClub.fecha_fundacion
                                            : ''
                                    } />
                                </div>
                                <div className="col-span-2">
                                    <label className="block mb-2">Dirección: </label>
                                    <Input defaultValue={selectedClub?.direccion_club} />
                                </div>
                                <div>
                                    <label className="block mb-2">Telefono club:</label>
                                    <Input defaultValue={selectedClub?.fono_club} />
                                </div>
                                <div>
                                    <label className="block mb-2">Correo electronico:</label>
                                    <Input defaultValue={selectedClub?.email_club} />
                                </div>
                                <div className="col-span-2">
                                    <label className="block mb-2">Estado Actual</label>
                                    <Select defaultValue={selectedClub.estado_actual ? "activo" : "inactivo"}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="activo">Activo</SelectItem>
                                            <SelectItem value="inactivo">Inactivo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsEditFieldOpen(false)}
                                    disabled={isLoading === true}
                                >
                                    Cancelar
                                </Button>

                                <Button
                                    style={{ backgroundColor: '#0000db' }}
                                    className="text-white flex items-center justify-center gap-2"
                                    onClick={handleSaveButtonClick}
                                    disabled={isLoading === true}
                                >
                                    {isLoading ? (
                                        <>
                                            Guardando...
                                        </>
                                    ) : (
                                        "Guardar Cambios"
                                    )}
                                </Button>
                            </div>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};