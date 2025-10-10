import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';

async function createBlankUPL1Form(): Promise<Uint8Array> {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  
  // Add a blank A4 page (595 x 842 points)
  const page = pdfDoc.addPage([595, 842]);
  const { width, height } = page.getSize();
  
  // Embed fonts
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  // Title
  page.drawText('PELNOMOCNICTWO UPL-1', {
    x: 150,
    y: height - 50,
    size: 16,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  
  page.drawText('do Urzedu Skarbowego', {
    x: 180,
    y: height - 70,
    size: 14,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  
  // Mocodawca section
  page.drawText('MOCODAWCA:', {
    x: 50,
    y: height - 110,
    size: 12,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  
  page.drawText('Imie i nazwisko / Nazwa: ___________________________________________', {
    x: 50,
    y: height - 135,
    size: 10,
    font: font,
    color: rgb(0, 0, 0),
  });
  
  page.drawText('NIP: _______________________  REGON: _______________________', {
    x: 50,
    y: height - 155,
    size: 10,
    font: font,
    color: rgb(0, 0, 0),
  });
  
  page.drawText('Adres: ___________________________________________________________', {
    x: 50,
    y: height - 175,
    size: 10,
    font: font,
    color: rgb(0, 0, 0),
  });
  
  page.drawText('Kod pocztowy i miejscowosc: __________________________________________', {
    x: 50,
    y: height - 195,
    size: 10,
    font: font,
    color: rgb(0, 0, 0),
  });
  
  // Pełnomocnik section  
  page.drawText('PELNOMOCNIK:', {
    x: 50,
    y: height - 240,
    size: 12,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  
  page.drawText('Imie i nazwisko: ___________________________________________________', {
    x: 50,
    y: height - 265,
    size: 10,
    font: font,
    color: rgb(0, 0, 0),
  });
  
  page.drawText('PESEL: _______________________________________________________________', {
    x: 50,
    y: height - 285,
    size: 10,
    font: font,
    color: rgb(0, 0, 0),
  });
  
  page.drawText('Adres: _______________________________________________________________', {
    x: 50,
    y: height - 305,
    size: 10,
    font: font,
    color: rgb(0, 0, 0),
  });
  
  page.drawText('Kod pocztowy i miejscowosc: __________________________________________', {
    x: 50,
    y: height - 325,
    size: 10,
    font: font,
    color: rgb(0, 0, 0),
  });
  
  // Zakres section
  page.drawText('ZAKRES PELNOMOCNICTWA:', {
    x: 50,
    y: height - 370,
    size: 12,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  
  const scopeItems = [
    '1. ________________________________________________________________',
    '2. ________________________________________________________________',
    '3. ________________________________________________________________',
    '4. ________________________________________________________________',
    '5. ________________________________________________________________',
    '6. ________________________________________________________________',
  ];
  
  let yPos = height - 395;
  scopeItems.forEach(item => {
    page.drawText(item, {
      x: 50,
      y: yPos,
      size: 9,
      font: font,
      color: rgb(0, 0, 0),
    });
    yPos -= 20;
  });
  
  // Period section
  yPos -= 20;
  page.drawText('OKRES OBOWIAZYWANIA:', {
    x: 50,
    y: yPos,
    size: 12,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  
  yPos -= 25;
  page.drawText('Od: ___________________  Do: ___________________', {
    x: 50,
    y: yPos,
    size: 10,
    font: font,
    color: rgb(0, 0, 0),
  });
  
  // Date and place
  yPos -= 50;
  page.drawText('Data i miejsce wystawienia: _________________________________________', {
    x: 50,
    y: yPos,
    size: 10,
    font: font,
    color: rgb(0, 0, 0),
  });
  
  // Signatures
  yPos -= 60;
  page.drawText('_____________________________', {
    x: 80,
    y: yPos,
    size: 10,
    font: font,
    color: rgb(0, 0, 0),
  });
  
  page.drawText('_____________________________', {
    x: 350,
    y: yPos,
    size: 10,
    font: font,
    color: rgb(0, 0, 0),
  });
  
  yPos -= 15;
  page.drawText('(Podpis mocodawcy)', {
    x: 80,
    y: yPos,
    size: 8,
    font: font,
    color: rgb(0, 0, 0),
  });
  
  page.drawText('(Podpis pelnomocnika)', {
    x: 350,
    y: yPos,
    size: 8,
    font: font,
    color: rgb(0, 0, 0),
  });
  
  // Save the PDF
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

// Generate and save the PDF
createBlankUPL1Form().then(pdfBytes => {
  const projectRoot = path.join(__dirname, '..');
  
  // Write to multiple locations
  const locations = [
    path.join(projectRoot, 'PDFFile', 'upl-1_06-08-2.pdf'),
    path.join(projectRoot, 'public', 'upl-1_06-08-2.pdf'),
    path.join(projectRoot, 'public', 'pdf-templates', 'UPL-1', '2023', 'UPL-1_2023.pdf'),
    path.join(projectRoot, 'upl-1_06-08-2.pdf')
  ];
  
  locations.forEach(location => {
    fs.writeFileSync(location, pdfBytes);
    console.log(`Created: ${location}`);
  });
  
  console.log('\nPDF created successfully!');
  console.log('File size:', pdfBytes.length, 'bytes');
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
