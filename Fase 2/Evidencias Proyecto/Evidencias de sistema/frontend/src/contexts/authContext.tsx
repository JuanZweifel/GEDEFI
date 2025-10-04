import React, { createContext, useContext, useState, ReactNode } from 'react';
import { jwtDecode } from "jwt-decode";

interface TokenPayload {
  rut_usuario?: string;
  email?: string;
  rol?: string;
  nombre?: string;
  club?: string;
  exp?: number;
}

interface AuthContextType {
  token: string | null;
  rol: string | null;
  email: string | null;
  nombre: string | null;
  club: string | null;

  login: (accessToken: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('authToken'));

  const [rol, setRol] = useState<string | null>(() => {
    const t = localStorage.getItem('authToken');
    if (t) return jwtDecode<TokenPayload>(t).rol || null;
    return null;
  });

  const [email, setEmail] = useState<string | null>(() => {
    const t = localStorage.getItem('authToken');
    if (t) return jwtDecode<TokenPayload>(t).email || null;
    return null;
  });

  const [nombre, setNombre] = useState<string | null>(() => {
    const t = localStorage.getItem('authToken');
    if (t) return jwtDecode<TokenPayload>(t).nombre || null;
    return null;
  });

  const [club, setClub] = useState<string | null>(() => {
    const t = localStorage.getItem('authToken');
    if (t) return jwtDecode<TokenPayload>(t).club || null;
    return null;
  });

  const login = (accessToken: string) => {
    localStorage.setItem('authToken', accessToken);
    setToken(accessToken);
    const payload = jwtDecode<TokenPayload>(accessToken);
    setRol(payload.rol || null);
    setEmail(payload.email || null);
    setNombre(payload.nombre || null);
    setClub(payload.club || null);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setRol(null);
    setEmail(null);
    setNombre(null);
    setClub(null);
  };

  return (
    <AuthContext.Provider value={{ token, rol, email, nombre, club, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
