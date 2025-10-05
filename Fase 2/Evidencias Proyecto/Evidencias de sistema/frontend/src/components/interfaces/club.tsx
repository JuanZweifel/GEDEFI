import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.tsx';
import { Button } from '../ui/button.tsx';
import { Badge } from '../ui/badge.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs.tsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table.tsx';
import { Label } from '../ui/label.tsx';
import { DialogHandle } from '../dialog-component.tsx';
import { Input } from '../ui/input.tsx';
import {
    Plus, Edit, Eye,
    Trash2
} from 'lucide-react';

import { toast } from 'sonner';


import { getClubs, createClub, updateClub, deleteClub, getSeriesClub, getUsuariosClub, getJugadoresClub } from '../../services/clubServices.ts';
import { AlertDialogHandle } from '../alert-dialog-component.tsx';
import {
    type ClubType,
    type ClubApiType,
    type SerieType,
    type JugadorType,
    type UsuarioType,
    type ClubDetailsType,
    type serieResponseType,
    type DirectivaResponseType,
    type JugadorResponseType
} from '../../types.tsx';

// Enhanced User & Roles Module (USUARIO, ROL, HISTORIAL_USUARIO)



type ClubFormProps = {
    club?: ClubType | null
    isEdit: boolean
    refreshClub: () => Promise<void>
    onSuccess: () => void
}

