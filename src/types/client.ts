// ================================================================================================
// CLIENT AND BUSINESS ENTITY TYPES
// ================================================================================================

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface Owner {
  id: string;
  firstName: string;
  lastName: string;
  pesel?: string;
  share: number;
  role?: string;
  email?: string;
  phone?: string;
}

export interface ZUSInfo {
  startDate?: string;
  calculatedEndDate?: string;
  healthInsurance?: boolean;
  zusCode?: string;
  reminderDate?: string;
  nextPaymentDate?: string;
}

export interface CommunicationEmail {
  id: string;
  email: string;
  contactPerson?: {
    firstName: string;
    lastName: string;
  };
  isPrimary?: boolean;
  sendTaxNotifications?: boolean;
  purpose?: string;
}

// ================================================================================================
// AUTOMATIC INVOICING TYPES
// ================================================================================================

export interface AutoInvoiceItem {
  id?: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  unit?: string;
}

export interface AutoInvoicingSettings {
  enabled: boolean;
  frequency: 'monthly' | 'quarterly' | 'yearly' | 'weekly';
  amount: number;
  description: string;
  nextInvoiceDate?: string;
  vatRate: number;
  paymentTerms: number; // days
  invoiceTemplate?: string;
  items: AutoInvoiceItem[];
  // Employee-based pricing
  employeePricing: {
    enabled: boolean;
    rates: {
      [employeeType: string]: number; // e.g., 'manager': 200, 'specialist': 150, 'assistant': 100
    };
  };
  // Document limits and pricing
  documentsLimit: number;
  documentsLimitWarning: boolean;
  documentsOverLimitPrice: number; // price per document over limit
  // Other limits
  maxHoursPerMonth?: number;
  maxDocumentsPerMonth?: number;
  additionalServices?: string[];
  notes?: string;
  created?: string;
  lastModified?: string;
}

// ================================================================================================
// CLIENT TYPE
// ================================================================================================

export interface Client {
  id: string;
  firstName?: string;
  lastName?: string;
  company?: string; // Legacy field, maps to companyName
  companyName?: string;
  position?: string;
  emails?: string[];
  phone?: string;
  nip?: string;
  regon?: string;
  krs?: string;
  address?: Address;
  status: 'aktualny' | 'potencjalny' | 'archiwalny' | 'nieaktywny';
  dateAdded: string;
  lastContact?: string;
  notes?: string;
  additionalInfo?: string;
  
  // Business and tax information
  businessType?: string;
  taxType?: string;
  accountingType?: string;
  zusType?: string;
  zusTypeOther?: string;
  zusInfo?: ZUSInfo;
  
  // Ownership and contacts
  owners?: Owner[];
  employeeCount?: number;
  
  // Communication
  communicationEmails?: CommunicationEmail[];
  invoiceEmail?: string;
  taxNotificationEmails?: string[];
  emailFolders?: string[];
  emailTemplates?: EmailTemplate[];
  
  // System fields
  ksefEnabled?: boolean;
  ksefToken?: string;
  hiddenTags?: string[];
  
  // AUTOMATIC INVOICING SETTINGS
  autoInvoicing?: AutoInvoicingSettings;
}

// ================================================================================================
// OTHER BUSINESS TYPES
// ================================================================================================

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  avatar?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
  lastSeen?: string;
  position?: string;
  phone?: string;
  isActive?: boolean;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
  isActive: boolean;
  variables?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface Email {
  id: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  isHtml?: boolean;
  priority?: 'low' | 'normal' | 'high';
  status: 'draft' | 'queued' | 'sent' | 'failed';
  scheduledFor?: string;
  sentAt?: string;
  attachments?: EmailAttachment[];
  templateId?: string;
  clientId?: string;
  metadata?: Record<string, any>;
}

export interface EmailAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
  data?: string; // base64 encoded data
}

// ================================================================================================
// INVOICE TYPES
// ================================================================================================

export interface InvoiceItem {
  id?: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  unit?: string;
  discount?: number;
  netAmount?: number;
  taxAmount?: number;
  grossAmount?: number;
}

