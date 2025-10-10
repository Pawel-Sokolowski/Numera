# Scripts Directory

This directory contains utility scripts for development and testing.

## Available Scripts

### test-upl1-coordinates.js

Tests the UPL-1 PDF form filling coordinates by generating a test PDF with sample data.

**Usage:**
```bash
node scripts/test-upl1-coordinates.js
```

**Output:**
- Generates `build/upl-1-test-filled.pdf` with test data in blue
- Displays coordinate positions in console
- Useful for verifying and adjusting field positions

**Purpose:**
- Verify coordinate accuracy before deployment
- Test changes to field positions
- Visual comparison with official blank form

### test-field-detection.js

Tests the automated PDF field detection system by analyzing existing form templates.

**Usage:**
```bash
node scripts/test-field-detection.js
```

**Output:**
- Lists all available PDF templates
- Shows existing mapping information
- Demonstrates detection capabilities
- Displays sample detection results

**Purpose:**
- Verify field detection system setup
- Review available form templates
- Understand detection capabilities
- Test mapping generation

### setup-database.js

Sets up the database schema and initial configuration.

**Usage:**
```bash
npm run setup-db
```

## UPL-1 Form Testing Workflow

1. **Make coordinate adjustments** in `src/utils/upl1PdfFiller.ts`
2. **Run test script**: `node scripts/test-upl1-coordinates.js`
3. **Review output** in `build/upl-1-test-filled.pdf`
4. **Compare** with blank UPL-1 form
5. **Iterate** until coordinates are accurate

## Field Detection Workflow

1. **Prepare PDF template** - Ensure form has clear borders and labels
2. **Run detection**:
   - Use UI: Open PdfFieldDetectorDialog component
   - Or programmatic: Use PdfFieldDetector class
3. **Review results** - Check detected fields and confidence scores
4. **Adjust as needed** - Edit field names, coordinates, types
5. **Export mapping** - Download mapping.json file
6. **Place in templates** - Save to `public/pdf-templates/[FORM-TYPE]/mapping.json`
7. **Test form filling** - Use TaxFormService to fill the form

## Adding New Scripts

When adding new scripts:

1. Add documentation here
2. Include usage instructions
3. Add error handling
4. Use clear console output
5. Save outputs to `build/` or `/tmp/` directories
