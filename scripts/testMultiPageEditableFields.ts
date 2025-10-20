/* eslint-disable no-console */
/**
 * Test script for multi-page PDF form filling and editable fields
 * Tests both coordinate-based and Acroform-based filling methods
 */

import { TaxFormService } from '../src/utils/taxFormService';
import { UniversalPdfFiller } from '../src/utils/universalPdfFiller';
import * as fs from 'fs';
import * as path from 'path';

async function testMultiPageFilling() {
  console.log('========================================');
  console.log('Testing Multi-Page PDF Form Filling');
  console.log('========================================\n');

  const taxFormService = new TaxFormService();

  // Test data for PIT-37 (3-page form)
  const pit37Data = {
    // Page 1 fields
    taxpayerName: 'Jan Kowalski',
    taxpayerId: '12345678901',
    taxpayerNIP: '1234567890',
    taxpayerAddress: 'ul. Przykładowa 1',
    taxpayerCity: 'Warszawa',
    taxpayerPostalCode: '00-001',
    taxOffice: 'US Warszawa Śródmieście',

    // Page 2 fields
    employmentIncome: 60000,
    civilContractIncome: 15000,

    // Page 3 fields
    numberOfChildren: 2,
    childDeduction: 1112.04,
    taxPaid: 8500,
  };

  try {
    console.log('Test 1: PIT-37 with flattened fields (default behavior)');
    console.log('-------------------------------------------------------');
    const pdfBytes1 = await taxFormService.fillForm('PIT-37', '2023', pit37Data);
    console.log(`✓ PDF generated: ${pdfBytes1.length} bytes`);

    // Save to temp directory
    const outputPath1 = path.join('/tmp', 'PIT-37_flattened.pdf');
    fs.writeFileSync(outputPath1, pdfBytes1);
    console.log(`✓ Saved to: ${outputPath1}\n`);

    console.log('Test 2: PIT-37 with editable fields (keepFieldsEditable=true)');
    console.log('--------------------------------------------------------------');
    const pdfBytes2 = await taxFormService.fillForm('PIT-37', '2023', pit37Data, {
      keepFieldsEditable: true,
    });
    console.log(`✓ PDF generated: ${pdfBytes2.length} bytes`);

    const outputPath2 = path.join('/tmp', 'PIT-37_editable.pdf');
    fs.writeFileSync(outputPath2, pdfBytes2);
    console.log(`✓ Saved to: ${outputPath2}\n`);

    console.log('Test 3: Verify multi-page field placement');
    console.log('------------------------------------------');
    const mappings = await taxFormService.loadMappings('PIT-37', '2023');
    const pageNumbers = new Set<number>();

    for (const [fieldName, fieldMapping] of Object.entries(mappings.fields)) {
      pageNumbers.add(fieldMapping.page);
      console.log(
        `  - ${fieldName}: page ${fieldMapping.page}, x=${fieldMapping.x}, y=${fieldMapping.y}`
      );
    }

    console.log(
      `\n✓ Form uses ${pageNumbers.size} page(s): ${Array.from(pageNumbers).sort().join(', ')}`
    );

    if (pageNumbers.size > 1) {
      console.log('✓ Multi-page support is working correctly!\n');
    } else {
      console.log('⚠ Warning: Form only has fields on one page\n');
    }
  } catch (error) {
    console.error('✗ Error:', error instanceof Error ? error.message : String(error));
    console.error('Note: This test requires the PDF template to be available at:');
    console.error('  /public/pdf-templates/PIT-37/2023/PIT-37_2023.pdf\n');
  }
}