export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  issueDate: string;
  dueDate: string;
  saleDate?: string;
  items: InvoiceItem[];
  totalNet?: number;
  totalTax?: number;
  totalGross?: number;
  paidAmount?: number;
  status: 'draft' | 'created' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  paymentMethod?: string;
  notes?: string;
  paymentReference?: string;
  bankAccount?: string;
  createdAt?: string;
  sentAt?: string;
  paidAt?: string;
  // For automatic invoicing
  isAutoGenerated?: boolean;
  autoInvoiceRuleId?: string;
}

// ================================================================================================
// CALENDAR AND CHAT TYPES
// ================================================================================================

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  allDay?: boolean;
  clientId?: string;
  userId?: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  location?: string;
  attendees?: string[];
  isRecurring?: boolean;
  recurrencePattern?: string;
  parentEventId?: string;
  reminders?: number[];
  metadata?: Record<string, any>;
}

export type CalendarView = 'month' | 'week' | 'day' | 'agenda';

export interface ChatMessage {
  id: string;
  channelId?: string;
  conversationId?: string;
  senderId: string;
  senderName?: string;
  content: string;
  timestamp: string;
  type?: 'text' | 'file' | 'image' | 'system';
  attachments?: EmailAttachment[];
  isEdited?: boolean;
  editedAt?: string;
  replyToId?: string;
  reactions?: Record<string, string[]>; // emoji -> user ids
  isRead?: boolean;
  readBy?: string[];
}

export interface ChatChannel {
  id: string;
  name: string;
  description?: string;
  type: 'public' | 'private' | 'direct';
  members: string[];
  createdBy: string;
  createdAt: string;
  lastMessageId?: string;
  lastMessageAt?: string;
  isArchived?: boolean;
  metadata?: Record<string, any>;
}

export interface ChatChannelOld {
  id: string;
  name: string;
  type: 'general' | 'project' | 'client' | 'private';
  participants: string[];
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

export interface PrivateMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  attachments?: EmailAttachment[];
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: ChatMessage;
  lastMessageAt?: string;
  unreadCount?: number;
  type: 'direct' | 'group';
  name?: string;
  createdAt: string;
}

// ================================================================================================
// LEGACY AND FORM TYPES
// ================================================================================================

export interface ClientFormData {
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  phone: string;
  address: Address;
  businessType: string;
  taxType: string;
  notes: string;
  // Extended fields for full client form
  emails?: string[];
  company?: string;
  position?: string;
  nip?: string;
  regon?: string;
  krs?: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  status?: string;
  tags?: string;
  // Business information
  accountingType?: string;
  zusType?: string;
  // Email settings
  invoiceEmail?: string;
  taxNotificationEmails?: string[];
  // Automatic invoicing settings
  autoInvoicing?: AutoInvoicingSettings;
}

export interface CompanyOwner {
  id?: string;
  firstName: string;
  lastName: string;
  share: number;
  role?: string;
  email?: string;
  phone?: string;
  pesel?: string;
}

export interface CEIDGCompanyData {
  nazwa: string;
  nip: string;
  regon?: string;
  adres: string;
  status: string;
  dataRozpoczecia?: string;
  pkd?: string[];
  wlasciciel?: {
    imie: string;
    nazwisko: string;
  };
}

// ================================================================================================
// SYSTEM AND PERMISSION TYPES
// ================================================================================================

export interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
  level: 'read' | 'write' | 'delete' | 'admin';
}

export interface Company {
  id: string;
  name: string;
  description?: string;
  address?: Address;
  nip?: string;
  regon?: string;
  krs?: string;
  website?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  managerId?: string;
  companyId: string;
  isActive: boolean;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
    dateFormat: string;
    timeFormat: string;
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
  };
  permissions?: ModulePermission[];
  smtpSettings?: SMTPSettings;
  signature?: string;
  avatar?: string;
  bio?: string;
  socialLinks?: Record<string, string>;
  updatedAt: string;
}

export interface SMTPSettings {
  id: string;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password?: string;
  fromName: string;
  fromEmail: string;
  isDefault: boolean;
  isActive: boolean;
  testMode: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ModulePermission {
  module: string;
  permissions: {
    read: boolean;
    write: boolean;
    delete: boolean;
    admin: boolean;
  };
  restrictions?: Record<string, boolean>;
  description?: string;
}