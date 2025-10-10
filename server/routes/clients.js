const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'office_management',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

// Get all clients
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        id, company_name, company_nip, company_regon, company_address,
        contact_person_first_name, contact_person_last_name, contact_person_email,
        contact_person_phone, industry, company_size, contract_type,
        is_active, created_at, updated_at
      FROM clients 
      WHERE is_active = true
      ORDER BY company_name
    `;
    
    const result = await pool.query(query);
    
    // Transform to match frontend expectations
    const clients = result.rows.map(row => ({
      id: row.id,
      companyName: row.company_name,
      nip: row.company_nip,
      regon: row.company_regon,
      address: row.company_address,
      contactPerson: {
        firstName: row.contact_person_first_name,
        lastName: row.contact_person_last_name,
        email: row.contact_person_email,
        phone: row.contact_person_phone
      },
      industry: row.industry,
      companySize: row.company_size,
      contractType: row.contract_type,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    res.json(clients);
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

// Get single client
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT 
        id, company_name, company_nip, company_regon, company_address,
        contact_person_first_name, contact_person_last_name, contact_person_email,
        contact_person_phone, industry, company_size, contract_type,
        is_active, created_at, updated_at
      FROM clients 
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const row = result.rows[0];
    const client = {
      id: row.id,
      companyName: row.company_name,
      nip: row.company_nip,
      regon: row.company_regon,
      address: row.company_address,
      contactPerson: {
        firstName: row.contact_person_first_name,
        lastName: row.contact_person_last_name,
        email: row.contact_person_email,
        phone: row.contact_person_phone
      },
      industry: row.industry,
      companySize: row.company_size,
      contractType: row.contract_type,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };

    res.json(client);
  } catch (error) {
    console.error('Get client error:', error);
    res.status(500).json({ error: 'Failed to fetch client' });
  }
});

// Create new client
router.post('/', async (req, res) => {
  try {
    const {
      companyName,
      nip,
      regon,
      address,
      contactPerson,
      industry,
      companySize,
      contractType
    } = req.body;

    const query = `
      INSERT INTO clients (
        company_name, company_nip, company_regon, company_address,
        contact_person_first_name, contact_person_last_name, 
        contact_person_email, contact_person_phone,
        industry, company_size, contract_type, is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true)
      RETURNING id, created_at
    `;

    const result = await pool.query(query, [
      companyName,
      nip,
      regon,
      address,
      contactPerson.firstName,
      contactPerson.lastName,
      contactPerson.email,
      contactPerson.phone,
      industry,
      companySize,
      contractType
    ]);

    res.status(201).json({
      id: result.rows[0].id,
      message: 'Client created successfully',
      createdAt: result.rows[0].created_at
    });
  } catch (error) {
    console.error('Create client error:', error);
    res.status(500).json({ error: 'Failed to create client' });
  }
});

// Update client
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      companyName,
      nip,
      regon,
      address,
      contactPerson,
      industry,
      companySize,
      contractType
    } = req.body;

    const query = `
      UPDATE clients SET
        company_name = $1,
        company_nip = $2,
        company_regon = $3,
        company_address = $4,
        contact_person_first_name = $5,
        contact_person_last_name = $6,
        contact_person_email = $7,
        contact_person_phone = $8,
        industry = $9,
        company_size = $10,
        contract_type = $11,
        updated_at = NOW()
      WHERE id = $12
      RETURNING updated_at
    `;

    const result = await pool.query(query, [
      companyName,
      nip,
      regon,
      address,
      contactPerson.firstName,
      contactPerson.lastName,
      contactPerson.email,
      contactPerson.phone,
      industry,
      companySize,
      contractType,
      id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json({
      message: 'Client updated successfully',
      updatedAt: result.rows[0].updated_at
    });
  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({ error: 'Failed to update client' });
  }
});

// Delete client (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      UPDATE clients SET
        is_active = false,
        updated_at = NOW()
      WHERE id = $1
      RETURNING id
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({ error: 'Failed to delete client' });
  }
});

module.exports = router;