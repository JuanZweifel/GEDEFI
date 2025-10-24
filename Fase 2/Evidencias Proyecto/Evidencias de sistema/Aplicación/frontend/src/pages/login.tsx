import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../contexts/authContext';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || 'Email o contraseña incorrectos');
        setLoading(false);
        return;
      }

      if (data.access_token && data.refresh_token) {
        login(data.access_token, data.refresh_token);
        navigate('/dashboard'); // <-- redirect to home/dashboard after login
      }

    } catch (err) {
      console.error(err);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-md sm:max-w-lg md:max-w-xl shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold">Iniciar Sesión</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <Badge className="bg-red-500 w-full">{error}</Badge>}

          <div className="space-y-2">
            <label className="block text-sm font-medium">Usuario</label>
            <Input
              placeholder="Ingrese su email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Contraseña</label>
            <Input
              type="password"
              placeholder="Ingrese su contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button
            style={{ backgroundColor: '#0000db' }}
            className="w-full text-white"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
