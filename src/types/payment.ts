// ================================================================================================
// PAYMENT TRACKING TYPES
// ================================================================================================

export type PaymentType = 'VAT' | 'PIT-4' | 'ZUS' | 'CIT' | 'OTHER';
export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';

export interface Payment {
  id: string;
  clientId: string;
  type: PaymentType;
  amount: number;
  dueDate: string;
  status: PaymentStatus;
  period: string; // e.g., "01/2024"
  paymentDate?: string;
  notes?: string;
  reminderSent?: boolean;
  reminderSentDate?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PaymentSummary {
  clientId: string;
  period: string; // e.g., "01/2024"
  payments: Payment[];
  totalAmount: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  nextDueDate?: string;
  lastPaymentDate?: string;
}

export interface PaymentReminder {
  id: string;
  paymentId: string;
  clientId: string;
  sentDate: string;
  emailSent: boolean;
  reminderType: 'initial' | 'follow-up' | 'final';
  daysBeforeDue: number;
}

// ================================================================================================
// PAYMENT TRACKING CONFIGURATION
// ================================================================================================

export interface PaymentConfig {
  // Automatic reminders
  enableAutomaticReminders: boolean;
  reminderDaysBefore: number[]; // e.g., [7, 3, 1] days before due date
  
  // VAT payment configuration
  vatPaymentDay: number; // Day of month (default: 25)
  
  // PIT-4 payment configuration
  pit4PaymentDay: number; // Day of month (default: 20)
  
  // ZUS payment configuration
  zusPaymentDay: number; // Day of month (default: 20)
  zusHealthInsuranceDay: number; // Day of month (default: 10)
  
  // CIT payment configuration
  citQuarterlyPaymentDay: number; // Day of month (default: 20)
  
  // Grace period
  gracePeriodDays: number; // Days after due date before marked overdue
}

export const DEFAULT_PAYMENT_CONFIG: PaymentConfig = {
  enableAutomaticReminders: true,
  reminderDaysBefore: [7, 3, 1],
  vatPaymentDay: 25,
  pit4PaymentDay: 20,
  zusPaymentDay: 20,
  zusHealthInsuranceDay: 10,
  citQuarterlyPaymentDay: 20,
  gracePeriodDays: 3
};

// ================================================================================================
// PAYMENT SCHEDULE HELPERS
// ================================================================================================

export function calculateVATDueDate(period: string): string {
  const [month, year] = period.split('/');
  const date = new Date(parseInt(year), parseInt(month), DEFAULT_PAYMENT_CONFIG.vatPaymentDay);
  return date.toISOString().split('T')[0];
}

export function calculatePIT4DueDate(period: string): string {
  const [month, year] = period.split('/');
  const date = new Date(parseInt(year), parseInt(month), DEFAULT_PAYMENT_CONFIG.pit4PaymentDay);
  return date.toISOString().split('T')[0];
}

export function calculateZUSDueDate(period: string): string {
  const [month, year] = period.split('/');
  const date = new Date(parseInt(year), parseInt(month), DEFAULT_PAYMENT_CONFIG.zusPaymentDay);
  return date.toISOString().split('T')[0];
}

export function isPaymentOverdue(dueDate: string, gracePeriodDays: number = DEFAULT_PAYMENT_CONFIG.gracePeriodDays): boolean {
  const due = new Date(dueDate);
  const grace = new Date(due.getTime() + gracePeriodDays * 24 * 60 * 60 * 1000);
  return new Date() > grace;
}

export function getDaysUntilDue(dueDate: string): number {
  const due = new Date(dueDate);
  const now = new Date();
  const diff = due.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function shouldSendReminder(dueDate: string, reminderDaysBefore: number[]): boolean {
  const daysUntil = getDaysUntilDue(dueDate);
  return reminderDaysBefore.includes(daysUntil);
}
