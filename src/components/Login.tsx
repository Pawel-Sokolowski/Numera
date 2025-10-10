import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Building2, Lock, User, Globe, Monitor } from 'lucide-react';
import { toast } from 'sonner';
import { isElectron } from '../utils/electronAPI';
import { usePermissions } from '../contexts/PermissionContext';

interface LoginProps {
  onLogin: (user: any) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('admin@demo.com');
  const [password, setPassword] = useState('admin123');
  const [isLoading, setIsLoading] = useState(false);
  const { setDemoAdminMode } = usePermissions();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Demo login - in real app, this would be an API call
      if (email === 'admin@demo.com' && password === 'admin123') {
        const user = {
          id: '1',
          firstName: 'Demo',
          lastName: 'Admin',
          email: 'admin@demo.com',
          role: 'administrator',
          isActive: true,
          permissions: []
        };
        
        // Set demo admin permissions for full access to all features
        setDemoAdminMode();
        
        toast.success('Pomyślnie zalogowano!');
        onLogin(user);
      } else {
        toast.error('Nieprawidłowe dane logowania');
      }
    } catch (error) {
      toast.error('Błąd podczas logowania');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Building2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">System Zarządzania Biurem</h1>
          <p className="text-gray-600 mt-2">Zaloguj się do swojego konta</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">Logowanie</CardTitle>
            <CardDescription className="text-center">
              Wpisz swoje dane aby uzyskać dostęp do systemu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@demo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Hasło</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="admin123"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Logowanie...' : 'Zaloguj się'}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Dane demonstracyjne:</h3>
              <p className="text-sm text-blue-800">
                <strong>Email:</strong> admin@demo.com<br />
                <strong>Hasło:</strong> admin123
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-gray-500">
          <p>System Zarządzania Biurem v1.0.0</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            {isElectron ? (
              <>
                <Monitor className="h-4 w-4" />
                <span>Desktop App (Electron + React + PostgreSQL)</span>
              </>
            ) : (
              <>
                <Globe className="h-4 w-4" />
                <span>Browser Demo (React + Express + PostgreSQL)</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}