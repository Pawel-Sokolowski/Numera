import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Separator } from "./ui/separator";
import { Alert, AlertDescription } from "./ui/alert";
import { 
  User, 
  Mail, 
  Shield, 
  Settings, 
  Key, 
  Calendar,
  MessageSquare,
  Save,
  Eye,
  EyeOff,
  TestTube,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { UserProfile, SMTPSettings, ModulePermission } from "../types/client";
import { toast } from 'sonner';

interface UserProfileManagementProps {
  user: UserProfile;
  onSave: (user: Partial<UserProfile>) => void;
  isAdmin: boolean;
}

export function UserProfileManagement({ user, onSave, isAdmin }: UserProfileManagementProps) {
  const [profile, setProfile] = useState<Partial<UserProfile>>(user);
  const [smtpSettings, setSMTPSettings] = useState<Partial<SMTPSettings>>(
    user.smtpSettings || {
      email: '',
      smtpHost: '',
      smtpPort: 587,
      username: '',
      password: '',
      isDefault: true,
      isActive: true
    }
  );
  const [showPassword, setShowPassword] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleProfileUpdate = (field: keyof UserProfile, value: any) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSMTPUpdate = (field: keyof SMTPSettings, value: any) => {
    setSMTPSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePermissionUpdate = (moduleIndex: number, permission: keyof ModulePermission['permissions'], value: boolean) => {
    const currentPermissions = profile.permissions || [];
    const updatedPermissions = [...currentPermissions];
    
    if (updatedPermissions[moduleIndex]) {
      updatedPermissions[moduleIndex] = {
        ...updatedPermissions[moduleIndex],
        permissions: {
          ...updatedPermissions[moduleIndex].permissions,
          [permission]: value
        }
      };
    }
    
    setProfile(prev => ({
      ...prev,
      permissions: updatedPermissions
    }));
  };

  const testSMTPConnection = async () => {
    if (!smtpSettings.smtpHost || !smtpSettings.email) {
      toast.error("Wprowadź host SMTP i adres email");
      return;
    }

    setTestingConnection(true);
    setConnectionStatus('idle');

    try {
      // Symulacja testu połączenia SMTP
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // W rzeczywistej aplikacji tutaj byłoby prawdziwe wywołanie API
      const isConnectionSuccessful = Math.random() > 0.3; // 70% szans na sukces
      
      if (isConnectionSuccessful) {
        setConnectionStatus('success');
        toast.success("Połączenie SMTP zostało pomyślnie przetestowane");
      } else {
        setConnectionStatus('error');
        toast.error("Nie udało się nawiązać połączenia SMTP");
      }
    } catch (error) {
      setConnectionStatus('error');
      toast.error("Błąd podczas testowania połączenia");
    } finally {
      setTestingConnection(false);
    }
  };

  const saveProfile = () => {
    const updatedProfile = {
      ...profile,
      smtpSettings: smtpSettings as SMTPSettings,
      updatedAt: new Date().toISOString()
    };
    
    onSave(updatedProfile);
    toast.success("Profil został zaktualizowany");
  };

  const getPresetSMTPSettings = (provider: string) => {
    const presets = {
      gmail: {
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587,
      },
      outlook: {
        smtpHost: 'smtp-mail.outlook.com',
        smtpPort: 587,
      },
      yahoo: {
        smtpHost: 'smtp.mail.yahoo.com',
        smtpPort: 587,
      },
      custom: {
        smtpHost: '',
        smtpPort: 587,
      }
    };

    const preset = presets[provider as keyof typeof presets];
    if (preset) {
      setSMTPSettings(prev => ({
        ...prev,
        ...preset
      }));
    }
  };

  const defaultModules: ModulePermission[] = [
    {
      module: 'clients',
      permissions: { read: true, write: false, delete: false, admin: false },
      restrictions: { viewPersonalDataOnly: false, accessToSecretData: false }
    },
    {
      module: 'invoices',
      permissions: { read: false, write: false, delete: false, admin: false },
      restrictions: { accessToFinancialData: false }
    },
    {
      module: 'email',
      permissions: { read: true, write: true, delete: false, admin: false }
    },
    {
      module: 'chat',
      permissions: { read: true, write: true, delete: false, admin: false },
      restrictions: { accessToFullChatHistory: false }
    },
    {
      module: 'calendar',
      permissions: { read: true, write: true, delete: false, admin: false }
    },
    {
      module: 'ceidg',
      permissions: { read: false, write: false, delete: false, admin: false }
    },
    {
      module: 'reports',
      permissions: { read: false, write: false, delete: false, admin: false }
    },
    {
      module: 'settings',
      permissions: { read: false, write: false, delete: false, admin: false }
    },
    {
      module: 'user_management',
      permissions: { read: false, write: false, delete: false, admin: false },
      restrictions: { manageOtherUsers: false }
    }
  ];

  const moduleLabels = {
    clients: 'Klienci',
    invoices: 'Faktury',
    email: 'Email',
    chat: 'Chat',
    calendar: 'Kalendarz',
    ceidg: 'CEIDG',
    reports: 'Raporty',
    settings: 'Ustawienia',
    user_management: 'Zarządzanie użytkownikami'
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Profil Użytkownika</h1>
        <p className="text-muted-foreground">
          Zarządzaj swoim profilem i ustawieniami konta
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList>
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="email">Ustawienia Email</TabsTrigger>
          <TabsTrigger value="calendar">Kalendarz</TabsTrigger>
          {isAdmin && <TabsTrigger value="permissions">Uprawnienia</TabsTrigger>}
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informacje podstawowe
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Imię</Label>
                  <Input
                    id="firstName"
                    value={profile.firstName || ''}
                    onChange={(e) => handleProfileUpdate('firstName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nazwisko</Label>
                  <Input
                    id="lastName"
                    value={profile.lastName || ''}
                    onChange={(e) => handleProfileUpdate('lastName', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Adres email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email || ''}
                  onChange={(e) => handleProfileUpdate('email', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rola</Label>
                <Select
                  value={profile.role}
                  onValueChange={(value: any) => handleProfileUpdate('role', value)}
                  disabled={!isAdmin}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="administrator">Administrator</SelectItem>
                    <SelectItem value="zarzadzanie_biurem">Zarządzanie biurem</SelectItem>
                    <SelectItem value="wlasciciel">Właściciel</SelectItem>
                    <SelectItem value="sekretariat">Sekretariat</SelectItem>
                    <SelectItem value="kadrowa">Kadrowa</SelectItem>
                    <SelectItem value="ksiegowa">Księgowa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={profile.isActive}
                  onCheckedChange={(checked) => handleProfileUpdate('isActive', checked)}
                  disabled={!isAdmin}
                />
                <Label htmlFor="isActive">Konto aktywne</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings Tab */}
        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Konfiguracja SMTP
              </CardTitle>
              <CardDescription>
                Skonfiguruj połączenie z serwerem email, aby wysyłać wiadomości z systemu
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Wybierz dostawcę email lub skonfiguruj własny</Label>
                <Select onValueChange={getPresetSMTPSettings}>
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz dostawcę..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gmail">Gmail</SelectItem>
                    <SelectItem value="outlook">Outlook/Hotmail</SelectItem>
                    <SelectItem value="yahoo">Yahoo Mail</SelectItem>
                    <SelectItem value="custom">Niestandardowy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpEmail">Adres email</Label>
                  <Input
                    id="smtpEmail"
                    type="email"
                    value={smtpSettings.email || ''}
                    onChange={(e) => handleSMTPUpdate('email', e.target.value)}
                    placeholder="twoj@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpUsername">Nazwa użytkownika</Label>
                  <Input
                    id="smtpUsername"
                    value={smtpSettings.username || ''}
                    onChange={(e) => handleSMTPUpdate('username', e.target.value)}
                    placeholder="Zwykle taki sam jak email"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">Serwer SMTP</Label>
                  <Input
                    id="smtpHost"
                    value={smtpSettings.smtpHost || ''}
                    onChange={(e) => handleSMTPUpdate('smtpHost', e.target.value)}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">Port</Label>
                  <Input
                    id="smtpPort"
                    type="number"
                    value={smtpSettings.smtpPort || 587}
                    onChange={(e) => handleSMTPUpdate('smtpPort', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtpPassword">Hasło aplikacji</Label>
                <div className="relative">
                  <Input
                    id="smtpPassword"
                    type={showPassword ? "text" : "password"}
                    value={smtpSettings.password || ''}
                    onChange={(e) => handleSMTPUpdate('password', e.target.value)}
                    placeholder="Hasło do aplikacji"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Dla Gmail/Outlook użyj hasła aplikacji, nie hasła do konta
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <Button onClick={testSMTPConnection} disabled={testingConnection}>
                  <TestTube className="mr-2 h-4 w-4" />
                  {testingConnection ? 'Testowanie...' : 'Testuj połączenie'}
                </Button>
                
                {connectionStatus === 'success' && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Połączenie działa</span>
                  </div>
                )}
                
                {connectionStatus === 'error' && (
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">Błąd połączenia</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isDefault"
                    checked={smtpSettings.isDefault}
                    onCheckedChange={(checked) => handleSMTPUpdate('isDefault', checked)}
                  />
                  <Label htmlFor="isDefault">Domyślne ustawienia</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={smtpSettings.isActive}
                    onCheckedChange={(checked) => handleSMTPUpdate('isActive', checked)}
                  />
                  <Label htmlFor="isActive">Aktywne</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calendar Settings Tab */}
        <TabsContent value="calendar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Ustawienia kalendarza
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Domyślny widok</Label>
                  <Select
                    value={profile.calendarSettings?.defaultView}
                    onValueChange={(value: any) => 
                      handleProfileUpdate('calendarSettings', {
                        ...profile.calendarSettings,
                        defaultView: value
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">Miesiąc</SelectItem>
                      <SelectItem value="week">Tydzień</SelectItem>
                      <SelectItem value="day">Dzień</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Strefa czasowa</Label>
                  <Select
                    value={profile.calendarSettings?.timeZone}
                    onValueChange={(value) => 
                      handleProfileUpdate('calendarSettings', {
                        ...profile.calendarSettings,
                        timeZone: value
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Europe/Warsaw">Europa/Warszawa</SelectItem>
                      <SelectItem value="Europe/London">Europa/Londyn</SelectItem>
                      <SelectItem value="America/New_York">Ameryka/Nowy Jork</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Początek dnia roboczego</Label>
                  <Input
                    type="time"
                    value={profile.calendarSettings?.workingHours?.start}
                    onChange={(e) => 
                      handleProfileUpdate('calendarSettings', {
                        ...profile.calendarSettings,
                        workingHours: {
                          ...profile.calendarSettings?.workingHours,
                          start: e.target.value
                        }
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Koniec dnia roboczego</Label>
                  <Input
                    type="time"
                    value={profile.calendarSettings?.workingHours?.end}
                    onChange={(e) => 
                      handleProfileUpdate('calendarSettings', {
                        ...profile.calendarSettings,
                        workingHours: {
                          ...profile.calendarSettings?.workingHours,
                          end: e.target.value
                        }
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permissions Tab - Only for admins */}
        {isAdmin && (
          <TabsContent value="permissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Uprawnienia modułów
                </CardTitle>
                <CardDescription>
                  Zarządzaj dostępem użytkownika do różnych funkcji systemu
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Zmiany w uprawnieniach wymagają ponownego zalogowania użytkownika
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-4">
                  {defaultModules.map((modulePermission, index) => (
                    <div key={modulePermission.module} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">
                          {moduleLabels[modulePermission.module]}
                        </h4>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(modulePermission.permissions).map(([permission, value]) => (
                          <div key={permission} className="flex items-center space-x-2">
                            <Switch
                              checked={value}
                              onCheckedChange={(checked) => 
                                handlePermissionUpdate(index, permission as keyof ModulePermission['permissions'], checked)
                              }
                            />
                            <Label className="capitalize">{permission}</Label>
                          </div>
                        ))}
                      </div>
                      
                      {modulePermission.restrictions && (
                        <div className="mt-3 pt-3 border-t">
                          <Label className="text-sm font-medium">Ograniczenia:</Label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                            {Object.entries(modulePermission.restrictions).map(([restriction, value]) => (
                              <div key={restriction} className="flex items-center space-x-2">
                                <Switch checked={value} disabled />
                                <Label className="text-sm text-muted-foreground">
                                  {restriction.replace(/([A-Z])/g, ' $1').toLowerCase()}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={saveProfile}>
          <Save className="mr-2 h-4 w-4" />
          Zapisz zmiany
        </Button>
      </div>
    </div>
  );
}