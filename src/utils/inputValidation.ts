/**
 * Comprehensive Input Validation Utilities
 * 
 * Provides secure input validation for all form fields and API endpoints.
 * Includes Polish-specific validators for tax numbers, addresses, etc.
 */

// Email validation with Polish domain support
export const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 255;
};

// Polish NIP (Tax Identification Number) validation
export const validateNIP = (nip: string): boolean => {
  if (!nip || typeof nip !== 'string') return false;
  
  const cleanNip = nip.replace(/[\s-]/g, '');
  if (!/^\d{10}$/.test(cleanNip)) return false;
  
  // NIP checksum validation
  const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
  const digits = cleanNip.split('').map(Number);
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * weights[i];
  }
  
  const checksum = sum % 11;
  return checksum === digits[9] || (checksum === 10 && digits[9] === 0);
};

// Polish REGON (Business Registry Number) validation
export const validateREGON = (regon: string): boolean => {
  if (!regon || typeof regon !== 'string') return false;
  
  const cleanRegon = regon.replace(/[\s-]/g, '');
  if (!/^\d{9,14}$/.test(cleanRegon)) return false;
  
  // REGON checksum validation (simplified)
  if (cleanRegon.length === 9) {
    const weights = [8, 9, 2, 3, 4, 5, 6, 7];
    const digits = cleanRegon.split('').map(Number);
    
    let sum = 0;
    for (let i = 0; i < 8; i++) {
      sum += digits[i] * weights[i];
    }
    
    const checksum = sum % 11;
    return checksum === digits[8] || (checksum === 10 && digits[8] === 0);
  }
  
  // For 14-digit REGON, basic format validation
  return cleanRegon.length === 14;
};

// Polish PESEL (Personal Identification Number) validation
export const validatePESEL = (pesel: string): boolean => {
  if (!pesel || typeof pesel !== 'string') return false;
  
  const cleanPesel = pesel.replace(/[\s-]/g, '');
  if (!/^\d{11}$/.test(cleanPesel)) return false;
  
  // PESEL checksum validation
  const weights = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3];
  const digits = cleanPesel.split('').map(Number);
  
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += digits[i] * weights[i];
  }
  
  const checksum = (10 - (sum % 10)) % 10;
  return checksum === digits[10];
};

// Polish postal code validation
export const validatePostalCode = (postalCode: string): boolean => {
  if (!postalCode || typeof postalCode !== 'string') return false;
  return /^\d{2}-\d{3}$/.test(postalCode);
};

// Phone number validation (Polish format)
export const validatePhoneNumber = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') return false;
  
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Polish phone number patterns
  const patterns = [
    /^48\d{9}$/, // +48XXXXXXXXX
    /^\d{9}$/,   // XXXXXXXXX
    /^\d{3}-\d{3}-\d{3}$/ // XXX-XXX-XXX
  ];
  
  return patterns.some(pattern => pattern.test(cleanPhone)) || /^[\+]?[\d\s\-\(\)]{9,15}$/.test(phone);
};

// Name validation (Polish characters support)
export const validateName = (name: string): boolean => {
  if (!name || typeof name !== 'string') return false;
  
  const trimmedName = name.trim();
  if (trimmedName.length < 2 || trimmedName.length > 100) return false;
  
  // Allow Polish characters, spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s\-']+$/;
  return nameRegex.test(trimmedName);
};

// Company name validation
export const validateCompanyName = (companyName: string): boolean => {
  if (!companyName || typeof companyName !== 'string') return false;
  
  const trimmedName = companyName.trim();
  return trimmedName.length >= 2 && trimmedName.length <= 200;
};

// Address validation
export const validateAddress = (address: string): boolean => {
  if (!address || typeof address !== 'string') return false;
  
  const trimmedAddress = address.trim();
  return trimmedAddress.length >= 5 && trimmedAddress.length <= 200;
};

// City validation
export const validateCity = (city: string): boolean => {
  if (!city || typeof city !== 'string') return false;
  
  const trimmedCity = city.trim();
  return trimmedCity.length >= 2 && trimmedCity.length <= 100;
};

// Password validation
export const validatePassword = (password: string): boolean => {
  if (!password || typeof password !== 'string') return false;
  
  // At least 8 characters, max 128
  if (password.length < 8 || password.length > 128) return false;
  
  // At least one uppercase, one lowercase, one number
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  
  return hasUpperCase && hasLowerCase && hasNumbers;
};

