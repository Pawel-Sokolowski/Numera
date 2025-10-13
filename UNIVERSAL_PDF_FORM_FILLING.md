# Universal PDF Form Filling

## Overview

The Universal PDF Form Filler automatically fills **ANY** PDF form without requiring manual coordinate mapping or form-specific code. It works with:

- ✅ Polish government forms (UPL-1, PEL, PIT-37, etc.)
- ✅ Business forms
- ✅ Custom PDF forms
- ✅ Forms with interactive fields (Acroform)
- ✅ Flat PDF forms (no interactive fields)

## How It Works

The system automatically detects the type of PDF and uses the most appropriate method:

1. **Acroform Detection** (for PDFs with interactive fields)
   - Automatically detects all form fields
   - Fills fields by name with intelligent fuzzy matching
   - Handles text fields, checkboxes, radio buttons, and dropdowns

2. **Intelligent Coordinate-Based Filling** (for flat PDFs)
   - Automatically calculates smart field positions
   - Uses multi-column layout for better space utilization
   - Sanitizes Polish characters for PDF compatibility

## Quick Start

### Running Tests

```bash
# Test universal form filling
npm run test:universal-pdf-filling
```

### Using in Your Code

```typescript
import { UniversalPdfFiller } from './src/utils/universalPdfFiller';

const filler = new UniversalPdfFiller();

// Prepare your data - field names can be anything!
const data = {
  firstName: 'Jan',
  lastName: 'Kowalski',
  companyName: 'My Company Sp. z o.o.',
  nip: '1234567890',
  address: 'ul. Example 123',
  city: 'Warszawa',
  email: 'jan@example.com',
  date: '13.10.2025',
  // ... any other fields
};

// Fill the form
const { pdfBytes, result } = await filler.fillForm(pdfBytes, data);

// Check results
console.log(`Method: ${result.method}`); // 'acroform' or 'coordinate'
console.log(`Filled: ${result.fieldsFilled} fields`);
console.log(`Skipped: ${result.fieldsSkipped} fields`);

// Save or download
fs.writeFileSync('filled-form.pdf', pdfBytes);
```

### Browser Usage

```typescript
import { UniversalPdfFiller } from './utils/universalPdfFiller';

const filler = new UniversalPdfFiller();

// Load PDF
const response = await fetch('/path/to/form.pdf');
const pdfBytes = await response.arrayBuffer();

// Fill form
const blob = await filler.fillFormAsBlob(pdfBytes, formData);

// Download
const url = URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = 'filled-form.pdf';
link.click();
URL.revokeObjectURL(url);
```

## Features

### 1. Automatic Form Type Detection

The filler automatically detects whether your PDF has interactive fields or is a flat form:

```typescript
// Analyze PDF structure before filling
const analysis = await filler.analyzePdf(pdfBytes);

console.log(`Has Acroform: ${analysis.hasAcroform}`);
console.log(`Field count: ${analysis.fieldCount}`);
console.log(`Pages: ${analysis.pageCount}`);
```

### 2. Intelligent Field Matching

The filler uses fuzzy matching to connect your data to form fields, even if names don't match exactly:

```typescript
// Your data
const data = {
  firstName: 'Jan',      // Matches: 'first_name', 'firstName', 'imie'
  lastName: 'Kowalski',  // Matches: 'last_name', 'lastName', 'nazwisko'
  nip: '1234567890',     // Matches: 'NIP', 'nip', 'nip_number'
};
```

### 3. Polish Character Support

Automatically converts Polish characters to ASCII for PDF compatibility:

- ą → a, ć → c, ę → e, ł → l, ń → n
- ó → o, ś → s, ź → z, ż → z

```typescript
const data = {
  city: 'Łódź',  // Automatically converted to 'Lodz'
  name: 'Paweł', // Automatically converted to 'Pawel'
};
```

### 4. Flexible Options

```typescript
const options = {
  sanitizePolishChars: true,  // Convert Polish chars
  fontSize: 10,                // Text size
  fontColor: { r: 0, g: 0, b: 0 }, // Black text
  smartPositioning: true,      // Use intelligent positioning
  fuzzyMatching: true,         // Enable fuzzy field matching
  validateFields: true,        // Validate before filling
};

const { pdfBytes, result } = await filler.fillForm(
  pdfBytes,
  data,
  options
);
```

