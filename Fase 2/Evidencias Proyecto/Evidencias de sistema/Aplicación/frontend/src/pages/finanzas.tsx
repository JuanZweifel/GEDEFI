import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
    Plus, Eye
} from 'lucide-react';
import { getIngresos, getOrdenesPago, getEgresos, cancelOrden, pendingOrder } from '../services/ordenPagoServices';
import type { OrdenPagoType, BalanceType, OrdenDetailsType } from '../types';
import { toast } from 'sonner';
import { useAuth } from '../contexts/authContext';
import { useLocation, useNavigate, useParams } from 'react-router';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { DialogHandle } from '../components/dialog-component';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { AlertDialogHandle } from '../components/alert-dialog-component';
import { OrdenPagoForm, PagoForm } from '../forms/ordenPagoForm';


export const OrdenDetails: React.FC<OrdenDetailsType> = ({ orden }) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <Label className="block mb-2">Tipo de orden</Label>
                    <Input value={orden.tipo_orden} disabled />
                </div>
                <div>
                    <Label className="block mb-2">Tipo de movimiento</Label>
                    <Input value={orden.tipo_movimiento} disabled />
                </div>
                <div>
                    <Label className="block mb-2">Emitido por</Label>
                    <Input value={orden.usuario_emisor} disabled />
                </div>
                <div>
                    <Label className="block mb-2">Pagado por</Label>
                    <Input value={orden.usuario_pago ? orden.usuario_pago : "No posee"} disabled />
                </div>
                {orden.estado_orden === "Pagada" && (
                    <div className="flex items-center space-x-3">
                        <div className="flex-1">
                            <Label className="block mb-2">Fecha de emisión</Label>
                            <Input value={orden.fecha_emision} disabled />
                        </div>
                        <div className="flex-1">
                            <Label className="block mb-2">Fecha de pago</Label>
                            <Input value={orden.fecha_pago} disabled />
                        </div>
                        {!!orden.fecha_vencimiento &&
                            <div className="flex-1">
                                <Label className="block mb-2">Fecha de vencimiento</Label>
                                <Input value={orden.fecha_vencimiento} disabled />
                            </div>
                        }
                    </div>
                )}
                {orden.estado_orden !== "Pagada" && (
                    <div className="flex items-center space-x-3">
                        <div className="flex-1">
                            <Label className="block mb-2">Fecha de emisión</Label>
                            <Input value={orden.fecha_emision} disabled />
                        </div>
                        {!!orden.fecha_vencimiento &&
                            <div className="flex-1">
                                <Label className="block mb-2">Fecha de vencimiento</Label>
                                <Input value={orden.fecha_vencimiento} disabled />
                            </div>
                        }
                    </div>
                )}
                <div className='flex items-center space-x-3'>
                    <Label className="block mb-1">Estado</Label>
                    <Badge className={
                        orden.estado_orden === "Pagada" ?
                            'bg-green-500' :
                            orden.estado_orden === "Pendiente" ? "bg-yellow-500" :
                                orden.estado_orden === "Vencida" ? "bg-red-500" : "bg-gray-500"
                    }>
                        {orden.estado_orden}
                    </Badge>
                    {orden.estado_orden === "Pagada" && !!orden.tipo_pago &&
                        <Badge
                            className="bg-blue-500"
                        >
                            {orden.tipo_pago}
                        </Badge>
                    }
                    {orden.estado_orden === "Pagada" && !!orden.metodo_pago &&
                        <Badge
                            className="bg-blue-500"
                        >
                            {orden.metodo_pago}
                        </Badge>
                    }
                </div>
                <div className='col-span-2'>
                    <Textarea
                        placeholder="Escribe tu descripción aquí..."
                        value={orden.descripcion ? orden.descripcion : "No hay descripción definida"}
                        disabled
                        className="h-40" // Ajusta altura si quieres más grande
                    />
                </div>
            </div>
        </div>
    )
}

