import { z } from 'zod';

// Custom URL validator that's more secure than validator.isURL
const secureUrlValidation = (url: string) => {
  try {
    const urlObj = new URL(url);
    // Only allow http/https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return false;
    }
    // Reject malicious patterns
    if (
      url.includes('<') ||
      url.includes('>') ||
      url.includes('javascript:') ||
      url.includes('data:')
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

// Client validation schemas
export const clientSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  nip: z.string().regex(/^\d{10}$/, 'NIP must be 10 digits'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(9, 'Phone number is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  postalCode: z.string().regex(/^\d{2}-\d{3}$/, 'Postal code must be in format XX-XXX'),
  accountNumber: z.string().optional(),
  notes: z.string().optional(),
});

// User validation schemas
export const userSchema = z.object({
  id: z.string().optional(),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['admin', 'accountant', 'user']),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
});

// Login validation schema
export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

// Invoice validation schema
export const invoiceSchema = z.object({
  id: z.string().optional(),
  clientId: z.string().min(1, 'Client is required'),
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  issueDate: z.string().min(1, 'Issue date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  items: z.array(
    z.object({
      description: z.string().min(1, 'Description is required'),
      quantity: z.number().positive('Quantity must be positive'),
      unitPrice: z.number().positive('Unit price must be positive'),
      vatRate: z.number().min(0).max(100, 'VAT rate must be between 0 and 100'),
    })
  ),
  notes: z.string().optional(),
});

// Environment variable validation
export const envSchema = z.object({
  VITE_API_URL: z.string().refine(secureUrlValidation, 'Invalid API URL').optional(),
  VITE_WS_URL: z.string().refine(secureUrlValidation, 'Invalid WebSocket URL').optional(),
});

export type ClientInput = z.infer<typeof clientSchema>;
export type UserInput = z.infer<typeof userSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type InvoiceInput = z.infer<typeof invoiceSchema>;
