import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";
import { 
  Users, 
  UserPlus, 
  Building, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  BarChart3,
  FileText,
  CreditCard,
  Calculator,
  TrendingDown,
  Target,
  Briefcase,
  UserCheck
} from "lucide-react";
import { mockClients } from "../data/mockClients";
import { mockEmails, mockInvoices, mockUsers } from "../data/mockData";
import { User } from "../types/client";
import { toast } from 'sonner';

interface DashboardProps {
  currentUser: User;
  onNavigate?: (view: string) => void;
}

export function Dashboard({ currentUser, onNavigate }: DashboardProps) {
  const totalClients = mockClients.length;
  const activeClients = mockClients.filter(client => client.status === 'aktualny').length;
  const prospects = mockClients.filter(client => client.status === 'potencjalny').length;

  const paidInvoices = mockInvoices.filter(invoice => invoice.status === 'zaplacona').length;
  const overdueInvoices = mockInvoices.filter(invoice => invoice.status === 'przeterminowana').length;

  // Company's own financial data (for owner/secretary roles)
  const companyFinancials = {
    totalInvoices: 45,
    paidInvoices: 38,
    overdueInvoices: 4,
    pendingInvoices: 3,
    totalRevenue: 185420,
    paidRevenue: 156780,
    overdueRevenue: 18640,
    pendingRevenue: 10000,
    lastMonthRevenue: 142350,
    biggestDebtors: [
      { name: 'Tech Solutions Sp. z o.o.', amount: 8500, days: 12 },
      { name: 'Creative Agency Ltd.', amount: 5200, days: 8 },
      { name: 'Startup Innovations', amount: 4940, days: 5 }
    ]
  };

  // Client processing statistics (for accounting/HR roles)
  const processingStats = {
    totalDocuments: 856,
    processedDocuments: 721,
    accountingComplete: 34, // number of companies with complete accounting
    hrComplete: 28, // number of companies with complete HR
    accountingPercentage: Math.round((34 / totalClients) * 100),
    hrPercentage: Math.round((28 / totalClients) * 100),
    documentsPercentage: Math.round((721 / 856) * 100)
  };

  // Financial calculations
  const totalRevenue = mockInvoices.reduce((sum, invoice) => sum + invoice.totalGross, 0);
  const paidRevenue = mockInvoices
    .filter(invoice => invoice.status === 'zaplacona')
    .reduce((sum, invoice) => sum + invoice.totalGross, 0);

  // Tax and ZUS reminders (mock data)
  const upcomingDeadlines = [
    { title: 'Deklaracja VAT-7', date: '2024-12-25', daysLeft: 16, type: 'tax', priority: 'high' },
    { title: 'Składki ZUS', date: '2024-12-20', daysLeft: 11, type: 'zus', priority: 'high' },
    { title: 'PIT-4R', date: '2024-12-31', daysLeft: 22, type: 'tax', priority: 'medium' },
    { title: 'Sprawozdanie finansowe', date: '2025-01-15', daysLeft: 37, type: 'report', priority: 'low' },
    { title: 'Rozliczenie podatkowe - Sp. z o.o.', date: '2024-12-28', daysLeft: 19, type: 'tax', priority: 'high' }
  ];

  const recentClients = mockClients
    .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
    .slice(0, 5);

  const getStatusLabel = (status: string) => {
    const labels = {
      'aktualny': 'Aktualny',
      'archiwalny': 'Archiwalny', 
      'potencjalny': 'Potencjalny'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getDeadlinePriority = (daysLeft: number) => {
    if (daysLeft <= 3) return 'destructive';
    if (daysLeft <= 7) return 'default';
    if (daysLeft <= 14) return 'secondary';
    return 'outline';
  };

  const canViewFinancials = ['wlasciciel', 'sekretariat', 'administrator'].includes(currentUser.role);
  const canViewProcessing = ['ksiegowa', 'kadrowa', 'zarzadzanie_biurem', 'administrator'].includes(currentUser.role);

  return (
    <div className="space-y-6">
      <div>
        <h1>Przegląd Systemu</h1>
        <p className="text-muted-foreground">
          Witaj, {currentUser.firstName}! Kompleksowy przegląd działalności biura
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Wszyscy Klienci</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{totalClients}</div>
            <p className="text-xs text-muted-foreground">
              +2 w tym miesiącu
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Aktywni Klienci</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{activeClients}</div>
            <p className="text-xs text-muted-foreground">
              {totalClients > 0 ? ((activeClients / totalClients) * 100).toFixed(0) : 0}% wszystkich
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Potencjalni</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{prospects}</div>
            <p className="text-xs text-muted-foreground">
              Nowi potencjalni klienci
            </p>
          </CardContent>
        </Card>

        {canViewFinancials ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Przeterminowane</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{companyFinancials.overdueInvoices}</div>
              <p className="text-xs text-muted-foreground">
                Faktury po terminie
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Dokumenty</CardTitle>
              <FileText className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{processingStats.documentsPercentage}%</div>
              <p className="text-xs text-muted-foreground">
                Postęp przetwarzania
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Role-specific Financial/Processing Overview */}
      {canViewFinancials ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Przegląd Finansowy Firmy
            </CardTitle>
            <CardDescription>
              Faktury i płatności głównej firmy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-muted-foreground">Wszystkie faktury</span>
                </div>
                <div className="text-2xl">{companyFinancials.totalInvoices}</div>
                <div className="text-xl text-green-600">{companyFinancials.totalRevenue.toLocaleString('pl-PL')} zł</div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-muted-foreground">Zapłacone</span>
                </div>
                <div className="text-2xl">{companyFinancials.paidInvoices}</div>
                <div className="text-xl text-green-600">{companyFinancials.paidRevenue.toLocaleString('pl-PL')} zł</div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-muted-foreground">Przeterminowane</span>
                </div>
                <div className="text-2xl">{companyFinancials.overdueInvoices}</div>
                <div className="text-xl text-red-600">{companyFinancials.overdueRevenue.toLocaleString('pl-PL')} zł</div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-muted-foreground">Oczekujące</span>
                </div>
                <div className="text-2xl">{companyFinancials.pendingInvoices}</div>
                <div className="text-xl text-yellow-600">{companyFinancials.pendingRevenue.toLocaleString('pl-PL')} zł</div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Najwięksi dłużnicy</h4>
              <div className="space-y-2">
                {companyFinancials.biggestDebtors.map((debtor, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{debtor.name}</p>
                      <p className="text-xs text-muted-foreground">{debtor.days} dni po terminie</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-red-600">{debtor.amount.toLocaleString('pl-PL')} zł</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Porównanie z poprzednim miesiącem</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{companyFinancials.lastMonthRevenue.toLocaleString('pl-PL')} zł</span>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">
                    +{(((companyFinancials.paidRevenue - companyFinancials.lastMonthRevenue) / companyFinancials.lastMonthRevenue) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : canViewProcessing ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Przegląd Przetwarzania Klientów
            </CardTitle>
            <CardDescription>
              Postęp obsługi księgowej i kadrowej klientów
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-muted-foreground">Dokumenty</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Postęp</span>
                    <span className="text-sm">{processingStats.processedDocuments}/{processingStats.totalDocuments}</span>
                  </div>
                  <Progress value={processingStats.documentsPercentage} className="h-2" />
                  <div className="text-2xl">{processingStats.documentsPercentage}%</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-muted-foreground">Księgowość</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Ukończone firmy</span>
                    <span className="text-sm">{processingStats.accountingComplete}/{totalClients}</span>
                  </div>
                  <Progress value={processingStats.accountingPercentage} className="h-2" />
                  <div className="text-2xl">{processingStats.accountingPercentage}%</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-purple-500" />
                  <span className="text-sm text-muted-foreground">Kadry</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Ukończone firmy</span>
                    <span className="text-sm">{processingStats.hrComplete}/{totalClients}</span>
                  </div>
                  <Progress value={processingStats.hrPercentage} className="h-2" />
                  <div className="text-2xl">{processingStats.hrPercentage}%</div>
                </div>
              </div>
            </div>

            {currentUser.role === 'ksiegowa' && (
              <div className="border-t pt-4 mt-6">
                <h4 className="font-medium mb-3">Księgowość - do ukończenia</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm font-medium">VAT do złożenia</p>
                    <p className="text-2xl text-orange-600">12</p>
                    <p className="text-xs text-muted-foreground">firm</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm font-medium">Bilanse do sporządzenia</p>
                    <p className="text-2xl text-blue-600">8</p>
                    <p className="text-xs text-muted-foreground">firm</p>
                  </div>
                </div>
              </div>
            )}

            {currentUser.role === 'kadrowa' && (
              <div className="border-t pt-4 mt-6">
                <h4 className="font-medium mb-3">Kadry - do ukończenia</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm font-medium">ZUS do rozliczenia</p>
                    <p className="text-2xl text-purple-600">15</p>
                    <p className="text-xs text-muted-foreground">firm</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm font-medium">Umowy do przygotowania</p>
                    <p className="text-2xl text-green-600">6</p>
                    <p className="text-xs text-muted-foreground">sztuk</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      {/* Tasks and Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Nadchodzące Zadania
            </CardTitle>
            <CardDescription>
              Ważne terminy podatkowe i ZUS
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingDeadlines.slice(0, 6).map((deadline, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {deadline.type === 'tax' ? (
                      <FileText className="h-4 w-4 text-blue-500" />
                    ) : deadline.type === 'zus' ? (
                      <CreditCard className="h-4 w-4 text-purple-500" />
                    ) : (
                      <BarChart3 className="h-4 w-4 text-green-500" />
                    )}
                    <div>
                      <p className="font-medium text-sm">{deadline.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(deadline.date).toLocaleDateString('pl-PL')}
                      </p>
                    </div>
                  </div>
                  <Badge variant={getDeadlinePriority(deadline.daysLeft)}>
                    {deadline.daysLeft} dni
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ostatni Klienci</CardTitle>
            <CardDescription>
              Najnowsi klienci dodani do systemu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentClients.map((client) => (
                <div
                  key={client.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-sm">
                      {client.firstName} {client.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {client.companyName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Dodano {new Date(client.dateAdded).toLocaleDateString('pl-PL')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        client.status === 'aktualny'
                          ? 'default'
                          : client.status === 'potencjalny'
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {getStatusLabel(client.status)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Szybkie Akcje</CardTitle>
          <CardDescription>
            Najczęściej wykonywane operacje
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => {
                if (onNavigate) {
                  onNavigate('clients');
                } else {
                  toast.success("Przechodzenie do listy klientów");
                }
              }}
            >
              <Users className="h-5 w-5 mb-2" />
              Wszyscy Klienci
            </Button>
            {canViewFinancials && (
              <Button 
                variant="outline" 
                className="h-20 flex-col"
                onClick={() => {
                  if (onNavigate) {
                    onNavigate('invoices');
                  } else {
                    toast.success("Przechodzenie do zarządzania fakturami");
                  }
                }}
              >
                <FileText className="h-5 w-5 mb-2" />
                Nowa Faktura
              </Button>
            )}
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => {
                if (onNavigate) {
                  onNavigate('calendar');
                } else {
                  toast.success("Przechodzenie do kalendarza");
                }
              }}
            >
              <Calendar className="h-5 w-5 mb-2" />
              Kalendarz
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => {
                if (onNavigate) {
                  onNavigate('monthly-data');
                } else {
                  toast.success("Przechodzenie do danych miesięcznych");
                }
              }}
            >
              <BarChart3 className="h-5 w-5 mb-2" />
              Dane Miesięczne
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}