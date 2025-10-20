import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Client, User } from '../types/client';

/**
 * UPL-1 PDF Form Filler
 *
 * Fills the official UPL-1 form (Pełnomocnictwo do Urzędu Skarbowego)
 * by drawing text at specific coordinates on the official PDF template.
 *
 * Coordinates are measured from bottom-left corner (0,0) as per PDF standard.
 * The UPL-1 form is A4 size: 595x842 points.
 */

export interface UPL1Data {
  client: Client;
  employee: User;
  scope?: string[];
  startDate?: string;
  endDate?: string;
  taxOffice?: string;
}

export interface UPL1FillingOptions {
  /** If true, keeps form fields editable instead of flattening them */
  keepFieldsEditable?: boolean;
}

/**
 * Field coordinates for UPL-1 form
 * These coordinates are based on the official PDF form layout
 * Y coordinates are from bottom of page (842 - visual_y_from_top)
 */
const UPL1_FIELD_COORDINATES = {
  // Page 1 - Main form fields
  // Mocodawca (Principal) section - typically around y=700-750 from bottom
  principalName: { x: 150, y: 720 },
  principalNIP: { x: 150, y: 695 },
  principalREGON: { x: 150, y: 670 },
  principalAddress: { x: 150, y: 645 },
  principalCity: { x: 150, y: 620 },

  // Pełnomocnik (Attorney) section - typically around y=500-580 from bottom
  attorneyName: { x: 150, y: 560 },
  attorneyPESEL: { x: 150, y: 535 },
  attorneyAddress: { x: 150, y: 510 },
  attorneyCity: { x: 150, y: 485 },

  // Zakres pełnomocnictwa (Scope) section - typically around y=300-450 from bottom
  scope1: { x: 50, y: 420 },
  scope2: { x: 50, y: 400 },
  scope3: { x: 50, y: 380 },
  scope4: { x: 50, y: 360 },
  scope5: { x: 50, y: 340 },
  scope6: { x: 50, y: 320 },

  // Okres obowiązywania (Validity period) - typically around y=250-280 from bottom
  startDate: { x: 150, y: 270 },
  endDate: { x: 350, y: 270 },

  // Data i miejsce (Date and place) - typically around y=150-200 from bottom
  issueDate: { x: 150, y: 180 },
  issuePlace: { x: 350, y: 180 },

  // Podpisy (Signatures) - typically around y=80-120 from bottom
  principalSignature: { x: 100, y: 100 },
  attorneySignature: { x: 400, y: 100 },
};

export class UPL1PdfFiller {
  private pdfTemplatePath: string;

  constructor(pdfTemplatePath: string = '/pdf-templates/UPL-1/2023/UPL-1_2023.pdf') {
    this.pdfTemplatePath = pdfTemplatePath;
  }

