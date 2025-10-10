import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Switch } from "./ui/switch";
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Send, 
  Eye, 
  Edit, 
  Trash2,
  Calculator,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Euro,
  Percent,
  RotateCcw
} from "lucide-react";
import { Client, Invoice, InvoiceItem } from "../types/client";
import { toast } from 'sonner';
import { PDFInvoiceGenerator, availableTemplates } from "../utils/pdfGenerator";
import { usePermissions } from "../contexts/PermissionContext";

interface ServiceItem {
  id: string;
  name: string;
  description: string;
  category: 'księgowość' | 'kadry' | 'podatki' | 'inne';
  basePrice: number;
  priceType: 'fixed' | 'per_document' | 'per_hour' | 'per_month';
  minDocuments?: number;
  maxDocuments?: number;
  priceBreaks?: PriceBreak[];
  isActive: boolean;
}

interface PriceBreak {
  fromQuantity: number;
  toQuantity?: number;
  price: number;
}

interface RecurringInvoice {
  id: string;
  clientId: string;
  serviceId: string;
  frequency: 'miesięcznie' | 'kwartalnie' | 'rocznie';
  nextInvoiceDate: string;
  amount: number;
  isActive: boolean;
  createdAt: string;
}

interface PaymentReminder {
  id: string;
  invoiceId: string;
  type: 'before' | 'after';
  daysBefore?: number;
  daysAfter?: number;
  emailTemplate: string;
  isActive: boolean;
  lastSent?: string;
}

interface EnhancedInvoiceManagerProps {
  clients: Client[];
}

