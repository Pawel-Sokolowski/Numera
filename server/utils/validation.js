const validator = require('validator');

// Input validation utilities
const validateInput = {
  // Email validation
  email: (email) => {
    if (!email || typeof email !== 'string') return false;
    return validator.isEmail(email) && email.length <= 255;
  },

  // Password validation
  password: (password) => {
    if (!password || typeof password !== 'string') return false;
    return password.length >= 8 && password.length <= 128;
  },

  // NIP validation (Polish tax number)
  nip: (nip) => {
    if (!nip || typeof nip !== 'string') return false;
    const cleanNip = nip.replace(/[\s-]/g, '');
    return /^\d{10}$/.test(cleanNip);
  },

  // REGON validation (Polish business registry number)
  regon: (regon) => {
    if (!regon || typeof regon !== 'string') return false;
    const cleanRegon = regon.replace(/[\s-]/g, '');
    return /^\d{9,14}$/.test(cleanRegon);
  },

  // Phone number validation
  phone: (phone) => {
    if (!phone || typeof phone !== 'string') return false;
    return /^[\+]?[\d\s\-\(\)]{9,15}$/.test(phone);
  },

  // Name validation
  name: (name) => {
    if (!name || typeof name !== 'string') return false;
    return name.length >= 2 && name.length <= 100 && /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s\-']+$/.test(name);
  },

  // Company name validation
  companyName: (name) => {
    if (!name || typeof name !== 'string') return false;
    return name.length >= 2 && name.length <= 200;
  },

  // Address validation
  address: (address) => {
    if (!address || typeof address !== 'string') return false;
    return address.length >= 5 && address.length <= 200;
  },

  // City validation
  city: (city) => {
    if (!city || typeof city !== 'string') return false;
    return city.length >= 2 && city.length <= 100;
  },

  // ZIP code validation
  zipCode: (zip) => {
    if (!zip || typeof zip !== 'string') return false;
    return /^\d{2}-\d{3}$/.test(zip);
  }
};

// Sanitization utilities
const sanitizeInput = {
  // Escape HTML
  escapeHtml: (str) => {
    if (typeof str !== 'string') return str;
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  },

  // Trim and normalize whitespace
  normalizeString: (str) => {
    if (typeof str !== 'string') return str;
    return str.trim().replace(/\s+/g, ' ');
  },

  // Remove dangerous characters
  removeDangerousChars: (str) => {
    if (typeof str !== 'string') return str;
    return str.replace(/[<>'"&]/g, '');
  }
};

// SQL injection prevention
const sqlSafe = {
  // Validate table names against whitelist
  validateTableName: (tableName, allowedTables) => {
    if (!tableName || typeof tableName !== 'string') return false;
    if (!Array.isArray(allowedTables)) return false;
    return allowedTables.includes(tableName.toLowerCase());
  },

  // Validate column names
  validateColumnName: (columnName) => {
    if (!columnName || typeof columnName !== 'string') return false;
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(columnName);
  },

  // Escape SQL identifiers
  escapeIdentifier: (identifier) => {
    if (typeof identifier !== 'string') return identifier;
    return `"${identifier.replace(/"/g, '""')}"`;
  }
};

// Request validation middleware
const validateRequest = (schema) => {
  return (req, res, next) => {
    const errors = [];

    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body[field];

      if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
        errors.push(`${field} is required`);
        continue;
      }

      if (value && rules.validator && !rules.validator(value)) {
        errors.push(`${field} is invalid`);
      }

      if (value && rules.maxLength && value.length > rules.maxLength) {
        errors.push(`${field} exceeds maximum length of ${rules.maxLength}`);
      }

      if (value && rules.minLength && value.length < rules.minLength) {
        errors.push(`${field} is below minimum length of ${rules.minLength}`);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }

    next();
  };
};

module.exports = {
  validateInput,
  sanitizeInput,
  sqlSafe,
  validateRequest
};
