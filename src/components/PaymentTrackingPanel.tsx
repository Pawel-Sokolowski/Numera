import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { 
  CreditCard, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Plus,
  Mail,
  Calendar,
  DollarSign,
  TrendingUp,
  Send,
  Filter
} from "lucide-react";
import { Client } from "../types/client";
import { 
  Payment, 
  PaymentSummary, 
  PaymentType, 
  PaymentStatus,
  calculateVATDueDate,
  calculatePIT4DueDate,
  calculateZUSDueDate,
  isPaymentOverdue,
  getDaysUntilDue,
  DEFAULT_PAYMENT_CONFIG
} from "../types/payment";
import { 
  generatePaymentReminderEmail,
  generateMonthlySummaryEmail,
  generateOverduePaymentEmail,
  sendPaymentEmail
} from "../utils/paymentEmailService";
import { toast } from 'sonner';

interface PaymentTrackingPanelProps {
  clients: Client[];
}

export function PaymentTrackingPanel({ clients }: PaymentTrackingPanelProps) {
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState<string>(String(new Date().getMonth() + 1).padStart(2, '0'));
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  
  // Mock payment data - in real app, this would come from a backend
  const [payments, setPayments] = useState<Payment[]>([
    {
      id: '1',
      clientId: '1',
      type: 'VAT',
      amount: 2500.00,
      dueDate: calculateVATDueDate(`${selectedMonth}/${selectedYear}`),
      status: 'pending',
      period: `${selectedMonth}/${selectedYear}`,
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      clientId: '1',
      type: 'ZUS',
      amount: 1800.00,
      dueDate: calculateZUSDueDate(`${selectedMonth}/${selectedYear}`),
      status: 'pending',
      period: `${selectedMonth}/${selectedYear}`,
      createdAt: new Date().toISOString()
    },
    {
      id: '3',
      clientId: '2',
      type: 'PIT-4',
      amount: 500.00,
      dueDate: calculatePIT4DueDate(`${selectedMonth}/${selectedYear}`),
      status: 'paid',
      period: `${selectedMonth}/${selectedYear}`,
      paymentDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    }
  ]);

  // New payment form state
  const [newPayment, setNewPayment] = useState<Partial<Payment>>({
    type: 'VAT',
    status: 'pending',
    period: `${selectedMonth}/${selectedYear}`
  });

  // Calculate payment summaries
  const paymentSummaries = useMemo(() => {
    const summaries: { [clientId: string]: PaymentSummary } = {};
    
    clients.forEach(client => {
      const clientPayments = payments.filter(p => 
        p.clientId === client.id && 
        p.period === `${selectedMonth}/${selectedYear}`
      );
      
      const totalAmount = clientPayments.reduce((sum, p) => sum + p.amount, 0);
      const totalPaid = clientPayments
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + p.amount, 0);
      const totalPending = clientPayments
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + p.amount, 0);
      const totalOverdue = clientPayments
        .filter(p => p.status === 'overdue' || (p.status === 'pending' && isPaymentOverdue(p.dueDate)))
        .reduce((sum, p) => sum + p.amount, 0);
      
      summaries[client.id] = {
        clientId: client.id,
        period: `${selectedMonth}/${selectedYear}`,
        payments: clientPayments,
        totalAmount,
        totalPaid,
        totalPending,
        totalOverdue,
        nextDueDate: clientPayments
          .filter(p => p.status === 'pending')
          .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0]?.dueDate,
        lastPaymentDate: clientPayments
          .filter(p => p.status === 'paid')
          .sort((a, b) => new Date(b.paymentDate || '').getTime() - new Date(a.paymentDate || '').getTime())[0]?.paymentDate
      };
    });
    
    return summaries;
  }, [clients, payments, selectedMonth, selectedYear]);

  // Filter payments
  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      const matchesPeriod = payment.period === `${selectedMonth}/${selectedYear}`;
      const matchesType = filterType === 'all' || payment.type === filterType;
      const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
      
      return matchesPeriod && matchesType && matchesStatus;
    });
  }, [payments, selectedMonth, selectedYear, filterType, filterStatus]);

  // Get status badge
  const getStatusBadge = (payment: Payment) => {
    if (payment.status === 'paid') {
      return <Badge className="bg-green-100 text-green-800">Opłacone</Badge>;
    }
    if (payment.status === 'cancelled') {
      return <Badge className="bg-gray-100 text-gray-800">Anulowane</Badge>;
    }
    if (isPaymentOverdue(payment.dueDate)) {
      return <Badge className="bg-red-100 text-red-800">Zaległe</Badge>;
    }
    const daysUntil = getDaysUntilDue(payment.dueDate);
    if (daysUntil <= 3) {
      return <Badge className="bg-orange-100 text-orange-800">Oczekujące ({daysUntil}d)</Badge>;
    }
    return <Badge className="bg-blue-100 text-blue-800">Oczekujące</Badge>;
  };

  // Handle add payment
  const handleAddPayment = () => {
    if (!newPayment.clientId || !newPayment.type || !newPayment.amount) {
      toast.error("Wypełnij wszystkie wymagane pola");
      return;
    }

    let dueDate = '';
    switch(newPayment.type) {
      case 'VAT':
        dueDate = calculateVATDueDate(newPayment.period || `${selectedMonth}/${selectedYear}`);
        break;
      case 'PIT-4':
        dueDate = calculatePIT4DueDate(newPayment.period || `${selectedMonth}/${selectedYear}`);
        break;
      case 'ZUS':
        dueDate = calculateZUSDueDate(newPayment.period || `${selectedMonth}/${selectedYear}`);
        break;
      default:
        dueDate = new Date().toISOString().split('T')[0];
    }

    const payment: Payment = {
      id: Date.now().toString(),
      clientId: newPayment.clientId!,
      type: newPayment.type as PaymentType,
      amount: newPayment.amount!,
      dueDate,
      status: newPayment.status as PaymentStatus || 'pending',
      period: newPayment.period || `${selectedMonth}/${selectedYear}`,
      notes: newPayment.notes,
      createdAt: new Date().toISOString()
    };

    setPayments([...payments, payment]);
    setShowAddPayment(false);
    setNewPayment({
      type: 'VAT',
      status: 'pending',
      period: `${selectedMonth}/${selectedYear}`
    });
    toast.success("Płatność dodana");
  };

  // Handle mark as paid
  const handleMarkAsPaid = (paymentId: string) => {
    setPayments(payments.map(p => 
      p.id === paymentId 
        ? { ...p, status: 'paid' as PaymentStatus, paymentDate: new Date().toISOString().split('T')[0] }
        : p
    ));
    toast.success("Płatność oznaczona jako opłacona");
  };

  // Send payment reminder
  const handleSendReminder = async (payment: Payment) => {
    const client = clients.find(c => c.id === payment.clientId);
    if (!client) {
      toast.error("Nie znaleziono klienta");
      return;
    }

    const daysUntil = getDaysUntilDue(payment.dueDate);
    
    try {
      let emailNotification;
      
      if (daysUntil < 0) {
        // Payment is overdue - send urgent notification
        emailNotification = generateOverduePaymentEmail(client, payment, Math.abs(daysUntil));
      } else {
        // Normal reminder
        emailNotification = generatePaymentReminderEmail(client, payment, daysUntil);
      }
      
      const success = await sendPaymentEmail(emailNotification);
      
      if (success) {
        toast.success(`Przypomnienie wysłane do ${client.firstName} ${client.lastName}`);
        
        setPayments(payments.map(p => 
          p.id === payment.id 
            ? { ...p, reminderSent: true, reminderSentDate: new Date().toISOString() }
            : p
        ));
      } else {
        toast.error("Błąd podczas wysyłania przypomnienia");
      }
    } catch (error) {
      console.error("Error sending reminder:", error);
      toast.error("Błąd podczas wysyłania przypomnienia");
    }
  };

  // Send monthly summary
  const handleSendMonthlySummary = async (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    const summary = paymentSummaries[clientId];
    
    if (!client || !summary) {
      toast.error("Błąd wysyłania podsumowania");
      return;
    }

    try {
      const emailNotification = generateMonthlySummaryEmail(client, summary);
      const success = await sendPaymentEmail(emailNotification);
      
      if (success) {
        toast.success(`Podsumowanie miesięczne wysłane do ${client.firstName} ${client.lastName}`);
      } else {
        toast.error("Błąd podczas wysyłania podsumowania");
      }
    } catch (error) {
      console.error("Error sending summary:", error);
      toast.error("Błąd podczas wysyłania podsumowania");
    }
  };

  // Send all pending reminders
  const handleSendAllReminders = async () => {
    const pendingPayments = filteredPayments.filter(p => 
      p.status === 'pending' && !p.reminderSent
    );
    
    if (pendingPayments.length === 0) {
      toast.info("Brak płatności wymagających przypomnienia");
      return;
    }

    toast.info(`Wysyłanie ${pendingPayments.length} przypomnień...`);
    
    let sent = 0;
    let failed = 0;
    
    for (const payment of pendingPayments) {
      const client = clients.find(c => c.id === payment.clientId);
      if (!client) continue;
      
      try {
        const daysUntil = getDaysUntilDue(payment.dueDate);
        const emailNotification = generatePaymentReminderEmail(client, payment, daysUntil);
        const success = await sendPaymentEmail(emailNotification);
        
        if (success) {
          sent++;
          setPayments(prev => prev.map(p => 
            p.id === payment.id 
              ? { ...p, reminderSent: true, reminderSentDate: new Date().toISOString() }
              : p
          ));
        } else {
          failed++;
        }
        
        // Rate limiting - wait 1 second between emails
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        failed++;
      }
    }
    
    toast.success(`Wysłano ${sent} przypomnień. Błędów: ${failed}`);
  };

  // Calculate overall statistics
  const overallStats = useMemo(() => {
    const stats = {
      totalAmount: 0,
      totalPaid: 0,
      totalPending: 0,
      totalOverdue: 0,
      vatTotal: 0,
      pit4Total: 0,
      zusTotal: 0
    };

    filteredPayments.forEach(payment => {
      stats.totalAmount += payment.amount;
      
      if (payment.status === 'paid') {
        stats.totalPaid += payment.amount;
      } else if (isPaymentOverdue(payment.dueDate)) {
        stats.totalOverdue += payment.amount;
      } else if (payment.status === 'pending') {
        stats.totalPending += payment.amount;
      }

      switch(payment.type) {
        case 'VAT':
          stats.vatTotal += payment.amount;
          break;
        case 'PIT-4':
          stats.pit4Total += payment.amount;
          break;
        case 'ZUS':
          stats.zusTotal += payment.amount;
          break;
      }
    });

    return stats;
  }, [filteredPayments]);

  return (
    <div className="space-y-4">
      {/* Header with filters */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Śledzenie Płatności</h2>
          <p className="text-muted-foreground">Monitorowanie płatności VAT, PIT-4, ZUS i innych</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSendAllReminders}>
            <Mail className="mr-2 h-4 w-4" />
            Wyślij wszystkie przypomnienia
          </Button>
          <Dialog open={showAddPayment} onOpenChange={setShowAddPayment}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Dodaj płatność
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dodaj nową płatność</DialogTitle>
              <DialogDescription>
                Dodaj nową płatność do śledzenia
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Klient *</Label>
                <Select value={newPayment.clientId} onValueChange={(value) => setNewPayment({...newPayment, clientId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz klienta..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.firstName} {client.lastName} {client.companyName && `- ${client.companyName}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Typ płatności *</Label>
                <Select value={newPayment.type} onValueChange={(value) => setNewPayment({...newPayment, type: value as PaymentType})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VAT">VAT</SelectItem>
                    <SelectItem value="PIT-4">PIT-4</SelectItem>
                    <SelectItem value="ZUS">ZUS</SelectItem>
                    <SelectItem value="CIT">CIT</SelectItem>
                    <SelectItem value="OTHER">Inne</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Kwota *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newPayment.amount || ''}
                  onChange={(e) => setNewPayment({...newPayment, amount: parseFloat(e.target.value)})}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label>Okres</Label>
                <Input
                  value={newPayment.period || `${selectedMonth}/${selectedYear}`}
                  onChange={(e) => setNewPayment({...newPayment, period: e.target.value})}
                  placeholder="MM/YYYY"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowAddPayment(false)}>
                  Anuluj
                </Button>
                <Button onClick={handleAddPayment}>
                  Dodaj
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Period selector and filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Rok</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Miesiąc</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => {
                    const month = String(i + 1).padStart(2, '0');
                    const monthNames = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 
                                       'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];
                    return (
                      <SelectItem key={month} value={month}>
                        {monthNames[i]}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                <Filter className="inline h-4 w-4 mr-1" />
                Typ płatności
              </Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie</SelectItem>
                  <SelectItem value="VAT">VAT</SelectItem>
                  <SelectItem value="PIT-4">PIT-4</SelectItem>
                  <SelectItem value="ZUS">ZUS</SelectItem>
                  <SelectItem value="CIT">CIT</SelectItem>
                  <SelectItem value="OTHER">Inne</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                <Filter className="inline h-4 w-4 mr-1" />
                Status
              </Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie</SelectItem>
                  <SelectItem value="pending">Oczekujące</SelectItem>
                  <SelectItem value="paid">Opłacone</SelectItem>
                  <SelectItem value="overdue">Zaległe</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Łącznie do zapłaty
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.totalAmount.toFixed(2)} zł</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">
              <CheckCircle className="inline h-4 w-4 mr-1" />
              Opłacone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{overallStats.totalPaid.toFixed(2)} zł</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">
              <Clock className="inline h-4 w-4 mr-1" />
              Oczekujące
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{overallStats.totalPending.toFixed(2)} zł</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">
              <AlertCircle className="inline h-4 w-4 mr-1" />
              Zaległe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overallStats.totalOverdue.toFixed(2)} zł</div>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown by type */}
      <Card>
        <CardHeader>
          <CardTitle>Podział według typu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">VAT:</span>
              <span className="font-bold">{overallStats.vatTotal.toFixed(2)} zł</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">PIT-4:</span>
              <span className="font-bold">{overallStats.pit4Total.toFixed(2)} zł</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">ZUS:</span>
              <span className="font-bold">{overallStats.zusTotal.toFixed(2)} zł</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment summaries by client */}
      <Card>
        <CardHeader>
          <CardTitle>Podsumowanie według klienta</CardTitle>
          <CardDescription>
            Przegląd płatności dla każdego klienta w wybranym okresie
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Klient</TableHead>
                <TableHead>Łącznie</TableHead>
                <TableHead>Opłacone</TableHead>
                <TableHead>Oczekujące</TableHead>
                <TableHead>Zaległe</TableHead>
                <TableHead>Najbliższy termin</TableHead>
                <TableHead>Akcje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(paymentSummaries).map(([clientId, summary]) => {
                const client = clients.find(c => c.id === clientId);
                if (!client) return null;

                return (
                  <TableRow key={clientId}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{client.firstName} {client.lastName}</div>
                        {client.companyName && (
                          <div className="text-xs text-muted-foreground">{client.companyName}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{summary.totalAmount.toFixed(2)} zł</TableCell>
                    <TableCell className="text-green-600">{summary.totalPaid.toFixed(2)} zł</TableCell>
                    <TableCell className="text-blue-600">{summary.totalPending.toFixed(2)} zł</TableCell>
                    <TableCell className="text-red-600">{summary.totalOverdue.toFixed(2)} zł</TableCell>
                    <TableCell>
                      {summary.nextDueDate ? (
                        <div className="text-sm">
                          {new Date(summary.nextDueDate).toLocaleDateString('pl-PL')}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSendMonthlySummary(clientId)}
                      >
                        <Mail className="h-4 w-4 mr-1" />
                        Wyślij podsumowanie
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detailed payment list */}
      <Card>
        <CardHeader>
          <CardTitle>Szczegóły płatności</CardTitle>
          <CardDescription>
            Lista wszystkich płatności w wybranym okresie
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Klient</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>Kwota</TableHead>
                <TableHead>Termin</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Okres</TableHead>
                <TableHead>Akcje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Brak płatności w wybranym okresie
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map(payment => {
                  const client = clients.find(c => c.id === payment.clientId);
                  if (!client) return null;

                  return (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{client.firstName} {client.lastName}</div>
                          {client.companyName && (
                            <div className="text-xs text-muted-foreground">{client.companyName}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{payment.type}</Badge>
                      </TableCell>
                      <TableCell className="font-mono">{payment.amount.toFixed(2)} zł</TableCell>
                      <TableCell>{new Date(payment.dueDate).toLocaleDateString('pl-PL')}</TableCell>
                      <TableCell>{getStatusBadge(payment)}</TableCell>
                      <TableCell>{payment.period}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {payment.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMarkAsPaid(payment.id)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSendReminder(payment)}
                                disabled={payment.reminderSent}
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {payment.status === 'paid' && payment.paymentDate && (
                            <span className="text-xs text-muted-foreground">
                              Opłacone: {new Date(payment.paymentDate).toLocaleDateString('pl-PL')}
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