type OrdenPagoDropdownProps = {
    orden: OrdenPagoType;
    setAction: React.Dispatch<React.SetStateAction<string | null>>
    setSelectedOrden: React.Dispatch<React.SetStateAction<OrdenPagoType | undefined>>
}
export const OrdenDropdown: React.FC<OrdenPagoDropdownProps> = ({ orden, setAction, setSelectedOrden }) => {
    const navigate = useNavigate()
    const handleOption = (action: string) => {
        if(action === "pay") {
            navigate(`/dashboard/finanzas/${orden.id_orden_pago}/${action}`, {replace:true})
        }
        setAction(action)
        setSelectedOrden(orden)
    }
    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <Button variant="outline">Opciones</Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48">

                {orden.estado_orden !== "Pagada" &&
                    <DropdownMenuItem onClick={() => handleOption(orden.estado_orden === "Anulada" ? "delete" : "cancel")}>
                        {orden.estado_orden === "Anulada" ? "Eliminar" : "Anular"}
                    </DropdownMenuItem>
                }

                {orden.estado_orden !== "Anulada" &&
                    <DropdownMenuItem onClick={() => handleOption(orden.estado_orden !== "Pagada" ? "pay" : "pending")}>
                        {orden.estado_orden !== "Pagada" ? "Marcar como pagada" : "Marcar como pendiente"}
                    </DropdownMenuItem>
                }
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export const FinanzasModule: React.FC = () => {
    const [isFetching, setIsFetching] = useState<boolean>(true);
    const [ordenesList, setOrdenesList] = useState<OrdenPagoType[]>([]);
    const [balances, setBalances] = useState<BalanceType[]>([]);
    const [selectedOrden, setSelectedOrden] = useState<OrdenPagoType | undefined>();
    const [action, setAction] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

    const { token, admin } = useAuth();

    // Enrutamiento
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams<{ id_orden?: string }>();

    // filtros
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [filterTipoMovimiento, setFilterTipoMovimiento] = useState<string>("");
    const [filterTipoPago, setFilterTipoPago] = useState<string>("");
    const [filterMes, setFilterMes] = useState<string>("");
    const [filterEstado, setFilterEstado] = useState<string>("");

    /*useEffect(() => {
        if (!!admin) fetchBalances();
        fetchOrdenes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);*/

    useEffect(() => {
        const path = location.pathname;

        switch (true) {
            case path.endsWith("/new"):
                setAction("new");
                setIsDialogOpen(true);
                break;

            case path.endsWith("/edit") && !!params.id_orden:
                setAction("edit");
                setIsDialogOpen(true);
                break;

            case path.endsWith("/pay") && !!params.id_orden:
                setAction("pay");
                setIsDialogOpen(true);
                break;

            case !!params.id_orden:
                setAction("view");
                setIsDialogOpen(true);
                break;

            case path === "/dashboard/finanzas":
            case path === "/dashboard/finanzas/":
                setAction("");
                setIsDialogOpen(false);
                if (!!admin) fetchBalances();
                fetchOrdenes()
                break;

            default:
                break;
        }
    }, [location.pathname, params.id_orden, admin]);

    useEffect(() => {
        if (!params.id_orden) return;
        if (isFetching) return;
        if (ordenesList.length === 0) {
            navigate("/dashboard/finanzas", { replace: true });
            return;
        }

        const ordenEncontrada = ordenesList.find(
            (o) => o.id_orden_pago?.trim() === params.id_orden?.trim()
        );

        if (ordenEncontrada) {
            setSelectedOrden(ordenEncontrada);
        } else {
            toast.warning("No se encontro la orden de pago");
            navigate("/dashboard/finanzas", { replace: true });
        }
    }, [params.id_orden, isFetching, ordenesList, navigate]);

    const handleCloseDialog = (open: boolean) => {
        if (!open) navigate("/dashboard/finanzas");
    };

    const fetchOrdenes = async () => {
        try {
            const data = await getOrdenesPago(token);
            setOrdenesList(Array.isArray(data) ? data : []);
            console.log(data)
            if (!data || data.length === 0) {
                toast.info("No hay ordenes de pago registradas.");
                setOrdenesList([]);
            }
        } catch (error) {
            toast.warning(String(error));
        } finally {
            setIsFetching(false);
        }
    };

    const fetchBalances = async () => {
        try {
            const ingresos = await getIngresos<any>();
            const egresos = await getEgresos<any>();
            const balanceAnual = (ingresos?.total_ingresos ?? 0) - (egresos?.total_egresos ?? 0);
            const data: BalanceType[] = [
                { tipo: "Ingresos", balance: ingresos?.total_ingresos ?? 0, variacion: ingresos?.variacion ?? 0 },
                { tipo: "Egresos", balance: egresos?.total_egresos ?? 0, variacion: egresos?.variacion ?? 0 },
                { tipo: "Balance", balance: balanceAnual }
            ];
            setBalances(data);
            if (data.length === 0) setBalances([]);
        } catch (error) {
            toast.warning(String(error));
        }
    };

    const handleCancel = async (id_orden: string) => {
        try {
            const data = await cancelOrden<any>(id_orden, token)
            toast.success(data.message)
            setSelectedOrden(undefined)
        } catch (error) {
            console.log(error)
            toast.info(String(error))
        } finally {
            fetchOrdenes();
        }
    }

    const handlePending = async (id_orden: string) => {
        try {
            const data = await pendingOrder<any>(id_orden, token)
            toast.success(data.message)
            setSelectedOrden(undefined)
        } catch (error) {
            console.log(error)
            toast.info(String(error))
        } finally {
            fetchOrdenes();
        }
    }

    // Helper: determina estado lógico de la orden según campos de la BD
    const computeEstado = (o: OrdenPagoType) => {
        const now = new Date();
        const vencida = !!o.fecha_vencimiento && new Date(o.fecha_vencimiento) < now;

        if (o.estado_orden === "pagada") return "pagadas";
        if (o.estado_orden === "anulada") return "anuladas";
        if (o.estado_orden === "pendiente" && vencida) return "vencidas";
        if (o.estado_orden === "pendiente") return "pendientes";

        return o.estado_orden.toLowerCase(); // fallback seguro
    };

    // Filtro completo
    const filteredOrdenes = (() => {
        let baseList = [...ordenesList];

        // Estado
        if (filterEstado && filterEstado !== "all") {
            baseList = baseList.filter((o) => computeEstado(o) === filterEstado);
        }

        // Tipo de movimiento
        if (filterTipoMovimiento && filterTipoMovimiento !== "all") {
            const term = filterTipoMovimiento.toLowerCase();
            baseList = baseList.filter(
                (o) => (o.tipo_movimiento ?? "").toLowerCase() === term
            );
        }

        // Tipo de pago
        if (filterTipoPago && filterTipoPago !== "all") {
            const term = filterTipoPago.toLowerCase();
            baseList = baseList.filter(
                (o) => (o.tipo_pago ?? "").toLowerCase() === term
            );
        }

        // Mes de fecha_emision
        if (filterMes && filterMes !== "all") {
            const m = Number(filterMes);
            if (!Number.isNaN(m)) {
                baseList = baseList.filter((o) => {
                    if (!o.fecha_emision) return false;
                    const dt = new Date(o.fecha_emision);
                    return dt.getMonth() + 1 === m;
                });
            }
        }

        // Búsqueda general
        if (searchTerm && searchTerm.trim() && searchTerm !== "all") {
            const t = searchTerm.toLowerCase().trim();
            baseList = baseList.filter((o) => {
                return (
                    (o.id_orden_pago ?? "").toString().toLowerCase().includes(t) ||
                    (o.nombre_club ?? "").toLowerCase().includes(t) ||
                    (o.descripcion ?? "").toLowerCase().includes(t) ||
                    (o.tipo_movimiento ?? "").toLowerCase().includes(t) ||
                    (o.tipo_pago ?? "").toLowerCase().includes(t)
                );
            });
        }

        return baseList;
    })();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2>Gestión Financiera</h2>
                <div className="flex space-x-2">
                    {!!admin &&
                        <Button style={{ backgroundColor: '#0000db' }} className="text-white" onClick={() => navigate('/dashboard/finanzas/new')}>
                            <Plus className="w-4 h-4 mr-2" />
                            Nueva Orden de Pago
                        </Button>
                    }
                </div>
            </div>

            {/* Summary Cards */}
            {!!admin && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {balances.map(balance => (
                        <Card key={balance.tipo}>
                            <CardHeader>
                                <CardTitle className={
                                    balance.tipo === "Egresos" ? "text-red-600" : balance.tipo === "Ingresos" ? "text-green-600" : "text-[#0000db]"
                                }>
                                    {balance.tipo === "Balance" ? "Balance del mes" : `${balance.tipo} del mes`}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-medium">
                                    {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(Number(balance.balance))}
                                </div>
                                <p className="text-sm text-muted-foreground">{balance.variacion ?? ""} vs mes anterior</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filtros</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                            <Input placeholder="Buscar por club, id o descripción..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>

                        <div className="md:col-span-1">
                            <Select value={filterTipoMovimiento} onValueChange={(v: string) => setFilterTipoMovimiento(v)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Todos movimientos" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos movimientos</SelectItem>
                                    <SelectItem value="Ingreso">Ingreso</SelectItem>
                                    <SelectItem value="Egreso">Egreso</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="md:col-span-1">
                            <Select value={filterTipoPago} onValueChange={(v: string) => setFilterTipoPago(v)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Todos pagos" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos pagos</SelectItem>
                                    <SelectItem value="Efectivo">Efectivo</SelectItem>
                                    <SelectItem value="Transferencia">Transferencia</SelectItem>
                                    <SelectItem value="Pago en linea">Pago en línea</SelectItem>
                                    <SelectItem value="Otro">Otro metodo de pago</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="md:col-span-1">
                            <Select value={filterMes} onValueChange={(v: string) => setFilterMes(v)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Mes" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos meses</SelectItem>
                                    <SelectItem value="1">Enero</SelectItem>
                                    <SelectItem value="2">Febrero</SelectItem>
                                    <SelectItem value="3">Marzo</SelectItem>
                                    <SelectItem value="4">Abril</SelectItem>
                                    <SelectItem value="5">Mayo</SelectItem>
                                    <SelectItem value="6">Junio</SelectItem>
                                    <SelectItem value="7">Julio</SelectItem>
                                    <SelectItem value="8">Agosto</SelectItem>
                                    <SelectItem value="9">Septiembre</SelectItem>
                                    <SelectItem value="10">Octubre</SelectItem>
                                    <SelectItem value="11">Noviembre</SelectItem>
                                    <SelectItem value="12">Diciembre</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Estado en nueva fila para evitar overflow en pantallas pequeñas */}
                        <div className="md:col-span-6">
                            <Select value={filterEstado} onValueChange={(v: string) => setFilterEstado(v)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Todos estados" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos estados</SelectItem>
                                    <SelectItem value="pendiente">Pendientes</SelectItem>
                                    <SelectItem value="anulada">Anuladas</SelectItem>
                                    <SelectItem value="pagada">Pagadas</SelectItem>
                                    <SelectItem value="vencida">Vencidas</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Orders list */}
            <Card>
                <CardHeader>
                    <CardTitle>Órdenes de Pago</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {filteredOrdenes.map((orden) => {
                            return (
                                <div key={orden.id_orden_pago} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <p className="font-medium">Fecha emisión: {orden.fecha_emision?.split?.("T")?.[0] ?? ""}</p>
                                        <p className="font-medium">Orden #{orden.id_orden_pago} {orden.nombre_club ? `- ${orden.nombre_club}` : ""}</p>
                                        <p className="text-sm text-muted-foreground">{orden.descripcion}</p>
                                        <p className="text-sm">Vencimiento: {orden.fecha_vencimiento ? orden.fecha_vencimiento : "N/A"}</p>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-2">
                                        <div className={`font-medium ${orden.tipo_movimiento === "Ingreso" ? "text-green-500" : "text-red-500"}`}>
                                            {orden.tipo_movimiento === "Ingreso" ? "+" : "-"}{new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(orden.monto)}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Badge
                                                className={
                                                    orden.estado_orden === "Pendiente" ? "bg-yellow-500" :
                                                        orden.estado_orden === "Anulada" ? "bg-gray-500" :
                                                            orden.estado_orden === "Pagada" ? "bg-green-500" :
                                                                "bg-red-500"
                                                }
                                            >
                                                {orden.estado_orden}
                                            </Badge>

                                            <Badge className="bg-blue-500">
                                                {orden.tipo_pago}
                                            </Badge>
                                        </div>

                                        <div className="flex gap-2 mt-1">
                                            <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate(`/dashboard/finanzas/${orden.id_orden_pago}`, { replace: true })}>
                                                <Eye className="w-4 h-4 mr-1" /> Ver Detalles
                                            </Button>
                                            <OrdenDropdown orden={orden} setAction={setAction} setSelectedOrden={setSelectedOrden} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {filteredOrdenes.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                <p>No hay órdenes que coincidan con los filtros.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {action === "new" && (
                <DialogHandle
                    size='w-full'
                    title="Crear orden de pago"
                    trigger={<div />}
                    open={isDialogOpen}
                    onOpenChange={handleCloseDialog}
                >
                    {() => <OrdenPagoForm onSuccess={handleCloseDialog} />}
                </DialogHandle>
            )}

            {action === "view" && (
                <DialogHandle<OrdenPagoType>
                    title={selectedOrden ? (selectedOrden.nombre_club ? `N°Orden - ${selectedOrden.id_orden_pago} - ${selectedOrden.nombre_club}` : `N°Orden - ${selectedOrden.id_orden_pago}`) : 'Cargando...'}
                    trigger={<div />}
                    open={isDialogOpen}
                    onOpenChange={handleCloseDialog}
                    initialData={selectedOrden}
                    size='w-full'
                >
                    {() => {
                        if (!selectedOrden) {
                            return (
                                <div className="p-6 flex items-center justify-center">
                                    <span>Cargando detalles de la orden</span>
                                </div>
                            );
                        }

                        return <OrdenDetails orden={selectedOrden} />;
                    }}
                </DialogHandle>
            )}
            {action === "cancel" &&
                <AlertDialogHandle
                    title={`Anulación de Orden N°${selectedOrden?.id_orden_pago}`}
                    description={`¿Estas seguro de querer anular la orden ${selectedOrden?.id_orden_pago}?`}
                    confirmLabel="Confirmar"
                    cancelLabel="Cancelar"
                    onConfirm={() => handleCancel(selectedOrden?.id_orden_pago)}
                    open={selectedOrden !== undefined && action === "cancel"}
                    onOpenChange={open => !open && setSelectedOrden(undefined)}
                />
            }

            {action === "pay" && (
                <DialogHandle
                    size='w-full'
                    title="Pagar Orden de pago"
                    trigger={<div />}
                    open={isDialogOpen}
                    onOpenChange={handleCloseDialog}
                >
                    {() => <PagoForm id_orden_pago={selectedOrden?.id_orden_pago} onSuccess={handleCloseDialog} />}
                </DialogHandle>
            )}

            {action === "pending" && 
                <AlertDialogHandle
                    title={`Anular pago de Orden N°${selectedOrden?.id_orden_pago}`}
                    description={`¿Estas seguro de querer anular el pago de la orden ${selectedOrden?.id_orden_pago}?`}
                    confirmLabel="Confirmar"
                    cancelLabel="Cancelar"
                    onConfirm={() => handlePending(selectedOrden?.id_orden_pago)}
                    open={selectedOrden !== undefined && action === "pending"}
                    onOpenChange={open => !open && setSelectedOrden(undefined)}
                />
            }
        </div>
    );
};