import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Download, Eye, Edit3, Save } from "lucide-react";
import { Client, User } from "../../types/client";
import { FormType } from "../../utils/authorizationFormGenerator";
import { toast } from 'sonner';
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";

interface FormFieldDefinition {
  id: string;
  label: string;
  value: string;
  type: 'text' | 'textarea' | 'date' | 'readonly';
  placeholder?: string;
}

interface FillableFormPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
  employee: User;
  formType: FormType;
  onGenerate: (updatedFields: Record<string, string>) => Promise<void>;
}

export function FillableFormPreview({ 
  isOpen, 
  onClose, 
  client, 
  employee,
  formType,
  onGenerate
}: FillableFormPreviewProps) {
  const [fields, setFields] = useState<FormFieldDefinition[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(true);

  useEffect(() => {
    if (isOpen) {
      // Initialize fields based on form type and provided data
      const initialFields = generateFormFields(formType, client, employee);
      setFields(initialFields);
      setIsEditing(true);
    }
  }, [isOpen, client, employee, formType]);

  const generateFormFields = (
    type: FormType, 
    clientData: Client, 
    employeeData: User
  ): FormFieldDefinition[] => {
    const today = new Date().toISOString().split('T')[0];
    
    // Common fields for most forms
    const commonFields: FormFieldDefinition[] = [
      {
        id: 'clientFirstName',
        label: 'Imię klienta',
        value: clientData.firstName || '',
        type: 'text',
        placeholder: 'Podaj imię'
      },
      {
        id: 'clientLastName',
        label: 'Nazwisko klienta',
        value: clientData.lastName || '',
        type: 'text',
        placeholder: 'Podaj nazwisko'
      },
      {
        id: 'clientNIP',
        label: 'NIP klienta',
        value: clientData.nip || '',
        type: 'text',
        placeholder: 'np. 1234567890'
      },
      {
        id: 'clientPESEL',
        label: 'PESEL klienta',
        value: clientData.pesel || '',
        type: 'text',
        placeholder: 'np. 12345678901'
      },
      {
        id: 'clientAddress',
        label: 'Adres klienta',
        value: clientData.address || '',
        type: 'text',
        placeholder: 'Ulica i numer'
      },
      {
        id: 'clientCity',
        label: 'Miasto',
        value: clientData.city || '',
        type: 'text',
        placeholder: 'Miasto'
      },
      {
        id: 'clientPostalCode',
        label: 'Kod pocztowy',
        value: clientData.postalCode || '',
        type: 'text',
        placeholder: 'np. 00-000'
      },
      {
        id: 'employeeFirstName',
        label: 'Imię pełnomocnika',
        value: employeeData.firstName || '',
        type: 'text',
        placeholder: 'Podaj imię'
      },
      {
        id: 'employeeLastName',
        label: 'Nazwisko pełnomocnika',
        value: employeeData.lastName || '',
        type: 'text',
        placeholder: 'Podaj nazwisko'
      },
      {
        id: 'employeePESEL',
        label: 'PESEL pełnomocnika',
        value: employeeData.pesel || '',
        type: 'text',
        placeholder: 'np. 12345678901'
      },
      {
        id: 'issueDate',
        label: 'Data wystawienia',
        value: today,
        type: 'date'
      }
    ];

    // Add form-specific fields
    if (type === 'UPL-1' || type === 'PEL') {
      return [
        ...commonFields,
        {
          id: 'companyName',
          label: 'Nazwa firmy (jeśli dotyczy)',
          value: clientData.companyName || '',
          type: 'text',
          placeholder: 'Nazwa firmy'
        },
        {
          id: 'regon',
          label: 'REGON (jeśli dotyczy)',
          value: clientData.regon || '',
          type: 'text',
          placeholder: 'np. 123456789'
        },
        {
          id: 'scope',
          label: 'Zakres pełnomocnictwa',
          value: 'Reprezentowanie przed Urzędem Skarbowym w sprawach podatkowych',
          type: 'textarea',
          placeholder: 'Określ zakres upoważnienia'
        },
        {
          id: 'startDate',
          label: 'Data rozpoczęcia',
          value: today,
          type: 'date'
        },
        {
          id: 'endDate',
          label: 'Data zakończenia (opcjonalnie)',
          value: '',
          type: 'date'
        }
      ];
    }

    // For PIT forms
    if (type.startsWith('PIT-')) {
      return [
        ...commonFields,
        {
          id: 'taxOffice',
          label: 'Urząd Skarbowy',
          value: clientData.taxOffice || '',
          type: 'text',
          placeholder: 'Nazwa Urzędu Skarbowego'
        },
        {
          id: 'taxYear',
          label: 'Rok podatkowy',
          value: new Date().getFullYear().toString(),
          type: 'text',
          placeholder: 'RRRR'
        }
      ];
    }

    // For VAT forms
    if (type.startsWith('VAT-')) {
      return [
        ...commonFields,
        {
          id: 'companyName',
          label: 'Nazwa firmy',
          value: clientData.companyName || '',
          type: 'text',
          placeholder: 'Nazwa firmy'
        },
        {
          id: 'period',
          label: 'Okres rozliczeniowy',
          value: new Date().toISOString().slice(0, 7),
          type: 'text',
          placeholder: 'RRRR-MM'
        }
      ];
    }

    return commonFields;
  };

  const handleFieldChange = (fieldId: string, newValue: string) => {
    setFields(prev => prev.map(field => 
      field.id === fieldId ? { ...field, value: newValue } : field
    ));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // Convert fields array to record for the generator
      const fieldsRecord = fields.reduce((acc, field) => {
        acc[field.id] = field.value;
        return acc;
      }, {} as Record<string, string>);

      await onGenerate(fieldsRecord);
      toast.success("Dokument został wygenerowany i pobrany");
      
      // Close dialog after successful generation
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error('Error generating form:', error);
      toast.error(`Błąd podczas generowania: ${error instanceof Error ? error.message : 'Nieznany błąd'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const getFormTitle = (type: FormType): string => {
    const titles: Record<string, string> = {
      'UPL-1': 'Pełnomocnictwo do Urzędu Skarbowego (UPL-1)',
      'PEL': 'Pełnomocnictwo do ZUS (PEL)',
      'PIT-36': 'Zeznanie roczne PIT-36',
      'PIT-37': 'Zeznanie roczne PIT-37',
      'VAT-7': 'Deklaracja VAT-7',
      'VAT-7K': 'Deklaracja VAT-7K',
      'CIT-8': 'Zeznanie CIT-8',
      'ZUS-DRA': 'Zgłoszenie do ubezpieczeń (ZUS DRA)',
    };
    return titles[type] || `Formularz ${type}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            {getFormTitle(formType)}
          </DialogTitle>
          <DialogDescription>
            Sprawdź i edytuj dane przed wygenerowaniem dokumentu
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4 py-4">
            {/* Client Information Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Dane klienta
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {fields.filter(f => f.id.startsWith('client')).map((field) => (
                  <div key={field.id} className="space-y-2">
                    <Label htmlFor={field.id}>{field.label}</Label>
                    {field.type === 'textarea' ? (
                      <Textarea
                        id={field.id}
                        value={field.value}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        disabled={field.type === 'readonly' || !isEditing}
                        className="min-h-[80px]"
                      />
                    ) : (
                      <Input
                        id={field.id}
                        type={field.type}
                        value={field.value}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        disabled={field.type === 'readonly' || !isEditing}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Employee Information Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Dane pełnomocnika
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {fields.filter(f => f.id.startsWith('employee')).map((field) => (
                  <div key={field.id} className="space-y-2">
                    <Label htmlFor={field.id}>{field.label}</Label>
                    <Input
                      id={field.id}
                      type={field.type}
                      value={field.value}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      disabled={field.type === 'readonly' || !isEditing}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Other fields */}
            {fields.filter(f => !f.id.startsWith('client') && !f.id.startsWith('employee')).length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Dodatkowe informacje
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {fields.filter(f => !f.id.startsWith('client') && !f.id.startsWith('employee')).map((field) => (
                      <div key={field.id} className={field.type === 'textarea' ? 'col-span-2' : ''}>
                        <div className="space-y-2">
                          <Label htmlFor={field.id}>{field.label}</Label>
                          {field.type === 'textarea' ? (
                            <Textarea
                              id={field.id}
                              value={field.value}
                              onChange={(e) => handleFieldChange(field.id, e.target.value)}
                              placeholder={field.placeholder}
                              disabled={field.type === 'readonly' || !isEditing}
                              className="min-h-[100px]"
                            />
                          ) : (
                            <Input
                              id={field.id}
                              type={field.type}
                              value={field.value}
                              onChange={(e) => handleFieldChange(field.id, e.target.value)}
                              placeholder={field.placeholder}
                              disabled={field.type === 'readonly' || !isEditing}
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="rounded-lg bg-blue-50 p-4 text-sm border border-blue-200">
              <p className="font-medium text-blue-900 mb-2">ℹ️ Informacja</p>
              <p className="text-blue-700 text-xs">
                Sprawdź wszystkie dane przed wygenerowaniem dokumentu. Po kliknięciu "Generuj i pobierz" 
                dokument zostanie utworzony z aktualnymi wartościami i automatycznie pobrany na Twoje urządzenie.
              </p>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isGenerating}>
            Anuluj
          </Button>
          <Button onClick={handleGenerate} disabled={isGenerating}>
            <Download className="mr-2 h-4 w-4" />
            {isGenerating ? 'Generowanie...' : 'Generuj i pobierz'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