export function ClubForm({ club, isEdit, refreshClub, onSuccess }: ClubFormProps) {
    const [nombreClub, setNombreClub] = useState(club?.nombre_club ?? "")
    const [fechaFundacion, setFechaFundacion] = useState(club?.fecha_fundacion ?? "")
    const [direccionClub, setDireccionClub] = useState(club?.direccion_club ?? "")
    const [fonoClub, setFonoClub] = useState(club?.fono_club ?? "")
    const [emailClub, setEmailClub] = useState(club?.email_club ?? "")
    const [clubActivo, setClubActivo] = useState(club?.club_activo ?? true)
    const [isLoading, setIsLoading] = useState(false)
    const [open, setOpen] = useState(false)

    useEffect(() => {
        if (isEdit && club) {
            setNombreClub(club.nombre_club ?? "")
            setFechaFundacion(club.fecha_fundacion ?? "")
            setDireccionClub(club.direccion_club ?? "")
            setFonoClub(club.fono_club ?? "")
            setEmailClub(club.email_club ?? "")
            setClubActivo(club.club_activo ?? true)
        }
    }, [club, isEdit])

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
            const clubObject: ClubApiType = {
                nombre_club: nombreClub,
                fecha_fundacion: fechaFundacion,
                fono_club: fonoClub,
                direccion_club: direccionClub,
                email_club: emailClub,
                ...(isEdit ? { club_activo: clubActivo } : {}),
            }

            if (isEdit && club?.id_club) {
                await updateClub<any>(clubObject, club.id_club)
                toast.success("¡Club modificado correctamente!")
            } else {
                await createClub<any>(clubObject)
                toast.success("¡Club registrado correctamente!")
            }

            refreshClub()
            onSuccess()
            setOpen(false)
        } catch (error) {
            toast.error(String(error))
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form className="space-y-4" onSubmit={(e) => { handleAlert(e) }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label className="block mb-2">Nombre del club:</Label>
                    <Input
                        placeholder="Ej: Estadio Municipal"
                        value={nombreClub}
                        onChange={(e) => setNombreClub(e.target.value)}
                        required
                        maxLength={120}
                        minLength={4}
                        pattern="^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$"
                    />
                </div>
                <div>
                    <Label className="block mb-2">Fecha fundación:</Label>
                    <Input
                        type="date"
                        value={fechaFundacion}
                        onChange={(e) => setFechaFundacion(e.target.value)}
                        required
                        max={new Date().toISOString().split("T")[0]}
                    />
                </div>
                <div className="col-span-2">
                    <Label className="block mb-2">Dirección completa</Label>
                    <Input
                        placeholder="Dirección del club"
                        value={direccionClub}
                        onChange={(e) => setDireccionClub(e.target.value)}
                        required
                        minLength={10}
                        maxLength={500}
                    />
                </div>
                <div>
                    <Label className="block mb-2">Teléfono:</Label>
                    <Input
                        placeholder="Ej: 987654321"
                        value={fonoClub}
                        onChange={(e) => setFonoClub(e.target.value)}
                        required
                        pattern="^[0-9]{9}$"
                    />
                </div>
                <div>
                    <Label className="block mb-2">Correo electrónico:</Label>
                    <Input
                        type="email"
                        placeholder="club@example.com"
                        value={emailClub}
                        onChange={(e) => setEmailClub(e.target.value)}
                        required
                    />
                </div>
                {isEdit && (
                    <div className="col-span-2 flex items-center space-x-2">
                        <Input
                            type="checkbox"
                            id="club-activo"
                            checked={clubActivo}
                            onChange={(e) => setClubActivo(e.target.checked)}
                            className="w-4 h-4 rounded border"
                        />
                        <Label htmlFor="club-activo" className="text-sm">
                            Club activo
                        </Label>
                    </div>
                )}
                <div className="flex justify-end space-x-2 col-span-2">
                    <Button
                        variant="outline"
                        type="button"
                        disabled={isLoading}
                        onClick={() => onSuccess()} // 👈 cancelar = cerrar
                    >
                        Cancelar
                    </Button>
                    <Button type="submit" style={{ backgroundColor: "#0000db" }} className="text-white">
                        {!isLoading && !isEdit && <Plus className="w-4 h-4 mr-2" />}
                        {isLoading ? "Guardando..." : "Guardar"}
                    </Button>
                    <AlertDialogHandle
                        title={isEdit ? `Modificar club ${nombreClub}?` : `Registrar club ${nombreClub}?`}
                        description={
                            isEdit
                                ? `¿Estás seguro de querer guardar la modificación?`
                                : `¿Estás seguro de querer registrar al club ${nombreClub}?`
                        }
                        confirmLabel={isEdit ? "Modificar" : "Registrar"}
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


export const ClubDetails: React.FC<ClubDetailsType> = ({ club }) => {
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)
    const [series, setSeries] = useState<SerieType[]>([])
    const [directiva, SetDirectiva] = useState<UsuarioType[]>([])
    const [jugadores, setJugadores] = useState<JugadorType[]>([])


    useEffect(() => {
        if (isDetailsOpen && club) {
            const fetchSeries = async () => {
                const serieData = await getSeriesClub<serieResponseType>(club.id_club)
                setSeries(serieData.series)
            }
            const fetchDirectiva = async () => {
                const dataDirectiva = await getUsuariosClub<DirectivaResponseType>(club.id_club)
                SetDirectiva(dataDirectiva.usuarios)
            }
            const fetchJugadores = async () => {
                const jugadoresData = await getJugadoresClub<JugadorResponseType>(club.id_club)
                setJugadores(jugadoresData.jugadores)
            }
            fetchSeries();
            fetchDirectiva();
            fetchJugadores();
        }
    }, [isDetailsOpen, club])

    return (
        <DialogHandle
            title={`Detalles del club: ${club.nombre_club}`}
            trigger={
                <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="w-4 h-4 mr-1" />
                    Ver Detalles
                </Button>
            }
            open={isDetailsOpen}
            onOpenChange={setIsDetailsOpen}
            initialData={club}
        >
            {() => (
                <div className="space-y-6">
                    {/* Información del club */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label className="block mb-2">Nombre:</Label>
                            <Input value={club.nombre_club} disabled />
                        </div>
                        <div>
                            <Label className="block mb-2">Fecha Fundación:</Label>
                            <Input value={club.fecha_fundacion} disabled />
                        </div>
                        <div>
                            <Label className="block mb-2">Email:</Label>
                            <Input value={club.email_club} disabled />
                        </div>
                        <div>
                            <Label className="block mb-2">Teléfono:</Label>
                            <Input value={club.fono_club} disabled />
                        </div>
                        <div className="col-span-2">
                            <Label className="block mb-2">Dirección:</Label>
                            <Input value={club.direccion_club} disabled />
                        </div>
                        <div>
                            <Label className="block mb-2">Activo:</Label>
                            <Input value={club.club_activo ? "Sí" : "No"} disabled />
                        </div>
                        <div>
                            <Label className="block mb-2">Creado:</Label>
                            <Input value={club.fecha_creacion} disabled />
                        </div>
                        <div>
                            <Label className="block mb-2">Modificado:</Label>
                            <Input value={club.fecha_modificacion} disabled />
                        </div>
                    </section>

                    {/* Tabla directiva */}
                    <section>
                        <h3 className="font-semibold mb-2">Directiva</h3>
                        <div className="max-h-40 overflow-y-auto border rounded">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>RUT</TableHead>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Activo</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {Array.isArray(directiva) && directiva.map((d) => (
                                        <TableRow key={d.rut_usuario}>
                                            <TableCell>{d.rut_usuario}</TableCell>
                                            <TableCell>{`${d.nombre_usuario} ${d.apellido_usuario}`}</TableCell>
                                            <TableCell>{d.email_usuario}</TableCell>
                                            <TableCell>{d.usuario_activo ? "Sí" : "No"}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </section>

                    {/* Tabla series */}
                    <section>
                        <h3 className="font-semibold mb-2">Series</h3>
                        <div className="max-h-40 overflow-y-auto border rounded">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead>Activo</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {Array.isArray(series) && series.map((s) => (
                                        <TableRow key={s.id_serie}>
                                            <TableCell>{s.id_serie}</TableCell>
                                            <TableCell>{s.nombre_serie}</TableCell>
                                            <TableCell>{s.serie_activa ? "Sí" : "No"}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </section>

                    {/* Tabla jugadores */}
                    <section>
                        <h3 className="font-semibold mb-2">Jugadores</h3>
                        <div className="max-h-40 overflow-y-auto border rounded">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>RUT</TableHead>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead>Apellido</TableHead>
                                        <TableHead>Fono</TableHead>
                                        <TableHead>Activo</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {Array.isArray(jugadores) && jugadores.map((j) => (
                                        <TableRow key={j.rut_jugador}>
                                            <TableCell>{j.rut_jugador}</TableCell>
                                            <TableCell>{`${j.primer_nombre} ${j.segundo_nombre ?? ""}`}</TableCell>
                                            <TableCell>{`${j.primer_apellido} ${j.segundo_apellido ?? ""}`}</TableCell>
                                            <TableCell>{j.fono_jugador}</TableCell>
                                            <TableCell>{j.jugador_activo ? "Sí" : "No"}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </section>
                </div>
            )}
        </DialogHandle>
    );
}

// Enhanced Clubs & Series Module (CLUB, SERIE, DETALLE_CLUB_JUGADOR, FICHA_JUGADOR)
export const ClubModule: React.FC = () => {
    const [activeTab, setActiveTab] = useState('clubs');
    const [clubList, setClubList] = useState<ClubType[]>([])
    const [open, setOpen] = useState(false)
    const [openSelected, setOpenSelected] = useState<number | null>(null)

    const fetchClubs = async () => {
        const data = await getClubs<ClubType[]>();
        setClubList(data);
    }

    useEffect(() => {
        fetchClubs(); // carga inicial
    }, [])

    const handleDelete = async (id_club: number) => {
        try {
            const response = await deleteClub<{ detail: string }>(id_club)
            toast.success(response.detail)
            setOpenSelected(null)
            fetchClubs();
            setOpen(false)
        } catch (error) {
            toast.error(String(error))
        }

    }

    const clubHistory = [
        { fecha: "2024-09-15", accion: "Registro nueva serie", club: "FC Barcelona Santiago", detalle: "Serie Femenina agregada" },
        { fecha: "2024-09-10", accion: "Actualización directiva", club: "Real Madrid Chile", detalle: "Cambio de tesorero" }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2>Gestión de Clubes</h2>
                <DialogHandle<ClubType>
                    title="Crear nuevo club"
                    trigger={
                        <Button style={{ backgroundColor: "#0000db" }} className="text-white">
                            <Plus className="w-4 h-4 mr-2" /> Nuevo Club
                        </Button>
                    }
                >
                    {(close) => (
                        <ClubForm
                            isEdit={false}
                            refreshClub={fetchClubs}
                            onSuccess={close}
                        />
                    )}
                </DialogHandle>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="clubs">Clubes</TabsTrigger>
                    <TabsTrigger value="history">Historial</TabsTrigger>
                </TabsList>

                <TabsContent value="clubs" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {clubList.map((club) => (
                            <Card key={club.id_club}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <CardTitle className="text-lg">{club.nombre_club}</CardTitle>
                                        <Badge className={club.club_activo ? 'bg-green-500' : 'bg-gray-500'}>
                                            {club.club_activo ? 'Activo' : 'Inactivo'}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="font-medium">Fecha fundacion:</span>
                                                <p>{club.fecha_fundacion}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium">Telefono:</span>
                                                <p>{club.fono_club}</p>
                                            </div>
                                        </div>
                                        <div className="text-sm">
                                            <span className="font-medium">Correo Electronico:</span>
                                            <p>{club.email_club}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="font-medium">Series:</span>
                                                <p>{club.series}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium">Jugadores:</span>
                                                <p>{club.jugadores}</p>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2 pt-2">
                                            <ClubDetails club={club} />
                                            <DialogHandle<ClubType>
                                                title={`Modificar club ${club.nombre_club}`}
                                                trigger={
                                                    <Button variant="outline" size="sm" className="flex-1">
                                                        <Edit className="w-4 h-4 mr-1" /> Editar
                                                    </Button>
                                                }
                                            >
                                                {(close) => (
                                                    <ClubForm
                                                        club={club}
                                                        isEdit={true}
                                                        refreshClub={fetchClubs}
                                                        onSuccess={close}
                                                    />
                                                )}
                                            </DialogHandle>
                                        </div>
                                        <div className="flex space-x-2 pt-2">
                                            <Button onClick={() => setOpenSelected(club.id_club)} variant="destructive" size="sm" className="flex-1">
                                                <Trash2 className="w-4 h-4 mr-1" />
                                                Eliminar
                                            </Button>
                                            <AlertDialogHandle
                                                title={`Eliminacion de club ${club.nombre_club}`}
                                                description={`¿Estas seguro de querer eliminar al club ${club.nombre_club}`}
                                                confirmLabel='Eliminar'
                                                cancelLabel='Cancelar'
                                                onConfirm={() => handleDelete(club.id_club)}
                                                open={openSelected === club.id_club}
                                                onOpenChange={(Open) => {
                                                    if (!Open) setOpenSelected(null); // cerrar el dialog
                                                }}
                                            >
                                            </AlertDialogHandle>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Historial de Clubes y Series</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>Acción</TableHead>
                                        <TableHead>Club</TableHead>
                                        <TableHead>Detalle</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {clubHistory.map((item, i) => (
                                        <TableRow key={i}>
                                            <TableCell>{item.fecha}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{item.accion}</Badge>
                                            </TableCell>
                                            <TableCell>{item.club}</TableCell>
                                            <TableCell>{item.detalle}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div >
    );
};