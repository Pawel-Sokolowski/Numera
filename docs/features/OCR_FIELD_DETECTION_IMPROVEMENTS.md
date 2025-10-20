# OCR Field Detection Improvements

## Overview

This document describes comprehensive improvements to the OCR-based field detection system to address issues with incorrect field placement and poor label matching in Polish form layouts.

## Problem Statement

The previous implementation had several issues:

1. **Poor label-to-field matching**: Simple distance-based matching (100px threshold) didn't work well with complex Polish form layouts
2. **Incorrect rectangle detection**: Detected decorative lines as field boundaries instead of actual input boxes
3. **Inadequate spatial analysis**: Only checked "above or to the left" which didn't handle:
   - Labels inside boxes
   - Multiple fields close together
   - Nested boxes and complex layouts
   - Polish form conventions where labels can be positioned in various ways

## Solution Implemented

### 1. Enhanced Rectangle Detection

**New Features:**

- **Edge Density Calculation**: Distinguish actual input fields from decorative boxes by analyzing edge patterns inside rectangles
- **Field Candidate Scoring**: Evaluate rectangles based on:
  - Size and area (filter out very small/large decorative elements)
  - Aspect ratio (reasonable width-to-height ratios)
  - Edge density (clean interiors indicate input fields)
  - Thickness (filter out thin decorative lines)

**Implementation Details:**

```typescript
// Calculate edge density within rectangle interior
private calculateEdgeDensity(
  edges: Uint8ClampedArray,
  width: number,
  x: number,
  y: number,
  rectWidth: number,
  rectHeight: number
): number

// Determine if rectangle is likely an input field
private isLikelyInputField(
  width: number,
  height: number,
  aspectRatio: number,
  edgeDensity: number
): boolean
```

**Filtering Rules:**

- Very thin rectangles (height < 10px or width < 30px) are excluded as decorative lines
- Rectangles with high interior edge density (> 30%) are excluded as decorative patterns
- Valid fields must have reasonable dimensions (area 600-10000 sq px) and aspect ratios (0.8-40)

### 2. Multi-Strategy Label Matching

**Implemented Strategies:**

1. **Above Strategy**: Label positioned above field (most common in Polish forms)
   - Bonus: 30% + alignment + proximity
   - Checks horizontal alignment and vertical distance

2. **Left Strategy**: Label to the left of field
   - Bonus: 20% + alignment + proximity
   - Checks vertical alignment and horizontal distance

3. **Inside Strategy**: Label inside field box (e.g., checkboxes with labels)
   - Bonus: 25% + text confidence
   - Checks if text is within field boundaries

4. **Table Header Strategy**: Label in table header position
   - Bonus: 25% + column alignment
   - Checks if text is above field within horizontal bounds

5. **Nearby Strategy**: General proximity matching
   - Bonus: 15% + proximity + text confidence
   - Fallback for unusual layouts

**Scoring System:**

```typescript
// Multi-factor scoring with weighted components
let score = proximityScore * 0.4 + text.confidence * 0.3;
if (isAbove) score += 0.3;
else if (isLeft) score += 0.2;
else if (isNearTopLeft) score += 0.15;
score += horizontalAlignment * 0.05 + verticalAlignment * 0.05;
```

### 3. Form Structure Analysis

**New Capabilities:**

- **Table Detection**: Identify rows and columns of aligned fields
- **Section Detection**: Group related fields with section titles
- **Grid Pattern Detection**: Recognize regular grid layouts
- **Structure-Based Bonuses**: Apply confidence bonuses based on context

**Table Detection:**

```typescript
interface TableStructure {
  x;
  y;
  width;
  height: number;
  rows: number;
  columns: number;
  cells: DetectedRectangle[];
}
```

- Groups fields by vertical position (rows)
- Checks column alignment across rows
- Detects tables with 2+ rows and similar column structure

**Section Detection:**

```typescript
interface SectionStructure {
  x;
  y;
  width;
  height: number;
  title?: string;
  fields: DetectedRectangle[];
}
```

- Identifies gaps between field groups (40px threshold)
- Finds section titles (text above section boundaries)
- Groups related fields together

**Structure Bonuses:**

- Table headers: +10% confidence
- Titled sections: +5% confidence
- Grid layouts: +5% confidence

### 4. Enhanced Field Type Detection

**Polish-Specific Patterns:**

- **PESEL**: Recognized by keyword "pesel"
- **NIP**: Recognized by keyword "nip"
- **REGON**: Recognized by keyword "regon"
- **Województwo**: Keywords "województwo", "wojewodztwo", "woj."
- **Miasto**: Keywords "miasto", "miejscowość"
- **Ulica**: Keywords "ulica", "ul."
- **Kod Pocztowy**: Keywords "kod pocztowy", "kod"
- **Telefon**: Keywords "telefon", "tel."
- **Email**: Keywords "e-mail", "email"
- **Data**: Keywords "data", "dzień", "miesiąc", "rok"

**Checkbox Detection:**

- Polish keywords: "tak", "nie", "zaznacz", "wybierz"
- Size constraints: < 40x40 pixels
- Aspect ratio: 0.7-1.4 (square-ish)

**Signature Detection:**

- Polish keywords: "podpis", "pieczęć", "pieczec", "data i podpis"
- Large area: > 4000 sq px
- Rectangular shape: aspect ratio > 2

### 5. Confidence Scoring and Validation

**Enhanced Confidence Calculation:**

- Base score from proximity and text confidence
- Strategy-specific bonuses (above > left > inside > nearby)
- Structure bonuses (tables, sections, grids)
- Field candidate bonus (+10% for validated fields)

