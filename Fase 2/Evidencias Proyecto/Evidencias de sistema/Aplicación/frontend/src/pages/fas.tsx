import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { DollarSign, Calendar, User } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/authContext";
import { getFas, getUsosFas } from "../services/fasServices";
import { DialogAddFas, DialogEditFas, ButtonDeleteFas } from "../forms/fas-form";
import { DialogAddUsoFas, DialogEditUsoFas, ButtonDeleteUsoFas } from "../forms/usosFasForm";


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
    club_nombre: string;
};

export const FasModule: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();


    const params = new URLSearchParams(location.search);
    const initialTab = params.get("tab") || "fondos";

    // 🔹 Estado con valor inicial dinámico
    const [activeTab, setActiveTab] = useState(initialTab);

    const [fasList, setFasList] = useState<Fas[]>([]);
    const [usosList, setUsosList] = useState<UsoFas[]>([]);
    const [isFetching, setIsFetching] = useState(true);

    const { token } = useAuth();


    const handleTabChange = (value: string) => {
        setActiveTab(value);
        navigate(`?tab=${value}`, { replace: true });
    };

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
            console.log(data)
            console.log("✅ Datos obtenidos de uso_fas:", data);
            setUsosList(data);
        } catch (error) {
            console.error("❌ Error al obtener usos FAS:", error);
            toast.error("Error al obtener los registros de uso del FAS");
        }
    };

    useEffect(() => {
        if (!token) return;
        fetchFas();
        if (activeTab === "usos") {
            fetchUsosFas();
        }
    }, [activeTab, token]);


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2>Gestión de Fondo de Ayuda Solidaria (FAS)</h2>

                <div className="flex space-x-2">
                    {/* Botón de agregar FAS solo en tab fondos */}
                    {activeTab === "fondos" && !fasDelAnioActual && (
                        <DialogAddFas refreshFas={fetchFas} />
                    )}

                    {/* Botón de agregar Uso solo en tab usos */}
                    {activeTab === "usos" && (
                        <DialogAddUsoFas
                            refreshUsosFas={fetchUsosFas}
                            fasList={fasList}
                        />
                    )}
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange}>
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
                            <Table className="table-fixed">
                                <TableHeader>
                                    <TableRow>
                                        {["Jugador", "RUT", "Club", "Monto Usado", "Fecha Uso", "Descripción", "Año Fondo", "Acciones"].map((h, i) => (
                                            <TableHead key={i}>{h}</TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {usosList.map((uso) => {
                                        const fondo = fasList.find((f) => f.id_fas === uso.id_fas);
                                        return (
                                            <TableRow key={uso.id_uso_fas} className="align-middle">
                                                <TableCell className="whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <User className="w-4 h-4 mr-1 text-blue-500" />
                                                        {uso.jugador_nombre}
                                                    </div>
                                                </TableCell>

                                                <TableCell>{uso.rut_jugador}</TableCell>
                                                <TableCell>{uso.club_nombre}</TableCell>

                                                <TableCell className="whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        ${uso.monto_usado.toLocaleString("es-CL")}
                                                    </div>
                                                </TableCell>

                                                <TableCell className="whitespace-nowrap">
                                                    {new Date(uso.fecha_uso).toLocaleDateString("es-CL")}
                                                </TableCell>

                                                <TableCell className="max-w-[120px] break-words whitespace-normal">
                                                    {uso.descripcion_gasto}
                                                </TableCell>

                                                <TableCell>{fondo ? fondo.anio_fas : "-"}</TableCell>

                                                <TableCell className="flex space-x-1">
                                                    <DialogEditUsoFas uso={uso} refreshUsosFas={fetchUsosFas} />
                                                    <ButtonDeleteUsoFas
                                                        id_uso_fas={uso.id_uso_fas}
                                                        refreshUsosFas={fetchUsosFas}
                                                    />
                                                </TableCell>
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