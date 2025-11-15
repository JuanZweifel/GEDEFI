import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  Users, Building, Trophy, Activity, User,
  Calendar, MapPin, DollarSign, Shield, AlertCircle,
  Send
} from 'lucide-react';

import { getAuditorias, getResumenAuditorias } from '../services/auditoriaServices';
import type { ResumenAuditoriaType, AuditoriaType } from '../types';
import { toast } from 'sonner';
import { useAuth } from '../contexts/authContext';
import { Button } from '../components/ui/button';



// Enhanced Players & Records Module (JUGADOR, LESION, FICHA_JUGADOR, HISTORIAL_JUGADOR)


// Audit Module (AUDITORIA)
export const AuditModule: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState<string>("ALL");
  const [selectedAction, setSelectedAction] = useState<string>("ALL");
  const [fechaIni, setFechaIni] = useState<string>("");
  const [fechaFin, setFechaFin] = useState<string>("");
  const [auditLogs, setAuditLogs] = useState<AuditoriaType[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [resumenAudit, setResumenAudit] = useState<ResumenAuditoriaType>()

  const { token } = useAuth();

  const fetchResumen = async () => {
    try {
      const data = await getResumenAuditorias<ResumenAuditoriaType>(token);
      setResumenAudit(data);
    } catch (error) {
      toast.info("Hubo un problema al cargar el resumen de auditorías");
    }
  }
  const fetchAuditLogs = async () => {
    try {
      setAuditLogs([]);
      const recurso = selectedModule !== "ALL" ? selectedModule : null;
      const action = selectedAction !== "ALL" ? selectedAction : null;
      const fecha_ini = fechaIni ? `${fechaIni}T00:00:00` : null;
      const fecha_fin = fechaFin ? `${fechaFin}T23:59:59` : null;

      const data = await getAuditorias<any>(
        token,
        page,
        20,
        action,
        recurso,
        fecha_ini,
        fecha_fin
      );

      setAuditLogs(data.items);
      setTotalPages(Math.ceil(data.total / 20));
      if (data.length === 0) {
        toast.info("No hay registros de auditoría para los filtros seleccionados");
      }
    } catch (error) {
      toast.error("Error al obtener auditorías");
    }
  };

  useEffect(() => {
    fetchAuditLogs();
    fetchResumen();
  }, []);

  useEffect(() => {
    fetchAuditLogs();
  }, [selectedModule, selectedAction, fechaIni, fechaFin, page]);

  const modules = [
    "ROL", "USUARIO", "CLUB", "SERIE", "JUGADOR", "LESION", "CALENDARIO",
    "ENTRENAMIENTO", "PARTIDO", "FINANZAS", "REUNION", "CANCHA", "SOLICITUDES",
  ];
  const actions = ["INSERT", "UPDATE", "DELETE"];

  const getActionColor = (action: string, error: boolean) => {
    if (error) return "bg-gray-500";
    switch (action) {
      case "INSERT": return "bg-green-500";
      case "UPDATE": return "bg-yellow-500";
      case "DELETE": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getModuleIcon = (module: string) => {
    switch (module) {
      case "ROL": return <Shield className="w-4 h-4" />;
      case "USUARIO": return <User className="w-4 h-4" />;
      case "CLUB": return <Building className="w-4 h-4" />;
      case "SERIE": return <Trophy className="w-4 h-4" />;
      case "JUGADOR": return <Users className="w-4 h-4" />;
      case "LESION": return <AlertCircle className="w-4 h-4" />;
      case "CALENDARIO": return <Calendar className="w-4 h-4" />;
      case "ENTRENAMIENTO": return <Activity className="w-4 h-4" />;
      case "PARTIDO": return <MapPin className="w-4 h-4" />;
      case "FINANZAS": return <DollarSign className="w-4 h-4" />;
      case "REUNION": return <Users className="w-4 h-4" />;
      case "CANCHA": return <Building className="w-4 h-4" />;
      case "SOLICITUD": return <Send className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2>Módulo de Auditoría</h2>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-[#0000db]">
            <Shield className="w-4 h-4 mr-1" />
            Logs del Sistema
          </Badge>
        </div>
      </div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Acciones Hoy</p>
                <p className="text-2xl font-bold text-[#0000db]">{resumenAudit?.acciones_hoy}</p>
              </div>
              <Activity className="w-8 h-8 text-[#0000db]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Acciones exitosas</p>
                <p className="text-2xl font-bold text-green-600">{resumenAudit?.exitos_hoy}</p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Errores Hoy</p>
                <p className="text-2xl font-bold text-red-600">{resumenAudit?.errores_hoy}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Módulos Auditados</p>
                <p className="text-2xl font-bold text-[#FF8C00]">{resumenAudit?.modulos_auditados}</p>
              </div>
              <Shield className="w-8 h-8 text-[#FF8C00]" />
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Auditoría</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block mb-2">Módulo</label>
              <Select value={selectedModule} onValueChange={setSelectedModule}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los módulos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos los módulos</SelectItem>
                  {modules.map((module) => (
                    <SelectItem key={module} value={module}>{module}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block mb-2">Acción</label>
              <Select value={selectedAction} onValueChange={setSelectedAction}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las acciones" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todas las acciones</SelectItem>
                  {actions.map((action) => (
                    <SelectItem key={action} value={action}>{action}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block mb-2">Fecha Desde</label>
              <Input type="date" value={fechaIni} onChange={(e) => setFechaIni(e.target.value)} />
            </div>

            <div>
              <label className="block mb-2">Fecha Hasta</label>
              <Input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Auditoría */}
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex justify-between items-center w-full">
              <span>Registros de Auditoría</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha/Hora</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Módulo</TableHead>
                <TableHead>Acción</TableHead>
                <TableHead>Recurso</TableHead>
                <TableHead>ID Registro</TableHead>
                <TableHead>Descripción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.map((log) => (
                <TableRow key={log.id_auditoria}>
                  <TableCell className="font-medium">
                    {new Date(log.fecha_cambio).toLocaleString("es-CL", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </TableCell>
                  <TableCell>{log.nombre_usuario} {log.apellido_usuario}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getModuleIcon(log.recurso.toUpperCase())}
                      <span>{log.recurso.toUpperCase()}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getActionColor(log.accion_realizada, log.error)} text-white`}>
                      {log.accion_realizada}
                    </Badge>
                  </TableCell>
                  <TableCell>{log.recurso}</TableCell>
                  <TableCell>{log.id_recurso ?? "N/A"}</TableCell>
                  <TableCell className="max-w-xs truncate">{log.descripcion}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-gray-500">
          Página {page} de {totalPages || 1}
        </span>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => prev + 1)}
            disabled={page >= totalPages}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
};
