import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Trash2, Search, History, FileText, AlertCircle, CheckCircle, Upload, X, Plus } from 'lucide-react';
import { getJugadores, uploadExcel, getLesiones, } from '../services/jugadoresService';
import { getDetallesClubJugador } from '../services/detalleClubJugadorService';
import { getClubs } from '../services/clubServices';
import { getFichasPorFiltro } from '../services/fichaJugadorService'
import { getSeries } from '../services/serieService';
import { AlertDialogHandle } from '../components/alert-dialog-component';
import { toast } from "sonner";
import { useAuth } from '../contexts/authContext';
import { DialogAddJugador, DialogEditJugador, DialogViewJugador, ButtonDeleteJugador } from '../forms/players-form';
import { DialogAddLesion, DialogEditLesion, DialogViewLesion, ButtonDeleteLesion } from '../forms/lesion-form';
import { DialogEditFichaJugador, DialogViewFichaJugador, DialogDeleteFichaJugador } from '../forms/ficha-jugador-form';
import { Input } from '../components/ui/input';

// Exportaciones de type

import type { UploadExcelProps, JugadorType } from "../types.tsx"
import { useLocation, useNavigate, useParams } from 'react-router';

export const RegistroJugadoresModule: React.FC = () => {
    const [activeTab, setActiveTab] = useState('jugadores');
    const [isUploadHistoryOpen, setIsUploadHistoryOpen] = useState(false);
    const [uploadHistory, setUploadHistory] = useState<any[]>([]);
    const [historyFilter, setHistoryFilter] = useState('ALL');
    const [injuries, setInjuries] = useState<any[]>([]);
    const [playerHistory, setPlayerHistory] = useState<any[]>([]);
    const [players, setPlayers] = useState<JugadorType[]>([]);
    const [selectedClub, setSelectedClub] = useState<string | undefined>(undefined);
    const [selectedSerie, setSelectedSerie] = useState<string | null>(null);
    const [fichas, setFichas] = useState<any[]>([]);
    const [clubs, setClubs] = useState<{ id_club: number; nombre: string }[]>([]);
    const [allSeries, setAllSeries] = useState<{ id_serie: number; nombre_serie: string; id_club: number }[]>([]);
    const [series, setSeries] = useState<{ id_serie: number; nombre_serie: string }[]>([]);
    const [busquedaRealizada, setBusquedaRealizada] = useState(false);
    const { token, club_id } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");

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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2>Gestión de Jugadores y Registros Médicos</h2>
                <div className="flex space-x-2 items-center">
                    {activeTab === "jugadores" && (
                        <>
                            <Button
                                variant="outline"
                                style={{ borderColor: "#0000db", color: "#0000db" }}
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

                            <Button style={{ backgroundColor: "#0000db" }} className="text-white">
                                <Plus className="w-4 h-4 mr-2" />
                                Nuevo Jugador
                            </Button>
                        </>
                    )}
                    {activeTab === "lesiones" && (
                        <>
                            <Button style={{ backgroundColor: "#0000db" }} className="text-white">
                                <Plus className="w-4 h-4 mr-2" />
                                Añadir lesion
                            </Button>
                        </>
                    )}
                </div>
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="jugadores" onClick={() => navigate("/dashboard/registro-jugadores/jugadores")}>Jugadores (JUGADOR)</TabsTrigger>
                    <TabsTrigger value="lesiones" onClick={() => navigate("/dashboard/registro-jugadores/lesiones")}>Lesiones (LESION)</TabsTrigger>
                    <TabsTrigger value="fichas" onClick={() => navigate("/dashboard/registro-jugadores/fichas")}>Fichas (FICHA_JUGADOR)</TabsTrigger>
                    <TabsTrigger value="historial" onClick={() => navigate("/dashboard/registro-jugadores/historial")}>Historial</TabsTrigger>
                </TabsList>

                <TabsContent value="jugadores" className="space-y-4">
                    <p>JUGADORES</p>
                </TabsContent>

                <TabsContent value="lesiones" className="space-y-4">
                    <p>LESION</p>
                </TabsContent>

                <TabsContent value="fichas" className="space-y-4">
                    <p>FICHAS</p>
                </TabsContent>

                <TabsContent value="historial" className="space-y-4">
                    <p>HISTORIAL</p>
                </TabsContent>
            </Tabs>
        </div >
    )
}