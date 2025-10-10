import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Search, Filter, Eye, Edit, Trash2, UserPlus, Users, Archive, Star } from "lucide-react";
import { Client } from "../types/client";

interface ClientListProps {
  clients: Client[];
  onViewClient: (client: Client) => void;
  onEditClient: (client: Client) => void;
  onDeleteClient: (clientId: string) => void;
  onAddClient: () => void;
}

export function ClientList({ 
  clients, 
  onViewClient, 
  onEditClient, 
  onDeleteClient, 
  onAddClient 
}: ClientListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('wszystkie');
  const [sortBy, setSortBy] = useState<string>('nazwa');

  const getFilteredClients = (status?: string) => {
    return clients
      .filter(client => {
        const matchesSearch = 
          client.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (client.emails || []).some(email => email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (client.company || client.companyName || '').toLowerCase().includes(searchTerm.toLowerCase());
        
        if (status) {
          return matchesSearch && client.status === status;
        }
        
        const matchesStatus = statusFilter === 'wszystkie' || client.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'nazwa':
            return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
          case 'firma':
            return (a.company || a.companyName || '').localeCompare(b.company || b.companyName || '');
          case 'data':
            return new Date(b.dateAdded || '').getTime() - new Date(a.dateAdded || '').getTime();
          default:
            return 0;
        }
      });
  };

  const aktualniKlienci = getFilteredClients('aktualny');
  const archiwalniKlienci = getFilteredClients('archiwalny');
  const potencjalniKlienci = getFilteredClients('potencjalny');
  const allFilteredClients = getFilteredClients();

  const getStatusLabel = (status: string) => {
    const labels = {
      'aktualny': 'Aktualny',
      'archiwalny': 'Archiwalny',
      'potencjalny': 'Potencjalny'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'aktualny':
        return 'default' as const;
      case 'potencjalny':
        return 'secondary' as const;
      case 'archiwalny':
        return 'outline' as const;
      default:
        return 'outline' as const;
    }
  };

  const ClientTable = ({ 
    clients, 
    onViewClient, 
    onEditClient, 
    onDeleteClient, 
    emptyMessage,
    searchTerm 
  }: {
    clients: Client[];
    onViewClient: (client: Client) => void;
    onEditClient: (client: Client) => void;
    onDeleteClient: (clientId: string) => void;
    emptyMessage: string;
    searchTerm: string;
  }) => (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Wyświetlanie {clients.length} klientów
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nazwa</TableHead>
              <TableHead>Firma</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data dodania</TableHead>
              <TableHead className="text-right">Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="text-muted-foreground">
                    {searchTerm ? 'Nie znaleziono klientów pasujących do kryteriów' : emptyMessage}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {client.firstName} {client.lastName}
                      </div>
                      {client.position && (
                        <div className="text-sm text-muted-foreground">
                          {client.position}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{client.company || client.companyName || ''}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {(client.emails || [client.email].filter(Boolean)).slice(0, 2).map((email, index) => (
                        <div key={index} className={index > 0 ? "text-sm text-muted-foreground" : ""}>
                          {email}
                        </div>
                      ))}
                      {(client.emails || [client.email].filter(Boolean)).length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{(client.emails || [client.email].filter(Boolean)).length - 2} więcej
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{client.phone}</TableCell>
                  <TableCell>
                    {client.status ? (
                      <Badge variant={getStatusVariant(client.status)}>
                        {getStatusLabel(client.status)}
                      </Badge>
                    ) : (
                      <Badge variant="outline">Brak statusu</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(client.dateAdded || '').toLocaleDateString('pl-PL')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewClient(client)}
                        title="Podgląd"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditClient(client)}
                        title="Edytuj"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteClient(client.id)}
                        className="text-destructive hover:text-destructive"
                        title="Usuń"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Klienci</h1>
          <p className="text-muted-foreground">
            Zarządzaj bazą klientów podzieloną według statusu
          </p>
        </div>
        <Button onClick={onAddClient}>
          <UserPlus className="mr-2 h-4 w-4" />
          Dodaj Klienta
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Zarządzanie Klientami</CardTitle>
          <CardDescription>
            Przeglądaj i zarządzaj klientami podzielonymi według statusu
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Szukaj klientów..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nazwa">Sortuj po nazwie</SelectItem>
                <SelectItem value="firma">Sortuj po firmie</SelectItem>
                <SelectItem value="data">Sortuj po dacie</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs defaultValue="aktualni" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="aktualni" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Aktualni Klienci ({aktualniKlienci.length})
              </TabsTrigger>
              <TabsTrigger value="potencjalni" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Potencjalni Klienci ({potencjalniKlienci.length})
              </TabsTrigger>
              <TabsTrigger value="archiwalni" className="flex items-center gap-2">
                <Archive className="h-4 w-4" />
                Archiwalni Klienci ({archiwalniKlienci.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="aktualni" className="mt-6">
              <ClientTable 
                clients={aktualniKlienci}
                onViewClient={onViewClient}
                onEditClient={onEditClient}
                onDeleteClient={onDeleteClient}
                emptyMessage="Brak aktualnych klientów"
                searchTerm={searchTerm}
              />
            </TabsContent>

            <TabsContent value="potencjalni" className="mt-6">
              <ClientTable 
                clients={potencjalniKlienci}
                onViewClient={onViewClient}
                onEditClient={onEditClient}
                onDeleteClient={onDeleteClient}
                emptyMessage="Brak potencjalnych klientów"
                searchTerm={searchTerm}
              />
            </TabsContent>

            <TabsContent value="archiwalni" className="mt-6">
              <ClientTable 
                clients={archiwalniKlienci}
                onViewClient={onViewClient}
                onEditClient={onEditClient}
                onDeleteClient={onDeleteClient}
                emptyMessage="Brak archiwalnych klientów"
                searchTerm={searchTerm}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}