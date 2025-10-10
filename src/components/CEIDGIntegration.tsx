import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { Search, Building, MapPin, Calendar, AlertCircle, CheckCircle, Settings } from "lucide-react";
import { CEIDGCompanyData, Client } from "../types/client";
import { toast } from 'sonner';

interface CEIDGIntegrationProps {
  onAddClient: (clientData: Partial<Client>) => void;
}

export function CEIDGIntegration({ onAddClient }: CEIDGIntegrationProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [companyData, setCompanyData] = useState<CEIDGCompanyData | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [isConfiguring, setIsConfiguring] = useState(false);

  // Mock CEIDG data for demonstration
  const mockCEIDGData: CEIDGCompanyData = {
    nazwa: "PRZYKŁADOWA FIRMA JANUSZ KOWALSKI",
    nip: "1234567890",
    regon: "123456789",
    adres: {
      ulica: "ul. Przykładowa 123",
      miasto: "Warszawa",
      kodPocztowy: "00-001",
      wojewodztwo: "MAZOWIECKIE"
    },
    pkd: ["62.01.Z - Działalność związana z oprogramowaniem", "62.02.Z - Działalność konsultingowa w zakresie informatyki"],
    dataRozpoczeciaDzialalnosci: "2020-01-15",
    status: "AKTYWNY"
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Wprowadź NIP lub nazwę firmy");
      return;
    }

    if (!apiKey.trim()) {
      toast.error("Skonfiguruj klucz API CEIDG w ustawieniach");
      setIsConfiguring(true);
      return;
    }

    setIsSearching(true);
    
    try {
      // In real implementation, this would make an actual API call to CEIDG
      // For now, we simulate the API call with mock data
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (searchQuery.includes('1234567890') || searchQuery.toLowerCase().includes('kowalski')) {
        setCompanyData(mockCEIDGData);
        toast.success("Znaleziono dane firmy");
      } else {
        setCompanyData(null);
        toast.error("Nie znaleziono firmy o podanych kryteriach");
      }
    } catch (error) {
      console.error('CEIDG API Error:', error);
      toast.error("Błąd podczas pobierania danych z CEIDG");
      setCompanyData(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddToClients = () => {
    if (!companyData) return;

    // Extract first name and last name from company name
    const nameParts = companyData.nazwa.split(' ');
    const firstName = nameParts.length > 1 ? nameParts[nameParts.length - 2] : '';
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : nameParts[0];

    const clientData: Partial<Client> = {
      firstName,
      lastName,
      company: companyData.nazwa,
      nip: companyData.nip,
      regon: companyData.regon,
      address: {
        street: companyData.adres.ulica,
        city: companyData.adres.miasto,
        zipCode: companyData.adres.kodPocztowy,
        state: companyData.adres.wojewodztwo.toLowerCase(),
        country: 'Polska'
      },
      status: 'potencjalny' as const,
      notes: `Dane pobrane z CEIDG. PKD: ${companyData.pkd.join(', ')}`,
      tags: ['CEIDG', 'nowy'],
      email: '', // This would need to be filled manually
      phone: '' // This would need to be filled manually
    };

    onAddClient(clientData);
    toast.success("Dodano klienta na podstawie danych z CEIDG");
    setCompanyData(null);
    setSearchQuery('');
  };

  // Utility to encrypt text with a passphrase using AES-GCM and PBKDF2
  async function encryptApiKey(plainText: string, passphrase: string): Promise<string> {
    // Salt and IV generation
    const enc = new TextEncoder();
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    // Key derivation
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      enc.encode(passphrase),
      {name: 'PBKDF2'},
      false,
      ['deriveKey']
    );
    const key = await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      {name: 'AES-GCM', length: 256},
      false,
      ['encrypt', 'decrypt']
    );

    // Encrypt
    const ciphertext = await window.crypto.subtle.encrypt(
      {name: 'AES-GCM', iv},
      key,
      enc.encode(plainText)
    );

    // Concatenate salt + iv + ciphertext as a base64 string
    function arrayBufferToBase64(buffer: ArrayBuffer): string {
      const bytes = new Uint8Array(buffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    }

    const packed = new Uint8Array(salt.length + iv.length + ciphertext.byteLength);
    packed.set(salt, 0);
    packed.set(iv, salt.length);
    packed.set(new Uint8Array(ciphertext), salt.length + iv.length);

    return arrayBufferToBase64(packed.buffer);
  }

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      toast.error("Wprowadź klucz API");
      return;
    }
    
    // Ask user for an encryption passphrase
    const passphrase = window.prompt("Podaj hasło do zaszyfrowania klucza API (zapamiętaj je!):", "");
    if (!passphrase || passphrase.length < 4) {
      toast.error("Musisz wprowadzić hasło (min. 4 znaki) do zaszyfrowania klucza API.");
      return;
    }

    try {
      const encryptedValue = await encryptApiKey(apiKey, passphrase);
      localStorage.setItem('ceidg_api_key', encryptedValue);
      toast.success("Klucz API został zaszyfrowany i zapisany (zapamiętaj hasło!)");
      setIsConfiguring(false);
    } catch (err) {
      toast.error("Błąd przy szyfrowaniu klucza API");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Integracja z CEIDG</h1>
        <p className="text-muted-foreground">
          Pobierz dane firm z Centralnej Ewidencji i Informacji o Działalności Gospodarczej
        </p>
      </div>

      {isConfiguring ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Konfiguracja API CEIDG
            </CardTitle>
            <CardDescription>
              Wprowadź swój klucz API do dostępu do bazy danych CEIDG
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">Klucz API CEIDG</Label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Wprowadź swój klucz API CEIDG"
              />
            </div>
            <div className="p-4 border rounded-lg bg-muted/50">
              <h4 className="text-sm font-medium mb-2">Jak uzyskać klucz API:</h4>
              <ol className="text-sm text-muted-foreground space-y-1">
                <li>1. Przejdź na stronę <a href="https://datastore.ceidg.gov.pl" className="underline" target="_blank" rel="noopener noreferrer">datastore.ceidg.gov.pl</a></li>
                <li>2. Zarejestruj się w serwisie</li>
                <li>3. Złóż wniosek o dostęp do API</li>
                <li>4. Po zatwierdzeniu otrzymasz klucz API</li>
              </ol>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveApiKey}>
                Zapisz klucz API
              </Button>
              <Button variant="outline" onClick={() => setIsConfiguring(false)}>
                Anuluj
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Wyszukiwanie firm</CardTitle>
              <CardDescription>
                Wyszukaj firmę po NIP lub nazwie, aby pobrać jej dane z CEIDG
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="search">NIP lub nazwa firmy</Label>
                  <Input
                    id="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="np. 1234567890 lub FIRMA KOWALSKI"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <div className="flex items-end gap-2">
                  <Button 
                    onClick={handleSearch} 
                    disabled={isSearching}
                  >
                    {isSearching ? (
                      <>Szukam...</>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Szukaj
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsConfiguring(true)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {!apiKey && (
                <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Wymagana konfiguracja</span>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">
                    Aby korzystać z integracji CEIDG, skonfiguruj klucz API w ustawieniach.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {companyData && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      {companyData.nazwa}
                    </CardTitle>
                    <CardDescription>
                      Dane z CEIDG - {new Date(companyData.dataRozpoczeciaDzialalnosci).toLocaleDateString('pl-PL')}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant={companyData.status === 'AKTYWNY' ? 'default' : 'secondary'}
                    className="flex items-center gap-1"
                  >
                    <CheckCircle className="h-3 w-3" />
                    {companyData.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Dane identyfikacyjne</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>NIP:</strong> {companyData.nip}</div>
                        {companyData.regon && <div><strong>REGON:</strong> {companyData.regon}</div>}
                        <div>
                          <strong>Data rozpoczęcia działalności:</strong>{' '}
                          {new Date(companyData.dataRozpoczeciaDzialalnosci).toLocaleDateString('pl-PL')}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        Adres
                      </h4>
                      <div className="text-sm space-y-1">
                        <div>{companyData.adres.ulica}</div>
                        <div>{companyData.adres.kodPocztowy} {companyData.adres.miasto}</div>
                        <div>woj. {companyData.adres.wojewodztwo.toLowerCase()}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium mb-2">Przeważające rodzaje działalności (PKD)</h4>
                  <div className="space-y-1">
                    {companyData.pkd.map((pkd, index) => (
                      <Badge key={index} variant="outline" className="mr-2 mb-2">
                        {pkd}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="flex gap-2">
                  <Button onClick={handleAddToClients}>
                    <Building className="mr-2 h-4 w-4" />
                    Dodaj do klientów
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setCompanyData(null);
                      setSearchQuery('');
                    }}
                  >
                    Wyczyść
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Informacje o usłudze</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Building className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h4 className="text-sm font-medium">Aktualne dane</h4>
              <p className="text-xs text-muted-foreground">
                Dane pobierane bezpośrednio z oficjalnej bazy CEIDG
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Search className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h4 className="text-sm font-medium">Szybkie wyszukiwanie</h4>
              <p className="text-xs text-muted-foreground">
                Wyszukuj po NIP, REGON lub nazwie firmy
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h4 className="text-sm font-medium">Automatyczne dodawanie</h4>
              <p className="text-xs text-muted-foreground">
                Jeden klik, aby dodać firmę do bazy klientów
              </p>
            </div>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Uwaga:</strong> Aby korzystać z tej funkcjonalności, potrzebujesz ważnego klucza API do usług CEIDG. 
              Klucz można uzyskać za darmo rejestrując się na platformie datastore.ceidg.gov.pl. 
              W wersji demonstracyjnej wyświetlane są przykładowe dane.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}