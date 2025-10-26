import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card.tsx";
import { Button } from "../components/ui/button.tsx";
import { Badge } from "../components/ui/badge.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs.tsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table.tsx";
import { Label } from '../components/ui/label.tsx';
import { DialogHandle } from "../components/dialog-component.tsx";
import { Input } from "../components/ui/input.tsx";
import { Plus, Edit, Eye, Shield, Trash2, RefreshCcw, Pen } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select.tsx';
import { getUsers, deleteUser } from "../services/usuarioService.ts";
import { getRoles, deleteRole } from "../services/rolService.ts";
import { AlertDialogHandle } from "../components/alert-dialog-component.tsx";
import { type ClubType, type RolType, type UsuarioType } from "../types.tsx";
import { getClubs } from "../services/clubServices.ts";
import { UserForm } from "../forms/userForm.tsx";
import { RoleForm } from "../forms/rolForm.tsx";
import { useAuth } from "../contexts/authContext.tsx";
import { NavLink, useLocation, useNavigate, useParams } from 'react-router';

export const UsuarioRolModule: React.FC = () => {
    // Manejo de estados
    const [activeTab, setActiveTab] = useState("usuarios");
    const [users, setUsers] = useState<UsuarioType[]>([]);
    const [roles, setRoles] = useState<RolType[]>([]);
    const [clubs, setClubs] = useState<ClubType[]>([]);
    const [openSelected, setOpenSelected] = useState<string | number | null>(null);
    const [selectedUsuario, setSelectedUsuario] = useState<UsuarioType | null>(null);
    const [selectedRol, setSelectedRol] = useState<RolType | null>(null);

    // Loading states
    const [isFetchingUsers, setIsFetchingUsers] = useState(false);
    const [isFetchingRols, setIsFetchingRols] = useState(false);
    const [isFetchingClubs, setIsFetchingClubs] = useState(false);

    // Filter states
    const [userFilter, setUserFilter] = useState("");
    const [rolFilter, setRolFilter] = useState("");
    const [rolStatusFilter, setRolStatusFilter] = useState<string>("todos");
    const [userClubFilter, setUserClubFilter] = useState<number | undefined>(undefined);
    const [userStatusFilter, setUserStatusFilter] = useState<string | undefined>(undefined);

    const { token } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams<{ id?: string }>();

    // Deteccion de rutas de edicion
    const isUserEditRoute = /\/dashboard\/usuarios-roles\/usuarios\/[^/]+\/edit$/.test(location.pathname);
    const isRoleEditRoute = /\/dashboard\/usuarios-roles\/roles\/[^/]+\/edit$/.test(location.pathname);

    // Deteccion de rutas de creacion
    const isUserNewRoute = /\/dashboard\/usuarios-roles\/usuarios\/new/.test(location.pathname);
    const isRoleNewRoute = /\/dashboard\/usuarios-roles\/roles\/new/.test(location.pathname);

    // Deteccion de rutas de ver detalle
    const isUserViewRoute = /\/dashboard\/usuarios-roles\/usuarios\/[^/]+\/view$/.test(location.pathname);


    // Fetch functions
    const fetchUsers = async () => {
        let data: UsuarioType[] = [];
        try {
            setIsFetchingUsers(true);
            data = await getUsers(token);
            setUsers(data);
            if (data.length === 0) {
                toast.info("No hay usuarios registrados en la base de datos.");
            }
        } catch (err: any) {
            toast.error(String(err));
        } finally {
            if (data.length === 0) setUsers([]);
            setIsFetchingUsers(false);
        }
    };

    const fetchRoles = async () => {
        let data: RolType[] = [];
        try {
            setIsFetchingRols(true);
            data = await getRoles(token);
            setRoles(data);
            if (data.length === 0) toast.info("No hay roles registrados en la base de datos.");
        } catch (err: any) {
            toast.warning(String(err));
        } finally {
            if (data.length === 0) setRoles([]);
            setIsFetchingRols(false);
        }
    };

    const fetchClubs = async () => {
        let data: ClubType[] = [];
        try {
            setIsFetchingClubs(true);
            data = await getClubs(1, 30, undefined, undefined, token);
            setClubs(data);
            if (data.length === 0) toast.info("No hay clubes registrados en la base de datos.");
        } catch (err: any) {
            toast.warning(String(err));
        } finally {
            if (data.length === 0) setClubs([]);
            setIsFetchingClubs(false);
        }
    };

    // Delete handlers
    const handleUserDelete = async (rut_usuario: string) => {
        try {
            const response = await deleteUser(rut_usuario, token);
            toast.success(response.detail);
            setOpenSelected(null);
            fetchUsers();
        } catch (error) {
            toast.error(String(error));
        }
    };

    const handleRoleDelete = async (id_role: number) => {
        try {
            const response = await deleteRole(id_role, token);
            toast.success(response.detail);
            setOpenSelected(null);
            fetchRoles();
        } catch (error) {
            toast.error(String(error));
        }
    };

    // Fetch inicial
    useEffect(() => {
        const fetchAll = async () => {
            await Promise.all([fetchUsers(), fetchRoles(), fetchClubs()]);
        };
        fetchAll();
    }, []);

    // Cambio de tab basado en la ruta
    useEffect(() => {
        const path = location.pathname;

        if (path === "/dashboard/usuarios-roles" || path === "/dashboard/usuarios-roles/") {
            navigate("/dashboard/usuarios-roles/usuarios", { replace: true });
        } else if (path.includes("usuarios-roles/usuarios")) {
            setActiveTab("usuarios");
        } else if (path.includes("usuarios-roles/roles")) {
            setActiveTab("roles");
        } else if (path.includes("usuarios-roles/historial")) {
            setActiveTab("historial");
        }
    }, [location.pathname, navigate]);

    // Refetch data cuando se cambia de tab
    useEffect(() => {
        if (activeTab === "roles") fetchRoles();
        if (activeTab === "usuarios") fetchUsers();
    }, [activeTab]);

    // Resuelve usuario seleccionado desde la ruta
    useEffect(() => {
        if (!isUserEditRoute && !isUserViewRoute) {
            setSelectedUsuario(null);
            return;
        }

        if (!params.id) {
            setSelectedUsuario(null);
            return;
        }

        if (users.length === 0) {
            if (!isFetchingUsers) fetchUsers();
            return;
        }

        const found = users.find(u => u.rut_usuario === params.id);

        if (found) {
            setSelectedUsuario(found);
        } else if (!isFetchingUsers) {
            toast.warning("El usuario solicitado no existe.");
            navigate("/dashboard/usuarios-roles/usuarios");
        }
    }, [params.id, users, isFetchingUsers, navigate, isUserEditRoute, isUserViewRoute]);

    // Resuelve rol seleccionado desde la ruta
    useEffect(() => {
        if (!isRoleEditRoute) {
            setSelectedRol(null);
            return;
        }

        if (!params.id) {
            setSelectedRol(null);
            return;
        }

        if (roles.length === 0) {
            if (!isFetchingRols) fetchRoles();
            return;
        }

        const idNumber = Number(params.id);

        if (!Number.isNaN(idNumber)) {
            const found = roles.find(r => r.id_rol === idNumber);

            if (found) {
                setSelectedRol(found);
            } else if (!isFetchingRols) {
                toast.warning("El rol solicitado no existe.");
                navigate("/dashboard/usuarios-roles/roles");
            }
        }
    }, [params.id, roles, isFetchingRols, navigate, isRoleEditRoute]);

    // Data filtrada
    const filteredUsers = users.filter((u) => {
        const query = userFilter.toLowerCase().trim();

        const fullName = `${u.nombre_usuario} ${u.apellido_usuario}`.toLowerCase();

        const matchesQuery =
            fullName.includes(query) ||
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
        const matchesQuery = r.nombre_rol.toLowerCase().includes(query);
        const matchesStatus =
            rolStatusFilter === "todos" ||
            (rolStatusFilter === "activo" && r.rol_activo) ||
            (rolStatusFilter === "inactivo" && !r.rol_activo);
        return matchesQuery && matchesStatus;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2>Gestión de Usuarios y Roles</h2>
                <div className="flex space-x-2">
                    {/* Refresh */}
                    {activeTab === "usuarios" && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={fetchUsers}
                            disabled={isFetchingUsers}
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
                        >
                            <RefreshCcw className="w-4 h-4 mr-1" />
                            {isFetchingRols ? "Recargando..." : "Recargar"}
                        </Button>
                    )}

                    {/* Botones de crear nuevo*/}
                    {activeTab === "usuarios" && (
                        <NavLink to="/dashboard/usuarios-roles/usuarios/new">
                            <Button style={{ backgroundColor: "#0000db" }} className="text-white">
                                <Plus className="w-4 h-4 mr-2" />
                                Nuevo Usuario
                            </Button>
                        </NavLink>
                    )}

                    {activeTab === "roles" && (
                        <NavLink to="/dashboard/usuarios-roles/roles/new">
                            <Button style={{ backgroundColor: "#0000db" }} className="text-white">
                                <Plus className="w-4 h-4 mr-2" />
                                Nuevo rol
                            </Button>
                        </NavLink>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="usuarios" onClick={() => navigate("/dashboard/usuarios-roles/usuarios")}>
                        Usuarios
                    </TabsTrigger>
                    <TabsTrigger value="roles" onClick={() => navigate("/dashboard/usuarios-roles/roles")}>
                        Roles
                    </TabsTrigger>
                    <TabsTrigger value="historial" onClick={() => navigate("/dashboard/usuarios-roles/historial")}>
                        Historial
                    </TabsTrigger>
                </TabsList>

                {/* Tab Usuarios*/}
                <TabsContent value="usuarios">
                    <Card>
                        <CardHeader>
                            <CardTitle>Usuarios del Sistema</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* Filters */}
                            <div className="flex justify-between mb-4">
                                <Input
                                    placeholder="Buscar por nombre, apellido, email o RUT..."
                                    value={userFilter}
                                    onChange={(e) => setUserFilter(e.target.value)}
                                    className="w-1/3"
                                />

                                <div className="flex space-x-4">
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
                                            <SelectItem value="all">Todos</SelectItem>
                                            {clubs?.items?.map((club) => (
                                                <SelectItem key={club.id_club} value={club.id_club.toString()}>
                                                    {club.nombre_club}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

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

                            {/* Users Table */}
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
                                                {clubs?.items?.find(c => c.id_club === user.id_club)?.nombre_club || "N/A"}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={user.usuario_activo ? "bg-green-500" : "bg-red-500"}>
                                                    {user.usuario_activo ? "Activo" : "Inactivo"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex space-x-2">
                                                    <NavLink to={`/dashboard/usuarios-roles/usuarios/${user.rut_usuario}/edit`}>
                                                        <Button variant="outline" size="sm">
                                                            <Pen className="w-4 h-4" />
                                                        </Button>
                                                    </NavLink>
                                                    <NavLink to={`/dashboard/usuarios-roles/usuarios/${user.rut_usuario}/view`}>
                                                        <Button variant="outline" size="sm">
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                    </NavLink>
                                                    <Button
                                                        onClick={() => setOpenSelected(user.rut_usuario)}
                                                        variant="destructive"
                                                        size="sm"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                    <AlertDialogHandle
                                                        title={`Eliminación de usuario ${user.nombre_usuario}`}
                                                        description={`¿Estás seguro de querer eliminar al usuario ${user.nombre_usuario}?`}
                                                        confirmLabel='Eliminar'
                                                        cancelLabel='Cancelar'
                                                        onConfirm={() => handleUserDelete(user.rut_usuario)}
                                                        open={openSelected === user.rut_usuario}
                                                        onOpenChange={(open) => {
                                                            if (!open) setOpenSelected(null);
                                                        }}
                                                    />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab Roles */}
                <TabsContent value="roles">
                    <Card>
                        <CardHeader>
                            <CardTitle>Roles del Sistema</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* Filtros */}
                            <div className="flex justify-between mb-4 space-x-2">
                                <Input
                                    placeholder="Buscar por nombre"
                                    value={rolFilter}
                                    onChange={(e) => setRolFilter(e.target.value)}
                                    className="w-1/3"
                                />
                                <Select
                                    value={rolStatusFilter}
                                    onValueChange={(value: string) => setRolStatusFilter(value)}
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

                            {/* Roles Grid */}
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
                                                <NavLink to={`/dashboard/usuarios-roles/roles/${role.id_rol}/edit`}>
                                                    <Button variant="outline" size="sm">
                                                        <Edit className="w-4 h-4 mr-1" /> Editar
                                                    </Button>
                                                </NavLink>

                                                <Button variant="outline" size="sm">
                                                    <Shield className="w-4 h-4 mr-1" /> Permisos
                                                </Button>

                                                <Button
                                                    onClick={() => setOpenSelected(role.id_rol)}
                                                    variant="destructive"
                                                    size="sm"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-1" /> Eliminar
                                                </Button>

                                                <AlertDialogHandle
                                                    title={`Eliminación de rol ${role.nombre_rol}`}
                                                    description={`¿Estás seguro de querer eliminar el rol ${role.nombre_rol}?`}
                                                    confirmLabel="Eliminar"
                                                    cancelLabel="Cancelar"
                                                    onConfirm={() => handleRoleDelete(role.id_rol)}
                                                    open={openSelected === role.id_rol}
                                                    onOpenChange={(open) => {
                                                        if (!open) setOpenSelected(null);
                                                    }}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab Historial*/}
                <TabsContent value="historial">
                    <Card>
                        <CardHeader>
                            <CardTitle>Historial de Usuarios</CardTitle>
                        </CardHeader>
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
                                        <TableCell>
                                            <Badge variant="outline">Creación</Badge>
                                        </TableCell>
                                        <TableCell>Juan Perez</TableCell>
                                        <TableCell>Usuario creado</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Dialogos "Crear" - Route-driven */}
            {isUserNewRoute && (
                <DialogHandle<UsuarioType>
                    title="Registrar Nuevo Usuario"
                    trigger={<div />}
                    open={true}
                    onOpenChange={(open) => {
                        if (!open) navigate("/dashboard/usuarios-roles/usuarios");
                    }}
                    initialData={selectedUsuario ?? undefined}
                >
                    {() => {
                        return (
                            <UserForm
                                isEdit={false}
                                refreshUsers={fetchUsers}
                                onSuccess={() => navigate("/dashboard/usuarios-roles/usuarios")}
                                roles={roles}
                                refreshRoles={fetchRoles}
                                clubs={clubs}
                            />
                        );
                    }}
                </DialogHandle>
            )}

            {isRoleNewRoute && (
                <DialogHandle<RolType>
                    title="Registrar Nuevo Rol"
                    trigger={<div />}
                    open={true}
                    onOpenChange={(open) => {
                        if (!open) navigate("/dashboard/usuarios-roles/roles");
                    }}
                >
                    {() => {
                        return (
                            <RoleForm
                                isEdit={false}
                                refreshRoles={fetchRoles}
                                onSuccess={() => navigate("/dashboard/usuarios-roles/roles")}
                            />
                        );
                    }}
                </DialogHandle>
            )}


            {/* Dialogos "Editar" - Route-driven */}
            {isUserEditRoute && (
                <DialogHandle<UsuarioType>
                    title={selectedUsuario
                        ? `Modificar usuario ${selectedUsuario.nombre_usuario} ${selectedUsuario.apellido_usuario}`
                        : 'Modificar usuario'}
                    trigger={<div />}
                    open={true}
                    onOpenChange={(open) => {
                        if (!open) navigate("/dashboard/usuarios-roles/usuarios");
                    }}
                    initialData={selectedUsuario ?? undefined}
                >
                    {() => {
                        if (!selectedUsuario) {
                            return (
                                <div className="p-6 flex items-center justify-center">
                                    <span>Cargando detalles del usuario...</span>
                                </div>
                            );
                        }

                        return (
                            <UserForm
                                isEdit={true}
                                user={selectedUsuario}
                                refreshUsers={fetchUsers}
                                onSuccess={() => navigate("/dashboard/usuarios-roles/usuarios")}
                                roles={roles}
                                refreshRoles={fetchRoles}
                                clubs={clubs}
                            />
                        );
                    }}
                </DialogHandle>
            )}

            {isRoleEditRoute && (
                <DialogHandle<RolType>
                    title={selectedRol
                        ? `Modificar rol ${selectedRol.nombre_rol}`
                        : 'Modificar rol'}
                    trigger={<div />}
                    open={true}
                    onOpenChange={(open) => {
                        if (!open) navigate("/dashboard/usuarios-roles/roles");
                    }}
                    initialData={selectedRol ?? undefined}
                >
                    {() => {
                        if (!selectedRol) {
                            return (
                                <div className="p-6 flex items-center justify-center">
                                    <span>Cargando detalles del rol...</span>
                                </div>
                            );
                        }

                        return (
                            <RoleForm
                                isEdit={true}
                                role={selectedRol}
                                refreshRoles={fetchRoles}
                                onSuccess={() => navigate("/dashboard/usuarios-roles/roles")}
                            />
                        );
                    }}
                </DialogHandle>
            )}

            {/* Dialogos "ver detalles" - Route-driven */}
            {isUserViewRoute && (
                <DialogHandle<UsuarioType>
                    title={selectedUsuario ? `Detalles del club: ${selectedUsuario.nombre_usuario}` : 'Detalles del usuario'}
                    trigger={<div />}
                    open={true}
                    onOpenChange={(open) => {
                        if (!open) navigate("/dashboard/usuarios-roles/usuarios");
                    }}
                    initialData={selectedUsuario ?? undefined}
                    size='w-full'
                >
                    {() => {
                        if (!selectedUsuario) {
                            return (
                                <div className="p-6 flex items-center justify-center">
                                    <span>Cargando detalles del usuario...</span>
                                </div>
                            );
                        }

                        return <UsuarioDetailsContent usuario={selectedUsuario} />;
                    }}
                </DialogHandle>
            )}
        </div>
    );
};

export const UsuarioDetailsContent: React.FC<{ usuario: UsuarioType }> = ({ usuario }) => {
    const [clubs, setClubs] = useState<ClubType[]>([]);
    const [activeTab, setActiveTab] = useState("clubs");

    useEffect(() => {
        // assuming usuario.clubes is an array of clubs the user belongs to
        setClubs(usuario.clubes || []);
    }, [usuario]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <Label className="block mb-2">RUT</Label>
                    <Input value={usuario.rut_usuario} disabled />
                </div>
                <div>
                    <Label className="block mb-2">Nombre completo</Label>
                    <Input value={`${usuario.nombre_usuario} ${usuario.apellido_usuario}`} disabled />
                </div>
                <div>
                    <Label className="block mb-2">Correo electrónico</Label>
                    <Input value={usuario.email_usuario} disabled />
                </div>
                <div>
                    <Label className="block mb-2">Fecha nacimiento</Label>
                    <Input value={usuario.fecha_nacimiento} disabled />
                </div>
                <div>
                    <Label className="block mb-0">Estado</Label>
                    <Badge className={usuario.usuario_activo ? 'bg-green-500' : 'bg-gray-500'}>
                        {usuario.usuario_activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                </div>
            </div>
            {/* 
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="clubs">Clubs</TabsTrigger>
                    <TabsTrigger value="huellas">Huella</TabsTrigger>
                    <TabsTrigger value="roles">Roles</TabsTrigger>
                </TabsList>

                <TabsContent value="clubs" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Clubs asociados</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {clubs.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nombre Club</TableHead>
                                            <TableHead>Fecha asociación</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead>Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {clubs.map((club) => (
                                            <TableRow key={club.id_club}>
                                                <TableCell>{club.nombre_club}</TableCell>
                                                <TableCell>{club.fecha_asociacion}</TableCell>
                                                <TableCell>
                                                    <Badge className={club.club_activo ? 'bg-green-500' : 'bg-gray-500'}>
                                                        {club.club_activo ? 'Activo' : 'Inactivo'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>Este usuario no tiene clubs asociados.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="huellas" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Huella digital</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Badge className={usuario.huella_indice || usuario.huella_pulgar ? 'bg-green-500' : 'bg-red-500'}>
                                {usuario.huella_indice || usuario.huella_pulgar ? 'Registrada' : 'Sin registrar'}
                            </Badge>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="roles" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Rol del usuario</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Badge className='bg-blue-500'>{usuario.nombre_rol?.toUpperCase() || "N/A"}</Badge>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        */}
        </div>
    );
};
