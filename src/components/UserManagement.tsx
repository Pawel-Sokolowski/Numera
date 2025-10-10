import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Checkbox } from "./ui/checkbox";
import { UserPlus, Edit, Trash2, Shield, Users, Building, BarChart3 } from "lucide-react";
import { User, Permission, Company, Department } from "../types/client";
import { mockUsers, mockCompany } from "../data/mockData";
import { toast } from 'sonner';

export function UserManagement() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [company, setCompany] = useState<Company>(mockCompany);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'pracownik' as User['role'],
    isActive: true,
    permissions: [] as Permission[]
  });

  const roleLabels = {
    'admin': 'Administrator',
    'sekretariat': 'Sekretariat',
    'ksiegowosc': 'Księgowość',
    'kadry': 'Kadry',
    'pracownik': 'Pracownik'
  };

  const moduleLabels = {
    'klienci': 'Klienci',
    'faktury': 'Faktury',
    'email': 'Email',
    'chat': 'Chat',
    'kalendarz': 'Kalendarz',
    'ceidg': 'CEIDG',
    'raporty': 'Raporty',
    'kontrakty': 'Kontrakty',
    'dokumenty': 'Dokumenty',
    'szablony': 'Szablony',
    'bankowosc': 'Bankowość',
    'czas_pracy': 'Czas pracy',
    'ustawienia': 'Ustawienia',
    'zarzadzanie_uzytkownikami': 'Zarządzanie użytkownikami'
  };

  const actionLabels = {
    'read': 'Odczyt',
    'write': 'Zapis',
    'delete': 'Usuwanie',
    'admin': 'Administracja'
  };

  const getDefaultPermissions = (role: User['role']): Permission[] => {
    switch (role) {
      case 'admin':
        return [
          { module: 'klienci', actions: ['read', 'write', 'delete', 'admin'] },
          { module: 'faktury', actions: ['read', 'write', 'delete', 'admin'] },
          { module: 'email', actions: ['read', 'write', 'delete', 'admin'] },
          { module: 'chat', actions: ['read', 'write', 'delete', 'admin'] },
          { module: 'kalendarz', actions: ['read', 'write', 'delete', 'admin'] },
          { module: 'ceidg', actions: ['read', 'write', 'delete', 'admin'] },
          { module: 'raporty', actions: ['read', 'write', 'delete', 'admin'] },
          { module: 'kontrakty', actions: ['read', 'write', 'delete', 'admin'] },
          { module: 'dokumenty', actions: ['read', 'write', 'delete', 'admin'] },
          { module: 'szablony', actions: ['read', 'write', 'delete', 'admin'] },
          { module: 'bankowosc', actions: ['read', 'write', 'delete', 'admin'] },
          { module: 'czas_pracy', actions: ['read', 'write', 'delete', 'admin'] },
          { module: 'ustawienia', actions: ['read', 'write', 'delete', 'admin'] },
          { module: 'zarzadzanie_uzytkownikami', actions: ['read', 'write', 'delete', 'admin'] }
        ];
      case 'sekretariat':
        return [
          { module: 'klienci', actions: ['read', 'write'] },
          { module: 'email', actions: ['read', 'write'] },
          { module: 'chat', actions: ['read', 'write'] },
          { module: 'kalendarz', actions: ['read', 'write'] }
        ];
      case 'ksiegowosc':
        return [
          { module: 'klienci', actions: ['read'] },
          { module: 'faktury', actions: ['read', 'write', 'delete'] },
          { module: 'ceidg', actions: ['read', 'write'] },
          { module: 'raporty', actions: ['read', 'write'] }
        ];
      case 'kadry':
        return [
          { module: 'klienci', actions: ['read'] },
          { module: 'kalendarz', actions: ['read', 'write'] },
          { module: 'chat', actions: ['read', 'write'] }
        ];
      default:
        return [
          { module: 'chat', actions: ['read', 'write'] },
          { module: 'kalendarz', actions: ['read'] }
        ];
    }
  };

  const handleCreateUser = () => {
    if (!newUser.firstName || !newUser.lastName || !newUser.email) {
      toast.error("Wypełnij wszystkie wymagane pola");
      return;
    }

    const user: User = {
      id: Date.now().toString(),
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      role: newUser.role,
      isActive: newUser.isActive,
      permissions: newUser.permissions.length > 0 ? newUser.permissions : getDefaultPermissions(newUser.role)
    };

    setUsers(prev => [...prev, user]);
    setIsCreating(false);
    setNewUser({
      firstName: '',
      lastName: '',
      email: '',
      role: 'pracownik',
      isActive: true,
      permissions: []
    });
    toast.success("Użytkownik został dodany");
  };

  const handleRoleChange = (role: User['role']) => {
    setNewUser(prev => ({
      ...prev,
      role,
      permissions: getDefaultPermissions(role)
    }));
  };

  const updatePermission = (moduleKey: string, action: string, enabled: boolean) => {
    setNewUser(prev => {
      const updatedPermissions = [...prev.permissions];
      const moduleIndex = updatedPermissions.findIndex(p => p.module === moduleKey);
      
      if (moduleIndex >= 0) {
        if (enabled) {
          if (!updatedPermissions[moduleIndex].actions.includes(action as any)) {
            updatedPermissions[moduleIndex].actions.push(action as any);
          }
        } else {
          updatedPermissions[moduleIndex].actions = updatedPermissions[moduleIndex].actions.filter(a => a !== action);
          if (updatedPermissions[moduleIndex].actions.length === 0) {
            updatedPermissions.splice(moduleIndex, 1);
          }
        }
      } else if (enabled) {
        updatedPermissions.push({
          module: moduleKey as any,
          actions: [action as any]
        });
      }
      
      return { ...prev, permissions: updatedPermissions };
    });
  };

  const hasPermission = (moduleKey: string, action: string) => {
    const permission = newUser.permissions.find(p => p.module === moduleKey);
    return permission?.actions.includes(action as any) || false;
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, isActive: !user.isActive } : user
    ));
  };

  const deleteUser = (userId: string) => {
    if (confirm('Czy na pewno chcesz usunąć tego użytkownika?')) {
      setUsers(prev => prev.filter(user => user.id !== userId));
      toast.success("Użytkownik został usunięty");
    }
  };

  const updateEmployeeCount = (departmentId: string, count: number) => {
    setCompany(prev => ({
      ...prev,
      departments: prev.departments.map(dept =>
        dept.id === departmentId ? { ...dept, employeeCount: count } : dept
      ),
      totalEmployees: prev.departments.reduce((sum, dept) => 
        sum + (dept.id === departmentId ? count : dept.employeeCount), 0
      )
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Zarządzanie Użytkownikami</h1>
          <p className="text-muted-foreground">
            Zarządzaj personelem i uprawnieniami w systemie
          </p>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Użytkownicy
          </TabsTrigger>
          <TabsTrigger value="departments" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Działy
          </TabsTrigger>
          <TabsTrigger value="company" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Statystyki
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2>Lista Użytkowników</h2>
              <p className="text-muted-foreground text-sm">
                Aktywnych użytkowników: {users.filter(u => u.isActive).length} / {users.length}
              </p>
            </div>
            <Dialog open={isCreating} onOpenChange={setIsCreating}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Dodaj Użytkownika
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Dodaj nowego użytkownika</DialogTitle>
                  <DialogDescription>
                    Wprowadź dane użytkownika i ustaw uprawnienia
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Imię *</Label>
                      <Input
                        value={newUser.firstName}
                        onChange={(e) => setNewUser(prev => ({ ...prev, firstName: e.target.value }))}
                        placeholder="Imię"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Nazwisko *</Label>
                      <Input
                        value={newUser.lastName}
                        onChange={(e) => setNewUser(prev => ({ ...prev, lastName: e.target.value }))}
                        placeholder="Nazwisko"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="email@biuro.pl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Rola</Label>
                      <Select
                        value={newUser.role}
                        onValueChange={handleRoleChange}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(roleLabels).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newUser.isActive}
                      onCheckedChange={(checked) => setNewUser(prev => ({ ...prev, isActive: checked }))}
                    />
                    <Label>Aktywny użytkownik</Label>
                  </div>

                  <div>
                    <Label className="text-base">Uprawnienia</Label>
                    <div className="mt-4 space-y-4">
                      {Object.entries(moduleLabels).map(([moduleKey, moduleLabel]) => (
                        <Card key={moduleKey}>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm">{moduleLabel}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-4">
                              {Object.entries(actionLabels).map(([actionKey, actionLabel]) => (
                                <div key={actionKey} className="flex items-center space-x-2">
                                  <Checkbox
                                    checked={hasPermission(moduleKey, actionKey)}
                                    onCheckedChange={(checked) => 
                                      updatePermission(moduleKey, actionKey, checked as boolean)
                                    }
                                  />
                                  <Label className="text-sm">{actionLabel}</Label>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleCreateUser}>
                      Dodaj użytkownika
                    </Button>
                    <Button variant="outline" onClick={() => setIsCreating(false)}>
                      Anuluj
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Użytkownik</TableHead>
                    <TableHead>Rola</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Uprawnienia</TableHead>
                    <TableHead>Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {roleLabels[user.role]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? 'default' : 'secondary'}>
                          {user.isActive ? 'Aktywny' : 'Nieaktywny'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.permissions.slice(0, 3).map((permission) => (
                            <Badge key={permission.module} variant="outline" className="text-xs">
                              {moduleLabels[permission.module]}
                            </Badge>
                          ))}
                          {user.permissions.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{user.permissions.length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleUserStatus(user.id)}
                          >
                            <Shield className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteUser(user.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Działy w firmie</CardTitle>
              <CardDescription>
                Zarządzaj działami i liczbą pracowników
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {company.departments.map((department) => (
                  <Card key={department.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{department.name}</CardTitle>
                      <CardDescription>
                        Kierownik: {users.find(u => u.id === department.managerId)?.firstName} {users.find(u => u.id === department.managerId)?.lastName}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Label>Liczba pracowników</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            value={department.employeeCount}
                            onChange={(e) => updateEmployeeCount(department.id, parseInt(e.target.value) || 0)}
                            className="w-20"
                          />
                          <span className="text-sm text-muted-foreground">osób</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Łączna liczba pracowników</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{company.totalEmployees}</div>
                <p className="text-sm text-muted-foreground">
                  w {company.departments.length} działach
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Aktywni użytkownicy systemu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {users.filter(u => u.isActive).length}
                </div>
                <p className="text-sm text-muted-foreground">
                  z {users.length} zarejestrowanych
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Najliczniejszy dział</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">
                  {company.departments.reduce((prev, current) => 
                    prev.employeeCount > current.employeeCount ? prev : current
                  ).name}
                </div>
                <p className="text-sm text-muted-foreground">
                  {company.departments.reduce((prev, current) => 
                    prev.employeeCount > current.employeeCount ? prev : current
                  ).employeeCount} pracowników
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Podział ról w systemie</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(roleLabels).map(([role, label]) => {
                  const count = users.filter(u => u.role === role).length;
                  const percentage = users.length > 0 ? (count / users.length) * 100 : 0;
                  
                  return (
                    <div key={role} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{label}</Badge>
                        <span className="text-sm">{count} użytkowników</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {percentage.toFixed(1)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}