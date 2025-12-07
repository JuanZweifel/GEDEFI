import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Trash2, Search, History, FileText, AlertCircle, CheckCircle, Upload, X } from 'lucide-react';
import { getJugadores, uploadExcel, getLesiones } from '../services/jugadoresService';
import { getClub, getClubs } from '../services/clubServices.ts';
import { getSeries } from '../services/serieService.ts';
import { AlertDialogHandle } from '../components/alert-dialog-component';
import { toast } from "sonner";
import { useAuth } from '../contexts/authContext';
import { DialogAddJugador, DialogEditJugador, DialogViewJugador, ButtonDeleteJugador } from '../forms/players-form';
import { DialogAddLesion, DialogEditLesion, DialogViewLesion, ButtonDeleteLesion } from '../forms/lesion-form';
import { DialogEditFichaJugador, DialogViewFichaJugador, DialogDeleteFichaJugador } from '../forms/ficha-jugador-form';
import { Input } from '../components/ui/input';
import { Loader2 } from 'lucide-react';
import { getFichasPorFiltro } from '../services/fichaJugadorService.ts';

// Exportaciones de type
import type { UploadExcelProps, JugadorType } from "../types.tsx"
import { useLocation, useNavigate, useParams } from 'react-router';


// Aqui empieza la logica de cargar el excel
export const UploadExcel: React.FC<UploadExcelProps> = ({
    refreshJugadores,
    onUploadComplete,
    openHistory
}) => {
    const { token } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [pendingFile, setPendingFile] = useState<FormData | null>(null);

    // 🕓 Estado de carga
    const [isLoading, setIsLoading] = useState(false);

    const MAX_FILE_SIZE_MB = 5;
    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

    const showAlert = (message: string) => {
        setAlertMessage(message);
        setIsAlertOpen(true);
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validar extensión del nombre
        if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
            showAlert("Por favor seleccione un archivo Excel (.xlsx o .xls)");
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        // Validar tamaño
        if (file.size > MAX_FILE_SIZE_BYTES) {
            toast.error(`El archivo excede el tamaño máximo permitido de ${MAX_FILE_SIZE_MB} MB.`);
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        setPendingFile(formData);

        showAlert("¿Desea agregar a todos los jugadores que aparecen en el archivo?");

        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleConfirmUpload = async () => {
        if (!pendingFile) return;
        if (!token) {
            toast.error("No se encontró token de autenticación. Por favor inicia sesión.");
            return;
        }

        // 🕓 Activar estado de carga
        setIsLoading(true);

        try {
            const response = await uploadExcel<{
                message: string;
                insertados: number;
                saltados: number;
                results: any[];
            }>(pendingFile, token);

            const results = response.results ?? [];
            console.log(results)

            const processedResults = results.map(item => ({
                ...item,
                fecha_creacion: new Date().toLocaleString(),
                rut: item.rut,
                nombreCompleto: `${item.primer_nombre} ${item.segundo_nombre ?? ''} ${item.primer_apellido} ${item.segundo_apellido ?? ''}`.trim()
            }));

            if (onUploadComplete) onUploadComplete(processedResults);

            await refreshJugadores();

            toast.success("Archivo procesado correctamente ✅");
            if (openHistory) openHistory();
        } catch (error: any) {
            console.error(error);

            if (error.message) {
                toast.error(error.message);
            } else {
                toast.warning("Error al subir el archivo ⚠️");
            }
        } finally {
            // 🕓 Desactivar estado de carga
            setIsLoading(false);
            setPendingFile(null);
        }
    };

    return (
        <>
            <input
                type="file"
                accept=".xlsx, .xls"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileUpload}
            />

            <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading} // ❌ Desactivar mientras carga
                style={{
                    borderColor: "#0000db",
                    color: "#0000db",
                    opacity: isLoading ? 0.6 : 1, // efecto visual
                    cursor: isLoading ? "not-allowed" : "pointer"
                }}
            >
                {isLoading ? (
                    <>
                        <span className="animate-spin mr-2">🔄</span> Cargando...
                    </>
                ) : (
                    <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Excel
                    </>
                )}
            </Button>

            <AlertDialogHandle
                title="Mensaje"
                description={alertMessage}
                confirmLabel={
                    isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                            Cargando...
                        </>
                    ) : (
                        "Aceptar"
                    )
                }
                cancelLabel="Cancelar"
                open={isAlertOpen}
                onOpenChange={(open) => {
                    if (!open && pendingFile) setPendingFile(null);
                    setIsAlertOpen(open);
                }}
                onConfirm={async () => {
                    if (alertMessage.includes("¿Desea agregar")) {
                        await handleConfirmUpload();
                    }
                    if (!isLoading) setIsAlertOpen(false);
                }}
                confirmDisabled={isLoading}
            />
        </>
    );
};
// Aqui termina la logica de cargar el excel 


