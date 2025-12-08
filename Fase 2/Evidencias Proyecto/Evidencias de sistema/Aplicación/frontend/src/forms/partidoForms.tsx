import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../components/ui/button.tsx';
import { Label } from '../components/ui/label.tsx';
import { Input } from '../components/ui/input.tsx';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/select.tsx';
import { Separator } from '../components/ui/separator.tsx';
import { Textarea } from '../components/ui/textarea.tsx';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { AlertDialogHandle } from '../components/alert-dialog-component.tsx';
import { useAuth } from '../contexts/authContext.tsx';
import { createPartido, generarCalendario, getRendimientosPartido, updatePartido, updateRendimientoPartido } from '../services/partidosService.ts';
import { getSeries, getUniqueSeries } from '../services/serieService.ts';
import { getCanchas } from '../services/canchaService.ts';
import { getClubs } from '../services/clubServices.ts';
import type { PartidoType, SerieType, CanchaType, ClubType, RendimientoPartidoType } from '../types.tsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table.tsx';
import { Loading } from '../components/loading-bar-component.tsx';
import { Checkbox } from '../components/ui/checkbox.tsx';

type PartidoFormProps = {
    partido?: PartidoType | null
    isEdit?: boolean;
    token: string | null
    admin?: boolean | null;
    onSuccess: (...args: any[]) => void
}

