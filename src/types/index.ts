// ================================================================================================
// TYPE EXPORTS - Central export file for all type definitions
// ================================================================================================

// Client and Business Entity Types
export type {
  Address,
  Owner,
  ZUSInfo,
  CommunicationEmail,
  AutoInvoiceItem,
  AutoInvoicingSettings,
  Client,
  User,
  EmailTemplate,
  Email,
  EmailAttachment,
  InvoiceItem,
  Invoice,
  CalendarEvent,
  CalendarView,
  ChatMessage,
  ChatChannel,
  ChatChannelOld,
  PrivateMessage,
  Conversation,
  ClientFormData,
  CompanyOwner,
  CEIDGCompanyData,
  Permission,
  Company,
  Department,
  UserProfile,
  SMTPSettings,
  ModulePermission,
} from './client';

// Payment Types
export type {
  PaymentType,
  PaymentStatus,
  Payment,
  PaymentSummary,
  PaymentReminder,
  PaymentConfig,
} from './payment';

// Payment helper functions
export {
  DEFAULT_PAYMENT_CONFIG,
  calculateVATDueDate,
  calculatePIT4DueDate,
  calculateZUSDueDate,
  isPaymentOverdue,
  getDaysUntilDue,
  shouldSendReminder,
} from './payment';
