import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { Switch } from "./ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { 
  FileText, 
  Plus, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Download, 
  Upload, 
  Edit, 
  Eye, 
  Bell, 
  RefreshCw,
  User,
  Building2,
  DollarSign,
  Filter,
  Search,
  MoreHorizontal,
  Copy,
  Send
} from "lucide-react";
import { toast } from 'sonner';

interface Contract {
  id: string;
  title: string;
  type: 'service' | 'employment' | 'cooperation' | 'maintenance' | 'lease' | 'other';
  clientId?: string;
  clientName?: string;
  contractNumber: string;
  signDate: string;
  startDate: string;
  endDate: string;
  value: number;
  currency: string;
  status: 'draft' | 'active' | 'expired' | 'terminated' | 'renewal_needed';
  autoRenewal: boolean;
  renewalPeriod: number; // months
  reminderDays: number;
  description: string;
  attachments: string[];
  createdBy: string;
  lastModified: string;
  nextReminderDate?: string;
  renewalTerms?: string;
}

interface ContractTemplate {
  id: string;
  name: string;
  type: string;
  content: string;
  variables: string[];
  isActive: boolean;
  createdBy: string;
  lastUsed?: string;
}

export function ContractManagement() {
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddContract, setShowAddContract] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<ContractTemplate | null>(null);

  // Mock data
  const [contracts, setContracts] = useState<Contract[]>([
    {
      id: '1',
      title: 'Umowa o świadczenie usług księgowych - Tech Solutions',
      type: 'service',
      clientId: '1',
      clientName: 'Tech Solutions Sp. z o.o.',
      contractNumber: 'UMW/2024/001',
      signDate: '2024-01-15',
      startDate: '2024-02-01',
      endDate: '2025-01-31',
      value: 18000,
      currency: 'PLN',
      status: 'active',
      autoRenewal: true,
      renewalPeriod: 12,
      reminderDays: 30,
      description: 'Kompleksowa obsługa księgowa spółki z o.o. - pełne księgi rachunkowe, VAT, CIT',
      attachments: ['umowa_podpisana.pdf', 'aneks_1.pdf'],
      createdBy: 'Anna Nowak',
      lastModified: '2024-11-15',
      nextReminderDate: '2025-01-01',
      renewalTerms: 'Automatyczne przedłużenie na kolejny rok'
    },
    {
      id: '2',
      title: 'Umowa o pracę - Maria Kowalczyk',
      type: 'employment',
      clientName: 'Maria Kowalczyk',
      contractNumber: 'UOP/2024/003',
      signDate: '2024-03-01',
      startDate: '2024-03-15',
      endDate: '2025-03-14',
      value: 72000,
      currency: 'PLN',
      status: 'active',
      autoRenewal: false,
      renewalPeriod: 12,
      reminderDays: 60,
      description: 'Umowa o pracę na stanowisku księgowa',
      attachments: ['umowa_o_prace.pdf', 'regulamin_pracy.pdf'],
      createdBy: 'Jan Kowalski',
      lastModified: '2024-10-20',
      nextReminderDate: '2025-01-14'
    },
    {
      id: '3',
      title: 'Umowa najmu biura',
      type: 'lease',
      clientName: 'Biuro Center Sp. z o.o.',
      contractNumber: 'NAJ/2024/007',
      signDate: '2024-01-01',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      value: 48000,
      currency: 'PLN',
      status: 'renewal_needed',
      autoRenewal: false,
      renewalPeriod: 12,
      reminderDays: 60,
      description: 'Najem powierzchni biurowej 120m2',
      attachments: ['umowa_najmu.pdf'],
      createdBy: 'Jan Kowalski',
      lastModified: '2024-12-01',
      nextReminderDate: '2024-11-01'
    },
    {
      id: '4',
      title: 'Umowa serwisowa - System IT',
      type: 'maintenance',
      clientName: 'IT Solutions Sp. z o.o.',
      contractNumber: 'SER/2024/012',
      signDate: '2024-06-01',
      startDate: '2024-06-01',
      endDate: '2025-05-31',
      value: 12000,
      currency: 'PLN',
      status: 'active',
      autoRenewal: true,
      renewalPeriod: 12,
      reminderDays: 30,
      description: 'Serwis i wsparcie techniczne systemów IT',
      attachments: ['umowa_serwisowa.pdf', 'SLA.pdf'],
      createdBy: 'Tomasz Nowak',
      lastModified: '2024-09-15',
      nextReminderDate: '2025-05-01'
    }
  ]);

  const [templates] = useState<ContractTemplate[]>([
    {
      id: '1',
      name: 'Umowa o świadczenie usług księgowych - Sp. z o.o.',
      type: 'service',
      content: `UMOWA O ŚWIADCZENIE USŁUG KSIĘGOWYCH

Zawarta w dniu {{DATA_ZAWARCIA}} między:

{{NAZWA_FIRMY}}
{{ADRES_FIRMY}}
NIP: {{NIP_FIRMY}}
zwaną dalej "Zleceniodawcą"

a

{{NAZWA_KANCELARII}}
{{ADRES_KANCELARII}}
NIP: {{NIP_KANCELARII}}
zwaną dalej "Zleceniobiorcą"

§1. Przedmiot umowy
1. Zleceniobiorca zobowiązuje się do prowadzenia księgowości Zleceniodawcy w zakresie:
   - prowadzenie pełnych ksiąg rachunkowych
   - sporządzanie deklaracji VAT
   - sporządzanie sprawozdań finansowych
   - {{DODATKOWE_USLUGI}}

§2. Wynagrodzenie
1. Wynagrodzenie miesięczne wynosi: {{WYNAGRODZENIE_MIESIĘCZNE}} PLN netto
2. Płatność do {{TERMIN_PLATNOSCI}} dnia każdego miesiąca

§3. Okres obowiązywania
Umowa zawarta na czas od {{DATA_ROZPOCZECIA}} do {{DATA_ZAKONCZENIA}}`,
      variables: ['DATA_ZAWARCIA', 'NAZWA_FIRMY', 'ADRES_FIRMY', 'NIP_FIRMY', 'NAZWA_KANCELARII', 'ADRES_KANCELARII', 'NIP_KANCELARII', 'DODATKOWE_USLUGI', 'WYNAGRODZENIE_MIESIĘCZNE', 'TERMIN_PLATNOSCI', 'DATA_ROZPOCZECIA', 'DATA_ZAKONCZENIA'],
      isActive: true,
      createdBy: 'Anna Nowak',
      lastUsed: '2024-12-01'
    },
    {
      id: '2',
      name: 'Umowa o świadczenie usług księgowych - JDG',
      type: 'service',
      content: `UMOWA O ŚWIADCZENIE USŁUG KSIĘGOWYCH
(Jednoosobowa Działalność Gospodarcza)

Zawarta w dniu {{DATA_ZAWARCIA}} między:

{{IMIE_NAZWISKO}}
prowadzący działalność gospodarczą pod nazwą: {{NAZWA_DZIALALNOSCI}}
NIP: {{NIP}}
zwanym dalej "Zleceniodawcą"

a

{{NAZWA_KANCELARII}}
{{ADRES_KANCELARII}}
NIP: {{NIP_KANCELARII}}
zwaną dalej "Zleceniobiorcą"

§1. Przedmiot umowy
1. Zleceniobiorca zobowiązuje się do:
   - prowadzenia księgi przychodów i rozchodów
   - sporządzania deklaracji VAT
   - obliczania i rozliczania składek ZUS
   - {{FORMA_OPODATKOWANIA}}

§2. Wynagrodzenie miesięczne: {{WYNAGRODZENIE}} PLN netto`,
      variables: ['DATA_ZAWARCIA', 'IMIE_NAZWISKO', 'NAZWA_DZIALALNOSCI', 'NIP', 'NAZWA_KANCELARII', 'ADRES_KANCELARII', 'NIP_KANCELARII', 'FORMA_OPODATKOWANIA', 'WYNAGRODZENIE'],
      isActive: true,
      createdBy: 'Anna Nowak',
      lastUsed: '2024-11-28'
    },
    {
      id: '3',
      name: 'Umowa o pracę - księgowa',
      type: 'employment',
      content: `UMOWA O PRACĘ

Zawarta w dniu {{DATA_ZAWARCIA}} między:

{{NAZWA_PRACODAWCY}}
{{ADRES_PRACODAWCY}}
NIP: {{NIP_PRACODAWCY}}
zwanym dalej "Pracodawcą"

a

{{IMIE_NAZWISKO_PRACOWNIKA}}
{{ADRES_PRACOWNIKA}}
PESEL: {{PESEL_PRACOWNIKA}}
zwanym dalej "Pracownikiem"

§1. Strony ustalają następujące warunki pracy:
1. Rodzaj umowy: umowa o pracę na czas {{RODZAJ_UMOWY}}
2. Stanowisko: {{STANOWISKO}}
3. Miejsce pracy: {{MIEJSCE_PRACY}}
4. Wymiar czasu pracy: {{WYMIAR_CZASU_PRACY}} godz./tydzień
5. Data rozpoczęcia pracy: {{DATA_ROZPOCZECIA}}

§2. Wynagrodzenie
1. Wynagrodzenie zasadnicze: {{WYNAGRODZENIE}} PLN brutto
2. Wypłata wynagrodzenia: {{TERMIN_WYPLATY}} każdego miesiąca`,
      variables: ['DATA_ZAWARCIA', 'NAZWA_PRACODAWCY', 'ADRES_PRACODAWCY', 'NIP_PRACODAWCY', 'IMIE_NAZWISKO_PRACOWNIKA', 'ADRES_PRACOWNIKA', 'PESEL_PRACOWNIKA', 'RODZAJ_UMOWY', 'STANOWISKO', 'MIEJSCE_PRACY', 'WYMIAR_CZASU_PRACY', 'DATA_ROZPOCZECIA', 'WYNAGRODZENIE', 'TERMIN_WYPLATY'],
      isActive: true,
      createdBy: 'Jan Kowalski',
      lastUsed: '2024-11-15'
    }
  ]);

  const filteredContracts = contracts.filter(contract => {
    const matchesType = selectedType === 'all' || contract.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || contract.status === selectedStatus;
    const matchesSearch = !searchTerm || 
      contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.contractNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Aktywna</Badge>;
      case 'draft':
        return <Badge variant="secondary">Projekt</Badge>;
      case 'expired':
        return <Badge variant="outline">Wygasła</Badge>;
      case 'terminated':
        return <Badge variant="destructive">Rozwiązana</Badge>;
      case 'renewal_needed':
        return <Badge variant="default" className="bg-orange-100 text-orange-800">Wymaga przedłużenia</Badge>;
      default:
        return <Badge variant="secondary">-</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      'service': 'Usługowa',
      'employment': 'O pracę',
      'cooperation': 'Współpracy',
      'maintenance': 'Serwisowa',
      'lease': 'Najmu',
      'other': 'Inna'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const upcomingRenewals = contracts.filter(contract => {
    if (!contract.nextReminderDate) return false;
    const reminderDate = new Date(contract.nextReminderDate);
    const today = new Date();
    const daysDiff = Math.ceil((reminderDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return daysDiff <= 30 && daysDiff >= 0;
  });

  const handleCreateFromTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      toast.success(`Tworzenie umowy z szablonu: ${template.name}`);
      setShowAddContract(true);
    }
  };

  const handleSendReminder = (contractId: string) => {
    toast.success("Przypomnienie zostało wysłane");
  };

  const handleRenewContract = (contractId: string) => {
    setContracts(prev => 
      prev.map(contract => 
        contract.id === contractId 
          ? { 
              ...contract, 
              status: 'active' as const,
              endDate: new Date(new Date(contract.endDate).setFullYear(new Date(contract.endDate).getFullYear() + 1)).toISOString().split('T')[0]
            }
          : contract
      )
    );
    toast.success("Umowa została przedłużona");
  };

  const totalValue = contracts
    .filter(c => c.status === 'active')
    .reduce((sum, c) => sum + c.value, 0);

  const expiringContracts = contracts.filter(contract => {
    const endDate = new Date(contract.endDate);
    const today = new Date();
    const daysDiff = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return daysDiff <= 60 && daysDiff > 0;
  }).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Zarządzanie Kontraktami</h1>
          <p className="text-muted-foreground">
            Zarządzaj umowami, terminami i automatycznymi przypomnieniami
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowTemplates(true)}>
            <FileText className="h-4 w-4 mr-2" />
            Szablony
          </Button>
          <Button onClick={() => {
            setShowAddContract(true);
            toast.info("Formularz dodawania nowej umowy");
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Nowa umowa
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktywne umowy</p>
                <p className="text-2xl">{contracts.filter(c => c.status === 'active').length}</p>
              </div>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Wygasają w 60 dni</p>
                <p className="text-2xl">{expiringContracts}</p>
              </div>
              <Clock className="h-5 w-5 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Wymaga przedłużenia</p>
                <p className="text-2xl">{contracts.filter(c => c.status === 'renewal_needed').length}</p>
              </div>
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Łączna wartość</p>
                <p className="text-2xl">{totalValue.toLocaleString('pl-PL')} zł</p>
              </div>
              <DollarSign className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Renewals Alert */}
      {upcomingRenewals.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Bell className="h-5 w-5" />
              Nadchodzące przedłużenia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingRenewals.map(contract => (
                <div key={contract.id} className="flex items-center justify-between p-2 bg-white rounded border">
                  <div>
                    <p className="font-medium text-sm">{contract.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Przypomnienie: {contract.nextReminderDate ? new Date(contract.nextReminderDate).toLocaleDateString('pl-PL') : '-'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleSendReminder(contract.id)}>
                      <Send className="h-4 w-4" />
                    </Button>
                    {contract.status === 'renewal_needed' && (
                      <Button size="sm" onClick={() => handleRenewContract(contract.id)}>
                        Przedłuż
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="contracts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="contracts">Umowy</TabsTrigger>
          <TabsTrigger value="calendar">Kalendarz terminów</TabsTrigger>
          <TabsTrigger value="reports">Raporty</TabsTrigger>
        </TabsList>

        <TabsContent value="contracts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Lista umów</CardTitle>
                  <CardDescription>
                    Wszystkie umowy w systemie
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Typ umowy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Wszystkie</SelectItem>
                      <SelectItem value="service">Usługowe</SelectItem>
                      <SelectItem value="employment">O pracę</SelectItem>
                      <SelectItem value="maintenance">Serwisowe</SelectItem>
                      <SelectItem value="lease">Najmu</SelectItem>
                      <SelectItem value="cooperation">Współpracy</SelectItem>
                      <SelectItem value="other">Inne</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Wszystkie</SelectItem>
                      <SelectItem value="active">Aktywne</SelectItem>
                      <SelectItem value="draft">Projekty</SelectItem>
                      <SelectItem value="renewal_needed">Wymaga przedłużenia</SelectItem>
                      <SelectItem value="expired">Wygasłe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <Input
                  placeholder="Szukaj umów..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Umowa</TableHead>
                    <TableHead>Typ</TableHead>
                    <TableHead>Klient/Strona</TableHead>
                    <TableHead>Okres obowiązywania</TableHead>
                    <TableHead>Wartość</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{contract.title}</p>
                          <p className="text-xs text-muted-foreground">{contract.contractNumber}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getTypeLabel(contract.type)}</Badge>
                      </TableCell>
                      <TableCell>{contract.clientName}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{new Date(contract.startDate).toLocaleDateString('pl-PL')}</p>
                          <p className="text-muted-foreground">
                            do {new Date(contract.endDate).toLocaleDateString('pl-PL')}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {contract.value.toLocaleString('pl-PL')} {contract.currency}
                      </TableCell>
                      <TableCell>{getStatusBadge(contract.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedContract(contract)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              toast.info(`Edycja umowy: ${contract.title}`);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              toast.success(`Pobieranie umowy: ${contract.contractNumber}.pdf`);
                            }}
                          >
                            <Download className="h-4 w-4" />
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

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Kalendarz terminów</CardTitle>
              <CardDescription>
                Przegląd ważnych dat związanych z umowami
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contracts
                  .filter(c => c.status === 'active' || c.status === 'renewal_needed')
                  .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
                  .map((contract) => {
                    const endDate = new Date(contract.endDate);
                    const today = new Date();
                    const daysDiff = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
                    
                    return (
                      <div key={contract.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <Calendar className="h-8 w-8 text-blue-500" />
                          <div>
                            <p className="font-medium">{contract.title}</p>
                            <p className="text-sm text-muted-foreground">
                              Wygasa: {endDate.toLocaleDateString('pl-PL')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {daysDiff > 0 ? `Za ${daysDiff} dni` : `${Math.abs(daysDiff)} dni temu`}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {contract.autoRenewal && (
                            <Badge variant="secondary">Auto-przedłużenie</Badge>
                          )}
                          {daysDiff <= 30 && daysDiff > 0 && (
                            <Badge variant="default" className="bg-orange-100 text-orange-800">
                              Wkrótce wygasa
                            </Badge>
                          )}
                          {daysDiff <= 0 && (
                            <Badge variant="destructive">Wygasła</Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Podział według typu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['service', 'employment', 'maintenance', 'lease', 'cooperation'].map(type => {
                    const count = contracts.filter(c => c.type === type).length;
                    const percentage = contracts.length > 0 ? (count / contracts.length) * 100 : 0;
                    
                    return (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-sm">{getTypeLabel(type)}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Wartość umów według statusu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['active', 'renewal_needed', 'expired'].map(status => {
                    const statusContracts = contracts.filter(c => c.status === status);
                    const value = statusContracts.reduce((sum, c) => sum + c.value, 0);
                    
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{status.replace('_', ' ')}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {value.toLocaleString('pl-PL')} zł
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({statusContracts.length})
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Templates Dialog */}
      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Szablony umów</DialogTitle>
            <DialogDescription>
              Zarządzaj szablonami umów i twórz nowe dokumenty
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {templates.map((template) => (
              <div key={template.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{template.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Typ: {getTypeLabel(template.type)} • 
                      Ostatnio użyty: {template.lastUsed ? new Date(template.lastUsed).toLocaleDateString('pl-PL') : 'Nigdy'}
                    </p>
                    <div className="flex gap-1 mt-2">
                      {template.variables.map(variable => (
                        <Badge key={variable} variant="outline" className="text-xs">
                          {variable}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewTemplate(template)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Podgląd
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCreateFromTemplate(template.id)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Użyj szablonu
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        toast.info(`Edycja szablonu: ${template.name}`);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Contract Details Dialog */}
      <Dialog open={!!selectedContract} onOpenChange={() => setSelectedContract(null)}>
        <DialogContent className="max-w-3xl">
          {selectedContract && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedContract.title}</DialogTitle>
                <DialogDescription>
                  {selectedContract.contractNumber} • {getStatusBadge(selectedContract.status)}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Klient/Strona</Label>
                    <p className="text-sm">{selectedContract.clientName}</p>
                  </div>
                  <div>
                    <Label>Typ umowy</Label>
                    <p className="text-sm">{getTypeLabel(selectedContract.type)}</p>
                  </div>
                  <div>
                    <Label>Data podpisania</Label>
                    <p className="text-sm">{new Date(selectedContract.signDate).toLocaleDateString('pl-PL')}</p>
                  </div>
                  <div>
                    <Label>Okres obowiązywania</Label>
                    <p className="text-sm">
                      {new Date(selectedContract.startDate).toLocaleDateString('pl-PL')} - 
                      {new Date(selectedContract.endDate).toLocaleDateString('pl-PL')}
                    </p>
                  </div>
                  <div>
                    <Label>Wartość</Label>
                    <p className="text-sm">{selectedContract.value.toLocaleString('pl-PL')} {selectedContract.currency}</p>
                  </div>
                  <div>
                    <Label>Auto-przedłużenie</Label>
                    <p className="text-sm">{selectedContract.autoRenewal ? 'Tak' : 'Nie'}</p>
                  </div>
                </div>
                
                <div>
                  <Label>Opis</Label>
                  <p className="text-sm mt-1">{selectedContract.description}</p>
                </div>
                
                {selectedContract.attachments.length > 0 && (
                  <div>
                    <Label>Załączniki</Label>
                    <div className="space-y-2 mt-1">
                      {selectedContract.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">{attachment}</span>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              toast.success(`Pobieranie załącznika: ${attachment}`);
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      toast.info(`Edycja umowy: ${selectedContract.title}`);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edytuj
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      toast.success(`Pobieranie umowy: ${selectedContract.contractNumber}.pdf`);
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Pobierz
                  </Button>
                  {selectedContract.status === 'renewal_needed' && (
                    <Button onClick={() => handleRenewContract(selectedContract.id)}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Przedłuż
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Template Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Podgląd szablonu: {previewTemplate?.name}</DialogTitle>
            <DialogDescription>
              Szablon umowy z dostępnymi zmiennymi
            </DialogDescription>
          </DialogHeader>
          
          {previewTemplate && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Template Content */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Treść szablonu</h4>
                    <div className="p-4 bg-gray-50 rounded-lg border max-h-96 overflow-y-auto">
                      <pre className="text-sm whitespace-pre-wrap font-mono">
                        {previewTemplate.content}
                      </pre>
                    </div>
                  </div>
                </div>
                
                {/* Available Variables */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Dostępne zmienne</h4>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {previewTemplate.variables.map((variable) => (
                        <div key={variable} className="p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                          <code className="text-sm font-mono text-blue-800">
                            {`{{${variable}}}`}
                          </code>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <h4 className="font-medium mb-2">Informacje o szablonie</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Typ: {getTypeLabel(previewTemplate.type)}</p>
                      <p>Utworzony przez: {previewTemplate.createdBy}</p>
                      <p>Ostatnio użyty: {previewTemplate.lastUsed ? new Date(previewTemplate.lastUsed).toLocaleDateString('pl-PL') : 'Nigdy'}</p>
                      <p>Status: {previewTemplate.isActive ? 'Aktywny' : 'Nieaktywny'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
                  Zamknij
                </Button>
                <Button onClick={() => {
                  handleCreateFromTemplate(previewTemplate.id);
                  setPreviewTemplate(null);
                }}>
                  <Copy className="h-4 w-4 mr-2" />
                  Użyj szablonu
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}