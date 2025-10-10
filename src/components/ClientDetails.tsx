import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { ArrowLeft, Edit, Mail, Phone, MapPin, Building, Calendar, Tag } from "lucide-react";
import { Client } from "../types/client";

interface ClientDetailsProps {
  client: Client;
  onBack: () => void;
  onEdit: (client: Client) => void;
}

export function ClientDetails({ client, onBack, onEdit }: ClientDetailsProps) {
  const getStatusLabel = (status: string) => {
    const labels = {
      'aktywny': 'Aktywny',
      'nieaktywny': 'Nieaktywny',
      'potencjalny': 'Potencjalny'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getBusinessTypeLabel = (businessType: string) => {
    const labels = {
      'sp_zoo': 'Spółka z o.o.',
      'komandytowa': 'Spółka komandytowa',
      'akcyjna': 'Spółka akcyjna',
      'jednoosobowa': 'Jednoosobowa działalność gospodarcza',
      'spolka_cywilna': 'Spółka cywilna',
      'fundacja': 'Fundacja',
      'stowarzyszenie': 'Stowarzyszenie'
    };
    return labels[businessType as keyof typeof labels] || businessType;
  };

  const getTaxTypeLabel = (taxType: string) => {
    const labels = {
      'ryczalt': 'Ryczałt od przychodów ewidencjonowanych',
      'liniowy': 'Podatek liniowy 19%',
      'zasady_ogolne': 'Zasady ogólne (skala podatkowa)',
      'cit': 'Podatek dochodowy od osób prawnych (CIT)',
      'cit_estonski': 'Estoński CIT',
      'karta_podatkowa': 'Karta podatkowa'
    };
    return labels[taxType as keyof typeof labels] || taxType;
  };

  const getAccountingTypeLabel = (accountingType: string) => {
    const labels = {
      'kpir': 'Księga przychodów i rozchodów',
      'pelne_ksiegi': 'Pełne księgi rachunkowe',
      'ewidencja_przychodow': 'Ewidencja przychodów',
      'ryczalt_ewidencyjny': 'Ewidencja dla ryczałtu'
    };
    return labels[accountingType as keyof typeof labels] || accountingType;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Powrót do klientów
          </Button>
        </div>
        <Button onClick={() => onEdit(client)}>
          <Edit className="h-4 w-4 mr-2" />
          Edytuj Klienta
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">
                    {client.firstName} {client.lastName}
                  </CardTitle>
                  {client.position && (client.companyName || client.company) && (
                    <CardDescription>
                      {client.position} w {client.companyName || client.company}
                    </CardDescription>
                  )}
                </div>
                <Badge
                  variant={
                    client.status === 'aktywny'
                      ? 'default'
                      : client.status === 'potencjalny'
                      ? 'secondary'
                      : 'outline'
                  }
                  className="text-sm"
                >
                  {getStatusLabel(client.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Contact Information */}
              <div className="space-y-3">
                <h3 className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Informacje kontaktowe
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p>{client.email}</p>
                  </div>
                  {client.phone && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Telefon</p>
                      <p>{client.phone}</p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Company Information */}
              {client.company && (
                <>
                  <div className="space-y-3">
                    <h3 className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Informacje o firmie
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Firma</p>
                        <p>{client.company}</p>
                      </div>
                      {client.position && (
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Stanowisko</p>
                          <p>{client.position}</p>
                        </div>
                      )}
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Rodzaj działalności</p>
                        <p>{getBusinessTypeLabel(client.businessType)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Liczba pracowników</p>
                        <p>{client.employeeCount}</p>
                      </div>
                      {client.nip && (
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">NIP</p>
                          <p>{client.nip}</p>
                        </div>
                      )}
                      {client.regon && (
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">REGON</p>
                          <p>{client.regon}</p>
                        </div>
                      )}
                      {client.krs && (
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">KRS</p>
                          <p>{client.krs}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Address */}
              {(client.address.street || client.address.city) && (
                <>
                  <div className="space-y-3">
                    <h3 className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Adres
                    </h3>
                    <div className="pl-6">
                      <div className="space-y-1">
                        {client.address.street && <p>{client.address.street}</p>}
                        <p>
                          {[
                            client.address.city,
                            client.address.state,
                            client.address.zipCode
                          ].filter(Boolean).join(', ')}
                        </p>
                        {client.address.country && <p>{client.address.country}</p>}
                      </div>
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Tax and Accounting Information */}
              <div className="space-y-3">
                <h3>Podatki i księgowość</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Forma rozliczenia podatkowego</p>
                    <p>{getTaxTypeLabel(client.taxType)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Rodzaj księgowości</p>
                    <p>{getAccountingTypeLabel(client.accountingType)}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* ZUS Information */}
              {client.zusInfo && (
                <div className="space-y-3">
                  <h3>Informacje ZUS</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                    {client.zusInfo.zusCode && (
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Kod ZUS</p>
                        <p>{client.zusInfo.zusCode}</p>
                      </div>
                    )}
                    {client.zusInfo.startDate && (
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Data rozpoczęcia</p>
                        <p>{new Date(client.zusInfo.startDate).toLocaleDateString('pl-PL')}</p>
                      </div>
                    )}
                    {client.zusInfo.calculatedEndDate && (
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Data zakończenia (obliczona)</p>
                        <p>{new Date(client.zusInfo.calculatedEndDate).toLocaleDateString('pl-PL')}</p>
                      </div>
                    )}
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Ubezpieczenie zdrowotne</p>
                      <p>{client.zusInfo.healthInsurance ? 'Tak' : 'Nie'}</p>
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              {/* Company Owners */}
              {client.owners && client.owners.length > 0 && (
                <>
                  <div className="space-y-3">
                    <h3>Właściciele / Wspólnicy</h3>
                    <div className="space-y-2 pl-6">
                      {client.owners.map((owner) => (
                        <div key={owner.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{owner.firstName} {owner.lastName}</p>
                            <p className="text-sm text-muted-foreground">
                              {owner.role === 'wlasciciel' ? 'Właściciel' : 
                               owner.role === 'wspolnik' ? 'Wspólnik' :
                               owner.role === 'prezes' ? 'Prezes' :
                               owner.role === 'prokurent' ? 'Prokurent' : 'Członek zarządu'} • {owner.share}% udziałów
                            </p>
                            {owner.email && (
                              <p className="text-xs text-muted-foreground">{owner.email}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* KSeF Integration */}
              <div className="space-y-3">
                <h3>Integracja KSeF</h3>
                <div className="pl-6">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${client.ksefEnabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <p>{client.ksefEnabled ? 'Włączona' : 'Wyłączona'}</p>
                  </div>
                  {client.ksefEnabled && client.ksefToken && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Token skonfigurowany
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Automatic Invoicing Settings */}
              {client.autoInvoicing && (
                <div className="space-y-3">
                  <h3 className="flex items-center gap-2">
                    Automatyczne fakturowanie
                    <Badge variant={client.autoInvoicing.enabled ? 'default' : 'secondary'}>
                      {client.autoInvoicing.enabled ? 'Włączone' : 'Wyłączone'}
                    </Badge>
                  </h3>
                  {client.autoInvoicing.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Częstotliwość</p>
                        <p>{
                          client.autoInvoicing.frequency === 'weekly' ? 'Co tydzień' :
                          client.autoInvoicing.frequency === 'monthly' ? 'Co miesiąc' :
                          client.autoInvoicing.frequency === 'quarterly' ? 'Co kwartał' :
                          client.autoInvoicing.frequency === 'yearly' ? 'Co rok' : 
                          client.autoInvoicing.frequency
                        }</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Kwota netto</p>
                        <p className="font-semibold">{client.autoInvoicing.amount.toFixed(2)} zł</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Stawka VAT</p>
                        <p>{client.autoInvoicing.vatRate}%</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Termin płatności</p>
                        <p>{client.autoInvoicing.paymentTerms} dni</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Limit dokumentów</p>
                        <p>{client.autoInvoicing.documentsLimit} miesięcznie</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Ostrzeżenia o limicie</p>
                        <p>{client.autoInvoicing.documentsLimitWarning ? 'Włączone' : 'Wyłączone'}</p>
                      </div>
                      {client.autoInvoicing.description && (
                        <div className="col-span-2 space-y-1">
                          <p className="text-sm text-muted-foreground">Opis usługi</p>
                          <p>{client.autoInvoicing.description}</p>
                        </div>
                      )}
                      {client.autoInvoicing.nextInvoiceDate && (
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Następna faktura</p>
                          <p>{new Date(client.autoInvoicing.nextInvoiceDate).toLocaleDateString('pl-PL')}</p>
                        </div>
                      )}
                      {client.autoInvoicing.items && client.autoInvoicing.items.length > 0 && (
                        <div className="col-span-2 space-y-1">
                          <p className="text-sm text-muted-foreground">Pozycje na fakturze</p>
                          <div className="space-y-1">
                            {client.autoInvoicing.items.map((item, index) => (
                              <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                                <strong>{item.name}</strong> - {item.quantity} {item.unit || 'szt'} × {item.unitPrice.toFixed(2)} zł
                                {item.description && <div className="text-muted-foreground">{item.description}</div>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {client.autoInvoicing.notes && (
                        <div className="col-span-2 space-y-1">
                          <p className="text-sm text-muted-foreground">Uwagi dotyczące fakturowania</p>
                          <p className="text-sm">{client.autoInvoicing.notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <Separator />

              {/* Notes */}
              {client.notes && (
                <div className="space-y-3">
                  <h3>Notatki</h3>
                  <div className="pl-6">
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {client.notes}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Szybkie informacje</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Data dodania</p>
                  <p className="text-sm">
                    {new Date(client.dateAdded).toLocaleDateString('pl-PL')}
                  </p>
                </div>
              </div>
              
              {client.lastContact && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Ostatni kontakt</p>
                    <p className="text-sm">
                      {new Date(client.lastContact).toLocaleDateString('pl-PL')}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          {client.hiddenTags && client.hiddenTags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tagi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {client.hiddenTags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Akcje</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" size="sm">
                <Mail className="h-4 w-4 mr-2" />
                Wyślij Email
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                <Phone className="h-4 w-4 mr-2" />
                Zadzwoń do klienta
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Zaplanuj spotkanie
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}