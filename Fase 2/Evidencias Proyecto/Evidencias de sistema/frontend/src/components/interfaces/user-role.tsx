import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { DialogHandle } from "../dialog-component.tsx";
import { Input } from "../ui/input";
import { Plus, Edit, Eye, Shield, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { getUsers, createUser, updateUser, deleteUser } from "../../services/usuarioService.ts";
import { getRoles, createRole, updateRole, deleteRole } from "../../services/rolService.ts";
import { AlertDialogHandle } from "../alert-dialog-component.tsx";

type User = {
    rut_usuario: string;
    email_usuario: string;
    nombre_usuario: string;
    apellido_usuario: string;
    fecha_nacimiento: string;
    usuario_activo: boolean;
    id_rol: number;
    admin: boolean;
    id_club?: number;
    pass_usuario: string;
};

type UserFormProps = {
    user?: User;
    isEdit: boolean;
    roles: Role[];
    refreshRoles: () => Promise<void>;
    refreshUsers: () => Promise<void>;
    onSuccess: () => void;
};

export function UserForm({ user, isEdit, roles, refreshRoles, refreshUsers, onSuccess }: UserFormProps) {
    const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
    const [form, setForm] = useState<User>(
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
                handleSubmit();
            }}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {!isEdit && (
                    <InputField
                        label="RUT"
                        value={form.rut_usuario}
                        onChange={(val) => setForm({ ...form, rut_usuario: val })}
                    />
                )}

                <InputField
                    label="Nombre"
                    value={form.nombre_usuario}
                    onChange={(val) => setForm({ ...form, nombre_usuario: val })}
                />
                <InputField
                    label="Apellido"
                    value={form.apellido_usuario}
                    onChange={(val) => setForm({ ...form, apellido_usuario: val })}
                />
                <InputField
                    label="Email"
                    type="email"
                    value={form.email_usuario}
                    onChange={(val) => setForm({ ...form, email_usuario: val })}
                />
                <InputField
                    label="Fecha de Nacimiento"
                    type="date"
                    value={form.fecha_nacimiento}
                    onChange={(val) => setForm({ ...form, fecha_nacimiento: val })}
                />
                <InputField
                    label="Contraseña"
                    type="password"
                    value={form.pass_usuario}
                    onChange={(val) => setForm({ ...form, pass_usuario: val })}
                />

                <div>
                    <label className="block text-sm font-medium mb-1">Rol</label>
                    <select
                        value={form.id_rol || ""}
                        onChange={(e) => setForm({ ...form, id_rol: Number(e.target.value) })}
                        className="w-full border rounded p-2"
                    >
                        <option value="">Seleccione un rol</option>
                        {availableRoles.map((r) => (
                            <option key={r.id_rol} value={r.id_rol}>
                                {r.nombre_rol}
                            </option>
                        ))}
                    </select>
                </div>

                {!isEdit && (
                    <InputField
                        label="ID Club (opcional)"
                        type="number"
                        value={form.id_club ?? ""}
                        onChange={(val) => setForm({ ...form, id_club: Number(val) })}
                    />
                )}
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
                <AlertDialogHandle
                    title={isEdit ? `Modificar usuario ${form.nombre_usuario}?` : `Registrar usuario ${form.nombre_usuario}?`}
                    description={isEdit ? "¿Desea guardar los cambios?" : "¿Desea registrar al usuario?"}
                    confirmLabel={isEdit ? "Modificar" : "Registrar"}
                    cancelLabel="Cancelar"
                    onConfirm={handleSubmit}
                >
                    <Button style={{ backgroundColor: "#0000db" }} className="text-white">
                        {!isLoading && !isEdit && <Plus className="w-4 h-4 mr-2" />}
                        {isLoading ? "Guardando..." : "Guardar"}
                    </Button>
                </AlertDialogHandle>
            </div>
        </form>
    );
}

type Role = {
    id_rol?: number;
    nombre_rol: string;
    desc_rol?: string;
    rol_activo: boolean;
};

type RoleFormProps = {
    role?: Role;
    isEdit: boolean;
    refreshRoles: () => Promise<void>;
    onSuccess: () => void;
};

