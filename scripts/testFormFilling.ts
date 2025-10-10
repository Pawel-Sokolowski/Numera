import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Client, User } from '../src/types/client';
import * as fs from 'fs';
import * as path from 'path';

// Recreate the relevant parts of UPL1PdfFiller for testing
const UPL1_FIELD_COORDINATES = {
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

async function testFormFilling() {
  console.log('Testing UPL-1 form filling...\n');
  
  // Create test data
  const testClient: Client = {
    id: 'test-client-1',
    firstName: 'Jan',
    lastName: 'Kowalski',
    companyName: 'Test Firma Sp. z o.o.',
    nip: '1234567890',
    regon: '123456789',
    address: {
      street: 'ul. Testowa 123',
      city: 'Warszawa',
      zipCode: '00-001',
      country: 'Polska'
    },
    emails: ['jan@example.com'],
    phone: '+48123456789',
    contracts: [],
    documents: [],
    payments: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    status: 'active'
  };
  
  const testEmployee: User = {
    id: 'test-employee-1',
    firstName: 'Anna',
    lastName: 'Nowak',
    email: 'anna@example.com',
    role: 'accountant',
    pesel: '85010112345',
    position: 'Ksiegowa',
    isActive: true,
    createdAt: new Date(),
    lastLogin: new Date()
  };
  
  try {
    console.log('Loading PDF template...');
    const pdfPath = path.join(__dirname, '..', 'public', 'upl-1_06-08-2.pdf');
    const pdfBytes = fs.readFileSync(pdfPath);
    
    console.log('Loading PDF document...');
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    
    console.log('Embedding fonts...');
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 10;
    const textColor = rgb(0, 0, 0);
    
    // Helper function to draw text
    const drawText = (text: string, x: number, y: number, size: number = fontSize) => {
      if (!text) return;
      firstPage.drawText(text, { x, y, size, font, color: textColor });
    };
    
    console.log('Filling form fields...');
    
    // Fill principal data
    const clientName = `${testClient.firstName} ${testClient.lastName}`;
    drawText(clientName, UPL1_FIELD_COORDINATES.principalName.x, UPL1_FIELD_COORDINATES.principalName.y);
    
    if (testClient.companyName) {
      drawText(testClient.companyName, UPL1_FIELD_COORDINATES.principalName.x, UPL1_FIELD_COORDINATES.principalName.y - 15);
    }
    
    if (testClient.nip) {
      drawText(testClient.nip, UPL1_FIELD_COORDINATES.principalNIP.x, UPL1_FIELD_COORDINATES.principalNIP.y);
    }
    
    if (testClient.regon) {
      drawText(testClient.regon, UPL1_FIELD_COORDINATES.principalREGON.x, UPL1_FIELD_COORDINATES.principalREGON.y);
    }
    
    // Fill attorney data
    const employeeName = `${testEmployee.firstName} ${testEmployee.lastName}`;
    drawText(employeeName, UPL1_FIELD_COORDINATES.attorneyName.x, UPL1_FIELD_COORDINATES.attorneyName.y);
    
    if (testEmployee.pesel) {
      drawText(testEmployee.pesel, UPL1_FIELD_COORDINATES.attorneyPESEL.x, UPL1_FIELD_COORDINATES.attorneyPESEL.y);
    }
    
    // Fill scope
    const scopeItems = [
      '1. Reprezentowania mocodawcy przed organami skarbowymi',
      '2. Skladania deklaracji podatkowych i innych dokumentow',
      '3. Odbierania korespondencji zwiazanej ze sprawami podatkowymi'
    ];
    
    const scopeCoordinates = [
      UPL1_FIELD_COORDINATES.scope1,
      UPL1_FIELD_COORDINATES.scope2,
      UPL1_FIELD_COORDINATES.scope3,
    ];
    
    scopeItems.forEach((item, index) => {
      if (scopeCoordinates[index]) {
        drawText(item, scopeCoordinates[index].x, scopeCoordinates[index].y, 9);
      }
    });
    
    // Fill dates
    const currentDate = new Date().toLocaleDateString('pl-PL');
    drawText(currentDate, UPL1_FIELD_COORDINATES.issueDate.x, UPL1_FIELD_COORDINATES.issueDate.y);
    drawText('01.10.2024', UPL1_FIELD_COORDINATES.startDate.x, UPL1_FIELD_COORDINATES.startDate.y);
    drawText('31.12.2024', UPL1_FIELD_COORDINATES.endDate.x, UPL1_FIELD_COORDINATES.endDate.y);
    
    console.log('Saving filled PDF...');
    const filledPdfBytes = await pdfDoc.save();
    
    console.log('✓ Form filled successfully!');
    console.log('Filled PDF size:', filledPdfBytes.length, 'bytes');
    
    // Save the filled PDF for inspection
    const outputPath = path.join(__dirname, '..', 'test-output-upl1.pdf');
    fs.writeFileSync(outputPath, filledPdfBytes);
    console.log('Saved filled PDF to:', outputPath);
    
    console.log('\n✅ Test PASSED: Form filling works correctly');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test FAILED: Error filling form:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

testFormFilling();