### 5. Detailed Results

Get comprehensive information about the filling process:

```typescript
interface FillingResult {
  success: boolean;           // Overall success
  method: 'acroform' | 'coordinate'; // Method used
  fieldsDetected: number;     // Total fields found
  fieldsFilled: number;       // Successfully filled
  fieldsSkipped: number;      // Skipped (no data)
  errors: string[];           // Any errors
  warnings: string[];         // Warnings
}
```

## Examples

### Example 1: Fill Any Government Form

```typescript
const filler = new UniversalPdfFiller();

// Works with UPL-1, PEL, PIT-37, or any other form
const pdfBytes = fs.readFileSync('any-form.pdf');

const data = {
  // Personal info
  firstName: 'Jan',
  lastName: 'Kowalski',
  pesel: '85010112345',
  
  // Company info
  companyName: 'My Company',
  nip: '1234567890',
  regon: '123456789',
  
  // Address
  street: 'ul. Testowa 123',
  city: 'Warszawa',
  zipCode: '00-001',
  
  // Dates
  date: '13.10.2025',
  startDate: '01.10.2024',
  endDate: '31.12.2024',
};

const { pdfBytes: filled } = await filler.fillForm(pdfBytes, data);
fs.writeFileSync('filled.pdf', filled);
```

### Example 2: Batch Fill Multiple Forms

```typescript
const filler = new UniversalPdfFiller();

const forms = [
  { path: 'upl-1.pdf', data: clientData1 },
  { path: 'pel.pdf', data: clientData2 },
  { path: 'pit-37.pdf', data: clientData3 },
];

for (const form of forms) {
  const pdfBytes = fs.readFileSync(form.path);
  const { pdfBytes: filled } = await filler.fillForm(pdfBytes, form.data);
  fs.writeFileSync(`filled-${form.path}`, filled);
  console.log(`✓ Filled ${form.path}`);
}
```

### Example 3: Handle Different Form Types

```typescript
const filler = new UniversalPdfFiller();

// Analyze first
const analysis = await filler.analyzePdf(pdfBytes);

if (analysis.hasAcroform) {
  console.log('Form has interactive fields:');
  analysis.fields.forEach(field => {
    console.log(`  - ${field.name} (${field.type})`);
  });
} else {
  console.log('Form is flat - will use coordinate-based filling');
}

// Fill form
const { pdfBytes: filled, result } = await filler.fillForm(pdfBytes, data);

console.log(`Used ${result.method} method`);
console.log(`Filled ${result.fieldsFilled}/${result.fieldsDetected} fields`);
```

### Example 4: Custom Positioning

```typescript
const filler = new UniversalPdfFiller();

const options = {
  smartPositioning: true,  // Use 2-column layout
  fontSize: 12,            // Larger text
  fontColor: { r: 0, g: 0, b: 1 }, // Blue text
};

const { pdfBytes: filled } = await filler.fillForm(
  pdfBytes,
  data,
  options
);
```

## API Reference

### UniversalPdfFiller Class

#### `fillForm(pdfBytes, data, options?)`

Fill any PDF form automatically.

**Parameters:**
- `pdfBytes` (Uint8Array | ArrayBuffer) - PDF file bytes
- `data` (UniversalFormData) - Form data as key-value pairs
- `options` (FillingOptions?) - Optional filling options

**Returns:** `Promise<{ pdfBytes: Uint8Array; result: FillingResult }>`

#### `fillFormAsBlob(pdfBytes, data, options?)`

Fill form and return as Blob (for browser download).

**Parameters:** Same as `fillForm`

**Returns:** `Promise<Blob>`

#### `analyzePdf(pdfBytes)`

Analyze PDF structure without filling.

**Parameters:**
- `pdfBytes` (Uint8Array | ArrayBuffer) - PDF file bytes

**Returns:** Promise with PDF analysis information

### Types

```typescript
interface UniversalFormData {
  [key: string]: string | number | boolean;
}

interface FillingOptions {
  sanitizePolishChars?: boolean;
  fontSize?: number;
  fontColor?: { r: number; g: number; b: number };
  smartPositioning?: boolean;
  fuzzyMatching?: boolean;
  validateFields?: boolean;
}

interface FillingResult {
  success: boolean;
  method: 'acroform' | 'coordinate';
  fieldsDetected: number;
  fieldsFilled: number;
  fieldsSkipped: number;
  errors: string[];
  warnings: string[];
}
```

