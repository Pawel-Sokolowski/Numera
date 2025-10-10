# PostgreSQL Database Setup Guide

## Overview
This document provides comprehensive instructions for setting up and configuring the PostgreSQL database for the Office Management System, with special focus on the new automatic invoicing features.

## Prerequisites
- PostgreSQL 14+ installed and running
- Extensions: `uuid-ossp`, `pgcrypto`, `pg_cron`
- Administrative access to PostgreSQL

## Database Structure

### Core Tables

#### 1. Users and Permissions
- `users` - System users with roles and permissions
- `user_permissions` - Module-specific permissions per user

#### 2. Client Management
- `clients` - Main client information table
- `client_owners` - Company ownership details
- `client_emails` - Multiple email addresses per client
- **`client_auto_invoicing`** - New automatic invoicing settings per client
- **`client_auto_invoice_items`** - Template items for automatic invoices

#### 3. Invoice System
- `invoices` - All invoices (manual and automatic)
- `invoice_items` - Invoice line items
- `payments` - Payment tracking

#### 4. Calendar and Tasks
- `calendar_events` - Calendar events with recurrence support
- `tasks` - Task management system

#### 5. Communication
- `chat_messages` - Internal team chat
- `chat_channels` - Chat channels
- `email_queue` - Outgoing emails queue

#### 6. Document Management
- `documents` - Document metadata and storage
- `document_categories` - Document categorization

#### 7. Notifications
- `notification_schedules` - Automated notification rules
- `notification_queue` - Pending notifications

### New Automatic Invoicing Tables

#### client_auto_invoicing
This table stores automatic invoicing configuration for each client:

```sql
CREATE TABLE client_auto_invoicing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    
    -- Basic settings
    enabled BOOLEAN DEFAULT false,
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('weekly', 'monthly', 'quarterly', 'yearly')),
    amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    description TEXT,
    
    -- Dates
    next_invoice_date DATE,
    last_invoice_date DATE,
    
    -- Tax and payment settings
    vat_rate DECIMAL(5,2) DEFAULT 23.00,
    payment_terms INTEGER DEFAULT 14, -- days
    invoice_template VARCHAR(100),
    
    -- Document limits and other restrictions
    documents_limit INTEGER DEFAULT 35,
    documents_limit_warning BOOLEAN DEFAULT true,
    max_hours_per_month INTEGER,
    max_documents_per_month INTEGER,
    
    -- Additional settings
    additional_services TEXT[], -- Array of service names
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    
    UNIQUE(client_id) -- One auto-invoicing setting per client
);
```

#### client_auto_invoice_items
Template items that will be used when generating automatic invoices:

```sql
CREATE TABLE client_auto_invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auto_invoicing_id UUID NOT NULL REFERENCES client_auto_invoicing(id) ON DELETE CASCADE,
    
    -- Item details
    name VARCHAR(300) NOT NULL,
    description TEXT,
    quantity DECIMAL(10,3) NOT NULL DEFAULT 1,
    unit VARCHAR(20) DEFAULT 'szt',
    unit_price DECIMAL(12,2) NOT NULL,
    tax_rate DECIMAL(5,2) NOT NULL DEFAULT 23,
    
    -- Ordering
    sort_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Installation Instructions

### 1. Create Database
```bash
# Connect to PostgreSQL as superuser
sudo -u postgres psql

# Create database and user
CREATE DATABASE office_management;
CREATE USER office_app WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE office_management TO office_app;

# Connect to the new database
\c office_management;

# Install required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_cron";
```

### 2. Run Schema Script
```bash
# Execute the complete schema
psql -U office_app -d office_management -f src/database/complete_system_schema.sql
```

### 3. Verify Installation
```sql
-- Check tables were created
\dt

-- Verify automatic invoicing tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%auto%';

-- Check indexes
\di
```

## Configuration

### 1. Environment Variables
Create or update your `.env` file:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=office_management
DB_USER=office_app
DB_PASSWORD=your_secure_password
DB_SSL=false

# Automatic Invoicing Settings
AUTO_INVOICE_ENABLED=true
AUTO_INVOICE_PROCESS_TIME=09:00
AUTO_INVOICE_BACKUP_ENABLED=true

# Email Configuration for Invoice Sending
SMTP_HOST=your_smtp_server
SMTP_PORT=587
SMTP_USER=your_email@domain.com
SMTP_PASS=your_password
SMTP_FROM=invoices@yourcompany.com
```

