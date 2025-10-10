import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Separator } from "./ui/separator";
import { Alert, AlertDescription } from "./ui/alert";
import { X, Plus, User, Building2, Calculator, Shield, Download, Mail, AlertCircle, Check } from "lucide-react";
import { Client, Owner, CEIDGCompanyData } from "../types/client";
import { toast } from 'sonner';

interface ClientFormProps {
  client?: Client;
  onSave: (client: Partial<Client>) => void;
  onCancel: () => void;
}

interface ClientFormData {
  // Dane osobowe
  firstName: string;
  lastName: string;
  emails: string[];
  phone: string;
  position: string;
  
  // Informacje o firmie
  companyName: string;
  nip: string;
  regon: string;
  krs: string;
  employeeCount: number;
  
  // Adres
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  
  // Status i notatki
  status: 'aktualny' | 'archiwalny' | 'potencjalny';
  notes: string;
  additionalInfo: string;
  
  // Single choice fields
  businessType: 'dzialalnoscGospodarcza' | 'spZoo' | 'komandytowa' | 'akcyjna' | 'jednoosobowa' | 'spolkaCywilna' | 'fundacja' | 'stowarzyszenie' | 'other';
  businessTypeOther: string;
  
  taxType: 'ryczalt' | 'liniowy' | 'zasadyOgolne' | 'cit' | 'citEstonski' | 'kartaPodatkowa' | 'other';
  taxTypeOther: string;
  
  accountingType: 'kpir' | 'pelneKsiegi' | 'ewidencjaPrzychodow' | 'ryczaltEwidencyjny' | 'other';
  accountingTypeOther: string;
  
  zusType: 'malyZus' | 'pelnyZus' | 'zwolnienieZZus' | 'zusNaUmowie' | 'other';
  zusTypeOther: string;
  
  // ZUS info
  zusStartDate: string;
  healthInsurance: boolean;
  zusCode: string;
  
  // K-SeF
  ksefEnabled: boolean;
  ksefToken: string;
}

