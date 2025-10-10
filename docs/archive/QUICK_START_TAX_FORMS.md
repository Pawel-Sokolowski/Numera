# Quick Start: Tax Form Service

## 5-Minute Setup Guide

### Prerequisites
- Project already built and running
- PDF templates ready (optional - fallback works without them)

### Step 1: Add PDF Templates (Optional)

If you want to use template-based filling, add official PDF files:

```bash
# For PIT-37
cp PIT-37_2023.pdf src/assets/pdf-templates/PIT-37/2023/
cp PIT-37_2022.pdf src/assets/pdf-templates/PIT-37/2022/

# For UPL-1 (already in public, can be copied)
cp public/upl-1_06-08-2.pdf src/assets/pdf-templates/UPL-1/2023/UPL-1_2023.pdf
```

### Step 2: Use in Your Code

#### Simple Example - Generate PIT-37

```typescript
import { AuthorizationFormGenerator } from './utils/authorizationFormGenerator';

// Create generator
const generator = new AuthorizationFormGenerator();

// Prepare data
const formData = {
  client: {
    firstName: 'Jan',
    lastName: 'Kowalski',
    pesel: '12345678901',
    nip: '1234567890',
    address: 'ul. Przykładowa 1',
    city: 'Warszawa',
    postalCode: '00-001'
  },
  employee: { /* your employee data */ },
  formType: 'PIT-37',
  additionalData: {
    year: '2023',
    employmentIncome: 60000,
    civilContractIncome: 15000,
    numberOfChildren: 2,
    childDeduction: 1112.04,
    taxPaid: 8500
  }
};

// Generate and download
await generator.downloadForm(formData);
```

That's it! The system will:
1. Try to use the template (if available)
2. Calculate totals, deductions, and tax automatically
3. Fill the PDF and trigger download
4. Fall back to jsPDF if template is missing

### Step 3: Verify It Works

Check the downloaded PDF:
- ✅ All fields filled correctly
- ✅ Calculations are accurate
- ✅ Text is readable and properly positioned

## Common Use Cases

### Use Case 1: Single Form Generation

```typescript
// Just call downloadForm() with your data
await generator.downloadForm({
  client: clientData,
  employee: employeeData,
  formType: 'PIT-37',
  additionalData: { /* tax data */ }
});
```

### Use Case 2: Get PDF as Blob

```typescript
// Get blob instead of downloading
const pdfBlob = await generator.generateForm(formData);

// Use the blob
const url = URL.createObjectURL(pdfBlob);
window.open(url);
```

### Use Case 3: Multiple Forms

```typescript
// Generate multiple forms
const clients = [client1, client2, client3];

for (const client of clients) {
  await generator.downloadForm({
    client,
    employee: employeeData,
    formType: 'PIT-37',
    additionalData: getTaxData(client)
  });
}
```

## What Gets Calculated Automatically

For PIT-37:
- ✅ Total Income = employment + civil contracts
- ✅ Tax Deduction = children × 1112.04 PLN
- ✅ Tax Base = income - deductions
- ✅ Tax Due = tax base × 17%
- ✅ Tax to Pay = tax due - tax paid

You just provide the raw data!

## Troubleshooting

### Template Not Found?
**Symptom:** Falls back to jsPDF
**Solution:** Add PDF template to correct directory or use without template

### Text Not Visible?
**Symptom:** PDF generates but fields are empty
**Solution:** Check mapping.json coordinates, adjust as needed

### Calculations Wrong?
**Symptom:** Numbers don't match
**Solution:** Verify input data, check TaxFormService calculation logic

## Next Steps

1. ✅ Try the simple example above
2. ✅ Add your actual PDF templates
3. ✅ Adjust coordinates if needed (see mapping.json)
4. ✅ Add more form types using the same pattern

## Full Documentation

For complete details, see:
- [TAX_FORM_SERVICE_GUIDE.md](TAX_FORM_SERVICE_GUIDE.md) - Complete guide
- [src/assets/pdf-templates/README.md](src/assets/pdf-templates/README.md) - Template usage
- [src/utils/taxFormService.example.ts](src/utils/taxFormService.example.ts) - Code examples

## Summary

```typescript
// That's all you need!
import { AuthorizationFormGenerator } from './utils/authorizationFormGenerator';

const generator = new AuthorizationFormGenerator();
await generator.downloadForm({
  client: clientData,
  employee: employeeData,
  formType: 'PIT-37',
  additionalData: taxData
});
```

The system handles:
- ✅ Template loading
- ✅ Field mapping
- ✅ Calculations
- ✅ PDF generation
- ✅ Downloads
- ✅ Fallbacks

**You focus on the data, we handle the rest!**
