const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const rateLimit = require('express-rate-limit');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'office_management',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

// Rate limiter for read (GET) requests
const getEventsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again later.' }
});

// Rate limiter for write (POST) requests
const createEventLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: { error: 'Too many event creation requests from this IP, please try again later.' }
});

// Get calendar events
router.get('/events', getEventsLimiter, async (req, res) => {
  try {
    const query = `
      SELECT * FROM calendar_events
      WHERE start_date >= CURRENT_DATE - INTERVAL '30 days'
      ORDER BY start_date
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Create calendar event
router.post('/events', createEventLimiter, async (req, res) => {
  try {
    const { title, description, startDate, endDate, attendees } = req.body;
    
    const query = `
      INSERT INTO calendar_events (title, description, start_date, end_date, attendees)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, created_at
    `;
    
    const result = await pool.query(query, [
      title, description, startDate, endDate, JSON.stringify(attendees)
    ]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

module.exports = router;