export function EnhancedInvoiceManager({ clients }: EnhancedInvoiceManagerProps) {
  const { hasPermission } = usePermissions();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [recurringInvoices, setRecurringInvoices] = useState<RecurringInvoice[]>([]);
  const [paymentReminders, setPaymentReminders] = useState<PaymentReminder[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [activeTab, setActiveTab] = useState('invoices');
  const [isNewInvoiceDialogOpen, setIsNewInvoiceDialogOpen] = useState(false);
  const [isNewServiceDialogOpen, setIsNewServiceDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState('standard');

  // Check permissions
  const canRead = hasPermission('invoices', 'read');
  const canWrite = hasPermission('invoices', 'write');
  const canDelete = hasPermission('invoices', 'delete');
  const isAdmin = hasPermission('invoices', 'admin');

  // If user doesn't have read permission, show access denied
  if (!canRead) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Brak dostępu</h2>
            <p className="text-muted-foreground">
              Nie masz uprawnień do przeglądania faktur. Skontaktuj się z administratorem.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mock data initialization
  useEffect(() => {
    const mockServices: ServiceItem[] = [
      {
        id: '1',
        name: 'Pełna księgowość',
        description: 'Prowadzenie pełnej księgowości dla spółek',
        category: 'księgowość',
        basePrice: 800,
        priceType: 'per_month',
        isActive: true
      },
      {
        id: '2',
        name: 'Księga przychodów i rozchodów',
        description: 'Prowadzenie KPiR dla JDG',
        category: 'księgowość',
        basePrice: 300,
        priceType: 'per_month',
        isActive: true
      },
      {
        id: '3',
        name: 'Przetwarzanie dokumentu księgowego',
        description: 'Jednostkowe przetworzenie dokumentu',
        category: 'księgowość',
        basePrice: 3,
        priceType: 'per_document',
        priceBreaks: [
          { fromQuantity: 1, toQuantity: 50, price: 3 },
          { fromQuantity: 51, toQuantity: 100, price: 2.5 },
          { fromQuantity: 101, price: 2 }
        ],
        isActive: true
      },
      {
        id: '4',
        name: 'Sporządzenie deklaracji VAT',
        description: 'Miesięczna deklaracja VAT-7',
        category: 'podatki',
        basePrice: 50,
        priceType: 'fixed',
        isActive: true
      },
      {
        id: '5',
        name: 'Usługi kadrowe - pracownik',
        description: 'Obsługa kadrowa na jednego pracownika',
        category: 'kadry',
        basePrice: 40,
        priceType: 'per_month',
        isActive: true
      }
    ];

    const mockInvoices: Invoice[] = [
      {
        id: '1',
        number: 'FV/2024/001',
        clientId: clients[0]?.id || '1',
        issueDate: '2024-12-01',
        dueDate: '2024-12-15',
        items: [
          {
            id: '1',
            description: 'Pełna księgowość - grudzień 2024',
            quantity: 1,
            unitPrice: 800,
            taxRate: 23,
            netAmount: 800,
            taxAmount: 184,
            grossAmount: 984
          }
        ],
        totalNet: 800,
        totalTax: 184,
        totalGross: 984,
        status: 'wyslana'
      }
    ];

    const mockRecurring: RecurringInvoice[] = [
      {
        id: '1',
        clientId: clients[0]?.id || '1',
        serviceId: '1',
        frequency: 'miesięcznie',
        nextInvoiceDate: '2025-01-01',
        amount: 984,
        isActive: true,
        createdAt: '2024-12-01'
      }
    ];

    const mockReminders: PaymentReminder[] = [
      {
        id: '1',
        invoiceId: '1',
        type: 'before',
        daysBefore: 3,
        emailTemplate: 'reminder_before',
        isActive: true
      }
    ];

    setServices(mockServices);
    setInvoices(mockInvoices);
    setRecurringInvoices(mockRecurring);
    setPaymentReminders(mockReminders);
  }, [clients]);

  const [newInvoice, setNewInvoice] = useState({
    clientId: '',
    items: [{ serviceId: '', quantity: 1, customPrice: null as number | null }]
  });

  const [newService, setNewService] = useState<Partial<ServiceItem>>({
    name: '',
    description: '',
    category: 'księgowość',
    basePrice: 0,
    priceType: 'fixed',
    isActive: true
  });

  const [invoicePreview, setInvoicePreview] = useState<Invoice | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const calculateItemPrice = (serviceId: string, quantity: number, customPrice: number | null) => {
    if (customPrice !== null) return customPrice;
    
    const service = services.find(s => s.id === serviceId);
    if (!service) return 0;

    if (service.priceType === 'per_document' && service.priceBreaks) {
      const priceBreak = service.priceBreaks.find(pb => 
        quantity >= pb.fromQuantity && (!pb.toQuantity || quantity <= pb.toQuantity)
      );
      return priceBreak?.price || service.basePrice;
    }

    return service.basePrice;
  };

  const calculateInvoiceTotal = () => {
    let totalNet = 0;
    
    newInvoice.items.forEach(item => {
      const unitPrice = calculateItemPrice(item.serviceId, item.quantity, item.customPrice);
      totalNet += unitPrice * item.quantity;
    });

    const totalTax = totalNet * 0.23;
    const totalGross = totalNet + totalTax;

    return { totalNet, totalTax, totalGross };
  };

  const handleCreateInvoice = () => {
    if (!newInvoice.clientId || newInvoice.items.some(item => !item.serviceId)) {
      toast.error("Wybierz klienta i dodaj co najmniej jedną usługę");
      return;
    }

    const { totalNet, totalTax, totalGross } = calculateInvoiceTotal();
    
    const invoiceItems: InvoiceItem[] = newInvoice.items.map((item, index) => {
      const service = services.find(s => s.id === item.serviceId);
      const unitPrice = calculateItemPrice(item.serviceId, item.quantity, item.customPrice);
      const netAmount = unitPrice * item.quantity;
      const taxAmount = netAmount * 0.23;
      const grossAmount = netAmount + taxAmount;

      return {
        id: (index + 1).toString(),
        description: service?.name || 'Nieznana usługa',
        quantity: item.quantity,
        unitPrice,
        taxRate: 23,
        netAmount,
        taxAmount,
        grossAmount
      };
    });

    const invoice: Invoice = {
      id: Date.now().toString(),
      number: `FV/2024/${String(invoices.length + 1).padStart(3, '0')}`,
      clientId: newInvoice.clientId,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: invoiceItems,
      totalNet,
      totalTax,
      totalGross,
      status: 'utworzona'
    };

    setInvoices(prev => [...prev, invoice]);
    setIsNewInvoiceDialogOpen(false);
    setNewInvoice({
      clientId: '',
      items: [{ serviceId: '', quantity: 1, customPrice: null }]
    });
    toast.success("Faktura została utworzona");
  };

  const handleCreateService = () => {
    if (!newService.name || !newService.basePrice) {
      toast.error("Wprowadź nazwę i cenę usługi");
      return;
    }

    const service: ServiceItem = {
      id: Date.now().toString(),
      name: newService.name!,
      description: newService.description || '',
      category: newService.category!,
      basePrice: newService.basePrice!,
      priceType: newService.priceType!,
      isActive: true
    };

    setServices(prev => [...prev, service]);
    setIsNewServiceDialogOpen(false);
    setNewService({
      name: '',
      description: '',
      category: 'księgowość',
      basePrice: 0,
      priceType: 'fixed',
      isActive: true
    });
    toast.success("Usługa została dodana do cennika");
  };

  const addInvoiceItem = () => {
    setNewInvoice(prev => ({
      ...prev,
      items: [...prev.items, { serviceId: '', quantity: 1, customPrice: null }]
    }));
  };

  const removeInvoiceItem = (index: number) => {
    setNewInvoice(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateInvoiceItem = (index: number, field: string, value: any) => {
    setNewInvoice(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const getStatusIcon = (status: Invoice['status']) => {
    switch (status) {
      case 'utworzona':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'wyslana':
        return <Send className="h-4 w-4 text-blue-500" />;
      case 'zaplacona':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'przeterminowana':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: Invoice['status']) => {
    const labels = {
      'utworzona': 'Utworzona',
      'wyslana': 'Wysłana',
      'zaplacona': 'Zapłacona',
      'przeterminowana': 'Przeterminowana'
    };
    return labels[status];
  };

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? `${client.firstName} ${client.lastName}` : 'Nieznany klient';
  };

  const getServiceName = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    return service?.name || 'Nieznana usługa';
  };

  const filteredInvoices = invoices.filter(invoice => {
    const client = clients.find(c => c.id === invoice.clientId);
    const clientName = client ? `${client.firstName} ${client.lastName}` : '';
    const matchesSearch = invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handlePreviewInvoice = (invoice: Invoice) => {
    setInvoicePreview(invoice);
    setIsPreviewOpen(true);
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    try {
      const client = clients.find(c => c.id === invoice.clientId);
      if (!client) {
        toast.error('Nie znaleziono danych klienta');
        return;
      }

      const pdfGenerator = new PDFInvoiceGenerator();
      pdfGenerator.generateInvoice(invoice, client, selectedTemplate);
      toast.success('Faktura PDF została pobrana');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Błąd podczas generowania faktury PDF');
    }
  };

  const handleSendInvoice = (invoice: Invoice) => {
    // Symulacja wysyłania faktury
    toast.success(`Faktura ${invoice.number} została wysłana do klienta`);
    
    // Aktualizacja statusu faktury
    setInvoices(prev => prev.map(inv => 
      inv.id === invoice.id ? { ...inv, status: 'wyslana' } : inv
    ));
  };

  const { totalNet, totalTax, totalGross } = calculateInvoiceTotal();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Zarządzanie Fakturami</h1>
          <p className="text-muted-foreground">
            Wystawianie faktur, cennik usług i automatyczne fakturowanie
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canWrite && (
            <Dialog open={isNewServiceDialogOpen} onOpenChange={setIsNewServiceDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Euro className="mr-2 h-4 w-4" />
                  Dodaj usługę
                </Button>
              </DialogTrigger>
            </Dialog>
          )}
          {canWrite && (
            <Dialog open={isNewInvoiceDialogOpen} onOpenChange={setIsNewInvoiceDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nowa faktura
                </Button>
              </DialogTrigger>
            </Dialog>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="invoices">Faktury</TabsTrigger>
          <TabsTrigger value="services">Cennik</TabsTrigger>
          <TabsTrigger value="recurring">Automatyczne</TabsTrigger>
          <TabsTrigger value="reminders">Przypomnienia</TabsTrigger>
        </TabsList>

        {/* Faktury Tab */}
        <TabsContent value="invoices" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Szukaj faktur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie</SelectItem>
                <SelectItem value="utworzona">Utworzone</SelectItem>
                <SelectItem value="wyslana">Wysłane</SelectItem>
                <SelectItem value="zaplacona">Zapłacone</SelectItem>
                <SelectItem value="przeterminowana">Przeterminowane</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Label className="text-sm">Szablon PDF:</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numer</TableHead>
                    <TableHead>Klient</TableHead>
                    <TableHead>Data wystawienia</TableHead>
                    <TableHead>Termin płatności</TableHead>
                    <TableHead>Kwota brutto</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.number}</TableCell>
                      <TableCell>{getClientName(invoice.clientId)}</TableCell>
                      <TableCell>{new Date(invoice.issueDate).toLocaleDateString('pl-PL')}</TableCell>
                      <TableCell>{new Date(invoice.dueDate).toLocaleDateString('pl-PL')}</TableCell>
                      <TableCell>{invoice.totalGross.toFixed(2)} zł</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(invoice.status)}
                          <span>{getStatusLabel(invoice.status)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-1 justify-end">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handlePreviewInvoice(invoice)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDownloadInvoice(invoice)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          {canWrite && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleSendInvoice(invoice)}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                          {canWrite && (
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cennik Tab */}
        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cennik usług</CardTitle>
              <CardDescription>
                Zarządzaj cenami usług księgowych i kadrowych
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.map((service) => (
                  <div key={service.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{service.name}</h3>
                          <Badge variant="outline">{service.category}</Badge>
                          {!service.isActive && <Badge variant="destructive">Nieaktywne</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span>Cena: {service.basePrice.toFixed(2)} zł</span>
                          <span>Typ: {service.priceType === 'fixed' ? 'Stała' : 
                                     service.priceType === 'per_document' ? 'Za dokument' :
                                     service.priceType === 'per_hour' ? 'Za godzinę' : 'Miesięcznie'}</span>
                        </div>
                        {service.priceBreaks && service.priceBreaks.length > 0 && (
                          <div className="text-sm">
                            <span className="font-medium">Progi cenowe:</span>
                            {service.priceBreaks.map((pb, index) => (
                              <div key={index} className="ml-2">
                                {pb.fromQuantity}-{pb.toQuantity || '∞'}: {pb.price.toFixed(2)} zł
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Switch checked={service.isActive} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Automatyczne fakturowanie Tab */}
        <TabsContent value="recurring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automatyczne fakturowanie</CardTitle>
              <CardDescription>
                Zarządzaj cyklicznymi fakturami dla stałych klientów
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recurringInvoices.map((recurring) => (
                  <div key={recurring.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{getClientName(recurring.clientId)}</h3>
                          <Badge>{recurring.frequency}</Badge>
                          {!recurring.isActive && <Badge variant="destructive">Nieaktywne</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Usługa: {getServiceName(recurring.serviceId)}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span>Kwota: {recurring.amount.toFixed(2)} zł</span>
                          <span>Następna faktura: {new Date(recurring.nextInvoiceDate).toLocaleDateString('pl-PL')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Switch checked={recurring.isActive} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Przypomnienia Tab */}
        <TabsContent value="reminders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Przypomnienia o płatnościach</CardTitle>
              <CardDescription>
                Konfiguruj automatyczne przypomnienia dla klientów
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentReminders.map((reminder) => (
                  <div key={reminder.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">
                            Faktura {invoices.find(i => i.id === reminder.invoiceId)?.number}
                          </h3>
                          <Badge variant={reminder.type === 'before' ? 'default' : 'destructive'}>
                            {reminder.type === 'before' ? 'Przed terminem' : 'Po terminie'}
                          </Badge>
                          {!reminder.isActive && <Badge variant="outline">Nieaktywne</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {reminder.type === 'before' 
                            ? `Wyślij ${reminder.daysBefore} dni przed terminem`
                            : `Wyślij ${reminder.daysAfter} dni po terminie`
                          }
                        </p>
                        {reminder.lastSent && (
                          <p className="text-xs text-muted-foreground">
                            Ostatnio wysłane: {new Date(reminder.lastSent).toLocaleDateString('pl-PL')}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Send className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Switch checked={reminder.isActive} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog nowej faktury */}
      <Dialog open={isNewInvoiceDialogOpen} onOpenChange={setIsNewInvoiceDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Nowa faktura</DialogTitle>
            <DialogDescription>
              Utwórz nową fakturę dla klienta
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Klient *</Label>
              <Select
                value={newInvoice.clientId}
                onValueChange={(value) => setNewInvoice(prev => ({ ...prev, clientId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz klienta..." />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.firstName} {client.lastName} - {client.company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Pozycje faktury</Label>
                <Button onClick={addInvoiceItem} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Dodaj pozycję
                </Button>
              </div>
              
              {newInvoice.items.map((item, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Pozycja {index + 1}</h4>
                    {newInvoice.items.length > 1 && (
                      <Button onClick={() => removeInvoiceItem(index)} variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Usługa</Label>
                      <Select
                        value={item.serviceId}
                        onValueChange={(value) => updateInvoiceItem(index, 'serviceId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Wybierz usługę..." />
                        </SelectTrigger>
                        <SelectContent>
                          {services.filter(s => s.isActive).map((service) => (
                            <SelectItem key={service.id} value={service.id}>
                              {service.name} - {service.basePrice.toFixed(2)} zł
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Ilość</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateInvoiceItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Cena niestandardowa</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.customPrice || ''}
                        onChange={(e) => updateInvoiceItem(index, 'customPrice', e.target.value ? parseFloat(e.target.value) : null)}
                        placeholder="Domyślna z cennika"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-sm">Netto: {totalNet.toFixed(2)} zł</p>
                  <p className="text-sm">VAT (23%): {totalTax.toFixed(2)} zł</p>
                  <p className="font-medium">Brutto: {totalGross.toFixed(2)} zł</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsNewInvoiceDialogOpen(false)}>
                    Anuluj
                  </Button>
                  <Button onClick={handleCreateInvoice}>
                    Utwórz fakturę
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog nowej usługi */}
      <Dialog open={isNewServiceDialogOpen} onOpenChange={setIsNewServiceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dodaj usługę do cennika</DialogTitle>
            <DialogDescription>
              Wprowadź szczegóły nowej usługi
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="serviceName">Nazwa usługi *</Label>
              <Input
                id="serviceName"
                value={newService.name || ''}
                onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
                placeholder="np. Pełna księgowość"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceDescription">Opis</Label>
              <Textarea
                id="serviceDescription"
                value={newService.description || ''}
                onChange={(e) => setNewService(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Szczegółowy opis usługi"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kategoria</Label>
                <Select
                  value={newService.category}
                  onValueChange={(value: any) => setNewService(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="księgowość">Księgowość</SelectItem>
                    <SelectItem value="kadry">Kadry</SelectItem>
                    <SelectItem value="podatki">Podatki</SelectItem>
                    <SelectItem value="inne">Inne</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Typ ceny</Label>
                <Select
                  value={newService.priceType}
                  onValueChange={(value: any) => setNewService(prev => ({ ...prev, priceType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Stała</SelectItem>
                    <SelectItem value="per_document">Za dokument</SelectItem>
                    <SelectItem value="per_hour">Za godzinę</SelectItem>
                    <SelectItem value="per_month">Miesięcznie</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="basePrice">Cena bazowa (zł) *</Label>
              <Input
                id="basePrice"
                type="number"
                step="0.01"
                value={newService.basePrice || ''}
                onChange={(e) => setNewService(prev => ({ ...prev, basePrice: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsNewServiceDialogOpen(false)}>
                Anuluj
              </Button>
              <Button onClick={handleCreateService}>
                Dodaj usługę
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog podglądu faktury */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Podgląd faktury</DialogTitle>
            <DialogDescription>
              Szczegóły faktury
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Klient</Label>
              <p className="text-sm text-muted-foreground">{getClientName(invoicePreview?.clientId || '')}</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Pozycje faktury</Label>
              </div>
              
              {invoicePreview?.items.map((item, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Pozycja {index + 1}</h4>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Usługa</Label>
                      <p className="text-sm text-muted-foreground">{getServiceName(item.serviceId || '')}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Ilość</Label>
                      <p className="text-sm text-muted-foreground">{item.quantity}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Cena</Label>
                      <p className="text-sm text-muted-foreground">{item.unitPrice.toFixed(2)} zł</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-sm">Netto: {invoicePreview?.totalNet.toFixed(2)} zł</p>
                  <p className="text-sm">VAT (23%): {invoicePreview?.totalTax.toFixed(2)} zł</p>
                  <p className="font-medium">Brutto: {invoicePreview?.totalGross.toFixed(2)} zł</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
                    Zamknij
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}