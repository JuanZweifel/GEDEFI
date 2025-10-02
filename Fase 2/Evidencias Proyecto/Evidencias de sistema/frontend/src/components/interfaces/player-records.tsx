import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle,  } from '../ui/dialog';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
    Plus, Edit, Trash2, Eye, Search, 
    History, FileText, AlertCircle, CheckCircle,
    Upload, X
} from 'lucide-react';

export const PlayerRecordsModule: React.FC = () => {
    const [activeTab, setActiveTab] = useState('players');
    const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
    const [isUploadHistoryOpen, setIsUploadHistoryOpen] = useState(false);
    const [uploadHistory, setUploadHistory] = useState<any[]>([]);
    const [historyFilter, setHistoryFilter] = useState('ALL');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const players = [
        {
            rut: "12345678-9", primer_nombre: "Carlos", segundo_nombre: "Alberto",
            primer_apellido: "Rodríguez", segundo_apellido: "Silva", email: "carlos.rodriguez@email.cl",
            fecha_nacimiento: "1995-03-15", pierna_habil: "Derecha", peso: 75, estatura: 180,
            imc: 23.1, talla_camiseta: "M", talla_short: "M", talla_botin: 42,
            condiciones_cronicas: "Ninguna", activo: true
        },
        {
            rut: "98765432-1", primer_nombre: "María", segundo_nombre: "Fernanda",
            primer_apellido: "González", segundo_apellido: "López", email: "maria.gonzalez@email.cl",
            fecha_nacimiento: "1997-07-22", pierna_habil: "Izquierda", peso: 62, estatura: 165,
            imc: 22.8, talla_camiseta: "S", talla_short: "S", talla_botin: 38,
            condiciones_cronicas: "Asma leve", activo: true
        }
    ];

    const injuries = [
        {
            id: 1, rut_jugador: "12345678-9", jugador_nombre: "Carlos Rodríguez",
            tipo_lesion: "Esguince de tobillo", descripcion: "Lesión durante entrenamiento",
            fecha_lesion: "2024-08-15", semanas_recuperacion: 3, activo: true
        },
        {
            id: 2, rut_jugador: "98765432-1", jugador_nombre: "María González",
            tipo_lesion: "Desgarro muscular", descripcion: "Lesión en cuádriceps derecho",
            fecha_lesion: "2024-07-10", semanas_recuperacion: 6, activo: false
        }
    ];

    const playerHistory = [
        { fecha: "2024-09-15", rut_jugador: "12345678-9", accion: "Actualización médica", detalle: "Evaluación física anual" },
        { fecha: "2024-09-10", rut_jugador: "98765432-1", accion: "Recuperación lesión", detalle: "Alta médica por desgarro muscular" }
    ];

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
            alert('Por favor seleccione un archivo Excel (.xlsx o .xls)');
            return;
        }

        // Simulate Excel processing with mock data
        const mockUploadResults = [
            {
                id: Date.now() + 1,
                rut: "11111111-1",
                nombre: "Pedro Morales García",
                email: "pedro.morales@email.cl",
                status: "success",
                fecha: new Date().toLocaleString(),
                error: null
            },
            {
                id: Date.now() + 2,
                rut: "22222222-2",
                nombre: "Ana Sofía López",
                email: "ana.lopez@email.cl",
                status: "success",
                fecha: new Date().toLocaleString(),
                error: null
            },
            {
                id: Date.now() + 3,
                rut: "12345678-9",
                nombre: "Carlos Rodríguez Silva",
                email: "carlos.rodriguez@email.cl",
                status: "error",
                fecha: new Date().toLocaleString(),
                error: "El jugador ya existe en la base de datos"
            },
            {
                id: Date.now() + 4,
                rut: "33333333-3",
                nombre: "Luis Fernando Torres",
                email: "",
                status: "error",
                fecha: new Date().toLocaleString(),
                error: "Email requerido"
            },
            {
                id: Date.now() + 5,
                rut: "44444444-4",
                nombre: "Isabella Martínez Cruz",
                email: "isabella.martinez@email.cl",
                status: "success",
                fecha: new Date().toLocaleString(),
                error: null
            }
        ];

        // Add results to upload history
        setUploadHistory(prev => [...mockUploadResults, ...prev]);

        // Show history modal
        setIsUploadHistoryOpen(true);

        // Clear the file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const openFileDialog = () => {
        fileInputRef.current?.click();
    };

    const filteredHistory = uploadHistory.filter(item => {
        if (historyFilter === 'ALL') return true;
        if (historyFilter === 'SUCCESS') return item.status === 'success';
        if (historyFilter === 'ERROR') return item.status === 'error';
        return true;
    });

    const successCount = uploadHistory.filter(item => item.status === 'success').length;
    const errorCount = uploadHistory.filter(item => item.status === 'error').length;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2>Gestión de Jugadores y Registros Médicos</h2>
                <div className="flex space-x-2">
                    <Button
                        variant="outline"
                        onClick={openFileDialog}
                        style={{ borderColor: '#0000db', color: '#0000db' }}
                    >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Excel
                    </Button>
                    {uploadHistory.length > 0 && (
                        <Button
                            variant="outline"
                            onClick={() => setIsUploadHistoryOpen(true)}
                            style={{ borderColor: '#FF8C00', color: '#FF8C00' }}
                        >
                            <History className="w-4 h-4 mr-2" />
                            Historial ({uploadHistory.length})
                        </Button>
                    )}
                    <Button style={{ backgroundColor: '#0000db' }} className="text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo Jugador
                    </Button>
                </div>
            </div>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
            />

            {/* Upload History Modal */}
            <Dialog open={isUploadHistoryOpen} onOpenChange={setIsUploadHistoryOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Historial de Cargas Excel</DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-hidden flex flex-col space-y-4">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-3 gap-4">
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">Total Procesados</p>
                                            <p className="text-2xl font-bold text-[#0000db]">{uploadHistory.length}</p>
                                        </div>
                                        <FileText className="w-8 h-8 text-[#0000db]" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">Exitosos</p>
                                            <p className="text-2xl font-bold text-green-600">{successCount}</p>
                                        </div>
                                        <CheckCircle className="w-8 h-8 text-green-500" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">Con Errores</p>
                                            <p className="text-2xl font-bold text-red-600">{errorCount}</p>
                                        </div>
                                        <AlertCircle className="w-8 h-8 text-red-500" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Filter Controls */}
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                                <label className="text-sm font-medium">Filtrar por estado:</label>
                                <Select value={historyFilter} onValueChange={setHistoryFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">Todos</SelectItem>
                                        <SelectItem value="SUCCESS">Solo exitosos</SelectItem>
                                        <SelectItem value="ERROR">Solo errores</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setUploadHistory([])}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Limpiar Historial
                            </Button>
                        </div>

                        {/* History Table */}
                        <div className="flex-1 overflow-auto border rounded-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Fecha/Hora</TableHead>
                                        <TableHead>RUT</TableHead>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Observaciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredHistory.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                                {uploadHistory.length === 0 ?
                                                    "No hay registros en el historial" :
                                                    "No hay registros que coincidan con el filtro seleccionado"
                                                }
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredHistory.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="text-sm">{item.fecha}</TableCell>
                                                <TableCell className="font-medium">{item.rut}</TableCell>
                                                <TableCell>{item.nombre}</TableCell>
                                                <TableCell>{item.email || '-'}</TableCell>
                                                <TableCell>
                                                    {item.status === 'success' ? (
                                                        <Badge className="bg-green-500 text-white">
                                                            <CheckCircle className="w-3 h-3 mr-1" />
                                                            Exitoso
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="destructive">
                                                            <X className="w-3 h-3 mr-1" />
                                                            Error
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {item.error ? (
                                                        <span className="text-red-600 text-sm">{item.error}</span>
                                                    ) : (
                                                        <span className="text-green-600 text-sm">Jugador registrado correctamente</span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button
                            onClick={() => setIsUploadHistoryOpen(false)}
                            style={{ backgroundColor: '#0000db' }}
                            className="text-white"
                        >
                            Cerrar
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="players">Jugadores (JUGADOR)</TabsTrigger>
                    <TabsTrigger value="injuries">Lesiones (LESION)</TabsTrigger>
                    <TabsTrigger value="records">Fichas (FICHA_JUGADOR)</TabsTrigger>
                    <TabsTrigger value="history">Historial</TabsTrigger>
                </TabsList>

                <TabsContent value="players" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Jugadores Registrados</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>RUT</TableHead>
                                        <TableHead>Nombre Completo</TableHead>
                                        <TableHead>Fecha Nac.</TableHead>
                                        <TableHead>Pierna Hábil</TableHead>
                                        <TableHead>Físico (Peso/Altura)</TableHead>
                                        <TableHead>Condiciones</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {players.map((player) => (
                                        <TableRow key={player.rut}>
                                            <TableCell className="font-medium">{player.rut}</TableCell>
                                            <TableCell>
                                                {player.primer_nombre} {player.segundo_nombre} {player.primer_apellido} {player.segundo_apellido}
                                            </TableCell>
                                            <TableCell>{player.fecha_nacimiento}</TableCell>
                                            <TableCell>{player.pierna_habil}</TableCell>
                                            <TableCell>{player.peso}kg / {player.estatura}cm</TableCell>
                                            <TableCell>
                                                <Badge variant={player.condiciones_cronicas === "Ninguna" ? "outline" : "destructive"}>
                                                    {player.condiciones_cronicas}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={player.activo ? 'bg-green-500' : 'bg-red-500'}>
                                                    {player.activo ? 'Activo' : 'Inactivo'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex space-x-1">
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="w-4 h-4" />
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

                <TabsContent value="injuries" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Gestión de Lesiones</CardTitle>
                                <Button style={{ backgroundColor: '#0000db' }} className="text-white">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Registrar Lesión
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Jugador</TableHead>
                                        <TableHead>Tipo de Lesión</TableHead>
                                        <TableHead>Descripción</TableHead>
                                        <TableHead>Fecha Lesión</TableHead>
                                        <TableHead>Recuperación (Semanas)</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {injuries.map((injury) => (
                                        <TableRow key={injury.id}>
                                            <TableCell className="font-medium">{injury.jugador_nombre}</TableCell>
                                            <TableCell>{injury.tipo_lesion}</TableCell>
                                            <TableCell className="max-w-xs truncate">{injury.descripcion}</TableCell>
                                            <TableCell>{injury.fecha_lesion}</TableCell>
                                            <TableCell>{injury.semanas_recuperacion}</TableCell>
                                            <TableCell>
                                                <Badge className={injury.activo ? 'bg-red-500' : 'bg-green-500'}>
                                                    {injury.activo ? 'En Recuperación' : 'Recuperado'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex space-x-1">
                                                    <Button variant="outline" size="sm">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    {injury.activo && (
                                                        <Button variant="outline" size="sm">
                                                            <CheckCircle className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="records" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Fichas de Jugadores por Club/Serie</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar Club" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">FC Barcelona Santiago</SelectItem>
                                            <SelectItem value="2">Real Madrid Chile</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar Serie" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">Serie A Masculina</SelectItem>
                                            <SelectItem value="2">Serie Juvenil</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button style={{ backgroundColor: '#0000db' }} className="text-white">
                                        <Search className="w-4 h-4 mr-2" />
                                        Buscar Fichas
                                    </Button>
                                </div>

                                <div className="text-center py-8 text-gray-500">
                                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>Seleccione un club y serie para ver las fichas de jugadores</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Historial de Jugadores</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>RUT Jugador</TableHead>
                                        <TableHead>Acción</TableHead>
                                        <TableHead>Detalle</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {playerHistory.map((item, i) => (
                                        <TableRow key={i}>
                                            <TableCell>{item.fecha}</TableCell>
                                            <TableCell>{item.rut_jugador}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{item.accion}</Badge>
                                            </TableCell>
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