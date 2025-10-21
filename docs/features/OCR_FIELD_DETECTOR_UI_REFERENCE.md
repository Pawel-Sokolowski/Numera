# OCR Field Detector - UI Components Reference

## Main Entry Point

### Navigation Menu

```
┌─────────────────────────────────┐
│ Sidebar Menu                    │
├─────────────────────────────────┤
│ ...                            │
│ ▼ Ustawienia (Settings)        │
│   • Mój Profil                 │
│   • Preferencje                │
│   • Detektor Pól PDF  ← NEW!  │
└─────────────────────────────────┘
```

## Landing Page (FormFieldDetectorExample)

### Page Header

```
╔══════════════════════════════════════════════════════════╗
║  Automated Form Field Detection                          ║
║  Use OCR and image processing to automatically detect    ║
║  form fields in PDF documents                            ║
╚══════════════════════════════════════════════════════════╝
```

### Feature Cards (3 columns)

#### Card 1: Detect Fields

```
┌────────────────────────────────┐
│ 🔍 Detect Fields              │
├────────────────────────────────┤
│ Automatically detect form      │
│ fields using OCR               │
│                                │
│ ┌────────────────────────────┐│
│ │ 📤 Open Field Detector     ││
│ └────────────────────────────┘│
└────────────────────────────────┘
```

#### Card 2: Features

```
┌────────────────────────────────┐
│ 👁️ Features                   │
├────────────────────────────────┤
│ What the detection system can  │
│ do:                            │
│ ✓ Enhanced rectangle detection│
│ ✓ OCR text recognition (Polish)│
│ ✓ Multi-strategy matching     │
│ ✓ Form structure analysis     │
│ ✓ Polish field recognition    │
│ ✓ Confidence scoring          │
│ ✓ Visual editor               │
│ ✓ Export to mapping.json      │
└────────────────────────────────┘
```

#### Card 3: Supported Forms

```
┌────────────────────────────────┐
│ 📥 Supported Forms            │
├────────────────────────────────┤
│ Works with all Polish tax      │
│ forms:                         │
│                                │
│ Pełnomocnictwa:               │
│ • UPL-1    • UPL-1P           │
│ • PEL      • ZAW-FA           │
│                                │
│ Deklaracje:                   │
│ • PIT-37   • PIT-R            │
│ • PIT-OP   • IFT-1            │
└────────────────────────────────┘
```

### How It Works Section

```
╔══════════════════════════════════════════════════════════╗
║  How It Works                                            ║
║  The automated field detection process in 5 steps        ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  ① Upload PDF                                           ║
║     Select the PDF form you want to analyze             ║
║                                                          ║
║  ② Automatic Detection                                  ║
║     System detects rectangles and uses OCR to identify  ║
║     labels                                               ║
║                                                          ║
║  ③ Review Results                                       ║
║     See all detected fields with confidence scores      ║
║                                                          ║
║  ④ Adjust as Needed                                     ║
║     Edit field names, coordinates, or delete incorrect  ║
║     detections                                           ║
║                                                          ║
║  ⑤ Export Mapping                                       ║
║     Download mapping.json and use it with your forms    ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```

## Detection Dialog (PdfFieldDetectorDialog)

### Dialog Header

```
╔══════════════════════════════════════════════════════════╗
║  Automated PDF Field Detection                      [X]  ║
╠══════════════════════════════════════════════════════════╣
║  Upload a PDF form to automatically detect form fields   ║
║  using OCR and image processing. Review and adjust the   ║
║  detected fields before downloading the mapping file.    ║
╚══════════════════════════════════════════════════════════╝
```

### Upload Section

```
┌─────────────────────────────────────────────────────────┐
│ PDF File                                                 │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Choose File  [No file chosen]                       │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ Form Type          Form Version                         │
│ ┌──────────────┐   ┌──────────────┐                    │
│ │ e.g., UPL-1  │   │ e.g., 2023   │                    │
│ └──────────────┘   └──────────────┘                    │
└─────────────────────────────────────────────────────────┘
```

### Detect Button

