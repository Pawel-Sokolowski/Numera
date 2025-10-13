const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

// Security middleware
const { 
  authLimiter, 
  generalLimiter, 
  strictLimiter, 
  securityHeaders, 
  sanitizeInput, 
  secureErrorHandler 
} = require('./middleware/security');

// Validation utilities
const { sqlSafe } = require('./utils/validation');

const app = express();
const PORT = process.env.PORT || 3001;

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET', 'DB_PASSWORD'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar] || process.env[envVar] === 'demo-secret-key' || process.env[envVar] === 'password');

if (missingEnvVars.length > 0 && process.env.NODE_ENV === 'production') {
  console.error('❌ Missing or insecure environment variables:', missingEnvVars);
  process.exit(1);
}

// Database connection with secure defaults
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'office_management',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || (process.env.NODE_ENV === 'production' ? null : 'password'),
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Test database connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL connection error:', err);
});

// Security middleware
app.use(securityHeaders);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || 'http://localhost:3000'] 
    : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body parsing with limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization
app.use(sanitizeInput);

// Rate limiting
app.use('/api/auth', authLimiter);
app.use('/api', generalLimiter);

// API Routes
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/clients', require('./routes/clients'));
// app.use('/api/invoices', require('./routes/invoices'));
// app.use('/api/calendar', require('./routes/calendar'));
// app.use('/api/chat', require('./routes/chat'));
// app.use('/api/documents', require('./routes/documents'));
// app.use('/api/users', require('./routes/users'));
// app.use('/api/settings', require('./routes/settings'));

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      status: 'healthy', 
      database: 'connected',
      timestamp: result.rows[0].now 
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'unhealthy', 
      database: 'disconnected',
      error: error.message 
    });
  }
});

// Secure database query endpoint for browser version
app.post('/api/db-query', strictLimiter, async (req, res) => {
  try {
    const { table } = req.body;
    const allowedTables = ['users', 'projects', 'tasks', 'clients']; // Whitelist allowed table names
    
    // Validate table name against whitelist
    if (!table || !sqlSafe.validateTableName(table, allowedTables)) {
      return res.status(400).json({ success: false, error: 'Invalid table name' });
    }
    
    // Use parameterized query with proper identifier escaping
    const escapedTable = sqlSafe.escapeIdentifier(table);
    const result = await pool.query(`SELECT * FROM ${escapedTable} LIMIT 100`);
    
    res.json({ 
      success: true, 
      data: result.rows,
      rowCount: result.rowCount 
    });
  } catch (error) {
    console.error('Database query error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Database query failed' 
    });
  }
});

// Database initialization endpoint
app.post('/api/init-database', async (req, res) => {
  try {
    // Read and execute the complete schema
    const fs = require('fs');
    const schemaPath = path.join(__dirname, '../src/database/complete_system_schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      return res.status(404).json({ error: 'Database schema file not found' });
    }
    
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schema);
    
    res.json({ 
      success: true, 
      message: 'Database initialized successfully' 
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    res.status(500).json({ 
      error: 'Failed to initialize database',
      details: error.message 
    });
  }
});

// Database configuration check endpoint
app.get('/api/db-status', async (req, res) => {
  try {
    // Check connection
    await pool.query('SELECT 1');
    
    // Check if schema is initialized
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      ) as schema_exists
    `);
    
    const schemaInitialized = result.rows[0].schema_exists;
    
    // Count users if schema exists
    let userCount = 0;
    if (schemaInitialized) {
      const userResult = await pool.query('SELECT COUNT(*) as count FROM users');
      userCount = parseInt(userResult.rows[0].count);
    }
    
    res.json({
      connected: true,
      schemaInitialized,
      userCount,
      requiresSetup: !schemaInitialized || userCount === 0,
      database: process.env.DB_NAME || 'office_management',
      host: process.env.DB_HOST || 'localhost'
    });
  } catch (error) {
    res.status(503).json({
      connected: false,
      schemaInitialized: false,
      requiresSetup: true,
      error: error.message
    });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../build')));
  
  // Handle SPA routing - send all non-API requests to React app
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next(); // Let API routes handle their own 404s
    }
    // For all other requests, serve the React app
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
  });
}

// Error handling middleware
app.use(secureErrorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

// Export for use in Electron
module.exports = { app, pool };