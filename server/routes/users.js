const express = require('express');
const router = express.Router();

// In-memory storage for demo purposes (should use database in production)
let users = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@biuro-abc.pl',
    firstName: 'Administrator',
    lastName: 'System',
    role: 'admin',
    isActive: true,
    permissions: [
      { module: 'clients', permissions: { read: true, write: true, delete: true, admin: true } },
      { module: 'invoices', permissions: { read: true, write: true, delete: true, admin: true } },
      { module: 'email', permissions: { read: true, write: true, delete: true, admin: true } },
      { module: 'chat', permissions: { read: true, write: true, delete: true, admin: true } },
      { module: 'calendar', permissions: { read: true, write: true, delete: true, admin: true } },
      { module: 'ceidg', permissions: { read: true, write: true, delete: true, admin: true } },
      { module: 'reports', permissions: { read: true, write: true, delete: true, admin: true } },
      { module: 'settings', permissions: { read: true, write: true, delete: true, admin: true } },
      { module: 'user_management', permissions: { read: true, write: true, delete: true, admin: true } },
      { module: 'contracts', permissions: { read: true, write: true, delete: true, admin: true } },
      { module: 'documents', permissions: { read: true, write: true, delete: true, admin: true } },
      { module: 'templates', permissions: { read: true, write: true, delete: true, admin: true } },
      { module: 'banking', permissions: { read: true, write: true, delete: true, admin: true } },
      { module: 'time_tracking', permissions: { read: true, write: true, delete: true, admin: true } }
    ],
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  },
  {
    id: '2',
    username: 'ksiegowy',
    email: 'ksiegowy@biuro-abc.pl',
    firstName: 'Jan',
    lastName: 'Kowalski',
    role: 'accountant',
    isActive: true,
    permissions: [
      { module: 'clients', permissions: { read: true, write: true, delete: false, admin: false } },
      { module: 'invoices', permissions: { read: true, write: true, delete: false, admin: false } },
      { module: 'email', permissions: { read: true, write: true, delete: false, admin: false } },
      { module: 'chat', permissions: { read: true, write: true, delete: false, admin: false } },
      { module: 'calendar', permissions: { read: true, write: true, delete: false, admin: false } },
      { module: 'ceidg', permissions: { read: false, write: false, delete: false, admin: false } },
      { module: 'reports', permissions: { read: true, write: false, delete: false, admin: false } },
      { module: 'settings', permissions: { read: false, write: false, delete: false, admin: false } },
      { module: 'user_management', permissions: { read: false, write: false, delete: false, admin: false } }
    ],
    createdAt: new Date().toISOString(),
    lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  }
];

// Get all users
router.get('/', (req, res) => {
  // Remove passwords from response
  const safeUsers = users.map(user => {
    const { password, ...safeUser } = user;
    return safeUser;
  });
  res.json(safeUsers);
});

// Get user by ID
router.get('/:id', (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const { password, ...safeUser } = user;
  res.json(safeUser);
});

// Create user
router.post('/', (req, res) => {
  const { username, email, firstName, lastName, role, permissions } = req.body;
  
  if (!username || !email || !firstName || !lastName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Check if username or email already exists
  const existingUser = users.find(u => u.username === username || u.email === email);
  if (existingUser) {
    return res.status(409).json({ error: 'Username or email already exists' });
  }

  const newUser = {
    id: (users.length + 1).toString(),
    username,
    email,
    firstName,
    lastName,
    role: role || 'user',
    isActive: true,
    permissions: permissions || [],
    createdAt: new Date().toISOString(),
    lastLogin: null
  };

  users.push(newUser);
  const { password, ...safeUser } = newUser;
  res.status(201).json(safeUser);
});

// Update user
router.put('/:id', (req, res) => {
  const userIndex = users.findIndex(u => u.id === req.params.id);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  const updates = req.body;
  users[userIndex] = { ...users[userIndex], ...updates, id: req.params.id };
  
  const { password, ...safeUser } = users[userIndex];
  res.json(safeUser);
});

// Update user permissions
router.put('/:id/permissions', (req, res) => {
  const userIndex = users.findIndex(u => u.id === req.params.id);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  users[userIndex].permissions = req.body.permissions;
  res.json({ message: 'Permissions updated successfully' });
});

// Deactivate user
router.delete('/:id', (req, res) => {
  const userIndex = users.findIndex(u => u.id === req.params.id);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  users[userIndex].isActive = false;
  res.json({ message: 'User deactivated successfully' });
});

module.exports = router;