import React, { useState, useEffect } from 'react';
import { Navigate, NavLink, Routes, useNavigate, Outlet, Route } from 'react-router';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from '../components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { LandingPage } from '../components/landing-page';
import { PlayerDetails } from '../components/player-details';
import { MeetingsModule } from '../components/meetings-module';
import { ClubManagement } from '../components/club-management';
import { AnalyticsModule, FingerprintModule, UserPermissionsModule } from '../components/enhanced-modules';
import { PenaltiesModule } from '../components/additional-modules';
import { AuditModule } from './auditoria.tsx'; //-> SE DEBE REVISAR LA AUDITORIA Y SEPARAR EN UN POSIBLE MODULO DIFERENTE
import { PlayerRecordsModule } from './player-records.tsx'
import { UsuarioRolModule } from './usuarioRol.tsx'
import { ClubModule } from './club.tsx'
import { MatchesTrainingModule } from '../components/matches-training-module';
import { EnhancedFieldsModule } from '../components/enhanced-fields-module';
import { useAuth } from '../contexts/authContext.tsx';
import { Login } from './login.tsx'
import { ResetPassword } from './reset-password'
import { CalendarioModule } from './calendario.tsx';
import { CanchasModule } from './canchas.tsx';
import {
    Home,
    Users,
    Settings,
    Trophy,
    UserPlus,
    Calendar,
    DollarSign,
    BarChart3,
    FileText,
    Fingerprint,
    AlertTriangle,
    MapPin,
    Shield,
    Menu,
    Eye,
    Building,
    Activity,
    Archive,
    Building2
} from 'lucide-react';
import { Toaster } from '../components/ui/sonner.tsx';
import { SerieModule } from './serie.tsx';
import { FinanceModule } from './financiero.tsx';
import { RegistroJugadoresModule } from './registro-jugadores.tsx';




