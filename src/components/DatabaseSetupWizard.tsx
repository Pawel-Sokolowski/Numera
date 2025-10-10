import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle2, XCircle, Loader2, Database, Server, Key, User } from 'lucide-react';
import { electronAPI } from '../utils/electronAPI';

interface DatabaseConfig {
  DB_HOST: string;
  DB_PORT: string;
  DB_NAME: string;
  DB_USER: string;
  DB_PASSWORD: string;
  PORT: string;
  NODE_ENV: string;
}

interface SetupStep {
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  message?: string;
}

export function DatabaseSetupWizard({ onComplete }: { onComplete: () => void }) {
  const [config, setConfig] = useState<DatabaseConfig>({
    DB_HOST: 'localhost',
    DB_PORT: '5432',
    DB_NAME: 'office_management',
    DB_USER: 'postgres',
    DB_PASSWORD: '',
    PORT: '3001',
    NODE_ENV: 'production'
  });

  const [testing, setTesting] = useState(false);
  const [setupRunning, setSetupRunning] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [setupSteps, setSetupSteps] = useState<SetupStep[]>([]);
  const [setupComplete, setSetupComplete] = useState(false);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      if (electronAPI.dbSetupTestConnection) {
        const result = await electronAPI.dbSetupTestConnection(config);
        setTestResult(result);
      } else {
        // For web version, test via API
        const response = await fetch('/api/db-status');
        const data = await response.json();
        setTestResult({
          success: data.connected,
          message: data.connected ? 'Connected successfully' : data.error || 'Connection failed'
        });
      }
    } catch (error: any) {
      setTestResult({
        success: false,
        message: error.message || 'Connection test failed'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleRunSetup = async () => {
    setSetupRunning(true);
    setSetupSteps([]);
    setSetupComplete(false);

    try {
      if (electronAPI.dbSetupRun) {
        const result = await electronAPI.dbSetupRun(config);
        setSetupSteps(result.steps || []);
        setSetupComplete(result.success);

        if (result.success) {
          setTimeout(() => {
            onComplete();
          }, 2000);
        }
      } else {
        // For web version, initialize via API
        const response = await fetch('/api/init-database', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        
        if (data.success) {
          setSetupSteps([
            { name: 'Initialize Database', status: 'success', message: data.message }
          ]);
          setSetupComplete(true);
          setTimeout(() => {
            onComplete();
          }, 2000);
        } else {
          setSetupSteps([
            { name: 'Initialize Database', status: 'failed', message: data.error || 'Failed to initialize' }
          ]);
        }
      }
    } catch (error: any) {
      setSetupSteps([
        { name: 'Setup Error', status: 'failed', message: error.message || 'Setup failed' }
      ]);
    } finally {
      setSetupRunning(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-6 w-6" />
            Database Setup Wizard
          </CardTitle>
          <CardDescription>
            Configure your PostgreSQL database connection to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Configuration Form */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="db-host" className="flex items-center gap-2">
                  <Server className="h-4 w-4" />
                  Database Host
                </Label>
                <Input
                  id="db-host"
                  value={config.DB_HOST}
                  onChange={(e) => setConfig({ ...config, DB_HOST: e.target.value })}
                  placeholder="localhost"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="db-port">Port</Label>
                <Input
                  id="db-port"
                  value={config.DB_PORT}
                  onChange={(e) => setConfig({ ...config, DB_PORT: e.target.value })}
                  placeholder="5432"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="db-name" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Database Name
              </Label>
              <Input
                id="db-name"
                value={config.DB_NAME}
                onChange={(e) => setConfig({ ...config, DB_NAME: e.target.value })}
                placeholder="office_management"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="db-user" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Username
                </Label>
                <Input
                  id="db-user"
                  value={config.DB_USER}
                  onChange={(e) => setConfig({ ...config, DB_USER: e.target.value })}
                  placeholder="postgres"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="db-password" className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Password
                </Label>
                <Input
                  id="db-password"
                  type="password"
                  value={config.DB_PASSWORD}
                  onChange={(e) => setConfig({ ...config, DB_PASSWORD: e.target.value })}
                  placeholder="Enter password"
                />
              </div>
            </div>
          </div>

          {/* Test Connection Button */}
          <div className="space-y-4">
            <Button
              onClick={handleTestConnection}
              disabled={testing || setupRunning || !config.DB_PASSWORD}
              className="w-full"
              variant="outline"
            >
              {testing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing Connection...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Test Connection
                </>
              )}
            </Button>

            {testResult && (
              <Alert variant={testResult.success ? 'default' : 'destructive'}>
                <div className="flex items-center gap-2">
                  {testResult.success ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>{testResult.message}</AlertDescription>
                </div>
              </Alert>
            )}
          </div>

          {/* Setup Steps Display */}
          {setupSteps.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold">Setup Progress:</h4>
              {setupSteps.map((step, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  {step.status === 'success' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                  {step.status === 'failed' && <XCircle className="h-4 w-4 text-red-600" />}
                  {step.status === 'running' && <Loader2 className="h-4 w-4 animate-spin" />}
                  {step.status === 'pending' && <div className="h-4 w-4" />}
                  <span className={step.status === 'failed' ? 'text-red-600' : ''}>
                    {step.name}: {step.message}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Run Setup Button */}
          <div className="space-y-4">
            <Button
              onClick={handleRunSetup}
              disabled={setupRunning || !testResult?.success || setupComplete}
              className="w-full"
            >
              {setupRunning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running Setup...
                </>
              ) : setupComplete ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Setup Complete!
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Initialize Database
                </>
              )}
            </Button>
          </div>

          {/* Help Text */}
          <Alert>
            <AlertDescription className="text-sm">
              <strong>Note:</strong> Make sure PostgreSQL is installed and running before proceeding.
              The default credentials for a fresh PostgreSQL installation are usually username: <code>postgres</code> and the password you set during installation.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