export const PartidoForm: React.FC<PartidoFormProps> = ({ onSuccess }) => {
    const [fecha, setFecha] = useState('')
    const [horaIni, setHoraIni] = useState('')
    const [horaFin, setHoraFin] = useState('')
    const [golesLocal, setGolesLocal] = useState<number>(0)
    const [golesVisita, setGolesVisita] = useState<number>(0)
    const [estado, setEstado] = useState<"programado" | "en_curso" | "cancelado" | "finalizado">("programado")
    const [tipo, setTipo] = useState<"campeonato" | "amistoso" | "playoff" | "final">()
    const [observaciones, setObservaciones] = useState<string>("")
    const [cancha, setCancha] = useState<string>("")
    const [clubLocal, setClubLocal] = useState<string>("")
    const [clubVisita, setClubVisita] = useState<string>("")
    const [serie, setSerie] = useState<string>("")
    const [serieList, setSerieList] = useState<SerieType[]>([])
    const [canchaList, setCanchaList] = useState<CanchaType[]>([])
    const [clubList, setClubList] = useState<ClubType[]>([])
    const [open, setOpen] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<number>(0)

    const { token } = useAuth()

    useEffect(() => {
        fetchData(token)
    }, [token])

    const fetchData = async (token: string | null) => {
        setIsLoading(20)
        const [seriesData, canchasData, clubesData] = await Promise.all([
            getSeries<any>(token),
            getCanchas<CanchaType[]>(token),
            getClubs<any>(token, null, null, null, null),
        ]);
        setIsLoading(60)
        setSerieList(seriesData.items)
        setCanchaList(canchasData)
        setClubList(clubesData.items)
        setIsLoading(100)
    }

    const handleAlert = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (e.currentTarget.reportValidity()) setOpen(true);
    };

    const handleSubmit = async () => {
        try {
            setIsLoading(20)

            // La serie seleccionada es una categoría (mismo nombre para ambos clubes).
            // Buscamos la serie correspondiente a cada club por nombre + id_club
            const id_club_local = clubLocal ? Number(clubLocal) : null;
            const id_club_visitante = clubVisita ? Number(clubVisita) : null;

            const id_local = serieList.find((s: SerieType) => s.id_club === id_club_local && s.nombre_serie === serie)?.id_serie ?? null;
            const id_visitante = serieList.find((s: SerieType) => s.id_club === id_club_visitante && s.nombre_serie === serie)?.id_serie ?? null;

            console.log({ clubLocal, clubVisita, serie, id_club_local, id_club_visitante, id_local, id_visitante });

            if (!id_local || !id_visitante) {
                console.warn('No se encontró la serie para club local o visitante', { id_club_local, id_club_visitante, serie });
            }
            const partidoObject = {
                fecha_partido: fecha,
                hora_ini_partido: horaIni,
                ...(horaFin ? { hora_fin_partido: horaFin } : {}),
                goles_local: golesLocal,
                goles_visita: golesVisita,
                tipo_partido: tipo,
                estado_partido: estado,
                observaciones,
                id_cancha: canchaList.find((c: CanchaType) => c.nombre_cancha === cancha)?.id_cancha || null,
                id_serie_local: id_local,
                id_serie_visitante: id_visitante,
            };
            console.log(partidoObject)
            setIsLoading(60)
            const response: any = await createPartido<any>(partidoObject, token);
            toast.success(response.message);
            setIsLoading(100)
            onSuccess()
            setOpen(false)
        } catch (error) {
            toast.info(String(error))
        }

    }
    return (
        <>
            {isLoading < 100 && <Loading isLoading={isLoading} component="Partido" />}
            {isLoading === 100 &&
                <form onSubmit={handleAlert} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Label>Fecha del partido*:</Label>
                            <Input type="date" value={fecha} min={new Date().toISOString().split("T")[0]} onChange={e => setFecha(e.target.value)} required />
                        </div>

                        <div>
                            <Label>Tipo de partido*:</Label>
                            <Select value={tipo} onValueChange={(v: any) => setTipo(v)}>
                                <SelectTrigger><SelectValue placeholder="Seleccione tipo" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="campeonato">Campeonato</SelectItem>
                                    <SelectItem value="amistoso">Amistoso</SelectItem>
                                    <SelectItem value="playoff">Playoff</SelectItem>
                                    <SelectItem value="final">Final</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="col-span-2">
                            <Label>Hora inicio*:</Label>
                            <Input type="time" value={horaIni} onChange={e => setHoraIni(e.target.value)} required />
                        </div>
                        <div>
                            <Label>Cancha*:</Label>
                            <Select value={cancha} onValueChange={(v: string) => setCancha(v)} required>
                                <SelectTrigger><SelectValue placeholder="Seleccione cancha" /></SelectTrigger>
                                <SelectContent>
                                    {canchaList.map(c => <SelectItem key={c.id_cancha} value={c.nombre_cancha}>{c.nombre_cancha}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Club local*:</Label>
                            <Select value={clubLocal || undefined} onValueChange={(v: string) => setClubLocal(v)}>
                                <SelectTrigger><SelectValue placeholder="Seleccione club local" /></SelectTrigger>
                                <SelectContent>
                                    {clubList.map(c => (
                                        <SelectItem key={c.id_club} value={String(c.id_club)} disabled={String(c.id_club) === clubVisita}>{c.nombre_club}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Club visitante*:</Label>
                            <Select value={clubVisita || undefined} onValueChange={(v: string) => setClubVisita(v)}>
                                <SelectTrigger><SelectValue placeholder="Seleccione club visitante" /></SelectTrigger>
                                <SelectContent>
                                    {clubList.map(c => (
                                        <SelectItem key={c.id_club} value={String(c.id_club)} disabled={String(c.id_club) === clubLocal}>{c.nombre_club}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Serie*:</Label>
                            <Select value={serie || undefined} onValueChange={(v: string) => setSerie(v)} required>
                                <SelectTrigger><SelectValue placeholder="Seleccione serie" /></SelectTrigger>
                                <SelectContent>
                                    {Array.from(new Set(serieList.map((s: SerieType) => s.nombre_serie))).map(nombre => (
                                        <SelectItem key={nombre} value={nombre}>{nombre}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="col-span-2">
                            <Separator />
                        </div>
                        <div className="flex justify-end col-span-2 space-x-2">
                            <Button
                                variant="outline"
                                type="button"
                                disabled={isLoading !== 100}
                                onClick={() => onSuccess()}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" style={{ backgroundColor: '#0000db' }} className="text-white" >
                                <Plus className="w-4 h-4 mr-2" />
                                {isLoading !== 100 ? "Guardando..." : "Guardar"}
                            </Button>
                            <AlertDialogHandle
                                title="¿Registrar partido?"
                                description="¿Está seguro de crear el partido?"
                                confirmLabel="Registrar"
                                cancelLabel="Cancelar"
                                onConfirm={handleSubmit}
                                open={open}
                                onOpenChange={setOpen}
                            />
                        </div>
                    </div>
                </form >
            }
        </>
    )
}

export const PartidoDetailsForm: React.FC<PartidoFormProps> = ({ partido, onSuccess, token }) => {
    const [formData, setFormData] = useState<Record<string, any>>({})
    const [isEdit, setIsEdit] = useState<boolean>(false)
    const [open, setOpen] = useState<boolean>(false)
    const [submit, setSubmit] = useState<boolean>(false)
    const [totales, setTotales] = useState({goles: 0, asistencias: 0, tiempo: 0})

    // valores iniciales disponibles (después de restar rendimientos ya guardados)
    const [restantes, setRestantes] = useState({ goles: 0, asistencias: 0, tiempo: 0 })

    const {admin} = useAuth()

    useEffect(() => {
        if (!partido) return
        fetchRendimientos(partido.id_partido, token)
    }, [partido])

    const fetchRendimientos = async (id_partido: number, token: string | null) => {
        try {
            const formObject: Record<string, any> = {}
            const data = await getRendimientosPartido<any>(id_partido, token)
            console.log(data, data.items)
            setTotales({tiempo: 990, goles: data.goles, asistencias: data.goles})
            setRestantes({tiempo: 990, goles: data.goles, asistencias: data.goles})
            data.items.map((item: RendimientoPartidoType) => {
                formObject[item.rut_jugador] = { ...item }
                setRestantes(prev => ({
                    goles: prev.goles - (item.goles || 0), 
                    asistencias: prev.asistencias - (item.asistencias || 0), 
                    tiempo: prev.tiempo - (item.tiempo_jugado || 0)
                }))
            })
            setFormData(formObject)

        } catch (error) {
            toast.error(String(error))
        }
    }

    const handleAlert = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!submit) setSubmit(true)
        else setOpen(true);
    };

    const handleSubmit = async () => {
        try {
            if (!partido?.id_partido) return
            const formArray = Object.values(formData)
            const response = await updateRendimientoPartido<any>(token, partido?.id_partido, formArray)
            // Convertir objeto a string si es necesario
            const message = typeof response === 'string' ? response : response?.message || 'Actualizado correctamente'
            toast.success(message)
        } catch (error) {
            toast.error(String(error))
        } finally {
            onSuccess()
        }

    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <Label>Fecha del partido:</Label>
                    <Input value={partido?.fecha_partido} readOnly />
                </div>
                <div>
                    <Label>Horario:</Label>
                    <Input value={`${partido?.hora_ini_partido} - ${partido?.hora_fin_partido}`} readOnly />
                </div>
                {!!admin && 
                    <div className="col-span-2 flex flex-col items-center">
                        <Label className="text-lg">Resultado</Label>
                        <p className="text-4xl font-bold">{partido?.goles_local} - {partido?.goles_visita}</p>
                    </div>
                }
                {!admin && 
                    <div className="col-span-2 flex justify-between items-center">
                        <div className="flex-1 flex justify-center">
                            <div className="flex flex-col items-center">
                                <Label className="text-lg">Estadísticas: </Label>
                                <p className="font-bold">{restantes.goles} goles | {restantes.asistencias} asistencias | {restantes.tiempo} tiempo jugado</p>
                            </div>
                        </div>
                        <div className='flex justify-end'>
                            {!isEdit ? (
                                <Button type="button" className="bg-blue-500" onClick={() => { setIsEdit(!isEdit) }}>Modificar</Button>

                            ) : (
                                <Button type="submit" form='formRendimientos' className="bg-blue-500">Guardar</Button>
                            )}
                        </div>
                    </div>
                }
                <div className='col-span-2'>
                    <form onSubmit={handleAlert} id='formRendimientos'>
                        <Table className='col-span-4'>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>RUT</TableHead>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Tiempo jugado</TableHead>
                                    <TableHead>Goles</TableHead>
                                    <TableHead>Asistencias</TableHead>
                                    <TableHead>Amonestaciones</TableHead>
                                    <TableHead>Tarjeta amarilla</TableHead>
                                    <TableHead>Tarjeta Roja</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Object.values(formData).map((r: any) => (
                                    <TableRow key={r.rut_jugador}>
                                        <TableCell className="font-medium">
                                            {r.rut_jugador}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {r.primer_nombre} {r.segundo_nombre} {r.primer_apellido} {r.segundo_apellido}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {!!isEdit ? (
                                                <Input
                                                    type="number"
                                                    value={r.tiempo_jugado || ''}
                                                    onChange={(e) => {
                                                        let valor = Number(e.target.value)
                                                        const diff = valor - r.tiempo_jugado
                                                        if((restantes.tiempo - diff) < 0) return
                                                        setRestantes((prev) => ({
                                                            ...prev,
                                                            tiempo: prev.tiempo - diff
                                                        }))
                                                        setFormData((prev: any) => ({
                                                            ...prev,
                                                            [r.rut_jugador]: {
                                                                ...prev[r.rut_jugador],
                                                                tiempo_jugado: valor
                                                            }
                                                        }))
                                                        
                                                    }}
                                                    min={0}
                                                    max={90}
                                                />
                                            ) : (
                                                <Input
                                                    type="number"
                                                    value={r.tiempo_jugado || 0}
                                                    readOnly
                                                />
                                            )}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {!!isEdit ? (
                                                <Input
                                                    type="number"
                                                    value={r.goles || ''}
                                                    onChange={(e) => {
                                                        let valor = Number(e.target.value)
                                                        const diff = valor - r.goles
                                                        const flag = (valor + r.asistencias > totales.goles)
                                                        if((restantes.goles - diff) < 0 || flag) return
                                                        setRestantes((prev) => ({
                                                            ...prev,
                                                            goles: prev.goles - diff
                                                        }))
                                                        setFormData((prev: any) => ({
                                                            ...prev,
                                                            [r.rut_jugador]: {
                                                                ...prev[r.rut_jugador],
                                                                goles: valor
                                                            }
                                                        }))
                                                        
                                                    }}
                                                    min={0}
                                                />
                                            ) : (
                                                <Input
                                                    type="number"
                                                    value={r.goles || 0}
                                                    readOnly
                                                />
                                            )}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {!!isEdit ? (
                                                <Input
                                                    type="number"
                                                    value={r.asistencias || ''}
                                                    onChange={(e) => {
                                                        let valor = Number(e.target.value)
                                                        const diff = valor - r.asistencias
                                                        const flag = (valor + r.goles > totales.goles)
                                                        if((restantes.asistencias - diff) < 0 || flag) return
                                                        setRestantes((prev) => ({
                                                            ...prev,
                                                            asistencias: prev.asistencias - diff
                                                        }))
                                                        setFormData((prev: any) => ({
                                                            ...prev,
                                                            [r.rut_jugador]: {
                                                                ...prev[r.rut_jugador],
                                                                asistencias: valor
                                                            }
                                                        }))
                                                        
                                                    }}
                                                    min={0}
                                                />
                                            ) : (
                                                <Input
                                                    type="number"
                                                    value={r.asistencias || 0}
                                                    readOnly
                                                />
                                            )}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {!!isEdit ? (
                                                <Input
                                                    type="number"
                                                    value={r.amonestaciones || 0}
                                                    onChange={(e) => {
                                                        const valor = Number(e.target.value)
                                                        const minimo = (r.amonestaciones_amarillas ? 1 : 0) + (r.amonestaciones_rojas ? 1 : 0)
                                                        if(valor < minimo) return
                                                        setFormData((prev: any) => ({
                                                            ...prev,
                                                            [r.rut_jugador]: {
                                                                ...prev[r.rut_jugador],
                                                                amonestaciones: Number(e.target.value)
                                                            }
                                                        }))
                                                    }}
                                                    min={0}
                                                />
                                            ) : (
                                                <Input
                                                    type="number"
                                                    value={r.amonestaciones || 0}
                                                    readOnly
                                                />
                                            )}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {!!isEdit ? (<Checkbox
                                                checked={r.amonestaciones_amarillas || false}
                                                onCheckedChange={(checked: boolean) => {
                                                    setFormData((prev: any) => {
                                                        const current = prev[r.rut_jugador] || {}
                                                        const amos = current.amonestaciones || 0
                                                        const nextAmos = checked ? amos + 1 : Math.max(0, amos - 1)
                                                        return {
                                                            ...prev,
                                                            [r.rut_jugador]: {
                                                                ...current,
                                                                amonestaciones: nextAmos,
                                                                amonestaciones_amarillas: checked
                                                            }
                                                        }
                                                    })
                                                }}
                                            />) : (
                                                <>{r.amonestaciones_amarillas ? "SI" : "NO"}</>
                                            )}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {!!isEdit ? (<Checkbox
                                                checked={r.amonestaciones_rojas || false}
                                                onCheckedChange={(checked: boolean) => {
                                                    setFormData((prev: any) => {
                                                        const current = prev[r.rut_jugador] || {}
                                                        const amos = current.amonestaciones || 0
                                                        const nextAmos = checked ? amos + 1 : Math.max(0, amos - 1)
                                                        return {
                                                            ...prev,
                                                            [r.rut_jugador]: {
                                                                ...current,
                                                                amonestaciones: nextAmos,
                                                                amonestaciones_rojas: checked
                                                            }
                                                        }
                                                    })
                                                }}
                                            />) : (
                                                <>{r.amonestaciones_rojas ? "SI" : "NO"}</>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                )
                                )}
                            </TableBody>
                        </Table>
                    </form>
                </div>
            </div>
            <AlertDialogHandle
                title="¿Guardar Rendimientos?"
                description="¿Esta seguro de guardar los rendimientos?"
                confirmLabel="Guardar"
                cancelLabel="Cancelar"
                onConfirm={handleSubmit}
                open={open}
                onOpenChange={setOpen}
            />
        </>
    )
}

export const CalendarioPartidoForm: React.FC<PartidoFormProps> = ({ token, onSuccess }) => {
    const [calendario, setCalendario] = useState({ start_date: "", total_jornadas: 0 })
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [open, setOpen] = useState<boolean>(false)

    const handleAlert = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setOpen(true);
    };

    const handleSubmit = async () => {
        try {
            setIsLoading(true)
            const response = await generarCalendario<any>(token, calendario)
            toast.success(response.message)
        } catch (error) {
            toast.info(String(error))
        } finally {
            setIsLoading(false)
            onSuccess()
        }
    }

    return (
        <form onSubmit={handleAlert} className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
                <Label className="block mb-2">Fecha calendario*:</Label>
                <Input
                    value={calendario["start_date"]}
                    type='date'
                    onChange={(e) => {
                        const value = e.target.value;
                        setCalendario((prev) => ({
                            ...prev,
                            start_date: value
                        }));
                    }}
                    required
                    placeholder='01-01-2026'
                />
            </div>
            <div>
                <Label className="block mb-2">Vueltas*:</Label>
                <Input
                    type="number"
                    value={calendario["total_jornadas"]}
                    onChange={(e) => setCalendario((prev) => ({
                        ...prev,
                        total_jornadas: Number(e.target.value)
                    }))}
                    required
                    max={17}
                />
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

                <Button type="submit" style={{ backgroundColor: "#0000db" }} className="text-white">
                    {!isLoading && <Plus className="w-4 h-4 mr-2" />}
                    {isLoading ? "Guardando..." : "Guardar"}
                </Button>

                <AlertDialogHandle
                    title="¿Crear calendario?"
                    description={`¿Esta seguro de crear el calendario con ${calendario.total_jornadas} para el ${calendario.start_date}`}
                    confirmLabel="Guardar"
                    cancelLabel="Cancelar"
                    onConfirm={handleSubmit}
                    open={open}
                    onOpenChange={setOpen}
                />
            </div>
        </form>
    )
}

export const PartidoEditForm: React.FC<PartidoFormProps> = ({ token, admin, onSuccess, partido }) => {
    const [estado, setEstado] = useState<"programado" | "en_curso" | "cancelado" | "finalizado">("programado")
    const [observaciones, setObservaciones] = useState<string>("")
    const [isLoading, setIsLoading] = useState<number>(0)
    const [open, setOpen] = useState<boolean>(false)
    const [golesLocal, setGolesLocal] = useState<number>(0)
    const [golesVisita, setgolesVisita] = useState<number>(0)
    const [tipo, setTipo] = useState<"campeonato" | "amistoso" | "playoff" | "final">()
    const [cancha, setCancha] = useState<number>(partido?.id_cancha || 0)
    const [canchaList, setCanchaList] = useState<CanchaType[]>([])
    const [isUpdating, setIsUpdating] = useState<boolean>(false)

    useEffect(() => {
        if (!partido) return
        fetchData();
    }, [partido])

    const fetchData = async () => {
        try {
            setIsLoading(20)
            if (!partido) return
            console.log(partido)
            setEstado(partido.estado_partido)
            setObservaciones(partido.observaciones || "")
            setGolesLocal(partido.goles_local || 0)
            setgolesVisita(partido.goles_visita || 0)
            setTipo(partido.tipo_partido)
            setIsLoading(60)
            const data = await getCanchas<CanchaType[]>(token)
            setCanchaList(data)
            setCancha(partido.id_cancha)

        } catch (error) {
            toast.info(String(error))
        } finally {
            setIsLoading(100)
        }
    }

    const handleAlert = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (e.currentTarget.reportValidity()) setOpen(true);
    };

    const handleSubmit = async () => {
        try {
            setIsUpdating(true)
            if (!partido) return
            const partidoObject = {
                estado_partido: estado,
                goles_local: golesLocal,
                goles_visita: golesVisita,
                observaciones,
                tipo_partido: tipo,
                id_cancha: cancha
            }
            const response = await updatePartido<any>(partido?.id_partido, partidoObject, token)
            // Convertir objeto a string si es necesario
            const message = typeof response === 'string' ? response : response?.message || 'Partido actualizado correctamente'
            toast.success(message)
            onSuccess()
        } catch (error) {
            toast.error(String(error))
        } finally {
            setIsUpdating(false)
        }
    }
    return (
        <>
            {isLoading < 100 && <Loading isLoading={isLoading} component="Partido" />}
            {isLoading === 100 &&
                <form onSubmit={handleAlert} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <Label>Tipo de partido:</Label>
                            <Select value={tipo} onValueChange={(v: any) => setTipo(v)}>
                                <SelectTrigger><SelectValue placeholder="Seleccione tipo" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="campeonato">Campeonato</SelectItem>
                                    <SelectItem value="amistoso">Amistoso</SelectItem>
                                    <SelectItem value="playoff">Playoff</SelectItem>
                                    <SelectItem value="final">Final</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Cancha:</Label>
                            <Select value={cancha} onValueChange={(v: string) => setCancha(Number(v))} required>
                                <SelectTrigger><SelectValue placeholder="Seleccione cancha" /></SelectTrigger>
                                <SelectContent>
                                    {canchaList.map(c => <SelectItem key={c.id_cancha} value={c.id_cancha}>{c.nombre_cancha}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Estado Partido:</Label>
                            <Select value={estado} onValueChange={(v: any) => setEstado(v)}>
                                <SelectTrigger><SelectValue placeholder="Seleccione tipo" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="programado">Programado</SelectItem>
                                    <SelectItem value="en_curso">En curso</SelectItem>
                                    <SelectItem value="cancelado">Cancelado</SelectItem>
                                    <SelectItem value="finalizado">Finalizado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {estado === "finalizado" &&
                            <div className='col-span-3 grid grid-cols-2 gap-4'>
                                <div>
                                    <Label>Goles local ({partido?.club_local}):</Label>
                                    <Input
                                        type='number'
                                        value={golesLocal}
                                        onChange={(e) => setGolesLocal(Number(e.target.value))}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label>Goles visitante ({partido?.club_visitante}):</Label>
                                    <Input
                                        type='number'
                                        value={golesVisita}
                                        onChange={(e) => setgolesVisita(Number(e.target.value))}
                                        required
                                    />
                                </div>
                            </div>
                        }
                        <div className='col-span-3'>
                            <Label>Observaciones:</Label>
                            <Textarea
                                value={observaciones}
                                onChange={(e) => setObservaciones(e.target.value)}
                                rows={3}
                                placeholder="Observaciones del partido"
                                maxLength={500}
                            />
                        </div>
                        <div className="col-span-3">
                            <Separator />
                        </div>
                        <div className="flex justify-end col-span-2 space-x-2">
                            <Button
                                variant="outline"
                                type="button"
                                disabled={isLoading !== 100}
                                onClick={() => onSuccess()}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" style={{ backgroundColor: '#0000db' }} className="text-white" >
                                {!!isUpdating ? "Guardando..." : "Guardar"}
                            </Button>
                            <AlertDialogHandle
                                title="¿Modificar partido?"
                                description="¿Está seguro de modificar el partido?"
                                confirmLabel="Guardar"
                                cancelLabel="Cancelar"
                                onConfirm={handleSubmit}
                                open={open}
                                onOpenChange={setOpen}
                            />
                        </div>
                    </div>
                </form>
            }
        </>
    )
}