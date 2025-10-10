#!/usr/bin/env node

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
};

async function createDatabase() {
  const dbName = process.env.DB_NAME || 'office_management';
  
  // Connect to postgres database first
  const adminPool = new Pool({ ...dbConfig, database: 'postgres' });
  
  try {
    // Check if database exists
    const checkDb = await adminPool.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName]
    );
    
    if (checkDb.rows.length === 0) {
      // Create database
      await adminPool.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ Database '${dbName}' created successfully`);
    } else {
      console.log(`ℹ️  Database '${dbName}' already exists`);
    }
  } catch (error) {
    console.error('❌ Error creating database:', error.message);
    process.exit(1);
  } finally {
    await adminPool.end();
  }
}

async function initializeSchema() {
  const dbName = process.env.DB_NAME || 'office_management';
  const pool = new Pool({ ...dbConfig, database: dbName });
  
  try {
    // Read schema file
    const schemaPath = path.join(__dirname, '../src/database/complete_system_schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found: ${schemaPath}`);
    }
    
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute schema
    await pool.query(schema);
    console.log('✅ Database schema initialized successfully');
    
    // Insert demo users with different roles and permissions
    await insertDemoUsers(pool);
    
    // Insert demo data
    await insertDemoData(pool);
    
  } catch (error) {
    console.error('❌ Error initializing schema:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

async function insertDemoUsers(pool) {
  const bcrypt = require('bcryptjs');
  
  // Define demo users with different roles and permissions
  const demoUsers = [
    {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@demo.com',
      password: 'admin123',
      role: 'administrator',
      position: 'System Administrator',
      phone: '+48 100 000 001',
      permissions: [
        { module: 'clients', permissions: ['read', 'write', 'delete', 'admin'] },
        { module: 'invoices', permissions: ['read', 'write', 'delete', 'admin'] },
        { module: 'calendar', permissions: ['read', 'write', 'delete', 'admin'] },
        { module: 'chat', permissions: ['read', 'write', 'delete', 'admin'] },
        { module: 'documents', permissions: ['read', 'write', 'delete', 'admin'] },
        { module: 'reports', permissions: ['read', 'write', 'delete', 'admin'] },
        { module: 'users', permissions: ['read', 'write', 'delete', 'admin'] },
        { module: 'settings', permissions: ['read', 'write', 'delete', 'admin'] }
      ]
    },
    {
      firstName: 'Manager',
      lastName: 'Kowalski',
      email: 'manager@demo.com',
      password: 'manager123',
      role: 'zarzadzanie',
      position: 'Office Manager',
      phone: '+48 100 000 002',
      permissions: [
        { module: 'clients', permissions: ['read', 'write', 'delete'] },
        { module: 'invoices', permissions: ['read', 'write'] },
        { module: 'calendar', permissions: ['read', 'write', 'delete'] },
        { module: 'chat', permissions: ['read', 'write'] },
        { module: 'documents', permissions: ['read', 'write', 'delete'] },
        { module: 'reports', permissions: ['read', 'write'] },
        { module: 'users', permissions: ['read'] }
      ]
    },
    {
      firstName: 'Anna',
      lastName: 'Nowak',
      email: 'accountant@demo.com',
      password: 'accountant123',
      role: 'ksiegowa',
      position: 'Chief Accountant',
      phone: '+48 100 000 003',
      permissions: [
        { module: 'clients', permissions: ['read', 'write'] },
        { module: 'invoices', permissions: ['read', 'write', 'delete'] },
        { module: 'calendar', permissions: ['read', 'write'] },
        { module: 'chat', permissions: ['read', 'write'] },
        { module: 'documents', permissions: ['read', 'write'] },
        { module: 'reports', permissions: ['read', 'write'] }
      ]
    },
    {
      firstName: 'Maria',
      lastName: 'Wiśniewska',
      email: 'secretary@demo.com',
      password: 'secretary123',
      role: 'sekretariat',
      position: 'Secretary',
      phone: '+48 100 000 004',
      permissions: [
        { module: 'clients', permissions: ['read', 'write'] },
        { module: 'invoices', permissions: ['read'] },
        { module: 'calendar', permissions: ['read', 'write', 'delete'] },
        { module: 'chat', permissions: ['read', 'write'] },
        { module: 'documents', permissions: ['read', 'write'] }
      ]
    },
    {
      firstName: 'Piotr',
      lastName: 'Zieliński',
      email: 'hr@demo.com',
      password: 'hr123',
      role: 'kadrowa',
      position: 'HR Manager',
      phone: '+48 100 000 005',
      permissions: [
        { module: 'clients', permissions: ['read'] },
        { module: 'calendar', permissions: ['read', 'write'] },
        { module: 'chat', permissions: ['read', 'write'] },
        { module: 'documents', permissions: ['read', 'write'] },
        { module: 'reports', permissions: ['read'] },
        { module: 'users', permissions: ['read', 'write'] }
      ]
    },
    {
      firstName: 'Owner',
      lastName: 'Company',
      email: 'owner@demo.com',
      password: 'owner123',
      role: 'wlasciciel',
      position: 'Company Owner',
      phone: '+48 100 000 006',
      permissions: [
        { module: 'clients', permissions: ['read', 'write', 'delete'] },
        { module: 'invoices', permissions: ['read', 'write', 'delete'] },
        { module: 'calendar', permissions: ['read', 'write', 'delete'] },
        { module: 'chat', permissions: ['read', 'write'] },
        { module: 'documents', permissions: ['read', 'write', 'delete'] },
        { module: 'reports', permissions: ['read', 'write'] },
        { module: 'users', permissions: ['read', 'write'] },
        { module: 'settings', permissions: ['read', 'write'] }
      ]
    }
  ];

  try {
    console.log('🔐 Creating demo users with different permission levels...');
    
    for (const user of demoUsers) {
      // Hash password
      const hashedPassword = await bcrypt.hash(user.password, 12);
      
      // Insert user
      const result = await pool.query(`
        INSERT INTO users (
          first_name, last_name, email, password_hash, role, 
          is_active, position, phone
        )
        VALUES ($1, $2, $3, $4, $5, true, $6, $7)
        ON CONFLICT (email) DO UPDATE SET
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          role = EXCLUDED.role,
          position = EXCLUDED.position,
          phone = EXCLUDED.phone
        RETURNING id
      `, [
        user.firstName,
        user.lastName,
        user.email,
        hashedPassword,
        user.role,
        user.position,
        user.phone
      ]);

      const userId = result.rows[0].id;

      // Insert permissions for this user
      for (const permConfig of user.permissions) {
        for (const permission of permConfig.permissions) {
          await pool.query(`
            INSERT INTO user_permissions (user_id, module, permission)
            VALUES ($1, $2, $3)
            ON CONFLICT (user_id, module, permission) DO NOTHING
          `, [userId, permConfig.module, permission]);
        }
      }

      console.log(`✅ Created user: ${user.email} (${user.role}) - Password: ${user.password}`);
    }

    console.log('\n📋 Demo User Credentials Summary:');
    console.log('================================');
    for (const user of demoUsers) {
      console.log(`${user.position}:`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Password: ${user.password}`);
      console.log(`  Role: ${user.role}`);
      console.log('');
    }

  } catch (error) {
    console.error('❌ Error creating demo users:', error.message);
    throw error;
  }
}

async function insertDemoData(pool) {
  try {
    // Insert demo clients
    await pool.query(`
      INSERT INTO clients (
        company_name, nip, regon, 
        contact_person_first_name, contact_person_last_name,
        email, phone,
        street, city, postal_code, country,
        status, client_type, business_type,
        vat_rate, payment_terms
      ) VALUES 
      ('ABC Technologies Sp. z o.o.', '1234567890', '123456789',
       'Jan', 'Kowalski', 'jan.kowalski@abc.pl', '+48 123 456 789',
       'ul. Przykładowa 1', 'Warszawa', '00-001', 'Polska',
       'aktualny', 'firma', 'technology',
       23.00, 14),
      ('XYZ Consulting', '0987654321', '987654321',
       'Anna', 'Nowak', 'anna.nowak@xyz.pl', '+48 987 654 321',
       'ul. Testowa 2', 'Kraków', '01-002', 'Polska',
       'aktualny', 'firma', 'consulting',
       23.00, 30),
      ('DEF Services', '1122334455', '112233445',
       'Piotr', 'Wiśniewski', 'piotr@def.pl', '+48 111 222 333',
       'ul. Główna 5', 'Wrocław', '50-001', 'Polska',
       'potencjalny', 'firma', 'services',
       23.00, 14)
      ON CONFLICT DO NOTHING
    `);
    
    console.log('✅ Demo client data inserted');
  } catch (error) {
    console.log('ℹ️  Demo data may already exist:', error.message);
  }
}

async function main() {
  console.log('🚀 Starting database setup...');
  
  try {
    await createDatabase();
    await initializeSchema();
    console.log('🎉 Database setup completed successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Copy .env.example to .env and update database credentials');
    console.log('2. Run "npm run dev" to start development server');
    console.log('3. Run "npm run electron-dev" to start the desktop app');
  } catch (error) {
    console.error('💥 Setup failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}