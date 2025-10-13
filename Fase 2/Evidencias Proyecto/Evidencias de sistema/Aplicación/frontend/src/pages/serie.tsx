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
    Trash2, RefreshCcw, FileText, ArchiveRestore, ArchiveX
} from 'lucide-react';

import { toast } from 'sonner';
import { type SerieType, type SerieDetailsProps } from '../types.tsx';
import { getSeries, updateStateSerie, deleteSerie } from '../services/serieService.ts';
import { AlertDialogHandle } from '../components/alert-dialog-component.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

export const SerieDetails: React.FC<SerieDetailsProps> = ({ serie }) => {
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)
    const [activeTab, setActiveTab] = useState("jugadores")

    return (
        <DialogHandle
            title={`${serie.nombre_club} - ${serie.nombre_serie}`}
            size='w-3/4'
            trigger={
                <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4" />
                </Button>
            }
            open={isDetailsOpen}
            onOpenChange={setIsDetailsOpen}
            initialData={serie}
        >
            {() => (
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
                            <TabsTrigger value="sanciones">Sanciones</TabsTrigger>
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
                                                {serie.jugadores.map((j) => (
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
                                    <div className="text-center py-8 text-gray-500">
                                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p>EN DESARROLLO</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="sanciones" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className='font-medium'>Historial de sanciones</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center py-8 text-gray-500">
                                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p>EN DESARROLLO</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            )}
        </DialogHandle>
    )
}

export const SerieModule: React.FC = () => {
    const [activeTab, setActiveTab] = useState('series');
    const [serieList, setSerieList] = useState<SerieType[]>([]);
    const [isFetching, setIsFetching] = useState(false)
    const [isSelected, setIsSelected] = useState<number | null>(null)
    const [selectedAction, setSelectedAction] = useState<'delete' | 'toggle' | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedEstado, setSelectedEstado] = useState<string | undefined>("0");

    // Filtro de series por estado y nombre
    const filteredSeries = (() => {
        let baseList = serieList;
        if (selectedEstado === "1") {
            baseList = serieList.filter((serie) => serie.serie_activa === true);
        } else if (selectedEstado === "2") {
            baseList = serieList.filter((serie) => serie.serie_activa === false);
        }
        if (!searchTerm.trim()) return baseList;
        const term = searchTerm.toLowerCase();
        return baseList.filter(
            (serie) =>
                serie.nombre_serie.toLowerCase().includes(term) ||
                serie.nombre_club.toLowerCase().includes(term)
        );
    })();

    const fetchSeries = async () => {
        setSerieList([])
        setIsLoading(false)
        let data: SerieType[] = []
        try {
            setIsFetching(true)
            data = await getSeries<SerieType[]>();
            setSerieList(data);
            if (data.length === 0) {
                toast.info("No hay series registradas en la base de datos.")
            }
        } catch (error: any) {
            toast.warning(String(error.detail))
        } finally {
            if (data.length === 0) {
                setSerieList([])
            }
            setIsFetching(false)
        }
    }
    useEffect(() => {
        fetchSeries();
    }, [])

    const handleDesactivate = async (id_serie: number) => {
        let data: { message: string }
        try {
            setIsLoading(true)
            const serie = serieList.find(s => s.id_serie === id_serie);
            data = await updateStateSerie(id_serie, !serie?.serie_activa)
            toast.success(data.message)
        } catch (error) {
            toast.warning(String(error))
        } finally {
            setIsSelected(null)
            setSelectedAction(null)
            setIsLoading(false)
            fetchSeries();
        }
    }
    const handleDelete = async (id_serie: number) => {
        let data: { message: string }
        try {
            setIsLoading(true)
            data = await deleteSerie(id_serie)
            toast.success(data.message)
        } catch (error) {

            console.log(error)
            toast.warning(String(error))
        } finally {
            fetchSeries()
            setIsSelected(null)
            setSelectedAction(null)
            setIsLoading(false)
        }
    }
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2>Gestión de Series</h2>
                <div className="flex space-x-2">
                    {isFetching &&
                        <Button variant="outline" size="sm" className="flex-1" disabled>
                            <RefreshCcw className="w-4 h-4 mr-1" />
                            Recargando...
                        </Button>
                    }

                    {!isFetching && (
                        !isLoading ? (
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={fetchSeries}
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
                                onClick={fetchSeries}
                            >
                                <RefreshCcw className="w-4 h-4 mr-1" />
                                Recargar
                            </Button>
                        )
                    )}
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="series">Series</TabsTrigger>
                    <TabsTrigger value="history">Historial</TabsTrigger>
                </TabsList>

                <TabsContent value="series" className="space-y-4">
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
                                    {filteredSeries.map((serie) => (
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
                                                    <SerieDetails serie={serie} />

                                                    {!isLoading &&
                                                        <>
                                                            <Button
                                                                onClick={() => {
                                                                    setIsSelected(serie.id_serie);
                                                                    setSelectedAction('delete');
                                                                }}
                                                                variant="destructive"
                                                                size="sm"
                                                                className="flex items-center"
                                                            >
                                                                <Trash2 className='w-3 h-3' />
                                                            </Button>

                                                            <AlertDialogHandle
                                                                title={`Eliminar ${serie.nombre_club} - ${serie.nombre_serie}`}
                                                                description={`¿Estas seguro de querer eliminar la serie ${serie.nombre_serie}?`}
                                                                confirmLabel="Eliminar"
                                                                cancelLabel="Cancelar"
                                                                onConfirm={() => handleDelete(serie.id_serie)}
                                                                open={isSelected === serie.id_serie && selectedAction === 'delete'}
                                                                onOpenChange={(open) => {
                                                                    if (!open) {
                                                                        setIsSelected(null);
                                                                        setSelectedAction(null);
                                                                    }
                                                                }}
                                                            />
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
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                className="flex items-center"
                                                                disabled
                                                            >
                                                                <Trash2 className='w-3 h-3' />
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
                                    <p>No hay series registradas.</p>
                                </div>
                            )}
                            {filteredSeries.length === 0 && serieList.length > 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No se encontraron series que coincidan con la búsqueda.</p>
                                </div>
                            )}
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
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div >
    );
};