  /**
   * Fill the UPL-1 form with provided data
   * @param data Client and employee data to fill the form
   * @param options Filling options
   * @returns PDF bytes as Uint8Array
   */
  async fillForm(data: UPL1Data, options: UPL1FillingOptions = {}): Promise<Uint8Array> {
    // Load the template PDF from public folder
    // In browser, fetch from the public URL
    // Try multiple paths for better compatibility
    let templateUrl = this.pdfTemplatePath;

    // Ensure the path is absolute (starts with /)
    if (!templateUrl.startsWith('/')) {
      templateUrl = '/' + templateUrl;
    }

    // Get the base path from import.meta.env or use default
    const basePath = import.meta.env.BASE_URL || '/';

    // Construct full URL with base path
    let fullUrl = basePath === '/' ? templateUrl : `${basePath}${templateUrl.substring(1)}`;

    let response = await fetch(fullUrl);

    // If primary path fails, try alternative locations (including legacy path for backward compatibility)
    if (!response.ok) {
      console.log('Primary PDF path failed, trying alternative locations...');
      const alternativePaths = [
        '/upl-1_06-08-2.pdf', // Legacy path for backward compatibility
        '/pdf-templates/UPL-1/2023/UPL-1_2023.pdf',
        '/pdf-templates/UPL-1/2023/UPL-1 2023.pdf', // Try with space in filename
      ];

      for (const altPath of alternativePaths) {
        const altFullUrl = basePath === '/' ? altPath : `${basePath}${altPath.substring(1)}`;
        response = await fetch(altFullUrl);
        if (response.ok) {
          console.log(`PDF loaded from alternative path: ${altFullUrl}`);
          break;
        }
      }
    }

    if (!response.ok) {
      throw new Error(
        `Failed to load PDF template from ${fullUrl}: ${response.statusText}. Please ensure the official PDF file exists in the public folder at the correct path.`
      );
    }
    const pdfBytes = await response.arrayBuffer();

    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    // Check if PDF has interactive form fields
    const form = pdfDoc.getForm();
    const formFields = form.getFields();

    // If the PDF has form fields and we want to keep them editable, use Acroform filling
    if (formFields.length > 0 && options.keepFieldsEditable) {
      return await this.fillFormWithAcrofields(pdfDoc, form, data);
    }

    // Otherwise, use coordinate-based filling (legacy method)
    // Embed a standard font that supports basic characters
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 10;
    const textColor = rgb(0, 0, 0);

    // Helper function to draw text with proper encoding
    const drawText = (text: string, x: number, y: number, size: number = fontSize) => {
      if (!text) return;

      // Convert Polish characters for better compatibility
      const cleanText = this.sanitizeText(text);

      firstPage.drawText(cleanText, {
        x,
        y,
        size,
        font,
        color: textColor,
      });
    };

    // Fill principal (Mocodawca) data
    const { client } = data;

    const clientName = `${client.firstName || ''} ${client.lastName || ''}`.trim();
    if (clientName) {
      drawText(
        clientName,
        UPL1_FIELD_COORDINATES.principalName.x,
        UPL1_FIELD_COORDINATES.principalName.y
      );
    }

    if (client.companyName) {
      drawText(
        client.companyName,
        UPL1_FIELD_COORDINATES.principalName.x,
        UPL1_FIELD_COORDINATES.principalName.y - 15
      );
    }

    if (client.nip) {
      drawText(
        client.nip,
        UPL1_FIELD_COORDINATES.principalNIP.x,
        UPL1_FIELD_COORDINATES.principalNIP.y
      );
    }

    if (client.regon) {
      drawText(
        client.regon,
        UPL1_FIELD_COORDINATES.principalREGON.x,
        UPL1_FIELD_COORDINATES.principalREGON.y
      );
    }

    if (client.address) {
      const street = client.address.street || '';
      if (street) {
        drawText(
          street,
          UPL1_FIELD_COORDINATES.principalAddress.x,
          UPL1_FIELD_COORDINATES.principalAddress.y
        );
      }

      const cityLine = `${client.address.zipCode || ''} ${client.address.city || ''}`.trim();
      if (cityLine) {
        drawText(
          cityLine,
          UPL1_FIELD_COORDINATES.principalCity.x,
          UPL1_FIELD_COORDINATES.principalCity.y
        );
      }
    }

    // Fill attorney (Pełnomocnik) data
    const { employee } = data;

    const employeeName = `${employee.firstName || ''} ${employee.lastName || ''}`.trim();
    if (employeeName) {
      drawText(
        employeeName,
        UPL1_FIELD_COORDINATES.attorneyName.x,
        UPL1_FIELD_COORDINATES.attorneyName.y
      );
    }

    if (employee.pesel) {
      drawText(
        employee.pesel,
        UPL1_FIELD_COORDINATES.attorneyPESEL.x,
        UPL1_FIELD_COORDINATES.attorneyPESEL.y
      );
    }

    // Fill scope of authorization
    const defaultScope = [
      '1. Reprezentowania mocodawcy przed organami skarbowymi',
      '2. Składania deklaracji podatkowych i innych dokumentów',
      '3. Odbierania korespondencji związanej ze sprawami podatkowymi',
      '4. Dostępu do informacji podatkowych mocodawcy',
      '5. Podpisywania dokumentów w imieniu mocodawcy',
      '6. Składania wniosków i odwołań w sprawach podatkowych',
    ];

    // Ensure scopeItems is always an array
    const scopeItems = Array.isArray(data.scope)
      ? data.scope
      : data.scope
        ? [data.scope]
        : defaultScope;
    const scopeCoordinates = [
      UPL1_FIELD_COORDINATES.scope1,
      UPL1_FIELD_COORDINATES.scope2,
      UPL1_FIELD_COORDINATES.scope3,
      UPL1_FIELD_COORDINATES.scope4,
      UPL1_FIELD_COORDINATES.scope5,
      UPL1_FIELD_COORDINATES.scope6,
    ];

    // Then safely use slice and forEach
    scopeItems.slice(0, 6).forEach((scopeItem, index) => {
      if (scopeCoordinates[index]) {
        drawText(scopeItem, scopeCoordinates[index].x, scopeCoordinates[index].y, 9);
      }
    });

    // Fill dates
    const currentDate = data.startDate || new Date().toLocaleDateString('pl-PL');
    drawText(currentDate, UPL1_FIELD_COORDINATES.issueDate.x, UPL1_FIELD_COORDINATES.issueDate.y);

    if (data.startDate) {
      drawText(
        data.startDate,
        UPL1_FIELD_COORDINATES.startDate.x,
        UPL1_FIELD_COORDINATES.startDate.y
      );
    }

    if (data.endDate) {
      drawText(data.endDate, UPL1_FIELD_COORDINATES.endDate.x, UPL1_FIELD_COORDINATES.endDate.y);
    }

    // Save the filled PDF
    const filledPdfBytes = await pdfDoc.save();
    return filledPdfBytes;
  }