// Aqui comienza el modulo Principal
export const RegistroJugadoresModule: React.FC = () => {
    const [activeTab, setActiveTab] = useState('jugadores');
    const [isUploadHistoryOpen, setIsUploadHistoryOpen] = useState(false);
    const [uploadHistory, setUploadHistory] = useState<any[]>([]);
    const [historyFilter, setHistoryFilter] = useState('ALL');
    const [injuries, setInjuries] = useState<any[]>([]);
    const [players, setPlayers] = useState<JugadorType[]>([]);
    const [selectedClub, setSelectedClub] = useState<string | undefined>(undefined);
    const [selectedSerie, setSelectedSerie] = useState<string | null>(null);
    const [fichas, setFichas] = useState<any[]>([]);
    const [clubs, setClubs] = useState<{ id_club: number; nombre: string }[]>([]);
    const [allSeries, setAllSeries] = useState<{ id_serie: number; nombre_serie: string; id_club: number }[]>([]);
    const [series, setSeries] = useState<{ id_serie: number; nombre_serie: string }[]>([]);
    const [busquedaRealizada, setBusquedaRealizada] = useState(false);
    const { token, id_club, admin } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedClubFilter, setSelectedClubFilter] = useState<string>("ALL");
    const [mapaJugadorClub, setMapaJugadorClub] = useState<Map<string, number>>(new Map());
    const [isLoading, setIsLoading] = useState(true)


    // enrutamiento react router
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams();

    //Use effect de ruta dashboard
    useEffect(() => {
        const path = location.pathname

        switch (true) {
            case path === "/dashboard/registro-jugadores":
            case path === "/dashboard/registro-jugadores/":
                navigate("/dashboard/registro-jugadores/jugadores", { replace: true })
                break;
            case path.includes("registro-jugadores/lesiones"):
                setActiveTab("lesiones")
                break;
            case path.includes("registro-jugadores/fichas"):
                setActiveTab("fichas")
                break;
            case path.includes("registro-jugadores/historial"):
                setActiveTab("historial")
                break;
            default:
                setActiveTab("jugadores")
                break;
        }
    }, [location.pathname])


    const fetchJugadores = async (): Promise<JugadorType[]> => {
        if (!token) return [];

        try {
            const data = await getJugadores<JugadorType[]>(token);
            return data;
        } catch (error) {
            console.error("Error al obtener jugadores:", error);
            return [];
        }
    };

    useEffect(() => {
        if (!token) return;

        fetchJugadores().then((res) => {
            setPlayers(res);
        });
    }, [token, admin, id_club]);



    const fetchLesiones = async (): Promise<void> => {
        if (!token) return;

        try {
            // EL BACKEND YA FILTRA SOLO
            const data = await getLesiones<any[]>(token);
            setInjuries(data);
        } catch (error) {
            console.error("Error cargando lesiones:", error);
        }
    };

    useEffect(() => {
        if (!token) return;
        fetchLesiones();
    }, [token]);


    const buscarFichas = async () => {
        if (!token) return;

        try {
            const params = new URLSearchParams();

            if (selectedSerie) {
                params.append("id_serie", selectedSerie);
            }

            // sólo los admin pueden filtrar por club
            if (admin && selectedClub) {
                params.append("id_club", selectedClub);
            }

            const data = await getFichasPorFiltro<any[]>(token);

            setFichas(data);

        } catch (error) {
            console.error("Error al obtener fichas:", error);
            setFichas([]);
        }
    };

    const fetchClubs = async () => {
        console.log("sdazfsfdgsfhgsdfhsdfhbdfhgdfsdf")
        if (!token) return;

        try {
            if (admin) {
                const data = await getClubs<any>(token);
                setClubs(data.items);
            } else if (id_club) {
                const data = await getClub<any>(id_club, token);

                setClubs([
                    {
                        id_club: data.id_club,
                        nombre: data.nombre_club,
                    },
                ]);
            }
            if (!admin && id_club) {
                console.log("dfsadfsdfsdfsdfs")
                setSelectedClub(id_club.toString());
            }
        } catch (error) {
            console.error("Error al obtener clubes:", error);
        }
        finally {
            setIsLoading(false)
        }
    };

    useEffect(() => {
        if (!token) return;
        fetchClubs();
    }, [token, admin, id_club]);




    const fetchSeries = async () => {
        if (!token) return;

        try {
            const data = await getSeries<any>(token);

            setAllSeries(data.items);
        } catch (err) {
            console.error("Error al obtener series:", err);
        }
    };


    useEffect(() => {
        if (!token) return;
        fetchSeries();
    }, [token]);

    useEffect(() => {
        if (!clubs.length) return;

        // ADMIN → serie depende del club seleccionado
        if (admin && selectedClub) {
            const filtered = allSeries
                .filter(s => s.id_club === Number(selectedClub))
                .map(s => ({
                    id_serie: s.id_serie,
                    nombre_serie: s.nombre_serie
                }));

            setSeries(filtered);
            return;
        }

        // USUARIO DE CLUB
        if (!admin && id_club) {
            const filtered = allSeries
                .filter(s => s.id_club === Number(id_club))
                .map(s => ({
                    id_serie: s.id_serie,
                    nombre_serie: s.nombre_serie
                }));

            setSeries(filtered);

            // si no hay serie ya elegida, limpia
            if (!selectedSerie) {
                setSelectedSerie(null);
            }

            return;
        }

        // Caso sin club aún
        setSeries([]);
    }, [admin, selectedClub, id_club, allSeries]);


    // 🔹 Filtrado historial
    const filteredHistory = uploadHistory.filter(item => {
        if (historyFilter === 'ALL') return true;
        if (historyFilter === 'SUCCESS') return item.status === 'success';
        if (historyFilter === 'ERROR') return item.status === 'error';
        return true;
    });

    const totalProcesados = uploadHistory.length;
    const totalExitosos = uploadHistory.filter(item => item.status === 'success').length;
    const totalErrores = uploadHistory.filter(item => item.status === 'error').length;


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2>Gestión de Jugadores y Registros Médicos</h2>
                <div className="flex space-x-2 items-center">
                    {activeTab === "jugadores" && (
                        <>
                            {!admin && (
                                <UploadExcel
                                    refreshJugadores={async () => {
                                        const updatedPlayers = await fetchJugadores();
                                        setPlayers(updatedPlayers);
                                    }}
                                    onUploadComplete={(result) => setUploadHistory(result)}
                                    openHistory={() => setIsUploadHistoryOpen(true)}
                                />
                            )}

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

                            {!admin && (
                                <DialogAddJugador
                                    refreshJugadores={async () => {
                                        const updatedPlayers = await fetchJugadores();
                                        setPlayers(updatedPlayers);
                                    }}
                                />
                            )}
                        </>
                    )}
                    {activeTab === "lesiones" && (
                        <>
                            {!admin && (
                                <DialogAddLesion refreshLesiones={fetchLesiones} />
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Aqui comienza el modal de Historial de Cargas */}
            <Dialog open={isUploadHistoryOpen} onOpenChange={setIsUploadHistoryOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Historial de Cargas Excel</DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-hidden flex flex-col space-y-4">
                        {/* 🔹 Resumen */}
                        <div className="grid grid-cols-3 gap-4">
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">Total Procesados</p>
                                            <p className="text-2xl font-bold text-[#0000db]">{totalProcesados}</p>
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
                                            <p className="text-2xl font-bold text-green-600">{totalExitosos}</p>
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
                                            <p className="text-2xl font-bold text-red-600">{totalErrores}</p>
                                        </div>
                                        <AlertCircle className="w-8 h-8 text-red-500" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* 🔹 Filtros */}
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

                        {/* 🔹 Tabla de historial */}
                        <div className="flex-1 overflow-auto border rounded-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Fecha/Hora</TableHead>
                                        <TableHead>RUT</TableHead>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Observaciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredHistory.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                                {uploadHistory.length === 0
                                                    ? "No hay registros en el historial"
                                                    : "No hay registros que coincidan con el filtro seleccionado"}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredHistory.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="text-sm">{item.fecha_creacion}</TableCell>
                                                <TableCell className="font-medium">{item.rut}</TableCell>
                                                <TableCell>{item.nombreCompleto}</TableCell>
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
                                                    {item.status === 'error' && item.reason ? (
                                                        <span className="text-red-600 text-sm">{item.reason}</span>
                                                    ) : (
                                                        <span className="text-green-600 text-sm">
                                                            Jugador registrado correctamente
                                                        </span>
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
            {/* Aqui termina el modal de Historial de Cargas */}


            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="jugadores" onClick={() => navigate("/dashboard/registro-jugadores/jugadores")}>Jugadores (JUGADOR)</TabsTrigger>
                    <TabsTrigger value="lesiones" onClick={() => navigate("/dashboard/registro-jugadores/lesiones")}>Lesiones (LESION)</TabsTrigger>
                    <TabsTrigger value="fichas" onClick={() => navigate("/dashboard/registro-jugadores/fichas")}>Fichas (FICHA_JUGADOR)</TabsTrigger>
                </TabsList>

                <TabsContent value="jugadores" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Jugadores Registrados</CardTitle>
                        </CardHeader>

                        <CardContent>

                            {/* 🔹 Input + Select */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">

                                {/* Buscador */}
                                <Input
                                    type="text"
                                    placeholder="Buscar jugador por nombre o RUT..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-64"
                                />

                                {/* Select SOLO para ADMIN */}
                                {admin && (
                                    <Select
                                        value={selectedClubFilter}
                                        onValueChange={(value: any) => setSelectedClubFilter(value)}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Filtrar por club" />
                                        </SelectTrigger>

                                        <SelectContent>
                                            <SelectItem value="ALL">Todos los clubes</SelectItem>
                                            {clubs.map((club) => (
                                                <SelectItem key={club.id_club} value={String(club.id_club)}>
                                                    {club.nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>RUT</TableHead>
                                        <TableHead>Nombre Completo</TableHead>
                                        <TableHead>Fecha Nac.</TableHead>
                                        <TableHead>Condiciones</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {players.length > 0 ? (
                                        players
                                            .filter((player) => {

                                                // 🔹 Búsqueda
                                                const term = searchTerm.toLowerCase();
                                                const fullName = `${player.primer_nombre} ${player.segundo_nombre || ""} ${player.primer_apellido} ${player.segundo_apellido || ""}`.toLowerCase();
                                                const rut = player.rut_jugador.toLowerCase();

                                                const matchesSearch = fullName.includes(term) || rut.includes(term);
                                                if (!matchesSearch) return false;

                                                // 🔹 FILTRO POR CLUB (SOLO ADMIN)
                                                if (admin && selectedClubFilter !== "ALL") {
                                                    const clubDelJugador = mapaJugadorClub.get(player.rut_jugador);
                                                    return String(clubDelJugador) === selectedClubFilter;
                                                }

                                                return true;
                                            })
                                            .map((player) => (
                                                <TableRow key={player.rut_jugador}>
                                                    <TableCell className="font-medium">{player.rut_jugador}</TableCell>

                                                    <TableCell>
                                                        {player.primer_nombre} {player.segundo_nombre || ''}
                                                        {" "}
                                                        {player.primer_apellido} {player.segundo_apellido || ''}
                                                    </TableCell>

                                                    <TableCell>
                                                        {player.fecha_nacimiento
                                                            ? player.fecha_nacimiento.split("T")[0].split("-").reverse().join("/")
                                                            : "—"}
                                                    </TableCell>

                                                    <TableCell>
                                                        <Badge variant={player.enfermedades_cronicas === "Ninguna" ? "outline" : "destructive"}>
                                                            {player.enfermedades_cronicas}
                                                        </Badge>
                                                    </TableCell>

                                                    <TableCell>
                                                        <Badge className={player.jugador_activo ? 'bg-green-500' : 'bg-red-500'}>
                                                            {player.jugador_activo ? 'Activo' : 'Inactivo'}
                                                        </Badge>
                                                    </TableCell>

                                                    <TableCell>
                                                        <div className="flex space-x-1">
                                                            <DialogEditJugador
                                                                jugador={player}
                                                                refreshJugadores={async () => {
                                                                    const updatedPlayers = await fetchJugadores();
                                                                    setPlayers(updatedPlayers);
                                                                }}
                                                            />
                                                            <DialogViewJugador jugador={player} refreshJugadores={async () => { await fetchJugadores(); }} />

                                                            <ButtonDeleteJugador
                                                                rutJugador={player.rut_jugador}
                                                                primerNombre={player.primer_nombre}
                                                                primerApellido={player.primer_apellido}
                                                                refreshJugadores={async () => {
                                                                    const updatedPlayers = await fetchJugadores();
                                                                    setPlayers(updatedPlayers);
                                                                }}
                                                            />
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center text-gray-500 py-4">
                                                No hay jugadores registrados
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="lesiones" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Gestión de Lesiones</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* 🔹 Input de búsqueda */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <Input
                                    type="text"
                                    placeholder="Buscar por RUT, tipo de lesión o estado..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-64"
                                />
                            </div>

                            {injuries.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No hay lesiones registradas</p>
                                </div>
                            ) : (
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
                                        {injuries
                                            .filter((injury) => {
                                                const rut = (injury.rut_jugador || "").toLowerCase();
                                                const tipo = injury.tipo_lesion
                                                    ? "fuera del club"
                                                    : "dentro del club";
                                                const estado = injury.fecha_fin_lesion
                                                    ? new Date(injury.fecha_fin_lesion) >= new Date()
                                                        ? "lesión activa"
                                                        : "lesión terminada"
                                                    : "lesión activa";

                                                const term = searchTerm.toLowerCase();
                                                return (
                                                    rut.includes(term) ||
                                                    tipo.includes(term) ||
                                                    estado.includes(term)
                                                );
                                            })
                                            .map((injury) => (
                                                <TableRow key={injury.id}>
                                                    <TableCell className="font-medium">
                                                        {injury.rut_jugador}
                                                    </TableCell>
                                                    <TableCell>
                                                        {injury.tipo_lesion ? "Fuera del club" : "Dentro del club"}
                                                    </TableCell>
                                                    <TableCell className="max-w-xs truncate">
                                                        {injury.descripcion}
                                                    </TableCell>
                                                    <TableCell>
                                                        {injury.fecha_lesion
                                                            ? injury.fecha_lesion.split("T")[0].split("-").reverse().join("/")
                                                            : "—"}
                                                    </TableCell>
                                                    <TableCell>{injury.tiempo_recuperacion}</TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            className={
                                                                injury.fecha_fin_lesion
                                                                    ? new Date(injury.fecha_fin_lesion) >= new Date()
                                                                        ? "bg-red-500"
                                                                        : "bg-green-500"
                                                                    : "bg-red-500"
                                                            }
                                                        >
                                                            {injury.fecha_fin_lesion
                                                                ? new Date(injury.fecha_fin_lesion) >= new Date()
                                                                    ? "Lesión Activa"
                                                                    : "Lesión Terminada"
                                                                : "Lesión Activa"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex space-x-1">
                                                            <DialogEditLesion
                                                                lesion={injury}
                                                                refreshLesiones={fetchLesiones}
                                                            />
                                                            <DialogViewLesion
                                                                lesion={injury}
                                                                refreshLesiones={fetchLesiones}
                                                            />
                                                            <ButtonDeleteLesion
                                                                id_lesion={injury.id_lesion}
                                                                refreshLesiones={fetchLesiones}
                                                            />
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="fichas" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Fichas de Jugadores por Club/Serie</CardTitle>
                        </CardHeader>

                        <CardContent>
                            <div className="space-y-4">
                                {/* 🔹 Filtro de búsqueda */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <Input
                                        type="text"
                                        placeholder="Buscar ficha por nombre o RUT..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-64"
                                    />
                                </div>

                                {/* 🔹 Selectores */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">

                                    {/* Selección de Club (solo admin) */}
                                    {!isLoading &&
                                        <Select
                                            value={selectedClub}
                                            onValueChange={setSelectedClub}
                                            disabled={!admin}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar Club" />
                                            </SelectTrigger>

                                            <SelectContent>
                                                {clubs.map((club) => (
                                                    <SelectItem key={club.id_club} value={club.id_club.toString()}>
                                                        {club.nombre}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    }

                                    {/* Selección de Serie */}
                                    <Select
                                        value={selectedSerie || ""}
                                        onValueChange={setSelectedSerie}
                                        disabled={!admin && !id_club} // solo avanza si hay club
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar Serie" />
                                        </SelectTrigger>

                                        <SelectContent>
                                            {series.map((serie) => (
                                                <SelectItem key={serie.id_serie} value={serie.id_serie.toString()}>
                                                    {serie.nombre_serie}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    {/* Botón Buscar */}
                                    <Button
                                        style={{ backgroundColor: '#0000db' }}
                                        className="text-white"
                                        onClick={() => {
                                            setBusquedaRealizada(true);
                                            buscarFichas(); // 🔥 ahora solo consulta back
                                        }}
                                        disabled={!selectedSerie}
                                    >
                                        <Search className="w-4 h-4 mr-2" />
                                        Buscar Fichas
                                    </Button>
                                </div>

                                {/* 🔹 Tabla o mensaje */}
                                {fichas.length > 0 ? (
                                    <div className="overflow-auto border rounded-lg">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>RUT</TableHead>
                                                    <TableHead>Nombre Completo</TableHead>
                                                    <TableHead>Club</TableHead>
                                                    <TableHead>Serie</TableHead>
                                                    <TableHead>Fecha Creación</TableHead>
                                                    <TableHead>Acciones</TableHead>
                                                </TableRow>
                                            </TableHeader>

                                            <TableBody>
                                                {fichas
                                                    .filter(ficha => {
                                                        if (!searchTerm) return true;

                                                        const jugador = players.find(j => j.rut_jugador === ficha.rut_jugador);
                                                        const fullName = jugador
                                                            ? `${jugador.primer_nombre} ${jugador.segundo_nombre || ''} ${jugador.primer_apellido} ${jugador.segundo_apellido || ''}`.toLowerCase()
                                                            : '';

                                                        const rut = ficha.rut_jugador.toLowerCase();
                                                        const term = searchTerm.toLowerCase();

                                                        return fullName.includes(term) || rut.includes(term);
                                                    })
                                                    .map(ficha => {
                                                        const jugador = players.find(j => j.rut_jugador === ficha.rut_jugador);
                                                        const serieCompleta = allSeries.find(s => s.id_serie === ficha.id_serie);
                                                        const club = clubs.find(c => c.id_club === serieCompleta?.id_club);

                                                        return (
                                                            <TableRow key={ficha.id_ficha}>
                                                                <TableCell>{ficha.rut_jugador}</TableCell>
                                                                <TableCell>
                                                                    {jugador
                                                                        ? `${jugador.primer_nombre} ${jugador.segundo_nombre || ''} ${jugador.primer_apellido} ${jugador.segundo_apellido || ''}`
                                                                        : "Jugador no encontrado"}
                                                                </TableCell>
                                                                <TableCell>{club?.nombre || "Club no encontrado"}</TableCell>
                                                                <TableCell>{serieCompleta?.nombre_serie || "Serie no encontrada"}</TableCell>
                                                                <TableCell>
                                                                    {new Date(ficha.fecha_creacion).toLocaleDateString('es-CL')}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="flex space-x-1">
                                                                        <DialogEditFichaJugador
                                                                            ficha={ficha}
                                                                            refreshFichas={buscarFichas}
                                                                            jugador={jugador}
                                                                        />
                                                                        <DialogViewFichaJugador
                                                                            ficha={ficha}
                                                                            jugador={jugador}
                                                                        />
                                                                        <DialogDeleteFichaJugador
                                                                            fichaRut={ficha.rut_jugador}
                                                                            fichaIdSerie={ficha.id_serie}
                                                                            refreshFichas={buscarFichas}
                                                                        />
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                            </TableBody>
                                        </Table>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p>
                                            {!busquedaRealizada
                                                ? "Seleccione una serie para ver las fichas de jugadores"
                                                : "No hay fichas para la serie seleccionada"}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

            </Tabs>
        </div >
    )
}
// Aqui termina el modulo principal
