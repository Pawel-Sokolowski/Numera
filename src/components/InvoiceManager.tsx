import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { FileText, Plus, Eye, Edit, Download, Trash2, Calculator } from "lucide-react";
import { Invoice, InvoiceItem, Client } from "../types/client";
import { mockInvoices } from "../data/mockData";
import { mockClients } from "../data/mockClients";
import { toast } from 'sonner';

export function InvoiceManager() {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [clients] = useState<Client[]>(mockClients);

  const [invoiceData, setInvoiceData] = useState({
    clientId: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    items: [] as InvoiceItem[],
    notes: ''
  });

  const [newItem, setNewItem] = useState({
    description: '',
    quantity: 1,
    unitPrice: 0,
    taxRate: 23
  });

  const handleCreateInvoice = () => {
    setIsCreating(true);
    setSelectedInvoice(null);
    setInvoiceData({
      clientId: '',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      items: [],
      notes: ''
    });
  };

  const handleAddItem = () => {
    if (!newItem.description || newItem.quantity <= 0 || newItem.unitPrice <= 0) {
      toast.error("Wypełnij wszystkie pola pozycji");
      return;
    }

    const netAmount = newItem.quantity * newItem.unitPrice;
    const taxAmount = (netAmount * newItem.taxRate) / 100;
    const grossAmount = netAmount + taxAmount;

    const item: InvoiceItem = {
      id: Date.now().toString(),
      description: newItem.description,
      quantity: newItem.quantity,
      unitPrice: newItem.unitPrice,
      taxRate: newItem.taxRate,
      netAmount,
      taxAmount,
      grossAmount
    };

    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, item]
    }));

    setNewItem({
      description: '',
      quantity: 1,
      unitPrice: 0,
      taxRate: 23
    });
  };

  const handleRemoveItem = (itemId: string) => {
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  const calculateTotals = () => {
    const totalNet = invoiceData.items.reduce((sum, item) => sum + item.netAmount, 0);
    const totalTax = invoiceData.items.reduce((sum, item) => sum + item.taxAmount, 0);
    const totalGross = totalNet + totalTax;
    return { totalNet, totalTax, totalGross };
  };

  const handleSaveInvoice = (e: React.FormEvent) => {
    e.preventDefault();

    if (!invoiceData.clientId || !invoiceData.dueDate || invoiceData.items.length === 0) {
      toast.error("Wypełnij wszystkie wymagane pola i dodaj co najmniej jedną pozycję");
      return;
    }

    const { totalNet, totalTax, totalGross } = calculateTotals();
    const invoiceNumber = `FV/2024/${(invoices.length + 1).toString().padStart(3, '0')}`;

    const newInvoice: Invoice = {
      id: Date.now().toString(),
      number: invoiceNumber,
      clientId: invoiceData.clientId,
      issueDate: invoiceData.issueDate,
      dueDate: invoiceData.dueDate,
      items: invoiceData.items,
      totalNet,
      totalTax,
      totalGross,
      status: 'utworzona',
      notes: invoiceData.notes
    };

    setInvoices(prev => [...prev, newInvoice]);
    setIsCreating(false);
    toast.success("Faktura została utworzona pomyślnie");
  };

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? `${client.firstName} ${client.lastName}` : 'Nieznany klient';
  };

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'utworzona': return 'secondary';
      case 'wyslana': return 'default';
      case 'zaplacona': return 'default';
      case 'przeterminowana': return 'destructive';
      default: return 'outline';
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Zarządzanie Fakturami</h1>
          <p className="text-muted-foreground">
            Twórz i zarządzaj fakturami dla klientów
          </p>
        </div>
        <Button onClick={handleCreateInvoice}>
          <Plus className="mr-2 h-4 w-4" />
          Nowa Faktura
        </Button>
      </div>

      {isCreating ? (
        <Card>
          <CardHeader>
            <CardTitle>Nowa Faktura</CardTitle>
            <CardDescription>Wypełnij szczegóły faktury</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveInvoice} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Klient *</Label>
                  <Select 
                    value={invoiceData.clientId} 
                    onValueChange={(value) => setInvoiceData(prev => ({ ...prev, clientId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz klienta" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.firstName} {client.lastName} ({client.company})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Data wystawienia</Label>
                  <Input
                    type="date"
                    value={invoiceData.issueDate}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, issueDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Termin płatności *</Label>
                  <Input
                    type="date"
                    value={invoiceData.dueDate}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, dueDate: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3>Pozycje faktury</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Label>Opis usługi/towaru</Label>
                    <Input
                      value={newItem.description}
                      onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Opis pozycji"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ilość</Label>
                    <Input
                      type="number"
                      min="1"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 1 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cena netto</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={newItem.unitPrice}
                      onChange={(e) => setNewItem(prev => ({ ...prev, unitPrice: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>VAT (%)</Label>
                    <Select 
                      value={newItem.taxRate.toString()} 
                      onValueChange={(value) => setNewItem(prev => ({ ...prev, taxRate: parseFloat(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0%</SelectItem>
                        <SelectItem value="5">5%</SelectItem>
                        <SelectItem value="8">8%</SelectItem>
                        <SelectItem value="23">23%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button type="button" onClick={handleAddItem}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {invoiceData.items.length > 0 && (
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Opis</TableHead>
                          <TableHead>Ilość</TableHead>
                          <TableHead>Cena netto</TableHead>
                          <TableHead>VAT</TableHead>
                          <TableHead>Wartość netto</TableHead>
                          <TableHead>Wartość brutto</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoiceData.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.description}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{item.unitPrice.toFixed(2)} zł</TableCell>
                            <TableCell>{item.taxRate}%</TableCell>
                            <TableCell>{item.netAmount.toFixed(2)} zł</TableCell>
                            <TableCell>{item.grossAmount.toFixed(2)} zł</TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="font-medium">
                          <TableCell colSpan={4}>Razem</TableCell>
                          <TableCell>{calculateTotals().totalNet.toFixed(2)} zł</TableCell>
                          <TableCell>{calculateTotals().totalGross.toFixed(2)} zł</TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Uwagi</Label>
                <Input
                  value={invoiceData.notes}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Dodatkowe informacje..."
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  <FileText className="mr-2 h-4 w-4" />
                  Zapisz Fakturę
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>
                  Anuluj
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : selectedInvoice ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Faktura {selectedInvoice.number}</CardTitle>
                <CardDescription>
                  Klient: {getClientName(selectedInvoice.clientId)}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Pobierz PDF
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedInvoice(null)}>
                  Powrót
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4>Szczegóły faktury</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Numer:</strong> {selectedInvoice.number}</div>
                  <div><strong>Data wystawienia:</strong> {new Date(selectedInvoice.issueDate).toLocaleDateString('pl-PL')}</div>
                  <div><strong>Termin płatności:</strong> {new Date(selectedInvoice.dueDate).toLocaleDateString('pl-PL')}</div>
                  <div>
                    <strong>Status:</strong>{' '}
                    <Badge variant={getStatusColor(selectedInvoice.status)}>
                      {getStatusLabel(selectedInvoice.status)}
                    </Badge>
                  </div>
                </div>
              </div>
              <div>
                <h4>Podsumowanie</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Wartość netto:</strong> {selectedInvoice.totalNet.toFixed(2)} zł</div>
                  <div><strong>VAT:</strong> {selectedInvoice.totalTax.toFixed(2)} zł</div>
                  <div><strong>Wartość brutto:</strong> {selectedInvoice.totalGross.toFixed(2)} zł</div>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="mb-4">Pozycje faktury</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Opis</TableHead>
                    <TableHead>Ilość</TableHead>
                    <TableHead>Cena netto</TableHead>
                    <TableHead>VAT</TableHead>
                    <TableHead>Wartość netto</TableHead>
                    <TableHead>Wartość brutto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedInvoice.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.unitPrice.toFixed(2)} zł</TableCell>
                      <TableCell>{item.taxRate}%</TableCell>
                      <TableCell>{item.netAmount.toFixed(2)} zł</TableCell>
                      <TableCell>{item.grossAmount.toFixed(2)} zł</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {selectedInvoice.notes && (
              <>
                <Separator />
                <div>
                  <h4>Uwagi</h4>
                  <p className="text-sm text-muted-foreground">{selectedInvoice.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Lista Faktur</CardTitle>
            <CardDescription>Wszystkie faktury w systemie</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numer</TableHead>
                    <TableHead>Klient</TableHead>
                    <TableHead>Data wystawienia</TableHead>
                    <TableHead>Termin płatności</TableHead>
                    <TableHead>Kwota brutto</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.number}</TableCell>
                      <TableCell>{getClientName(invoice.clientId)}</TableCell>
                      <TableCell>{new Date(invoice.issueDate).toLocaleDateString('pl-PL')}</TableCell>
                      <TableCell>{new Date(invoice.dueDate).toLocaleDateString('pl-PL')}</TableCell>
                      <TableCell>{invoice.totalGross.toFixed(2)} zł</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(invoice.status)}>
                          {getStatusLabel(invoice.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedInvoice(invoice)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}