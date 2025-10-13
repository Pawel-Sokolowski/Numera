import { PDFDocument } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';

async function testPdfLoad() {
  console.log('Testing PDF template loading...\n');
  
  const projectRoot = path.join(__dirname, '..');
  const pdfPath = path.join(projectRoot, 'public', 'pdf-templates', 'UPL-1', '2023', 'UPL-1_2023.pdf');
  
  try {
    // Read the PDF file
    const pdfBytes = fs.readFileSync(pdfPath);
    console.log(`✓ PDF file read successfully: ${pdfBytes.length} bytes`);
    
    // Try to load it with pdf-lib
    const pdfDoc = await PDFDocument.load(pdfBytes);
    console.log(`✓ PDF loaded with pdf-lib successfully`);
    
    // Check page count
    const pageCount = pdfDoc.getPageCount();
    console.log(`✓ PDF has ${pageCount} page(s)`);
    
    if (pageCount === 0) {
      console.error('✗ ERROR: PDF has 0 pages - file is corrupted!');
      process.exit(1);
    }
    
    // Get first page
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();
    console.log(`✓ First page size: ${width}x${height} points`);
    
    console.log('\n✅ All tests passed! PDF template is valid and loadable.');
    process.exit(0);
  } catch (error) {
    console.error('✗ ERROR loading PDF:', error);
    process.exit(1);
  }
}

testPdfLoad();
