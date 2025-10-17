const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const { validateInput, sanitizeInput, validateRequest } = require('../utils/validation');

// Use the same pool configuration as main server
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'office_management',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

// Rate limiter for login attempts (stricter)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: {
    error: 'Too many login attempts from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for registration (moderate)
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 registration attempts per hour
  message: {
    error: 'Too many registration attempts from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for password reset requests
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 password reset requests per hour
  message: {
    error: 'Too many password reset attempts from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Progressive delay for failed password reset attempts
const passwordResetSpeedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 1, // Allow 1 request per 15 minutes at full speed
  delayMs: (hits) => hits * 1000, // Add 1 second delay per request after the first
  maxDelayMs: 10000, // Maximum delay of 10 seconds
});

// Login validation schema
const loginSchema = {
  email: {
    required: true,
    validator: validateInput.email,
    maxLength: 255,
  },
  password: {
    required: true,
    validator: validateInput.password,
    maxLength: 128,
  },
};

// Login endpoint
router.post('/login', loginLimiter, validateRequest(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    // Sanitize inputs
    const sanitizedEmail = sanitizeInput.normalizeString(email.toLowerCase());

    // Find user by email
    const userQuery = 'SELECT * FROM users WHERE email = $1 AND is_active = true';
    const userResult = await pool.query(userQuery, [sanitizedEmail]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    // Check password (if password_hash exists, otherwise allow demo login)
    if (user.password_hash) {
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    }

    // Generate JWT token with secure secret
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret || jwtSecret === 'demo-secret-key') {
      console.error('❌ JWT_SECRET not properly configured');
      return res.status(500).json({ error: 'Authentication configuration error' });
    }

    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, jwtSecret, {
      expiresIn: '24h',
    });

    // Update last login
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    res.json({
      token,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role,
        avatar: user.avatar_url,
      },
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Register endpoint (for admin users)
router.post('/register', registerLimiter, async (req, res) => {
  try {
    const { firstName, lastName, email, password, role = 'ksiegowa' } = req.body;

    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const insertQuery = `
      INSERT INTO users (first_name, last_name, email, password_hash, role, is_active)
      VALUES ($1, $2, $3, $4, $5, true)
      RETURNING id, first_name, last_name, email, role, created_at
    `;

    const result = await pool.query(insertQuery, [
      firstName,
      lastName,
      email,
      hashedPassword,
      role,
    ]);

    const user = result.rows[0];

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Verify token middleware
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret || jwtSecret === 'demo-secret-key') {
      return res.status(500).json({ error: 'Authentication configuration error' });
    }

    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.status(401).json({ error: 'Token verification failed' });
  }
};

// Get current user
router.get('/me', verifyToken, async (req, res) => {
  try {
    const userQuery = 'SELECT * FROM users WHERE id = $1';
    const result = await pool.query(userQuery, [req.user.userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    res.json({
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role,
      avatar: user.avatar_url,
      phone: user.phone,
      position: user.position,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
});

// Request password reset endpoint with strict rate limiting
router.post(
  '/forgot-password',
  passwordResetLimiter,
  passwordResetSpeedLimiter,
  async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      // Sanitize email
      const sanitizedEmail = email.toLowerCase().trim();

      // Check if user exists (don't reveal if email exists for security)
      const userQuery = 'SELECT id, email FROM users WHERE email = $1 AND is_active = true';
      const userResult = await pool.query(userQuery, [sanitizedEmail]);

      // Always return success to prevent email enumeration
      // In production, you would send an email with a reset token here
      res.json({
        message: 'If an account exists with this email, a password reset link has been sent.',
      });

      // Only log internally if user was found (don't expose to client)
      if (userResult.rows.length > 0) {
        console.log(`Password reset requested for user: ${sanitizedEmail}`);
        // TODO: Implement email sending and token generation
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ error: 'Failed to process password reset request' });
    }
  }
);

// Reset password endpoint with strict rate limiting
router.post(
  '/reset-password',
  passwordResetLimiter,
  passwordResetSpeedLimiter,
  async (req, res) => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({ error: 'Token and new password are required' });
      }

      // Validate password strength
      if (newPassword.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long' });
      }

      // In production, verify the token (stored in database with expiration)
      // For now, this is a placeholder implementation
      res.status(501).json({
        error: 'Password reset functionality not fully implemented. Please contact administrator.',
      });

      // TODO: Implement token verification and password reset
      // 1. Verify token exists and is not expired
      // 2. Hash new password
      // 3. Update user password
      // 4. Invalidate token
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ error: 'Failed to reset password' });
    }
  }
);

module.exports = router;
