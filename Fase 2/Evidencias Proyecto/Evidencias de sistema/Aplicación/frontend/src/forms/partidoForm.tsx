import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { Textarea } from '../components/ui/textarea';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { AlertDialogHandle } from '../components/alert-dialog-component';
import { useAuth } from '../contexts/authContext';
import { createPartido, updatePartido } from '../services/partidosService';
import { getSeries } from '../services/serieService';
import { getCanchas } from '../services/canchaService';
import { getClubs } from '../services/clubServices';
import type { PartidoType, SerieType, CanchaType, ClubType } from '../types';

type PartidoFormProps = {
    partido?: PartidoType | null;
    isEdit: boolean;
    onSuccess: (...args: any[]) => void;
};

export function PartidoForm({ partido, isEdit, onSuccess }: PartidoFormProps) {
    const { token } = useAuth();

    // Estados del formulario
    const [fecha, setFecha] = useState('');
    const [horaInicio, setHoraInicio] = useState('');
    const [horaFin, setHoraFin] = useState('');
    const [golesLocal, setGolesLocal] = useState<number | null>(null);
    const [golesVisita, setGolesVisita] = useState<number | null>(null);
    const [tipoPartido, setTipoPartido] = useState<'campeonato' | 'amistoso' | 'playoff' | 'final'>('campeonato');
    const [estadoPartido, setEstadoPartido] = useState<'programado' | 'en_curso' | 'finalizado' | 'cancelado'>('programado');
    const [observaciones, setObservaciones] = useState('');
    const [idCancha, setIdCancha] = useState<number>(0);

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

    const initializedEditRef = React.useRef(false);

    const seriesMap = useMemo(() => {
        const map: Record<number, SerieType> = {};
        series.forEach(s => map[s.id_serie] = s);
        return map;
    }, [series]);

    const seriesUnicas = Array.from(new Set(series.map(s => s.nombre_serie)));

    useEffect(() => {
        // Actualiza los nombres de los clubes cada vez que cambian los clubes o los IDs seleccionados
        const clubLocal = clubes.items?.find(c => c.id_club === idClubLocal);
        setNombreClubLocal(clubLocal ? clubLocal.nombre_club : '');

        const clubVisitante = clubes.items?.find(c => c.id_club === idClubVisitante);
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

            const clubLocalFromSerie = clubes.items?.find(c => c.id_club === serieLocal.id_club);
            const clubVisitFromSerie = clubes.items?.find(c => c.id_club === serieVisitante.id_club);
            setNombreClubLocal(clubLocalFromSerie ? clubLocalFromSerie.nombre_club : '');
            setNombreClubVisitante(clubVisitFromSerie ? clubVisitFromSerie.nombre_club : '');
        }

        initializedEditRef.current = true;
    }, [partido, isEdit, series, seriesMap, clubes, idClubLocal, idClubVisitante]);


    // Fetch series, canchas y clubes
    useEffect(() => {
        let mounted = true;
        async function fetchData() {
            try {
                const [seriesData, canchasData, clubesData] = await Promise.all([
                    getSeries<SerieType[]>(token),
                    getCanchas<CanchaType[]>(token),
                    getClubs<ClubType[]>(token, null, null, null, null),
                ]);
                if (!mounted) return;
                setSeries(seriesData);
                setCanchas(canchasData);
                setClubes(clubesData);
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
        <form onSubmit={handleAlert} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label>Fecha del partido (*):</Label>
                    <Input type="date" value={fecha} onChange={e => setFecha(e.target.value)} required />
                </div>
                <div>
                    <Label>Hora inicio (*):</Label>
                    <Input type="time" value={horaInicio} onChange={e => setHoraInicio(e.target.value)} required />
                </div>
                <div>
                    <Label>Hora fin:</Label>
                    <Input type="time" value={horaFin} onChange={e => setHoraFin(e.target.value)} />
                </div>
                <div>
                    <Label>Goles local:</Label>
                    <Input type="number" min={0} value={golesLocal ?? ''} onChange={e => setGolesLocal(Number(e.target.value))} />
                </div>
                <div>
                    <Label>Goles visitante:</Label>
                    <Input type="number" min={0} value={golesVisita ?? ''} onChange={e => setGolesVisita(Number(e.target.value))} />
                </div>
                <div>
                    <Label>Tipo de partido (*):</Label>
                    <Select value={tipoPartido} onValueChange={(v: any) => setTipoPartido(v)}>
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
                    <Label>Estado del partido (*):</Label>
                    <Select value={estadoPartido} onValueChange={(v: any) => setEstadoPartido(v)}>
                        <SelectTrigger><SelectValue placeholder="Seleccione estado" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="programado">Programado</SelectItem>
                            <SelectItem value="en_curso">En curso</SelectItem>
                            <SelectItem value="finalizado">Finalizado</SelectItem>
                            <SelectItem value="cancelado">Cancelado</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="col-span-2">
                    <Label>Observaciones:</Label>
                    <Textarea value={observaciones} onChange={e => setObservaciones(e.target.value)} />
                </div>

                <div>
                    <Label>Cancha (*):</Label>
                    <Select value={idCancha} onValueChange={v => setIdCancha(Number(v))}>
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
                    <Select value={serieNombre} onValueChange={setSerieNombre}>
                        <SelectTrigger><SelectValue placeholder="Seleccione serie" /></SelectTrigger>
                        <SelectContent>
                            {seriesUnicas.map(nombre => (
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
            </div>
        </form>
    );
}