export function RoleForm({ role, isEdit, refreshRoles, onSuccess }: RoleFormProps) {
    const [form, setForm] = useState<Role>(
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
                handleSubmit();
            }}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                    label="Nombre del rol"
                    value={form.nombre_rol}
                    onChange={(val) => setForm({ ...form, nombre_rol: val })}
                />
                <InputField
                    label="Descripción"
                    value={form.desc_rol || ""}
                    onChange={(val) => setForm({ ...form, desc_rol: val })}
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
                <AlertDialogHandle
                    title={isEdit ? `Modificar rol ${form.nombre_rol}?` : `Registrar rol ${form.nombre_rol}?`}
                    description={isEdit ? "¿Desea guardar los cambios?" : "¿Desea registrar el rol?"}
                    confirmLabel={isEdit ? "Modificar" : "Registrar"}
                    cancelLabel="Cancelar"
                    onConfirm={handleSubmit}
                >
                    <Button style={{ backgroundColor: "#0000db" }} className="text-white">
                        {isLoading ? "Guardando..." : "Guardar"}
                    </Button>
                </AlertDialogHandle>
            </div>
        </form>
    );
}

function InputField({ label, value, onChange, type = "text" }: any) {
    return (
        <div>
            <label className="block text-sm font-medium">{label}</label>
            <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full border rounded p-2" />
        </div>
    );
}

export const UserRoleModule: React.FC = () => {
    const [activeTab, setActiveTab] = useState("users");
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleUserDelete = async (rut_usuario: string) => {
        try {
            const response = await deleteUser(rut_usuario);
            console.log(response)
            toast.success(response.detail)
            fetchUsers();
        } catch (error) {
            toast.error(String(error))
        }

    }

    const handleRoleDelete = async (rut_usuario: string) => {
        try {
            const response = await deleteRole(rut_usuario);
            console.log(response)
            toast.success(response.detail)
            fetchRoles();
        } catch (error) {
            toast.error(String(error))
        }

    }

    const fetchUsers = async () => {
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (err: any) {
            setError(err.message || "Error fetching users");
        }
    };

    const fetchRoles = async () => {
        try {
            const data = await getRoles();
            setRoles(data);
        } catch (err: any) {
            setError(err.message || "Error fetching roles");
        }
    };

    useEffect(() => { fetchUsers(); fetchRoles() }, []);
    useEffect(() => { if (activeTab === "roles") fetchRoles(); }, [activeTab]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2>Gestión de Usuarios y Roles</h2>
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
                                <UserForm isEdit={false} refreshUsers={fetchUsers} onSuccess={close} roles={roles} refreshRoles={fetchRoles} />
                            ) : (
                                <RoleForm isEdit={false} refreshRoles={fetchRoles} onSuccess={close} />
                            )
                        }
                    </DialogHandle>
                )}
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
                            {error ? <p className="text-red-500">{error}</p> : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>RUT</TableHead>
                                            <TableHead>Nombre</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Rol</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead>Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.map((user) => (
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
                                                    <Badge className={user.usuario_activo ? "bg-green-500" : "bg-red-500"}>
                                                        {user.usuario_activo ? "Activo" : "Inactivo"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex space-x-2">
                                                        <DialogHandle<User>
                                                            title={`Editar usuario ${user.nombre_usuario}`}
                                                            trigger={<Button variant="outline" size="sm"><Edit className="w-4 h-4" /></Button>}
                                                            initialData={user}
                                                        >
                                                            {(close, initialData) => (
                                                                <UserForm isEdit={true} user={initialData} refreshUsers={fetchUsers} onSuccess={close} roles={roles} refreshRoles={fetchRoles} />
                                                            )}
                                                        </DialogHandle>
                                                        <Button variant="outline" size="sm"><Eye className="w-4 h-4" /></Button>
                                                        <AlertDialogHandle
                                                            title={`Eliminacion de usuario ${user.nombre_usuario}`}
                                                            description={`¿Estas seguro de querer eliminar al usuario ${user.nombre_usuario}`}
                                                            confirmLabel='Eliminar'
                                                            cancelLabel='Cancelar'
                                                            onConfirm={() => handleUserDelete(user.rut_usuario)}
                                                        >
                                                            <Button variant="destructive" size="sm">
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {roles.map((role) => (
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
                                                <DialogHandle<Role>
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

                                                <AlertDialogHandle
                                                    title={`Eliminacion de rol ${role.nombre_rol}`}
                                                    description={`¿Estas seguro de querer eliminar al usuario ${role.nombre_rol}?`}
                                                    confirmLabel="Eliminar"
                                                    cancelLabel="Cancelar"
                                                    onConfirm={() => handleRoleDelete(role.id_rol)}
                                                >
                                                    <Button variant="destructive" size="sm">
                                                        <Trash2 className="w-4 h-4 mr-1" /> Eliminar
                                                    </Button>
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
