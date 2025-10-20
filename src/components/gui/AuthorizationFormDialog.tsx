import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { FileText, Info, Eye } from 'lucide-react';
import { Client, User } from '../../types/client';
import {
  AuthorizationFormGenerator,
  FormType,
  FormCategory,
  FORM_METADATA,
  getFormsByCategory,
} from '../../utils/authorizationFormGenerator';
import { toast } from 'sonner';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { FillableFormPreview } from './FillableFormPreview';
import { PdfPreviewPopup } from './PdfPreviewPopup';
import { Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';

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
  preSelectedClientId,
}: AuthorizationFormDialogProps) {
  const [selectedClientId, setSelectedClientId] = useState<string>(preSelectedClientId || '');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [formType, setFormType] = useState<FormType>('UPL-1');
  const [selectedCategory, setSelectedCategory] = useState<FormCategory>('pelnomocnictwa');
  const [keepFieldsEditable, setKeepFieldsEditable] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showFormPreview, setShowFormPreview] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string>('');
  const [pdfCleanup, setPdfCleanup] = useState<(() => void) | null>(null);

  // Get forms by category
  const categorizedForms = useMemo(() => {
    return getFormsByCategory(selectedCategory);
  }, [selectedCategory]);

  // Get complexity badge color
  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'complex':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleOpenFormPreview = () => {
    if (!selectedClientId || !selectedEmployeeId) {
      toast.error('Wybierz klienta i pracownika');
      return;
    }

    const client = clients.find((c) => c.id === selectedClientId);
    const employee = employees.find((e) => e.id === selectedEmployeeId);

    if (!client || !employee) {
      toast.error('Nie znaleziono wybranego klienta lub pracownika');
      return;
    }

    // Open the fillable form preview
    setShowFormPreview(true);
  };

  const handleDirectPdfPreview = async () => {
    if (!selectedClientId || !selectedEmployeeId) {
      toast.error('Wybierz klienta i pracownika');
      return;
    }

    const client = clients.find((c) => c.id === selectedClientId);
    const employee = employees.find((e) => e.id === selectedEmployeeId);

    if (!client || !employee) {
      toast.error('Nie znaleziono wybranego klienta lub pracownika');
      return;
    }

    setIsGenerating(true);
    try {
      // Clean up previous PDF URL if exists
      if (pdfCleanup) {
        pdfCleanup();
        setPdfCleanup(null);
      }

      // Generate PDF directly with current data for preview
      const generator = new AuthorizationFormGenerator();
      const { url, fileName, cleanup } = await generator.generateFormBlobUrl({
        client,
        employee,
        formType,
        additionalData: {
          startDate: new Date().toLocaleDateString('pl-PL'),
          scope: 'Reprezentowanie przed Urzędem Skarbowym w sprawach podatkowych',
        },
      });

      setPdfPreviewUrl(url);
      setPdfFileName(fileName);
      setPdfCleanup(() => cleanup);
      setShowPdfPreview(true);
      toast.success('PDF został wygenerowany - możesz teraz wypełnić puste pola');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error(
        `Błąd podczas generowania: ${error instanceof Error ? error.message : 'Nieznany błąd'}`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClosePdfPreview = () => {
    setShowPdfPreview(false);
    // Cleanup will happen on unmount or when generating new PDF
  };

  const handleGenerateFromPreview = async (updatedFields: Record<string, string>) => {
    const client = clients.find((c) => c.id === selectedClientId);
    const employee = employees.find((e) => e.id === selectedEmployeeId);

    if (!client || !employee) {
      throw new Error('Nie znaleziono wybranego klienta lub pracownika');
    }

    // Create updated client and employee objects with form data
    const updatedClient: Client = {
      ...client,
      firstName: updatedFields.clientFirstName || client.firstName,
      lastName: updatedFields.clientLastName || client.lastName,
      nip: updatedFields.clientNIP || client.nip,
      pesel: updatedFields.clientPESEL || client.pesel,
      address: updatedFields.clientAddress || client.address,
      city: updatedFields.clientCity || client.city,
      postalCode: updatedFields.clientPostalCode || client.postalCode,
      companyName: updatedFields.companyName || client.companyName,
      regon: updatedFields.regon || client.regon,
      taxOffice: updatedFields.taxOffice || client.taxOffice,
    };

    const updatedEmployee: User = {
      ...employee,
      firstName: updatedFields.employeeFirstName || employee.firstName,
      lastName: updatedFields.employeeLastName || employee.lastName,
      pesel: updatedFields.employeePESEL || employee.pesel,
    };

    const generator = new AuthorizationFormGenerator();
    await generator.downloadForm(
      {
        client: updatedClient,
        employee: updatedEmployee,
        formType,
        additionalData: {
          scope: updatedFields.scope,
          startDate: updatedFields.startDate,
          endDate: updatedFields.endDate,
          taxOffice: updatedFields.taxOffice,
          period: updatedFields.period,
          year: updatedFields.taxYear,
        },
      },
      keepFieldsEditable
    );

    // Reset form after successful generation
    window.setTimeout(() => {
      setSelectedClientId(preSelectedClientId || '');
      setSelectedEmployeeId('');
      setFormType('UPL-1');
      setSelectedCategory('pelnomocnictwa');
      setShowFormPreview(false);
      onClose();
    }, 500);
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
            Automatyczne generowanie dokumentów: pełnomocnictw, deklaracji podatkowych (PIT, VAT,
            CIT), ZUS i JPK
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Category tabs - horizontal layout with prominent main categories */}
          <Tabs
            value={selectedCategory}
            onValueChange={(value) => {
              setSelectedCategory(value as FormCategory);
              // Set default form for category
              const forms = getFormsByCategory(value as FormCategory);
              if (forms.length > 0) {
                setFormType(forms[0].type);
              }
            }}
          >
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 gap-2 sticky top-0 z-10 bg-background p-2">
              <TabsTrigger value="pelnomocnictwa" className="font-semibold">
                Pełnomocnictwa
              </TabsTrigger>
              <TabsTrigger value="pit" className="font-semibold">
                PIT
              </TabsTrigger>
              <TabsTrigger value="vat" className="font-semibold">
                VAT
              </TabsTrigger>
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
                        <div className="text-xs text-muted-foreground mt-1">{form.description}</div>
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
                        <p className="text-blue-700 text-xs mt-1">
                          {FORM_METADATA[formType].description}
                        </p>
                        <div className="mt-2 text-xs text-blue-600">
                          <strong>Wymagane pola:</strong>{' '}
                          {FORM_METADATA[formType].requiredFields.join(', ')}
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
                      <span>
                        {client.firstName} {client.lastName}
                      </span>
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
                      <span>
                        {employee.firstName} {employee.lastName}
                      </span>
                      {employee.position && (
                        <span className="text-xs text-muted-foreground">{employee.position}</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="keep-editable"
              checked={keepFieldsEditable}
              onCheckedChange={setKeepFieldsEditable}
            />
            <Label htmlFor="keep-editable" className="text-sm cursor-pointer">
              Zachowaj pola edytowalne (możesz wypełnić pozostałe pola w PDF)
            </Label>
          </div>

          <div className="rounded-lg bg-muted p-4 text-sm space-y-1">
            <p className="font-medium">Informacja o systemie pre-fillingu:</p>
            <p className="text-muted-foreground text-xs">
              <strong>Formularze proste</strong> (np. ZAW-FA) - wypełniane są tylko podstawowe dane
              klienta i pracownika
            </p>
            <p className="text-muted-foreground text-xs">
              <strong>Formularze zaawansowane</strong> (np. PIT-36, CIT-8) - wypełniane są wszystkie
              dostępne dane klienta
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} disabled={isGenerating}>
            Anuluj
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  variant="secondary"
                  onClick={handleDirectPdfPreview}
                  disabled={isGenerating || !selectedClientId || !selectedEmployeeId}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  {isGenerating ? 'Generowanie...' : 'Podgląd PDF'}
                </Button>
              </span>
            </TooltipTrigger>
            {(!selectedClientId || !selectedEmployeeId) && (
              <TooltipContent>
                <p>Wybierz klienta i pracownika aby wygenerować podgląd</p>
              </TooltipContent>
            )}
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  onClick={handleOpenFormPreview}
                  disabled={isGenerating || !selectedClientId || !selectedEmployeeId}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Otwórz formularz
                </Button>
              </span>
            </TooltipTrigger>
            {(!selectedClientId || !selectedEmployeeId) && (
              <TooltipContent>
                <p>Wybierz klienta i pracownika aby otworzyć formularz</p>
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </DialogContent>

      {/* Fillable Form Preview Dialog */}
      {showFormPreview && selectedClientId && selectedEmployeeId && (
        <FillableFormPreview
          isOpen={showFormPreview}
          onClose={() => setShowFormPreview(false)}
          client={clients.find((c) => c.id === selectedClientId)!}
          employee={employees.find((e) => e.id === selectedEmployeeId)!}
          formType={formType}
          onGenerate={handleGenerateFromPreview}
        />
      )}

      {/* Direct PDF Preview Popup */}
      <PdfPreviewPopup
        isOpen={showPdfPreview}
        onClose={handleClosePdfPreview}
        pdfUrl={pdfPreviewUrl}
        fileName={pdfFileName}
      />
    </Dialog>
  );
}
