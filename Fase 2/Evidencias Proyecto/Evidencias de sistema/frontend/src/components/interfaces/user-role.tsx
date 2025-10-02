import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import {
    Plus, Edit, Eye, Shield
} from 'lucide-react';

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