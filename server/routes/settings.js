const express = require('express');
const router = express.Router();

// In-memory storage for demo purposes (should use database in production)
let settings = {
  company: {
    name: 'Biuro Rachunkowe ABC',
    nip: '1234567890',
    regon: '123456789',
    address: 'ul. Przykładowa 123, 00-001 Warszawa',
    phone: '+48 123 456 789',
    email: 'kontakt@biuro-abc.pl'
  },
  system: {
    defaultLanguage: 'pl',
    timezone: 'Europe/Warsaw',
    dateFormat: 'DD/MM/YYYY',
    currency: 'PLN',
    taxRate: 23
  },
  email: {
    smtpEnabled: false,
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    smtpSecure: true
  }
};

// Get all settings
router.get('/', (req, res) => {
  res.json(settings);
});

// Get specific setting category
router.get('/:category', (req, res) => {
  const { category } = req.params;
  if (settings[category]) {
    res.json(settings[category]);
  } else {
    res.status(404).json({ error: 'Category not found' });
  }
});

// Update settings
router.put('/:category', (req, res) => {
  const { category } = req.params;
  if (settings[category]) {
    settings[category] = { ...settings[category], ...req.body };
    res.json({ message: 'Settings updated successfully', data: settings[category] });
  } else {
    res.status(404).json({ error: 'Category not found' });
  }
});

// Reset settings to defaults
router.post('/reset', (req, res) => {
  settings = {
    company: {
      name: 'Biuro Rachunkowe ABC',
      nip: '1234567890',
      regon: '123456789',
      address: 'ul. Przykładowa 123, 00-001 Warszawa',
      phone: '+48 123 456 789',
      email: 'kontakt@biuro-abc.pl'
    },
    system: {
      defaultLanguage: 'pl',
      timezone: 'Europe/Warsaw',
      dateFormat: 'DD/MM/YYYY',
      currency: 'PLN',
      taxRate: 23
    },
    email: {
      smtpEnabled: false,
      smtpHost: '',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: '',
      smtpSecure: true
    }
  };
  res.json({ message: 'Settings reset to defaults', data: settings });
});

module.exports = router;