  /**
   * Fill form using Acroform fields (keeps fields editable)
   * @param pdfDoc The PDF document
   * @param form The PDF form
   * @param data Form data
   * @returns PDF bytes as Uint8Array
   */
  private async fillFormWithAcrofields(
    pdfDoc: PDFDocument,
    form: any,
    data: UPL1Data
  ): Promise<Uint8Array> {
    const { client, employee } = data;

    // Map field names to values
    const fieldMappings: Record<string, string> = {
      // Principal fields - try multiple common field name patterns
      principalName: `${client.firstName || ''} ${client.lastName || ''}`.trim(),
      mocodawca: `${client.firstName || ''} ${client.lastName || ''}`.trim(),
      nazwisko_imie: `${client.firstName || ''} ${client.lastName || ''}`.trim(),
      principalNIP: client.nip || '',
      nip: client.nip || '',
      principalREGON: client.regon || '',
      regon: client.regon || '',
      principalAddress:
        client.address?.street || (typeof client.address === 'string' ? client.address : ''),
      adres: client.address?.street || (typeof client.address === 'string' ? client.address : ''),
      principalCity: `${client.address?.zipCode || ''} ${client.address?.city || ''}`.trim(),
      miasto: `${client.address?.zipCode || ''} ${client.address?.city || ''}`.trim(),

      // Attorney fields
      attorneyName: `${employee.firstName || ''} ${employee.lastName || ''}`.trim(),
      pelnomocnik: `${employee.firstName || ''} ${employee.lastName || ''}`.trim(),
      attorneyPESEL: employee.pesel || '',
      pesel: employee.pesel || '',

      // Dates
      issueDate: data.startDate || new Date().toLocaleDateString('pl-PL'),
      data_wystawienia: data.startDate || new Date().toLocaleDateString('pl-PL'),
      startDate: data.startDate || '',
      data_od: data.startDate || '',
      endDate: data.endDate || '',
      data_do: data.endDate || '',
    };

    // Fill all form fields
    const fields = form.getFields();
    let filledCount = 0;

    for (const field of fields) {
      try {
        const fieldName = field.getName();

        // Try to find a matching value using fuzzy matching
        let value = fieldMappings[fieldName];

        if (!value) {
          // Try case-insensitive matching
          const lowerFieldName = fieldName.toLowerCase();
          for (const [key, val] of Object.entries(fieldMappings)) {
            if (
              key.toLowerCase() === lowerFieldName ||
              lowerFieldName.includes(key.toLowerCase())
            ) {
              value = val;
              break;
            }
          }
        }

        // Handle text fields
        if (value && field.constructor.name === 'PDFTextField') {
          const sanitizedValue = this.sanitizeText(value);
          field.setText(sanitizedValue);
          filledCount++;
        }
        // Handle checkbox fields
        else if (field.constructor.name === 'PDFCheckBox') {
          // Check if the field name suggests it should be checked
          // For example, if we have a scope selection checkbox
          if (value === 'true' || value === '1' || value === 'X' || value === 'x') {
            field.check();
            filledCount++;
          }
        }
        // Handle radio groups
        else if (field.constructor.name === 'PDFRadioGroup') {
          if (value) {
            try {
              field.select(value);
              filledCount++;
            } catch (error) {
              console.warn(`Could not select radio option for ${field.getName()}: ${value}`);
            }
          }
        }
      } catch (error) {
        console.warn(`Could not fill field ${field.getName()}:`, error);
      }
    }

    console.log(`Filled ${filledCount} out of ${fields.length} form fields`);

    // Important: Don't flatten the form - keep fields editable
    // Save without flattening
    const pdfBytes = await pdfDoc.save({ useObjectStreams: false });
    return pdfBytes;
  }

  /**
   * Draw an X mark or checkmark at specified coordinates
   * Used for checkbox fields when doing coordinate-based filling
   */
  private drawCheckmark(page: any, x: number, y: number, size: number = 10) {
    // Draw an X mark
    page.drawText('X', {
      x,
      y,
      size,
      color: rgb(0, 0, 0),
    });
  }

  /**
   * Sanitize text to handle Polish characters
   * Converts Polish characters to ASCII equivalents for PDF compatibility
   */
  private sanitizeText(text: string): string {
    // Map Polish characters to ASCII equivalents
    const polishCharMap: { [key: string]: string } = {
      ą: 'a',
      Ą: 'A',
      ć: 'c',
      Ć: 'C',
      ę: 'e',
      Ę: 'E',
      ł: 'l',
      Ł: 'L',
      ń: 'n',
      Ń: 'N',
      ó: 'o',
      Ó: 'O',
      ś: 's',
      Ś: 'S',
      ź: 'z',
      Ź: 'Z',
      ż: 'z',
      Ż: 'Z',
    };

    let sanitized = text;
    for (const [polish, ascii] of Object.entries(polishCharMap)) {
      sanitized = sanitized.replace(new RegExp(polish, 'g'), ascii);
    }

    // Remove control characters
    // eslint-disable-next-line no-control-regex
    return sanitized.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
  }

  /**
   * Generate a Blob from the filled PDF (for browser download)
   */
  async fillFormAsBlob(data: UPL1Data, options: UPL1FillingOptions = {}): Promise<Blob> {
    const pdfBytes = await this.fillForm(data, options);
    return new Blob([pdfBytes], { type: 'application/pdf' });
  }
}
