import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  Eye, 
  Download, 
  FileText,
  CheckCircle
} from "lucide-react";
import { toast } from 'sonner';
import { availableTemplates, InvoiceTemplate, PDFInvoiceGenerator } from "../utils/pdfGenerator";
import { mockInvoices } from "../data/mockData";
import { mockClients } from "../data/mockClients";
import { usePermissions } from "../contexts/PermissionContext";

export function SimpleInvoiceTemplates() {
  const { hasPermission } = usePermissions();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('standard');

  // Check permissions
  const canRead = hasPermission('invoices', 'read');

  if (!canRead) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <FileText className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Brak dostępu</h2>
            <p className="text-muted-foreground">
              Nie masz uprawnień do przeglądania szablonów faktur.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handlePreviewTemplate = (templateId: string) => {
    try {
      // Use mock data to generate a preview
      const mockInvoice = mockInvoices[0];
      const mockClient = mockClients.find(c => c.id === mockInvoice.clientId);
      
      if (!mockClient) {
        toast.error('Nie można wygenerować podglądu - brak danych klienta');
        return;
      }

      const generator = new PDFInvoiceGenerator();
      generator.generateInvoice(mockInvoice, mockClient, templateId);
      toast.success('Podgląd szablonu został wygenerowany');
    } catch (error) {
      console.error('Error generating preview:', error);
      toast.error('Błąd podczas generowania podglądu');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Szablony faktur</h1>
        <p className="text-muted-foreground">
          Wybierz szablon faktury do wykorzystania w systemie
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableTemplates.map((template) => (
          <Card 
            key={template.id} 
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedTemplate === template.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedTemplate(template.id)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{template.name}</CardTitle>
                {selectedTemplate === template.id && (
                  <Badge variant="default">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Wybrany
                  </Badge>
                )}
              </div>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="bg-gray-50 p-4 rounded border-2 border-dashed border-gray-200 text-center text-sm text-muted-foreground">
                  Podgląd szablonu {template.name}
                  <br />
                  <span className="text-xs">Kliknij "Podgląd" aby zobaczyć pełny szablon</span>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePreviewTemplate(template.id);
                    }}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Podgląd
                  </Button>
                  
                  <Button 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTemplate(template.id);
                      toast.success(`Szablon "${template.name}" został wybrany`);
                    }}
                  >
                    Wybierz
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informacje o szablonach</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <h3 className="font-semibold">Standardowy</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Klasyczny szablon z prostym układem i standardową tabelą pozycji
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <h3 className="font-semibold">Nowoczesny</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Szablon z kolorowym nagłówkiem i nowoczesnym designem
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <h3 className="font-semibold">Minimalistyczny</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Prosty szablon z minimalną ilością elementów wizualnych
              </p>
            </div>
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            Wybrany szablon będzie używany przy generowaniu nowych faktur PDF
          </div>
        </CardContent>
      </Card>
    </div>
  );
}