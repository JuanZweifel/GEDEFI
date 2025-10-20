import React, { createContext, useContext, useState, type ReactNode, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router';
import { jwtDecode } from 'jwt-decode';

interface TokenPayload {
  rut_usuario?: string;
  email?: string;
  rol?: string;
  nombre?: string;
  id_club?: string;
  club_nombre?: string;
  exp?: number;
}

interface AuthContextType {
  token: string | null;
  rol: string | null;
  permisos: string | null;
  email: string | null;
  nombre: string | null;
  club_nombre: string | null;
  id_club: string | null;
  login: (accessToken: string) => void;
  logout: () => void;
}

interface ProtectedRouteProps {
  children: JSX.Element;
  requiredRole?: string;
  requiredPermission?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();

  const [token, setToken] = useState<string | null>(() => localStorage.getItem('authToken'));
  const [rol, setRol] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [nombre, setNombre] = useState<string | null>(null);
  const [clubNombre, setClubNombre] = useState<string | null>(null);
  const [clubId, setClubId] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      try {
        const payload = jwtDecode<TokenPayload>(token);
        setRol(payload.rol || null);
        setEmail(payload.email || null);
        setNombre(payload.nombre || null);
        setClubNombre(payload.club_nombre || null);
        setClubId(payload.id_club || null);

        if (payload.exp && Date.now() >= payload.exp * 1000) {
          logout();
        }
      } catch {
        logout();
      }
    }
  }, [token]);

  const login = (accessToken: string) => {
    localStorage.setItem('authToken', accessToken);
    setToken(accessToken);
    const payload = jwtDecode<TokenPayload>(accessToken);
    setRol(payload.rol || null);
    setEmail(payload.email || null);
    setNombre(payload.nombre || null);
    setClubNombre(payload.club_nombre || null);
    setClubId(payload.id_club || null);

    navigate('/dashboard', { replace: true });
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setRol(null);
    setEmail(null);
    setNombre(null);
    setClubNombre(null);
  };

  return (
    <AuthContext.Provider value={{ token, rol, email, nombre, club_id: clubId, club_nombre: clubNombre, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('Para usar "useAuth" tienes que estar dentro de AuthProvider');
  return context;
};


export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredPermission
}) => {
  const { token, rol, permisos } = useAuth();

  if (!token) return <Navigate to="/" replace />;

  if (requiredRole && rol !== requiredRole) return <Navigate to="/" replace />;

  if (requiredPermission && !permisos?.includes(requiredPermission))
    return <Navigate to="/" replace />;

  return children;
};
