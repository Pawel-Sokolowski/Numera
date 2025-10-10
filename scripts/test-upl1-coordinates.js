/**
 * UPL-1 Coordinate Testing Utility
 * 
 * This script generates a test PDF to verify coordinate positions
 * for the UPL-1 form filling implementation.
 * 
 * Usage: node scripts/test-upl1-coordinates.js
 */

const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

// Sample test data
const TEST_DATA = {
  principalName: 'Jan Kowalski',
  principalNIP: '1234567890',
  principalREGON: '123456789',
  principalAddress: 'ul. Testowa 123',
  principalCity: '00-001 Warszawa',
  
  attorneyName: 'Anna Nowak',
  attorneyPESEL: '98765432101',
  attorneyAddress: 'ul. Biurowa 456',
  attorneyCity: '00-002 Warszawa',
  
  issueDate: '01.10.2024',
  startDate: '01.10.2024',
  endDate: '31.12.2024',
  
  scopeItems: [
    '1. Reprezentowania mocodawcy przed organami skarbowymi',
    '2. Skladania deklaracji podatkowych i innych dokumentow',
    '3. Odbierania korespondencji zwiazanej ze sprawami podatkowymi',
    '4. Dostepu do informacji podatkowych mocodawcy',
    '5. Podpisywania dokumentow w imieniu mocodawcy',
    '6. Skladania wnioskow i odwolan w sprawach podatkowych'
  ]
};

// Coordinate configuration (matches upl1PdfFiller.ts)
const COORDINATES = {
  principalName: { x: 150, y: 720 },
  principalNIP: { x: 150, y: 695 },
  principalREGON: { x: 150, y: 670 },
  principalAddress: { x: 150, y: 645 },
  principalCity: { x: 150, y: 620 },
  
  attorneyName: { x: 150, y: 560 },
  attorneyPESEL: { x: 150, y: 535 },
  attorneyAddress: { x: 150, y: 510 },
  attorneyCity: { x: 150, y: 485 },
  
  scope1: { x: 50, y: 420 },
  scope2: { x: 50, y: 400 },
  scope3: { x: 50, y: 380 },
  scope4: { x: 50, y: 360 },
  scope5: { x: 50, y: 340 },
  scope6: { x: 50, y: 320 },
  
  startDate: { x: 150, y: 270 },
  endDate: { x: 350, y: 270 },
  issueDate: { x: 150, y: 180 },
  issuePlace: { x: 350, y: 180 },
  
  principalSignature: { x: 100, y: 100 },
  attorneySignature: { x: 400, y: 100 },
};

async function generateTestPDF() {
  try {
    console.log('=== UPL-1 Coordinate Test Utility ===\n');
    
    // Load the template
    const templatePath = path.join(__dirname, '../public/upl-1_06-08-2.pdf');
    
    if (!fs.existsSync(templatePath)) {
      console.error(`Error: Template not found at ${templatePath}`);
      console.log('Make sure the UPL-1 PDF is in the public folder.');
      process.exit(1);
    }
    
    const pdfBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();
    
    console.log(`Template loaded: ${width} x ${height} points\n`);
    
    // Embed font
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 10;
    const scopeFontSize = 9;
    
    // Use blue color for test visibility
    const testColor = rgb(0, 0, 1);
    
    console.log('Filling test data...\n');
    
    // Helper function to draw text
    const drawText = (text, x, y, size = fontSize, label = '') => {
      if (!text) return;
      
      firstPage.drawText(text, {
        x,
        y,
        size,
        font,
        color: testColor,
      });
      
      if (label) {
        console.log(`  ✓ ${label.padEnd(20)} (${x}, ${y})`);
      }
    };
    
    // Fill principal section
    console.log('Principal (Mocodawca):');
    drawText(TEST_DATA.principalName, COORDINATES.principalName.x, COORDINATES.principalName.y, fontSize, 'Name');
    drawText(TEST_DATA.principalNIP, COORDINATES.principalNIP.x, COORDINATES.principalNIP.y, fontSize, 'NIP');
    drawText(TEST_DATA.principalREGON, COORDINATES.principalREGON.x, COORDINATES.principalREGON.y, fontSize, 'REGON');
    drawText(TEST_DATA.principalAddress, COORDINATES.principalAddress.x, COORDINATES.principalAddress.y, fontSize, 'Address');
    drawText(TEST_DATA.principalCity, COORDINATES.principalCity.x, COORDINATES.principalCity.y, fontSize, 'City');
    
    console.log('\nAttorney (Pełnomocnik):');
    drawText(TEST_DATA.attorneyName, COORDINATES.attorneyName.x, COORDINATES.attorneyName.y, fontSize, 'Name');
    drawText(TEST_DATA.attorneyPESEL, COORDINATES.attorneyPESEL.x, COORDINATES.attorneyPESEL.y, fontSize, 'PESEL');
    drawText(TEST_DATA.attorneyAddress, COORDINATES.attorneyAddress.x, COORDINATES.attorneyAddress.y, fontSize, 'Address');
    drawText(TEST_DATA.attorneyCity, COORDINATES.attorneyCity.x, COORDINATES.attorneyCity.y, fontSize, 'City');
    
    console.log('\nScope (Zakres):');
    const scopeCoords = [
      COORDINATES.scope1, COORDINATES.scope2, COORDINATES.scope3,
      COORDINATES.scope4, COORDINATES.scope5, COORDINATES.scope6
    ];
    
    TEST_DATA.scopeItems.forEach((item, index) => {
      if (scopeCoords[index]) {
        drawText(item, scopeCoords[index].x, scopeCoords[index].y, scopeFontSize, `Item ${index + 1}`);
      }
    });
    
    console.log('\nDates:');
    drawText(TEST_DATA.issueDate, COORDINATES.issueDate.x, COORDINATES.issueDate.y, fontSize, 'Issue date');
    drawText(TEST_DATA.startDate, COORDINATES.startDate.x, COORDINATES.startDate.y, fontSize, 'Start date');
    drawText(TEST_DATA.endDate, COORDINATES.endDate.x, COORDINATES.endDate.y, fontSize, 'End date');
    
    // Add coordinate markers for signatures
    console.log('\nSignature positions:');
    drawText('(Principal signature)', COORDINATES.principalSignature.x, COORDINATES.principalSignature.y, 8, 'Principal sig');
    drawText('(Attorney signature)', COORDINATES.attorneySignature.x, COORDINATES.attorneySignature.y, 8, 'Attorney sig');
    
    // Save the test PDF
    const outputBytes = await pdfDoc.save();
    const outputPath = path.join(__dirname, '../build/upl-1-test-filled.pdf');
    
    // Ensure build directory exists
    const buildDir = path.dirname(outputPath);
    if (!fs.existsSync(buildDir)) {
      fs.mkdirSync(buildDir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, outputBytes);
    
    console.log(`\n✓ Test PDF generated: ${outputPath}`);
    console.log('\nNote: Text is in BLUE for visibility');
    console.log('Compare with the blank form to verify coordinate accuracy');
    console.log('Adjust coordinates in src/utils/upl1PdfFiller.ts if needed\n');
    
  } catch (error) {
    console.error('Error generating test PDF:', error);
    process.exit(1);
  }
}

// Run the test
generateTestPDF();
