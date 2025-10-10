import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Switch } from "./ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calculator, 
  Users, 
  FileText, 
  Download, 
  Filter, 
  Bell, 
  Mail, 
  Calendar,
  Building2,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  Edit,
  Eye,
  Save,
  Target,
  BarChart3,
  PieChart,
  Settings,
  Timer,
  PlayCircle,
  StopCircle,
  Activity,
  Send,
  RefreshCw,
  Clipboard
} from "lucide-react";
import { Client } from "../types/client";
import { toast } from 'sonner';

interface MonthlyClientData {
  clientId: string;
  month: string;
  year: string;
  
  // Finansowe
  revenue: number;
  costs: number;
  tax: number;
  zusAmount: number;
  
  // Pracownicy - edytowalne pola
  employeesContract: number;
  employeesFulltime: number;
  
  // Dokumenty - uproszczone
  documentsReceived: number;
  documentsLimit: number; // próg ostrzeżenia (domyślnie 35)
  
  // Status z bardziej szczegółowym postępem
  documentStatus: 'dostarczone' | 'zweryfikowane' | 'zaksiegowane' | 'zakonczono';
  vatStatus: 'completed' | 'pending' | 'missing';
  zusStatus: 'completed' | 'pending' | 'overdue';
  taxStatus: 'completed' | 'pending' | 'review';
  
  // Terminy
  vatDeadline: string;
  zusDeadline: string;
  
  // Zaległości
  overdueDays: number;
  overdueAmount: number;
  
  lastUpdate: string;
  assignedEmployee: string;
  
  // Dodatkowe dane
  taxForm: string;
  vatPayer: boolean;
  notes: string;
  
  // Integracja z czasomierzem
  timeTracked: number; // minuty
  lastTimeEntry?: string;
  activeTimer?: boolean;
  
  // Nowe pola
  hrEmployee: string; // pracownik kadrowy (ID)
  accountingEmployee: string; // pracownik księgowy (ID)
  isVatPayer: boolean; // czy jest VATowcem
  primaryEmail: string; // główny email do klienta
  invoiceEmail: string; // email do faktur
  taxNotificationEmail: string; // email do informacji podatkowych
  declarations: Declaration[]; // lista deklaracji
}

interface Declaration {
  id: string;
  type: string;
  status: 'wyslana' | 'otrzymana' | 'weryfikowana' | 'zakonczona';
  dueDate: string;
  notes?: string;
}

interface ClientTimeSession {
  clientId: string;
  startTime: string;
  duration: number;
  description: string;
  category: string;
}

interface GlobalSettings {
  defaultEmployeeContract: number;
  defaultEmployeeFulltime: number;
  autoCalculateProgress: boolean;
  reminderDaysBefore: number[];
}

interface MonthlyDataPanelProps {
  clients: Client[];
}

