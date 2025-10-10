import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Checkbox } from "./ui/checkbox";
import { Separator } from "./ui/separator";
import { Alert, AlertDescription } from "./ui/alert";
import { X, Plus, User, Building2, Calculator, Shield, Download, Mail, AlertCircle, Check } from "lucide-react";
import { Client, ClientFormData, CompanyOwner, CEIDGCompanyData } from "../types/client";
import { toast } from 'sonner';
import { validateEmail, validateEmailDomain, getEmailDomainType, calculateZusEndDate, formatDateRange, generateEmailFolders } from "../utils/validation";

interface ClientFormProps {
  client?: Client;
  onSave: (client: Partial<Client>) => void;
  onCancel: () => void;
}

export function ClientForm({ client, onSave, onCancel }: ClientFormProps) {
  const [formData, setFormData] = useState<ClientFormData>({
    firstName: client?.firstName || '',
    lastName: client?.lastName || '',
    emails: client?.emails || [''],
    phone: client?.phone || '',
    company: client?.company || '',
    position: client?.position || '',
    nip: client?.nip || '',
    regon: client?.regon || '',
    krs: client?.krs || '',
    street: client?.address?.street || '',
    city: client?.address?.city || '',
    state: client?.address?.state || '',
    zipCode: client?.address?.zipCode || '',
    country: client?.address?.country || 'Polska',
    status: client?.status || 'potencjalny',
    notes: client?.notes || '',
    tags: client?.tags?.join(', ') || '',
    businessType: client?.businessType || {
      spZoo: false,
      komandytowa: false,
      akcyjna: false,
      jednoosobowa: false,
      spolkaCywilna: false,
      fundacja: false,
      stowarzyszenie: false,
      other: ''
    },
    taxType: client?.taxType || {
      ryczalt: false,
      liniowy: false,
      zasadyOgolne: false,
      cit: false,
      citEstonski: false,
      kartaPodatkowa: false,
      other: ''
    },
    accountingType: client?.accountingType || {
      kpir: false,
      pelneKsiegi: false,
      ewidencjaProchodow: false,
      ryczaltEwidencyjny: false,
      other: ''
    },
    zusInfo: client?.zusInfo || {
      malyZus: false,
      pelnyZus: false,
      other: '',
      startDate: '',
      healthInsurance: true
    },
    ksefEnabled: client?.ksefEnabled || false,
    ksefToken: client?.ksefToken || '',
    employeeCount: client?.employeeCount || 0,
    // Email settings
    invoiceEmail: client?.invoiceEmail || '',
    taxNotificationEmails: client?.taxNotificationEmails || [''],
    // Automatic invoicing settings
    autoInvoicing: client?.autoInvoicing || {
      enabled: false,
      frequency: 'monthly',
      amount: 0,
      description: '',
      vatRate: 23,
      paymentTerms: 14,
      items: [],
      documentsLimit: 35,
      documentsLimitWarning: true
    }
  });

  const [tagInput, setTagInput] = useState('');
  const [currentTags, setCurrentTags] = useState<string[]>(client?.tags || []);
  const [owners, setOwners] = useState<CompanyOwner[]>(client?.owners || []);
  const [newOwner, setNewOwner] = useState<Partial<CompanyOwner>>({
    firstName: '',
    lastName: '',
    share: 0,
    role: 'wlasciciel'
  });
  const [loadingCEIDG, setLoadingCEIDG] = useState(false);
  const [emailFolders, setEmailFolders] = useState<string[]>(client?.emailFolders || []);

  // Aktualizacja dat ZUS przy zmianie typu lub daty rozpoczęcia
  useEffect(() => {
    if (formData.zusInfo.startDate) {
      const zusType = formData.zusInfo.malyZus ? 'maly' : 'pelny';
      const endDate = calculateZusEndDate(formData.zusInfo.startDate, zusType);
      // Aktualizacja automatyczna w formData nie jest bezpośrednia, ale używamy tego w wyświetlaniu
    }
  }, [formData.zusInfo.startDate, formData.zusInfo.malyZus, formData.zusInfo.pelnyZus]);

  // Aktualizacja folderów mailowych przy zmianie kluczowych danych
  useEffect(() => {
    const folders = generateEmailFolders({
      company: formData.company,
      firstName: formData.firstName,
      lastName: formData.lastName,
      businessType: formData.businessType,
      nip: formData.nip
    });
    setEmailFolders(folders);
  }, [formData.company, formData.firstName, formData.lastName, formData.businessType, formData.nip]);

  const handleInputChange = (field: keyof ClientFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEmailChange = (index: number, value: string) => {
    const updatedEmails = [...formData.emails];
    updatedEmails[index] = value;
    setFormData(prev => ({
      ...prev,
      emails: updatedEmails
    }));
  };

  const addEmail = () => {
    setFormData(prev => ({
      ...prev,
      emails: [...prev.emails, '']
    }));
  };

  const removeEmail = (index: number) => {
    if (formData.emails.length > 1) {
      const updatedEmails = formData.emails.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        emails: updatedEmails
      }));
    }
  };

  // Tax notification email handlers
  const handleTaxEmailChange = (index: number, value: string) => {
    const updatedEmails = [...(formData.taxNotificationEmails || [''])];
    updatedEmails[index] = value;
    setFormData(prev => ({
      ...prev,
      taxNotificationEmails: updatedEmails
    }));
  };

  const addTaxEmail = () => {
    setFormData(prev => ({
      ...prev,
      taxNotificationEmails: [...(prev.taxNotificationEmails || ['']), '']
    }));
  };

  const removeTaxEmail = (index: number) => {
    const emails = formData.taxNotificationEmails || [''];
    if (emails.length > 1) {
      const updatedEmails = emails.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        taxNotificationEmails: updatedEmails
      }));
    }
  };

  const handleCheckboxChange = (section: 'businessType' | 'taxType' | 'accountingType' | 'zusInfo', field: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: checked
      }
    }));
  };

  const handleCEIDGFetch = async () => {
    if (!formData.nip || formData.nip.length !== 10) {
      toast.error("Wprowadź poprawny 10-cyfrowy NIP");
      return;
    }

    setLoadingCEIDG(true);
    try {
      // Symulacja wywołania API CEIDG (w rzeczywistości wymagałoby prawdziwego API)
      const mockCEIDGData: CEIDGCompanyData = {
        nazwa: "Przykładowa Firma Sp. z o.o.",
        nip: formData.nip,
        regon: "123456789",
        adres: {
          ulica: "ul. Przykładowa 123",
          miasto: "Warszawa",
          kodPocztowy: "00-001",
          wojewodztwo: "mazowieckie"
        },
        pkd: ["6201Z", "6202Z"],
        dataRozpoczeciaDzialalnosci: "2020-01-15",
        status: "aktywna"
      };

      // Wypełnienie formularza danymi z CEIDG
      setFormData(prev => ({
        ...prev,
        company: mockCEIDGData.nazwa,
        regon: mockCEIDGData.regon || prev.regon,
        street: mockCEIDGData.adres.ulica,
        city: mockCEIDGData.adres.miasto,
        zipCode: mockCEIDGData.adres.kodPocztowy,
        state: mockCEIDGData.adres.wojewodztwo
      }));

      toast.success("Dane zostały pobrane z CEIDG i wypełnione w formularzu");
    } catch (error) {
      toast.error("Błąd podczas pobierania danych z CEIDG");
    } finally {
      setLoadingCEIDG(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !currentTags.includes(tagInput.trim())) {
      const newTags = [...currentTags, tagInput.trim()];
      setCurrentTags(newTags);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setCurrentTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const addOwner = () => {
    if (!newOwner.firstName || !newOwner.lastName || !newOwner.share) {
      toast.error("Wypełnij wszystkie wymagane pola właściciela");
      return;
    }

    const totalShares = owners.reduce((sum, owner) => sum + owner.share, 0) + newOwner.share;
    if (totalShares > 100) {
      toast.error("Suma udziałów nie może przekroczyć 100%");
      return;
    }

    const owner: CompanyOwner = {
      id: Date.now().toString(),
      firstName: newOwner.firstName!,
      lastName: newOwner.lastName!,
      pesel: newOwner.pesel,
      share: newOwner.share!,
      role: newOwner.role!,
      email: newOwner.email,
      phone: newOwner.phone
    };

    setOwners(prev => [...prev, owner]);
    setNewOwner({
      firstName: '',
      lastName: '',
      share: 0,
      role: 'wlasciciel'
    });
  };

  const removeOwner = (ownerId: string) => {
    setOwners(prev => prev.filter(owner => owner.id !== ownerId));
  };

  const renderZusDateRange = () => {
    if (!formData.zusInfo.startDate) return null;

    const zusType = formData.zusInfo.malyZus ? 'maly' : 'pelny';
    const endDate = calculateZusEndDate(formData.zusInfo.startDate, zusType);
    
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Okres: {formatDateRange(formData.zusInfo.startDate, endDate)}
          {formData.zusInfo.malyZus && " (Mały ZUS - 6 miesięcy)"}
        </AlertDescription>
      </Alert>
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.emails[0]) {
      toast.error("Wypełnij wszystkie wymagane pola");
      return;
    }

    // Walidacja emaili
    const invalidEmails = formData.emails.filter(email => email && !validateEmail(email));
    if (invalidEmails.length > 0) {
      toast.error("Niektóre adresy email są nieprawidłowe");
      return;
    }

    const validEmails = formData.emails.filter(email => email.trim() !== '');
    
    const clientData: Partial<Client> = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      emails: validEmails,
      phone: formData.phone,
      company: formData.company,
      position: formData.position,
      nip: formData.nip,
      regon: formData.regon,
      krs: formData.krs,
      address: {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country
      },
      status: formData.status,
      notes: formData.notes,
      tags: currentTags,
      dateAdded: client?.dateAdded || new Date().toISOString().split('T')[0],
      businessType: formData.businessType,
      taxType: formData.taxType,
      accountingType: formData.accountingType,
      zusInfo: {
        ...formData.zusInfo,
        calculatedEndDate: formData.zusInfo.startDate ? 
          calculateZusEndDate(formData.zusInfo.startDate, formData.zusInfo.malyZus ? 'maly' : 'pelny') : 
          undefined
      },
      owners,
      ksefEnabled: formData.ksefEnabled,
      ksefToken: formData.ksefToken,
      emailTemplates: client?.emailTemplates || [],
      employeeCount: formData.employeeCount,
      invoiceEmail: formData.invoiceEmail,
      taxNotificationEmails: formData.taxNotificationEmails?.filter(email => email.trim() !== '') || [],
      emailFolders
    };

    onSave(clientData);
    toast.success(client ? "Klient został zaktualizowany pomyślnie" : "Klient został dodany pomyślnie");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>{client ? 'Edytuj Klienta' : 'Dodaj Nowego Klienta'}</h1>
        <p className="text-muted-foreground">
          {client ? 'Zaktualizuj informacje o kliencie' : 'Wprowadź informacje o kliencie, aby dodać go do systemu'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Dane osobowe
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Imię *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nazwisko *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Multiple Email Fields */}
            <div className="space-y-4">
              <Label>Adresy email *</Label>
              {formData.emails.map((email, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => handleEmailChange(index, e.target.value)}
                        placeholder={index === 0 ? "email@example.com (główny)" : "dodatkowy@example.com"}
                        required={index === 0}
                      />
                      {email && (
                        <div className="mt-1 flex items-center gap-2">
                          {validateEmail(email) ? (
                            <div className="flex items-center gap-1 text-sm">
                              <Check className="h-3 w-3 text-green-600" />
                              <span className={getEmailDomainType(email) === 'business' ? 'text-blue-600' : 'text-muted-foreground'}>
                                {getEmailDomainType(email) === 'business' ? 'Domena firmowa' : 'Popularna domena'}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-sm text-red-600">
                              <AlertCircle className="h-3 w-3" />
                              <span>Nieprawidłowy format email</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {formData.emails.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeEmail(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addEmail}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Dodaj kolejny email
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+48 123 456 789"
              />
            </div>

            {/* Invoice Email */}
            <div className="space-y-2">
              <Label htmlFor="invoiceEmail">Email do faktur</Label>
              <Input
                id="invoiceEmail"
                type="email"
                value={formData.invoiceEmail || ''}
                onChange={(e) => handleInputChange('invoiceEmail', e.target.value)}
                placeholder="faktury@firma.pl"
              />
              <p className="text-sm text-muted-foreground">
                Dedykowany email do przesyłania faktur (opcjonalnie)
              </p>
            </div>

            {/* Tax Notification Emails */}
            <div className="space-y-4">
              <div>
                <Label>Emaile do powiadomień podatkowych</Label>
                <p className="text-sm text-muted-foreground">
                  Adresy email do przesyłania informacji podatkowych i dokumentów ZUS
                </p>
              </div>
              {(formData.taxNotificationEmails || ['']).map((email, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => handleTaxEmailChange(index, e.target.value)}
                        placeholder={index === 0 ? "podatki@firma.pl (główny)" : "dodatkowy@firma.pl"}
                      />
                      {email && (
                        <div className="mt-1 flex items-center gap-2">
                          {validateEmail(email) ? (
                            <div className="flex items-center gap-1 text-sm">
                              <Check className="h-3 w-3 text-green-600" />
                              <span className={getEmailDomainType(email) === 'business' ? 'text-blue-600' : 'text-muted-foreground'}>
                                {getEmailDomainType(email) === 'business' ? 'Domena firmowa' : 'Popularna domena'}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-sm text-red-600">
                              <AlertCircle className="h-3 w-3" />
                              <span>Nieprawidłowy format email</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {(formData.taxNotificationEmails || ['']).length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeTaxEmail(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTaxEmail}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Dodaj email podatkowy
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Company Information with CEIDG */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Informacje o firmie
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Nazwa firmy</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Stanowisko</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nip">NIP</Label>
                <div className="flex gap-2">
                  <Input
                    id="nip"
                    value={formData.nip}
                    onChange={(e) => handleInputChange('nip', e.target.value)}
                    placeholder="1234567890"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCEIDGFetch}
                    disabled={loadingCEIDG || !formData.nip}
                    className="whitespace-nowrap"
                  >
                    {loadingCEIDG ? (
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    ) : (
                      <Download className="mr-2 h-4 w-4" />
                    )}
                    Ściągnij z CEIDG
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="regon">REGON</Label>
                <Input
                  id="regon"
                  value={formData.regon}
                  onChange={(e) => handleInputChange('regon', e.target.value)}
                  placeholder="123456789"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="krs">KRS</Label>
                <Input
                  id="krs"
                  value={formData.krs}
                  onChange={(e) => handleInputChange('krs', e.target.value)}
                  placeholder="0000123456"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="employeeCount">Liczba pracowników</Label>
              <Input
                id="employeeCount"
                type="number"
                min="0"
                value={formData.employeeCount}
                onChange={(e) => handleInputChange('employeeCount', parseInt(e.target.value) || 0)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Business Type - Checkbox Style */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Rodzaj działalności
            </CardTitle>
            <CardDescription>Zaznacz wszystkie pasujące opcje</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { key: 'spZoo', label: 'Spółka z o.o.' },
                { key: 'komandytowa', label: 'Spółka komandytowa' },
                { key: 'akcyjna', label: 'Spółka akcyjna' },
                { key: 'jednoosobowa', label: 'Jednoosobowa działalność gospodarcza' },
                { key: 'spolkaCywilna', label: 'Spółka cywilna' },
                { key: 'fundacja', label: 'Fundacja' },
                { key: 'stowarzyszenie', label: 'Stowarzyszenie' }
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={`businessType-${key}`}
                    checked={formData.businessType[key as keyof typeof formData.businessType] as boolean}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange('businessType', key, checked as boolean)
                    }
                  />
                  <Label htmlFor={`businessType-${key}`}>{label}</Label>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessTypeOther">Inne</Label>
              <Input
                id="businessTypeOther"
                value={formData.businessType.other}
                onChange={(e) => handleCheckboxChange('businessType', 'other', e.target.value)}
                placeholder="Opisz inny rodzaj działalności"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tax Type - Checkbox Style */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Forma rozliczenia podatkowego
            </CardTitle>
            <CardDescription>Zaznacz wszystkie pasujące opcje</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { key: 'ryczalt', label: 'Ryczałt od przychodów ewidencjonowanych' },
                { key: 'liniowy', label: 'Podatek liniowy 19%' },
                { key: 'zasadyOgolne', label: 'Zasady ogólne (skala podatkowa)' },
                { key: 'cit', label: 'Podatek dochodowy od osób prawnych (CIT)' },
                { key: 'citEstonski', label: 'Estoński CIT' },
                { key: 'kartaPodatkowa', label: 'Karta podatkowa' }
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={`taxType-${key}`}
                    checked={formData.taxType[key as keyof typeof formData.taxType] as boolean}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange('taxType', key, checked as boolean)
                    }
                  />
                  <Label htmlFor={`taxType-${key}`}>{label}</Label>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxTypeOther">Inne</Label>
              <Input
                id="taxTypeOther"
                value={formData.taxType.other}
                onChange={(e) => handleCheckboxChange('taxType', 'other', e.target.value)}
                placeholder="Opisz inną formę rozliczenia"
              />
            </div>
          </CardContent>
        </Card>

        {/* Accounting Type - Checkbox Style */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Rodzaj księgowości
            </CardTitle>
            <CardDescription>Zaznacz wszystkie pasujące opcje</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { key: 'kpir', label: 'Księga przychodów i rozchodów' },
                { key: 'pelneKsiegi', label: 'Pełne księgi rachunkowe' },
                { key: 'ewidencjaProchodow', label: 'Ewidencja przychodów' },
                { key: 'ryczaltEwidencyjny', label: 'Ewidencja dla ryczałtu' }
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={`accountingType-${key}`}
                    checked={formData.accountingType[key as keyof typeof formData.accountingType] as boolean}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange('accountingType', key, checked as boolean)
                    }
                  />
                  <Label htmlFor={`accountingType-${key}`}>{label}</Label>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountingTypeOther">Inne</Label>
              <Input
                id="accountingTypeOther"
                value={formData.accountingType.other}
                onChange={(e) => handleCheckboxChange('accountingType', 'other', e.target.value)}
                placeholder="Opisz inny rodzaj księgowości"
              />
            </div>
          </CardContent>
        </Card>

        {/* ZUS Information - Updated */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Informacje ZUS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="malyZus"
                  checked={formData.zusInfo.malyZus}
                  onCheckedChange={(checked) => {
                    handleCheckboxChange('zusInfo', 'malyZus', checked as boolean);
                    if (checked) {
                      handleCheckboxChange('zusInfo', 'pelnyZus', false);
                    }
                  }}
                />
                <Label htmlFor="malyZus">Mały ZUS</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pelnyZus"
                  checked={formData.zusInfo.pelnyZus}
                  onCheckedChange={(checked) => {
                    handleCheckboxChange('zusInfo', 'pelnyZus', checked as boolean);
                    if (checked) {
                      handleCheckboxChange('zusInfo', 'malyZus', false);
                    }
                  }}
                />
                <Label htmlFor="pelnyZus">Pełny ZUS</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="zusOther">Inne rodzaje składek ZUS</Label>
              <Input
                id="zusOther"
                value={formData.zusInfo.other}
                onChange={(e) => handleCheckboxChange('zusInfo', 'other', e.target.value)}
                placeholder="Opisz inne rodzaje składek"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="zusStartDate">Data rozpoczęcia płacenia składek</Label>
              <Input
                id="zusStartDate"
                type="date"
                value={formData.zusInfo.startDate}
                onChange={(e) => handleCheckboxChange('zusInfo', 'startDate', e.target.value)}
              />
            </div>

            {renderZusDateRange()}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="healthInsurance"
                checked={formData.zusInfo.healthInsurance}
                onCheckedChange={(checked) => handleCheckboxChange('zusInfo', 'healthInsurance', checked as boolean)}
              />
              <Label htmlFor="healthInsurance">Ubezpieczenie zdrowotne</Label>
            </div>
          </CardContent>
        </Card>

        {/* Email Folders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Automatyczne foldery mailowe
            </CardTitle>
            <CardDescription>
              Foldery zostały automatycznie wygenerowane na podstawie danych klienta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {emailFolders.map((folder, index) => (
                <Badge key={index} variant="outline">
                  {folder}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Company Owners */}
        <Card>
          <CardHeader>
            <CardTitle>Właściciele / Wspólnicy</CardTitle>
            <CardDescription>
              Dodaj informacje o właścicielach firmy i ich udziałach
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {owners.length > 0 && (
              <div className="space-y-2">
                {owners.map((owner) => (
                  <div key={owner.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{owner.firstName} {owner.lastName}</p>
                      <p className="text-sm text-muted-foreground">
                        {owner.role} • {owner.share}% udziałów
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOwner(owner.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="text-sm text-muted-foreground">
                  Łącznie udziałów: {owners.reduce((sum, owner) => sum + owner.share, 0)}%
                </div>
              </div>
            )}

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Imię</Label>
                <Input
                  value={newOwner.firstName || ''}
                  onChange={(e) => setNewOwner(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Imię właściciela"
                />
              </div>
              <div className="space-y-2">
                <Label>Nazwisko</Label>
                <Input
                  value={newOwner.lastName || ''}
                  onChange={(e) => setNewOwner(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Nazwisko właściciela"
                />
              </div>
              <div className="space-y-2">
                <Label>Udział (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={newOwner.share || ''}
                  onChange={(e) => setNewOwner(prev => ({ ...prev, share: parseFloat(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Rola</Label>
                <Select
                  value={newOwner.role}
                  onValueChange={(value: any) => setNewOwner(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wlasciciel">Właściciel</SelectItem>
                    <SelectItem value="wspolnik">Wspólnik</SelectItem>
                    <SelectItem value="prezes">Prezes</SelectItem>
                    <SelectItem value="prokurent">Prokurent</SelectItem>
                    <SelectItem value="czlonek_zarzadu">Członek zarządu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button type="button" onClick={addOwner}>
                  <Plus className="mr-2 h-4 w-4" />
                  Dodaj właściciela
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle>Adres</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="street">Ulica</Label>
              <Input
                id="street"
                value={formData.street}
                onChange={(e) => handleInputChange('street', e.target.value)}
                placeholder="ul. Przykładowa 123"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Miasto</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Warszawa"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Województwo</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="mazowieckie"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">Kod pocztowy</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  placeholder="00-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Kraj</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  placeholder="Polska"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KSeF Integration */}
        <Card>
          <CardHeader>
            <CardTitle>Integracja KSeF</CardTitle>
            <CardDescription>
              Krajowy System e-Faktur - obowiązkowe e-faktury
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="ksefEnabled"
                checked={formData.ksefEnabled}
                onCheckedChange={(checked) => handleInputChange('ksefEnabled', checked)}
              />
              <Label htmlFor="ksefEnabled">Włącz integrację z KSeF</Label>
            </div>
            {formData.ksefEnabled && (
              <div className="space-y-2">
                <Label htmlFor="ksefToken">Token dostępowy KSeF</Label>
                <Input
                  id="ksefToken"
                  type="password"
                  value={formData.ksefToken}
                  onChange={(e) => handleInputChange('ksefToken', e.target.value)}
                  placeholder="Wprowadź token KSeF"
                />
                <p className="text-sm text-muted-foreground">
                  Token można wygenerować w systemie KSeF po zalogowaniu
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informacje dodatkowe</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'aktualny' | 'archiwalny' | 'potencjalny') => 
                  handleInputChange('status', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="potencjalny">Potencjalny</SelectItem>
                  <SelectItem value="aktualny">Aktualny</SelectItem>
                  <SelectItem value="archiwalny">Archiwalny</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tagi</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Dodaj tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  Dodaj
                </Button>
              </div>
              {currentTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {currentTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notatki</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={4}
                placeholder="Dodatkowe informacje o tym kliencie..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Automatic Invoicing Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Automatyczne fakturowanie
            </CardTitle>
            <CardDescription>
              Skonfiguruj automatyczne generowanie faktur dla tego klienta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="auto-invoicing-enabled"
                checked={formData.autoInvoicing?.enabled || false}
                onCheckedChange={(checked) => setFormData(prev => ({
                  ...prev,
                  autoInvoicing: {
                    ...prev.autoInvoicing,
                    enabled: checked,
                    frequency: prev.autoInvoicing?.frequency || 'monthly',
                    amount: prev.autoInvoicing?.amount || 0,
                    description: prev.autoInvoicing?.description || '',
                    vatRate: prev.autoInvoicing?.vatRate || 23,
                    paymentTerms: prev.autoInvoicing?.paymentTerms || 14,
                    items: prev.autoInvoicing?.items || [],
                    documentsLimit: prev.autoInvoicing?.documentsLimit || 35,
                    documentsLimitWarning: prev.autoInvoicing?.documentsLimitWarning || true
                  }
                }))}
              />
              <Label htmlFor="auto-invoicing-enabled">Włącz automatyczne fakturowanie</Label>
            </div>

            {formData.autoInvoicing?.enabled && (
              <div className="space-y-4 pl-6 border-l-2 border-blue-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Częstotliwość</Label>
                    <Select
                      value={formData.autoInvoicing?.frequency || 'monthly'}
                      onValueChange={(value) => setFormData(prev => ({
                        ...prev,
                        autoInvoicing: {
                          ...prev.autoInvoicing!,
                          frequency: value as 'weekly' | 'monthly' | 'quarterly' | 'yearly'
                        }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz częstotliwość" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Co tydzień</SelectItem>
                        <SelectItem value="monthly">Co miesiąc</SelectItem>
                        <SelectItem value="quarterly">Co kwartał</SelectItem>
                        <SelectItem value="yearly">Co rok</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Kwota netto</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.autoInvoicing?.amount || 0}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        autoInvoicing: {
                          ...prev.autoInvoicing!,
                          amount: parseFloat(e.target.value) || 0
                        }
                      }))}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Opis usługi</Label>
                  <Input
                    value={formData.autoInvoicing?.description || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      autoInvoicing: {
                        ...prev.autoInvoicing!,
                        description: e.target.value
                      }
                    }))}
                    placeholder="np. Obsługa księgowa pełna"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Stawka VAT (%)</Label>
                    <Select
                      value={formData.autoInvoicing?.vatRate?.toString() || '23'}
                      onValueChange={(value) => setFormData(prev => ({
                        ...prev,
                        autoInvoicing: {
                          ...prev.autoInvoicing!,
                          vatRate: parseInt(value)
                        }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0% (zwolnione)</SelectItem>
                        <SelectItem value="5">5%</SelectItem>
                        <SelectItem value="8">8%</SelectItem>
                        <SelectItem value="23">23%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Termin płatności (dni)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="120"
                      value={formData.autoInvoicing?.paymentTerms || 14}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        autoInvoicing: {
                          ...prev.autoInvoicing!,
                          paymentTerms: parseInt(e.target.value) || 14
                        }
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Limit dokumentów</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.autoInvoicing?.documentsLimit || 35}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        autoInvoicing: {
                          ...prev.autoInvoicing!,
                          documentsLimit: parseInt(e.target.value) || 35
                        }
                      }))}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="documents-warning"
                    checked={formData.autoInvoicing?.documentsLimitWarning || true}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      autoInvoicing: {
                        ...prev.autoInvoicing!,
                        documentsLimitWarning: checked
                      }
                    }))}
                  />
                  <Label htmlFor="documents-warning">Ostrzegaj o przekroczeniu limitu dokumentów</Label>
                </div>

                <div className="space-y-2">
                  <Label>Dodatkowe uwagi dotyczące fakturowania</Label>
                  <Textarea
                    value={formData.autoInvoicing?.notes || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      autoInvoicing: {
                        ...prev.autoInvoicing!,
                        notes: e.target.value
                      }
                    }))}
                    rows={2}
                    placeholder="Specjalne uwagi, dodatkowe usługi, itp."
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button type="submit">
            {client ? 'Zaktualizuj Klienta' : 'Dodaj Klienta'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Anuluj
          </Button>
        </div>
      </form>
    </div>
  );
}