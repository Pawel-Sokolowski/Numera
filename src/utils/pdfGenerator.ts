import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Invoice, Client } from '../types/client';

interface AutoTable extends jsPDF {
  autoTable: (options: any) => void;
}

export interface InvoiceTemplate {
  id: string;
  name: string;
  description: string;
}

export const availableTemplates: InvoiceTemplate[] = [
  {
    id: 'standard',
    name: 'Standardowy',
    description: 'Klasyczny szablon faktury VAT'
  },
  {
    id: 'modern',
    name: 'Nowoczesny',
    description: 'Nowoczesny szablon z kolorowym nagłówkiem'
  },
  {
    id: 'minimal',
    name: 'Minimalistyczny',
    description: 'Prosty, czytelny szablon'
  }
];

export class PDFInvoiceGenerator {
  private pdf: AutoTable;
  
  constructor() {
    this.pdf = new jsPDF() as AutoTable;
  }

  generateInvoice(invoice: Invoice, client: Client, template: string = 'standard'): void {
    this.pdf = new jsPDF() as AutoTable;
    
    switch (template) {
      case 'modern':
        this.generateModernTemplate(invoice, client);
        break;
      case 'minimal':
        this.generateMinimalTemplate(invoice, client);
        break;
      default:
        this.generateStandardTemplate(invoice, client);
    }

    this.pdf.save(`${invoice.number}.pdf`);
  }

  private generateStandardTemplate(invoice: Invoice, client: Client): void {
    // Header
    this.pdf.setFontSize(20);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('FAKTURA VAT', 20, 30);

    // Invoice details
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(`Numer: ${invoice.number}`, 20, 50);
    this.pdf.text(`Data wystawienia: ${new Date(invoice.issueDate).toLocaleDateString('pl-PL')}`, 20, 60);
    this.pdf.text(`Termin płatności: ${new Date(invoice.dueDate).toLocaleDateString('pl-PL')}`, 20, 70);

    // Client info
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Nabywca:', 20, 90);
    this.pdf.setFont('helvetica', 'normal');
    const clientName = `${client.firstName} ${client.lastName}`;
    this.pdf.text(clientName, 20, 100);
    if (client.company) this.pdf.text(client.company, 20, 110);
    if (client.address) this.pdf.text(client.address, 20, 120);
    if (client.nip) this.pdf.text(`NIP: ${client.nip}`, 20, 130);

    // Items table
    const tableData = invoice.items.map((item, index) => [
      (index + 1).toString(),
      item.description,
      item.quantity.toString(),
      `${item.unitPrice.toFixed(2)} zł`,
      `${item.netAmount.toFixed(2)} zł`,
      `${item.taxRate}%`,
      `${item.grossAmount.toFixed(2)} zł`
    ]);

    this.pdf.autoTable({
      startY: 150,
      head: [['Lp.', 'Opis', 'Ilość', 'Cena netto', 'Wartość netto', 'VAT', 'Wartość brutto']],
      body: tableData,
      theme: 'grid'
    });

    // Summary
    const finalY = (this.pdf as any).lastAutoTable.finalY + 20;
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(`Razem netto: ${invoice.totalNet.toFixed(2)} zł`, 120, finalY);
    this.pdf.text(`VAT 23%: ${invoice.totalTax.toFixed(2)} zł`, 120, finalY + 10);
    this.pdf.text(`RAZEM BRUTTO: ${invoice.totalGross.toFixed(2)} zł`, 120, finalY + 20);
  }

