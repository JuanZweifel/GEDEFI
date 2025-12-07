import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../contexts/authContext';
import { loginUser, recoverUser } from '../services/authService';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

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
  const [recoveryLoading, setRecoveryLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    const trimmedEmail = email.trim();
    try {
      const data = await loginUser<{ access_token: string; refresh_token: string }>(trimmedEmail, password);

      if (data.access_token && data.refresh_token) {
        login(data.access_token, data.refresh_token);
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message.includes("401")
        ? "Email o contraseña incorrectos"
        : "Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleRecovery = async () => {
    setRecoveryMessage('');
    setRecoveryError('');
    try {
      setRecoveryLoading(true);
      await recoverUser<{ detail?: string }>(recoveryEmail);
      setRecoveryMessage('Se ha enviado un correo para recuperar tu cuenta.');
    } catch (err: any) {
      console.error(err);
      setRecoveryError(err.message || 'Error de conexión con el servidor');
    } finally {
      setRecoveryLoading(false);
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
          {/* Error & success badges */}
          {!showRecovery && error && <Badge className="bg-red-500 w-full">{error}</Badge>}
          {showRecovery && recoveryError && <Badge className="bg-red-500 w-full">{recoveryError}</Badge>}
          {showRecovery && recoveryMessage && <Badge className="bg-green-500 w-full">{recoveryMessage}</Badge>}

          {!showRecovery ? (
            <>
              <form className='space-y-4' onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
                <div>
                  <label className="block text-sm font-medium">Correo</label>
                  <Input
                    placeholder="Ingrese su email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
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

                <Button
                  style={{ backgroundColor: '#0000db' }}
                  className="w-full text-white"
                  disabled={loading}
                  type='submit'
                >
                  {loading ? 'Ingresando...' : 'Iniciar Sesión'}
                </Button>
              </form>
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
                  disabled={recoveryLoading}
                >
                  {recoveryLoading ? 'Enviando...' : 'Enviar correo'}
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
