import { PDFDocument } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';

async function testPDFLoading() {
  const projectRoot = path.join(__dirname, '..');
  const pdfPath = path.join(projectRoot, 'public', 'upl-1_06-08-2.pdf');
  
  console.log('Testing PDF loading from:', pdfPath);
  
  try {
    // Read the PDF
    const pdfBytes = fs.readFileSync(pdfPath);
    console.log('PDF file size:', pdfBytes.length, 'bytes');
    
    // Try to load it with pdf-lib
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    
    console.log('✓ PDF loaded successfully!');
    console.log('Number of pages:', pages.length);
    
    if (pages.length > 0) {
      const firstPage = pages[0];
      const { width, height } = firstPage.getSize();
      console.log('First page size:', width, 'x', height, 'points');
    }
    
    console.log('\n✅ Test PASSED: PDF is valid and can be loaded by pdf-lib');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test FAILED: Error loading PDF:', error);
    process.exit(1);
  }
}

testPDFLoading();