  private generateModernTemplate(invoice: Invoice, client: Client): void {
    // Colored header
    this.pdf.setFillColor(37, 99, 235); // Blue
    this.pdf.rect(0, 0, 210, 40, 'F');

    // White text on blue background
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(24);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('FAKTURA VAT', 20, 25);

    // Reset text color
    this.pdf.setTextColor(0, 0, 0);

    // Invoice details in box
    this.pdf.setDrawColor(37, 99, 235);
    this.pdf.rect(120, 50, 70, 30);
    this.pdf.setFontSize(10);
    this.pdf.text(`Numer: ${invoice.number}`, 125, 60);
    this.pdf.text(`Data: ${new Date(invoice.issueDate).toLocaleDateString('pl-PL')}`, 125, 67);
    this.pdf.text(`Termin: ${new Date(invoice.dueDate).toLocaleDateString('pl-PL')}`, 125, 74);

    // Client info
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Nabywca:', 20, 60);
    this.pdf.setFont('helvetica', 'normal');
    const clientName = `${client.firstName} ${client.lastName}`;
    this.pdf.text(clientName, 20, 70);
    if (client.company) this.pdf.text(client.company, 20, 77);
    if (client.address) this.pdf.text(client.address, 20, 84);
    if (client.nip) this.pdf.text(`NIP: ${client.nip}`, 20, 91);

    // Items table with blue theme
    const tableData = invoice.items.map((item, index) => [
      (index + 1).toString(),
      item.description,
      item.quantity.toString(),
      `${item.unitPrice.toFixed(2)} zł`,
      `${item.netAmount.toFixed(2)} zł`,
      `${item.taxRate}%`,
      `${item.grossAmount.toFixed(2)} zł`
    ]);

    this.pdf.autoTable({
      startY: 110,
      head: [['Lp.', 'Opis', 'Ilość', 'Cena netto', 'Wartość netto', 'VAT', 'Wartość brutto']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] }
    });

    // Summary in box
    const finalY = (this.pdf as any).lastAutoTable.finalY + 20;
    this.pdf.setDrawColor(37, 99, 235);
    this.pdf.rect(120, finalY, 70, 40);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(`Netto: ${invoice.totalNet.toFixed(2)} zł`, 125, finalY + 10);
    this.pdf.text(`VAT: ${invoice.totalTax.toFixed(2)} zł`, 125, finalY + 20);
    this.pdf.setFontSize(14);
    this.pdf.text(`BRUTTO: ${invoice.totalGross.toFixed(2)} zł`, 125, finalY + 32);
  }

  private generateMinimalTemplate(invoice: Invoice, client: Client): void {
    this.pdf.setDrawColor(0, 0, 0);
    this.pdf.setLineWidth(0.5);

    // Simple header line
    this.pdf.line(20, 35, 190, 35);
    
    this.pdf.setFontSize(18);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text('FAKTURA VAT', 20, 30);

    // Invoice info - minimal
    this.pdf.setFontSize(10);
    this.pdf.text(`${invoice.number} | ${new Date(invoice.issueDate).toLocaleDateString('pl-PL')} | Termin: ${new Date(invoice.dueDate).toLocaleDateString('pl-PL')}`, 20, 50);

    // Simple client info
    const clientName = `${client.firstName} ${client.lastName}`;
    this.pdf.text(`Do: ${clientName}${client.company ? `, ${client.company}` : ''}${client.nip ? ` (NIP: ${client.nip})` : ''}`, 20, 65);

    // Minimal table
    const tableData = invoice.items.map((item, index) => [
      item.description,
      `${item.quantity} x ${item.unitPrice.toFixed(2)} zł`,
      `${item.grossAmount.toFixed(2)} zł`
    ]);

    this.pdf.autoTable({
      startY: 80,
      head: [['Opis', 'Ilość x Cena', 'Wartość']],
      body: tableData,
      theme: 'plain',
      styles: { fontSize: 10 }
    });

    // Simple summary
    const finalY = (this.pdf as any).lastAutoTable.finalY + 10;
    this.pdf.line(140, finalY, 190, finalY);
    this.pdf.text(`Do zapłaty: ${invoice.totalGross.toFixed(2)} zł`, 140, finalY + 10);
    this.pdf.line(140, finalY + 15, 190, finalY + 15);
  }
}