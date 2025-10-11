import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { DialogHandle } from "../dialog-component.tsx";
import { Input } from "../ui/input";
import { Plus, Edit, Eye, Shield, Trash2, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { getUsers, createUser, updateUser, deleteUser } from "../../services/usuarioService.ts";
import { getRoles, createRole, updateRole, deleteRole } from "../../services/rolService.ts";
import { AlertDialogHandle } from "../alert-dialog-component.tsx";
import { validarRut } from "../../utils/validacion_rut.tsx";
import { type ClubType, type RolType, type UsuarioType, type UsuarioFormType } from "../../types.tsx";
import { getClubs } from "../../services/clubServices.ts";


type UserFormProps = {
    user?: UsuarioType;
    isEdit: boolean;
    roles: RolType[];
    clubs: ClubType[];
    refreshRoles: () => Promise<void>;
    refreshUsers: () => Promise<void>;
    onSuccess: () => void;
};

export function UserForm({ user, isEdit, roles, clubs, refreshRoles, refreshUsers, onSuccess }: UserFormProps) {
    const [availableRoles, setAvailableRoles] = useState<RolType[]>([]);
    const [rutError, setRutError] = useState("");

    const [open, setOpen] = useState(false)
    const [form, setForm] = useState<UsuarioFormType>(
        user || {
            rut_usuario: "",
            email_usuario: "",
            nombre_usuario: "",
            apellido_usuario: "",
            fecha_nacimiento: "",
            usuario_activo: true,
            id_rol: 0,
            admin: false,
            id_club: undefined,
            pass_usuario: "",
        }
    );
    const [isLoading, setIsLoading] = useState(false);

    const ensureRoles = async () => {
        if (!roles || roles.length === 0) {
            const data = await refreshRoles();
            if (data) setAvailableRoles(data);
            else setAvailableRoles([]);
        } else {
            setAvailableRoles(roles);
        }
    };

    useEffect(() => {
        ensureRoles();
        if (isEdit && user) setForm(user);
    }, [user, isEdit, roles]);

    const handleAlert = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const form_html = e.currentTarget;

        if (!isEdit && !validarRut(form.rut_usuario)) {
            setRutError("RUT inválido");
            return;
        }

        if (form_html.reportValidity()) {
            setOpen(true) //disparamos el alert
        }

    }

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            if (isEdit) {
                await updateUser(form.rut_usuario, form);
                toast.success("Usuario modificado correctamente!");
            } else {
                await createUser(form);
                toast.success("Usuario registrado correctamente!");
            }
            await refreshUsers();
            onSuccess();
        } catch (error) {
            setOpen(false)
            toast.error(String(error));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form
            className="space-y-4"
            onSubmit={(e) => {
                e.preventDefault();
                handleAlert(e);
            }}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {!isEdit && (
                    <InputField
                        label="RUT *"
                        value={form.rut_usuario}
                        onChange={(val) => {
                            setForm({ ...form, rut_usuario: val });
                            console.log(form.rut_usuario)
                            if (val) setRutError("");
                        }}
                        onBlur={() => {
                            if (form.rut_usuario && !validarRut(form.rut_usuario)) {
                                setRutError("RUT inválido");
                            } else {
                                setRutError("");
                            }
                        }}
                        className={rutError ? "border-red-500" : ""}
                        required
                        pattern="^\d{7,8}-[0-9kK]$"
                        minLength={7}
                        title="Ingrese un RUT válido (ej: 12345678-9)"
                    />
                )}

                <InputField
                    label="Nombre *"
                    value={form.nombre_usuario}
                    onChange={(val) => setForm({ ...form, nombre_usuario: val })}
                    required
                    minLength={2}
                    maxLength={50}
                    title="Ingrese un nombre entre 2 y 50 caracteres"
                />

                <InputField
                    label="Apellido *"
                    value={form.apellido_usuario}
                    onChange={(val) => setForm({ ...form, apellido_usuario: val })}
                    required
                    minLength={2}
                    maxLength={50}
                    title="Ingrese un apellido entre 2 y 50 caracteres"
                />

                <InputField
                    label="Email *"
                    type="email"
                    value={form.email_usuario}
                    onChange={(val) => setForm({ ...form, email_usuario: val })}
                    required
                    title="Ingrese un correo electrónico válido"
                />

                <InputField
                    label="Fecha de Nacimiento *"
                    type="date"
                    value={form.fecha_nacimiento}
                    onChange={(val) => setForm({ ...form, fecha_nacimiento: val })}
                    required
                    max={new Date().toISOString().split("T")[0]}
                    min={new Date(new Date().setFullYear(new Date().getFullYear() - 80)).toISOString().split("T")[0]} // 80 años antes
                    title="Seleccione una fecha válida"
                />

                <InputField
                    label="Contraseña"
                    type="password"
                    value={form.pass_usuario}
                    onChange={(val) => setForm({ ...form, pass_usuario: val })}
                    required={!isEdit}
                    minLength={isEdit ? undefined : 8}
                    placeholder={isEdit ? "Dejar vacío para no cambiar" : undefined}
                    title={isEdit ? "Dejar vacío para no cambiar la contraseña" : "La contraseña debe tener al menos 8 caracteres"}
                />

                <div>
                    <label className="block text-sm font-medium mb-1">Rol *</label>
                    <select
                        value={form.id_rol || ""}
                        onChange={(e) => setForm({ ...form, id_rol: Number(e.target.value) })}
                        className="w-full border rounded p-2"
                        required
                    >
                        <option value="">Seleccione un rol</option>
                        {availableRoles.map((r) => (
                            <option key={r.id_rol} value={r.id_rol}>
                                {r.nombre_rol}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Club</label>
                    <select
                        value={form.id_club || ""}
                        onChange={(e) => setForm({ ...form, id_club: Number(e.target.value) })}
                        className="w-full border rounded p-2"
                    >
                        <option value="">Seleccione un club</option>
                        {clubs.map((club) => (
                            <option key={club.id_club} value={club.id_club}>
                                {club.nombre_club}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex space-x-4">
                {!isEdit && (
                    <label>
                        <input
                            type="checkbox"
                            checked={form.admin}
                            onChange={(e) => setForm({ ...form, admin: e.target.checked })}
                        />{" "}
                        Admin
                    </label>
                )}
                {isEdit && (
                    <label>
                        <input
                            type="checkbox"
                            checked={form.usuario_activo}
                            onChange={(e) => setForm({ ...form, usuario_activo: e.target.checked })}
                        />{" "}
                        Activo
                    </label>
                )}
            </div>

            <div className="flex justify-end space-x-2">
                <Button variant="outline" type="button" disabled={isLoading} onClick={onSuccess}>
                    Cancelar
                </Button>
                <Button type="submit" style={{ backgroundColor: "#0000db" }} className="text-white">
                    {!isLoading && !isEdit && <Plus className="w-4 h-4 mr-2" />}
                    {isLoading ? "Guardando..." : "Guardar"}
                </Button>
                <AlertDialogHandle
                    title={isEdit ? `Modificar usuario ${form.nombre_usuario}?` : `Registrar usuario ${form.nombre_usuario}?`}
                    description={isEdit ? "¿Desea guardar los cambios?" : "¿Desea registrar al usuario?"}
                    confirmLabel={isEdit ? "Modificar" : "Registrar"}
                    cancelLabel="Cancelar"
                    onConfirm={handleSubmit}
                    open={open}
                    onOpenChange={setOpen}
                >
                </AlertDialogHandle>
            </div>
        </form>
    );
}

type RoleFormProps = {
    role?: RolType;
    isEdit: boolean;
    refreshRoles: () => Promise<void>;
    onSuccess: () => void;
};

export function RoleForm({ role, isEdit, refreshRoles, onSuccess }: RoleFormProps) {
    const [open, setOpen] = useState(false)
    const [form, setForm] = useState<RolType>(
        role || {
            nombre_rol: "",
            desc_rol: "",
            rol_activo: true,
        }
    );
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isEdit && role) setForm(role);
    }, [role, isEdit]);

    const handleAlert = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const form = e.currentTarget;

        if (form.reportValidity()) {
            setOpen(true) //disparamos el alert
        }
    }

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            if (isEdit && form.id_rol) {
                await updateRole(form.id_rol, form);
                toast.success("Rol modificado correctamente!");
            } else {
                await createRole(form);
                toast.success("Rol registrado correctamente!");
            }
            refreshRoles();
            onSuccess();
        } catch (error) {
            toast.error(String(error));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form
            className="space-y-4"
            onSubmit={(e) => {
                e.preventDefault();
                handleAlert(e);
            }}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                    label="Nombre del rol"
                    value={form.nombre_rol}
                    onChange={(val) => setForm({ ...form, nombre_rol: val })}
                    required
                    minLength={2}
                    maxLength={50}
                    title="Ingrese un nombre de rol entre 2 y 50 caracteres"
                />

                <InputField
                    label="Descripción"
                    value={form.desc_rol || ""}
                    onChange={(val) => setForm({ ...form, desc_rol: val })}
                    maxLength={200}
                    title="Ingrese una descripción de máximo 200 caracteres (opcional)"
                />
                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={form.rol_activo}
                        onChange={(e) => setForm({ ...form, rol_activo: e.target.checked })}
                    />
                    <span>Activo</span>
                </label>
            </div>

            <div className="flex justify-end space-x-2">
                <Button variant="outline" type="button" disabled={isLoading} onClick={onSuccess}>
                    Cancelar
                </Button>
                <Button type="submit" style={{ backgroundColor: "#0000db" }} className="text-white">
                    {isLoading ? "Guardando..." : "Guardar"}
                </Button>
                <AlertDialogHandle
                    title={isEdit ? `Modificar rol ${form.nombre_rol}?` : `Registrar rol ${form.nombre_rol}?`}
                    description={isEdit ? "¿Desea guardar los cambios?" : "¿Desea registrar el rol?"}
                    confirmLabel={isEdit ? "Modificar" : "Registrar"}
                    cancelLabel="Cancelar"
                    onConfirm={handleSubmit}
                    open={open}
                    onOpenChange={setOpen}
                >
                </AlertDialogHandle>
            </div>
        </form>
    );
}

