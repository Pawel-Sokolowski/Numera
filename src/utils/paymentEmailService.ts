import { Client } from '../types/client';
import { Payment, PaymentSummary } from '../types/payment';

// ================================================================================================
// EMAIL TEMPLATES FOR PAYMENT NOTIFICATIONS
// ================================================================================================

export interface EmailNotification {
  to: string[];
  subject: string;
  body: string;
  isHtml: boolean;
  attachments?: any[];
}

// Generate payment reminder email
export function generatePaymentReminderEmail(
  client: Client,
  payment: Payment,
  daysUntilDue: number
): EmailNotification {
  const clientName = `${client.firstName} ${client.lastName}`;
  const companyName = client.companyName ? ` (${client.companyName})` : '';
  const dueDate = new Date(payment.dueDate).toLocaleDateString('pl-PL');
  
  let urgencyText = '';
  if (daysUntilDue <= 0) {
    urgencyText = 'Termin płatności już minął!';
  } else if (daysUntilDue <= 3) {
    urgencyText = `Termin płatności za ${daysUntilDue} dni!`;
  } else {
    urgencyText = `Termin płatności za ${daysUntilDue} dni.`;
  }

  const subject = `Przypomnienie o płatności ${payment.type} - ${urgencyText}`;
  
  const body = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #3b82f6; color: white; padding: 20px; text-align: center; }
    .content { background-color: #f9fafb; padding: 20px; margin-top: 20px; border-radius: 8px; }
    .payment-details { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #3b82f6; }
    .payment-row { display: flex; justify-content: space-between; margin: 10px 0; }
    .label { font-weight: bold; }
    .amount { font-size: 24px; color: #3b82f6; font-weight: bold; }
    .urgent { color: #dc2626; font-weight: bold; }
    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Przypomnienie o płatności</h1>
    </div>
    
    <div class="content">
      <p>Szanowny Panie/Pani ${clientName}${companyName},</p>
      
      <p>Uprzejmie przypominamy o zbliżającym się terminie płatności:</p>
      
      <div class="payment-details">
        <div class="payment-row">
          <span class="label">Typ płatności:</span>
          <span>${payment.type}</span>
        </div>
        <div class="payment-row">
          <span class="label">Okres:</span>
          <span>${payment.period}</span>
        </div>
        <div class="payment-row">
          <span class="label">Kwota:</span>
          <span class="amount">${payment.amount.toFixed(2)} zł</span>
        </div>
        <div class="payment-row">
          <span class="label">Termin płatności:</span>
          <span class="${daysUntilDue <= 3 ? 'urgent' : ''}">${dueDate}</span>
        </div>
        ${daysUntilDue <= 0 ? `
        <div style="background-color: #fee; padding: 10px; margin-top: 10px; border-radius: 4px;">
          <strong class="urgent">UWAGA: Termin płatności już minął!</strong>
        </div>
        ` : ''}
      </div>
      
      ${payment.notes ? `<p><strong>Notatki:</strong> ${payment.notes}</p>` : ''}
      
      <p>Prosimy o terminową regulację należności.</p>
      
      <p>W razie pytań prosimy o kontakt.</p>
      
      <p>Pozdrawiamy,<br>
      Zespół księgowy</p>
    </div>
    
    <div class="footer">
      <p>To jest automatyczna wiadomość. Prosimy nie odpowiadać na ten email.</p>
    </div>
  </div>
</body>
</html>
  `;

  const emails = client.emails || [];
  const taxEmails = client.taxNotificationEmails || [];
  const allEmails = [...new Set([...emails, ...taxEmails])].filter(e => e);

  return {
    to: allEmails,
    subject,
    body,
    isHtml: true
  };
}

// Generate monthly payment summary email
export function generateMonthlySummaryEmail(
  client: Client,
  summary: PaymentSummary
): EmailNotification {
  const clientName = `${client.firstName} ${client.lastName}`;
  const companyName = client.companyName ? ` (${client.companyName})` : '';
  
  const [month, year] = summary.period.split('/');
  const monthNames = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 
                     'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];
  const monthName = monthNames[parseInt(month) - 1];

  const subject = `Podsumowanie płatności - ${monthName} ${year}`;
  
  // Group payments by type
  const paymentsByType: { [key: string]: Payment[] } = {};
  summary.payments.forEach(payment => {
    if (!paymentsByType[payment.type]) {
      paymentsByType[payment.type] = [];
    }
    paymentsByType[payment.type].push(payment);
  });

  const paymentsHtml = Object.entries(paymentsByType).map(([type, payments]) => {
    const typeTotal = payments.reduce((sum, p) => sum + p.amount, 0);
    const typePaid = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
    const typePending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
    
    const paymentsRows = payments.map(p => {
      const statusColor = p.status === 'paid' ? '#10b981' : 
                         p.status === 'overdue' ? '#dc2626' : '#3b82f6';
      const statusText = p.status === 'paid' ? 'Opłacone' :
                        p.status === 'overdue' ? 'Zaległe' : 'Oczekujące';
      
      return `
        <tr>
          <td style="padding: 8px;">${new Date(p.dueDate).toLocaleDateString('pl-PL')}</td>
          <td style="padding: 8px;">${p.amount.toFixed(2)} zł</td>
          <td style="padding: 8px;">
            <span style="color: ${statusColor}; font-weight: bold;">${statusText}</span>
          </td>
        </tr>
      `;
    }).join('');

    return `
      <div style="margin-bottom: 20px;">
        <h3 style="color: #3b82f6;">${type}</h3>
        <div style="background-color: #f3f4f6; padding: 10px; margin-bottom: 10px;">
          <div style="display: flex; justify-content: space-between; margin: 5px 0;">
            <span>Łącznie:</span>
            <strong>${typeTotal.toFixed(2)} zł</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 5px 0;">
            <span>Opłacone:</span>
            <strong style="color: #10b981;">${typePaid.toFixed(2)} zł</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 5px 0;">
            <span>Oczekujące:</span>
            <strong style="color: #3b82f6;">${typePending.toFixed(2)} zł</strong>
          </div>
        </div>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #e5e7eb;">
              <th style="padding: 8px; text-align: left;">Termin</th>
              <th style="padding: 8px; text-align: left;">Kwota</th>
              <th style="padding: 8px; text-align: left;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${paymentsRows}
          </tbody>
        </table>
      </div>
    `;
  }).join('');

  const body = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #3b82f6; color: white; padding: 20px; text-align: center; }
    .content { background-color: #f9fafb; padding: 20px; margin-top: 20px; border-radius: 8px; }
    .summary-box { background-color: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .stat-row { display: flex; justify-content: space-between; margin: 15px 0; padding: 10px; border-bottom: 1px solid #e5e7eb; }
    .stat-label { font-weight: bold; }
    .stat-value { font-size: 20px; font-weight: bold; }
    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Podsumowanie miesięczne płatności</h1>
      <p>${monthName} ${year}</p>
    </div>
    
    <div class="content">
      <p>Szanowny Panie/Pani ${clientName}${companyName},</p>
      
      <p>Przesyłamy podsumowanie płatności za okres ${monthName} ${year}.</p>
      
      <div class="summary-box">
        <h2 style="margin-top: 0; color: #3b82f6;">Podsumowanie ogólne</h2>
        
        <div class="stat-row">
          <span class="stat-label">Łączna kwota:</span>
          <span class="stat-value">${summary.totalAmount.toFixed(2)} zł</span>
        </div>
        
        <div class="stat-row">
          <span class="stat-label">Opłacone:</span>
          <span class="stat-value" style="color: #10b981;">${summary.totalPaid.toFixed(2)} zł</span>
        </div>
        
        <div class="stat-row">
          <span class="stat-label">Oczekujące:</span>
          <span class="stat-value" style="color: #3b82f6;">${summary.totalPending.toFixed(2)} zł</span>
        </div>
        
        ${summary.totalOverdue > 0 ? `
        <div class="stat-row" style="background-color: #fee;">
          <span class="stat-label">Zaległe:</span>
          <span class="stat-value" style="color: #dc2626;">${summary.totalOverdue.toFixed(2)} zł</span>
        </div>
        ` : ''}
      </div>
      
      <h2 style="color: #3b82f6;">Szczegóły płatności</h2>
      
      ${paymentsHtml}
      
      ${summary.nextDueDate ? `
      <div style="background-color: #dbeafe; padding: 15px; margin-top: 20px; border-radius: 8px;">
        <strong>Najbliższy termin płatności:</strong> ${new Date(summary.nextDueDate).toLocaleDateString('pl-PL')}
      </div>
      ` : ''}
      
      <p style="margin-top: 20px;">W razie pytań lub wątpliwości prosimy o kontakt.</p>
      
      <p>Pozdrawiamy,<br>
      Zespół księgowy</p>
    </div>
    
    <div class="footer">
      <p>To jest automatyczna wiadomość. Prosimy nie odpowiadać na ten email.</p>
    </div>
  </div>
</body>
</html>
  `;

  const emails = client.emails || [];
  const taxEmails = client.taxNotificationEmails || [];
  const invoiceEmail = client.invoiceEmail ? [client.invoiceEmail] : [];
  const allEmails = [...new Set([...emails, ...taxEmails, ...invoiceEmail])].filter(e => e);

  return {
    to: allEmails,
    subject,
    body,
    isHtml: true
  };
}

// Generate overdue payment notification
export function generateOverduePaymentEmail(
  client: Client,
  payment: Payment,
  daysOverdue: number
): EmailNotification {
  const clientName = `${client.firstName} ${client.lastName}`;
  const companyName = client.companyName ? ` (${client.companyName})` : '';
  const dueDate = new Date(payment.dueDate).toLocaleDateString('pl-PL');
  
  const subject = `PILNE: Zaległa płatność ${payment.type} - ${daysOverdue} dni opóźnienia`;
  
  const body = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
    .content { background-color: #f9fafb; padding: 20px; margin-top: 20px; border-radius: 8px; }
    .alert-box { background-color: #fee; padding: 15px; margin: 15px 0; border-left: 4px solid #dc2626; }
    .payment-details { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #dc2626; }
    .payment-row { display: flex; justify-content: space-between; margin: 10px 0; }
    .label { font-weight: bold; }
    .amount { font-size: 24px; color: #dc2626; font-weight: bold; }
    .urgent { color: #dc2626; font-weight: bold; }
    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ PILNE: Zaległa płatność</h1>
    </div>
    
    <div class="content">
      <p>Szanowny Panie/Pani ${clientName}${companyName},</p>
      
      <div class="alert-box">
        <strong class="urgent">UWAGA!</strong> Termin płatności minął ${daysOverdue} dni temu.
      </div>
      
      <p>Uprzejmie informujemy o zaległej płatności:</p>
      
      <div class="payment-details">
        <div class="payment-row">
          <span class="label">Typ płatności:</span>
          <span>${payment.type}</span>
        </div>
        <div class="payment-row">
          <span class="label">Okres:</span>
          <span>${payment.period}</span>
        </div>
        <div class="payment-row">
          <span class="label">Kwota:</span>
          <span class="amount">${payment.amount.toFixed(2)} zł</span>
        </div>
        <div class="payment-row">
          <span class="label">Termin płatności:</span>
          <span class="urgent">${dueDate}</span>
        </div>
        <div class="payment-row">
          <span class="label">Dni opóźnienia:</span>
          <span class="urgent">${daysOverdue} dni</span>
        </div>
      </div>
      
      <p><strong>Prosimy o pilną regulację należności.</strong></p>
      
      <p>W przypadku już dokonanej płatności prosimy o informację zwrotną.</p>
      
      <p>W razie pytań lub problemów z regulacją należności prosimy o pilny kontakt.</p>
      
      <p>Pozdrawiamy,<br>
      Zespół księgowy</p>
    </div>
    
    <div class="footer">
      <p>To jest automatyczna wiadomość. Prosimy nie odpowiadać na ten email.</p>
    </div>
  </div>
</body>
</html>
  `;

  const emails = client.emails || [];
  const taxEmails = client.taxNotificationEmails || [];
  const allEmails = [...new Set([...emails, ...taxEmails])].filter(e => e);

  return {
    to: allEmails,
    subject,
    body,
    isHtml: true
  };
}

// ================================================================================================
// EMAIL SENDING FUNCTIONS (Mock implementation - replace with actual email service)
// ================================================================================================

export async function sendPaymentEmail(notification: EmailNotification): Promise<boolean> {
  try {
    // In a real implementation, this would call your email service API
    // For now, we just log and return success
    console.log('Sending email:', {
      to: notification.to,
      subject: notification.subject,
      isHtml: notification.isHtml
    });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

// Batch send emails with rate limiting
export async function sendBatchPaymentEmails(
  notifications: EmailNotification[],
  delayMs: number = 1000
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;
  
  for (const notification of notifications) {
    const success = await sendPaymentEmail(notification);
    if (success) {
      sent++;
    } else {
      failed++;
    }
    
    // Rate limiting delay
    if (delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  return { sent, failed };
}
