# PDF Files Migration Summary

## Overview
This document summarizes the migration of PDF files from the `PDFFile` folder to the new `src/assets/pdf-templates/` structure.

## Files Migrated

### ✅ UPL-1 (Power of Attorney - Tax Office)
- **Source:** `PDFFile/upl-1_06-08-2.pdf`
- **Destination:** `src/assets/pdf-templates/UPL-1/2023/UPL-1_2023.pdf`
- **Size:** 322 KB
- **Status:** Ready to use with TaxFormService

### ✅ PEL (Power of Attorney - ZUS)
- **Source:** `PDFFile/Formularz PEL. Pełnomocnictwo.pdf`
- **Destination:** `src/assets/pdf-templates/PEL/2023/PEL_2023.pdf`
- **Size:** 176 KB
- **Status:** Ready to use with TaxFormService

### ✅ ZAW-FA (Employee Tax Card)
- **Source:** `PDFFile/zaw-fa-01-18.pdf`
- **Destination:** `src/assets/pdf-templates/ZAW-FA/2023/ZAW-FA_2023.pdf`
- **Size:** 324 KB
- **Status:** Ready to use with TaxFormService

### ✅ PIT-R (Tax Return for Business Income)
Multiple years migrated:

#### PIT-R 2022
- **Source:** `PDFFile/PIT-R_(21)02 2022.pdf`
- **Destination:** `src/assets/pdf-templates/PIT-R/2022/PIT-R_2022.pdf`
- **Size:** 357 KB

#### PIT-R 2023
- **Source:** `PDFFile/PIT-R_(21)02 2023.pdf`
- **Destination:** `src/assets/pdf-templates/PIT-R/2023/PIT-R_2023.pdf`
- **Size:** 357 KB

#### PIT-R 2024
- **Source:** `PDFFile/PIT-R_(22)13 2024.pdf`
- **Destination:** `src/assets/pdf-templates/PIT-R/2024/PIT-R_2024.pdf`
- **Size:** 167 KB

**Status:** All ready to use with TaxFormService

## Structure Created

```
src/assets/pdf-templates/
├── UPL-1/
│   ├── 2023/
│   │   ├── UPL-1_2023.pdf (✅)
│   │   └── README.md
│   └── mapping.json
├── PEL/
│   ├── 2023/
│   │   ├── PEL_2023.pdf (✅)
│   │   └── README.md
│   └── mapping.json
├── ZAW-FA/
│   ├── 2023/
│   │   ├── ZAW-FA_2023.pdf (✅)
│   │   └── README.md
│   └── mapping.json
├── PIT-R/
│   ├── 2022/
│   │   ├── PIT-R_2022.pdf (✅)
│   │   └── README.md
│   ├── 2023/
│   │   ├── PIT-R_2023.pdf (✅)
│   │   └── README.md
│   ├── 2024/
│   │   ├── PIT-R_2024.pdf (✅)
│   │   └── README.md
│   └── mapping.json
└── PIT-37/
    ├── 2022/
    │   └── README.md
    ├── 2023/
    │   ├── README.md
    │   └── PLACEHOLDER_NOTE.md
    └── mapping.json
```

## Mapping Files Created

Each form type now has a `mapping.json` file with:
- Field coordinates (x, y positions)
- Page numbers
- Calculation formulas (where applicable)

### Forms with Calculations
- **PIT-37**: Child deductions, tax calculations
- **PIT-R**: Business income/costs, tax calculations

### Forms without Calculations
- **UPL-1**: Simple field mapping
- **PEL**: Simple field mapping
- **ZAW-FA**: Simple field mapping

## Implementation Updates

### TaxFormService (src/utils/taxFormService.ts)
- ✅ Added support for PIT-R calculations
- ✅ Added support for PEL, ZAW-FA (no calculations)
- ✅ Extended processFormSpecificCalculations()

### AuthorizationFormGenerator (src/utils/authorizationFormGenerator.ts)
- ✅ Replaced specific PIT-37 handler with generic generateFormFromTemplate()
- ✅ Added support for PIT-R, PEL, ZAW-FA
- ✅ Maintained backward compatibility

## Files NOT Migrated

The following files remain in PDFFile folder as they are not yet implemented in the template system:

### PIT Forms
- PIT-2 (various years) - Annual tax statement
- PIT-OP (2018-2024) - Tax advance payment

### PEL Variants
- PEL-K, PEL-O, PEL-Z (different variants)

### Other Forms
- IFT-1/IFT-1R (Information about tax)
- OPD-1, OPL-1, OPO-1, OPS-1 (various declarations)
- PPD-1, PPO-1, PPS-1 (various statements)
- UPL-1P (simplified power of attorney)

These can be added to the template system in the future following the same pattern.

## Note on PIT-37

**Important:** The PDFFile folder does NOT contain PIT-37 forms. 

A placeholder note has been created at `src/assets/pdf-templates/PIT-37/2023/PLACEHOLDER_NOTE.md` explaining:
- PIT-37 PDFs need to be obtained from the Polish Ministry of Finance
- PIT-R can be used as an alternative for testing
- The mapping.json is ready for PIT-37 when the PDF becomes available

## Testing

All migrated forms can be tested using:

```typescript
import { TaxFormService } from './utils/taxFormService';

const service = new TaxFormService();

// UPL-1
await service.fillFormAsBlob('UPL-1', '2023', formData);

// PEL
await service.fillFormAsBlob('PEL', '2023', formData);

// ZAW-FA
await service.fillFormAsBlob('ZAW-FA', '2023', formData);

// PIT-R
await service.fillFormAsBlob('PIT-R', '2023', formData);
```

Or through AuthorizationFormGenerator:

```typescript
import { AuthorizationFormGenerator } from './utils/authorizationFormGenerator';

const generator = new AuthorizationFormGenerator();
await generator.downloadForm({
  client: clientData,
  employee: employeeData,
  formType: 'PIT-R', // or 'UPL-1', 'PEL', 'ZAW-FA'
  additionalData: { year: '2023', /* ... */ }
});
```

## Build Status

✅ **Build successful** - All changes compile without errors.

## Total Files Added

- **4 form types** with templates
- **7 PDF files** (1 MB+ total)
- **4 mapping.json** configuration files
- **8 README.md** documentation files
- **1 PLACEHOLDER_NOTE.md** for PIT-37

## Next Steps

1. ✅ Templates are integrated and ready to use
2. ✅ Mapping files are configured
3. ✅ Service implementations updated
4. ⏳ Coordinate adjustments may be needed after testing with real data
5. ⏳ Obtain official PIT-37 PDFs for complete implementation
6. ⏳ Add more forms from PDFFile folder as needed
