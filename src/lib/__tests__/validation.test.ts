import { describe, it, expect } from 'vitest';
import { clientSchema, userSchema, loginSchema, invoiceSchema } from '../validation';

describe('Validation Schemas', () => {
  describe('clientSchema', () => {
    it('should validate a correct client', () => {
      const validClient = {
        name: 'Test Company',
        nip: '1234567890',
        email: 'test@example.com',
        phone: '123456789',
        address: 'Test Street 1',
        city: 'Warsaw',
        postalCode: '00-001',
      };

      const result = clientSchema.safeParse(validClient);
      expect(result.success).toBe(true);
    });

    it('should reject invalid NIP', () => {
      const invalidClient = {
        name: 'Test Company',
        nip: '123', // Too short
        email: 'test@example.com',
        phone: '123456789',
        address: 'Test Street 1',
        city: 'Warsaw',
        postalCode: '00-001',
      };

      const result = clientSchema.safeParse(invalidClient);
      expect(result.success).toBe(false);
    });

    it('should reject invalid postal code', () => {
      const invalidClient = {
        name: 'Test Company',
        nip: '1234567890',
        email: 'test@example.com',
        phone: '123456789',
        address: 'Test Street 1',
        city: 'Warsaw',
        postalCode: '00001', // Wrong format
      };

      const result = clientSchema.safeParse(invalidClient);
      expect(result.success).toBe(false);
    });
  });

  describe('userSchema', () => {
    it('should validate a correct user', () => {
      const validUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'securePassword123',
        role: 'user' as const,
        firstName: 'John',
        lastName: 'Doe',
      };

      const result = userSchema.safeParse(validUser);
      expect(result.success).toBe(true);
    });

    it('should reject weak password', () => {
      const invalidUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'weak', // Too short
        role: 'user' as const,
        firstName: 'John',
        lastName: 'Doe',
      };

      const result = userSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });

    it('should reject invalid role', () => {
      const invalidUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'securePassword123',
        role: 'superadmin', // Invalid role
        firstName: 'John',
        lastName: 'Doe',
      };

      const result = userSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('should validate login credentials', () => {
      const validLogin = {
        username: 'testuser',
        password: 'password123',
      };

      const result = loginSchema.safeParse(validLogin);
      expect(result.success).toBe(true);
    });

    it('should reject empty username', () => {
      const invalidLogin = {
        username: '',
        password: 'password123',
      };

      const result = loginSchema.safeParse(invalidLogin);
      expect(result.success).toBe(false);
    });
  });

  describe('invoiceSchema', () => {
    it('should validate a correct invoice', () => {
      const validInvoice = {
        clientId: '123',
        invoiceNumber: 'INV-2024-001',
        issueDate: '2024-01-15',
        dueDate: '2024-02-15',
        items: [
          {
            description: 'Service',
            quantity: 1,
            unitPrice: 100,
            vatRate: 23,
          },
        ],
      };

      const result = invoiceSchema.safeParse(validInvoice);
      expect(result.success).toBe(true);
    });

    it('should reject negative quantity', () => {
      const invalidInvoice = {
        clientId: '123',
        invoiceNumber: 'INV-2024-001',
        issueDate: '2024-01-15',
        dueDate: '2024-02-15',
        items: [
          {
            description: 'Service',
            quantity: -1, // Invalid
            unitPrice: 100,
            vatRate: 23,
          },
        ],
      };

      const result = invoiceSchema.safeParse(invalidInvoice);
      expect(result.success).toBe(false);
    });

    it('should reject invalid VAT rate', () => {
      const invalidInvoice = {
        clientId: '123',
        invoiceNumber: 'INV-2024-001',
        issueDate: '2024-01-15',
        dueDate: '2024-02-15',
        items: [
          {
            description: 'Service',
            quantity: 1,
            unitPrice: 100,
            vatRate: 150, // Too high
          },
        ],
      };

      const result = invoiceSchema.safeParse(invalidInvoice);
      expect(result.success).toBe(false);
    });
  });
});