function InputField({ label, value, onChange, type = "text", ...rest }: any) {
    return (
        <div>
            <label className="block text-sm font-medium">{label}</label>
            <Input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full border rounded p-2"
                {...rest}
            />
        </div>
    );
}

export const UserRoleModule: React.FC = () => {
    const [activeTab, setActiveTab] = useState("users");
    const [users, setUsers] = useState<UsuarioType[]>([]);
    const [roles, setRoles] = useState<RolType[]>([]);
    const [clubs, setClubs] = useState<ClubType[]>([]);
    const [error, setError] = useState<string | null>(null);
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
            setError(err.message || "Error fetching users");
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

                    {(activeTab === "users" || activeTab === "roles") && (
                        <DialogHandle<any>
                            title={activeTab === "users" ? "Registrar Nuevo Usuario" : "Registrar Nuevo Rol"}
                            trigger={
                                <Button style={{ backgroundColor: "#0000db" }} className="text-white">
                                    <Plus className="w-4 h-4 mr-2" />
                                    {activeTab === "users" ? "Nuevo Usuario" : "Nuevo Rol"}
                                </Button>
                            }
                        >
                            {(close) =>
                                activeTab === "users" ? (
                                    <UserForm isEdit={false} refreshUsers={fetchUsers} onSuccess={close} roles={roles} refreshRoles={fetchRoles} clubs={clubs} />
                                ) : (
                                    <RoleForm isEdit={false} refreshRoles={fetchRoles} onSuccess={close} />
                                )
                            }
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
                            {error ? <p className="text-red-500">{error}</p> : (
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
                                                                <UserForm isEdit={true} user={initialData} refreshUsers={fetchUsers} onSuccess={close} roles={roles} refreshRoles={fetchRoles} clubs={clubs} />
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
                            )}
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
                                                    trigger={
                                                        <Button variant="outline" size="sm">
                                                            <Edit className="w-4 h-4 mr-1" /> Editar
                                                        </Button>
                                                    }
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
