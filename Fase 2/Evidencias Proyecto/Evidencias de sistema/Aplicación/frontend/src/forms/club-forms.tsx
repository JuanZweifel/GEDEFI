import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button.tsx';
import { Label } from '../components/ui/label.tsx';
import { Input } from '../components/ui/input.tsx';
import { Separator } from '../components/ui/separator.tsx';
import { Checkbox } from '../components/ui/checkbox.tsx';
import {
    Plus
} from 'lucide-react';

import { toast } from 'sonner';


import { createClub, updateClub } from '../services/clubServices.ts';
import { AlertDialogHandle } from '../components/alert-dialog-component.tsx';

import {
    type ClubType,
} from '../types.tsx';
import { useAuth } from '../contexts/authContext.tsx';

// Enhanced User & Roles Module (USUARIO, ROL, HISTORIAL_USUARIO)



type ClubFormProps = {
    club?: ClubType | null
    isEdit: boolean
    refreshClub: () => Promise<void>
    onSuccess: () => void
}


export function ClubForm({ club, isEdit, refreshClub, onSuccess }: ClubFormProps) {
    const [nombreClub, setNombreClub] = useState("")
    const [rutClub, setRutClub] = useState("")
    const [fechaFundacion, setFechaFundacion] = useState("")
    const [direccionClub, setDireccionClub] = useState("")
    const [fonoClub, setFonoClub] = useState("")
    const [emailClub, setEmailClub] = useState("")
    const [logoClub, setLogoClub] = useState<string | File | undefined>(undefined)
    const [colorPrimario, setColorPrimario] = useState("")
    const [colorSecundario, setColorSecundario] = useState("")
    const [colorRespaldo, setcolorRespaldo] = useState("")
    const [checkedRespaldo, setCheckedRespaldo] = useState(false)
    const [clubActivo, setClubActivo] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const { token } = useAuth()

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
            setClubActivo(club.club_activo ?? true)
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
                ...(isEdit ? { club_activo: clubActivo } : {}),
            }

            if (isEdit && club?.id_club) {
                const response = await updateClub<any>(clubObject, club.id_club, logoClub, token)
                toast.success(response.message)
            } else {
                const response = await createClub<any>(clubObject, logoClub, token)
                toast.success(response.message)
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
                    <Label className="block mb-2">RUT (*):</Label>
                    <Input
                        value={rutClub}
                        onChange={(e) => {
                            const value = e.target.value;
                            setRutClub(value);

                            // Validación con tu función
                            if (!validarRut(value)) {
                                e.currentTarget.setCustomValidity("RUT inválido. Verifica el formato y dígito verificador.");
                            } else {
                                e.currentTarget.setCustomValidity(""); // limpio el mensaje si es válido
                            }
                        }}
                        required
                        pattern="^\d{7,8}-[0-9Kk]$"
                        title="Ingrese un RUT válido (ej: 12345678-9)"
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
                    <Label className="block mb-2">Correo electrónico (*):</Label>
                    <Input
                        type="email"
                        placeholder="club@example.com"
                        value={emailClub}
                        onChange={(e) => setEmailClub(e.target.value)}
                        required
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
                {isEdit && (
                    <div className="col-span-2 flex items-center space-x-2">
                        <Checkbox className="CheckBoxRoot" checked={clubActivo} onCheckedChange={() => setClubActivo(!clubActivo)} />
                        <Label htmlFor="club-activo" className="text-sm">
                            Club activo
                        </Label>
                    </div>
                )}
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