// Date validation (YYYY-MM-DD format)
export const validateDate = (date: string): boolean => {
  if (!date || typeof date !== 'string') return false;
  
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;
  
  const parsedDate = new Date(date);
  return parsedDate instanceof Date && !isNaN(parsedDate.getTime());
};

// Number validation
export const validateNumber = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  
  const num = Number(value);
  return !isNaN(num) && isFinite(num);
};

// Positive number validation
export const validatePositiveNumber = (value: any): boolean => {
  return validateNumber(value) && Number(value) > 0;
};

// Sanitize string input
export const sanitizeString = (input: any): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[<>'"&]/g, ''); // Remove dangerous characters
};

// Sanitize HTML content
export const sanitizeHtml = (html: string): string => {
  if (typeof html !== 'string') return '';
  
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

// Validate form data object
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateFormData = (data: Record<string, any>, schema: Record<string, any>): ValidationResult => {
  const errors: string[] = [];
  
  for (const [fieldName, rules] of Object.entries(schema)) {
    const value = data[fieldName];
    
    // Check required fields
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`${fieldName} is required`);
      continue;
    }
    
    // Skip validation for empty optional fields
    if (!rules.required && (value === undefined || value === null || value === '')) {
      continue;
    }
    
    // Validate based on type
    if (rules.type === 'email' && !validateEmail(value)) {
      errors.push(`${fieldName} must be a valid email address`);
    } else if (rules.type === 'nip' && !validateNIP(value)) {
      errors.push(`${fieldName} must be a valid NIP number`);
    } else if (rules.type === 'regon' && !validateREGON(value)) {
      errors.push(`${fieldName} must be a valid REGON number`);
    } else if (rules.type === 'pesel' && !validatePESEL(value)) {
      errors.push(`${fieldName} must be a valid PESEL number`);
    } else if (rules.type === 'phone' && !validatePhoneNumber(value)) {
      errors.push(`${fieldName} must be a valid phone number`);
    } else if (rules.type === 'name' && !validateName(value)) {
      errors.push(`${fieldName} must be a valid name`);
    } else if (rules.type === 'postalCode' && !validatePostalCode(value)) {
      errors.push(`${fieldName} must be a valid postal code (XX-XXX)`);
    } else if (rules.type === 'date' && !validateDate(value)) {
      errors.push(`${fieldName} must be a valid date (YYYY-MM-DD)`);
    } else if (rules.type === 'number' && !validateNumber(value)) {
      errors.push(`${fieldName} must be a valid number`);
    } else if (rules.type === 'positiveNumber' && !validatePositiveNumber(value)) {
      errors.push(`${fieldName} must be a positive number`);
    }
    
    // Check length constraints
    if (rules.minLength && value.length < rules.minLength) {
      errors.push(`${fieldName} must be at least ${rules.minLength} characters long`);
    }
    
    if (rules.maxLength && value.length > rules.maxLength) {
      errors.push(`${fieldName} must be no more than ${rules.maxLength} characters long`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Common validation schemas
export const validationSchemas = {
  client: {
    firstName: { required: true, type: 'name', minLength: 2, maxLength: 100 },
    lastName: { required: true, type: 'name', minLength: 2, maxLength: 100 },
    email: { required: true, type: 'email' },
    phone: { type: 'phone' },
    companyName: { type: 'companyName', maxLength: 200 },
    nip: { type: 'nip' },
    regon: { type: 'regon' },
    address: { type: 'address', maxLength: 200 },
    city: { type: 'city', maxLength: 100 },
    postalCode: { type: 'postalCode' }
  },
  
  user: {
    firstName: { required: true, type: 'name', minLength: 2, maxLength: 100 },
    lastName: { required: true, type: 'name', minLength: 2, maxLength: 100 },
    email: { required: true, type: 'email' },
    password: { required: true, type: 'password' },
    phone: { type: 'phone' },
    pesel: { type: 'pesel' }
  },
  
  invoice: {
    invoiceNumber: { required: true, maxLength: 50 },
    issueDate: { required: true, type: 'date' },
    dueDate: { required: true, type: 'date' },
    amount: { required: true, type: 'positiveNumber' },
    description: { maxLength: 500 }
  }
};