export function NewClientForm({ client, onSave, onCancel }: ClientFormProps) {
  const [formData, setFormData] = useState<ClientFormData>({
    firstName: client?.firstName || '',
    lastName: client?.lastName || '',
    emails: client?.emails || [''],
    phone: client?.phone || '',
    position: client?.position || '',
    companyName: client?.companyName || '',
    nip: client?.nip || '',
    regon: client?.regon || '',
    krs: client?.krs || '',
    employeeCount: client?.employeeCount || 0,
    street: client?.address?.street || '',
    city: client?.address?.city || '',
    state: client?.address?.state || '',
    zipCode: client?.address?.zipCode || '',
    country: client?.address?.country || 'Polska',
    status: client?.status || 'potencjalny',
    notes: client?.notes || '',
    additionalInfo: client?.additionalInfo || '',
    businessType: client?.businessType || 'dzialalnoscGospodarcza',
    businessTypeOther: client?.businessTypeOther || '',
    taxType: client?.taxType || 'ryczalt',
    taxTypeOther: client?.taxTypeOther || '',
    accountingType: client?.accountingType || 'kpir',
    accountingTypeOther: client?.accountingTypeOther || '',
    zusType: client?.zusType || 'malyZus',
    zusTypeOther: client?.zusTypeOther || '',
    zusStartDate: client?.zusInfo?.startDate || '',
    healthInsurance: client?.zusInfo?.healthInsurance || false,
    zusCode: client?.zusInfo?.zusCode || '',
    ksefEnabled: client?.ksefEnabled || false,
    ksefToken: client?.ksefToken || ''
  });

  const [owners, setOwners] = useState<Owner[]>(client?.owners || []);
  const [loadingCEIDG, setLoadingCEIDG] = useState(false);
  const [emailFolders, setEmailFolders] = useState<string[]>([]);

  // Generowanie folderów mailowych
  const generateEmailFolders = (companyName: string, businessType: string): string[] => {
    if (!companyName) return [];
    
    const cleanName = companyName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
    
    if (businessType === 'dzialalnoscGospodarcza') {
      return [cleanName];
    } else {
      const suffix = businessType === 'spZoo' ? '_sp_z_o_o' : 
                    businessType === 'komandytowa' ? '_sp_k' :
                    businessType === 'akcyjna' ? '_sa' :
                    businessType === 'fundacja' ? '_fundacja' :
                    businessType === 'stowarzyszenie' ? '_stowarzyszenie' : '';
      return [cleanName + suffix];
    }
  };

  // Generowanie ukrytych tagów
  const generateHiddenTags = (): string[] => {
    return [
      `business_${formData.businessType}`,
      `tax_${formData.taxType}`,
      `accounting_${formData.accountingType}`,
      `zus_${formData.zusType}`
    ];
  };

  // Aktualizacja folderów przy zmianie danych
  useEffect(() => {
    const folders = generateEmailFolders(formData.companyName, formData.businessType);
    setEmailFolders(folders);
  }, [formData.companyName, formData.businessType]);

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

  const handleCEIDGFetch = async () => {
    if (!formData.nip || formData.nip.length !== 10) {
      toast.error("Wprowadź poprawny 10-cyfrowy NIP");
      return;
    }

    setLoadingCEIDG(true);
    try {
      // Symulacja API CEIDG
      const mockData: CEIDGCompanyData = {
        nazwa: "Przykładowa Firma Sp. z o.o.",
        nip: formData.nip,
        regon: "123456789",
        adres: {
          ulica: "ul. Przykładowa 123",
          miasto: "Warszawa",
          kodPocztowy: "00-001",
          wojewodztwo: "mazowieckie"
        },
        pkd: ["6201Z"],
        dataRozpoczeciaDzialalnosci: "2020-01-15",
        status: "aktywna"
      };

      setFormData(prev => ({
        ...prev,
        companyName: mockData.nazwa,
        regon: mockData.regon || prev.regon,
        street: mockData.adres.ulica,
        city: mockData.adres.miasto,
        zipCode: mockData.adres.kodPocztowy,
        state: mockData.adres.wojewodztwo
      }));

      toast.success("Dane zostały pobrane z CEIDG");
    } catch (error) {
      toast.error("Błąd podczas pobierania danych z CEIDG");
    } finally {
      setLoadingCEIDG(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.emails[0]) {
      toast.error("Wypełnij wszystkie wymagane pola");
      return;
    }

    const validEmails = formData.emails.filter(email => email.trim() !== '');
    
    const clientData: Partial<Client> = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      emails: validEmails,
      phone: formData.phone,
      companyName: formData.companyName,
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
      additionalInfo: formData.additionalInfo,
      dateAdded: client?.dateAdded || new Date().toISOString().split('T')[0],
      businessType: formData.businessType,
      businessTypeOther: formData.businessTypeOther,
      taxType: formData.taxType,
      taxTypeOther: formData.taxTypeOther,
      accountingType: formData.accountingType,
      accountingTypeOther: formData.accountingTypeOther,
      zusType: formData.zusType,
      zusTypeOther: formData.zusTypeOther,
      zusInfo: {
        startDate: formData.zusStartDate,
        healthInsurance: formData.healthInsurance,
        zusCode: formData.zusCode
      },
      owners,
      ksefEnabled: formData.ksefEnabled,
      ksefToken: formData.ksefToken,
      emailTemplates: client?.emailTemplates || [],
      employeeCount: formData.employeeCount,
      emailFolders,
      communicationEmails: client?.communicationEmails || [],
      invoiceEmail: validEmails[0],
      taxNotificationEmails: validEmails,
      hiddenTags: generateHiddenTags()
    };

    onSave(clientData);
    toast.success(client ? "Klient został zaktualizowany" : "Klient został dodany");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>{client ? 'Edytuj Klienta' : 'Dodaj Nowego Klienta'}</h1>
        <p className="text-muted-foreground">
          {client ? 'Zaktualizuj informacje o kliencie' : 'Wprowadź informacje o kliencie'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informacje o firmie - TERAZ PIERWSZE */}
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
                <Label htmlFor="companyName">Nazwa firmy</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                />
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
                    CEIDG
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
          </CardContent>
        </Card>

        {/* Dane osobowe - TERAZ DRUGIE */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Dane osobowe
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <div className="space-y-2">
                <Label htmlFor="position">Stanowisko</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                />
              </div>
            </div>

            {/* Emaile */}
            <div className="space-y-4">
              <Label>Adresy email *</Label>
              {formData.emails.map((email, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailChange(index, e.target.value)}
                    placeholder={index === 0 ? "email@example.com (główny)" : "dodatkowy@example.com"}
                    required={index === 0}
                  />
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
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addEmail}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Dodaj email
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
          </CardContent>
        </Card>

        {/* Adres */}
        <Card>
          <CardHeader>
            <CardTitle>Adres</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="street">Ulica</Label>
                <Input
                  id="street"
                  value={formData.street}
                  onChange={(e) => handleInputChange('street', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Miasto</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">Kod pocztowy</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Województwo</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rodzaj działalności - RADIO */}
        <Card>
          <CardHeader>
            <CardTitle>Rodzaj działalności</CardTitle>
            <CardDescription>Wybierz jeden rodzaj działalności</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={formData.businessType}
              onValueChange={(value) => handleInputChange('businessType', value)}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dzialalnoscGospodarcza" id="businessType-dg" />
                  <Label htmlFor="businessType-dg">Działalność gospodarcza</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="spZoo" id="businessType-spzoo" />
                  <Label htmlFor="businessType-spzoo">Spółka z o.o.</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="komandytowa" id="businessType-kom" />
                  <Label htmlFor="businessType-kom">Spółka komandytowa</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="akcyjna" id="businessType-sa" />
                  <Label htmlFor="businessType-sa">Spółka akcyjna</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="jednoosobowa" id="businessType-jdg" />
                  <Label htmlFor="businessType-jdg">Jednoosobowa działalność</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="spolkaCywilna" id="businessType-sc" />
                  <Label htmlFor="businessType-sc">Spółka cywilna</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fundacja" id="businessType-fundacja" />
                  <Label htmlFor="businessType-fundacja">Fundacja</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="stowarzyszenie" id="businessType-stow" />
                  <Label htmlFor="businessType-stow">Stowarzyszenie</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="businessType-other" />
                  <Label htmlFor="businessType-other">Inne</Label>
                </div>
              </div>
            </RadioGroup>
            {formData.businessType === 'other' && (
              <div className="mt-4 space-y-2">
                <Label htmlFor="businessTypeOther">Opisz rodzaj działalności</Label>
                <Input
                  id="businessTypeOther"
                  value={formData.businessTypeOther}
                  onChange={(e) => handleInputChange('businessTypeOther', e.target.value)}
                  placeholder="Wpisz inny rodzaj działalności"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Forma rozliczenia podatkowego - RADIO */}
        <Card>
          <CardHeader>
            <CardTitle>Forma rozliczenia podatkowego</CardTitle>
            <CardDescription>Wybierz jedną formę rozliczenia</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={formData.taxType}
              onValueChange={(value) => handleInputChange('taxType', value)}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ryczalt" id="taxType-ryczalt" />
                  <Label htmlFor="taxType-ryczalt">Ryczałt ewidencjonowany</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="liniowy" id="taxType-liniowy" />
                  <Label htmlFor="taxType-liniowy">Podatek liniowy 19%</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="zasadyOgolne" id="taxType-zasady" />
                  <Label htmlFor="taxType-zasady">Zasady ogólne (skala)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cit" id="taxType-cit" />
                  <Label htmlFor="taxType-cit">CIT</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="citEstonski" id="taxType-est" />
                  <Label htmlFor="taxType-est">Estoński CIT</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="kartaPodatkowa" id="taxType-karta" />
                  <Label htmlFor="taxType-karta">Karta podatkowa</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="taxType-other" />
                  <Label htmlFor="taxType-other">Inne</Label>
                </div>
              </div>
            </RadioGroup>
            {formData.taxType === 'other' && (
              <div className="mt-4 space-y-2">
                <Label htmlFor="taxTypeOther">Opisz formę rozliczenia</Label>
                <Input
                  id="taxTypeOther"
                  value={formData.taxTypeOther}
                  onChange={(e) => handleInputChange('taxTypeOther', e.target.value)}
                  placeholder="Wpisz inną formę rozliczenia"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rodzaj księgowości - RADIO */}
        <Card>
          <CardHeader>
            <CardTitle>Rodzaj księgowości</CardTitle>
            <CardDescription>Wybierz jeden rodzaj księgowości</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={formData.accountingType}
              onValueChange={(value) => handleInputChange('accountingType', value)}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="kpir" id="accountingType-kpir" />
                  <Label htmlFor="accountingType-kpir">Księga przychodów i rozchodów</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pelneKsiegi" id="accountingType-pelne" />
                  <Label htmlFor="accountingType-pelne">Pełne księgi rachunkowe</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ewidencjaPrzychodow" id="accountingType-ewidencja" />
                  <Label htmlFor="accountingType-ewidencja">Ewidencja przychodów</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ryczaltEwidencyjny" id="accountingType-ryczalt" />
                  <Label htmlFor="accountingType-ryczalt">Ewidencja dla ryczałtu</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="accountingType-other" />
                  <Label htmlFor="accountingType-other">Inne</Label>
                </div>
              </div>
            </RadioGroup>
            {formData.accountingType === 'other' && (
              <div className="mt-4 space-y-2">
                <Label htmlFor="accountingTypeOther">Opisz rodzaj księgowości</Label>
                <Input
                  id="accountingTypeOther"
                  value={formData.accountingTypeOther}
                  onChange={(e) => handleInputChange('accountingTypeOther', e.target.value)}
                  placeholder="Wpisz inny rodzaj księgowości"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rodzaj ZUS - RADIO */}
        <Card>
          <CardHeader>
            <CardTitle>Rodzaj ZUS</CardTitle>
            <CardDescription>Wybierz jeden rodzaj ZUS</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup
              value={formData.zusType}
              onValueChange={(value) => handleInputChange('zusType', value)}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="malyZus" id="zusType-maly" />
                  <Label htmlFor="zusType-maly">Mały ZUS</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pelnyZus" id="zusType-pelny" />
                  <Label htmlFor="zusType-pelny">Pełny ZUS</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="zwolnienieZZus" id="zusType-zwolnienie" />
                  <Label htmlFor="zusType-zwolnienie">Zwolnienie z ZUS</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="zusNaUmowie" id="zusType-umowa" />
                  <Label htmlFor="zusType-umowa">ZUS na umowie</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="zusType-other" />
                  <Label htmlFor="zusType-other">Inne</Label>
                </div>
              </div>
            </RadioGroup>
            
            {formData.zusType === 'other' && (
              <div className="space-y-2">
                <Label htmlFor="zusTypeOther">Dodatkowe informacje</Label>
                <Input
                  id="zusTypeOther"
                  value={formData.zusTypeOther}
                  onChange={(e) => handleInputChange('zusTypeOther', e.target.value)}
                  placeholder="Opisz rodzaj ZUS"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="zusStartDate">Data rozpoczęcia ZUS</Label>
                <Input
                  id="zusStartDate"
                  type="date"
                  value={formData.zusStartDate}
                  onChange={(e) => handleInputChange('zusStartDate', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zusCode">Kod ZUS</Label>
                <Input
                  id="zusCode"
                  value={formData.zusCode}
                  onChange={(e) => handleInputChange('zusCode', e.target.value)}
                  placeholder="510, 521, etc."
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="healthInsurance"
                checked={formData.healthInsurance}
                onChange={(e) => handleInputChange('healthInsurance', e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="healthInsurance">Ubezpieczenie zdrowotne</Label>
            </div>
          </CardContent>
        </Card>

        {/* Dodatkowe informacje */}
        <Card>
          <CardHeader>
            <CardTitle>Dodatkowe informacje</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aktualny">Aktualny</SelectItem>
                  <SelectItem value="potencjalny">Potencjalny</SelectItem>
                  <SelectItem value="archiwalny">Archiwalny</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalInfo">Dodatkowe informacje</Label>
              <Textarea
                id="additionalInfo"
                value={formData.additionalInfo}
                onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                placeholder="Dodatkowe informacje o kliencie..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notatki</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Notatki dotyczące klienta..."
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="ksefEnabled"
                checked={formData.ksefEnabled}
                onChange={(e) => handleInputChange('ksefEnabled', e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="ksefEnabled">K-SeF włączony</Label>
            </div>

            {formData.ksefEnabled && (
              <div className="space-y-2">
                <Label htmlFor="ksefToken">Token K-SeF</Label>
                <Input
                  id="ksefToken"
                  value={formData.ksefToken}
                  onChange={(e) => handleInputChange('ksefToken', e.target.value)}
                  placeholder="Token K-SeF"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Automatyczne foldery */}
        {emailFolders.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Automatyczne foldery mailowe
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {emailFolders.map((folder, index) => (
                  <Badge key={index} variant="secondary">{folder}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Przyciski */}
        <div className="flex gap-4">
          <Button type="submit">
            {client ? 'Zaktualizuj' : 'Dodaj'} Klienta
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Anuluj
          </Button>
        </div>
      </form>
    </div>
  );
}