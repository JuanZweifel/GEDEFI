import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { Textarea } from '../components/ui/textarea';
import { Plus, Eye, CheckCheckIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import { AlertDialogHandle } from '../components/alert-dialog-component';
import { useAuth } from '../contexts/authContext';
import { createPartido, getRendimientosPartidoClub, updatePartido } from '../services/partidosService';
import { getSeries } from '../services/serieService';
import { getCanchas } from '../services/canchaService';
import { getClubs } from '../services/clubServices';
import type { PartidoType, SerieType, CanchaType, ClubType, RendimientoPartidoType } from '../types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table.tsx';
import { Badge } from '../components/ui/badge.tsx';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs.tsx';

type PartidoFormProps = {
    partido?: PartidoType | null;
    isEdit: boolean;
    trainer: boolean;
    onSuccess: (...args: any[]) => void;
};

export function PartidoForm({ partido, isEdit, trainer, onSuccess }: PartidoFormProps) {
    const { token, id_club } = useAuth();

    // Estados del formulario
    const [fecha, setFecha] = useState('');
    const [horaInicio, setHoraInicio] = useState('');
    const [horaFin, setHoraFin] = useState('');
    const [golesLocal, setGolesLocal] = useState<number | null>(null);
    const [golesVisita, setGolesVisita] = useState<number | null>(null);
    const [tipoPartido, setTipoPartido] = useState<'campeonato' | 'amistoso' | 'playoff' | 'final'>('campeonato');
    const [estadoPartido, setEstadoPartido] = useState<'programado' | 'en_curso' | 'finalizado' | 'cancelado'>('programado');
    const [observaciones, setObservaciones] = useState('');
    const [idCancha, setIdCancha] = useState<number | null>(null);

    const [idClubLocal, setIdClubLocal] = useState<number>(0);
    const [idClubVisitante, setIdClubVisitante] = useState<number>(0);
    const [nombreClubLocal, setNombreClubLocal] = useState('');
    const [nombreClubVisitante, setNombreClubVisitante] = useState('');

    const [series, setSeries] = useState<SerieType[]>([]);
    const [serieNombre, setSerieNombre] = useState('');
    const [idSerie, setIdSerie] = useState<number>(0);

    const [canchas, setCanchas] = useState<CanchaType[]>([]);
    const [clubes, setClubes] = useState<ClubType[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const [rendimientos, setRendimientos] = useState<RendimientoPartidoType[]>([])

    const initializedEditRef = React.useRef(false);

    const seriesMap = useMemo(() => {
        const map: Record<number, SerieType> = {};
        series.forEach(s => map[s.id_serie] = s);
        return map;
    }, [series]);

    const seriesUnicas = Array.from(new Set(series.map(s => s.nombre_serie)));

    useEffect(() => {
        // Actualiza los nombres de los clubes cada vez que cambian los clubes o los IDs seleccionados
        const clubLocal = clubes.find(c => c.id_club === idClubLocal);
        setNombreClubLocal(clubLocal ? clubLocal.nombre_club : '');

        const clubVisitante = clubes.find(c => c.id_club === idClubVisitante);
        setNombreClubVisitante(clubVisitante ? clubVisitante.nombre_club : '');

        // Si no está en modo edición o no hay partido, resetea la inicialización y retorna
        if (!isEdit || !partido) {
            initializedEditRef.current = false;
            return;
        }

        // Corre la inicialización solo una vez y solo después de que se carguen series y clubes
        if (initializedEditRef.current) return;
        if (series.length === 0 || clubes.length === 0) return;

        // Inicializa los campos del formulario con los datos del partido
        setFecha(partido.fecha_partido);
        setHoraInicio(partido.hora_ini_partido);
        setHoraFin(partido.hora_fin_partido ?? '');
        setGolesLocal(partido.goles_local ?? null);
        setGolesVisita(partido.goles_visita ?? null);
        setTipoPartido(partido.tipo_partido);
        setEstadoPartido(partido.estado_partido);
        setObservaciones(partido.observaciones ?? '');
        setIdCancha(partido.id_cancha);

        // Buscar las series actuales usando seriesMap derived from `series`
        const serieLocal = seriesMap[partido.id_serie_local];
        const serieVisitante = seriesMap[partido.id_serie_visitante];

        if (serieLocal && serieVisitante) {
            setIdSerie(serieLocal.id_serie);
            setSerieNombre(serieLocal.nombre_serie);
            setIdClubLocal(serieLocal.id_club);
            setIdClubVisitante(serieVisitante.id_club);

            const clubLocalFromSerie = clubes.find(c => c.id_club === serieLocal.id_club);
            const clubVisitFromSerie = clubes.find(c => c.id_club === serieVisitante.id_club);
            console.log(clubLocalFromSerie, clubVisitFromSerie)
            setNombreClubLocal(clubLocalFromSerie ? clubLocalFromSerie.nombre_club : '');
            setNombreClubVisitante(clubVisitFromSerie ? clubVisitFromSerie.nombre_club : '');
        }

        initializedEditRef.current = true;
    }, [partido, isEdit, series, seriesMap, clubes, idClubLocal, idClubVisitante]);


    // Fetch series, canchas, rendimientos y clubes
    useEffect(() => {
        let mounted = true;
        async function fetchData() {
            try {
                const [seriesData, canchasData, clubesData] = await Promise.all([
                    getSeries<SerieType[]>(token),
                    getCanchas<CanchaType[]>(token),
                    getClubs<any>(token, null, null, null, null),

                ]);
                if (partido?.estado_partido === "finalizado") {
                    const rendimientosData = await getRendimientosPartidoClub<RendimientoPartidoType[]>(1, partido?.id_partido || 0, token)
                    setRendimientos(rendimientosData);
                }

                if (!mounted) return;
                setSeries(seriesData);
                setCanchas(canchasData);
                setClubes(clubesData.items);
            } catch (error) {
                toast.error(String(error));
            }
        }
        fetchData();
        return () => { mounted = false; };
    }, [token]);

    const handleAlert = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (e.currentTarget.reportValidity()) setOpen(true);
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            // Buscar id de serie correspondiente a cada club
            const serieLocal = series.find(s => s.nombre_serie === serieNombre && s.id_club === idClubLocal);
            const serieVisitante = series.find(s => s.nombre_serie === serieNombre && s.id_club === idClubVisitante);

            if (!serieLocal || !serieVisitante) {
                toast.error("No se encontró la serie para alguno de los clubes");
                setIsLoading(false);
                return;
            }

            const partidoObject = {
                fecha_partido: fecha,
                hora_ini_partido: horaInicio,
                ...(horaFin ? { hora_fin_partido: horaFin } : {}),
                goles_local: golesLocal,
                goles_visita: golesVisita,
                tipo_partido: tipoPartido,
                estado_partido: estadoPartido,
                observaciones,
                id_cancha: idCancha,
                id_serie_local: serieLocal.id_serie,
                id_serie_visitante: serieVisitante.id_serie,
                id_club_local: idClubLocal,
                id_club_visitante: idClubVisitante,
            };

            if (isEdit && partido?.id_partido) {
                const response = await updatePartido(partido.id_partido, partidoObject, token);
                toast.success(response.message);
            } else {
                const response = await createPartido(partidoObject, token);
                toast.success(response.message);
            }

            onSuccess();
            setOpen(false);
        } catch (error) {
            toast.error(String(error));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleAlert} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <Label>Fecha del partido (*):</Label>
                    <Input type="date" value={fecha} onChange={e => setFecha(e.target.value)} required disabled={estadoPartido !== "programado" || !!trainer} />
                </div>

                <div>
                    <Label>Tipo de partido (*):</Label>
                    <Select value={tipoPartido} onValueChange={(v: any) => setTipoPartido(v)} disabled={estadoPartido !== "programado" || !!trainer}>
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
                    <Label>Hora inicio (*):</Label>
                    <Input type="time" value={horaInicio} onChange={e => setHoraInicio(e.target.value)} required disabled={estadoPartido !== "programado" || !!trainer} />
                </div>
                <div>
                    <Label>Hora fin:</Label>
                    <Input
                        type="time"
                        value={horaFin}
                        min={horaInicio} // evita horas menores
                        onChange={e => setHoraFin(e.target.value)}
                        disabled={estadoPartido !== "programado" || !horaInicio || !!trainer}
                    />
                </div>
                <div className='col-span-2'>
                    <Label>Estado del partido (*):</Label>
                    <Select value={estadoPartido} disabled={!!trainer} onValueChange={(v: any) => {
                        if (v !== "finalizado") {
                            setGolesLocal(null)
                            setGolesVisita(null)
                        }
                        setEstadoPartido(v)
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
                {estadoPartido === "finalizado" &&
                    <>
                        <div>
                            <Label>Goles local:</Label>
                            <Input type="number" min={0} value={golesLocal ?? ''} onChange={e => setGolesLocal(Number(e.target.value))} disabled={!!trainer} />
                        </div>
                        <div>
                            <Label>Goles visitante:</Label>
                            <Input type="number" min={0} value={golesVisita ?? ''} onChange={e => setGolesVisita(Number(e.target.value))} disabled={!!trainer} />
                        </div>
                    </>
                }
                <div className="col-span-2">
                    <Label>Observaciones:</Label>
                    <Textarea value={observaciones} onChange={e => setObservaciones(e.target.value)} disabled={!!trainer} />
                </div>

                <div>
                    <Label>Cancha (*):</Label>
                    <Select value={idCancha} onValueChange={v => setIdCancha(Number(v))} disabled={estadoPartido !== "programado" || !!trainer}>
                        <SelectTrigger><SelectValue placeholder="Seleccione cancha" /></SelectTrigger>
                        <SelectContent>
                            {canchas.map(c => <SelectItem key={c.id_cancha} value={c.id_cancha}>{c.nombre_cancha}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Label>Club local (*):</Label>
                    {isEdit ? (
                        <Input value={nombreClubLocal} readOnly />
                    ) : (
                        <Select value={idClubLocal} onValueChange={v => setIdClubLocal(Number(v))}>
                            <SelectTrigger><SelectValue placeholder="Seleccione club local" /></SelectTrigger>
                            <SelectContent>
                                {clubes.map(c => (
                                    <SelectItem key={c.id_club} value={c.id_club}>{c.nombre_club}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>

                <div>
                    <Label>Club visitante (*):</Label>
                    {isEdit ? (
                        <Input value={nombreClubVisitante} readOnly />
                    ) : (
                        <Select value={idClubVisitante} onValueChange={v => setIdClubVisitante(Number(v))}>
                            <SelectTrigger><SelectValue placeholder="Seleccione club visitante" /></SelectTrigger>
                            <SelectContent>
                                {clubes.map(c => (
                                    <SelectItem key={c.id_club} value={c.id_club}>{c.nombre_club}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>

                <div>
                    <Label>Serie (*):</Label>
                    {isEdit ? (
                        <Input value={serieNombre} readOnly />
                    ) : (
                        <Select value={serieNombre} onValueChange={setSerieNombre}>
                            <SelectTrigger><SelectValue placeholder="Seleccione serie" /></SelectTrigger>
                            <SelectContent>
                                {seriesUnicas.map(nombre => (
                                    <SelectItem key={nombre} value={nombre}>{nombre}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>

                <div className="col-span-2">
                    <Separator />
                </div>

                {!trainer &&
                    <div className="flex justify-end col-span-2 space-x-2">
                        <Button
                            variant="outline"
                            type="button"
                            disabled={isLoading}
                            onClick={() => onSuccess()}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" style={{ backgroundColor: '#0000db' }} className="text-white">
                            {!isEdit && <Plus className="w-4 h-4 mr-2" />}
                            {isLoading ? "Guardando..." : "Guardar"}
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
                }
                {trainer && rendimientos.length > 0 &&
                    <Tabs value="Rendimientos" className="col-span-2">
                        <TabsList className="grid w-full grid-cols-1">
                            <TabsTrigger value="Rendimientos">Rendimientos del partido</TabsTrigger>
                        </TabsList>

                        <TabsContent value="Rendimientos">
                            <Table className='span-col-2'>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>RUT</TableHead>
                                        <TableHead>Nombre completo</TableHead>
                                        <TableHead>Goles</TableHead>
                                        <TableHead>Asistencias</TableHead>
                                        <TableHead>amonestaciones</TableHead>
                                        <TableHead>Tarjeta Amarilla</TableHead>
                                        <TableHead>Tarjeta Roja</TableHead>
                                        <TableHead>Tiempo de juego</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rendimientos.map((r) => (
                                        <TableRow key={r.rut_jugador}>
                                            <TableCell className="font-medium">{r.rut_jugador}</TableCell>
                                            <TableCell className="font-medium">{r.primer_nombre} {r.segundo_nombre} {r.primer_apellido} {r.segundo_apellido}</TableCell>
                                            <TableCell className="font-medium">{r.goles}</TableCell>
                                            <TableCell className="font-medium">{r.asistencias}</TableCell>
                                            <TableCell className="font-medium">{r.amonestaciones}</TableCell>
                                            <TableCell className="font-medium">{r.amonestaciones_amarillas ? <CheckCheckIcon /> : <X />}</TableCell>
                                            <TableCell className="font-medium">{r.amonestaciones_rojas ? <CheckCheckIcon /> : <X />}</TableCell>
                                            <TableCell className="font-medium">{r.tiempo_jugado}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TabsContent>
                    </Tabs>
                }
            </div>
        </form>
    );
}
