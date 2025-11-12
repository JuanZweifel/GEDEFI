import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../components/ui/button.tsx';
import { Label } from '../components/ui/label.tsx';
import { Input } from '../components/ui/input.tsx';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/select.tsx';
import { Separator } from '../components/ui/separator.tsx';
import { Textarea } from '../components/ui/textarea.tsx';
import { Plus, Eye, CheckCheckIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import { AlertDialogHandle } from '../components/alert-dialog-component.tsx';
import { useAuth } from '../contexts/authContext.tsx';
import { createPartido, getRendimientosPartidoClub, updatePartido } from '../services/partidosService.ts';
import { getSeries } from '../services/serieService.ts';
import { getCanchas } from '../services/canchaService.ts';
import { getClubs } from '../services/clubServices.ts';
import type { PartidoType, SerieType, CanchaType, ClubType, RendimientoPartidoType } from '../types.tsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table.tsx';
import { Badge } from '../components/ui/badge.tsx';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs.tsx';

type PartidoFormProps = {
    partido?: PartidoType | null
    isEdit?: boolean;
    onSuccess: (...args: any[]) => void
}

export const PartidoForm: React.FC<PartidoFormProps> = ({ partido, isEdit, onSuccess }) => {
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
    }, [isEdit, partido])

    const fetchData = async (token: string | null) => {
        setIsLoading(20)
        const [seriesData, canchasData, clubesData] = await Promise.all([
            getSeries<SerieType[]>(token),
            getCanchas<CanchaType[]>(token),
            getClubs<any>(token, null, null, null, null),
        ]);
        setIsLoading(60)
        setSerieList(seriesData)
        setCanchaList(canchasData)
        setClubList(clubesData.items)
        setIsLoading(100)
    }
    useEffect(() => {
        if (
            isEdit &&
            partido &&
            serieList.length > 0
        ) {
            const serie = serieList.find((s) => partido.id_serie_local === s.id_serie)?.nombre_serie;
            const clubL = serieList.find((s) => partido.id_serie_local === s.id_serie)?.nombre_club;
            const clubV = serieList.find((s) => partido.id_serie_visitante === s.id_serie)?.nombre_club;
            const cancha = canchaList.find((c) => c.id_cancha === partido.id_cancha)?.nombre_cancha;

            setFecha(partido.fecha_partido || '');
            setHoraIni(partido.hora_ini_partido || '');
            setHoraFin(partido.hora_fin_partido || '');
            setGolesLocal(partido.goles_local || 0);
            setGolesVisita(partido.goles_visita || 0);
            setEstado(partido.estado_partido || "programado");
            setTipo(partido.tipo_partido || undefined);
            setObservaciones(partido.observaciones || '');
            setCancha(cancha || "");
            setClubLocal(clubL || "");
            setClubVisita(clubV || "");
            setSerie(serie || "");

            console.log("Partido cargado correctamente:", partido, clubL, clubV, cancha, serie);
        }
    }, [isEdit, partido, serieList, canchaList]);

    const handleAlert = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (e.currentTarget.reportValidity()) setOpen(true);
    };

    const handleSubmit = async () => {
        try {
            setIsLoading(20)
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
                id_serie_local: serieList.find((s: SerieType) => s.id_club === Number(clubLocal) && s.nombre_serie === serie)?.id_serie,
                id_serie_visitante: serieList.find((s: SerieType) => s.id_club === Number(clubVisita) && s.nombre_serie === serie)?.id_serie,
                id_club_local: clubList.find((c: ClubType) => c.nombre_club === clubLocal)?.id_club,
                id_club_visitante: clubList.find((c: ClubType) => c.nombre_club === clubVisita)?.id_club,
            };
            setIsLoading(60)
            if (isEdit && partido?.id_partido) {
                const response: any = await updatePartido<any>(partido.id_partido, partidoObject, token);
                toast.success(response.message);
            } else {
                const response: any = await createPartido<any>(partidoObject, token);
                toast.success(response.message);
            }
            setIsLoading(100)
            onSuccess()
            setOpen(false)
        } catch (error) {
            toast.info(String(error))
        }

    }
    return (
        <>
            {isLoading === 100 &&
                <form onSubmit={handleAlert} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Label>Fecha del partido (*):</Label>
                            <Input type="date" value={fecha} min={new Date().toISOString().split("T")[0]} onChange={e => setFecha(e.target.value)} required disabled={!!isEdit && partido?.estado_partido !== "programado"} />
                        </div>

                        <div>
                            <Label>Tipo de partido (*):</Label>
                            <Select value={tipo} onValueChange={(v: any) => setTipo(v)} disabled={!!isEdit && partido?.estado_partido !== "programado"}>
                                <SelectTrigger><SelectValue placeholder="Seleccione tipo" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="campeonato">Campeonato</SelectItem>
                                    <SelectItem value="amistoso">Amistoso</SelectItem>
                                    <SelectItem value="playoff">Playoff</SelectItem>
                                    <SelectItem value="final">Final</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className={!isEdit ? "col-span-2" : ""}>
                            <Label>Hora inicio (*):</Label>
                            <Input type="time" value={horaIni} onChange={e => setHoraIni(e.target.value)} required disabled={!!isEdit && partido?.estado_partido !== "programado"} />
                        </div>
                        {!!isEdit &&
                            <div>
                                <Label>Hora fin:</Label>
                                <Input
                                    type="time"
                                    value={horaFin}
                                    min={horaIni} // evita horas menores
                                    onChange={e => setHoraFin(e.target.value)}
                                    disabled={horaIni === "" || (!!isEdit && partido?.estado_partido !== "programado")}
                                />
                            </div>
                        }
                        {!!isEdit &&
                            <div className='col-span-2'>
                                <Label>Estado del partido (*):</Label>
                                <Select value={estado} onValueChange={(v: any) => {
                                    if (v !== "finalizado") {
                                        setGolesLocal(0)
                                        setGolesVisita(0)
                                    }
                                    setEstado(v)
                                }}>
                                    <SelectTrigger><SelectValue placeholder="Seleccione estado" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="programado">Programado</SelectItem>
                                        <SelectItem value="en_curso">En curso</SelectItem>
                                        <SelectItem value="finalizado">Finalizado</SelectItem>
                                        <SelectItem value="cancelado">Cancelado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        }
                        {estado === "finalizado" &&
                            <>
                                <div>
                                    <Label>Goles local:</Label>
                                    <Input type="number" min={0} value={golesLocal ?? ''} onChange={e => setGolesLocal(Number(e.target.value))} />
                                </div>
                                <div>
                                    <Label>Goles visitante:</Label>
                                    <Input type="number" min={0} value={golesVisita ?? ''} onChange={e => setGolesVisita(Number(e.target.value))} />
                                </div>
                            </>
                        }
                        <div className="col-span-2">
                            <Label>Observaciones:</Label>
                            <Textarea value={observaciones} onChange={e => setObservaciones(e.target.value)} />
                        </div>

                        <div>
                            <Label>Cancha (*):</Label>
                            <Select value={cancha} onValueChange={(v: string) => setCancha(v)} disabled={!!isEdit && partido?.estado_partido !== "programado"}>
                                <SelectTrigger><SelectValue placeholder="Seleccione cancha" /></SelectTrigger>
                                <SelectContent>
                                    {canchaList.map(c => <SelectItem key={c.id_cancha} value={c.nombre_cancha}>{c.nombre_cancha}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Club local (*):</Label>
                            {isEdit ? (
                                <Input value={clubLocal} readOnly />
                            ) : (
                                <Select value={clubLocal || undefined} onValueChange={(v: string) => setClubLocal(v)}>
                                    <SelectTrigger><SelectValue placeholder="Seleccione club local" /></SelectTrigger>
                                    <SelectContent>
                                        {clubList.map(c => (
                                            <SelectItem key={c.id_club} value={c.nombre_club}>{c.nombre_club}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        <div>
                            <Label>Club visitante (*):</Label>
                            {isEdit ? (
                                <Input value={clubVisita} readOnly />
                            ) : (
                                <Select value={clubVisita || undefined} onValueChange={(v: string) => setClubVisita(v)}>
                                    <SelectTrigger><SelectValue placeholder="Seleccione club visitante" /></SelectTrigger>
                                    <SelectContent>
                                        {clubList.map(c => (
                                            <SelectItem key={c.id_club} value={c.nombre_club}>{c.nombre_club}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        <div>
                            <Label>Serie (*):</Label>
                            {isEdit ? (
                                <Input value={serie} readOnly />
                            ) : (
                                <Select value={serie} onValueChange={setSerie}>
                                    <SelectTrigger><SelectValue placeholder="Seleccione serie" /></SelectTrigger>
                                    <SelectContent>
                                        {Array.from(new Set(serieList.map((s: SerieType) => s.nombre_serie))).map(nombre => (
                                            <SelectItem key={nombre} value={nombre}>
                                                {nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
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
                                {!isEdit && <Plus className="w-4 h-4 mr-2" />}
                                {isLoading !== 100 ? "Guardando..." : "Guardar"}
                            </Button>
                            <AlertDialogHandle
                                title={isEdit ? `Modificar partido?` : `Registrar partido?`}
                                description={isEdit ? "¿Está seguro de guardar los cambios?" : "¿Está seguro de crear el partido?"}
                                confirmLabel={isEdit ? "Modificar" : "Registrar"}
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

export const PartidoDetailsForm: React.FC<PartidoFormProps> = ({ partido, onSuccess }) => {
    const [rendimientos, setRendimientos] = useState<RendimientoPartidoType[]>([])
    const [formData, setFormData] = useState<any>()

    return (
        <form>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <Label>Fecha del partido:</Label>
                    <Input value={partido?.fecha_partido} readOnly />
                </div>
                <div>
                    <Label>Horario:</Label>
                    <Input value={`${partido?.hora_ini_partido} - ${partido?.hora_fin_partido}`} readOnly />
                </div>
                <div className="col-span-2 flex flex-col items-center">
                    <Label className="text-lg">Resultado</Label>
                    <p className="text-4xl font-bold">{partido?.goles_local} - {partido?.goles_visita}</p>
                </div>

                <div className='col-span-2'>
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
                            {rendimientos.map((r: RendimientoPartidoType) => (
                                <TableRow key={r.rut_jugador}>
                                    <TableCell className="font-medium">{r.rut_jugador}</TableCell>
                                    <TableCell className="font-medium">{r.primer_nombre} {r.segundo_nombre} {r.primer_apellido} {r.segundo_apellido}</TableCell>
                                    <TableCell className="font-medium">{r.tiempo_jugado}</TableCell>
                                    <TableCell className="font-medium">{r.goles}</TableCell>
                                    <TableCell className="font-medium">{r.asistencias}</TableCell>
                                    <TableCell className="font-medium">{r.amonestaciones}</TableCell>
                                    <TableCell className="font-medium">{r.amonestaciones_amarillas ? "SI" : "NO"}</TableCell>
                                    <TableCell className="font-medium">{r.amonestaciones_rojas ? "SI" : "NO"}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </form>
    )
}