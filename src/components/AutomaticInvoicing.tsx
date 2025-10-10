import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Calendar, CalendarDays, Plus, Play, Settings, FileText, AlertCircle, CheckCircle, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { Client } from "../types/client";

interface AutomaticInvoicingProps {
  clients: Client[];
}

export function AutomaticInvoicing({ clients }: AutomaticInvoicingProps) {
  // Filter clients that have automatic invoicing enabled
  const clientsWithAutoInvoicing = clients.filter(client => client.autoInvoicing?.enabled);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const getNextInvoiceDate = (client: Client) => {
    if (!client.autoInvoicing?.nextInvoiceDate) {
      return 'Nie ustawiono';
    }
    return new Date(client.autoInvoicing.nextInvoiceDate).toLocaleDateString('pl-PL');
  };

  const getFrequencyLabel = (frequency: string) => {
    const labels = {
      'weekly': 'Co tydzień',
      'monthly': 'Co miesiąc', 
      'quarterly': 'Co kwartał',
      'yearly': 'Co rok'
    };
    return labels[frequency as keyof typeof labels] || frequency;
  };

  const getClientDisplayName = (client: Client) => {
    return client.companyName || client.company || `${client.firstName} ${client.lastName}`;
  };

  const handleToggleActive = (client: Client) => {
    // In a real app, this would update the client's autoInvoicing settings
    toast.success(`Automatyczne fakturowanie ${client.autoInvoicing?.enabled ? 'wyłączone' : 'włączone'} dla ${getClientDisplayName(client)}`);
  };

  const handleEditSettings = (client: Client) => {
    setSelectedClient(client);
    setIsEditing(true);
  };

  const handleGenerateInvoice = (client: Client) => {
    if (!client.autoInvoicing) return;
    
    toast.success(`Generowanie faktury dla ${getClientDisplayName(client)}...`);
    // In a real app, this would trigger invoice generation
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Automatyczne Fakturowanie</h1>
          <p className="text-muted-foreground">
            Przegląd i zarządzanie automatycznym fakturowaniem klientów
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Ustawienia globalne
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktywne reguły</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientsWithAutoInvoicing.length}</div>
            <p className="text-xs text-muted-foreground">
              z {clients.length} klientów
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Następne faktury</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clientsWithAutoInvoicing.filter(c => {
                const nextDate = c.autoInvoicing?.nextInvoiceDate;
                if (!nextDate) return false;
                const daysDiff = Math.ceil((new Date(nextDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                return daysDiff <= 7;
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              w tym tygodniu
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Miesięczny przychód</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clientsWithAutoInvoicing
                .filter(c => c.autoInvoicing?.frequency === 'monthly')
                .reduce((sum, c) => sum + (c.autoInvoicing?.amount || 0), 0)
                .toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł
            </div>
            <p className="text-xs text-muted-foreground">
              faktury miesięczne
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Przekroczenia limitów</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              aktualnie
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Auto-Invoicing Rules */}
      {clientsWithAutoInvoicing.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Aktywne automatyczne fakturowanie</CardTitle>
            <CardDescription>
              Klienci z włączonym automatycznym fakturowaniem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {clientsWithAutoInvoicing.map((client) => (
                <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{getClientDisplayName(client)}</h3>
                      <Badge variant="outline" className="text-green-700 border-green-200">
                        {getFrequencyLabel(client.autoInvoicing?.frequency || 'monthly')}
                      </Badge>
                      {client.autoInvoicing?.documentsLimitWarning && (
                        <Badge variant="secondary" className="text-xs">
                          Limit: {client.autoInvoicing.documentsLimit} dok.
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {client.autoInvoicing?.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="text-muted-foreground">
                        <strong>Kwota:</strong> {client.autoInvoicing?.amount?.toFixed(2)} zł netto
                      </span>
                      <span className="text-muted-foreground">
                        <strong>Następna:</strong> {getNextInvoiceDate(client)}
                      </span>
                      <span className="text-muted-foreground">
                        <strong>Płatność:</strong> {client.autoInvoicing?.paymentTerms} dni
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleGenerateInvoice(client)}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Generuj teraz
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditSettings(client)}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Edytuj
                    </Button>
                    <Switch
                      checked={client.autoInvoicing?.enabled || false}
                      onCheckedChange={() => handleToggleActive(client)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clients Without Auto-Invoicing */}
      <Card>
        <CardHeader>
          <CardTitle>Klienci bez automatycznego fakturowania</CardTitle>
          <CardDescription>
            Klienci, dla których można skonfigurować automatyczne fakturowanie
          </CardDescription>
        </CardHeader>
        <CardContent>
          {clients.filter(client => !client.autoInvoicing?.enabled).length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Wszyscy klienci mają skonfigurowane automatyczne fakturowanie
            </p>
          ) : (
            <div className="space-y-3">
              {clients
                .filter(client => !client.autoInvoicing?.enabled)
                .slice(0, 5) // Show only first 5
                .map((client) => (
                  <div key={client.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                    <div>
                      <h4 className="font-medium">{getClientDisplayName(client)}</h4>
                      <p className="text-sm text-muted-foreground">
                        Status: {client.status} • Dodano: {new Date(client.dateAdded).toLocaleDateString('pl-PL')}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditSettings(client)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Skonfiguruj
                    </Button>
                  </div>
                ))}
              {clients.filter(client => !client.autoInvoicing?.enabled).length > 5 && (
                <p className="text-sm text-muted-foreground text-center pt-2">
                  i {clients.filter(client => !client.autoInvoicing?.enabled).length - 5} więcej...
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Invoices Calendar */}
      {clientsWithAutoInvoicing.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Nadchodzące faktury
            </CardTitle>
            <CardDescription>
              Harmonogram automatycznego generowania faktur w najbliższych 30 dniach
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {clientsWithAutoInvoicing
                .filter(client => {
                  const nextDate = client.autoInvoicing?.nextInvoiceDate;
                  if (!nextDate) return false;
                  const daysDiff = Math.ceil((new Date(nextDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  return daysDiff <= 30 && daysDiff >= 0;
                })
                .sort((a, b) => {
                  const dateA = new Date(a.autoInvoicing?.nextInvoiceDate || '').getTime();
                  const dateB = new Date(b.autoInvoicing?.nextInvoiceDate || '').getTime();
                  return dateA - dateB;
                })
                .map((client) => (
                  <div key={client.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                    <div className="flex-shrink-0 w-12 text-center">
                      <div className="text-lg font-bold">
                        {new Date(client.autoInvoicing?.nextInvoiceDate || '').getDate()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(client.autoInvoicing?.nextInvoiceDate || '').toLocaleDateString('pl-PL', { month: 'short' })}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{getClientDisplayName(client)}</div>
                      <div className="text-sm text-muted-foreground">
                        {client.autoInvoicing?.amount?.toFixed(2)} zł • {client.autoInvoicing?.description}
                      </div>
                    </div>
                    <Badge variant="outline">
                      {getFrequencyLabel(client.autoInvoicing?.frequency || 'monthly')}
                    </Badge>
                  </div>
                ))}
              {clientsWithAutoInvoicing.filter(client => {
                const nextDate = client.autoInvoicing?.nextInvoiceDate;
                if (!nextDate) return false;
                const daysDiff = Math.ceil((new Date(nextDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                return daysDiff <= 30 && daysDiff >= 0;
              }).length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  Brak zaplanowanych faktur w najbliższych 30 dniach
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Client Auto-Invoicing Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Ustawienia automatycznego fakturowania - {selectedClient && getClientDisplayName(selectedClient)}
            </DialogTitle>
            <DialogDescription>
              Skonfiguruj automatyczne generowanie faktur dla tego klienta.
              Te ustawienia można również edytować w profilu klienta.
            </DialogDescription>
          </DialogHeader>
          
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Przekierowanie do formularza edycji klienta...
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              W pełnej implementacji tutaj byłby formularz edycji ustawień automatycznego fakturowania
            </p>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Anuluj
            </Button>
            <Button onClick={() => {
              toast.success('Ustawienia zostały zapisane');
              setIsEditing(false);
            }}>
              Zapisz zmiany
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}