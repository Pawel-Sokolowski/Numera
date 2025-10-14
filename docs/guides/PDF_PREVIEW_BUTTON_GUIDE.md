# PDF Preview Button ("Podgląd PDF") - User Guide

## Overview

The **"Podgląd PDF"** (PDF Preview) button was successfully added to the Authorization Form Dialog in PR #15. This guide explains how to find and use this button.

## Button Location

The button is located in the **Authorization Form Dialog** (`Generuj formularze podatkowe i dokumenty`), at the bottom of the dialog in the action buttons area:

```
Dialog Footer:
┌─────────────────────────────────────────────────────────────┐
│  [Anuluj]  [👁️ Podgląd PDF]  [📄 Otwórz formularz]         │
└─────────────────────────────────────────────────────────────┘
```

## How to Access the Button

### Step 1: Open the Documents Section
1. Navigate to **Dokumenty** (Documents) from the sidebar menu
2. Click on **"Generuj pełnomocnictwo"** (Generate Authorization) button

### Step 2: Configure the Form
1. Select a form type from the **"Typ formularza"** dropdown (default: UPL-1)
2. Choose a **"Klient"** (Client) from the dropdown
3. Choose a **"Pełnomocnik (Pracownik)"** (Employee) from the dropdown

### Step 3: Use the PDF Preview Button
Once both client and employee are selected, the **"Podgląd PDF"** button becomes enabled and you can click it.

## Button States

### 🔒 Disabled State (Initial)
- **Appearance**: Grayed out text, reduced opacity
- **Condition**: When either Client or Employee field is empty
- **Behavior**: Not clickable, shows tooltip on hover explaining requirements
- **Tooltip Message**: "Wybierz klienta i pracownika aby wygenerować podgląd"

![Disabled Button Example](https://github.com/user-attachments/assets/ccfd8072-f2af-4b99-b40f-d9cd1258a73f)

### ✅ Enabled State (After Selections)
- **Appearance**: Full black text, eye icon (👁️), clickable
- **Condition**: When both Client AND Employee are selected
- **Behavior**: Clickable, generates PDF preview on click

![Enabled Button Example](https://github.com/user-attachments/assets/3b3fefc7-2244-4581-abef-d7f820289b91)

## What the Button Does

When you click the **"Podgląd PDF"** button:

1. **Generates a PDF preview** using the selected client and employee data
2. **Pre-fills the form** with basic information:
   - Client name, address, NIP, PESEL
   - Employee name and PESEL
   - Form-specific fields (e.g., scope, start date)
3. **Opens a preview popup** showing the generated PDF
4. **Allows you to view** the PDF before making any additional edits
5. Shows a success message: "PDF został wygenerowany - możesz teraz wypełnić puste pola"

## Difference from "Otwórz formularz" Button

There are TWO buttons in the dialog:

| Button | Purpose | What It Does |
|--------|---------|-------------|
| **Podgląd PDF** (Preview PDF) | Quick preview of the pre-filled PDF | Generates PDF immediately with current data, opens in read-only viewer |
| **Otwórz formularz** (Open Form) | Interactive form editor | Opens an editable form where you can modify all fields before generating PDF |

## Troubleshooting

### "I can't see the button!"
- ✅ **Solution**: The button is there, but it's disabled. Select both a Client and Employee first.
- The disabled state makes it blend with the background - this is normal button behavior.

### "The button is grayed out and won't click!"
- ✅ **Solution**: Make sure you've selected:
  1. A client from the "Klient" dropdown
  2. An employee from the "Pełnomocnik (Pracownik)" dropdown
- Both selections are required for the button to become enabled.

### "Nothing happens when I click it!"
- ✅ **Check**: Are you clicking the enabled version (black text with eye icon)?
- ✅ **Check**: Look for a PDF preview popup that should appear
- ✅ **Check**: Check browser console for any error messages

## Technical Details

### Component Location
- **File**: `src/components/gui/AuthorizationFormDialog.tsx`
- **Lines**: 326-333 (button definition)
- **Handler**: `handleDirectPdfPreview()` function (lines 81-126)

### Button Implementation
```tsx
<Button 
  variant="secondary" 
  onClick={handleDirectPdfPreview} 
  disabled={isGenerating || !selectedClientId || !selectedEmployeeId}
>
  <Eye className="mr-2 h-4 w-4" />
  {isGenerating ? 'Generowanie...' : 'Podgląd PDF'}
</Button>
```

### Tooltip Wrapper
The button is wrapped in a Tooltip component that shows helpful messages when disabled:
```tsx
<Tooltip>
  <TooltipTrigger asChild>
    <span>
      <Button ... />
    </span>
  </TooltipTrigger>
  <TooltipContent>
    <p>Wybierz klienta i pracownika aby wygenerować podgląd</p>
  </TooltipContent>
</Tooltip>
```

## Related Documentation

- [Tax Form Service Guide](../features/TAX_FORM_SERVICE_GUIDE.md)
- [PDF Generation Guide](PDF_GENERATION_GUIDE.md)
- [Authorization Form Architecture](../features/TAX_FORM_ARCHITECTURE.md)

## Feedback

If you're still having trouble finding or using the button, please:
1. Take a screenshot of your dialog
2. Describe what you see
3. Note whether you've selected a client and employee
4. Open an issue on GitHub with these details

The button was successfully added and is working as intended!
