import { useState, useEffect } from 'react';
import { Navigate, NavLink, Routes, useNavigate, Route } from 'react-router';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from '../components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { PlayerDetails } from '../components/player-details';
import { MeetingsModule } from '../components/meetings-module';
import { ClubManagement } from '../components/club-management';
import { AnalyticsModule, FingerprintModule } from '../components/enhanced-modules';
import { AuditModule } from './auditoria.tsx'; //-> SE DEBE REVISAR LA AUDITORIA Y SEPARAR EN UN POSIBLE MODULO DIFERENTE
import { UsuarioRolModule } from './usuarioRol.tsx'
import { ClubCoreModule } from './club.tsx'
import { useAuth } from '../contexts/authContext.tsx';
import { CalendarioModule } from './calendario.tsx';
import { CanchasModule } from './canchas.tsx';
import { SolicitudesModule } from './solicitudes.tsx';
import {
    Home,
    Users,
    Settings,
    UserPlus,
    Calendar,
    DollarSign,
    BarChart3,
    FileText,
    Fingerprint,
    MapPin,
    Shield,
    Menu,
    Building,
    Activity,
    Archive,
    Building2,
    Ambulance,
    Mail,
    Send,
    Trophy,
} from 'lucide-react';
import { Toaster } from '../components/ui/sonner.tsx';
import { SerieModule } from './serie.tsx';
import { FinanzasModule } from './finanzas.tsx';
import { RegistroJugadoresModule } from './registro-jugadores.tsx';
import { PerfilUsuarioModule } from './perfilUsuario.tsx';
import { MatchesTrainingModule } from './entrenamiento.tsx';
import { FasModule } from './fas.tsx';
import { ComunicadosModule } from './comunicados.tsx';
import { PartidoModule } from './partidos.tsx';
import { HuellaModule } from './huella.tsx';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar.tsx';
import ReunionesModule from './reuniones.tsx';


// Mock user data with roles
const mockUser = {
    name: "Juan Pérez",
    role: "admin", // admin, club_manager, player, referee
    club: "FC Barcelona Santiago",
    permissions: ["users", "clubs", "players", "matches", "finances", "analytics", "meetings", "fas", "fields", "audit", "fingerprint", "calendar", "admin"]
};

// Application state
interface AppState {
    showPlayerDetails: boolean;
    showClubDetails: boolean;
}

// Module components - Enhanced Dashboard reflecting database structure
const Dashboard = () => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-[#0000db] to-[#4169E1] text-white">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Clubes (CLUB)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-medium">24</div>
                    <p className="text-xs text-blue-100">+2 este mes</p>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#FF8C00] to-[#FFA500] text-white">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Jugadores (JUGADOR)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-medium">432</div>
                    <p className="text-xs text-orange-100">+15 esta semana</p>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Partidos (PARTIDO)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-medium">12</div>
                    <p className="text-xs text-green-100">Próxima semana</p>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Órdenes Pago (ORDEN_PAGO)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-medium">$2.4M</div>
                    <p className="text-xs text-purple-100">+8% vs mes anterior</p>
                </CardContent>
            </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Módulos del Sistema</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                                <Users className="w-5 h-5 text-[#0000db]" />
                                <span>Usuarios y Roles (USUARIO/ROL)</span>
                            </div>
                            <Badge className="bg-green-500">Activo</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                                <Building className="w-5 h-5 text-[#0000db]" />
                                <span>Clubes y Series (CLUB/SERIE)</span>
                            </div>
                            <Badge className="bg-green-500">Activo</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                                <Activity className="w-5 h-5 text-[#0000db]" />
                                <span>Partidos y Entrenamientos</span>
                            </div>
                            <Badge className="bg-green-500">Activo</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                                <Archive className="w-5 h-5 text-[#0000db]" />
                                <span>Auditoría (AUDITORIA)</span>
                            </div>
                            <Badge className="bg-green-500">Activo</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Base de Datos - Tablas Principales</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="p-2 bg-gray-50 rounded">USUARIO</div>
                            <div className="p-2 bg-gray-50 rounded">ROL</div>
                            <div className="p-2 bg-gray-50 rounded">CLUB</div>
                            <div className="p-2 bg-gray-50 rounded">SERIE</div>
                            <div className="p-2 bg-gray-50 rounded">JUGADOR</div>
                            <div className="p-2 bg-gray-50 rounded">LESION</div>
                            <div className="p-2 bg-gray-50 rounded">PARTIDO</div>
                            <div className="p-2 bg-gray-50 rounded">ENTRENAMIENTO</div>
                            <div className="p-2 bg-gray-50 rounded">REUNION</div>
                            <div className="p-2 bg-gray-50 rounded">CANCHA</div>
                            <div className="p-2 bg-gray-50 rounded">ORDEN_PAGO</div>
                            <div className="p-2 bg-gray-50 rounded">AUDITORIA</div>
                        </div>
                        <p className="text-xs text-gray-600 mt-3">
                            Convención FK: id_club, rut_jugador, id_serie (sin prefijos de tabla)
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
);



