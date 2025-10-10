import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { FileText, Download, Info } from "lucide-react";
import { Client, User } from "../../types/client";
import { 
  AuthorizationFormGenerator, 
  FormType, 
  FormCategory, 
  FORM_METADATA,
  getFormsByCategory 
} from "../../utils/authorizationFormGenerator";
import { toast } from 'sonner';
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

interface AuthorizationFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  employees: User[];
  preSelectedClientId?: string;
}

export function AuthorizationFormDialog({ 
  isOpen, 
  onClose, 
  clients, 
  employees,
  preSelectedClientId 
}: AuthorizationFormDialogProps) {
  const [selectedClientId, setSelectedClientId] = useState<string>(preSelectedClientId || '');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [formType, setFormType] = useState<FormType>('UPL-1');
  const [selectedCategory, setSelectedCategory] = useState<FormCategory>('pelnomocnictwa');
  const [isGenerating, setIsGenerating] = useState(false);

  // Get forms by category
  const categorizedForms = useMemo(() => {
    return getFormsByCategory(selectedCategory);
  }, [selectedCategory]);

  // Get complexity badge color
  const getComplexityColor = (complexity: string) => {
    switch(complexity) {
      case 'simple': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'complex': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleGenerate = async () => {
    if (!selectedClientId || !selectedEmployeeId) {
      toast.error("Wybierz klienta i pracownika");
      return;
    }

    const client = clients.find(c => c.id === selectedClientId);
    const employee = employees.find(e => e.id === selectedEmployeeId);

    if (!client || !employee) {
      toast.error("Nie znaleziono wybranego klienta lub pracownika");
      return;
    }

    setIsGenerating(true);

    try {
      const generator = new AuthorizationFormGenerator();
      await generator.downloadForm({
        client,
        employee,
        formType
      });

      toast.success(`Dokument ${formType} został wygenerowany i pobrany`);
      
      // Reset form after successful generation
      setTimeout(() => {
        setSelectedClientId(preSelectedClientId || '');
        setSelectedEmployeeId('');
        setFormType('UPL-1');
        setSelectedCategory('pelnomocnictwa');
        onClose();
      }, 500);
    } catch (error) {
      console.error('Error generating form:', error);
      const errorMessage = error instanceof Error ? error.message : 'Nieznany błąd';
      toast.error(`Błąd podczas generowania dokumentu: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generuj formularze podatkowe i dokumenty
          </DialogTitle>
          <DialogDescription>
            Automatyczne generowanie dokumentów: pełnomocnictw, deklaracji podatkowych (PIT, VAT, CIT), ZUS i JPK
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Category tabs - horizontal layout with prominent main categories */}
          <Tabs value={selectedCategory} onValueChange={(value) => {
            setSelectedCategory(value as FormCategory);
            // Set default form for category
            const forms = getFormsByCategory(value as FormCategory);
            if (forms.length > 0) {
              setFormType(forms[0].type);
            }
          }}>
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 gap-2 sticky top-0 z-10 bg-background p-2">
              <TabsTrigger value="pelnomocnictwa" className="font-semibold">Pełnomocnictwa</TabsTrigger>
              <TabsTrigger value="pit" className="font-semibold">PIT</TabsTrigger>
              <TabsTrigger value="vat" className="font-semibold">VAT</TabsTrigger>
              <TabsTrigger value="cit">CIT</TabsTrigger>
              <TabsTrigger value="zus">ZUS</TabsTrigger>
              <TabsTrigger value="jpk">JPK</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedCategory} className="mt-4">
              <div className="space-y-2">
                <Label>Typ formularza *</Label>
                <Select value={formType} onValueChange={(value: FormType) => setFormType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categorizedForms.map((form) => (
                      <SelectItem key={form.type} value={form.type}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{form.name}</span>
                          <Badge className={`text-xs ${getComplexityColor(form.complexity)}`}>
                            {form.complexity === 'simple' && 'Prosty'}
                            {form.complexity === 'medium' && 'Średni'}
                            {form.complexity === 'complex' && 'Zaawansowany'}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {form.description}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Form info */}
                {formType && FORM_METADATA[formType] && (
                  <div className="rounded-lg bg-blue-50 p-3 text-sm space-y-2">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-blue-900">{FORM_METADATA[formType].name}</p>
                        <p className="text-blue-700 text-xs mt-1">{FORM_METADATA[formType].description}</p>
                        <div className="mt-2 text-xs text-blue-600">
                          <strong>Wymagane pola:</strong> {FORM_METADATA[formType].requiredFields.join(', ')}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="space-y-2">
            <Label>Klient *</Label>
            <Select value={selectedClientId} onValueChange={setSelectedClientId}>
              <SelectTrigger>
                <SelectValue placeholder="Wybierz klienta..." />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    <div className="flex flex-col items-start">
                      <span>{client.firstName} {client.lastName}</span>
                      {client.companyName && (
                        <span className="text-xs text-muted-foreground">{client.companyName}</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Pełnomocnik (Pracownik) *</Label>
            <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
              <SelectTrigger>
                <SelectValue placeholder="Wybierz pracownika..." />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    <div className="flex flex-col items-start">
                      <span>{employee.firstName} {employee.lastName}</span>
                      {employee.position && (
                        <span className="text-xs text-muted-foreground">{employee.position}</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg bg-muted p-4 text-sm space-y-1">
            <p className="font-medium">Informacja o systemie pre-fillingu:</p>
            <p className="text-muted-foreground text-xs">
              <strong>Formularze proste</strong> (np. ZAW-FA) - wypełniane są tylko podstawowe dane klienta i pracownika
            </p>
            <p className="text-muted-foreground text-xs">
              <strong>Formularze zaawansowane</strong> (np. PIT-36, CIT-8) - wypełniane są wszystkie dostępne dane klienta
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} disabled={isGenerating}>
            Anuluj
          </Button>
          <Button onClick={handleGenerate} disabled={isGenerating}>
            <Download className="mr-2 h-4 w-4" />
            {isGenerating ? 'Generowanie...' : 'Generuj i pobierz'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
