import { Client, User } from '../types/client';
import { UPL1PdfFiller } from './upl1PdfFiller';
import { TaxFormService } from './taxFormService';

// Form type definitions with complexity levels
export type FormType =
  // Authorization forms (existing)
  | 'UPL-1'
  | 'PEL'
  // Simple forms - basic client + employee info
  | 'ZAW-FA'
  // Tax forms - comprehensive client data
  | 'PIT-36'
  | 'PIT-37'
  | 'PIT-4R'
  | 'PIT-11'
  // VAT forms
  | 'VAT-7'
  | 'VAT-7K'
  | 'VAT-R'
  | 'VAT-UE'
  // CIT forms
  | 'CIT-8'
  // ZUS forms
  | 'ZUS-DRA'
  | 'ZUS-RCA'
  | 'ZUS-ZWUA'
  | 'ZUS-RMUA'
  // JPK files
  | 'JPK_VAT'
  | 'JPK_FA'
  | 'JPK_KR';

export type FormComplexity = 'simple' | 'medium' | 'complex';

export type FormCategory = 'pelnomocnictwa' | 'pit' | 'vat' | 'cit' | 'zus' | 'jpk' | 'inne';

export interface FormMetadata {
  type: FormType;
  name: string;
  description: string;
  complexity: FormComplexity;
  category: FormCategory;
  requiredFields: string[];
  optionalFields: string[];
}

interface AuthorizationFormData {
  client: Client;
  employee: User;
  formType: FormType;
  additionalData?: {
    period?: string; // e.g., "01/2024"
    year?: string;
    taxOffice?: string;
    accountNumber?: string;
    [key: string]: any;
  };
}

