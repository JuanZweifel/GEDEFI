import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
    Plus
} from 'lucide-react';
import { getIngresos, getOrdenesPago, getEgresos, getBalanceAnual } from '../services/ordenPagoServices';
import type { OrdenPagoType, BalanceType } from '../types';
import { toast } from 'sonner';

export const FinanceModule: React.FC = () => {
    const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
    const [ordenesList, setOrdenesList] = useState<OrdenPagoType[]>([])
    const [balances, setBalances] = useState<BalanceType[]>([])

    const fetchOrdenes = async () => {
        let data: OrdenPagoType[]
        try {
            data = await getOrdenesPago()
            setOrdenesList(data)
            if (data.length === 0) {
                toast.info("No hay ordenes de pago registradas.")
                setOrdenesList([])
            }
        } catch (error) {
            toast.warning(String(error))
        } finally {
            // aqui va los loadings
        }
    }

    const fetchBalances = async () => {
        let data: BalanceType[] = []
        try {
            const ingresos = await getIngresos<any>();
            const egresos = await getEgresos<any>();
            const balanceAnual = ingresos.total_ingresos - egresos.total_egresos;
            data.push(
                { tipo: "Ingresos", balance: ingresos.total_ingresos, variacion: ingresos.variacion },
                { tipo: "Egresos", balance: egresos.total_egresos, variacion: egresos.variacion },
                { tipo: "Balance", balance: balanceAnual}
            )
            setBalances(data)
            if (data.length === 0) {
                setBalances([])
            }
        } catch (error) {
            console.log(error)
            toast.warning(String(error))
        }
    }
    useEffect(() => {
        // TODO: simular permiso (se debe modificar)
        if (true) {
            fetchBalances();
        }
        fetchOrdenes();
    }, [])

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2>Gestión Financiera</h2>
                <Button style={{ backgroundColor: '#0000db' }} className="text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Orden de Pago
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {balances.map(balance => (
                    <Card>
                        <CardHeader>
                            <CardTitle className={
                                balance.tipo === "Egresos"? "text-red-600" : balance.tipo === "Ingresos"? "text-green-600" : "text-[#0000db]"}
                                >
                                    {balance.tipo === "Balance"? "Balance del mes" : `${balance.tipo} del mes`}
                                </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-medium">
                                {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(Number(balance.balance))}
                            </div>
                            <p className="text-sm text-muted-foreground">{balance.variacion} vs mes anterior</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Pending Orders */}
            <Card>
                <CardHeader>
                    <CardTitle>Órdenes de Pago Pendientes</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {ordenesList.map((orden) => (
                            <div key={orden.id_orden_pago} className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <p className="font-medium">Orden #{orden.id_orden_pago} - {orden.nombre_club}</p>
                                    <p className="text-sm text-muted-foreground">{orden.descripcion}</p>
                                    <p className="text-sm">Vence: {orden.fecha_vencimiento}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-[#0000db]">
                                        {new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(orden.monto)}
                                    </p>
                                    <Button size="sm" variant="outline">Marcar como Pagado</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};