import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  Users, Building, Trophy, Activity, User,
  Calendar, MapPin, DollarSign, Shield, AlertCircle
} from 'lucide-react';



// Enhanced Players & Records Module (JUGADOR, LESION, FICHA_JUGADOR, HISTORIAL_JUGADOR)


// Audit Module (AUDITORIA)
export const AuditModule: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedAction, setSelectedAction] = useState('');

  const auditLogs = [
    {
      id: 1, fecha_hora: "2024-09-21 14:30:15", id_usuario: 1, usuario_nombre: "Juan Pérez",
      modulo: "USUARIO", accion: "CREATE", tabla_afectada: "USUARIO",
      id_registro: "3", descripcion: "Creación de nuevo usuario", ip_address: "192.168.1.100"
    },
    {
      id: 2, fecha_hora: "2024-09-21 14:25:10", id_usuario: 2, usuario_nombre: "María González",
      modulo: "JUGADOR", accion: "UPDATE", tabla_afectada: "JUGADOR",
      id_registro: "12345678-9", descripcion: "Actualización datos médicos", ip_address: "192.168.1.101"
    },
    {
      id: 3, fecha_hora: "2024-09-21 14:20:05", id_usuario: 1, usuario_nombre: "Juan Pérez",
      modulo: "CLUB", accion: "CREATE", tabla_afectada: "SERIE",
      id_registro: "5", descripcion: "Registro nueva serie femenina", ip_address: "192.168.1.100"
    },
    {
      id: 4, fecha_hora: "2024-09-21 14:15:30", id_usuario: 3, usuario_nombre: "Carlos Rojas",
      modulo: "PARTIDO", accion: "UPDATE", tabla_afectada: "PARTIDO",
      id_registro: "15", descripcion: "Actualización resultado partido", ip_address: "192.168.1.102"
    },
    {
      id: 5, fecha_hora: "2024-09-21 14:10:20", id_usuario: 2, usuario_nombre: "María González",
      modulo: "FINANZAS", accion: "CREATE", tabla_afectada: "ORDEN_PAGO",
      id_registro: "OR-001", descripcion: "Generación orden pago mensualidad", ip_address: "192.168.1.101"
    }
  ];

  const modules = ["USUARIO", "CLUB", "JUGADOR", "PARTIDO", "FINANZAS", "REUNION", "CANCHA"];
  const actions = ["CREATE", "UPDATE", "DELETE", "LOGIN", "LOGOUT"];

  const filteredLogs = auditLogs.filter(log => {
    const moduleMatch = !selectedModule || selectedModule === "ALL" || log.modulo === selectedModule;
    const actionMatch = !selectedAction || selectedAction === "ALL" || log.accion === selectedAction;
    return moduleMatch && actionMatch;
  });

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'bg-green-500';
      case 'UPDATE': return 'bg-blue-500';
      case 'DELETE': return 'bg-red-500';
      case 'LOGIN': return 'bg-purple-500';
      case 'LOGOUT': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getModuleIcon = (module: string) => {
    switch (module) {
      case 'USUARIO': return <User className="w-4 h-4" />;
      case 'CLUB': return <Building className="w-4 h-4" />;
      case 'JUGADOR': return <Users className="w-4 h-4" />;
      case 'PARTIDO': return <Trophy className="w-4 h-4" />;
      case 'FINANZAS': return <DollarSign className="w-4 h-4" />;
      case 'REUNION': return <Calendar className="w-4 h-4" />;
      case 'CANCHA': return <MapPin className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
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
                <p className="text-2xl font-bold text-[#0000db]">247</p>
              </div>
              <Activity className="w-8 h-8 text-[#0000db]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Usuarios Activos</p>
                <p className="text-2xl font-bold text-green-600">12</p>
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
                <p className="text-2xl font-bold text-red-600">3</p>
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
                <p className="text-2xl font-bold text-[#FF8C00]">7</p>
              </div>
              <Shield className="w-8 h-8 text-[#FF8C00]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
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
                    <SelectItem key={module} value={module}>
                      {module}
                    </SelectItem>
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
                    <SelectItem key={action} value={action}>
                      {action}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block mb-2">Fecha Desde</label>
              <Input type="date" />
            </div>
            <div>
              <label className="block mb-2">Fecha Hasta</label>
              <Input type="date" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Registro de Auditoría (AUDITORIA)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha/Hora</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Módulo</TableHead>
                <TableHead>Acción</TableHead>
                <TableHead>Tabla</TableHead>
                <TableHead>ID Registro</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.fecha_hora}</TableCell>
                  <TableCell>{log.usuario_nombre}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getModuleIcon(log.modulo)}
                      <span>{log.modulo}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getActionColor(log.accion)}>
                      {log.accion}
                    </Badge>
                  </TableCell>
                  <TableCell>{log.tabla_afectada}</TableCell>
                  <TableCell>{log.id_registro}</TableCell>
                  <TableCell className="max-w-xs truncate">{log.descripcion}</TableCell>
                  <TableCell className="text-sm text-gray-600">{log.ip_address}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};