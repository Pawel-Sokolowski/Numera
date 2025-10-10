import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Switch } from "./ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { 
  Building2, 
  Download, 
  Upload, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  CreditCard, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Filter,
  Search,
  Settings,
  Link,
  Unlink,
  FileText,
  DollarSign,
  Plus,
  Eye,
  MoreHorizontal
} from "lucide-react";
import { toast } from 'sonner';

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  currency: string;
  balance: number;
  isConnected: boolean;
  lastSync: string;
  syncStatus: 'success' | 'error' | 'pending';
  autoSync: boolean;
}

interface BankTransaction {
  id: string;
  accountId: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  counterparty: string;
  reference: string;
  isMatched: boolean;
  matchedInvoiceId?: string;
  importStatus: 'new' | 'processed' | 'ignored';
}

interface Invoice {
  id: string;
  number: string;
  clientName: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
}

export function BankIntegration() {
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('2024-12-01');
  const [dateTo, setDateTo] = useState('2024-12-31');
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);

  // Mock data
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([
    {
      id: '1',
      bankName: 'PKO Bank Polski',
      accountNumber: '12 1020 1097 0000 1502 0000 0000',
      accountName: 'Rachunek Podstawowy',
      currency: 'PLN',
      balance: 45230.50,
      isConnected: true,
      lastSync: '2024-12-09T10:30:00Z',
      syncStatus: 'success',
      autoSync: true
    },
    {
      id: '2',
      bankName: 'Santander Bank Polska',
      accountNumber: '85 1090 1056 0000 0001 4738 0000',
      accountName: 'Rachunek Firmowy',
      currency: 'PLN',
      balance: 128450.75,
      isConnected: true,
      lastSync: '2024-12-09T08:15:00Z',
      syncStatus: 'success',
      autoSync: false
    },
    {
      id: '3',
      bankName: 'mBank',
      accountNumber: '11 1140 2017 0000 4702 0000 0000',
      accountName: 'Rachunek EUR',
      currency: 'EUR',
      balance: 12350.25,
      isConnected: false,
      lastSync: '2024-12-08T16:45:00Z',
      syncStatus: 'error',
      autoSync: false
    }
  ]);

  const [transactions, setTransactions] = useState<BankTransaction[]>([
    {
      id: '1',
      accountId: '1',
      date: '2024-12-09',
      description: 'PRZELEW PRZYCHODZĄCY - Tech Solutions Sp. z o.o.',
      amount: 1845.00,
      type: 'income',
      category: 'Płatności od klientów',
      counterparty: 'Tech Solutions Sp. z o.o.',
      reference: 'FV/2024/001',
      isMatched: true,
      matchedInvoiceId: 'FV-001',
      importStatus: 'processed'
    },
    {
      id: '2',
      accountId: '1',
      date: '2024-12-08',
      description: 'PRZELEW WYCHODZĄCY - Urząd Skarbowy',
      amount: -2500.00,
      type: 'expense',
      category: 'Podatki',
      counterparty: 'Urząd Skarbowy w Warszawie',
      reference: 'VAT listopad 2024',
      isMatched: false,
      importStatus: 'new'
    },
    {
      id: '3',
      accountId: '2',
      date: '2024-12-07',
      description: 'PRZELEW PRZYCHODZĄCY - Creative Designs',
      amount: 984.00,
      type: 'income',
      category: 'Płatności od klientów',
      counterparty: 'Creative Designs Sp. z o.o.',
      reference: 'FV/2024/002',
      isMatched: false,
      importStatus: 'new'
    }
  ]);

  const [pendingInvoices] = useState<Invoice[]>([
    {
      id: 'FV-003',
      number: 'FV/2024/003',
      clientName: 'Startup Innovations',
      amount: 2500.00,
      dueDate: '2024-12-15',
      status: 'pending'
    },
    {
      id: 'FV-004',
      number: 'FV/2024/004',
      clientName: 'Old Company Sp. z o.o.',
      amount: 3200.00,
      dueDate: '2024-12-10',
      status: 'overdue'
    }
  ]);

  const filteredTransactions = transactions.filter(transaction => {
    const matchesAccount = selectedAccount === 'all' || transaction.accountId === selectedAccount;
    const matchesSearch = !searchTerm || 
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.counterparty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || 
      (filterType === 'unmatched' && !transaction.isMatched) ||
      (filterType === 'income' && transaction.type === 'income') ||
      (filterType === 'expense' && transaction.type === 'expense');
    
    return matchesAccount && matchesSearch && matchesType;
  });

  const handleSync = async (accountId: string) => {
    setBankAccounts(prev => 
      prev.map(acc => 
        acc.id === accountId 
          ? { ...acc, syncStatus: 'pending' as const }
          : acc
      )
    );

    // Symulacja synchronizacji
    setTimeout(() => {
      setBankAccounts(prev => 
        prev.map(acc => 
          acc.id === accountId 
            ? { ...acc, syncStatus: 'success' as const, lastSync: new Date().toISOString() }
            : acc
        )
      );
      toast.success("Synchronizacja zakończona pomyślnie");
    }, 2000);
  };

  const handleImportTransactions = async () => {
    setIsImporting(true);
    
    // Symulacja importu
    setTimeout(() => {
      setIsImporting(false);
      toast.success("Zaimportowano 15 nowych transakcji");
    }, 3000);
  };

  const handleMatchTransaction = (transactionId: string, invoiceId: string) => {
    setTransactions(prev => 
      prev.map(trans => 
        trans.id === transactionId 
          ? { ...trans, isMatched: true, matchedInvoiceId: invoiceId, importStatus: 'processed' as const }
          : trans
      )
    );
    toast.success("Transakcja została dopasowana do faktury");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const totalBalance = bankAccounts
    .filter(acc => acc.isConnected && acc.currency === 'PLN')
    .reduce((sum, acc) => sum + acc.balance, 0);

  const unmatchedTransactions = transactions.filter(t => !t.isMatched).length;
  const todayTransactions = transactions.filter(t => t.date === '2024-12-09').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Integracja Bankowa</h1>
          <p className="text-muted-foreground">
            Automatyczny import wyciągów bankowych i rozliczanie płatności
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleImportTransactions} disabled={isImporting}>
            {isImporting ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {isImporting ? 'Importowanie...' : 'Importuj transakcje'}
          </Button>
          <Button variant="outline" onClick={() => {
            setShowAddAccount(true);
            toast.info("Formularz dodawania nowego konta bankowego");
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Dodaj konto
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Łączne saldo</p>
                <p className="text-2xl">{totalBalance.toLocaleString('pl-PL')} zł</p>
              </div>
              <DollarSign className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Konta połączone</p>
                <p className="text-2xl">{bankAccounts.filter(acc => acc.isConnected).length}</p>
              </div>
              <Link className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Niedopasowane</p>
                <p className="text-2xl">{unmatchedTransactions}</p>
              </div>
              <AlertTriangle className="h-5 w-5 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Dzisiaj</p>
                <p className="text-2xl">{todayTransactions}</p>
              </div>
              <Calendar className="h-5 w-5 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="accounts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="accounts">Konta bankowe</TabsTrigger>
          <TabsTrigger value="transactions">Transakcje</TabsTrigger>
          <TabsTrigger value="matching">Dopasowywanie</TabsTrigger>
          <TabsTrigger value="reports">Raporty</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Połączone konta bankowe</CardTitle>
              <CardDescription>
                Zarządzaj połączeniami z bankami i synchronizacją danych
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bankAccounts.map((account) => (
                  <div key={account.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Building2 className="h-8 w-8 text-blue-500" />
                        <div>
                          <h4 className="font-medium">{account.bankName}</h4>
                          <p className="text-sm text-muted-foreground">{account.accountName}</p>
                          <p className="text-xs text-muted-foreground">{account.accountNumber}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium">
                            {account.balance.toLocaleString('pl-PL')} {account.currency}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {getStatusIcon(account.syncStatus)}
                            <span>
                              {new Date(account.lastSync).toLocaleDateString('pl-PL')}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={account.isConnected}
                              onCheckedChange={(checked) => {
                                setBankAccounts(prev => 
                                  prev.map(acc => 
                                    acc.id === account.id 
                                      ? { ...acc, isConnected: checked }
                                      : acc
                                  )
                                );
                              }}
                            />
                            <span className="text-sm">
                              {account.isConnected ? 'Połączone' : 'Rozłączone'}
                            </span>
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSync(account.id)}
                            disabled={!account.isConnected || account.syncStatus === 'pending'}
                          >
                            {account.syncStatus === 'pending' ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                            Synchronizuj
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Historia transakcji</CardTitle>
                  <CardDescription>
                    Wszystkie zaimportowane transakcje bankowe
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Wszystkie konta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Wszystkie konta</SelectItem>
                      {bankAccounts.map(account => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.bankName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Wszystkie</SelectItem>
                      <SelectItem value="income">Wpływy</SelectItem>
                      <SelectItem value="expense">Wydatki</SelectItem>
                      <SelectItem value="unmatched">Niedopasowane</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <Input
                    placeholder="Szukaj transakcji..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-[150px]"
                />
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-[150px]"
                />
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Opis</TableHead>
                    <TableHead>Kontrahent</TableHead>
                    <TableHead>Kwota</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {new Date(transaction.date).toLocaleDateString('pl-PL')}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">{transaction.reference}</p>
                        </div>
                      </TableCell>
                      <TableCell>{transaction.counterparty}</TableCell>
                      <TableCell>
                        <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                          {transaction.type === 'income' ? '+' : ''}
                          {transaction.amount.toLocaleString('pl-PL')} zł
                        </span>
                      </TableCell>
                      <TableCell>
                        {transaction.isMatched ? (
                          <Badge variant="default">Dopasowane</Badge>
                        ) : (
                          <Badge variant="secondary">Niedopasowane</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            toast.info(`Szczegóły transakcji: ${transaction.description}`);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matching" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Niedopasowane transakcje</CardTitle>
                <CardDescription>
                  Transakcje wymagające dopasowania do faktur
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transactions
                    .filter(t => !t.isMatched && t.type === 'income')
                    .map((transaction) => (
                      <div key={transaction.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{transaction.counterparty}</p>
                            <p className="text-xs text-muted-foreground">{transaction.reference}</p>
                            <p className="text-sm text-green-600">
                              +{transaction.amount.toLocaleString('pl-PL')} zł
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Automatyczne dopasowanie na podstawie kwoty
                              const matchingInvoice = pendingInvoices.find(
                                inv => Math.abs(inv.amount - transaction.amount) < 0.01
                              );
                              if (matchingInvoice) {
                                handleMatchTransaction(transaction.id, matchingInvoice.id);
                              } else {
                                toast.error("Nie znaleziono pasującej faktury");
                              }
                            }}
                          >
                            Auto-dopasuj
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Oczekujące faktury</CardTitle>
                <CardDescription>
                  Faktury oczekujące na płatność
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingInvoices.map((invoice) => (
                    <div key={invoice.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{invoice.number}</p>
                          <p className="text-xs text-muted-foreground">{invoice.clientName}</p>
                          <p className="text-sm">{invoice.amount.toLocaleString('pl-PL')} zł</p>
                        </div>
                        <Badge 
                          variant={invoice.status === 'overdue' ? 'destructive' : 'secondary'}
                        >
                          {invoice.status === 'overdue' ? 'Przeterminowana' : 'Oczekuje'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Raporty finansowe</CardTitle>
              <CardDescription>
                Analiza przepływów finansowych
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-muted-foreground">Wpływy ten miesiąc</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    +{transactions
                      .filter(t => t.type === 'income')
                      .reduce((sum, t) => sum + t.amount, 0)
                      .toLocaleString('pl-PL')} zł
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-muted-foreground">Wydatki ten miesiąc</span>
                  </div>
                  <div className="text-2xl font-bold text-red-600">
                    {transactions
                      .filter(t => t.type === 'expense')
                      .reduce((sum, t) => sum + Math.abs(t.amount), 0)
                      .toLocaleString('pl-PL')} zł
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-muted-foreground">Saldo netto</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {transactions
                      .reduce((sum, t) => sum + t.amount, 0)
                      .toLocaleString('pl-PL')} zł
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}