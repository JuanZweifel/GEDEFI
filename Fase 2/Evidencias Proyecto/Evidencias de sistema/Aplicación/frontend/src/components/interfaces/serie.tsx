import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.tsx';
import { Button } from '../ui/button.tsx';
import { Badge } from '../ui/badge.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs.tsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table.tsx';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "../ui/collapsible"
import { Label } from '../ui/label.tsx';
import { DialogHandle } from '../dialog-component.tsx';
import { Input } from '../ui/input.tsx';
import {
    Plus, Edit, Eye, Users,
    Trash2
} from 'lucide-react';

import { toast } from 'sonner';
import { type SerieType } from '../../types.tsx';
import { getSeries } from '../../services/serieService.ts';

// Enhanced Clubs & Series Module (CLUB, SERIE, DETALLE_CLUB_JUGADOR, FICHA_JUGADOR)
export const SerieModule: React.FC = () => {
    const [activeTab, setActiveTab] = useState('series');
    const [serieList, setSerieList] = useState<SerieType[]>([]);

    const fetchSeries = async () => {
        const data = await getSeries<SerieType[]>();
        setSerieList(data)
    }
    useEffect(() => {
        fetchSeries();
    }, [])

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2>Gestión de Series</h2>
                <div className="flex space-x-2">
                    <Button variant="outline" style={{ borderColor: '#0000db', color: '#0000db' }}>
                        <Plus className="w-4 h-4 mr-2" />
                        Nueva Serie
                    </Button>
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
                                        <TableRow >
                                            <TableCell className="font-medium">{serie.nombre_serie}</TableCell>
                                            <TableCell>{serie.nombre_club}</TableCell>
                                            <TableCell>{serie.cantidad_jugadores}</TableCell>
                                            <TableCell>{serie.fecha_creacion}</TableCell>
                                            <TableCell>
                                                <Badge className={serie.serie_activa ? "bg-green-500" : "bg-gray-500"}>
                                                    {serie.serie_activa ? "Activa" : "Inactiva"}
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
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div >
    );
};