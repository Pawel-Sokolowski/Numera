const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const rateLimit = require('express-rate-limit'); // Add rate limiting middleware import

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'office_management',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

// Limit to 10 create requests per 15 minutes per IP
const createInvoiceLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: { error: "Too many invoice creations from this IP, please try again later." }
});

// Limit to 100 get requests per 15 minutes per IP
const getInvoicesLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: "Too many requests for invoices from this IP, please try again later." }
});

// Get all invoices
router.get('/', getInvoicesLimiter, async (req, res) => {
  try {
    const query = `
      SELECT i.*, c.company_name as client_name
      FROM invoices i
      LEFT JOIN clients c ON i.client_id = c.id
      ORDER BY i.created_at DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// Create invoice
router.post('/', createInvoiceLimiter, async (req, res) => {
  try {
    const { clientId, amount, dueDate, description, items } = req.body;
    
    const query = `
      INSERT INTO invoices (client_id, amount, due_date, description, items, status)
      VALUES ($1, $2, $3, $4, $5, 'draft')
      RETURNING id, created_at
    `;
    
    const result = await pool.query(query, [
      clientId, amount, dueDate, description, JSON.stringify(items)
    ]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

module.exports = router;