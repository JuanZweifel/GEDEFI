import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "../components/ui/select";

export default function MeetingForm({ meeting, onClose, onSave }) {
    const [form, setForm] = useState({
        titulo_reunion: meeting?.titulo_reunion ?? "",
        tipo_reunion: meeting?.tipo_reunion ?? "",
        fecha_reunion: meeting?.fecha_reunion ?? "",
        hora_reunion: meeting?.hora_reunion ?? "",
        lugar_reunion: meeting?.lugar_reunion ?? "",
        desc_reunion: meeting?.desc_reunion ?? "",
    });

    function change(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    function submit(e) {
        e.preventDefault();
        onSave(form);
    }

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {meeting?.id_reunion ? "Editar reunión" : "Nueva reunión"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">

                    {/* Título */}
                    <div className="space-y-2">
                        <Label>Título de la reunión *</Label>
                        <Input
                            name="titulo_reunion"
                            value={form.titulo_reunion}
                            onChange={change}
                            placeholder="Ej. Comité general"
                            required
                        />
                    </div>

                    {/* Tipo */}
                    <div className="space-y-2">
                        <Label>Tipo de reunión *</Label>
                        <Select
                            value={String(form.tipo_reunion)}
                            onValueChange={(value) =>
                                setForm({ ...form, tipo_reunion: Number(value) })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccione el tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0">General</SelectItem>
                                <SelectItem value="1">Directiva</SelectItem>
                                <SelectItem value="2">Operativa</SelectItem>
                                <SelectItem value="3">Extraordinaria</SelectItem>
                                <SelectItem value="4">Otra</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Fecha */}
                    <div className="space-y-2">
                        <Label>Fecha *</Label>
                        <Input
                            type="date"
                            name="fecha_reunion"
                            value={form.fecha_reunion}
                            onChange={change}
                            required
                        />
                    </div>

                    {/* Hora */}
                    <div className="space-y-2">
                        <Label>Hora *</Label>
                        <Input
                            type="time"
                            name="hora_reunion"
                            value={form.hora_reunion}
                            onChange={change}
                            required
                        />
                    </div>

                    {/* Lugar */}
                    <div className="space-y-2">
                        <Label>Lugar *</Label>
                        <Input
                            name="lugar_reunion"
                            value={form.lugar_reunion}
                            onChange={change}
                            placeholder="Ej. Sede comunitaria, Sala 2..."
                            required
                        />
                    </div>

                    {/* Descripción */}
                    <div className="space-y-2">
                        <Label>Descripción</Label>
                        <Textarea
                            name="desc_reunion"
                            value={form.desc_reunion}
                            onChange={change}
                            placeholder="Detalles de la reunión (opcional)"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="secondary" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit">Guardar</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