// Mock user data with roles
const mockUser = {
    name: "Juan Pérez",
    role: "admin", // admin, club_manager, player, referee
    club: "FC Barcelona Santiago",
    permissions: ["users", "clubs", "players", "matches", "finances", "analytics", "meetings", "penalties", "fields", "audit", "fingerprint", "calendar", "admin"]
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



const Scoreboard = () => (
    <div className="space-y-6">
        <h2>Marcadores de Series</h2>

        <Card>
            <CardHeader>
                <CardTitle>Serie A - Jornada 15</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {[
                        { local: "FC Barcelona", visitante: "Real Madrid", golesLocal: 2, golesVisitante: 1, estado: "Finalizado" },
                        { local: "Universidad Chile", visitante: "Colo-Colo", golesLocal: 0, golesVisitante: 0, estado: "En Vivo" },
                        { local: "Católica", visitante: "La Serena", golesLocal: null, golesVisitante: null, estado: "15:00" }
                    ].map((partido, i) => (
                        <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center space-x-8">
                                <div className="text-center">
                                    <p className="font-medium">{partido.local}</p>
                                </div>
                                <div className="text-center">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xl font-medium">{partido.golesLocal ?? "-"}</span>
                                        <span className="text-muted-foreground">-</span>
                                        <span className="text-xl font-medium">{partido.golesVisitante ?? "-"}</span>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <p className="font-medium">{partido.visitante}</p>
                                </div>
                            </div>
                            <Badge
                                variant={partido.estado === "En Vivo" ? "default" : "secondary"}
                                style={partido.estado === "En Vivo" ? { backgroundColor: '#FF8C00' } : {}}
                            >
                                {partido.estado}
                            </Badge>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    </div>
);







export default function DashboardComponent() {
    const [appState, setAppState] = useState<AppState>({
        showPlayerDetails: false,
        showClubDetails: false
    });
    const [showLanding, setShowLanding] = useState(true);
    const [activeModule, setActiveModule] = useState('dashboard');
    const [resetToken, setResetToken] = useState<string | null>(null);

    const { token, rol, nombre, club, logout } = useAuth();

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
        { id: 'clubs', label: 'Clubes', icon: Building, component: ClubModule, permission: 'clubs' },
        { id: 'series', label: 'Series', icon: Building2, component: SerieModule, Permission: 'series' },
        { id: 'registro-jugadores', label: 'Jugadores y Registros', icon: FileText, component: PlayerRecordsModule, permission: 'players' },
        { id: 'matches-training', label: 'Partidos y Entrenamientos', icon: Activity, component: MatchesTrainingModule, permission: 'matches' },
        { id: 'scoreboard', label: 'Marcadores', icon: Trophy, component: Scoreboard },
        { id: 'meetings', label: 'Reuniones', icon: Calendar, component: MeetingsModule, permission: 'meetings' },
        { id: 'fields', label: 'Canchas', icon: MapPin, component: CanchasModule, permission: 'fields' },
        { id: 'finances', label: 'Finanzas', icon: DollarSign, component: FinanceModule, permission: 'finances' },
        { id: 'analytics', label: 'Analítica', icon: BarChart3, component: AnalyticsModule, permission: 'analytics' },
        { id: 'audit', label: 'Auditoría', icon: Archive, component: AuditModule, permission: 'audit' },
        { id: 'fingerprint', label: 'Huellas', icon: Fingerprint, component: FingerprintModule, permission: 'fingerprint' },
        { id: 'penalties', label: 'Castigos', icon: AlertTriangle, component: PenaltiesModule, permission: 'penalties' },
        { id: 'calendar', label: 'Calendario', icon: Calendar, component: CalendarioModule, permission: 'calendar' },
        { id: 'admin', label: 'Configuración', icon: Settings, component: () => <div>Panel Administrativo</div>, permission: 'admin' }
    ];

    const filteredModules = modules.filter(module =>
        !module.permission || mockUser.permissions.includes(module.permission) || module.permission === 'calendar'
    );

    const ActiveComponent = modules.find(m => m.id === activeModule)?.component || Dashboard;

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <Sidebar className="border-r" style={{ borderColor: '#e2e8f0' }}>
                    <SidebarHeader className="border-b p-4" style={{ borderColor: '#e2e8f0' }}>
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-lg bg-[#0000db] text-white flex items-center justify-center">
                                <Shield className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="font-medium">Asociación Futbol</h2>
                                <p className="text-xs text-muted-foreground">{mockUser.club}</p>
                            </div>
                        </div>
                    </SidebarHeader>

                    <SidebarContent>
                        <SidebarMenu>
                            {filteredModules.map((module) => {
                                const Icon = module.icon;
                                return (
                                    <SidebarMenuItem key={module.id}>
                                        <NavLink
                                            to={`/dashboard/${module.id}`}
                                            className={({ isActive }) =>
                                                `flex items-center gap-2 px-3 py-2 rounded-lg ${isActive ? "bg-[#0000db] text-white" : ""
                                                }`
                                            }
                                        >
                                            <Icon className='w-4 h-4' />
                                            <span>{module.label}</span>
                                        </NavLink>

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
                                <div className="text-right">
                                    <p className="font-medium">{nombre}</p>
                                    <p className="text-xs text-muted-foreground">{club}</p>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-[#0000db] text-white flex items-center justify-center">
                                    {mockUser.name.split(' ').map(n => n[0]).join('')}
                                </div>
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
                                <Route path='roles' element={<UsuarioRolModule />} />
                                <Route path='roles/new' element={<UsuarioRolModule />} />
                                <Route path='roles/:id/edit/' element={<UsuarioRolModule />} />
                                <Route path='historial' element={<UsuarioRolModule />} />
                            </Route>
                            <Route path="clubs/*" element={<ClubModule />} />
                            <Route path="series" element={<SerieModule />}>
                                <Route index element={<SerieModule />} />
                                <Route path=":id" element={<SerieModule />} />
                            </Route>
                            <Route path="registro-jugadores" element={<RegistroJugadoresModule />}>
                                <Route index element={<RegistroJugadoresModule />} />
                                <Route path='jugadores' element={<RegistroJugadoresModule />} />
                                <Route path='lesiones' element={<RegistroJugadoresModule />} />
                                <Route path='fichas' element={<RegistroJugadoresModule />} />
                                <Route path='historial' element={<RegistroJugadoresModule />} />
                            </Route>
                            <Route path="matches-training" element={<MatchesTrainingModule />} />
                            <Route path="scoreboard" element={<Scoreboard />} />
                            <Route path="meetings" element={<MeetingsModule />} />
                            <Route path="fields" element={<CanchasModule />} />
                            <Route path="finances" element={<FinanceModule />} />
                            <Route path="analytics" element={<AnalyticsModule />} />
                            <Route path="audit" element={<AuditModule />} />
                            <Route path="fingerprint" element={<FingerprintModule />} />
                            <Route path="penalties" element={<PenaltiesModule />} />
                            <Route path="calendar" element={<CalendarioModule />} />
                            <Route path="admin" element={<div>Panel Administrativo</div>} />

                            <Route path="*" element={<Dashboard />} />
                        </Routes>
                    </main>
                </div>
                <Toaster />
            </div>
        </SidebarProvider>
    );
}
