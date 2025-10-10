const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

/**
 * First-run database setup wizard for Electron app
 * This module handles automatic database detection and configuration
 */

class DatabaseSetupWizard {
  constructor() {
    this.configPath = path.join(__dirname, '../.env');
    this.hasValidConfig = false;
  }

  /**
   * Check if database is configured and accessible
   */
  async checkDatabaseConnection(config) {
    const pool = new Pool({
      host: config.DB_HOST || 'localhost',
      port: config.DB_PORT || 5432,
      database: config.DB_NAME || 'office_management',
      user: config.DB_USER || 'postgres',
      password: config.DB_PASSWORD || '',
      connectionTimeoutMillis: 5000,
    });

    try {
      const result = await pool.query('SELECT 1 as connected');
      await pool.end();
      return { success: true, message: 'Connected successfully' };
    } catch (error) {
      await pool.end();
      return { 
        success: false, 
        message: error.message,
        code: error.code 
      };
    }
  }

  /**
   * Check if database schema is initialized
   */
  async isDatabaseInitialized(config) {
    const pool = new Pool({
      host: config.DB_HOST || 'localhost',
      port: config.DB_PORT || 5432,
      database: config.DB_NAME || 'office_management',
      user: config.DB_USER || 'postgres',
      password: config.DB_PASSWORD || '',
      connectionTimeoutMillis: 5000,
    });

    try {
      const result = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'users'
        ) as table_exists
      `);
      await pool.end();
      return result.rows[0].table_exists;
    } catch (error) {
      await pool.end();
      return false;
    }
  }

  /**
   * Load configuration from .env file
   */
  loadConfig() {
    if (!fs.existsSync(this.configPath)) {
      return null;
    }

    const envContent = fs.readFileSync(this.configPath, 'utf8');
    const config = {};
    
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        config[key.trim()] = value.trim();
      }
    });

    return config;
  }

  /**
   * Save configuration to .env file
   */
  saveConfig(config) {
    const envContent = Object.keys(config)
      .map(key => `${key}=${config[key]}`)
      .join('\n');
    
    fs.writeFileSync(this.configPath, envContent, 'utf8');
  }

  /**
   * Create database if it doesn't exist
   */
  async createDatabase(config) {
    const adminPool = new Pool({
      host: config.DB_HOST || 'localhost',
      port: config.DB_PORT || 5432,
      database: 'postgres',
      user: config.DB_USER || 'postgres',
      password: config.DB_PASSWORD || '',
      connectionTimeoutMillis: 5000,
    });

    try {
      const dbName = config.DB_NAME || 'office_management';
      
      // Check if database exists
      const checkDb = await adminPool.query(
        'SELECT 1 FROM pg_database WHERE datname = $1',
        [dbName]
      );
      
      if (checkDb.rows.length === 0) {
        // Create database
        await adminPool.query(`CREATE DATABASE "${dbName}"`);
        await adminPool.end();
        return { success: true, message: `Database '${dbName}' created successfully` };
      } else {
        await adminPool.end();
        return { success: true, message: `Database '${dbName}' already exists` };
      }
    } catch (error) {
      await adminPool.end();
      return { 
        success: false, 
        message: `Failed to create database: ${error.message}`,
        error: error 
      };
    }
  }

  /**
   * Initialize database schema
   */
  async initializeSchema(config) {
    const pool = new Pool({
      host: config.DB_HOST || 'localhost',
      port: config.DB_PORT || 5432,
      database: config.DB_NAME || 'office_management',
      user: config.DB_USER || 'postgres',
      password: config.DB_PASSWORD || '',
      connectionTimeoutMillis: 10000,
    });

    try {
      // Read schema file
      const schemaPath = path.join(__dirname, '../src/database/complete_system_schema.sql');
      
      if (!fs.existsSync(schemaPath)) {
        throw new Error(`Schema file not found: ${schemaPath}`);
      }
      
      const schema = fs.readFileSync(schemaPath, 'utf8');
      
      // Execute schema
      await pool.query(schema);
      
      // Create demo users using the enhanced setup script
      const { insertDemoUsers } = require('./setup-database.js');
      await insertDemoUsers(pool);
      
      await pool.end();
      return { success: true, message: 'Database schema initialized successfully' };
    } catch (error) {
      await pool.end();
      return { 
        success: false, 
        message: `Failed to initialize schema: ${error.message}`,
        error: error 
      };
    }
  }

  /**
   * Run complete setup wizard
   */
  async runSetup(userConfig) {
    const results = {
      steps: [],
      success: false,
      config: userConfig
    };

    try {
      // Step 1: Test connection
      results.steps.push({ name: 'Connection Test', status: 'running' });
      const connectionResult = await this.checkDatabaseConnection(userConfig);
      
      if (!connectionResult.success) {
        results.steps[results.steps.length - 1] = { 
          name: 'Connection Test', 
          status: 'failed', 
          message: connectionResult.message 
        };
        return results;
      }
      results.steps[results.steps.length - 1] = { 
        name: 'Connection Test', 
        status: 'success', 
        message: 'Connected to PostgreSQL' 
      };

      // Step 2: Create database
      results.steps.push({ name: 'Create Database', status: 'running' });
      const createDbResult = await this.createDatabase(userConfig);
      results.steps[results.steps.length - 1] = { 
        name: 'Create Database', 
        status: createDbResult.success ? 'success' : 'failed', 
        message: createDbResult.message 
      };

      if (!createDbResult.success) {
        return results;
      }

      // Step 3: Check if schema exists
      results.steps.push({ name: 'Check Schema', status: 'running' });
      const isInitialized = await this.isDatabaseInitialized(userConfig);
      
      if (isInitialized) {
        results.steps[results.steps.length - 1] = { 
          name: 'Check Schema', 
          status: 'success', 
          message: 'Database already initialized' 
        };
        results.success = true;
        
        // Save config
        this.saveConfig(userConfig);
        return results;
      }

      // Step 4: Initialize schema
      results.steps[results.steps.length - 1] = { 
        name: 'Check Schema', 
        status: 'success', 
        message: 'Schema not found, will initialize' 
      };
      
      results.steps.push({ name: 'Initialize Schema', status: 'running' });
      const schemaResult = await this.initializeSchema(userConfig);
      results.steps[results.steps.length - 1] = { 
        name: 'Initialize Schema', 
        status: schemaResult.success ? 'success' : 'failed', 
        message: schemaResult.message 
      };

      if (!schemaResult.success) {
        return results;
      }

      // Step 5: Save configuration
      results.steps.push({ name: 'Save Configuration', status: 'running' });
      this.saveConfig(userConfig);
      results.steps[results.steps.length - 1] = { 
        name: 'Save Configuration', 
        status: 'success', 
        message: 'Configuration saved' 
      };

      results.success = true;
      return results;

    } catch (error) {
      results.steps.push({ 
        name: 'Setup Error', 
        status: 'failed', 
        message: error.message 
      });
      return results;
    }
  }

  /**
   * Validate database configuration on app start
   */
  async validateSetup() {
    const config = this.loadConfig();
    
    if (!config || !config.DB_HOST || !config.DB_PASSWORD) {
      return {
        valid: false,
        requiresSetup: true,
        message: 'Database not configured'
      };
    }

    const connectionResult = await this.checkDatabaseConnection(config);
    
    if (!connectionResult.success) {
      return {
        valid: false,
        requiresSetup: true,
        message: `Database connection failed: ${connectionResult.message}`
      };
    }

    const isInitialized = await this.isDatabaseInitialized(config);
    
    if (!isInitialized) {
      return {
        valid: false,
        requiresSetup: true,
        message: 'Database not initialized'
      };
    }

    return {
      valid: true,
      requiresSetup: false,
      message: 'Database ready'
    };
  }
}

module.exports = DatabaseSetupWizard;
