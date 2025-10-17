const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'office_management',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

async function seedDevelopmentData() {
  const client = await pool.connect();

  try {
    console.log('🌱 Starting development data seeding...');

    // Start transaction
    await client.query('BEGIN');

    // Check if data already exists
    const userCheck = await client.query('SELECT COUNT(*) FROM users');
    if (parseInt(userCheck.rows[0].count) > 0) {
      console.log('⚠️  Database already contains data. Skipping seed.');
      await client.query('ROLLBACK');
      return;
    }

    // Seed users
    console.log('👥 Seeding users...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    const adminUser = await client.query(
      `INSERT INTO users (username, email, password_hash, role, first_name, last_name, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING id`,
      ['admin', 'admin@numera.com', hashedPassword, 'admin', 'Admin', 'User']
    );

    const accountantUser = await client.query(
      `INSERT INTO users (username, email, password_hash, role, first_name, last_name, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING id`,
      ['accountant', 'accountant@numera.com', hashedPassword, 'accountant', 'John', 'Accountant']
    );

    const regularUser = await client.query(
      `INSERT INTO users (username, email, password_hash, role, first_name, last_name, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING id`,
      ['user', 'user@numera.com', hashedPassword, 'user', 'Jane', 'User']
    );

    console.log(`✓ Created 3 users`);

    // Seed clients
    console.log('🏢 Seeding clients...');
    const clients = [
      {
        name: 'ABC Sp. z o.o.',
        nip: '1234567890',
        email: 'contact@abc.pl',
        phone: '123456789',
        address: 'ul. Główna 1',
        city: 'Warsaw',
        postalCode: '00-001',
      },
      {
        name: 'XYZ Ltd.',
        nip: '9876543210',
        email: 'info@xyz.pl',
        phone: '987654321',
        address: 'ul. Testowa 10',
        city: 'Krakow',
        postalCode: '30-001',
      },
      {
        name: 'Test Company',
        nip: '5555555555',
        email: 'hello@test.pl',
        phone: '555555555',
        address: 'ul. Przykładowa 5',
        city: 'Gdańsk',
        postalCode: '80-001',
      },
    ];

    for (const client of clients) {
      await client.query(
        `INSERT INTO clients (name, nip, email, phone, address, city, postal_code, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
        [
          client.name,
          client.nip,
          client.email,
          client.phone,
          client.address,
          client.city,
          client.postalCode,
        ]
      );
    }

    console.log(`✓ Created ${clients.length} clients`);

    // Commit transaction
    await client.query('COMMIT');

    console.log('✅ Development data seeding completed successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('   Admin:      username: admin      password: password123');
    console.log('   Accountant: username: accountant password: password123');
    console.log('   User:       username: user       password: password123');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedDevelopmentData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Seeding error:', error);
      process.exit(1);
    });
}

module.exports = { seedDevelopmentData };