```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│        ┌─────────────────────────────────────┐         │
│        │ 👁️ Detect Fields                    │         │
│        └─────────────────────────────────────┘         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Detection Progress (during processing)

```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│        ┌─────────────────────────────────────┐         │
│        │ ⏳ Detecting fields...              │         │
│        └─────────────────────────────────────┘         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Results Header

```
┌─────────────────────────────────────────────────────────┐
│ Detected Fields (22)                                     │
│                                          ┌──────┐ ┌────┐│
│                                          │Reset │ │⬇️DL││
│                                          └──────┘ └────┘│
└─────────────────────────────────────────────────────────┘
```

### Field List (Scrollable)

```
╔═══════════════════════════════════════════════════════════╗
║ ┌───────────────────────────────────────────────────────┐ ║
║ │ principalName - Nazwa mocodawcy         [Text] ✏️ ✗  │ ║
║ │ Page 1 | x: 150, y: 720 | 300×20                     │ ║
║ │ Confidence: 92% [High]  Strategy: above              │ ║
║ └───────────────────────────────────────────────────────┘ ║
║                                                           ║
║ ┌───────────────────────────────────────────────────────┐ ║
║ │ principalNIP - NIP                      [Text] ✏️ ✗  │ ║
║ │ Page 1 | x: 150, y: 695 | 150×20                     │ ║
║ │ Confidence: 88% [High]  Strategy: above              │ ║
║ └───────────────────────────────────────────────────────┘ ║
║                                                           ║
║ ┌───────────────────────────────────────────────────────┐ ║
║ │ attorneyName - Imię i nazwisko pełno... [Text] ✏️ ✗ │ ║
║ │ Page 1 | x: 150, y: 560 | 300×20                     │ ║
║ │ Confidence: 95% [High]  Strategy: above              │ ║
║ └───────────────────────────────────────────────────────┘ ║
║                                                           ║
║ ┌───────────────────────────────────────────────────────┐ ║
║ │ field_1_450_380 -                       [Text] ✏️ ✗  │ ║
║ │ Page 1 | x: 450, y: 380 | 80×15                      │ ║
║ │ Confidence: 45% [Low]   Strategy: nearby             │ ║
║ │ ⚠️ Low confidence - manual review recommended         │ ║
║ └───────────────────────────────────────────────────────┘ ║
║                                                           ║
║ ▼ Scroll for more...                                     ║
╚═══════════════════════════════════════════════════════════╝
```

### Edit Mode (when editing a field)

```
┌───────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────┐  │
│ │ Field name: principalName                       │  │
│ └─────────────────────────────────────────────────┘  │
│ ┌─────────────────────────────────────────────────┐  │
│ │ Label: Nazwa mocodawcy                          │  │
│ └─────────────────────────────────────────────────┘  │
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       │
│ │X: 150  │ │Y: 720  │ │W: 300  │ │H: 20   │   ✓  │
│ └────────┘ └────────┘ └────────┘ └────────┘       │
└───────────────────────────────────────────────────────┘
```

### Summary Statistics

```
┌─────────────────────────────────────────────────────────┐
│ Pages: 1                  Fields: 22                    │
│ Page Size: 595 × 842      Rectangles: 25               │
│                                                          │
│ Detection Quality                                        │
│ ┌──────────┬──────────┬──────────┐                     │
│ │    18    │    3     │    1     │                     │
│ │  High    │  Medium  │   Low    │                     │
│ │  (≥80%)  │ (60-79%) │  (<60%)  │                     │
│ └──────────┴──────────┴──────────┘                     │
│ Average: 87.2%                                          │
└─────────────────────────────────────────────────────────┘
```

### Dialog Footer

