import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { DialogHandle } from "../components/dialog-component.tsx";
import { Input } from "../components/ui/input";
import { Plus, Edit, Eye, Shield, Trash2, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { getUsers, deleteUser } from "../services/usuarioService.ts";
import { getRoles, deleteRole } from "../services/rolService.ts";
import { AlertDialogHandle } from "../components/alert-dialog-component.tsx";
import { type ClubType, type RolType, type UsuarioType } from "../types.tsx";
import { getClubs } from "../services/clubServices.ts";
import { UserForm } from "../forms/userForm.tsx";
import { RoleForm } from "../forms/rolForm.tsx";


export const UserRoleModule: React.FC = () => {
    const [activeTab, setActiveTab] = useState("users");
    const [users, setUsers] = useState<UsuarioType[]>([]);
    const [roles, setRoles] = useState<RolType[]>([]);
    const [clubs, setClubs] = useState<ClubType[]>([]);
    const [openSelected, setOpenSelected] = useState<number | null>(null)
    const [isFetchingUsers, setIsFetchingUsers] = useState(false)
    const [isFetchingRols, setIsFetchingRols] = useState(false)
    const [isFetchingClubs, setIsFetchingClubs] = useState(false)
    const [userFilter, setUserFilter] = useState("");
    const [rolFilter, setRolFilter] = useState("");
    const [rolStatusFilter, setRolStatusFilter] = useState<string>("todos");
    const [userClubFilter, setUserClubFilter] = useState<number | undefined>(undefined);
    const [userStatusFilter, setUserStatusFilter] = useState<string | undefined>(undefined);

    const handleUserDelete = async (rut_usuario: string) => {
        try {
            const response = await deleteUser(rut_usuario);
            console.log(response)
            toast.success(response.detail)
            setOpenSelected(null)
            fetchUsers();
        } catch (error) {
            toast.error(String(error))
        }

    }

    const handleRoleDelete = async (id_role: number) => {
        try {
            const response = await deleteRole(id_role);
            console.log(response)
            toast.success(response.detail)
            setOpenSelected(null)
            fetchRoles();
        } catch (error) {
            toast.error(String(error))
        }

    }

    const fetchUsers = async () => {
        let data: UsuarioType[] = [];
        try {
            setIsFetchingUsers(true)
            data = await getUsers();
            setUsers(data);
            if (data.length === 0) {
                toast.info("No hay usuarios registrados en la base de datos.")
            }
        } catch (err: any) {
            toast.error(String(err))
        } finally {
            if (data.length === 0) {
                setUsers([]);
            }
            setIsFetchingUsers(false)
        }
    };

    const fetchRoles = async () => {
        let data: RolType[] = []
        try {
            setIsFetchingRols(true)
            data = await getRoles();
            setRoles(data);
            if (data.length === 0) {
                toast.info("No hay roles registrados en la base de datos.")
            }
        } catch (err: any) {
            toast.warning(String(error))
        } finally {
            if (data.length === 0) {
                setRoles([]);
            }
            setIsFetchingRols(false)
        }
    };

    const fetchClubs = async () => {
        let data: ClubType[] = []
        try {
            setIsFetchingClubs(true)
            data = await getClubs()
            setClubs(data)
            if (data.length === 0) {
                toast.info("No hay clubes registrados en la base de datos.")
            }
        } catch (err: any) {
            toast.warning(String(error))
        } finally {
            if (data.length === 0) {
                setClubs([]);
            }
            setIsFetchingClubs(false)
        }
    }

    useEffect(() => {
        const fetchAll = async () => {
            await fetchUsers();
            await fetchRoles();
            await fetchClubs();
        };
        fetchAll();
    }, []);
    useEffect(() => { if (activeTab === "roles") fetchRoles(); if (activeTab === "users") fetchUsers() }, [activeTab]);

    const filteredUsers = users.filter((u) => {
        const query = userFilter.toLowerCase();
        const matchesQuery =
            u.nombre_usuario.toLowerCase().includes(query) ||
            u.apellido_usuario.toLowerCase().includes(query) ||
            u.email_usuario.toLowerCase().includes(query) ||
            u.rut_usuario.toLowerCase().includes(query);

        const matchesStatus =
            !userStatusFilter || userStatusFilter === "todos" ||
            (userStatusFilter === "activo" && u.usuario_activo) ||
            (userStatusFilter === "inactivo" && !u.usuario_activo);

        const matchesClub =
            !userClubFilter || userClubFilter === undefined || u.id_club === userClubFilter;

        return matchesQuery && matchesStatus && matchesClub;
    });


    const filteredRols = roles.filter((r) => {
        const query = rolFilter.toLowerCase();
        const matchesQuery =
            r.nombre_rol.toLowerCase().includes(query)
        const matchesStatus =
            rolStatusFilter === "todos" ||
            (rolStatusFilter === "activo" && r.rol_activo) ||
            (rolStatusFilter === "inactivo" && !r.rol_activo);
        return matchesQuery && matchesStatus;
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2>Gestión de Usuarios y Roles</h2>
                <div className="flex space-x-2">
                    {(activeTab === "users" || activeTab === "roles") && (
                        <>
                            {activeTab === "users" && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={fetchUsers}
                                    disabled={isFetchingUsers}
                                    className="flex-1"
                                >
                                    <RefreshCcw className="w-4 h-4 mr-1" />
                                    {isFetchingUsers ? "Recargando..." : "Recargar"}
                                </Button>
                            )}
                            {activeTab === "roles" && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={fetchRoles}
                                    disabled={isFetchingRols}
                                    className="flex-1"
                                >
                                    <RefreshCcw className="w-4 h-4 mr-1" />
                                    {isFetchingRols ? "Recargando..." : "Recargar"}
                                </Button>
                            )}
                        </>
                    )}

                    {/* User Dialog */}
                    {activeTab === "users" && (
                        <DialogHandle<any>
                            title="Registrar Nuevo Usuario"
                            trigger={
                                <Button style={{ backgroundColor: "#0000db" }} className="text-white">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Nuevo Usuario
                                </Button>
                            }
                        >
                            {(close) => (
                                <UserForm
                                    isEdit={false}
                                    refreshUsers={fetchUsers}
                                    onSuccess={close}
                                    roles={roles}
                                    refreshRoles={fetchRoles}
                                    clubs={clubs}
                                />
                            )}
                        </DialogHandle>
                    )}

                    {/* Role Dialog */}
                    {activeTab === "roles" && (
                        <DialogHandle<any>
                            title="Registrar Nuevo Rol"
                            trigger={
                                <Button style={{ backgroundColor: "#0000db" }} className="text-white">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Nuevo Rol
                                </Button>
                            }
                        >
                            {(close) => (
                                <RoleForm
                                    isEdit={false}
                                    refreshRoles={fetchRoles}
                                    onSuccess={close}
                                />
                            )}
                        </DialogHandle>
                    )}
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="users">Usuarios</TabsTrigger>
                    <TabsTrigger value="roles">Roles</TabsTrigger>
                    <TabsTrigger value="history">Historial</TabsTrigger>
                </TabsList>

                {/* Users Tab */}
                <TabsContent value="users">
                    <Card>
                        <CardHeader><CardTitle>Usuarios del Sistema</CardTitle></CardHeader>
                        <CardContent>
                            <div className="flex justify-between mb-4">
                                {/* Search input on the left */}
                                <Input
                                    placeholder="Buscar por nombre, apellido, email o RUT..."
                                    value={userFilter}
                                    onChange={(e) => setUserFilter(e.target.value)}
                                    className="w-1/3"
                                />

                                {/* Filters on the right */}
                                <div className="flex space-x-4">
                                    <div className="flex flex-col">
                                        <Select
                                            value={userClubFilter !== undefined ? userClubFilter.toString() : ""}
                                            onValueChange={(value: string) =>
                                                setUserClubFilter(value === "all" ? undefined : Number(value))
                                            }
                                        >
                                            <SelectTrigger className="w-48">
                                                <SelectValue placeholder="Seleccionar club" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {/* Option to show all clubs */}
                                                <SelectItem value="all">Todos</SelectItem>
                                                {clubs.map((club) => (
                                                    <SelectItem key={club.id_club} value={club.id_club.toString()}>
                                                        {club.nombre_club}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex flex-col">
                                        <Select
                                            value={userStatusFilter ?? ""}
                                            onValueChange={(value: string) => setUserStatusFilter(value || undefined)}
                                        >
                                            <SelectTrigger className="w-48">
                                                <SelectValue placeholder="Seleccionar estado" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="todos">Todos</SelectItem>
                                                <SelectItem value="activo">Activo</SelectItem>
                                                <SelectItem value="inactivo">Inactivo</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>RUT</TableHead>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Rol</TableHead>
                                        <TableHead>Club</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.map((user) => (
                                        <TableRow key={user.rut_usuario}>
                                            <TableCell>{user.rut_usuario}</TableCell>
                                            <TableCell>{user.nombre_usuario} {user.apellido_usuario}</TableCell>
                                            <TableCell>{user.email_usuario}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {roles.find(r => r.id_rol === user.id_rol)?.nombre_rol || "N/A"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {clubs.find(c => c.id_club === user.id_club)?.nombre_club || "N/A"}
                                            </TableCell>

                                            <TableCell>
                                                <Badge className={user.usuario_activo ? "bg-green-500" : "bg-red-500"}>
                                                    {user.usuario_activo ? "Activo" : "Inactivo"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex space-x-2">
                                                    <DialogHandle<UsuarioType>
                                                        title={`Editar usuario ${user.nombre_usuario}`}
                                                        trigger={<Button variant="outline" size="sm"><Edit className="w-4 h-4" /></Button>}
                                                        initialData={user}
                                                    >
                                                        {(close, initialData) => (
                                                            <UserForm
                                                                isEdit={true}
                                                                user={initialData}
                                                                refreshUsers={fetchUsers}
                                                                onSuccess={close}
                                                                roles={roles}
                                                                refreshRoles={fetchRoles}
                                                                clubs={clubs}
                                                            />
                                                        )}
                                                    </DialogHandle>
                                                    <Button variant="outline" size="sm"><Eye className="w-4 h-4" /></Button>
                                                    <Button onClick={() => setOpenSelected(user.rut_usuario)} variant="destructive" size="sm">
                                                        <Trash2 className="w-4 h-4 mr-1" />
                                                    </Button>
                                                    <AlertDialogHandle
                                                        title={`Eliminacion de usuario ${user.nombre_usuario}`}
                                                        description={`¿Estas seguro de querer eliminar al club ${user.nombre_usuario}`}
                                                        confirmLabel='Eliminar'
                                                        cancelLabel='Cancelar'
                                                        onConfirm={() => handleUserDelete(user.rut_usuario)}
                                                        open={openSelected === user.rut_usuario}
                                                        onOpenChange={(Open) => {
                                                            if (!Open) setOpenSelected(null); // cerrar el dialog
                                                        }}
                                                    >
                                                    </AlertDialogHandle>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Roles Tab */}
                <TabsContent value="roles">
                    <Card>
                        <CardHeader>
                            <CardTitle>Roles del Sistema</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between mb-4 space-x-2">
                                <Input
                                    placeholder="Buscar por nombre"
                                    value={rolFilter}
                                    onChange={(e) => setRolFilter(e.target.value)}
                                    className="w-1/3"
                                />
                                <Select value={rolStatusFilter} onValueChange={(value: string) => setRolStatusFilter(value)}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Seleccionar estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="todos">Todos</SelectItem>
                                        <SelectItem value="activo">Activo</SelectItem>
                                        <SelectItem value="inactivo">Inactivo</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {filteredRols.map((role) => (
                                    <Card key={role.id_rol} className="border">
                                        <CardHeader className="flex justify-between items-center">
                                            <CardTitle>{role.nombre_rol}</CardTitle>
                                            <Badge className={role.rol_activo ? "bg-green-500" : "bg-gray-500"}>
                                                {role.rol_activo ? "Activo" : "Inactivo"}
                                            </Badge>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-gray-600 mb-4">{role.desc_rol}</p>
                                            <div className="flex flex-wrap gap-2">
                                                <DialogHandle<RolType>
                                                    title={`Editar rol ${role.nombre_rol}`}
                                                    trigger={<Button variant="outline" size="sm"><Edit className="w-4 h-4 mr-1" /> Editar</Button>}
                                                    initialData={role}
                                                >
                                                    {(close, initialData) => (
                                                        <RoleForm
                                                            isEdit={true}
                                                            role={initialData}
                                                            refreshRoles={fetchRoles}
                                                            onSuccess={close}
                                                        />
                                                    )}
                                                </DialogHandle>

                                                <Button variant="outline" size="sm">
                                                    <Shield className="w-4 h-4 mr-1" /> Permisos
                                                </Button>
                                                <Button onClick={() => setOpenSelected(role.id_rol)} variant="destructive" size="sm">
                                                    <Trash2 className="w-4 h-4 mr-1" /> Eliminar
                                                </Button>
                                                <AlertDialogHandle
                                                    title={`Eliminacion de rol ${role.nombre_rol}`}
                                                    description={`¿Estas seguro de querer eliminar al usuario ${role.nombre_rol}?`}
                                                    confirmLabel="Eliminar"
                                                    cancelLabel="Cancelar"
                                                    onConfirm={() => handleRoleDelete(role.id_rol)}
                                                    open={openSelected === role.id_rol}
                                                    onOpenChange={(Open) => {
                                                        if (!Open) setOpenSelected(null); // cerrar el dialog
                                                    }}
                                                >
                                                </AlertDialogHandle>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* History Tab */}
                <TabsContent value="history">
                    <Card>
                        <CardHeader><CardTitle>Historial de Usuarios</CardTitle></CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>Acción</TableHead>
                                        <TableHead>Usuario</TableHead>
                                        <TableHead>Detalle</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>2025-10-01</TableCell>
                                        <TableCell><Badge variant="outline">Creación</Badge></TableCell>
                                        <TableCell>Juan Perez</TableCell>
                                        <TableCell>Usuario creado</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};