export function MonthlyDataPanel({ clients }: MonthlyDataPanelProps) {
  const [selectedYear, setSelectedYear] = useState<string>("2025");
  const [selectedMonth, setSelectedMonth] = useState<string>("09");
  const [filterType, setFilterType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedView, setSelectedView] = useState<string>("overview");
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [activeSessions, setActiveSessions] = useState<ClientTimeSession[]>([]);
  
  // Nowe pola użytkowników do wyboru
  const [availableUsers] = useState([
    { id: '1', name: 'Anna Kowalska', role: 'kadrowa' },
    { id: '2', name: 'Tomasz Nowak', role: 'ksiegowa' },
    { id: '3', name: 'Maria Wiśniewska', role: 'kadrowa' },
    { id: '4', name: 'Piotr Zieliński', role: 'ksiegowa' }
  ]);

  // Mock data z uproszczonymi dokumentami - moved before useEffect
  const [monthlyData, setMonthlyData] = useState<MonthlyClientData[]>([
    {
      clientId: "1",
      month: "09",
      year: "2025",
      revenue: 25000,
      costs: 15000,
      tax: 1900,
      zusAmount: 3600,
      employeesContract: 3,
      employeesFulltime: 12,
      documentsReceived: 28,
      documentsLimit: 35,
      documentStatus: 'zweryfikowane',
      vatStatus: 'completed',
      zusStatus: 'pending',
      taxStatus: 'completed',
      vatDeadline: '2025-10-25',
      zusDeadline: '2025-10-15',
      overdueDays: 0,
      overdueAmount: 0,
      lastUpdate: '2025-09-20',
      assignedEmployee: 'Anna Kowalska',
      taxForm: 'skala',
      vatPayer: true,
      notes: '',
      timeTracked: 245, // 4h 5min
      lastTimeEntry: '2025-09-20T14:30:00Z',
      activeTimer: false,
      
      // Nowe pola
      hrEmployee: '1', // Anna Kowalska
      accountingEmployee: '2', // Tomasz Nowak
      isVatPayer: true,
      primaryEmail: 'kontakt@firma1.pl',
      invoiceEmail: 'faktury@firma1.pl',
      taxNotificationEmail: 'podatki@firma1.pl',
      declarations: [
        { id: '1', type: 'VAT-7', status: 'wyslana', dueDate: '2025-10-25' },
        { id: '2', type: 'PIT-4R', status: 'otrzymana', dueDate: '2025-10-30' }
      ]
    },
    {
      clientId: "2", 
      month: "09",
      year: "2025",
      revenue: 18000,
      costs: 12000,
      tax: 1140,
      zusAmount: 2400,
      employeesContract: 2,
      employeesFulltime: 6,
      documentsReceived: 38, // Przekracza limit
      documentsLimit: 35,
      documentStatus: 'dostarczone',
      vatStatus: 'pending',
      zusStatus: 'completed',
      taxStatus: 'pending',
      vatDeadline: '2025-10-25',
      zusDeadline: '2025-10-15',
      overdueDays: 5,
      overdueAmount: 2400,
      lastUpdate: '2025-09-18',
      assignedEmployee: 'Tomasz Nowak',
      taxForm: 'liniowy',
      vatPayer: true,
      notes: 'Brakuje faktury za wynajem',
      timeTracked: 180, // 3h
      lastTimeEntry: '2025-09-19T16:00:00Z',
      activeTimer: false,
      
      // Nowe pola
      hrEmployee: '3', // Maria Wiśniewska
      accountingEmployee: '4', // Piotr Zieliński
      isVatPayer: false,
      primaryEmail: 'biuro@firma2.pl',
      invoiceEmail: 'rachunki@firma2.pl',
      taxNotificationEmail: 'ksiegowosc@firma2.pl',
      declarations: [
        { id: '3', type: 'ZUS DRA', status: 'weryfikowana', dueDate: '2025-10-15' }
      ]
    }
  ]);

  // Dodaj useEffect na początku, aby załadować zapisane czasomierze
  useEffect(() => {
    const savedSessions = localStorage.getItem('monthlyTimer_activeSessions');
    const savedMonthlyData = localStorage.getItem('monthlyTimer_monthlyData');
    
    if (savedSessions) {
      try {
        const sessions = JSON.parse(savedSessions);
        setActiveSessions(sessions);
      } catch (error) {
        console.error('Error loading saved timer sessions:', error);
      }
    }
    
    if (savedMonthlyData) {
      try {
        const data = JSON.parse(savedMonthlyData);
        setMonthlyData(data);
      } catch (error) {
        console.error('Error loading saved monthly data:', error);
      }
    }
  }, []);

  // Zapisz czasomierze do localStorage przy każdej zmianie
  useEffect(() => {
    localStorage.setItem('monthlyTimer_activeSessions', JSON.stringify(activeSessions));
  }, [activeSessions]);

  useEffect(() => {
    localStorage.setItem('monthlyTimer_monthlyData', JSON.stringify(monthlyData));
  }, [monthlyData]);

  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({
    defaultEmployeeContract: 0,
    defaultEmployeeFulltime: 1,
    autoCalculateProgress: true,
    reminderDaysBefore: [7, 3, 1]
  });

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  
  const months = [
    { value: "01", label: "Styczeń" },
    { value: "02", label: "Luty" },
    { value: "03", label: "Marzec" },
    { value: "04", label: "Kwiecień" },
    { value: "05", label: "Maj" },
    { value: "06", label: "Czerwiec" },
    { value: "07", label: "Lipiec" },
    { value: "08", label: "Sierpień" },
    { value: "09", label: "Wrzesień" },
    { value: "10", label: "Październik" },
    { value: "11", label: "Listopad" },
    { value: "12", label: "Grudzień" }
  ];

  const currentData = monthlyData.filter(data => 
    data.month === selectedMonth && data.year === selectedYear
  );

  // Obliczenia agregatów
  const totals = useMemo(() => {
    return currentData.reduce((acc, data) => ({
      revenue: acc.revenue + data.revenue,
      costs: acc.costs + data.costs,
      tax: acc.tax + data.tax,
      zusAmount: acc.zusAmount + data.zusAmount,
      employeesTotal: acc.employeesTotal + data.employeesContract + data.employeesFulltime,
      documentsTotal: acc.documentsTotal + data.documentsReceived,
      timeTracked: acc.timeTracked + data.timeTracked
    }), {
      revenue: 0,
      costs: 0,
      tax: 0,
      zusAmount: 0,
      employeesTotal: 0,
      documentsTotal: 0,
      timeTracked: 0
    });
  }, [currentData]);

  // Filtrowanie danych
  const filteredData = useMemo(() => {
    let filtered = currentData;

    if (searchTerm) {
      filtered = filtered.filter(data => {
        const client = clients.find(c => c.id === data.clientId);
        return client?.companyName?.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    switch (filterType) {
      case 'overdue':
        filtered = filtered.filter(data => data.overdueDays > 0);
        break;
      case 'incomplete':
        filtered = filtered.filter(data => data.documentStatus !== 'zakonczono');
        break;
      case 'active-timers':
        filtered = filtered.filter(data => data.activeTimer);
        break;
      case 'high-time':
        filtered = filtered.filter(data => data.timeTracked > 300); // więcej niż 5h
        break;
      case 'pending-review':
        filtered = filtered.filter(data => data.documentStatus === 'dostarczone');
        break;
      case 'documents-overflow':
        filtered = filtered.filter(data => data.documentsReceived > data.documentsLimit);
        break;
    }

    return filtered;
  }, [currentData, searchTerm, filterType, clients]);

  // Obsługa edycji
  const handleUpdateClientData = (clientId: string, field: string, value: any) => {
    setMonthlyData(prev => 
      prev.map(data => 
        data.clientId === clientId && data.month === selectedMonth && data.year === selectedYear
          ? { ...data, [field]: value, lastUpdate: new Date().toISOString() }
          : data
      )
    );
  };

  // Obsługa statusu dokumentów
  const handleProgressUpdate = (clientId: string, newStatus: string) => {
    setMonthlyData(prev => 
      prev.map(data => 
        data.clientId === clientId && data.month === selectedMonth && data.year === selectedYear
          ? { 
            ...data, 
            documentStatus: newStatus as any,
            lastUpdate: new Date().toISOString()
          }
          : data
      )
    );
    
    toast.success(`Status zaktualizowany: ${newStatus}`);
  };

  // Obsługa czasomierza - automatyczne przełączanie między firmami
  const startTimer = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    // Sprawdź czy czasomierz dla tego klienta już działa
    const currentSession = activeSessions.find(s => s.clientId === clientId);
    if (currentSession) {
      toast.info(`Czasomierz dla ${client.companyName} już działa`);
      return;
    }

    // Zatrzymaj wszystkie aktywne czasomierze
    if (activeSessions.length > 0) {
      activeSessions.forEach(session => {
        const duration = Math.floor((new Date().getTime() - new Date(session.startTime).getTime()) / 60000);
        const prevClient = clients.find(c => c.id === session.clientId);
        
        // Zapisz czas dla poprzedniego klienta
        setMonthlyData(prev => 
          prev.map(data => 
            data.clientId === session.clientId && data.month === selectedMonth && data.year === selectedYear
              ? { 
                ...data, 
                activeTimer: false,
                timeTracked: data.timeTracked + duration,
                lastTimeEntry: new Date().toISOString()
              }
              : data
          )
        );

        if (prevClient && duration > 0) {
          toast.success(`Zatrzymano czasomierz dla ${prevClient.companyName} (${Math.floor(duration/60)}h ${duration%60}m)`);
        }
      });
    }

    // Uruchom nowy czasomierz
    const newSession: ClientTimeSession = {
      clientId,
      startTime: new Date().toISOString(),
      duration: 0,
      description: `Praca nad ${client.companyName} - ${selectedMonth}/${selectedYear}`,
      category: 'monthly-accounting'
    };

    setActiveSessions([newSession]); // Tylko jedna sesja
    
    setMonthlyData(prev => 
      prev.map(data => 
        data.clientId === clientId && data.month === selectedMonth && data.year === selectedYear
          ? { ...data, activeTimer: true }
          : { ...data, activeTimer: false } // Zatrzymaj wszystkie inne
      )
    );

    toast.success(`Czasomierz uruchomiony dla ${client.companyName}`);
  };

  const stopTimer = (clientId: string) => {
    const session = activeSessions.find(s => s.clientId === clientId);
    if (!session) return;

    const duration = Math.floor((new Date().getTime() - new Date(session.startTime).getTime()) / 60000);
    
    setMonthlyData(prev => 
      prev.map(data => 
        data.clientId === clientId && data.month === selectedMonth && data.year === selectedYear
          ? { 
            ...data, 
            activeTimer: false,
            timeTracked: data.timeTracked + duration,
            lastTimeEntry: new Date().toISOString()
          }
          : data
      )
    );

    setActiveSessions([]); // Wyczyść wszystkie sesje
    
    const client = clients.find(c => c.id === clientId);
    toast.success(`Czasomierz zatrzymany dla ${client?.companyName} (${Math.floor(duration/60)}h ${duration%60}m)`);
  };

  // Wysyłanie raportów
  const sendTaxReport = async (clientIds: string[], reportType: string) => {
    const selectedClients = currentData.filter(data => clientIds.includes(data.clientId));
    
    // Symulacja wysyłania
    setTimeout(() => {
      toast.success(`Raporty ${reportType} wysłane do ${selectedClients.length} klientów`);
    }, 1000);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      'dostarczone': <Badge variant="secondary">Dostarczone</Badge>,
      'zweryfikowane': <Badge variant="default" className="bg-blue-100 text-blue-800">Zweryfikowane</Badge>,
      'zaksiegowane': <Badge variant="default" className="bg-orange-100 text-orange-800">Zaksięgowane</Badge>,
      'zakonczono': <Badge variant="default" className="bg-green-100 text-green-800">Zakończono</Badge>,
      'completed': <Badge variant="default" className="bg-green-100 text-green-800">Gotowe</Badge>,
      'pending': <Badge variant="secondary">Oczekuje</Badge>,
      'overdue': <Badge variant="destructive">Przeterminowane</Badge>,
      'missing': <Badge variant="destructive">Brakuje</Badge>,
      'review': <Badge variant="outline">Sprawdzanie</Badge>
    };
    return badges[status] || <Badge variant="secondary">-</Badge>;
  };

  const copyToNextMonth = () => {
    const nextMonth = selectedMonth === "12" ? "01" : String(parseInt(selectedMonth) + 1).padStart(2, '0');
    const nextYear = selectedMonth === "12" ? String(parseInt(selectedYear) + 1) : selectedYear;
    
    const newData = currentData.map(data => ({
      ...data,
      month: nextMonth,
      year: nextYear,
      documentStatus: 'dostarczone' as const,
      documentsReceived: 0,
      timeTracked: 0,
      activeTimer: false,
      lastUpdate: new Date().toISOString(),
      notes: ''
    }));

    setMonthlyData(prev => [...prev, ...newData]);
    toast.success(`Dane skopiowane do ${nextMonth}/${nextYear}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Dane Miesięczne</h1>
          <p className="text-muted-foreground">
            Przegląd dokumentów i statusów dla klientów
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowQuickActions(true)}>
            <Activity className="h-4 w-4 mr-2" />
            Szybkie akcje
          </Button>
          <Button variant="outline" onClick={copyToNextMonth}>
            <Clipboard className="h-4 w-4 mr-2" />
            Kopiuj do następnego miesiąca
          </Button>
        </div>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Label>Rok:</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Label>Miesiąc:</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map(month => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Label>Filtruj:</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszyscy klienci</SelectItem>
                  <SelectItem value="incomplete">Niekompletne</SelectItem>
                  <SelectItem value="overdue">Z zaległościami</SelectItem>
                  <SelectItem value="active-timers">Aktywne czasomierze</SelectItem>
                  <SelectItem value="high-time">Dużo czasu (ponad 5h)</SelectItem>
                  <SelectItem value="pending-review">Do sprawdzenia</SelectItem>
                  <SelectItem value="documents-overflow">Przekraczające limit dokumentów</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Input
              placeholder="Szukaj klienta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-[200px]"
            />

            <Button variant="outline" className="ml-auto">
              <Download className="h-4 w-4 mr-2" />
              Eksport danych
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Przychody</p>
                <p className="text-xl font-medium">{totals.revenue.toLocaleString('pl-PL')} zł</p>
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Koszty</p>
                <p className="text-xl font-medium">{totals.costs.toLocaleString('pl-PL')} zł</p>
              </div>
              <TrendingDown className="h-5 w-5 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Podatek</p>
                <p className="text-xl font-medium">{totals.tax.toLocaleString('pl-PL')} zł</p>
              </div>
              <Calculator className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ZUS</p>
                <p className="text-xl font-medium">{totals.zusAmount.toLocaleString('pl-PL')} zł</p>
              </div>
              <CreditCard className="h-5 w-5 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pracownicy</p>
                <p className="text-xl font-medium">{totals.employeesTotal}</p>
              </div>
              <Users className="h-5 w-5 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Dokumenty</p>
                <p className="text-xl font-medium">{totals.documentsTotal}</p>
              </div>
              <FileText className="h-5 w-5 text-teal-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
              </CardTitle>
              <CardDescription>
                {filteredData.length} z {currentData.length} klientów
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Send className="h-4 w-4 mr-2" />
                    Wyślij raporty
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Wyślij raporty podatkowe</DialogTitle>
                    <DialogDescription>
                      Wybierz typ raportu do wysłania klientom
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Typ raportu</Label>
                      <Select defaultValue="vat">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vat">Rozliczenie VAT</SelectItem>
                          <SelectItem value="pit">Rozliczenie PIT</SelectItem>
                          <SelectItem value="zus">Składki ZUS</SelectItem>
                          <SelectItem value="full">Pełny raport</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Dodatkowe notatki</Label>
                      <Textarea placeholder="Opcjonalne uwagi do raportu..." />
                    </div>
                    <Button className="w-full" onClick={() => {
                      sendTaxReport(filteredData.map(d => d.clientId), 'VAT');
                      toast.success("Raporty zostały wysłane");
                    }}>
                      Wyślij do {filteredData.length} klientów
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Klient</TableHead>
                <TableHead>Dokumenty</TableHead>
                <TableHead>Deklaracje</TableHead>
                <TableHead>Pracownicy ZL</TableHead>
                <TableHead>Pracownicy UoP</TableHead>
                <TableHead>Status dokumentów</TableHead>
                <TableHead>Czas pracy</TableHead>
                <TableHead>Akcje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((data) => {
                const client = clients.find(c => c.id === data.clientId);
                const isEditing = editingClientId === data.clientId;
                const hrUser = availableUsers.find(u => u.id === data.hrEmployee);
                const accountingUser = availableUsers.find(u => u.id === data.accountingEmployee);
                const isOverLimit = data.documentsReceived > data.documentsLimit;
                
                return (
                  <TableRow key={data.clientId}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{client?.companyName || `Klient ${data.clientId}`}</p>
                        <div className="text-xs text-muted-foreground space-y-1">
                          {data.isVatPayer && <Badge variant="outline" className="text-xs">VAT</Badge>}
                          <div>HR: {hrUser?.name || 'Nie przypisany'}</div>
                          <div>Księgowa: {accountingUser?.name || 'Nie przypisany'}</div>
                        </div>
                        {data.overdueDays > 0 && (
                          <p className="text-sm text-red-500">
                            Zaległość: {data.overdueDays} dni
                          </p>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {isEditing ? (
                        <div className="space-y-2">
                          <Input
                            type="number"
                            value={data.documentsReceived}
                            onChange={(e) => handleUpdateClientData(data.clientId, 'documentsReceived', parseInt(e.target.value) || 0)}
                            className={`w-20 ${isOverLimit ? 'border-red-500 bg-red-50' : ''}`}
                          />
                          <div className="text-xs text-muted-foreground">
                            dokumentów
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className={`text-sm font-medium ${isOverLimit ? 'text-red-600' : ''}`}>
                            {data.documentsReceived}
                          </div>
                          {isOverLimit && (
                            <Badge variant="destructive" className="text-xs">
                              Przekracza o {data.documentsReceived - data.documentsLimit}
                            </Badge>
                          )}
                          <div className="text-xs text-muted-foreground">
                            dokumentów (limit: {data.documentsLimit})
                          </div>
                        </div>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">
                          {data.declarations.length} deklaracji
                        </div>
                        {data.declarations.map(decl => (
                          <div key={decl.id} className="flex items-center gap-1">
                            <Badge variant="outline" className="text-xs">
                              {decl.type}
                            </Badge>
                            {decl.status === 'wyslana' && <CheckCircle className="h-3 w-3 text-green-500" />}
                            {decl.status === 'otrzymana' && <AlertCircle className="h-3 w-3 text-orange-500" />}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={data.employeesContract}
                          onChange={(e) => handleUpdateClientData(data.clientId, 'employeesContract', parseInt(e.target.value) || 0)}
                          className="w-16"
                        />
                      ) : (
                        <span>{data.employeesContract}</span>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={data.employeesFulltime}
                          onChange={(e) => handleUpdateClientData(data.clientId, 'employeesFulltime', parseInt(e.target.value) || 0)}
                          className="w-16"
                        />
                      ) : (
                        <span>{data.employeesFulltime}</span>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        {getStatusBadge(data.documentStatus)}
                        <div className="text-xs text-muted-foreground">
                          {data.lastUpdate ? new Date(data.lastUpdate).toLocaleDateString('pl-PL') : '-'}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm font-mono">
                          {formatTime(data.timeTracked)}
                        </div>
                        {data.activeTimer && (
                          <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                            <Timer className="h-3 w-3 mr-1" />
                            Aktywny
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {isEditing ? (
                          <Button
                            size="sm"
                            onClick={() => setEditingClientId(null)}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingClientId(data.clientId)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {data.activeTimer ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => stopTimer(data.clientId)}
                          >
                            <StopCircle className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startTimer(data.clientId)}
                            disabled={activeSessions.length > 0}
                          >
                            <PlayCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {filteredData.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Brak danych</h3>
            <p className="text-muted-foreground mb-4">
              Nie znaleziono danych dla wybranych kryteriów filtrowania
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}