```
┌─────────────────────────────────────────────────────────┐
│                                          ┌────────────┐  │
│                                          │   Close    │  │
│                                          └────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Field Type Badges

### Text Field Badge

```
┌──────┐
│ Text │ (Blue background)
└──────┘
```

### Checkbox Badge

```
┌──────────┐
│ Checkbox │ (Green background)
└──────────┘
```

### Signature Badge

```
┌───────────┐
│ Signature │ (Purple background)
└───────────┘
```

## Confidence Badges

### High Confidence (≥80%)

```
┌──────────────────┐
│ Confidence: 92%  │ (Green background)
└──────────────────┘
```

### Medium Confidence (60-79%)

```
┌──────────────────┐
│ Confidence: 67%  │ (Yellow background)
└──────────────────┘
```

### Low Confidence (<60%)

```
┌──────────────────┐
│ Confidence: 45%  │ (Red background)
└──────────────────┘
```

## Match Strategy Badges

```
┌────────┐  ┌──────┐  ┌────────┐  ┌─────────────┐  ┌────────┐
│ above  │  │ left │  │ inside │  │ tableHeader │  │ nearby │
└────────┘  └──────┘  └────────┘  └─────────────┘  └────────┘
(All with blue/gray background)
```

## Warning Messages

```
┌─────────────────────────────────────────────────────────┐
│ ⚠️ Low confidence detection - manual review recommended  │
│ ⚠️ No label found - field name auto-generated           │
│ ⚠️ May be decorative element rather than input field    │
└─────────────────────────────────────────────────────────┘
```

## Color Scheme

### UI Colors

- **Primary**: Blue (#3B82F6)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Error**: Red (#EF4444)
- **Muted**: Gray (#6B7280)

### Confidence Colors

- **High (≥80%)**: `bg-green-100 text-green-700`
- **Medium (60-79%)**: `bg-yellow-100 text-yellow-700`
- **Low (<60%)**: `bg-red-100 text-red-700`

### Field Type Colors

- **Text**: `bg-blue-100 text-blue-700`
- **Checkbox**: `bg-green-100 text-green-700`
- **Signature**: `bg-purple-100 text-purple-700`

## Responsive Behavior

### Desktop (>1024px)

- Dialog width: 75vw
- 3-column card layout
- Full field editor

### Tablet (768px - 1024px)

- Dialog width: 90vw
- 2-column card layout
- Simplified field editor

### Mobile (<768px)

- Dialog width: 95vw
- Single column layout
- Touch-friendly buttons
- Stacked statistics

## Icons Used

- 🔍 **FileSearch**: Menu icon
- 📤 **Upload**: Upload button
- 👁️ **Eye**: Detect button
- ⏳ **Loader2**: Loading spinner
- ✏️ **Edit2**: Edit button
- ✓ **Check**: Save button
- ✗ **X**: Delete/Close button
- ⬇️ **Download**: Export button

## Accessibility

- **Keyboard Navigation**: Tab through all interactive elements
- **Screen Reader**: All buttons and inputs properly labeled
- **ARIA Labels**: Descriptive labels for all controls
- **Color Contrast**: WCAG AA compliant
- **Focus Indicators**: Visible focus states

## Loading States

### Initial State

```
[PDF File] [Choose File]
[Form Type: ____] [Version: ____]
[Detect Fields] (Disabled)
```

### File Selected

```
[PDF File] [upl1.pdf]
[Form Type: UPL-1] [Version: 2023]
[Detect Fields] (Enabled)
```

### Processing

```
[⏳ Detecting fields...]
OCR Progress: 45%
```

### Results Shown

```
[Detected Fields (22)]
[Field List with Edit/Delete]
[Download Mapping]
```

## Error States

### No File Selected

```
┌─────────────────────────────────────┐
│ ⚠️ Please select a PDF file          │
└─────────────────────────────────────┘
```

### Invalid Form Type

```
┌─────────────────────────────────────────────────────┐
│ ⚠️ Please enter a form type (e.g., UPL-1, PEL)      │
└─────────────────────────────────────────────────────┘
```

### Detection Failed

```
┌─────────────────────────────────────────────────────┐
│ ❌ Failed to detect fields: [error message]         │
└─────────────────────────────────────────────────────┘
```

---

**Note**: These are text representations of the actual React components. The real UI uses Radix UI components with Tailwind CSS styling for a polished, professional appearance.

For the actual rendered UI, start the application and navigate to:
**Ustawienia → Detektor Pól PDF**

---

**Last Updated**: 2025-01-20  
**Component Files**:

- Dialog: `src/components/PdfFieldDetectorDialog.tsx`
- Demo: `src/components/FormFieldDetectorExample.tsx`
