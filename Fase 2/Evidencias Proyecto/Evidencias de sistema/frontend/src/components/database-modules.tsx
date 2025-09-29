import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Plus, Edit, Trash2, Eye, Users, Building, Trophy, Activity, 
  Calendar, MapPin, DollarSign, Shield, Search, Filter, ChevronRight,
  History, FileText, AlertCircle, CheckCircle, Clock, Target, User,
  Upload, X, Download
} from 'lucide-react';

// Enhanced User & Roles Module (USUARIO, ROL, HISTORIAL_USUARIO)
export const UserRoleModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const users = [
    { 
      id: 1, rut: "12345678-9", nombre: "Juan", apellido1: "Pérez", apellido2: "González",
      email: "juan.perez@asociacion.cl", telefono: "+56987654321", id_rol: 1, rol_nombre: "Administrador",
      activo: true, fecha_creacion: "2024-01-15", huella_registrada: true
    },
    { 
      id: 2, rut: "98765432-1", nombre: "María", apellido1: "González", apellido2: "Silva",
      email: "maria.gonzalez@asociacion.cl", telefono: "+56987654322", id_rol: 2, rol_nombre: "Manager Club",
      activo: true, fecha_creacion: "2024-02-20", huella_registrada: false
    }
  ];

  const roles = [
    { id: 1, nombre: "Administrador", descripcion: "Acceso completo al sistema", activo: true },
    { id: 2, nombre: "Manager Club", descripcion: "Gestión de club y jugadores", activo: true },
    { id: 3, nombre: "Árbitro", descripcion: "Gestión de partidos y sanciones", activo: true }
  ];

  const userHistory = [
    { fecha: "2024-09-20 14:30", accion: "Modificación de rol", usuario: "Juan Pérez", detalle: "Cambio de rol a Administrador" },
    { fecha: "2024-09-19 09:15", accion: "Registro de huella", usuario: "María González", detalle: "Primera captura de huella dactilar" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2>Gestión de Usuarios y Roles</h2>
        <Button style={{ backgroundColor: '#0000db' }} className="text-white">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">Usuarios (USUARIO)</TabsTrigger>
          <TabsTrigger value="roles">Roles (ROL)</TabsTrigger>
          <TabsTrigger value="history">Historial (HISTORIAL_USUARIO)</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usuarios del Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>RUT</TableHead>
                    <TableHead>Nombre Completo</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Huella</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.rut}</TableCell>
                      <TableCell>{user.nombre} {user.apellido1} {user.apellido2}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.rol_nombre}</Badge>
                      </TableCell>
                      <TableCell>
                        {user.huella_registrada ? (
                          <Badge className="bg-green-500">Registrada</Badge>
                        ) : (
                          <Badge variant="outline" className="text-red-500">Pendiente</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={user.activo ? 'bg-green-500' : 'bg-red-500'}>
                          {user.activo ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Roles del Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roles.map((role) => (
                  <Card key={role.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{role.nombre}</CardTitle>
                        <Badge className={role.activo ? 'bg-green-500' : 'bg-gray-500'}>
                          {role.activo ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">{role.descripcion}</p>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Shield className="w-4 h-4 mr-1" />
                          Permisos
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Usuarios</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha/Hora</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Acción</TableHead>
                    <TableHead>Detalle</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userHistory.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell>{item.fecha}</TableCell>
                      <TableCell>{item.usuario}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.accion}</Badge>
                      </TableCell>
                      <TableCell>{item.detalle}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Enhanced Clubs & Series Module (CLUB, SERIE, DETALLE_CLUB_JUGADOR, FICHA_JUGADOR)
export const ClubSeriesModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState('clubs');
  const [selectedClub, setSelectedClub] = useState<any>(null);

  const clubs = [
    {
      id: 1, nombre: "FC Barcelona Santiago", fecha_fundacion: "1995-03-15", mensualidad_activa: true,
      id_asociacion: 1, activo: true, directiva: "Juan Pérez (Presidente), María Silva (Secretaria)",
      series_registradas: 3, jugadores_totales: 65
    },
    {
      id: 2, nombre: "Real Madrid Chile", fecha_fundacion: "1998-07-22", mensualidad_activa: true,
      id_asociacion: 1, activo: true, directiva: "Carlos Rojas (Presidente), Ana González (Tesorera)",
      series_registradas: 2, jugadores_totales: 48
    }
  ];

  const series = [
    { 
      id: 1, nombre: "Serie A Masculina", id_club: 1, club_nombre: "FC Barcelona Santiago",
      categoria: "Adultos", activo: true, fecha_inicio: "2024-03-01", jugadores_inscritos: 22
    },
    {
      id: 2, nombre: "Serie Juvenil", id_club: 1, club_nombre: "FC Barcelona Santiago", 
      categoria: "Sub-18", activo: true, fecha_inicio: "2024-03-01", jugadores_inscritos: 18
    }
  ];

  const clubHistory = [
    { fecha: "2024-09-15", accion: "Registro nueva serie", club: "FC Barcelona Santiago", detalle: "Serie Femenina agregada" },
    { fecha: "2024-09-10", accion: "Actualización directiva", club: "Real Madrid Chile", detalle: "Cambio de tesorero" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2>Gestión de Clubes y Series</h2>
        <div className="flex space-x-2">
          <Button style={{ backgroundColor: '#0000db' }} className="text-white">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Club
          </Button>
          <Button variant="outline" style={{ borderColor: '#0000db', color: '#0000db' }}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Serie
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="clubs">Clubes (CLUB)</TabsTrigger>
          <TabsTrigger value="series">Series (SERIE)</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="clubs" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clubs.map((club) => (
              <Card key={club.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{club.nombre}</CardTitle>
                    <Badge className={club.activo ? 'bg-green-500' : 'bg-gray-500'}>
                      {club.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <span className="font-medium">Fundación:</span>
                      <p>{club.fecha_fundacion}</p>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Directiva:</span>
                      <p className="text-gray-600">{club.directiva}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Series:</span>
                        <p>{club.series_registradas}</p>
                      </div>
                      <div>
                        <span className="font-medium">Jugadores:</span>
                        <p>{club.jugadores_totales}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="w-4 h-4 mr-1" />
                        Ver Detalles
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="series" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Series Registradas</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre Serie</TableHead>
                    <TableHead>Club</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Jugadores</TableHead>
                    <TableHead>Fecha Inicio</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {series.map((serie) => (
                    <TableRow key={serie.id}>
                      <TableCell className="font-medium">{serie.nombre}</TableCell>
                      <TableCell>{serie.club_nombre}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{serie.categoria}</Badge>
                      </TableCell>
                      <TableCell>{serie.jugadores_inscritos}</TableCell>
                      <TableCell>{serie.fecha_inicio}</TableCell>
                      <TableCell>
                        <Badge className={serie.activo ? 'bg-green-500' : 'bg-gray-500'}>
                          {serie.activo ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button variant="outline" size="sm">
                            <Users className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
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
    </div>
  );
};

// Enhanced Players & Records Module (JUGADOR, LESION, FICHA_JUGADOR, HISTORIAL_JUGADOR)
export const PlayerRecordsModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState('players');
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [isUploadHistoryOpen, setIsUploadHistoryOpen] = useState(false);
  const [uploadHistory, setUploadHistory] = useState<any[]>([]);
  const [historyFilter, setHistoryFilter] = useState('ALL');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const players = [
    {
      rut: "12345678-9", primer_nombre: "Carlos", segundo_nombre: "Alberto", 
      primer_apellido: "Rodríguez", segundo_apellido: "Silva", email: "carlos.rodriguez@email.cl",
      fecha_nacimiento: "1995-03-15", pierna_habil: "Derecha", peso: 75, estatura: 180,
      imc: 23.1, talla_camiseta: "M", talla_short: "M", talla_botin: 42,
      condiciones_cronicas: "Ninguna", activo: true
    },
    {
      rut: "98765432-1", primer_nombre: "María", segundo_nombre: "Fernanda",
      primer_apellido: "González", segundo_apellido: "López", email: "maria.gonzalez@email.cl", 
      fecha_nacimiento: "1997-07-22", pierna_habil: "Izquierda", peso: 62, estatura: 165,
      imc: 22.8, talla_camiseta: "S", talla_short: "S", talla_botin: 38,
      condiciones_cronicas: "Asma leve", activo: true
    }
  ];

  const injuries = [
    {
      id: 1, rut_jugador: "12345678-9", jugador_nombre: "Carlos Rodríguez",
      tipo_lesion: "Esguince de tobillo", descripcion: "Lesión durante entrenamiento",
      fecha_lesion: "2024-08-15", semanas_recuperacion: 3, activo: true
    },
    {
      id: 2, rut_jugador: "98765432-1", jugador_nombre: "María González", 
      tipo_lesion: "Desgarro muscular", descripcion: "Lesión en cuádriceps derecho",
      fecha_lesion: "2024-07-10", semanas_recuperacion: 6, activo: false
    }
  ];

  const playerHistory = [
    { fecha: "2024-09-15", rut_jugador: "12345678-9", accion: "Actualización médica", detalle: "Evaluación física anual" },
    { fecha: "2024-09-10", rut_jugador: "98765432-1", accion: "Recuperación lesión", detalle: "Alta médica por desgarro muscular" }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      alert('Por favor seleccione un archivo Excel (.xlsx o .xls)');
      return;
    }

    // Simulate Excel processing with mock data
    const mockUploadResults = [
      {
        id: Date.now() + 1,
        rut: "11111111-1",
        nombre: "Pedro Morales García",
        email: "pedro.morales@email.cl",
        status: "success",
        fecha: new Date().toLocaleString(),
        error: null
      },
      {
        id: Date.now() + 2,
        rut: "22222222-2", 
        nombre: "Ana Sofía López",
        email: "ana.lopez@email.cl",
        status: "success",
        fecha: new Date().toLocaleString(),
        error: null
      },
      {
        id: Date.now() + 3,
        rut: "12345678-9",
        nombre: "Carlos Rodríguez Silva",
        email: "carlos.rodriguez@email.cl", 
        status: "error",
        fecha: new Date().toLocaleString(),
        error: "El jugador ya existe en la base de datos"
      },
      {
        id: Date.now() + 4,
        rut: "33333333-3",
        nombre: "Luis Fernando Torres",
        email: "",
        status: "error", 
        fecha: new Date().toLocaleString(),
        error: "Email requerido"
      },
      {
        id: Date.now() + 5,
        rut: "44444444-4",
        nombre: "Isabella Martínez Cruz",
        email: "isabella.martinez@email.cl",
        status: "success",
        fecha: new Date().toLocaleString(),
        error: null
      }
    ];

    // Add results to upload history
    setUploadHistory(prev => [...mockUploadResults, ...prev]);
    
    // Show history modal
    setIsUploadHistoryOpen(true);
    
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const filteredHistory = uploadHistory.filter(item => {
    if (historyFilter === 'ALL') return true;
    if (historyFilter === 'SUCCESS') return item.status === 'success';
    if (historyFilter === 'ERROR') return item.status === 'error';
    return true;
  });

  const successCount = uploadHistory.filter(item => item.status === 'success').length;
  const errorCount = uploadHistory.filter(item => item.status === 'error').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2>Gestión de Jugadores y Registros Médicos</h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            onClick={openFileDialog}
            style={{ borderColor: '#0000db', color: '#0000db' }}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Excel
          </Button>
          {uploadHistory.length > 0 && (
            <Button 
              variant="outline"
              onClick={() => setIsUploadHistoryOpen(true)}
              style={{ borderColor: '#FF8C00', color: '#FF8C00' }}
            >
              <History className="w-4 h-4 mr-2" />
              Historial ({uploadHistory.length})
            </Button>
          )}
          <Button style={{ backgroundColor: '#0000db' }} className="text-white">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Jugador
          </Button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />

      {/* Upload History Modal */}
      <Dialog open={isUploadHistoryOpen} onOpenChange={setIsUploadHistoryOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Historial de Cargas Excel</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden flex flex-col space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Procesados</p>
                      <p className="text-2xl font-bold text-[#0000db]">{uploadHistory.length}</p>
                    </div>
                    <FileText className="w-8 h-8 text-[#0000db]" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Exitosos</p>
                      <p className="text-2xl font-bold text-green-600">{successCount}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Con Errores</p>
                      <p className="text-2xl font-bold text-red-600">{errorCount}</p>
                    </div>
                    <AlertCircle className="w-8 h-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filter Controls */}
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">Filtrar por estado:</label>
                <Select value={historyFilter} onValueChange={setHistoryFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos</SelectItem>
                    <SelectItem value="SUCCESS">Solo exitosos</SelectItem>
                    <SelectItem value="ERROR">Solo errores</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setUploadHistory([])}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Limpiar Historial
              </Button>
            </div>

            {/* History Table */}
            <div className="flex-1 overflow-auto border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha/Hora</TableHead>
                    <TableHead>RUT</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Observaciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        {uploadHistory.length === 0 ? 
                          "No hay registros en el historial" : 
                          "No hay registros que coincidan con el filtro seleccionado"
                        }
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredHistory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-sm">{item.fecha}</TableCell>
                        <TableCell className="font-medium">{item.rut}</TableCell>
                        <TableCell>{item.nombre}</TableCell>
                        <TableCell>{item.email || '-'}</TableCell>
                        <TableCell>
                          {item.status === 'success' ? (
                            <Badge className="bg-green-500 text-white">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Exitoso
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <X className="w-3 h-3 mr-1" />
                              Error
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {item.error ? (
                            <span className="text-red-600 text-sm">{item.error}</span>
                          ) : (
                            <span className="text-green-600 text-sm">Jugador registrado correctamente</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <Button 
              onClick={() => setIsUploadHistoryOpen(false)}
              style={{ backgroundColor: '#0000db' }}
              className="text-white"
            >
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="players">Jugadores (JUGADOR)</TabsTrigger>
          <TabsTrigger value="injuries">Lesiones (LESION)</TabsTrigger>
          <TabsTrigger value="records">Fichas (FICHA_JUGADOR)</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="players" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Jugadores Registrados</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>RUT</TableHead>
                    <TableHead>Nombre Completo</TableHead>
                    <TableHead>Fecha Nac.</TableHead>
                    <TableHead>Pierna Hábil</TableHead>
                    <TableHead>Físico (Peso/Altura)</TableHead>
                    <TableHead>Condiciones</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {players.map((player) => (
                    <TableRow key={player.rut}>
                      <TableCell className="font-medium">{player.rut}</TableCell>
                      <TableCell>
                        {player.primer_nombre} {player.segundo_nombre} {player.primer_apellido} {player.segundo_apellido}
                      </TableCell>
                      <TableCell>{player.fecha_nacimiento}</TableCell>
                      <TableCell>{player.pierna_habil}</TableCell>
                      <TableCell>{player.peso}kg / {player.estatura}cm</TableCell>
                      <TableCell>
                        <Badge variant={player.condiciones_cronicas === "Ninguna" ? "outline" : "destructive"}>
                          {player.condiciones_cronicas}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={player.activo ? 'bg-green-500' : 'bg-red-500'}>
                          {player.activo ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="injuries" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Gestión de Lesiones</CardTitle>
                <Button style={{ backgroundColor: '#0000db' }} className="text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Registrar Lesión
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Jugador</TableHead>
                    <TableHead>Tipo de Lesión</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Fecha Lesión</TableHead>
                    <TableHead>Recuperación (Semanas)</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {injuries.map((injury) => (
                    <TableRow key={injury.id}>
                      <TableCell className="font-medium">{injury.jugador_nombre}</TableCell>
                      <TableCell>{injury.tipo_lesion}</TableCell>
                      <TableCell className="max-w-xs truncate">{injury.descripcion}</TableCell>
                      <TableCell>{injury.fecha_lesion}</TableCell>
                      <TableCell>{injury.semanas_recuperacion}</TableCell>
                      <TableCell>
                        <Badge className={injury.activo ? 'bg-red-500' : 'bg-green-500'}>
                          {injury.activo ? 'En Recuperación' : 'Recuperado'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          {injury.activo && (
                            <Button variant="outline" size="sm">
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="records" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fichas de Jugadores por Club/Serie</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar Club" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">FC Barcelona Santiago</SelectItem>
                      <SelectItem value="2">Real Madrid Chile</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar Serie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Serie A Masculina</SelectItem>
                      <SelectItem value="2">Serie Juvenil</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button style={{ backgroundColor: '#0000db' }} className="text-white">
                    <Search className="w-4 h-4 mr-2" />
                    Buscar Fichas
                  </Button>
                </div>
                
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Seleccione un club y serie para ver las fichas de jugadores</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Jugadores</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>RUT Jugador</TableHead>
                    <TableHead>Acción</TableHead>
                    <TableHead>Detalle</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {playerHistory.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell>{item.fecha}</TableCell>
                      <TableCell>{item.rut_jugador}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.accion}</Badge>
                      </TableCell>
                      <TableCell>{item.detalle}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

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