// Form metadata registry
export const FORM_METADATA: Record<FormType, FormMetadata> = {
  // Authorization forms
  'UPL-1': {
    type: 'UPL-1',
    name: 'UPL-1',
    description: 'Pełnomocnictwo do Urzędu Skarbowego',
    complexity: 'simple',
    category: 'pelnomocnictwa',
    requiredFields: ['firstName', 'lastName', 'nip'],
    optionalFields: ['companyName', 'regon', 'address'],
  },
  PEL: {
    type: 'PEL',
    name: 'PEL',
    description: 'Pełnomocnictwo do ZUS',
    complexity: 'simple',
    category: 'pelnomocnictwa',
    requiredFields: ['firstName', 'lastName', 'nip'],
    optionalFields: ['companyName', 'regon', 'address'],
  },

  // Simple forms
  'ZAW-FA': {
    type: 'ZAW-FA',
    name: 'ZAW-FA',
    description: 'Zawiadomienie o wyborze formy opodatkowania',
    complexity: 'simple',
    category: 'inne',
    requiredFields: ['firstName', 'lastName', 'nip'],
    optionalFields: ['companyName', 'address'],
  },

  // PIT forms - complex
  'PIT-36': {
    type: 'PIT-36',
    name: 'PIT-36',
    description: 'Zeznanie roczne od przychodów z działalności gospodarczej',
    complexity: 'complex',
    category: 'pit',
    requiredFields: ['firstName', 'lastName', 'nip', 'pesel', 'address', 'taxOffice'],
    optionalFields: ['regon', 'companyName', 'bankAccount', 'phone', 'email'],
  },
  'PIT-37': {
    type: 'PIT-37',
    name: 'PIT-37',
    description: 'Zeznanie roczne o wysokości osiągniętego dochodu',
    complexity: 'complex',
    category: 'pit',
    requiredFields: ['firstName', 'lastName', 'nip', 'pesel', 'address', 'taxOffice'],
    optionalFields: ['spouse', 'children', 'bankAccount'],
  },
  'PIT-4R': {
    type: 'PIT-4R',
    name: 'PIT-4R',
    description: 'Zeznanie roczne o zryczałtowanym podatku dochodowym',
    complexity: 'medium',
    category: 'pit',
    requiredFields: ['firstName', 'lastName', 'nip', 'address'],
    optionalFields: ['regon', 'companyName', 'pkd'],
  },
  'PIT-11': {
    type: 'PIT-11',
    name: 'PIT-11',
    description: 'Informacja o dochodach wypłaconych osobom fizycznym',
    complexity: 'medium',
    category: 'pit',
    requiredFields: ['companyName', 'nip', 'address'],
    optionalFields: ['regon', 'email'],
  },

  // VAT forms
  'VAT-7': {
    type: 'VAT-7',
    name: 'VAT-7',
    description: 'Deklaracja VAT miesięczna',
    complexity: 'medium',
    category: 'vat',
    requiredFields: ['firstName', 'lastName', 'nip', 'address'],
    optionalFields: ['companyName', 'regon', 'email'],
  },
  'VAT-7K': {
    type: 'VAT-7K',
    name: 'VAT-7K',
    description: 'Deklaracja VAT kwartalna',
    complexity: 'medium',
    category: 'vat',
    requiredFields: ['firstName', 'lastName', 'nip', 'address'],
    optionalFields: ['companyName', 'regon', 'email'],
  },
  'VAT-R': {
    type: 'VAT-R',
    name: 'VAT-R',
    description: 'Rejestracja jako podatnik VAT',
    complexity: 'simple',
    category: 'vat',
    requiredFields: ['firstName', 'lastName', 'nip', 'address', 'businessStartDate'],
    optionalFields: ['companyName', 'regon', 'pkd'],
  },
  'VAT-UE': {
    type: 'VAT-UE',
    name: 'VAT-UE',
    description: 'Informacja podsumowująca o transakcjach wewnątrzunijnych',
    complexity: 'medium',
    category: 'vat',
    requiredFields: ['firstName', 'lastName', 'nip', 'nipUE'],
    optionalFields: ['companyName', 'regon'],
  },

  // CIT forms
  'CIT-8': {
    type: 'CIT-8',
    name: 'CIT-8',
    description: 'Zeznanie roczne o wysokości dochodu',
    complexity: 'complex',
    category: 'cit',
    requiredFields: ['companyName', 'nip', 'regon', 'krs', 'address'],
    optionalFields: ['taxOffice', 'bankAccount', 'email'],
  },

  // ZUS forms
  'ZUS-DRA': {
    type: 'ZUS-DRA',
    name: 'ZUS-DRA',
    description: 'Raport miesięczny rozliczeniowy',
    complexity: 'medium',
    category: 'zus',
    requiredFields: ['firstName', 'lastName', 'nip'],
    optionalFields: ['companyName', 'regon', 'zusCode'],
  },
  'ZUS-RCA': {
    type: 'ZUS-RCA',
    name: 'ZUS-RCA',
    description: 'Imienne raporty miesięczne rozliczeniowe',
    complexity: 'medium',
    category: 'zus',
    requiredFields: ['firstName', 'lastName', 'nip', 'pesel'],
    optionalFields: ['companyName', 'zusCode'],
  },
  'ZUS-ZWUA': {
    type: 'ZUS-ZWUA',
    name: 'ZUS-ZWUA',
    description: 'Zgłoszenie do ubezpieczeń',
    complexity: 'simple',
    category: 'zus',
    requiredFields: ['firstName', 'lastName', 'pesel', 'nip'],
    optionalFields: ['companyName', 'address'],
  },
  'ZUS-RMUA': {
    type: 'ZUS-RMUA',
    name: 'ZUS-RMUA',
    description: 'Zgłoszenie zmiany danych',
    complexity: 'simple',
    category: 'zus',
    requiredFields: ['firstName', 'lastName', 'pesel', 'nip'],
    optionalFields: ['companyName', 'newAddress'],
  },

  // JPK files
  JPK_VAT: {
    type: 'JPK_VAT',
    name: 'JPK_VAT',
    description: 'Jednolity Plik Kontrolny VAT',
    complexity: 'complex',
    category: 'jpk',
    requiredFields: ['companyName', 'nip', 'regon'],
    optionalFields: ['email', 'period'],
  },
  JPK_FA: {
    type: 'JPK_FA',
    name: 'JPK_FA',
    description: 'Jednolity Plik Kontrolny Faktura',
    complexity: 'complex',
    category: 'jpk',
    requiredFields: ['companyName', 'nip'],
    optionalFields: ['regon', 'period'],
  },
  JPK_KR: {
    type: 'JPK_KR',
    name: 'JPK_KR',
    description: 'Jednolity Plik Kontrolny Księgi Rachunkowe',
    complexity: 'complex',
    category: 'jpk',
    requiredFields: ['companyName', 'nip', 'krs'],
    optionalFields: ['regon', 'period'],
  },
};

export function getFormsByCategory(category: FormCategory): FormMetadata[] {
  return Object.values(FORM_METADATA).filter((form) => form.category === category);
}

export function getFormsByComplexity(complexity: FormComplexity): FormMetadata[] {
  return Object.values(FORM_METADATA).filter((form) => form.complexity === complexity);
}

export class AuthorizationFormGenerator {
  constructor() {
    // Template-based PDF filling only - no programmatic generation
  }

