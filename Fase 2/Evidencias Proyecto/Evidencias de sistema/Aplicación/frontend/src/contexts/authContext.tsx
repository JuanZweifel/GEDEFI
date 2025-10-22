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
  permisos?: string | null; //<- Se debe cambiar quitando la opcionalidad "?"
  email: string | null;
  nombre: string | null;
  club_nombre: string | null;
  id_club: string | null;
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  refreshAccessToken: () => Promise<string | null>;
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
  const [refreshToken, setRefreshToken] = useState<string | null>(() => localStorage.getItem('refreshToken'));
  const [rol, setRol] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [nombre, setNombre] = useState<string | null>(null);
  const [clubNombre, setClubNombre] = useState<string | null>(null);
  const [clubId, setClubId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    try {
      const payload = jwtDecode<TokenPayload>(token);
      setRol(payload.rol || null);
      setEmail(payload.email || null);
      setNombre(payload.nombre || null);
      setClubNombre(payload.club_nombre || null);
      setClubId(payload.id_club || null);

      if (payload.exp) {
        const expiresInMs = payload.exp * 1000 - Date.now();
        if (expiresInMs > 0) {
          const timeout = setTimeout(() => {
            refreshAccessToken();
          }, expiresInMs - 60_000); // refresca 1 minuto antes de la expiracion
          return () => clearTimeout(timeout);
        } else {
          refreshAccessToken();
        }
      }
    } catch {
      logout();
    }
  }, [token]);

  const refreshAccessToken = async (): Promise<string | null> => {
    if (!refreshToken) {
      logout();
      return null;
    }

    try {
      const res = await fetch(`http://localhost:8000/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!res.ok) {
        logout();
        return null;
      }

      const data = await res.json();
      const newAccessToken = data.access_token;

      localStorage.setItem('authToken', newAccessToken);
      setToken(newAccessToken);
      return newAccessToken;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      logout();
      return null;
    }
  };

  const login = (accessToken: string, refreshToken: string) => {
    localStorage.setItem('authToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setToken(accessToken);
    setRefreshToken(refreshToken)
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
    localStorage.removeItem('refreshToken');
    setToken(null);
    setRefreshToken(null);
    setRol(null);
    setEmail(null);
    setNombre(null);
    setClubNombre(null);
  };

  return (
    <AuthContext.Provider value={{ token, rol, email, nombre, id_club: clubId, club_nombre: clubNombre, login, logout, refreshAccessToken, }}>
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