## Supported Form Types

### Government Forms
- ✅ UPL-1 (Tax Authorization)
- ✅ PEL (ZUS Authorization)
- ✅ PIT-37, PIT-36, PIT-11 (Tax forms)
- ✅ Any other Polish government form

### Business Forms
- ✅ Invoice templates
- ✅ Contract templates
- ✅ Application forms
- ✅ Registration forms

### Custom Forms
- ✅ Any PDF with form fields
- ✅ Any flat PDF template

## How to Add Support for New Forms

**No configuration needed!** The universal filler works with any form automatically.

Simply:
1. Provide the PDF file
2. Provide data matching your form's field names
3. Call `fillForm()`

The filler will automatically:
- Detect the form structure
- Match your data to form fields
- Fill the form using the best method

## Advanced Usage

### Error Handling

```typescript
try {
  const { pdfBytes, result } = await filler.fillForm(pdfBytes, data);
  
  if (!result.success) {
    console.error('Filling failed:', result.errors);
    return;
  }
  
  if (result.warnings.length > 0) {
    console.warn('Warnings:', result.warnings);
  }
  
  // Save filled PDF
  fs.writeFileSync('filled.pdf', pdfBytes);
  
} catch (error) {
  console.error('Error:', error.message);
}
```

### Progress Monitoring

```typescript
const forms = ['form1.pdf', 'form2.pdf', 'form3.pdf'];

for (const [index, formPath] of forms.entries()) {
  console.log(`Processing ${index + 1}/${forms.length}: ${formPath}`);
  
  const pdfBytes = fs.readFileSync(formPath);
  const { result } = await filler.fillForm(pdfBytes, data);
  
  console.log(`  ✓ ${result.fieldsFilled} fields filled`);
}
```

### Validation Before Filling

```typescript
// Analyze form first
const analysis = await filler.analyzePdf(pdfBytes);

// Check if we have data for the fields
if (analysis.hasAcroform) {
  const missingFields = analysis.fields
    .filter(f => !(f.name in data))
    .map(f => f.name);
  
  if (missingFields.length > 0) {
    console.warn('Missing data for fields:', missingFields);
  }
}

// Fill form
const { pdfBytes: filled } = await filler.fillForm(pdfBytes, data);
```

## Comparison with Form-Specific Fillers

| Feature | Universal Filler | Form-Specific (e.g., UPL1PdfFiller) |
|---------|------------------|-------------------------------------|
| Works with any form | ✅ Yes | ❌ No - only specific form |
| Requires configuration | ❌ No | ✅ Yes - coordinate mapping |
| Acroform support | ✅ Yes | ⚠️ Limited |
| Automatic field detection | ✅ Yes | ❌ No |
| Polish characters | ✅ Automatic | ✅ Manual |
| Fuzzy matching | ✅ Yes | ❌ No |
| Smart positioning | ✅ Yes | ⚠️ Fixed coordinates |

## Best Practices

1. **Use descriptive field names** in your data that match common form field names
2. **Analyze PDF first** if you need to know the exact field names
3. **Enable sanitizePolishChars** when working with Polish forms
4. **Check filling results** to handle skipped fields or errors
5. **Use smartPositioning** for better appearance on flat PDFs
6. **Test with your actual forms** before production use

## Troubleshooting

### Fields Not Filled

**Problem:** Some fields are not being filled.

**Solutions:**
1. Check if field names in your data match the PDF field names
2. Enable fuzzy matching: `fuzzyMatching: true`
3. Analyze the PDF to see exact field names: `await filler.analyzePdf(pdfBytes)`

### Polish Characters Look Wrong

**Problem:** Polish characters display incorrectly.

**Solution:** Enable Polish character sanitization:
```typescript
const options = { sanitizePolishChars: true };
await filler.fillForm(pdfBytes, data, options);
```

### Text Overlapping

**Problem:** Text overlaps on flat PDFs.

**Solution:** Adjust smart positioning or use custom coordinates in your data.

## Support

For issues, questions, or feature requests, see the repository documentation or contact the development team.

---

**Status:** ✅ Production Ready  
**Version:** 1.0.0  
**Last Updated:** October 13, 2025
