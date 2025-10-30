import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { Eye, Edit, Plus, DollarSign, Calendar, User, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { DialogHandle } from "../components/dialog-component";
import { useAuth } from "../contexts/authContext";

import { getFas, getUsosFas } from "../services/fasServices";
import { DialogAddFas, DialogViewFas, DialogEditFas, ButtonDeleteFas } from "../forms/fas-form";
import { DialogAddUsoFas } from "../forms/usosFasForm";


// Tipos de datos
type Fas = {
    id_fas: number;
    anio_fas: number;
    monto_inicial: number;
    monto_disponible: number;
    descripcion?: string;
    activo: boolean;
    fecha_creacion: string;
    fecha_modificacion: string;
};

type UsoFas = {
    id_uso_fas: number;
    id_fas: number;
    rut_jugador: string;
    jugador_nombre: string;
    monto_usado: number;
    descripcion_gasto: string;
    fecha_uso: string;
};

export const FasModule: React.FC = () => {
    const [activeTab, setActiveTab] = useState("fondos");
    const [fasList, setFasList] = useState<Fas[]>([]);
    const [usosList, setUsosList] = useState<UsoFas[]>([]);
    const [isFetching, setIsFetching] = useState(true);

    const { token } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();


    const currentYear = new Date().getFullYear();
    const fasDelAnioActual = fasList.some(fas => fas.anio_fas === currentYear);



    const fetchFas = async () => {
        if (!token) return;
        try {
            const data = await getFas<Fas[]>(token);
            setFasList(data);
        } catch (error) {
            console.error(error);
            toast.error("Error al obtener los fondos FAS");
        } finally {
            setIsFetching(false);
        }
    };

    const fetchUsosFas = async () => {
        if (!token) return;
        try {
            const data = await getUsosFas<UsoFas[]>(token);
            setUsosList(data);
        } catch (error) {
            console.error(error);
            toast.error("Error al obtener los registros de uso del FAS");
        }
    };

    useEffect(() => {
        if (token) {
            fetchFas();
            fetchUsosFas();
        }
    }, [token]);


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2>Gestión de Fondo de Ayuda Solidaria (FAS)</h2>
                <div className="flex space-x-2">
                    {/* Solo muestra el botón si NO existe un FAS del año actual */}
                    {!fasDelAnioActual && <DialogAddFas refreshFas={fetchFas} />}
                    <DialogAddUsoFas refreshUsosFas={fetchUsosFas} />
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="fondos">Fondos</TabsTrigger>
                    <TabsTrigger value="usos">Usos del Fondo</TabsTrigger>
                </TabsList>

                {/* TAB DE FONDOS */}
                <TabsContent value="fondos" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Fondos Registrados</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        {["Año", "Monto Inicial", "Disponible", "Descripción", "Fecha Creación", "Acciones"].map(
                                            (h, i) => (
                                                <TableHead key={i}>{h}</TableHead>
                                            )
                                        )}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {fasList.map((f) => (
                                        <TableRow key={f.id_fas}>
                                            <TableCell className="font-medium">{f.anio_fas}</TableCell>
                                            <TableCell>${f.monto_inicial.toLocaleString("es-CL")}</TableCell>
                                            <TableCell>${f.monto_disponible.toLocaleString("es-CL")}</TableCell>
                                            <TableCell className="whitespace-pre-wrap break-words">{f.descripcion || "-"}</TableCell>
                                            <TableCell>
                                                {new Date(f.fecha_creacion).toLocaleDateString("es-CL", {
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                    year: "numeric",
                                                })}
                                            </TableCell>
                                            <TableCell className="flex space-x-1">
                                                <DialogViewFas fas={f} />
                                                <DialogEditFas
                                                    refreshFas={fetchFas}
                                                    fas={f} />
                                                <ButtonDeleteFas
                                                    id_fas={f.id_fas}
                                                    anio_fas={f.anio_fas}
                                                    refreshFas={fetchFas} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAB DE USOS */}
                <TabsContent value="usos" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Usos del Fondo (Ayudas entregadas)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        {["Jugador", "RUT", "Monto Usado", "Descripción", "Fecha Uso", "Año Fondo"].map((h, i) => (
                                            <TableHead key={i}>{h}</TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {usosList.map((uso) => {
                                        const fondo = fasList.find((f) => f.id_fas === uso.id_fas);
                                        return (
                                            <TableRow key={uso.id_uso_fas}>
                                                <TableCell className="flex items-center">
                                                    <User className="w-4 h-4 mr-1 text-blue-500" />
                                                    {uso.jugador_nombre}
                                                </TableCell>
                                                <TableCell>{uso.rut_jugador}</TableCell>
                                                <TableCell className="flex items-center">
                                                    <DollarSign className="w-4 h-4 mr-1 text-green-600" />
                                                    ${uso.monto_usado.toLocaleString("es-CL")}
                                                </TableCell>
                                                <TableCell>{uso.descripcion_gasto}</TableCell>
                                                <TableCell>
                                                    <Calendar className="w-4 h-4 mr-1 inline" />
                                                    {new Date(uso.fecha_uso).toLocaleDateString("es-CL")}
                                                </TableCell>
                                                <TableCell>{fondo ? fondo.anio_fas : "-"}</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};