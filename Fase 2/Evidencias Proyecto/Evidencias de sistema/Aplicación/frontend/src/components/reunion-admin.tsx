import { useEffect, useState } from "react";
import {
  getReuniones,
  createReunion,
  updateReunion,
  deleteReunion,
  getReunionAsistencia,
} from "../services/reunionService";
import MeetingForm from "../forms/reunion-form";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import AttendanceCheck from "./registro-asistencia";
import { useAuth } from "../contexts/authContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Edit, Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

function AttendanceList({ meeting, onClose }) {
  const [rows, setRows] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    async function load() {
      try {
        const data = await getReunionAsistencia(meeting.id_reunion, token);
        setRows(data);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, [meeting, token]);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Asistencia: {meeting.titulo_reunion}</DialogTitle>
        </DialogHeader>

        <Table className="text-sm">
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>RUT</TableHead>
              <TableHead>Hora llegada</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  No hay asistentes registrados.
                </TableCell>
              </TableRow>
            )}

            {rows.map(u => (
              <TableRow key={u.rut_usuario}>
                <TableCell>{u.nombre ?? "N/A"}</TableCell>
                <TableCell>{u.rut_usuario}</TableCell>
                <TableCell>{u.hora_llegada ? new Date(u.hora_llegada).toLocaleString() : "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
}


export default function AdminMeetings() {
  const [meetings, setMeetings] = useState([]);
  const [editing, setEditing] = useState(null);
  const [activeMeeting, setActiveMeeting] = useState(null);
  const [attendanceMeeting, setAttendanceMeeting] = useState(null);

  const { token } = useAuth();

  async function load() {
    const data = await getReuniones(token);
    setMeetings(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSave(values) {
    if (editing?.id_reunion) {
      await updateReunion(editing.id_reunion, values, token);
    } else {
      await createReunion(values, token);
    }
    setEditing(null);
    load();
  }

  async function handleDelete(id) {
    await deleteReunion(id, token);
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Gestión de Reuniones</h2>
        <Button style={{ backgroundColor: "#0000db" }} className="text-white" onClick={() => setEditing({})}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva reunión
        </Button>
      </div>

      <Card>
        <CardContent>
          <Table className="w-full text-sm">
            <TableHeader>
              <TableRow className="border-b">
                <TableHead>Título</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Inicio</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {meetings.map(r => (
                <TableRow key={r.id_reunion} className="border-b">
                  <TableCell>{r.titulo_reunion}</TableCell>
                  <TableCell>{r.fecha_reunion}</TableCell>
                  <TableCell>{r.hora_reunion}</TableCell>

                  <TableCell className="flex space-x-1 justify-end">
                    <Button variant="outline" size="sm" className="bg-green-500 text-white" onClick={() => setActiveMeeting(r)}>
                      Registrar asistencia
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-blue-500 text-white"
                      onClick={() => setAttendanceMeeting(r)}
                    >
                      Ver asistencia
                    </Button>

                    {/*
                    <Button variant="outline" size="sm" onClick={() => setEditing(r)}>
                      <Edit className="w-4 h-4 mr-1" /> Editar
                    </Button>
                    */}

                    <Button
                      onClick={() => handleDelete(r.id_reunion)}
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4 mr-1" /> Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {editing && (
        <MeetingForm
          meeting={editing}
          onClose={() => setEditing(null)}
          onSave={handleSave}
        />
      )}

      {activeMeeting && (
        <AttendanceCheck
          meeting={activeMeeting}
          onClose={() => setActiveMeeting(null)}
        />
      )}

      {attendanceMeeting && (
        <AttendanceList
          meeting={attendanceMeeting}
          onClose={() => setAttendanceMeeting(null)}
        />
      )}
    </div>
  );
}