**Warning Generation:**

Warnings are generated for:

- Low confidence (< 60%): "Low confidence detection - manual review recommended"
- Non-field candidates: "May be decorative element rather than input field"
- No label found: "No label found - field name auto-generated"

**Quality Metrics:**

```typescript
interface DetectedField {
  confidence: number; // 0-1 score
  matchStrategy?: 'above' | 'left' | 'inside' | 'nearby' | 'none';
  warnings?: string[];
}
```

### 6. UI Improvements

**Visual Indicators:**

- **Color-coded confidence badges**:
  - Green (≥80%): High confidence
  - Yellow (60-79%): Medium confidence
  - Red (<60%): Low confidence

- **Match strategy display**: Shows which strategy was used (above, left, inside, etc.)

- **Warning display**: Shows warnings in orange with ⚠️ icon

**Detection Quality Summary:**

- Field count by confidence level (high/medium/low)
- Average confidence percentage
- Visual breakdown with color-coded metrics

## Technical Implementation

### Modified Files

1. **src/utils/pdfFieldDetector.ts**
   - Added `FormStructure`, `TableStructure`, `SectionStructure` interfaces
   - Enhanced `DetectedField` with `matchStrategy` and `warnings`
   - Enhanced `DetectedRectangle` with `isFieldCandidate`, `area`, `aspectRatio`, `edgeDensity`
   - Added form structure analysis methods
   - Improved rectangle detection with field candidate scoring
   - Implemented multi-strategy label matching
   - Enhanced field type detection with Polish patterns

2. **src/components/PdfFieldDetectorDialog.tsx**
   - Added confidence badge display with color coding
   - Added match strategy display
   - Added warning display
   - Added detection quality summary section

## Results and Benefits

### Improved Accuracy

- **Rectangle Detection**: Better filtering of decorative elements vs actual fields
- **Label Matching**: Multi-strategy approach handles various Polish form layouts
- **Field Classification**: Recognition of Polish-specific field types

### Better User Experience

- **Visual Feedback**: Clear confidence indicators help users identify quality issues
- **Warnings**: Explicit warnings guide manual review
- **Quality Metrics**: Overall detection quality is quantified and displayed

### Maintainability

- **Modular Design**: Separate methods for different matching strategies
- **Configurable**: Easy to adjust thresholds and weights
- **Well-Documented**: Clear comments and interface definitions

## Usage Example

```typescript
import { PdfFieldDetector } from './utils/pdfFieldDetector';

const detector = new PdfFieldDetector();
const result = await detector.detectFields(pdfArrayBuffer);

// Access structure analysis
console.log('Tables found:', result.structure?.tables.length);
console.log('Sections found:', result.structure?.sections.length);

// Review fields with warnings
const fieldsNeedingReview = result.fields.filter((f) => f.warnings && f.warnings.length > 0);

// Get high-confidence fields
const highConfidenceFields = result.fields.filter((f) => f.confidence >= 0.8);
```

## Configuration Parameters

### Rectangle Detection

```typescript
const minWidth = 40; // Minimum field width
const minHeight = 12; // Minimum field height
const maxWidth = width * 0.85;
const maxHeight = 120;
const scanStep = 5; // Scanning granularity
```

### Edge Density

```typescript
const edgeDensityThreshold = 0.3; // Max interior edge density
```

### Label Matching

```typescript
const maxDistance = 150; // Max label-field distance
const aboveBonus = 0.3; // 30% for above
const leftBonus = 0.2; // 20% for left
const insideBonus = 0.25; // 25% for inside
const tableHeaderBonus = 0.25; // 25% for table headers
const nearbyBonus = 0.15; // 15% for nearby
```

### Structure Analysis

```typescript
const sectionGap = 40; // Gap between sections
const alignmentThreshold = 10; // Alignment tolerance
```

## Testing Recommendations

1. **Test with Polish forms**: UPL-1, PEL, ZAW-FA, PIT-37
2. **Verify field detection**: Check that actual input fields are detected
3. **Verify label matching**: Ensure labels are correctly matched to fields
4. **Review warnings**: Check that warnings are appropriate
5. **Validate confidence scores**: Ensure scores reflect actual quality

## Future Improvements

Potential enhancements for future versions:

1. **Machine Learning**: Train models on labeled Polish forms
2. **OCR Model Upgrade**: Use more accurate OCR engines
3. **Template Matching**: Compare against known form templates
4. **Interactive Refinement**: Allow users to correct and retrain
5. **Multi-page Coordination**: Better handling of fields across pages
6. **Field Validation**: Semantic validation based on field types

## Related Documentation

- [Automated Field Detection](./AUTOMATED_FIELD_DETECTION.md)
- [OCR Field Detection Upgrade](./OCR_FIELD_DETECTION_UPGRADE.md)
- [Field Detection Usage Guide](./FIELD_DETECTION_USAGE_GUIDE.md)

## Conclusion

These improvements significantly enhance the OCR field detection system's ability to accurately identify and match form fields in Polish government forms. The multi-strategy approach, combined with form structure analysis and enhanced field type detection, provides a robust solution for automated form field mapping.

Key achievements:

- ✅ Better distinction between input fields and decorative elements
- ✅ Multi-strategy label matching handles complex layouts
- ✅ Form structure analysis provides additional context
- ✅ Polish-specific field recognition
- ✅ Clear visual feedback and quality metrics
- ✅ Comprehensive warning system for manual review

The system is now better equipped to handle the variety and complexity of Polish government forms while providing users with the information needed to validate and refine the automated detection results.