  async generateForm(
    data: AuthorizationFormData,
    keepFieldsEditable: boolean = false
  ): Promise<Blob> {
    // Special handling for UPL-1 - use official PDF template with pdf-lib ONLY
    if (data.formType === 'UPL-1') {
      return await this.generateUPL1FormFromTemplate(data, keepFieldsEditable);
    }

    // Special handling for PEL - use template-based approach
    if (data.formType === 'PEL') {
      return await this.generateFormFromTemplate(data, keepFieldsEditable);
    }

    // Use template-based filling for all forms that have templates
    const templateForms = [
      'PIT-37',
      'PIT-R',
      'ZAW-FA',
      'PIT-2',
      'PIT-OP',
      'IFT-1',
      'UPL-1P',
      'OPD-1',
      'OPL-1',
      'OPO-1',
      'OPS-1',
      'PPD-1',
      'PPO-1',
      'PPS-1',
    ];
    if (templateForms.includes(data.formType)) {
      return await this.generateFormFromTemplate(data, keepFieldsEditable);
    }

    // For forms without templates, throw an error
    throw new Error(
      `Form type ${data.formType} requires an official PDF template.\n\n` +
        `Please add the official ${data.formType} PDF template to: /public/pdf-templates/${data.formType}/\n` +
        `Download the official template from the appropriate government website and place it in the correct directory.`
    );
  }

