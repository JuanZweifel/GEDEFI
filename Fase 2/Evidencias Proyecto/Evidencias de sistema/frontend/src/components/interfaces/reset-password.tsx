import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface ResetPasswordProps {
  token?: string;
}

export const ResetPassword: React.FC<ResetPasswordProps> = ({ token: propToken }) => {
  const [token, setToken] = useState(propToken || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      const params = new URLSearchParams(window.location.search);
      const tokenParam = params.get('token');
      if (tokenParam) setToken(tokenParam);
    }
  }, [token]);

  const handleReset = async () => {
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: newPassword }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.detail || 'Error al restablecer la contraseña');
      } else {
        setSuccess('Contraseña restablecida con éxito');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
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
          <CardTitle className="text-center text-2xl font-semibold">
            Restablecer Contraseña
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <Badge className="bg-red-500 w-full">{error}</Badge>}
          {success && <Badge className="bg-green-500 w-full">{success}</Badge>}

          <div className="space-y-2">
            <label className="block text-sm font-medium">Nueva Contraseña</label>
            <Input
              type="password"
              placeholder="Ingrese nueva contraseña"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Confirmar Contraseña</label>
            <Input
              type="password"
              placeholder="Confirme nueva contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <Button
            style={{ backgroundColor: '#0000db' }}
            className="w-full text-white"
            onClick={handleReset}
            disabled={loading}
          >
            {loading ? 'Procesando...' : 'Restablecer Contraseña'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