async function testUniversalPdfFiller() {
  console.log('========================================');
  console.log('Testing Universal PDF Filler');
  console.log('========================================\n');

  const universalFiller = new UniversalPdfFiller();

  try {
    // Load a sample PDF template
    const templatePath = path.join(
      process.cwd(),
      'public',
      'pdf-templates',
      'UPL-1',
      '2023',
      'UPL-1_2023.pdf'
    );

    if (!fs.existsSync(templatePath)) {
      console.log('⚠ UPL-1 template not found, skipping this test');
      console.log(`  Expected at: ${templatePath}\n`);
      return;
    }

    const pdfBytes = fs.readFileSync(templatePath);

    console.log('Test 1: Analyze PDF structure');
    console.log('------------------------------');
    const analysis = await universalFiller.analyzePdf(pdfBytes);
    console.log(`  - Page count: ${analysis.pageCount}`);
    console.log(`  - Page size: ${analysis.pageSize.width}x${analysis.pageSize.height}`);
    console.log(`  - Has Acroform: ${analysis.hasAcroform}`);
    console.log(`  - Field count: ${analysis.fieldCount}`);

    if (analysis.fields.length > 0) {
      console.log('  - Fields:');
      analysis.fields.slice(0, 5).forEach((field) => {
        console.log(`    • ${field.name} (${field.type})`);
      });
      if (analysis.fields.length > 5) {
        console.log(`    ... and ${analysis.fields.length - 5} more`);
      }
    }
    console.log();

    console.log('Test 2: Fill with editable fields');
    console.log('----------------------------------');
    const testData = {
      principalName: 'Test Company Sp. z o.o.',
      principalNIP: '1234567890',
      attorneyName: 'Jan Kowalski',
      attorneyPESEL: '12345678901',
    };

    const { pdfBytes: filledPdf, result } = await universalFiller.fillForm(pdfBytes, testData, {
      keepFieldsEditable: true,
    });

    console.log(`  - Method used: ${result.method}`);
    console.log(`  - Fields detected: ${result.fieldsDetected}`);
    console.log(`  - Fields filled: ${result.fieldsFilled}`);
    console.log(`  - Fields skipped: ${result.fieldsSkipped}`);

    if (result.errors.length > 0) {
      console.log(`  - Errors: ${result.errors.length}`);
      result.errors.forEach((err) => console.log(`    • ${err}`));
    }

    if (result.warnings.length > 0) {
      console.log(`  - Warnings: ${result.warnings.length}`);
      result.warnings.slice(0, 3).forEach((warn) => console.log(`    • ${warn}`));
      if (result.warnings.length > 3) {
        console.log(`    ... and ${result.warnings.length - 3} more`);
      }
    }

    const outputPath = path.join('/tmp', 'UPL-1_universal_editable.pdf');
    fs.writeFileSync(outputPath, filledPdf);
    console.log(`  - Saved to: ${outputPath}`);
    console.log(`  - PDF size: ${filledPdf.length} bytes\n`);
  } catch (error) {
    console.error('✗ Error:', error instanceof Error ? error.message : String(error));
  }
}

async function testEditableFieldsComparison() {
  console.log('========================================');
  console.log('Testing Editable vs Flattened PDFs');
  console.log('========================================\n');

  const taxFormService = new TaxFormService();

  const testData = {
    taxpayerName: 'Jan Kowalski',
    taxpayerId: '12345678901',
    taxpayerNIP: '1234567890',
  };

  try {
    // Test with a simple form
    const formType = 'ZAW-FA';
    const year = '2023';

    console.log(`Testing with ${formType} form:`);
    console.log('-----------------------------');

    // Flattened version
    const flattenedPdf = await taxFormService.fillForm(formType, year, testData, {
      keepFieldsEditable: false,
    });
    const flattenedPath = path.join('/tmp', `${formType}_flattened.pdf`);
    fs.writeFileSync(flattenedPath, flattenedPdf);
    console.log(`✓ Flattened PDF: ${flattenedPath} (${flattenedPdf.length} bytes)`);

    // Editable version
    const editablePdf = await taxFormService.fillForm(formType, year, testData, {
      keepFieldsEditable: true,
    });
    const editablePath = path.join('/tmp', `${formType}_editable.pdf`);
    fs.writeFileSync(editablePath, editablePdf);
    console.log(`✓ Editable PDF: ${editablePath} (${editablePdf.length} bytes)`);

    console.log('\nComparison:');
    console.log(`  - Size difference: ${editablePdf.length - flattenedPdf.length} bytes`);
    console.log(`  - Both PDFs created successfully\n`);

    console.log('Note: Open these PDFs in a PDF reader to verify:');
    console.log('  - Flattened PDF: Fields are filled and cannot be edited');
    console.log('  - Editable PDF: Fields are filled but can still be edited\n');
  } catch (error) {
    console.error('✗ Error:', error instanceof Error ? error.message : String(error));
  }
}

// Run all tests
async function runAllTests() {
  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║  Multi-Page and Editable Fields Test Suite    ║');
  console.log('╚════════════════════════════════════════════════╝\n');

  try {
    await testMultiPageFilling();
    await testUniversalPdfFiller();
    await testEditableFieldsComparison();

    console.log('========================================');
    console.log('All Tests Completed!');
    console.log('========================================\n');
    console.log('Check /tmp directory for generated PDFs:');
    console.log('  - PIT-37_flattened.pdf');
    console.log('  - PIT-37_editable.pdf');
    console.log('  - UPL-1_universal_editable.pdf');
    console.log('  - ZAW-FA_flattened.pdf');
    console.log('  - ZAW-FA_editable.pdf\n');
  } catch (error) {
    console.error('Test suite failed:', error);
    process.exit(1);
  }
}

// Execute tests
runAllTests().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
