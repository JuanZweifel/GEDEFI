import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../contexts/authContext';

interface LoginProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSuccess, onCancel }) => {
  const { login } = useAuth();

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Recovery state
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryMessage, setRecoveryMessage] = useState('');
  const [recoveryError, setRecoveryError] = useState('');

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

      if (data.access_token) {
        login(data.access_token);
        localStorage.setItem('authToken', data.access_token);
        onSuccess();
      }
    } catch (err) {
      console.error(err);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleRecovery = async () => {
    setRecoveryMessage('');
    setRecoveryError('');
    try {
      const response = await fetch('http://127.0.0.1:8000/auth/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: recoveryEmail }),
      });
      const data = await response.json();

      if (!response.ok) {
        setRecoveryError(data.detail || 'No se pudo enviar el correo');
        return;
      }

      setRecoveryMessage('Se ha enviado un correo para recuperar tu cuenta.');
    } catch (err) {
      console.error(err);
      setRecoveryError('Error de conexión con el servidor');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-md sm:max-w-lg md:max-w-xl shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold">
            {showRecovery ? 'Recuperar Cuenta' : 'Iniciar Sesión'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Display errors */}
          {!showRecovery && error && <Badge className="bg-red-500 w-full">{error}</Badge>}
          {showRecovery && recoveryError && <Badge className="bg-red-500 w-full">{recoveryError}</Badge>}
          {showRecovery && recoveryMessage && <Badge className="bg-green-500 w-full">{recoveryMessage}</Badge>}

          {!showRecovery ? (
            <>
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

              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:underline"
                  onClick={() => setShowRecovery(true)}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  style={{ backgroundColor: '#0000db' }}
                  className="flex-1 text-white"
                  onClick={handleLogin}
                  disabled={loading}
                >
                  {loading ? 'Ingresando...' : 'Iniciar Sesión'}
                </Button>
                <Button variant="secondary" className="flex-1" onClick={onCancel}>
                  Cancelar
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <label className="block text-sm font-medium">Correo Electrónico</label>
                <Input
                  placeholder="Ingrese su email"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1 text-white"
                  style={{ backgroundColor: '#0000db' }}
                  onClick={handleRecovery}
                >
                  Enviar correo
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setShowRecovery(false)}
                >
                  Volver
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
