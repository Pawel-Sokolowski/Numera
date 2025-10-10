# Enhanced Form Generation & Payment Tracking Integration Guide

This guide explains how to integrate and use the new comprehensive form generation and payment tracking features.

## Table of Contents
1. [Form Generation System](#form-generation-system)
2. [Payment Tracking System](#payment-tracking-system)
3. [Email Notification System](#email-notification-system)
4. [Integration Steps](#integration-steps)
5. [API Reference](#api-reference)

---

## Form Generation System

### Overview
The enhanced form generation system supports 20+ Polish tax forms with intelligent pre-filling based on form complexity.

### Supported Forms

#### Pełnomocnictwa (Authorization Forms)
- **UPL-1** - Pełnomocnictwo do Urzędu Skarbowego
  - **Implementation**: Uses official PDF template with pdf-lib for coordinate-based filling
  - **Template**: `/public/upl-1_06-08-2.pdf`
  - **See**: [UPL1_COORDINATE_GUIDE.md](./UPL1_COORDINATE_GUIDE.md) for coordinate adjustment
- **PEL** - Pełnomocnictwo do ZUS

#### PIT Forms (Personal Income Tax)
- **PIT-36** - Zeznanie roczne od przychodów z działalności gospodarczej (Complex)
- **PIT-37** - Zeznanie roczne o wysokości osiągniętego dochodu (Complex)
- **PIT-4R** - Zeznanie roczne o zryczałtowanym podatku dochodowym (Medium)
- **PIT-11** - Informacja o dochodach wypłaconych osobom fizycznym (Medium)

#### VAT Forms
- **VAT-7** - Deklaracja VAT miesięczna (Medium)
- **VAT-7K** - Deklaracja VAT kwartalna (Medium)
- **VAT-R** - Rejestracja jako podatnik VAT (Simple)
- **VAT-UE** - Informacja podsumowująca o transakcjach wewnątrzunijnych (Medium)

#### CIT Forms (Corporate Income Tax)
- **CIT-8** - Zeznanie roczne o wysokości dochodu (Complex)

#### ZUS Forms (Social Insurance)
- **ZUS-DRA** - Raport miesięczny rozliczeniowy (Medium)
- **ZUS-RCA** - Imienne raporty miesięczne rozliczeniowe (Medium)
- **ZUS-ZWUA** - Zgłoszenie do ubezpieczeń (Simple)
- **ZUS-RMUA** - Zgłoszenie zmiany danych (Simple)

#### JPK Files (Standard Audit File)
- **JPK_VAT** - Jednolity Plik Kontrolny VAT (Complex)
- **JPK_FA** - Jednolity Plik Kontrolny Faktura (Complex)
- **JPK_KR** - Jednolity Plik Kontrolny Księgi Rachunkowe (Complex)

#### Other Forms
- **ZAW-FA** - Zawiadomienie o wyborze formy opodatkowania (Simple)

### Form Complexity Levels

- **Simple**: Basic client and employee information only
  - Examples: ZAW-FA, VAT-R, ZUS-ZWUA, ZUS-RMUA
  
- **Medium**: Extended information with additional fields
  - Examples: PIT-4R, PIT-11, VAT-7, VAT-7K, ZUS-DRA, ZUS-RCA
  
- **Complex**: Comprehensive data including all available client information
  - Examples: PIT-36, PIT-37, CIT-8, JPK forms

### Usage Example

```typescript
import { AuthorizationFormGenerator } from './utils/authorizationFormGenerator';
import { Client, User } from './types/client';

// Initialize generator
const generator = new AuthorizationFormGenerator();

// Generate and download form (async)
await generator.downloadForm({
  client: clientData,
  employee: employeeData,
  formType: 'UPL-1',  // Uses official PDF template
  additionalData: {
    startDate: '01.10.2024',
    endDate: '31.12.2024',
    taxOffice: 'US Warszawa Śródmieście'
  }
});

// Or generate as blob for custom handling
const blob = await generator.generateForm({
  client: clientData,
  employee: employeeData,
  formType: 'PIT-36',
  additionalData: {
    period: '01/2024',
    taxOffice: 'US Warszawa Śródmieście'
  }
});
```

### Using the UI Component

```typescript
import { AuthorizationFormDialog } from './components/AuthorizationFormDialog';

<AuthorizationFormDialog
  isOpen={isDialogOpen}
  onClose={() => setIsDialogOpen(false)}
  clients={clientsList}
  employees={employeesList}
  preSelectedClientId={selectedClientId}
/>
```

The dialog provides:
- Categorized form selection with tabs
- Complexity indicators (badges)
- Form descriptions and required fields
- Smart client and employee selection

---

## Payment Tracking System

### Overview
Comprehensive payment tracking for VAT, PIT-4, ZUS, CIT, and other tax obligations with automatic due date calculation.

### Features

1. **Payment Types**
   - VAT - Due on 25th of following month
   - PIT-4 - Due on 20th of following month
   - ZUS - Due on 20th of following month
   - CIT - Quarterly payments
   - OTHER - Custom payments

2. **Payment Status**
   - Pending - Not yet paid
   - Paid - Payment completed
   - Overdue - Past due date (with grace period)
   - Cancelled - Payment cancelled

3. **Automatic Features**
   - Due date calculation based on payment type
   - Overdue detection with configurable grace period
   - Payment summaries by client
   - Statistics dashboard

### Using the Payment Tracking Component

```typescript
import { PaymentTrackingPanel } from './components/PaymentTrackingPanel';

<PaymentTrackingPanel clients={clientsList} />
```

### Payment Configuration

```typescript
import { DEFAULT_PAYMENT_CONFIG } from './types/payment';

// Customize payment configuration
const customConfig = {
  ...DEFAULT_PAYMENT_CONFIG,
  vatPaymentDay: 25,
  zusPaymentDay: 20,
  pit4PaymentDay: 20,
  reminderDaysBefore: [7, 3, 1],
  gracePeriodDays: 3
};
```

### Working with Payments Programmatically

```typescript
import { 
  calculateVATDueDate,
  calculatePIT4DueDate,
  calculateZUSDueDate,
  isPaymentOverdue,
  getDaysUntilDue
} from './types/payment';

// Calculate due dates
const vatDue = calculateVATDueDate('01/2024'); // "2024-02-25"
const zusDue = calculateZUSDueDate('01/2024'); // "2024-02-20"

// Check payment status
const isOverdue = isPaymentOverdue('2024-01-15', 3); // true/false
const daysUntil = getDaysUntilDue('2024-02-25'); // number of days
```

---

## Email Notification System

### Overview
Automated email notification system with professional HTML templates for payment reminders and summaries.

### Email Types

1. **Payment Reminders**
   - Sent based on days until due date
   - Urgency indicators for imminent payments
   - Color-coded based on urgency

2. **Monthly Payment Summaries**
   - Comprehensive breakdown by payment type
   - Statistics (total, paid, pending, overdue)
   - Next due date information

3. **Overdue Payment Notifications**
   - Urgent formatting with warnings
   - Days overdue calculation
   - Highlighted payment details

### Using the Email Service

```typescript
import {
  generatePaymentReminderEmail,
  generateMonthlySummaryEmail,
  generateOverduePaymentEmail,
  sendPaymentEmail
} from './utils/paymentEmailService';

// Generate and send payment reminder
const reminderEmail = generatePaymentReminderEmail(
  client,
  payment,
  daysUntilDue
);
await sendPaymentEmail(reminderEmail);

// Generate and send monthly summary
const summaryEmail = generateMonthlySummaryEmail(client, paymentSummary);
await sendPaymentEmail(summaryEmail);

// Generate overdue notification
const overdueEmail = generateOverduePaymentEmail(
  client,
  payment,
  daysOverdue
);
await sendPaymentEmail(overdueEmail);
```

### Email Configuration

The email service uses client email addresses from:
- `client.emails` - Primary email addresses
- `client.taxNotificationEmails` - Tax-specific emails
- `client.invoiceEmail` - Invoice email (for summaries)

### Customizing Email Templates

Email templates are generated in `src/utils/paymentEmailService.ts`. To customize:

1. Modify the HTML templates in the generation functions
2. Update styling in the `<style>` section
3. Add additional data fields as needed

---

## Integration Steps

### Step 1: Add to App Navigation

```typescript
// In App.tsx
const PaymentTrackingPanel = lazy(() => 
  import("./components/PaymentTrackingPanel").then(
    module => ({ default: module.PaymentTrackingPanel })
  )
);

// Add to view types
type View = 'dashboard' | 'clients' | ... | 'payment-tracking';

// Add to sidebar
<SidebarMenuItem>
  <SidebarMenuButton onClick={() => setCurrentView('payment-tracking')}>
    <CreditCard className="mr-2 h-4 w-4" />
    Płatności
  </SidebarMenuButton>
</SidebarMenuItem>

// Add to view rendering
{currentView === 'payment-tracking' && (
  <Suspense fallback={<LoadingSpinner />}>
    <PaymentTrackingPanel clients={clients} />
  </Suspense>
)}
```

### Step 2: Configure Email Backend

Replace the mock implementation in `paymentEmailService.ts`:

```typescript
export async function sendPaymentEmail(
  notification: EmailNotification
): Promise<boolean> {
  try {
    // Replace with your email service API
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notification)
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}
```

### Step 3: Set Up Automated Reminders

Create a cron job or scheduled task:

```typescript
// Example: Daily reminder check
import { shouldSendReminder, DEFAULT_PAYMENT_CONFIG } from './types/payment';

async function checkAndSendReminders() {
  const payments = await fetchPendingPayments();
  const config = DEFAULT_PAYMENT_CONFIG;
  
  for (const payment of payments) {
    const daysUntil = getDaysUntilDue(payment.dueDate);
    
    if (shouldSendReminder(payment.dueDate, config.reminderDaysBefore)) {
      const client = await fetchClient(payment.clientId);
      const email = generatePaymentReminderEmail(client, payment, daysUntil);
      await sendPaymentEmail(email);
    }
  }
}

// Run daily at 9 AM
schedule('0 9 * * *', checkAndSendReminders);
```

---

## API Reference

### Form Generation

#### `AuthorizationFormGenerator`

**Constructor**
```typescript
constructor()
```

**Methods**

- `generateForm(data: AuthorizationFormData): Blob`
  - Generates form and returns as Blob
  
- `downloadForm(data: AuthorizationFormData): void`
  - Generates and downloads form automatically

**Types**

```typescript
interface AuthorizationFormData {
  client: Client;
  employee: User;
  formType: FormType;
  additionalData?: {
    period?: string;
    year?: string;
    taxOffice?: string;
    accountNumber?: string;
    [key: string]: any;
  };
}

type FormType = 'UPL-1' | 'PEL' | 'ZAW-FA' | 'PIT-36' | 'PIT-37' 
  | 'PIT-4R' | 'PIT-11' | 'VAT-7' | 'VAT-7K' | 'VAT-R' | 'VAT-UE' 
  | 'CIT-8' | 'ZUS-DRA' | 'ZUS-RCA' | 'ZUS-ZWUA' | 'ZUS-RMUA' 
  | 'JPK_VAT' | 'JPK_FA' | 'JPK_KR';
```

#### `FORM_METADATA`

Registry of all available forms with metadata:

```typescript
interface FormMetadata {
  type: FormType;
  name: string;
  description: string;
  complexity: FormComplexity;
  category: FormCategory;
  requiredFields: string[];
  optionalFields: string[];
}
```

### Payment Tracking

#### Types

```typescript
interface Payment {
  id: string;
  clientId: string;
  type: PaymentType;
  amount: number;
  dueDate: string;
  status: PaymentStatus;
  period: string;
  paymentDate?: string;
  notes?: string;
  reminderSent?: boolean;
  reminderSentDate?: string;
}

interface PaymentSummary {
  clientId: string;
  period: string;
  payments: Payment[];
  totalAmount: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  nextDueDate?: string;
  lastPaymentDate?: string;
}

interface PaymentConfig {
  enableAutomaticReminders: boolean;
  reminderDaysBefore: number[];
  vatPaymentDay: number;
  pit4PaymentDay: number;
  zusPaymentDay: number;
  zusHealthInsuranceDay: number;
  citQuarterlyPaymentDay: number;
  gracePeriodDays: number;
}
```

#### Utility Functions

- `calculateVATDueDate(period: string): string`
- `calculatePIT4DueDate(period: string): string`
- `calculateZUSDueDate(period: string): string`
- `isPaymentOverdue(dueDate: string, gracePeriodDays?: number): boolean`
- `getDaysUntilDue(dueDate: string): number`
- `shouldSendReminder(dueDate: string, reminderDaysBefore: number[]): boolean`

### Email Service

#### Functions

- `generatePaymentReminderEmail(client: Client, payment: Payment, daysUntilDue: number): EmailNotification`
- `generateMonthlySummaryEmail(client: Client, summary: PaymentSummary): EmailNotification`
- `generateOverduePaymentEmail(client: Client, payment: Payment, daysOverdue: number): EmailNotification`
- `sendPaymentEmail(notification: EmailNotification): Promise<boolean>`
- `sendBatchPaymentEmails(notifications: EmailNotification[], delayMs?: number): Promise<{ sent: number; failed: number }>`

#### Types

```typescript
interface EmailNotification {
  to: string[];
  subject: string;
  body: string;
  isHtml: boolean;
  attachments?: any[];
}
```

---

## Best Practices

1. **Form Generation**
   - Always validate client data before generating forms
   - Use appropriate form complexity for the situation
   - Include additional data when available for better form completion

2. **Payment Tracking**
   - Set up automated reminders at 7, 3, and 1 day intervals
   - Configure grace period appropriate for your business (default: 3 days)
   - Regularly review overdue payments

3. **Email Notifications**
   - Test email templates before deploying to production
   - Use rate limiting when sending batch emails (default: 1 second between emails)
   - Monitor email delivery success rates
   - Keep email content professional and clear

4. **Data Management**
   - Regularly backup payment data
   - Archive old payments to maintain performance
   - Keep payment history for auditing purposes

---

## Troubleshooting

### Forms not generating correctly
- Check that all required client fields are populated
- Verify formType matches one of the supported types
- Ensure jsPDF library is properly loaded

### Emails not sending
- Verify email service configuration
- Check client email addresses are valid
- Review email service logs for errors
- Ensure rate limiting is not too aggressive

### Payment due dates incorrect
- Verify period format is "MM/YYYY"
- Check PaymentConfig values
- Ensure timezone handling is correct

---

## Future Enhancements

Potential features for future versions:

1. XML generation for JPK files (currently only PDF confirmations)
2. E-signature integration for forms
3. Direct submission to government portals
4. Payment gateway integration
5. Advanced analytics and reporting
6. Multi-language support
7. Mobile app companion

---

## Support

For questions or issues:
1. Check this documentation
2. Review code comments in source files
3. Contact development team
4. Submit issue on GitHub repository
