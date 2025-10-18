import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
    Plus
} from 'lucide-react';
import { getOrdenesPago } from '../services/ordenPagoServices';
import type { OrdenPagoType } from '../types';
import { toast } from 'sonner';

export const FinanceModule: React.FC = () => {
    const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
    const [ordenesList, setOrdenesList] = useState<OrdenPagoType[]>([])

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
    useEffect(() => {
        fetchOrdenes();
    })

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
                <Card>
                    <CardHeader>
                        <CardTitle className="text-green-600">Ingresos del Mes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-medium">$2,450,000</div>
                        <p className="text-sm text-muted-foreground">+12% vs mes anterior</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-red-600">Egresos del Mes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-medium">$1,890,000</div>
                        <p className="text-sm text-muted-foreground">-5% vs mes anterior</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-[#0000db]">Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-medium">$560,000</div>
                        <p className="text-sm text-muted-foreground">Utilidad neta</p>
                    </CardContent>
                </Card>
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