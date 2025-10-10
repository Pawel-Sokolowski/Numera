import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Switch } from "./ui/switch";
import { 
  Settings, 
  Building2, 
  FileText, 
  Upload, 
  Eye, 
  Edit, 
  Save,
  Image as ImageIcon,
  Trash2,
  Copy,
  Download,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Hash,
  Database
} from "lucide-react";
import { toast } from 'sonner';

interface CompanyData {
  name: string;
  nip: string;
  regon: string;
  krs: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  contact: {
    phone: string;
    email: string;
    website: string;
  };
  bank: {
    name: string;
    accountNumber: string;
    swift: string;
  };
  logo: string | null;
  taxForm: 'vat' | 'ryczalt' | 'skala';
  vatNumber: string;
}

interface InvoiceTemplate {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  layout: 'standard' | 'minimal' | 'detailed';
  colors: {
    primary: string;
    secondary: string;
    text: string;
  };
  showLogo: boolean;
  showPaymentTerms: boolean;
  showBankDetails: boolean;
  headerText: string;
  footerText: string;
  createdAt: string;
  lastModified: string;
}

export function SystemSettings() {
  const [activeTab, setActiveTab] = useState<string>("company");
  const [isEditing, setIsEditing] = useState(false);

  // Mock dane firmy - w rzeczywistej aplikacji pobierane z bazy danych
  const [companyData, setCompanyData] = useState<CompanyData>({
    name: "Biuro Rachunkowe EXPERT",
    nip: "1234567890",
    regon: "123456789",
    krs: "0000123456",
    address: {
      street: "ul. Księgowa 15/3",
      city: "Warszawa",
      postalCode: "00-001",
      country: "Polska"
    },
    contact: {
      phone: "+48 22 123 45 67",
      email: "kontakt@expert.pl",
      website: "www.expert.pl"
    },
    bank: {
      name: "Bank PKO BP",
      accountNumber: "12 1234 5678 9012 3456 7890 1234",
      swift: "PKOPPLPW"
    },
    logo: null,
    taxForm: 'vat',
    vatNumber: "PL1234567890"
  });

  // Mock szablony faktur
  const [invoiceTemplates, setInvoiceTemplates] = useState<InvoiceTemplate[]>([
    {
      id: "1",
      name: "Szablon Standardowy",
      description: "Klasyczny szablon faktury z logo firmy",
      isDefault: true,
      layout: 'standard',
      colors: {
        primary: "#030213",
        secondary: "#ececf0",
        text: "#000000"
      },
      showLogo: true,
      showPaymentTerms: true,
      showBankDetails: true,
      headerText: "FAKTURA VAT",
      footerText: "Dziękujemy za współpracę",
      createdAt: "2025-01-01",
      lastModified: "2025-09-15"
    },
    {
      id: "2",
      name: "Szablon Minimalny",
      description: "Uproszczony szablon dla szybkich faktur",
      isDefault: false,
      layout: 'minimal',
      colors: {
        primary: "#6366f1",
        secondary: "#f8fafc",
        text: "#1e293b"
      },
      showLogo: false,
      showPaymentTerms: false,
      showBankDetails: true,
      headerText: "FAKTURA",
      footerText: "",
      createdAt: "2025-02-15",
      lastModified: "2025-08-20"
    }
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState<InvoiceTemplate | null>(null);

  const handleSaveCompanyData = () => {
    // W rzeczywistej aplikacji tutaj byłaby komunikacja z API
    toast.success("Dane firmy zostały zapisane");
    setIsEditing(false);
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // W rzeczywistej aplikacji tutaj byłby upload do serwera
      const reader = new FileReader();
      reader.onload = (e) => {
        setCompanyData(prev => ({
          ...prev,
          logo: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
      toast.success("Logo zostało załadowane");
    }
  };

  const handleCreateTemplate = () => {
    const newTemplate: InvoiceTemplate = {
      id: Date.now().toString(),
      name: "Nowy Szablon",
      description: "Opis nowego szablonu",
      isDefault: false,
      layout: 'standard',
      colors: {
        primary: "#030213",
        secondary: "#ececf0",
        text: "#000000"
      },
      showLogo: true,
      showPaymentTerms: true,
      showBankDetails: true,
      headerText: "FAKTURA VAT",
      footerText: "Dziękujemy za współpracę",
      createdAt: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0]
    };

    setInvoiceTemplates(prev => [...prev, newTemplate]);
    setSelectedTemplate(newTemplate);
    toast.success("Utworzono nowy szablon faktury");
  };

  const handleSetDefaultTemplate = (templateId: string) => {
    setInvoiceTemplates(prev => 
      prev.map(template => ({
        ...template,
        isDefault: template.id === templateId
      }))
    );
    toast.success("Ustawiono domyślny szablon faktury");
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (confirm("Czy na pewno chcesz usunąć ten szablon?")) {
      setInvoiceTemplates(prev => prev.filter(template => template.id !== templateId));
      if (selectedTemplate?.id === templateId) {
        setSelectedTemplate(null);
      }
      toast.success("Szablon został usunięty");
    }
  };

  const handlePreviewInvoice = (template: InvoiceTemplate) => {
    toast.info("Otwieranie podglądu faktury...");
    // Tutaj byłaby logika otwierania podglądu
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Ustawienia Systemu
        </h1>
        <p className="text-muted-foreground">
          Zarządzaj danymi firmy, szablonami faktur i ustawieniami systemu
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="company">Dane Firmy</TabsTrigger>
          <TabsTrigger value="invoices">Wzory Faktur</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        {/* Dane Firmy */}
        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Dane Firmy
                  </CardTitle>
                  <CardDescription>
                    Informacje używane w fakturach i dokumentach
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {!isEditing ? (
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edytuj
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Anuluj
                      </Button>
                      <Button onClick={handleSaveCompanyData}>
                        <Save className="h-4 w-4 mr-2" />
                        Zapisz
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo firmy */}
              <div className="space-y-4">
                <Label>Logo Firmy</Label>
                <div className="flex items-center gap-4">
                  {companyData.logo ? (
                    <div className="relative">
                      <img
                        src={companyData.logo}
                        alt="Logo firmy"
                        className="h-20 w-20 object-contain border rounded-lg"
                      />
                      {isEditing && (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6"
                          onClick={() => setCompanyData(prev => ({ ...prev, logo: null }))}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="h-20 w-20 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  
                  {isEditing && (
                    <div>
                      <input
                        type="file"
                        id="logo-upload"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoUpload}
                      />
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById('logo-upload')?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {companyData.logo ? 'Zmień logo' : 'Dodaj logo'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Podstawowe dane */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Nazwa Firmy</Label>
                  <Input
                    id="company-name"
                    value={companyData.name}
                    onChange={(e) => setCompanyData(prev => ({ ...prev, name: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nip">NIP</Label>
                  <Input
                    id="nip"
                    value={companyData.nip}
                    onChange={(e) => setCompanyData(prev => ({ ...prev, nip: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="regon">REGON</Label>
                  <Input
                    id="regon"
                    value={companyData.regon}
                    onChange={(e) => setCompanyData(prev => ({ ...prev, regon: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="krs">KRS</Label>
                  <Input
                    id="krs"
                    value={companyData.krs}
                    onChange={(e) => setCompanyData(prev => ({ ...prev, krs: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <Separator />

              {/* Adres */}
              <div className="space-y-4">
                <h3 className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Adres
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="street">Ulica</Label>
                    <Input
                      id="street"
                      value={companyData.address.street}
                      onChange={(e) => setCompanyData(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, street: e.target.value }
                      }))}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">Miasto</Label>
                    <Input
                      id="city"
                      value={companyData.address.city}
                      onChange={(e) => setCompanyData(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, city: e.target.value }
                      }))}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postal-code">Kod pocztowy</Label>
                    <Input
                      id="postal-code"
                      value={companyData.address.postalCode}
                      onChange={(e) => setCompanyData(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, postalCode: e.target.value }
                      }))}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Kraj</Label>
                    <Input
                      id="country"
                      value={companyData.address.country}
                      onChange={(e) => setCompanyData(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, country: e.target.value }
                      }))}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Kontakt */}
              <div className="space-y-4">
                <h3 className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Kontakt
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <Input
                      id="phone"
                      value={companyData.contact.phone}
                      onChange={(e) => setCompanyData(prev => ({ 
                        ...prev, 
                        contact: { ...prev.contact, phone: e.target.value }
                      }))}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={companyData.contact.email}
                      onChange={(e) => setCompanyData(prev => ({ 
                        ...prev, 
                        contact: { ...prev.contact, email: e.target.value }
                      }))}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Strona WWW</Label>
                    <Input
                      id="website"
                      value={companyData.contact.website}
                      onChange={(e) => setCompanyData(prev => ({ 
                        ...prev, 
                        contact: { ...prev.contact, website: e.target.value }
                      }))}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Dane bankowe */}
              <div className="space-y-4">
                <h3 className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Dane Bankowe
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bank-name">Nazwa banku</Label>
                    <Input
                      id="bank-name"
                      value={companyData.bank.name}
                      onChange={(e) => setCompanyData(prev => ({ 
                        ...prev, 
                        bank: { ...prev.bank, name: e.target.value }
                      }))}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="account-number">Numer konta</Label>
                    <Input
                      id="account-number"
                      value={companyData.bank.accountNumber}
                      onChange={(e) => setCompanyData(prev => ({ 
                        ...prev, 
                        bank: { ...prev.bank, accountNumber: e.target.value }
                      }))}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="swift">SWIFT</Label>
                    <Input
                      id="swift"
                      value={companyData.bank.swift}
                      onChange={(e) => setCompanyData(prev => ({ 
                        ...prev, 
                        bank: { ...prev.bank, swift: e.target.value }
                      }))}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Wzory Faktur */}
        <TabsContent value="invoices" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Szablony Faktur
                  </CardTitle>
                  <CardDescription>
                    Zarządzaj wyglądem i układem faktur
                  </CardDescription>
                </div>
                <Button onClick={handleCreateTemplate}>
                  <FileText className="h-4 w-4 mr-2" />
                  Nowy Szablon
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {invoiceTemplates.map((template) => (
                  <div key={template.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                      </div>
                      {template.isDefault && (
                        <Badge variant="default">Domyślny</Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Układ: {template.layout === 'standard' ? 'Standardowy' : 
                                   template.layout === 'minimal' ? 'Minimalny' : 'Szczegółowy'}</span>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreviewInvoice(template)}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefaultTemplate(template.id)}
                        disabled={template.isDefault}
                      >
                        <Hash className="h-3 w-3" />
                      </Button>
                      {!template.isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Edytor szablonu */}
          {selectedTemplate && (
            <Card>
              <CardHeader>
                <CardTitle>Edycja Szablonu: {selectedTemplate.name}</CardTitle>
                <CardDescription>
                  Dostosuj wygląd i zawartość faktury
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="template-name">Nazwa szablonu</Label>
                    <Input
                      id="template-name"
                      value={selectedTemplate.name}
                      onChange={(e) => setSelectedTemplate(prev => prev ? { ...prev, name: e.target.value } : null)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="template-description">Opis</Label>
                    <Input
                      id="template-description"
                      value={selectedTemplate.description}
                      onChange={(e) => setSelectedTemplate(prev => prev ? { ...prev, description: e.target.value } : null)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="header-text">Tekst nagłówka</Label>
                    <Input
                      id="header-text"
                      value={selectedTemplate.headerText}
                      onChange={(e) => setSelectedTemplate(prev => prev ? { ...prev, headerText: e.target.value } : null)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="footer-text">Tekst stopki</Label>
                    <Input
                      id="footer-text"
                      value={selectedTemplate.footerText}
                      onChange={(e) => setSelectedTemplate(prev => prev ? { ...prev, footerText: e.target.value } : null)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Opcje wyświetlania</Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="show-logo"
                        checked={selectedTemplate.showLogo}
                        onCheckedChange={(checked) => setSelectedTemplate(prev => prev ? { ...prev, showLogo: checked } : null)}
                      />
                      <Label htmlFor="show-logo">Pokaż logo firmy</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="show-payment-terms"
                        checked={selectedTemplate.showPaymentTerms}
                        onCheckedChange={(checked) => setSelectedTemplate(prev => prev ? { ...prev, showPaymentTerms: checked } : null)}
                      />
                      <Label htmlFor="show-payment-terms">Pokaż warunki płatności</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="show-bank-details"
                        checked={selectedTemplate.showBankDetails}
                        onCheckedChange={(checked) => setSelectedTemplate(prev => prev ? { ...prev, showBankDetails: checked } : null)}
                      />
                      <Label htmlFor="show-bank-details">Pokaż dane bankowe</Label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => {
                    setInvoiceTemplates(prev => 
                      prev.map(template => 
                        template.id === selectedTemplate.id ? selectedTemplate : template
                      )
                    );
                    setSelectedTemplate(null);
                    toast.success("Szablon został zapisany");
                  }}>
                    <Save className="h-4 w-4 mr-2" />
                    Zapisz szablon
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                    Anuluj
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Ustawienia Systemu */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Ustawienia Ogólne
              </CardTitle>
              <CardDescription>
                Konfiguracja funkcjonalności systemu
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4>Automatyzacja</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Automatyczne numerowanie faktur</Label>
                      <p className="text-sm text-muted-foreground">System automatycznie przypisuje numery fakturom</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Powiadomienia email</Label>
                      <p className="text-sm text-muted-foreground">Wysyłaj powiadomienia o terminach płatności</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Backup automatyczny</Label>
                      <p className="text-sm text-muted-foreground">Codziennie o 2:00 tworz kopię zapasową</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4>Integracje</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Synchronizacja z enova365</Label>
                      <p className="text-sm text-muted-foreground">Automatyczne pobieranie danych podatkowych</p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Synchronizacja z Płatnik</Label>
                      <p className="text-sm text-muted-foreground">Automatyczne pobieranie danych ZUS</p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Integracja z bankowością</Label>
                      <p className="text-sm text-muted-foreground">Pobieranie wyciągów bankowych</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4>Bezpieczeństwo</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Dwuetapowa autoryzacja</Label>
                      <p className="text-sm text-muted-foreground">Wymagaj 2FA dla administratorów</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Logowanie działań</Label>
                      <p className="text-sm text-muted-foreground">Zapisuj wszystkie działania użytkowników</p>
                    </div>
                    <Switch defaultChecked />
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