  async downloadForm(
    data: AuthorizationFormData,
    keepFieldsEditable: boolean = false
  ): Promise<void> {
    const blob = await this.generateForm(data, keepFieldsEditable);
    const fileName = `${data.formType}_${data.client.lastName}_${data.client.firstName}_${new Date().toISOString().split('T')[0]}.pdf`;

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Generate a fillable PDF blob URL for preview in popup
   * This returns a URL that can be used in an iframe
   * Form fields will be kept editable so users can fill remaining fields
   * @returns Object with the blob URL and cleanup function
   */
  async generateFormBlobUrl(
    data: AuthorizationFormData
  ): Promise<{ url: string; fileName: string; cleanup: () => void }> {
    // Generate with keepFieldsEditable = true for preview
    const blob = await this.generateForm(data, true);
    const fileName = `${data.formType}_${data.client.lastName}_${data.client.firstName}_${new Date().toISOString().split('T')[0]}.pdf`;
    const url = URL.createObjectURL(blob);

    return {
      url,
      fileName,
      cleanup: () => URL.revokeObjectURL(url),
    };
  }

  /**
   * Generate UPL-1 form using official PDF template and pdf-lib
   * Template-based approach ONLY - no fallback to programmatic generation
   */
  private async generateUPL1FormFromTemplate(
    data: AuthorizationFormData,
    keepFieldsEditable: boolean = false
  ): Promise<Blob> {
    // Use pdf-lib with official template (template-based approach)
    const filler = new UPL1PdfFiller('/pdf-templates/UPL-1/2023/UPL-1_2023.pdf');
    try {
      return await filler.fillFormAsBlob(
        {
          client: data.client,
          employee: data.employee,
          startDate: data.additionalData?.startDate,
          endDate: data.additionalData?.endDate,
          scope: data.additionalData?.scope,
          taxOffice: data.additionalData?.taxOffice,
        },
        { keepFieldsEditable }
      );
    } catch (error) {
      // Clear error message directing user to add the official PDF template
      throw new Error(
        `Failed to fill UPL-1 form template: ${error instanceof Error ? error.message : String(error)}\n\n` +
          `Please ensure the official UPL-1 PDF template exists at: /public/pdf-templates/UPL-1/2023/UPL-1_2023.pdf\n` +
          `You can download the official template from the Polish Ministry of Finance website.`
      );
    }
  }

  /**
   * Generate form using official PDF template and TaxFormService
   * Supports: PIT-37, PIT-R, PEL, ZAW-FA, PIT-2, PIT-OP, IFT-1, UPL-1P, and declaration forms
   */
  private async generateFormFromTemplate(
    data: AuthorizationFormData,
    keepFieldsEditable: boolean = false
  ): Promise<Blob> {
    const { client, employee, additionalData, formType } = data;
    const year = additionalData?.year || new Date().getFullYear().toString();

    let formData: any = {};

    // Prepare form data based on form type
    switch (formType) {
      case 'PIT-37':
        formData = {
          taxpayerName: `${client.firstName} ${client.lastName}`,
          taxpayerId: client.pesel || '',
          taxpayerNIP: client.nip || '',
          taxpayerAddress: client.address || '',
          taxpayerCity: client.city || '',
          taxpayerPostalCode: client.postalCode || '',
          taxOffice: additionalData?.taxOffice || '',
          employmentIncome: additionalData?.employmentIncome || 0,
          civilContractIncome: additionalData?.civilContractIncome || 0,
          numberOfChildren: additionalData?.numberOfChildren || 0,
          childDeduction: additionalData?.childDeduction || 1112.04,
          taxPaid: additionalData?.taxPaid || 0,
        };
        break;

      case 'PIT-R':
        formData = {
          taxpayerName: `${client.firstName} ${client.lastName}`,
          taxpayerId: client.pesel || '',
          taxpayerNIP: client.nip || '',
          taxpayerAddress: client.address || '',
          taxpayerCity: client.city || '',
          taxOffice: additionalData?.taxOffice || '',
          businessIncome: additionalData?.businessIncome || 0,
          businessCosts: additionalData?.businessCosts || 0,
          taxPaid: additionalData?.taxPaid || 0,
        };
        break;

      case 'PIT-2':
        formData = {
          taxpayerName: `${client.firstName} ${client.lastName}`,
          taxpayerId: client.pesel || '',
          taxpayerNIP: client.nip || '',
          taxOffice: additionalData?.taxOffice || '',
          taxYear: additionalData?.taxYear || year,
          totalIncome: additionalData?.totalIncome || 0,
          taxAmount: additionalData?.taxAmount || 0,
        };
        break;

      case 'PIT-OP':
        formData = {
          taxpayerName: `${client.firstName} ${client.lastName}`,
          taxpayerId: client.pesel || '',
          taxpayerAddress: client.address || '',
          taxOffice: additionalData?.taxOffice || '',
          advancePayment: additionalData?.advancePayment || 0,
          paymentMonth: additionalData?.paymentMonth || new Date().getMonth() + 1,
        };
        break;

      case 'IFT-1':
        formData = {
          taxpayerName: `${client.firstName} ${client.lastName}`,
          taxpayerId: client.pesel || '',
          taxpayerNIP: client.nip || '',
          taxpayerAddress: client.address || '',
          taxOffice: additionalData?.taxOffice || '',
          incomeSource: additionalData?.incomeSource || '',
          incomeAmount: additionalData?.incomeAmount || 0,
          taxAmount: additionalData?.taxAmount || 0,
        };
        break;

      case 'UPL-1P':
        formData = {
          principalName: client.companyName || `${client.firstName} ${client.lastName}`,
          principalNIP: client.nip || '',
          attorneyName: employee ? `${employee.firstName} ${employee.lastName}` : '',
          attorneyPESEL: employee?.pesel || '',
          scope: additionalData?.scope || 'Reprezentacja podatkowa',
          issueDate: new Date().toLocaleDateString('pl-PL'),
        };
        break;

      case 'PEL':
        formData = {
          principalName: client.companyName || `${client.firstName} ${client.lastName}`,
          principalNIP: client.nip || '',
          principalREGON: client.regon || '',
          principalAddress: client.address || '',
          attorneyName: employee ? `${employee.firstName} ${employee.lastName}` : '',
          attorneyPESEL: employee?.pesel || '',
          scope: additionalData?.scope || 'Reprezentacja w ZUS',
          issueDate: new Date().toLocaleDateString('pl-PL'),
        };
        break;

      case 'ZAW-FA':
        formData = {
          employeeName: `${client.firstName} ${client.lastName}`,
          employeePESEL: client.pesel || '',
          employeeAddress: client.address || '',
          employerName: additionalData?.employerName || '',
          employerNIP: additionalData?.employerNIP || '',
          employmentDate: additionalData?.employmentDate || new Date().toLocaleDateString('pl-PL'),
          taxDeduction: additionalData?.taxDeduction || 'TAK',
        };
        break;

      case 'OPD-1':
      case 'OPL-1':
      case 'OPO-1':
      case 'OPS-1':
      case 'PPD-1':
      case 'PPO-1':
      case 'PPS-1':
        // Declaration forms - generic structure
        formData = {
          payerName: client.companyName || `${client.firstName} ${client.lastName}`,
          payerNIP: client.nip || '',
          declarationDate: new Date().toLocaleDateString('pl-PL'),
          amount: additionalData?.amount || 0,
        };
        break;

      default:
        throw new Error(`Form type ${formType} not supported in template generation`);
    }

    const taxFormService = new TaxFormService();
    return await taxFormService.fillFormAsBlob(formType, year, formData, { keepFieldsEditable });
  }

  /**
   * @deprecated Use generateFormFromTemplate instead
   * Generate PIT-37 form using official PDF template and TaxFormService
   */
  private async generatePIT37FromTemplate(data: AuthorizationFormData): Promise<Blob> {
    return await this.generateFormFromTemplate(data);
  }
}
