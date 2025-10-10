import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { 
  BarChart3, 
  Clock, 
  Calendar, 
  User, 
  Download, 
  Filter, 
  Search,
  TrendingUp,
  TrendingDown,
  Timer,
  UserCheck,
  FileSpreadsheet,
  Activity,
  Target,
  Award,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { Client, User as UserType } from "../types/client";
import { toast } from 'sonner';

interface WorkTimeEntry {
  id: string;
  clientId: string;
  employeeId: string;
  month: string;
  year: string;
  totalMinutes: number;
  entries: TimeEntry[];
  hourlyRate?: number;
  totalCost?: number;
  status: 'aktywny' | 'zatwierdzony' | 'rozliczony';
  notes?: string;
}

interface TimeEntry {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // minuty
  description: string;
  category: 'ksiegowosc' | 'kadry' | 'podatki' | 'konsultacje' | 'administracja' | 'inne';
  isBreakDeducted: boolean;
}

interface EmployeeStats {
  employeeId: string;
  totalHours: number;
  clientsCount: number;
  avgHoursPerClient: number;
  efficiency: number;
  topCategory: string;
}

interface WorkTimeReportProps {
  currentUser: UserType;
  clients: Client[];
  users: UserType[];
}

export function WorkTimeReport({ currentUser, clients = [], users = [] }: WorkTimeReportProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>("09");
  const [selectedYear, setSelectedYear] = useState<string>("2025");
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  const [selectedClient, setSelectedClient] = useState<string>("all");
  const [viewType, setViewType] = useState<string>("summary");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data z przykładowymi wpisami
  const [workTimeData, setWorkTimeData] = useState<WorkTimeEntry[]>([
    {
      id: '1',
      clientId: '1',
      employeeId: '1',
      month: '09',
      year: '2025',
      totalMinutes: 2450, // 40h 50min
      entries: [
        {
          id: '1-1',
          date: '2025-09-01',
          startTime: '09:00',
          endTime: '17:00',
          duration: 480, // 8h
          description: 'Księgowanie faktur, rozliczenie VAT',
          category: 'ksiegowosc',
          isBreakDeducted: true
        },
        {
          id: '1-2',
          date: '2025-09-02',
          startTime: '10:00',
          endTime: '15:00',
          duration: 300, // 5h
          description: 'Przygotowanie deklaracji podatkowych',
          category: 'podatki',
          isBreakDeducted: true
        }
      ],
      hourlyRate: 80,
      totalCost: 3266.67,
      status: 'aktywny',
      notes: 'Standardowa obsługa miesięczna'
    },
    {
      id: '2',
      clientId: '2',
      employeeId: '2',
      month: '09',
      year: '2025',
      totalMinutes: 1800, // 30h
      entries: [
        {
          id: '2-1',
          date: '2025-09-05',
          startTime: '08:00',
          endTime: '16:00',
          duration: 480, // 8h
          description: 'Obsługa kadrowa, umowy o pracę',
          category: 'kadry',
          isBreakDeducted: true
        }
      ],
      hourlyRate: 75,
      totalCost: 2250,
      status: 'zatwierdzony',
      notes: 'Obsługa kadrowa - zatrudnienie nowych pracowników'
    }
  ]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => currentYear - 1 + i);
  
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

  // Filtrowanie danych
  const filteredData = useMemo(() => {
    return workTimeData.filter(entry => {
      const matchesMonth = entry.month === selectedMonth;
      const matchesYear = entry.year === selectedYear;
      const matchesEmployee = selectedEmployee === 'all' || entry.employeeId === selectedEmployee;
      const matchesClient = selectedClient === 'all' || entry.clientId === selectedClient;
      
      if (searchTerm) {
        const client = clients.find(c => c.id === entry.clientId);
        const employee = users.find(u => u.id === entry.employeeId);
        const searchMatch = 
          client?.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employee?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employee?.lastName.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesMonth && matchesYear && matchesEmployee && matchesClient && searchMatch;
      }
      
      return matchesMonth && matchesYear && matchesEmployee && matchesClient;
    });
  }, [workTimeData, selectedMonth, selectedYear, selectedEmployee, selectedClient, searchTerm, clients, users]);

  // Statystyki
  const stats = useMemo(() => {
    const totalMinutes = filteredData.reduce((sum, entry) => sum + entry.totalMinutes, 0);
    const totalCost = filteredData.reduce((sum, entry) => sum + (entry.totalCost || 0), 0);
    const uniqueClients = new Set(filteredData.map(entry => entry.clientId)).size;
    const uniqueEmployees = new Set(filteredData.map(entry => entry.employeeId)).size;

    return {
      totalHours: Math.floor(totalMinutes / 60),
      totalMinutes: totalMinutes % 60,
      totalCost,
      uniqueClients,
      uniqueEmployees,
      avgHoursPerClient: uniqueClients > 0 ? totalMinutes / 60 / uniqueClients : 0
    };
  }, [filteredData]);

  // Statystyki pracowników
  const employeeStats = useMemo(() => {
    const statsMap = new Map<string, EmployeeStats>();
    
    filteredData.forEach(entry => {
      if (!statsMap.has(entry.employeeId)) {
        statsMap.set(entry.employeeId, {
          employeeId: entry.employeeId,
          totalHours: 0,
          clientsCount: 0,
          avgHoursPerClient: 0,
          efficiency: 0,
          topCategory: ''
        });
      }
      
      const stat = statsMap.get(entry.employeeId)!;
      stat.totalHours += entry.totalMinutes / 60;
      
      // Zliczanie kategorii dla top category
      const categories = new Map<string, number>();
      entry.entries.forEach(timeEntry => {
        categories.set(timeEntry.category, (categories.get(timeEntry.category) || 0) + timeEntry.duration);
      });
      
      // Znajdź najczęstszą kategorię
      let maxDuration = 0;
      let topCat = '';
      categories.forEach((duration, category) => {
        if (duration > maxDuration) {
          maxDuration = duration;
          topCat = category;
        }
      });
      stat.topCategory = topCat;
    });

    // Oblicz unikalne klienty dla każdego pracownika
    statsMap.forEach((stat, employeeId) => {
      const clientsForEmployee = new Set(
        filteredData.filter(entry => entry.employeeId === employeeId).map(entry => entry.clientId)
      ).size;
      stat.clientsCount = clientsForEmployee;
      stat.avgHoursPerClient = clientsForEmployee > 0 ? stat.totalHours / clientsForEmployee : 0;
      stat.efficiency = stat.totalHours > 0 ? (stat.clientsCount / stat.totalHours) * 100 : 0;
    });

    return Array.from(statsMap.values());
  }, [filteredData]);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.companyName || `Klient ${clientId}`;
  };

  const getEmployeeName = (employeeId: string) => {
    const user = users.find(u => u.id === employeeId);
    return user ? `${user.firstName} ${user.lastName}` : `Pracownik ${employeeId}`;
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      'ksiegowosc': 'Księgowość',
      'kadry': 'Kadry',
      'podatki': 'Podatki',
      'konsultacje': 'Konsultacje',
      'administracja': 'Administracja',
      'inne': 'Inne'
    };
    return labels[category] || category;
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      'aktywny': <Badge variant="secondary">Aktywny</Badge>,
      'zatwierdzony': <Badge variant="default" className="bg-blue-100 text-blue-800">Zatwierdzony</Badge>,
      'rozliczony': <Badge variant="default" className="bg-green-100 text-green-800">Rozliczony</Badge>
    };
    return badges[status] || <Badge variant="secondary">-</Badge>;
  };

  const exportData = () => {
    // Symulacja eksportu danych
    const csvData = filteredData.map(entry => ({
      Klient: getClientName(entry.clientId),
      Pracownik: getEmployeeName(entry.employeeId),
      Miesiąc: `${selectedMonth}/${selectedYear}`,
      'Czas (h)': (entry.totalMinutes / 60).toFixed(2),
      'Stawka (zł/h)': entry.hourlyRate || 0,
      'Koszt (zł)': entry.totalCost?.toFixed(2) || '0.00',
      Status: entry.status
    }));
    
    console.log('Eksport danych:', csvData);
    toast.success(`Wyeksportowano ${csvData.length} rekordów`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Raport Czasu Pracy</h1>
          <p className="text-muted-foreground">
            Analiza czasu pracy i efektywności zespołu dla klientów
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportData}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Eksportuj raport
          </Button>
        </div>
      </div>

      {/* Filters */}
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
              <Label>Pracownik:</Label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszyscy</SelectItem>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Label>Klient:</Label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszyscy</SelectItem>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.companyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Input
              placeholder="Szukaj..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-[200px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Łączny czas</p>
                <p className="text-xl font-medium">{stats.totalHours}h {stats.totalMinutes}m</p>
              </div>
              <Clock className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Łączny koszt</p>
                <p className="text-xl font-medium">{stats.totalCost.toLocaleString('pl-PL')} zł</p>
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Klienci</p>
                <p className="text-xl font-medium">{stats.uniqueClients}</p>
              </div>
              <User className="h-5 w-5 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pracownicy</p>
                <p className="text-xl font-medium">{stats.uniqueEmployees}</p>
              </div>
              <UserCheck className="h-5 w-5 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Śr. h/klient</p>
                <p className="text-xl font-medium">{stats.avgHoursPerClient.toFixed(1)}h</p>
              </div>
              <Target className="h-5 w-5 text-teal-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={viewType} onValueChange={setViewType} className="space-y-6">
        <TabsList>
          <TabsTrigger value="summary">Podsumowanie</TabsTrigger>
          <TabsTrigger value="detailed">Szczegóły</TabsTrigger>
          <TabsTrigger value="employees">Pracownicy</TabsTrigger>
          <TabsTrigger value="analytics">Analityka</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle>Podsumowanie czasu pracy - {months.find(m => m.value === selectedMonth)?.label} {selectedYear}</CardTitle>
              <CardDescription>
                Przegląd czasu pracy w podziale na klientów i pracowników
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Klient</TableHead>
                    <TableHead>Pracownik</TableHead>
                    <TableHead>Czas pracy</TableHead>
                    <TableHead>Stawka</TableHead>
                    <TableHead>Koszt</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{getClientName(entry.clientId)}</p>
                          <p className="text-sm text-muted-foreground">
                            {entry.entries.length} sesji pracy
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-muted-foreground" />
                          {getEmployeeName(entry.employeeId)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {formatTime(entry.totalMinutes)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {entry.hourlyRate ? `${entry.hourlyRate} zł/h` : '-'}
                      </TableCell>
                      <TableCell className="font-medium">
                        {entry.totalCost ? `${entry.totalCost.toLocaleString('pl-PL')} zł` : '-'}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(entry.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detailed">
          <Card>
            <CardHeader>
              <CardTitle>Szczegółowy czas pracy</CardTitle>
              <CardDescription>
                Dokładny podział sesji pracy z opisami
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {filteredData.map((entry) => (
                  <div key={entry.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-medium">{getClientName(entry.clientId)}</h3>
                        <p className="text-sm text-muted-foreground">
                          {getEmployeeName(entry.employeeId)} • {formatTime(entry.totalMinutes)}
                        </p>
                      </div>
                      {getStatusBadge(entry.status)}
                    </div>
                    
                    <div className="space-y-2">
                      {entry.entries.map((timeEntry) => (
                        <div key={timeEntry.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{timeEntry.date}</span>
                              <span className="text-sm text-muted-foreground">
                                {timeEntry.startTime} - {timeEntry.endTime}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {getCategoryLabel(timeEntry.category)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{timeEntry.description}</p>
                          </div>
                          <div className="text-sm font-medium">
                            {formatTime(timeEntry.duration)}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {entry.notes && (
                      <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
                        <strong>Notatki:</strong> {entry.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees">
          <Card>
            <CardHeader>
              <CardTitle>Statystyki pracowników</CardTitle>
              <CardDescription>
                Analiza efektywności i wydajności zespołu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pracownik</TableHead>
                    <TableHead>Czas pracy</TableHead>
                    <TableHead>Liczba klientów</TableHead>
                    <TableHead>Śr. h/klient</TableHead>
                    <TableHead>Top kategoria</TableHead>
                    <TableHead>Efektywność</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employeeStats.map((stat) => (
                    <TableRow key={stat.employeeId}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-muted-foreground" />
                          {getEmployeeName(stat.employeeId)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {stat.totalHours.toFixed(1)}h
                        </div>
                      </TableCell>
                      <TableCell>{stat.clientsCount}</TableCell>
                      <TableCell>{stat.avgHoursPerClient.toFixed(1)}h</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getCategoryLabel(stat.topCategory)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={Math.min(stat.efficiency, 100)} className="w-[60px]" />
                          <span className="text-sm">{stat.efficiency.toFixed(0)}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Rozkład kategorii pracy</CardTitle>
                <CardDescription>
                  Na czym zespół spędza najwięcej czasu
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['ksiegowosc', 'kadry', 'podatki', 'konsultacje', 'administracja', 'inne'].map(category => {
                    const totalForCategory = filteredData.reduce((sum, entry) => {
                      return sum + entry.entries
                        .filter(e => e.category === category)
                        .reduce((entrySum, e) => entrySum + e.duration, 0);
                    }, 0);
                    
                    const percentage = stats.totalHours > 0 ? (totalForCategory / 60) / stats.totalHours * 100 : 0;
                    
                    return (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-sm">{getCategoryLabel(category)}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={percentage} className="w-[100px]" />
                          <span className="text-sm w-12">{percentage.toFixed(0)}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top klienci</CardTitle>
                <CardDescription>
                  Klienci wymagający najwięcej czasu
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from(new Set(filteredData.map(entry => entry.clientId)))
                    .map(clientId => {
                      const totalTimeForClient = filteredData
                        .filter(entry => entry.clientId === clientId)
                        .reduce((sum, entry) => sum + entry.totalMinutes, 0);
                      
                      return {
                        clientId,
                        totalMinutes: totalTimeForClient,
                        percentage: stats.totalHours > 0 ? (totalTimeForClient / 60) / stats.totalHours * 100 : 0
                      };
                    })
                    .sort((a, b) => b.totalMinutes - a.totalMinutes)
                    .slice(0, 5)
                    .map(item => (
                      <div key={item.clientId} className="flex items-center justify-between">
                        <span className="text-sm">{getClientName(item.clientId)}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {formatTime(item.totalMinutes)}
                          </span>
                          <Progress value={item.percentage} className="w-[100px]" />
                          <span className="text-sm w-12">{item.percentage.toFixed(0)}%</span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}