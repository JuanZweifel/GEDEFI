import React, { useEffect, useState } from 'react';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Separator } from '../components/ui/separator';
import { Button } from '../components/ui/button';
import { Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import type { ClubType, TipoOrdenEnum } from '../types';
import { getClubs } from '../services/clubServices';
import { toast } from 'sonner';
import { useAuth } from '../contexts/authContext';
import { Progress } from '../components/ui/progress';
import { AlertDialogHandle } from '../components/alert-dialog-component';
import { createOrden, payOrden } from '../services/ordenPagoServices';

type OrdenFormProps = {
    onSuccess: (...args: any[]) => void;
}

const TipoOrden: TipoOrdenEnum[] = [
    "Mensualidad",
    "Multa",
    "Pase",
    "Servicio Basico",
    "Donacion",
    "Subvencion",
    "Otro",
]
export const OrdenPagoForm: React.FC<OrdenFormProps> = ({ onSuccess }) => {
    const [clubList, setClubList] = useState<ClubType[]>([])
    const [tipoOrden, setTipoOrden] = useState(TipoOrden[0])
    const [tipoMovimiento, setTipoMovimiento] = useState("")
    const [monto, setMonto] = useState<number | null>(null)
    const [descripcion, setDescripcion] = useState("")
    const [vencimiento, setVencimiento] = useState("")
    const [selectedClub, setSelectedClub] = useState<number>(0)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isFetching, setIsFetching] = useState<number>(0)
    const [open, setOpen] = useState(false)

    const { token } = useAuth()

    const handleAlert = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const form = e.currentTarget;

        if (form.reportValidity()) {
            setOpen(true) //disparamos el alert
        }
    }

    const handleSubmit = async () => {
        setIsLoading(true)
        try {
            const OrdenObject: Record<string, any> = {
                tipo_orden: tipoOrden,
                tipo_movimiento: tipoMovimiento,
                monto: monto,
                descripcion: descripcion,
                id_club: selectedClub,
                ...!!vencimiento ? { fecha_vencimiento: vencimiento } : {}
            }

            const response = await createOrden<any>(OrdenObject, token)
            toast.success(response.message)

            onSuccess()
            setOpen(false)
        } catch (error) {
            toast.error(String(error))
        } finally {
            setIsLoading(false)
        }
    }

    const fetchClubs = async () => {
        let data: any = [];
        try {
            setIsFetching(20);
            data = await getClubs<any>(token);
            setIsFetching(50)
            setClubList(data.items);
            setIsFetching(80)
            if (data.length === 0) toast.info("No hay clubs registrados en la base de datos.");
        } catch (error: any) {
            toast.warning(String(error));
        } finally {
            if (data.length === 0) setClubList([]);
            setIsFetching(100);
        }
    };

    useEffect(() => {
        fetchClubs();
    }, [])
    return (
        <>
            {isFetching < 100 && (
                <div>
                    <Progress value={isFetching} />
                </div>
            )}

            {isFetching === 100 && (
                <form className="space-y-4" onSubmit={(e) => handleAlert(e)}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label className="block mb-2">Tipo de movimiento (*):</Label>
                            <Select
                                value={tipoMovimiento}
                                onValueChange={(v: string) => setTipoMovimiento(v)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Seleccione tipo de movimiento" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Ingreso">Ingreso</SelectItem>
                                    <SelectItem value="Egreso">Egreso</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label className="block mb-2">Monto $ (*):</Label>
                            <Input
                                value={monto || "0"}
                                onChange={(e) => setMonto(Number(e.target.value))}
                                required
                                min={1}
                                max={99999999}
                            />
                        </div>

                        <div>
                            <Label className="block mb-2">Tipo de orden (*):</Label>
                            <Select
                                value={tipoOrden}
                                onValueChange={(val: string) =>
                                    setTipoOrden(val as TipoOrdenEnum)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccione tipo de orden" />
                                </SelectTrigger>
                                <SelectContent>
                                    {TipoOrden.map((tp) => (
                                        <SelectItem key={tp} value={tp}>
                                            {tp}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label className="block mb-2">Fecha de vencimiento:</Label>
                            <Input
                                type="date"
                                value={vencimiento}
                                onChange={(e) => setVencimiento(e.target.value)}
                                min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
                            />
                        </div>

                        <div className="col-span-2">
                            <Label className="block mb-2">Descripción:</Label>
                            <Textarea
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                                required
                                maxLength={500}
                            />
                        </div>
                        <div className='col-span-2'>
                            <Label className="block mb-2">Seleccione club:</Label>
                            <Select
                                value={selectedClub}
                                onValueChange={(v: string) => setSelectedClub(Number(v))}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Seleccione un club" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={0}>Ninguno</SelectItem>
                                    {clubList.map((club) => (
                                        <SelectItem key={club.id_club} value={club.id_club}>{club.nombre_club}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>


                        <div className="col-span-2">
                            <Separator />
                        </div>

                        <div className="col-span-2 text-center">
                            <span className="text-sm text-gray-500">
                                Todos los campos con (*) deben ser rellenados
                            </span>
                        </div>

                        <div className="flex justify-end space-x-2 col-span-2">
                            <Button
                                variant="outline"
                                type="button"
                                disabled={isLoading}
                                onClick={() => onSuccess()}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                style={{ backgroundColor: "#0000db" }}
                                className="text-white"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                {isLoading ? "Guardando..." : "Guardar"}
                            </Button>
                            <AlertDialogHandle
                                title="Creación de orden de pago"
                                description="¿Esta seguro de crear la órden de pago?"
                                confirmLabel="Aceptar"
                                cancelLabel="Cancelar"
                                onConfirm={handleSubmit}
                                open={open}
                                onOpenChange={setOpen}
                            />
                        </div>
                    </div>
                </form>
            )}
        </>
    );
}


export const PagoForm: React.FC<OrdenFormProps & { id_orden_pago: string }> = ({ onSuccess, id_orden_pago }) => {
    const [tipoPago, setTipoPago] = useState("Efectivo")
    const [metodoPago, setMetodoPago] = useState("")
    const [transaccion, setTransaccion] = useState("")
    const [rutPago, setRutPago] = useState("")
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [open, setOpen] = useState(false)

    const { token } = useAuth()

    const handleAlert = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const form = e.currentTarget;

        if (form.reportValidity()) {
            setOpen(true) //disparamos el alert
        }
    }

    const handleSubmit = async () => {
        setIsLoading(true)
        try {
            const OrdenObject: Record<string, any> = {
                tipo_pago: tipoPago,
                metodo_pago: metodoPago,
                numero_transaccion: transaccion,
                usuario_pago: rutPago
            }

            const response = await payOrden<any>(id_orden_pago, OrdenObject, token)
            toast.success(response.message)

            onSuccess()
            setOpen(false)
        } catch (error) {
            toast.error(String(error))
        } finally {
            setIsLoading(false)
        }
    }

    const validarRut = (rut: string): boolean => {
        // Limpiar espacios y mayúsculas
        rut = rut.replace(/\s+/g, "").toUpperCase();

        // Separar número y dígito verificador
        const [numero, dv] = rut.split("-");
        if (!numero || !dv) return false;

        // Validar que el número sea solo dígitos
        if (!/^\d+$/.test(numero)) return false;

        // Calcular dígito verificador
        let suma = 0;
        let factor = 2;
        for (let i = numero.length - 1; i >= 0; i--) {
            suma += parseInt(numero[i], 10) * factor;
            factor = factor === 7 ? 2 : factor + 1;
        }

        const dvCalculado = 11 - (suma % 11);
        let dvEsperado = "";
        if (dvCalculado === 11) dvEsperado = "0";
        else if (dvCalculado === 10) dvEsperado = "K";
        else dvEsperado = dvCalculado.toString();

        return dv === dvEsperado;
    };

    return (
        <form className="space-y-4" onSubmit={(e) => handleAlert(e)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label className="block mb-2">Tipo de pago (*):</Label>
                    <Select
                        value={tipoPago}
                        onValueChange={(v: string) => setTipoPago(v)}
                        required
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Seleccione tipo de pago" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Efectivo">Efectivo</SelectItem>
                            <SelectItem value="Transferencia">Transferencia</SelectItem>
                            <SelectItem value="Pago en linea">Pago en linea</SelectItem>
                            <SelectItem value="Otro">Otro</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Label className="block mb-2">Metodo de pago (*):</Label>
                    <Input
                        value={metodoPago}
                        pattern="^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$"
                        onChange={(e) => setMetodoPago(e.target.value)}
                        required
                        minLength={3}
                        maxLength={20}
                    />
                </div>

                <div>
                    <Label className="block mb-2">N°Transacción:</Label>
                    <Input
                        value={transaccion}
                        onChange={(e) => setTransaccion(e.target.value)}
                        minLength={4}
                        maxLength={50}
                        disabled={tipoPago !== "Transferencia"}
                        required={tipoPago === "Transferencia"}
                    />
                </div>
                <div>
                    <Label className="block mb-2">Rut pagador:</Label>
                    <Input
                        value={rutPago}
                        onChange={(e) => {
                            const value = e.target.value;
                            setRutPago(value);

                            // Validación con tu función
                            if (!validarRut(value)) {
                                e.currentTarget.setCustomValidity("RUT inválido. Verifica el formato y dígito verificador.");
                            } else {
                                e.currentTarget.setCustomValidity(""); // limpio el mensaje si es válido
                            }
                        }}
                        minLength={9}
                        maxLength={10}
                        required
                    />
                </div>

                <div className="col-span-2">
                    <Separator />
                </div>

                <div className="col-span-2 text-center">
                    <span className="text-sm text-gray-500">
                        Todos los campos con (*) deben ser rellenados
                    </span>
                </div>

                <div className="flex justify-end space-x-2 col-span-2">
                    <Button
                        variant="outline"
                        type="button"
                        disabled={isLoading}
                        onClick={() => onSuccess()}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        style={{ backgroundColor: "#0000db" }}
                        className="text-white"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        {isLoading ? "Guardando..." : "Guardar"}
                    </Button>
                    <AlertDialogHandle
                        title="Pagar Orden de pago"
                        description="¿Esta seguro de marcar como pagada la órden de pago?"
                        confirmLabel="Aceptar"
                        cancelLabel="Cancelar"
                        onConfirm={handleSubmit}
                        open={open}
                        onOpenChange={setOpen}
                    />
                </div>
            </div>
        </form>
    )
}