import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button.tsx';
import { Label } from '../components/ui/label.tsx';
import { Input } from '../components/ui/input.tsx';
import { Separator } from '../components/ui/separator.tsx';
import { Checkbox } from '../components/ui/checkbox.tsx';

import { toast } from 'sonner';


import { createClub, updateClub } from '../services/clubServices.ts';
import { AlertDialogHandle } from '../components/alert-dialog-component.tsx';

import {
    type ClubType,
    type JugadorType,
    type SerieType,
    type UsuarioType,
} from '../types.tsx';
import { useAuth } from '../contexts/authContext.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs.tsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.tsx';
import { Eye, FileText, Plus } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table.tsx';
import { Badge } from '../components/ui/badge.tsx';
import { NavLink } from 'react-router';

// Enhanced User & Roles Module (USUARIO, ROL, HISTORIAL_USUARIO)



type ClubFormProps = {
    club?: ClubType | null
    isEdit: boolean
    onSuccess: (...args: any[]) => void; 
}


export function ClubForm({ club, isEdit, onSuccess }: ClubFormProps) {
    const [nombreClub, setNombreClub] = useState("")
    const [rutClub, setRutClub] = useState("")
    const [fechaFundacion, setFechaFundacion] = useState("")
    const [direccionClub, setDireccionClub] = useState("")
    const [fonoClub, setFonoClub] = useState("")
    const [emailClub, setEmailClub] = useState("")
    const [logoClub, setLogoClub] = useState<string | File | undefined>(undefined)
    const [colorPrimario, setColorPrimario] = useState("#000000")
    const [colorSecundario, setColorSecundario] = useState("#000000")
    const [colorRespaldo, setcolorRespaldo] = useState("#000000")
    const [checkedRespaldo, setCheckedRespaldo] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const { token, id_club } = useAuth()


    useEffect(() => {
        if (isEdit && club) {
            setNombreClub(club.nombre_club ?? "")
            setRutClub(club.rut_club ?? "")
            setFechaFundacion(club.fecha_fundacion ?? "")
            setDireccionClub(club.direccion_club ?? "")
            setFonoClub(club.fono_club ?? "")
            setEmailClub(club.email_club ?? "")
            setLogoClub(club.logo_club ?? undefined)
            setColorPrimario(club?.color_primario ?? "#000000")
            setColorSecundario(club?.color_secundario ?? "#000000")
            setcolorRespaldo(club?.color_respaldo ?? "")
            if (club.color_respaldo) { setCheckedRespaldo(true) }
        }
    }, [club, isEdit])

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
            const clubObject: Record<string, any> = {
                rut_club: rutClub,
                nombre_club: nombreClub,
                fecha_fundacion: fechaFundacion,
                fono_club: fonoClub,
                direccion_club: direccionClub,
                email_club: emailClub,
                color_primario: colorPrimario === "" ? "#000000" : colorPrimario,
                color_secundario: colorSecundario === "" ? "#000000" : colorSecundario,
                ...(checkedRespaldo ? { color_respaldo: colorRespaldo === "" ? "#000000" : colorRespaldo } : {}),
            }

            if (isEdit && club?.id_club) {
                const response = await updateClub<any>(clubObject, club.id_club, token, logoClub )
                toast.success(response.message)
            } else {
                const response = await createClub<any>(clubObject, token, logoClub )
                toast.success(response.message)
            }

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
                    <Label className="block mb-2">RUT (*):</Label>
                    <Input
                        value={rutClub}
                        onChange={(e) => {
                            const value = e.target.value;
                            console.log(value)
                            setRutClub(value);

                            // Validación con tu función
                            if (!validarRut(value) || e.target.value === "11111111-1") {
                                e.currentTarget.setCustomValidity("RUT inválido. Verifica el formato y dígito verificador.");
                            } else {
                                e.currentTarget.setCustomValidity(""); // limpio el mensaje si es válido
                            }
                        }}
                        required
                        pattern="^\d{7,8}-[0-9Kk]$"
                        title="Ingrese un RUT válido (ej: 12345678-9)"
                        disabled={id_club? true : false}
                    />
                </div>
                <div>
                    <Label className="block mb-2">Fecha fundación (*):</Label>
                    <Input
                        type="date"
                        value={fechaFundacion}
                        onChange={(e) => setFechaFundacion(e.target.value)}
                        required
                        max={new Date().toISOString().split("T")[0]}
                        disabled={id_club? true : false}
                    />
                </div>
                <div className='col-span-2'>
                    <Label className="block mb-2">Nombre del club (*):</Label>
                    <Input
                        placeholder="Ej: Estadio Municipal"
                        value={nombreClub}
                        onChange={(e) => setNombreClub(e.target.value)}
                        required
                        maxLength={120}
                        minLength={4}
                        pattern="^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$"
                        disabled={id_club? true : false}
                    />
                </div>
                <div className="col-span-2">
                    <Label className="block mb-2">Dirección (*):</Label>
                    <Input
                        placeholder="Dirección del club"
                        value={direccionClub}
                        onChange={(e) => setDireccionClub(e.target.value)}
                        required
                        minLength={10}
                        maxLength={500}
                        disabled={id_club? true : false}
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
                        disabled={id_club? true : false}
                    />
                </div>
                <div>
                    <Label className="block mb-2">Correo electrónico (*):</Label>
                    <Input
                        type="email"
                        placeholder="club@example.com"
                        value={emailClub}
                        onChange={(e) => setEmailClub(e.target.value)}
                        required
                        disabled={id_club? true : false}
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <Label className="block mb-">Primario(*):</Label>
                    <Input
                        type='color'
                        value={colorPrimario}
                        onChange={(e) => setColorPrimario(e.target.value)}
                        required
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <Label className="block mb-2">Secundario(*):</Label>
                    <Input
                        type='color'
                        value={colorSecundario}
                        onChange={(e) => setColorSecundario(e.target.value)}
                        required
                    />
                </div>
                <div className="col-span-2 flex items-center space-x-2">
                    <Checkbox className="CheckBoxRoot" checked={checkedRespaldo} onCheckedChange={() => setCheckedRespaldo(!checkedRespaldo)} />
                    <Label htmlFor="club-activo" className="text-sm">
                        Color terceario
                    </Label>
                </div>
                {checkedRespaldo &&
                    <div className="flex items-center space-x-2">
                        <Label className="block mb-2">Respald(*):</Label>
                        <Input
                            type='color'
                            value={colorRespaldo}
                            onChange={(e) => setcolorRespaldo(e.target.value)}
                            required
                        />
                    </div>
                }
                <div className="col-span-2 flex items-center space-x-2">
                    <span className='text-gray-400 text-sm'>Todos los campos marcados con (*) deben ser rellenados.</span>
                </div>
                <div className='col-span-2'>
                    <Separator />
                </div>
                <div className="col-span-2">
                    <Label className="block mb-2">Logo club</Label>
                    {!isEdit &&
                        <Input
                            type='file'
                            accept='image/*'
                            onChange={(e) => {
                                if (e.target.files && e.target.files.length > 0) {
                                    setLogoClub(e.target.files[0])
                                }
                            }}
                            required
                        />
                    }
                    {isEdit &&
                        <Input
                            type='file'
                            accept='image/*'
                            onChange={(e) => {
                                if (e.target.files && e.target.files.length > 0) {
                                    setLogoClub(e.target.files[0])
                                }
                            }}
                        />
                    }
                    {logoClub !== undefined &&
                        <img
                            src={typeof logoClub === "string" ? logoClub : URL.createObjectURL(logoClub)}
                            alt="Preview logo"
                            className="mt-2 h-32 w-32 object-contain border rounded"
                        />
                    }
                </div>
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

export const ClubDetailsForm: React.FC<{club: ClubType, setIsLoading:React.Dispatch<React.SetStateAction<number>> }> = ({
    club, 
    setIsLoading
}) => {

    // !Estados (UseState)
    const [series, setSeries] = useState<SerieType[]>([])
    const [directiva, setDirectiva] = useState<UsuarioType[]>([])
    const [jugadores, setJugadores] = useState<JugadorType[]>([])
    const [activeTab, setActiveTab] = useState("directiva")

    // !Control de estados (useEffect)
    useEffect(() => {
        setDirectiva(club.directiva)
        setSeries(club.series)
        setJugadores(club.jugadores)
        setIsLoading(100)
    }, [club])

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <Label className="block mb-2">RUT</Label>
                    <Input value={club.rut_club} disabled />
                </div>
                <div>
                    <Label className="block mb-2">Fecha fundacion</Label>
                    <Input value={club.fecha_fundacion} disabled />
                </div>
                <div>
                    <Label className="block mb-2">Nombre</Label>
                    <Input value={club.nombre_club} disabled />
                </div>
                <div>
                    <Label className="block mb-2">Dirección</Label>
                    <Input value={club.direccion_club} disabled />
                </div>
                <div>
                    <Label className="block mb-2">Telefono</Label>
                    <Input value={club.fono_club} disabled />
                </div>
                <div>
                    <Label className="block mb-2">Correo Electronico</Label>
                    <Input value={club.email_club} disabled />
                </div>
                <div>
                    <Label className="block mb-2">Color primario</Label>
                    <Input
                        type='color'
                        value={club.color_primario}
                        disabled
                    />
                </div>
                <div>
                    <Label className="block mb-2">Color secundario</Label>
                    <Input
                        type='color'
                        value={club.color_secundario}
                        disabled
                    />
                </div>
                <div>
                    <Label className="block mb-2">Color respaldo</Label>
                    <Input
                        type='color'
                        value={club.color_respaldo}
                        disabled
                    />
                </div>
                <div>
                    <Label className="block mb-0">Estado</Label>
                    <Badge className={club.club_activo ? 'bg-green-500' : 'bg-gray-500'}>
                        {club.club_activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                </div>
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="directiva">Directiva</TabsTrigger>
                    <TabsTrigger value="series">Series</TabsTrigger>
                    <TabsTrigger value="jugadores">Jugadores</TabsTrigger>
                </TabsList>

                <TabsContent value="directiva" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className='font-medium'>Usuarios directivos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {directiva.length > 0 &&
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>RUT</TableHead>
                                            <TableHead>Nombre completo</TableHead>
                                            <TableHead>Fecha nacimiento</TableHead>
                                            <TableHead>Correo electronico</TableHead>
                                            <TableHead>Huella registrada</TableHead>
                                            <TableHead>ROL</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead>Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {directiva.map((d) => (
                                            <TableRow key={d.rut_usuario}>
                                                <TableCell className="font-medium">{d.rut_usuario}</TableCell>
                                                <TableCell className="font-medium">{d.nombre_usuario} {d.apellido_usuario}</TableCell>
                                                <TableCell className="font-medium">{d.fecha_nacimiento}</TableCell>
                                                <TableCell className="font-medium">{d.email_usuario}</TableCell>
                                                <TableCell className="font-medium">
                                                    <Badge className={d.huella_indice || d.huella_pulgar ? 'bg-green-500' : 'bg-red-500'}>
                                                        {d.huella_indice || d.huella_pulgar ? 'Registrada' : 'Sin registrar'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    <Badge className='bg-blue-500'>
                                                        {d.nombre_rol?.toUpperCase()}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    <Badge className={d.usuario_activo ? 'bg-green-500' : 'bg-gray-500'}>
                                                        {d.usuario_activo ? 'Activo' : 'Inactivo'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            }
                            {directiva.length === 0 &&
                                <div className="text-center py-8 text-gray-500">
                                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>Este club no tiene directiva asociada.</p>
                                </div>
                            }
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="series" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className='font-medium'>Series registradas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {!!series && series.length > 0 &&
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nombre Serie</TableHead>
                                            <TableHead>Jugadores</TableHead>
                                            <TableHead>Fecha Inicio</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead>Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {series.map((serie) => (
                                            <TableRow key={serie.id_serie ?? serie.nombre_serie}>
                                                <TableCell className="font-medium">{serie.nombre_serie}</TableCell>
                                                <TableCell className="font-medium">{serie.cantidad_jugadores}</TableCell>
                                                <TableCell className="font-medium">{serie.fecha_creacion?.split("T")[0]}</TableCell>
                                                <TableCell className="font-medium">
                                                    <Badge className={serie.serie_activa ? 'bg-green-500' : 'bg-gray-500'}>
                                                        {serie.serie_activa ? 'Activo' : 'Inactivo'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    <NavLink to={`/dashboard/series/${serie.id_serie}`}>
                                                        <Button variant="outline" size="sm">
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                    </NavLink>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            }
                            {series.length === 0 &&
                                <div className="text-center py-8 text-gray-500">
                                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>Este club no tiene series registradas.</p>
                                </div>
                            }
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="jugadores" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className='font-medium'>Usuarios directivos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {jugadores.length > 0 &&
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>RUT</TableHead>
                                            <TableHead>Nombre completo</TableHead>
                                            <TableHead>Genero</TableHead>
                                            <TableHead>Fecha nacimiento</TableHead>
                                            <TableHead>Enfermedades cronicas</TableHead>
                                            <TableHead>Telefono</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead>Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {jugadores.map((j) => (
                                            <TableRow key={j.rut_jugador}>
                                                <TableCell className="font-medium">{j.rut_jugador}</TableCell>
                                                <TableCell className="font-medium">{j.primer_nombre} {j.segundo_nombre} {j.primer_apellido} {j.segundo_apellido}</TableCell>
                                                <TableCell className="font-medium">{j.genero ? "Masculino" : "Femenino"}</TableCell>
                                                <TableCell className="font-medium">{j.fecha_nacimiento}</TableCell>
                                                <TableCell className="font-medium">{j.enfermedades_cronicas}</TableCell>
                                                <TableCell className="font-medium">{j.fono_jugador}</TableCell>
                                                <TableCell className="font-medium">
                                                    <Badge className={j.jugador_activo ? 'bg-green-500' : 'bg-gray-500'}>
                                                        {j.jugador_activo ? 'Activo' : 'Inactivo'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            }
                            {jugadores.length === 0 &&
                                <div className="text-center py-8 text-gray-500">
                                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>Este club no tiene jugadores asociados.</p>
                                </div>
                            }
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
