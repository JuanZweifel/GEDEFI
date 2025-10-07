import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { 
  Plus, DollarSign, TrendingUp, Users, Calendar, MapPin, 
  Fingerprint, AlertTriangle, Target, Clock, Shield, Eye,
  CheckCircle, XCircle, Settings, Search, Filter
} from 'lucide-react';

// Enhanced Finance Module with Payment Order Creation
export const EnhancedFinanceModule: React.FC = () => {
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);

  const clubs = [
    { id: 1, name: "FC Barcelona Santiago" },
    { id: 2, name: "Real Madrid Chile" },
    { id: 3, name: "Universidad de Chile" },
    { id: 4, name: "Colo-Colo" },
    { id: 5, name: "Universidad Católica" }
  ];

  const pendingOrders = [
    { id: "001", club: "FC Barcelona", monto: "$150,000", vence: "2024-09-15", descripcion: "Mensualidad septiembre" },
    { id: "002", club: "Real Madrid", monto: "$200,000", vence: "2024-09-20", descripcion: "Inscripción serie A" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2>Gestión Financiera</h2>
        <Dialog open={isCreateOrderOpen} onOpenChange={setIsCreateOrderOpen}>
          <DialogTrigger asChild>
            <Button style={{ backgroundColor: '#0000db' }} className="text-white">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Orden de Pago
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Orden de Pago</DialogTitle>
            </DialogHeader>
            <form className="space-y-4">
              <div>
                <label className="block mb-2">Club</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un club" />
                  </SelectTrigger>
                  <SelectContent>
                    {clubs.map((club) => (
                      <SelectItem key={club.id} value={club.id.toString()}>
                        {club.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2">Monto</label>
                  <Input type="number" placeholder="Ingrese el monto" />
                </div>
                <div>
                  <label className="block mb-2">Fecha de Vencimiento</label>
                  <Input type="date" />
                </div>
              </div>
              <div>
                <label className="block mb-2">Descripción</label>
                <Textarea placeholder="Describe el concepto del pago" />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateOrderOpen(false)}>
                  Cancelar
                </Button>
                <Button style={{ backgroundColor: '#0000db' }} className="text-white">
                  Crear Orden
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Ingresos del Mes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-medium">$2,450,000</div>
            <p className="text-sm text-muted-foreground">+12% vs mes anterior</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Egresos del Mes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-medium">$1,890,000</div>
            <p className="text-sm text-muted-foreground">-5% vs mes anterior</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-[#0000db]">Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-medium">$560,000</div>
            <p className="text-sm text-muted-foreground">Utilidad neta</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Órdenes de Pago Pendientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingOrders.map((orden, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Orden #{orden.id} - {orden.club}</p>
                  <p className="text-sm text-muted-foreground">{orden.descripcion}</p>
                  <p className="text-sm">Vence: {orden.vence}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-[#0000db]">{orden.monto}</p>
                  <Button size="sm" variant="outline">Marcar como Pagado</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Analytics Module with KPIs
export const AnalyticsModule: React.FC = () => {
  const monthlyData = [
    { month: 'Ene', ingresos: 2100, egresos: 1800, clubes: 22 },
    { month: 'Feb', ingresos: 2300, egresos: 1900, clubes: 23 },
    { month: 'Mar', ingresos: 2200, egresos: 1850, clubes: 23 },
    { month: 'Abr', ingresos: 2500, egresos: 2000, clubes: 24 },
    { month: 'May', ingresos: 2400, egresos: 1950, clubes: 24 },
    { month: 'Jun', ingresos: 2600, egresos: 2100, clubes: 24 }
  ];

  const participationData = [
    { name: 'Serie A', value: 35, color: '#0000db' },
    { name: 'Serie B', value: 25, color: '#FF8C00' },
    { name: 'Serie C', value: 20, color: '#32CD32' },
    { name: 'Serie Juvenil', value: 20, color: '#9932CC' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2>Dashboard de Analíticas</h2>
        <Badge variant="outline" className="text-[#0000db]">
          Preparado para Grafana
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rentabilidad</p>
                <p className="text-2xl font-bold text-green-600">23.5%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tasa de Crecimiento</p>
                <p className="text-2xl font-bold text-[#0000db]">+8.2%</p>
              </div>
              <Users className="w-8 h-8 text-[#0000db]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Participación Promedio</p>
                <p className="text-2xl font-bold text-[#FF8C00]">87.3%</p>
              </div>
              <Target className="w-8 h-8 text-[#FF8C00]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Eficiencia Operativa</p>
                <p className="text-2xl font-bold text-purple-600">94.1%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Evolución Financiera Mensual</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="ingresos" stroke="#0000db" strokeWidth={2} />
                <Line type="monotone" dataKey="egresos" stroke="#FF8C00" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribución por Serie</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={participationData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {participationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Cross-reference Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Análisis Cruzado de Datos</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="clubes" fill="#0000db" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

// Fingerprint Enrollment Module
export const FingerprintModule: React.FC = () => {
  const [enrollmentStep, setEnrollmentStep] = useState(0);
  const [selectedUser, setSelectedUser] = useState('');

  const users = [
    { email: "juan.perez@asociacion.cl", name: "Juan Pérez", hasFingerprint: true },
    { email: "maria.gonzalez@asociacion.cl", name: "María González", hasFingerprint: false },
    { email: "carlos.rojas@asociacion.cl", name: "Carlos Rojas", hasFingerprint: true },
    { email: "ana.silva@asociacion.cl", name: "Ana Silva", hasFingerprint: false }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2>Gestión de Huellas Dactilares</h2>
        <Button style={{ backgroundColor: '#0000db' }} className="text-white">
          <Fingerprint className="w-4 h-4 mr-2" />
          Nuevo Registro
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User List */}
        <Card>
          <CardHeader>
            <CardTitle>Usuarios Registrados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((user, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {user.hasFingerprint ? (
                      <Badge className="bg-green-500 text-white">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Registrado
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-red-500 border-red-500">
                        <XCircle className="w-3 h-3 mr-1" />
                        Pendiente
                      </Badge>
                    )}
                    <Button size="sm" variant="outline">
                      {user.hasFingerprint ? 'Ver' : 'Registrar'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Enrollment Process */}
        <Card>
          <CardHeader>
            <CardTitle>Proceso de Registro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block mb-2">Seleccionar Usuario</label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un usuario" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.filter(u => !u.hasFingerprint).map((user, i) => (
                      <SelectItem key={i} value={user.email}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedUser && (
                <div className="space-y-4">
                  <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <Fingerprint className="w-16 h-16 mx-auto text-[#0000db] mb-4" />
                    <p className="text-lg font-medium mb-2">Coloque el dedo en el sensor</p>
                    <p className="text-sm text-gray-600">Asegúrese de presionar firmemente</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progreso de captura</span>
                      <span>3/3 capturas</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-[#0000db] h-2 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>

                  <Button className="w-full" style={{ backgroundColor: '#0000db' }}>
                    Completar Registro
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// User Permissions Management
export const UserPermissionsModule: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const users = [
    { 
      name: "Juan Pérez", 
      email: "juan.perez@asociacion.cl", 
      role: "admin", 
      permissions: ["users", "finances", "analytics", "meetings", "penalties", "fields", "clubs", "players"] 
    },
    { 
      name: "María González", 
      email: "maria.gonzalez@asociacion.cl", 
      role: "club_manager", 
      permissions: ["players", "meetings", "penalties"] 
    },
    { 
      name: "Carlos Rojas", 
      email: "carlos.rojas@asociacion.cl", 
      role: "referee", 
      permissions: ["penalties", "analytics"] 
    }
  ];

  const availablePermissions = [
    { id: "users", name: "Gestión de Usuarios", description: "Crear, editar y eliminar usuarios" },
    { id: "finances", name: "Finanzas", description: "Ver y gestionar información financiera" },
    { id: "analytics", name: "Analíticas", description: "Acceso a dashboards y reportes" },
    { id: "meetings", name: "Reuniones", description: "Crear y gestionar reuniones" },
    { id: "penalties", name: "Castigos", description: "Gestionar sanciones y castigos" },
    { id: "fields", name: "Canchas", description: "Administrar campos de juego" },
    { id: "clubs", name: "Clubes", description: "Gestión de clubes y registros" },
    { id: "players", name: "Jugadores", description: "Gestión de fichas de jugadores" }
  ];

  return (
    <div className="space-y-6">
      <h2>Gestión de Permisos de Usuario</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>Usuarios del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((user, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <Badge variant="outline" className="mt-1">
                      {user.role === 'admin' ? 'Administrador' : 
                       user.role === 'club_manager' ? 'Manager Club' : 'Árbitro'}
                    </Badge>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedUser(user)}
                  >
                    <Settings className="w-4 h-4 mr-1" />
                    Permisos
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Permissions Editor */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedUser ? `Permisos de ${selectedUser.name}` : 'Seleccione un usuario'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedUser ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  {availablePermissions.map((permission) => (
                    <div key={permission.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <input
                        type="checkbox"
                        id={permission.id}
                        checked={selectedUser.permissions.includes(permission.id)}
                        className="mt-1"
                        readOnly
                      />
                      <div className="flex-1">
                        <label htmlFor={permission.id} className="font-medium cursor-pointer">
                          {permission.name}
                        </label>
                        <p className="text-sm text-gray-600">{permission.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline">Cancelar</Button>
                  <Button style={{ backgroundColor: '#0000db' }} className="text-white">
                    Guardar Cambios
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Seleccione un usuario para editar sus permisos</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};