export default function DashboardComponent() {
    const [appState, setAppState] = useState<AppState>({
        showPlayerDetails: false,
        showClubDetails: false
    });
    const [activeModule, setActiveModule] = useState('dashboard');
    const [resetToken, setResetToken] = useState<string | null>(null);

    const { token, rol, nombre, club_nombre, logout } = useAuth();

    const getInitials = (fullName: string | undefined): string => {
        if (!fullName) return "?";

        return fullName
            .trim()
            .split(" ")
            .filter(Boolean)
            .map(n => n[0].toUpperCase())
            .join("")
            .slice(0, 2);
    };

    // Si no tiene token de login, lo redirecciona a la landing page
    if (!token) {
        return <Navigate to="/" replace />;
    }

    useEffect(() => {
        // Check URL for reset token
        const params = new URLSearchParams(window.location.search);
        const tokenParam = params.get('token');
        if (tokenParam) {
            setResetToken(tokenParam);
        }
        setActiveModule("dashboard")
    }, []);

    const handleShowPlayerDetails = () => {
        setAppState(prev => ({ ...prev, showPlayerDetails: true }));
    };

    const handleBackFromPlayerDetails = () => {
        setAppState(prev => ({ ...prev, showPlayerDetails: false }));
    };

    const handleShowClubDetails = () => {
        setAppState(prev => ({ ...prev, showClubDetails: true }));
    };

    const handleBackFromClubDetails = () => {
        setAppState(prev => ({ ...prev, showClubDetails: false }));
    };


    // Show player details if requested
    if (appState.showPlayerDetails) {
        return <PlayerDetails onBack={handleBackFromPlayerDetails} />;
    }

    // Show club details if requested
    if (appState.showClubDetails) {
        return <ClubManagement onBack={handleBackFromClubDetails} />;
    }

    const modules = [
        { id: 'dashboard', label: 'Dashboard', icon: Home, component: Dashboard },
        { id: 'usuarios-roles', label: 'Usuarios y Roles', icon: Users, component: UsuarioRolModule, permission: 'users' },
        { id: 'clubes', label: 'Clubes', icon: Building, component: ClubCoreModule, permission: 'clubs' },
        { id: 'series', label: 'Series', icon: Building2, component: SerieModule, Permission: 'series' },
        { id: 'registro-jugadores', label: 'Jugadores y Registros', icon: FileText, component: RegistroJugadoresModule, permission: 'players' },
        { id: 'entrenamientos', label: 'Entrenamientos', icon: Activity, component: MatchesTrainingModule, permission: 'matches' },
        { id: 'partidos', label: 'Partidos', icon: Trophy, component: PartidoModule, permission: 'matches' },
        { id: 'meetings', label: 'Reuniones', icon: Calendar, component: ReunionesModule, permission: 'meetings' },
        { id: 'canchas', label: 'Canchas', icon: MapPin, component: CanchasModule, permission: 'fields' },
        { id: 'finanzas', label: 'Finanzas', icon: DollarSign, component: FinanzasModule, permission: 'finances' },
        //{ id: 'analytics', label: 'Analítica', icon: BarChart3, component: AnalyticsModule, permission: 'analytics' },
        { id: 'audit', label: 'Auditoría', icon: Archive, component: AuditModule, permission: 'audit' },
        { id: 'fingerprint', label: 'Huellas', icon: Fingerprint, component: HuellaModule, permission: 'fingerprint' },
        { id: 'fas', label: 'FAS', icon: Ambulance, component: FasModule, permission: 'fas' },
        //{ id: 'calendar', label: 'Calendario', icon: Calendar, component: CalendarioModule, permission: 'calendar' },
        //{ id: 'admin', label: 'Configuración', icon: Settings, component: () => <div>Panel Administrativo</div>, permission: 'admin' },
        { id: 'solicitudes', label: 'Solicitudes', icon: Send, component: SolicitudesModule, permission: 'admin' },
        { id: 'comunicados', label: 'Comunicados', icon: Mail, component: ComunicadosModule, permission: 'admin' },
        { id: 'perfil', label: 'Mi Perfil', icon: UserPlus, component: PerfilUsuarioModule }
    ];

    const filteredModules = modules.filter(module =>
        !module.permission || mockUser.permissions.includes(module.permission) || module.permission === 'calendar'
    );

    const ActiveComponent = modules.find(m => m.id === activeModule)?.component || Dashboard;



    // esto lo hice recien (lucho)
    const navigate = useNavigate()
    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <Sidebar className="border-r" style={{ borderColor: '#e2e8f0' }}>
                    <SidebarHeader className="border-b p-4" style={{ borderColor: '#e2e8f0' }}>
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-[#0000db] text-white flex items-center justify-center">
                                <Avatar className="w-full h-full">
                                    <AvatarImage
                                        className="w-full h-full object-cover"
                                        src="/src/assets/logo_asociacion.png"
                                        alt="Caupolicán Chiguayante"
                                    />
                                    <AvatarFallback
                                        className="leading-1 flex w-full h-full items-center justify-center bg-white text-[12px] font-medium text-violet11"
                                        delayMs={600}
                                    >
                                        CC
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            <div>
                                <h2 className="font-medium">Asociación de Futbol</h2>
                                <p className="text-xs text-muted-foreground">Caupolicán Chiguayante</p>
                            </div>
                        </div>
                    </SidebarHeader>

                    <SidebarContent>
                        <SidebarMenu>
                            {filteredModules.map((module) => {
                                const Icon = module.icon;
                                return (
                                    <SidebarMenuItem key={module.id} onClick={
                                        () => navigate(module.id !== "dashboard" ? `/dashboard/${module.id}` : `/${module.id}`, { replace: true })}>
                                        <SidebarMenuButton
                                            onClick={() => setActiveModule(module.id)}
                                            isActive={activeModule === module.id}
                                            className={activeModule === module.id ? 'bg-[#0000db] text-white' : ''}
                                        >
                                            <Icon className="w-4 h-4" />
                                            <span>{module.label}</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarContent>
                </Sidebar>

                <div className="flex-1 flex flex-col">
                    <header className="border-b bg-white p-4" style={{ borderColor: '#e2e8f0' }}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <SidebarTrigger>
                                    <Menu className="w-5 h-5" />
                                </SidebarTrigger>
                                <div>
                                    <h1 className="font-medium">
                                        {filteredModules.find(m => m.id === activeModule)?.label || 'Dashboard'}
                                    </h1>
                                    <p className="text-sm text-muted-foreground">
                                        Gestión de Asociación de Fútbol
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <Badge variant="outline" style={{ borderColor: '#0000db', color: '#0000db' }}>
                                    {rol ? rol : 'N/A'}
                                </Badge>
                                <NavLink
                                    to="/dashboard/perfil"
                                    className="flex items-center space-x-2 hover:opacity-80 transition"
                                >
                                    <div className="text-right">
                                        <p className="font-medium">{nombre}</p>
                                        <p className="text-xs text-muted-foreground">{club_nombre}</p>
                                    </div>




                                    <div className="w-8 h-8 rounded-full bg-[#0000db] text-white flex items-center justify-center">
                                        {getInitials(nombre!)}
                                    </div>




                                </NavLink>
                                <Button variant="outline" size="sm" onClick={logout}>
                                    Logout
                                </Button>
                            </div>
                        </div>
                    </header>

                    <main className="flex-1 p-6 bg-gray-50">
                        <Routes>
                            <Route index element={<Dashboard />} />

                            <Route path="" element={<Dashboard />} />
                            <Route path="usuarios-roles/" element={<UsuarioRolModule />} >
                                <Route index element={<UsuarioRolModule />} />
                                <Route path='usuarios' element={<UsuarioRolModule />} />
                                <Route path='usuarios/new' element={<UsuarioRolModule />} />
                                <Route path='usuarios/:id/edit/' element={<UsuarioRolModule />} />
                                <Route path='usuarios/:id/view/' element={<UsuarioRolModule />} />
                                <Route path='roles' element={<UsuarioRolModule />} />
                                <Route path='roles/new' element={<UsuarioRolModule />} />
                                <Route path='roles/:id/edit/' element={<UsuarioRolModule />} />
                                <Route path='historial' element={<UsuarioRolModule />} />
                            </Route>
                            <Route path="clubes" element={<ClubCoreModule />}>
                                <Route index element={<ClubCoreModule />} />
                                <Route path=":action" element={<ClubCoreModule />} />
                                <Route path=":action/:id_club" element={<ClubCoreModule />} />
                            </Route>
                            <Route path="series" element={<SerieModule />}>
                                <Route index element={<SerieModule />} />
                                <Route path=":id_serie" element={<SerieModule />} />
                            </Route>
                            <Route path="registro-jugadores" element={<RegistroJugadoresModule />}>
                                <Route index element={<RegistroJugadoresModule />} />
                                <Route path='jugadores' element={<RegistroJugadoresModule />} />
                                <Route path='lesiones' element={<RegistroJugadoresModule />} />
                                <Route path='fichas' element={<RegistroJugadoresModule />} />
                                <Route path='historial' element={<RegistroJugadoresModule />} />
                            </Route>
                            <Route path="entrenamientos" element={<MatchesTrainingModule />} >
                                <Route index element={<MatchesTrainingModule />} />
                                <Route path='new' element={<MatchesTrainingModule />} />
                                <Route path=':id_entrenamiento' element={<MatchesTrainingModule />} />
                                <Route path=':id_entrenamiento/edit' element={<MatchesTrainingModule />} />
                            </Route>
                            <Route path="partidos" element={<PartidoModule />}>
                                <Route index element={<PartidoModule />} />
                                <Route path="calendar" element={<PartidoModule />} />
                                <Route path="new" element={<PartidoModule />} />
                                <Route path=":id_partido" element={<PartidoModule />} />
                                <Route path=":id_partido/:accion" element={<PartidoModule />} />
                            </Route>
                            <Route path="meetings" element={<ReunionesModule />} />
                            <Route path="canchas" element={<CanchasModule />}>
                                <Route index element={<CanchasModule />} />
                                <Route path='new' element={<CanchasModule />} />
                                <Route path=':id_cancha/edit' element={<CanchasModule />} />
                                <Route path='new' element={<CanchasModule />} />
                                <Route path='programacion' element={<CanchasModule />} />
                                <Route path='mantenimiento' element={<CanchasModule />} />
                                <Route path='historial' element={<CanchasModule />} />
                            </Route>
                            <Route path="finanzas" element={<FinanzasModule />}>
                                <Route index element={<FinanzasModule />} />
                                <Route path='new' element={<FinanzasModule />} />
                                <Route path=':id_orden' element={<FinanzasModule />} />
                                <Route path=':id_orden/edit' element={<FinanzasModule />} />
                                <Route path=':id_orden/pay' element={<FinanzasModule />} />
                                <Route path=':id_orden/pending' element={<FinanzasModule />} />
                            </Route>
                            <Route path="analytics" element={<AnalyticsModule />} />
                            <Route path="audit" element={<AuditModule />} />
                            <Route path="fingerprint" element={<HuellaModule />} />
                            <Route path="fas" element={<FasModule />} />
                            <Route path="calendar" element={<CalendarioModule />} />
                            <Route path="admin" element={<div>Panel Administrativo</div>} />
                            <Route path="solicitudes" element={<SolicitudesModule />} >
                                <Route index element={<SolicitudesModule />} />
                                <Route path='new' element={<SolicitudesModule />} />
                                <Route path=':id' element={<SolicitudesModule />} />
                                <Route path=':id/:action' element={<SolicitudesModule />} />
                            </Route>
                            <Route path="comunicados" element={<ComunicadosModule />} />
                            <Route path="perfil" element={<PerfilUsuarioModule />} />

                            <Route path="*" element={<Dashboard />} />
                        </Routes>
                    </main>
                </div>
                <Toaster />
            </div>
        </SidebarProvider>
    );
}