### 2. Scheduled Jobs Setup
The schema automatically sets up pg_cron jobs for:
- Processing notification queue (every 5 minutes)
- Invoice reminders (daily at 9 AM)
- Tax deadline reminders (daily at 8 AM)
- Log cleanup (weekly)

To customize timing, modify the cron expressions in the schema.

## Data Migration

### From Existing System
If migrating from an existing system:

1. **Export current client data**:
```sql
-- Export clients without auto-invoicing settings
SELECT * FROM clients WHERE auto_invoicing_enabled = false;
```

2. **Set default automatic invoicing**:
```sql
-- Add default auto-invoicing settings for all existing clients
INSERT INTO client_auto_invoicing (client_id, enabled, frequency, amount, description, documents_limit)
SELECT 
    id, 
    false, -- disabled by default
    'monthly', 
    0, 
    'Standard accounting services',
    35
FROM clients 
WHERE id NOT IN (SELECT client_id FROM client_auto_invoicing);
```

## Performance Optimization

### Indexes
The schema includes optimized indexes for:
- Client lookups by NIP, status, assignment
- Auto-invoicing queries by client_id, enabled status, next_date
- Invoice queries by client, status, dates
- Notification processing

### Recommended Settings
For optimal performance, add these to your `postgresql.conf`:

```conf
# Memory settings
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB

# Connection settings
max_connections = 100

# Autovacuum settings
autovacuum = on
autovacuum_max_workers = 3
```

## Monitoring and Maintenance

### Regular Tasks
1. **Monitor auto-invoice generation**:
```sql
SELECT 
    c.company_name,
    ai.next_invoice_date,
    ai.frequency,
    ai.amount
FROM client_auto_invoicing ai
JOIN clients c ON ai.client_id = c.id
WHERE ai.enabled = true
AND ai.next_invoice_date <= CURRENT_DATE + INTERVAL '7 days';
```

2. **Check document limits**:
```sql
SELECT 
    c.company_name,
    ai.documents_limit,
    mcd.documents_received,
    CASE 
        WHEN mcd.documents_received > ai.documents_limit THEN 'EXCEEDED'
        ELSE 'OK'
    END as status
FROM client_auto_invoicing ai
JOIN clients c ON ai.client_id = c.id
LEFT JOIN monthly_client_data mcd ON c.id = mcd.client_id
WHERE ai.enabled = true
AND mcd.month = EXTRACT(MONTH FROM NOW())
AND mcd.year = EXTRACT(YEAR FROM NOW());
```

### Backup Strategy
1. Daily automated backups of the entire database
2. Before major updates, create manual backup:
```bash
pg_dump -U office_app office_management > backup_$(date +%Y%m%d).sql
```

3. Regular testing of backup restoration

## Security Considerations

1. **Database Access**:
   - Use dedicated database user with minimal required permissions
   - Enable SSL connections in production
   - Regular password rotation

2. **Data Encryption**:
   - Sensitive data encrypted using pgcrypto functions
   - Audit logs for data access and modifications

3. **Network Security**:
   - Restrict database access to application servers only
   - Use VPN or private networks for database connections

## Troubleshooting

### Common Issues

1. **Extension Missing**:
```sql
-- Check if extensions are installed
SELECT * FROM pg_extension;

-- Install missing extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

2. **Permission Errors**:
```sql
-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO office_app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO office_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO office_app;
```

3. **pg_cron Not Working**:
```sql
-- Check pg_cron status
SELECT * FROM cron.job;

-- Verify cron extension is loaded
SHOW shared_preload_libraries;
```

### Log Analysis
Monitor logs for:
- Failed automatic invoice generation
- Document limit violations
- Database connection issues
- Performance bottlenecks

## API Integration

The database supports the frontend application through:
- REST API endpoints for CRUD operations
- Real-time notifications for limit violations
- Automated invoice generation triggers
- Document management integration

For detailed API documentation, refer to the server implementation in `/server` directory.