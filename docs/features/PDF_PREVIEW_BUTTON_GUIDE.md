# PDF Preview Button - User Guide

## Overview

The **"Podgląd PDF"** (PDF Preview) button allows you to preview generated PDF forms before downloading them. This feature is available in multiple locations throughout the application.

## Where to Find the PDF Preview Button

### Location 1: Direct PDF Preview from Form Generator

**Path:** `Dokumenty` → `Generuj pełnomocnictwo` → Select Client & Employee → `Podgląd PDF`

**Steps:**
1. Navigate to the **Dokumenty** (Documents) section from the sidebar
2. Click the **"Generuj pełnomocnictwo"** button
3. Select a **Klient** (Client) from the dropdown
4. Select a **Pełnomocnik (Pracownik)** (Employee) from the dropdown
5. The **"Podgląd PDF"** button will become enabled
6. Click the button to generate and preview the PDF

**Features:**
- ✅ Immediate PDF generation with current data
- ✅ Interactive PDF viewer in popup
- ✅ Ability to fill empty fields directly in PDF
- ✅ Download option from preview

### Location 2: PDF Preview from Form Editor

**Path:** `Dokumenty` → `Generuj pełnomocnictwo` → Select Client & Employee → `Otwórz formularz` → Edit Fields → `Podgląd PDF`

**Steps:**
1. Navigate to the **Dokumenty** (Documents) section from the sidebar
2. Click the **"Generuj pełnomocnictwo"** button
3. Select a **Klient** (Client) from the dropdown
4. Select a **Pełnomocnik (Pracownik)** (Employee) from the dropdown
5. Click **"Otwórz formularz"** to open the form editor
6. Review and edit form fields as needed
7. Click the **"Podgląd PDF"** button in the form editor
8. Preview the PDF with your edited data

**Features:**
- ✅ Edit all form fields before generating PDF
- ✅ Preview with your custom data
- ✅ Separate "Generate and Download" option
- ✅ Two-step workflow for careful review

## Understanding Button States

### Disabled State (Gray)
When the "Podgląd PDF" button appears gray/disabled:
- **Reason:** Required selections are missing
- **Required:** Both a client AND an employee must be selected
- **Tooltip:** Hover over the button to see the helpful message: *"Wybierz klienta i pracownika aby wygenerować podgląd"*

### Enabled State (Blue)
When the "Podgląd PDF" button appears blue/active:
- ✅ All requirements met
- ✅ Ready to generate PDF
- ✅ Click to preview

### Loading State
When the button shows "Generowanie..." (Generating):
- ⏳ PDF is being generated
- ⏳ Button is temporarily disabled
- ⏳ Wait for completion

## Supported Form Types

The PDF preview button works with all supported form types:

### Pełnomocnictwa (Authorizations)
- UPL-1 - Tax Office Authorization
- PEL - ZUS Authorization
- ZAW-FA - Employee Authorization

### PIT (Personal Income Tax)
- PIT-36 - Annual Tax Return
- PIT-37 - Annual Tax Return (Simplified)
- PIT-R - Annual Tax Return (Family)

### VAT (Value Added Tax)
- VAT-7 - VAT Declaration
- VAT-7K - VAT Declaration (Corrected)

### CIT (Corporate Income Tax)
- CIT-8 - Corporate Tax Return

### ZUS (Social Insurance)
- ZUS-DRA - Social Insurance Registration
- ZUS-RCA - Social Insurance Contribution

### JPK (Standard Audit File)
- JPK-V7M - Monthly JPK VAT
- JPK-V7K - Quarterly JPK VAT

## Features of the PDF Preview

### Interactive Viewer
- 📄 View PDF in browser without downloading
- 🔍 Zoom in/out for better readability
- 📃 Navigate through multi-page documents
- 💾 Download option always available

### Fill Empty Fields
- ✏️ Click on empty fields to fill them directly
- 💾 Save filled PDF with new data
- ✅ No need to regenerate from scratch

### Error Handling
If PDF generation fails:
- 🔴 Error toast notification appears
- 📝 Detailed error message provided
- 🔄 Can retry immediately

## Tips for Best Experience

1. **Always select both client and employee** before trying to preview
2. **Check required fields** shown in the form info panel
3. **Use the form editor** if you need to customize data before preview
4. **Save frequently** when filling forms directly in PDF
5. **Check the preview** before downloading to ensure all data is correct

## Troubleshooting

### Button is Disabled
**Problem:** "Podgląd PDF" button is gray and cannot be clicked

**Solutions:**
- Verify a client is selected from the dropdown
- Verify an employee is selected from the dropdown
- Hover over button to see the tooltip explaining what's needed

### PDF Generation Fails
**Problem:** Error message appears after clicking button

**Common causes:**
- Missing required form template
- Invalid client/employee data
- Network connection issues (if using backend)

**Solutions:**
- Check that all required fields have data
- Verify the form template exists (check console for details)
- Try a different form type
- Check browser console for detailed error messages

### Preview Window Doesn't Open
**Problem:** PDF preview popup doesn't appear

**Solutions:**
- Check if popup blocker is enabled in browser
- Allow popups for this site
- Try clicking the button again
- Check browser console for errors

## Related Documentation

- [PDF Generation Guide](../guides/PDF_GENERATION_GUIDE.md) - Technical details about PDF generation
- [Tax Form Service Guide](TAX_FORM_SERVICE_GUIDE.md) - Using the tax form service
- [Authorization Form Generator](../../src/utils/authorizationFormGenerator.ts) - API documentation

## Technical Details

### Files Involved
- `src/components/gui/AuthorizationFormDialog.tsx` - Main form generator dialog
- `src/components/gui/FillableFormPreview.tsx` - Form editor with preview
- `src/components/gui/PdfPreviewPopup.tsx` - PDF preview popup component
- `src/utils/authorizationFormGenerator.ts` - PDF generation service

### Button Implementation
```typescript
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
```

## Support

If you continue to experience issues:
1. Check the browser console (F12) for error messages
2. Verify all dependencies are installed: `npm ci`
3. Rebuild the application: `npm run build`
4. Clear browser cache and reload
5. Report issue with error messages and screenshots

---

**Last Updated:** October 2025  
**Version:** 1.0.0  
**Status:** ✅ Fully Implemented
