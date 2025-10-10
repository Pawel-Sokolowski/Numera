-- ================================================================================================
-- MIGRATION SCRIPT: Adding Automatic Invoicing to Existing System
-- ================================================================================================
-- This script safely adds automatic invoicing tables and default settings to existing clients
-- Run this after the main schema if you're upgrading an existing system

-- First, ensure the auto-invoicing tables exist (safe if already created)
CREATE TABLE IF NOT EXISTS client_auto_invoicing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    
    -- Podstawowe ustawienia
    enabled BOOLEAN DEFAULT false,
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('weekly', 'monthly', 'quarterly', 'yearly')),
    amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    description TEXT,
    
    -- Daty
    next_invoice_date DATE,
    last_invoice_date DATE,
    
    -- Ustawienia podatku i płatności
    vat_rate DECIMAL(5,2) DEFAULT 23.00,
    payment_terms INTEGER DEFAULT 14, -- days
    invoice_template VARCHAR(100),
    
    -- Limity dokumentów i inne ograniczenia
    documents_limit INTEGER DEFAULT 35,
    documents_limit_warning BOOLEAN DEFAULT true,
    max_hours_per_month INTEGER,
    max_documents_per_month INTEGER,
    
    -- Dodatkowe ustawienia
    additional_services TEXT[], -- Array of service names
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    
    UNIQUE(client_id) -- One auto-invoicing setting per client
);

CREATE TABLE IF NOT EXISTS client_auto_invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auto_invoicing_id UUID NOT NULL REFERENCES client_auto_invoicing(id) ON DELETE CASCADE,
    
    -- Szczegóły pozycji
    name VARCHAR(300) NOT NULL,
    description TEXT,
    quantity DECIMAL(10,3) NOT NULL DEFAULT 1,
    unit VARCHAR(20) DEFAULT 'szt',
    unit_price DECIMAL(12,2) NOT NULL,
    tax_rate DECIMAL(5,2) NOT NULL DEFAULT 23,
    
    -- Porządkowanie
    sort_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_client_auto_invoicing_client_id ON client_auto_invoicing(client_id);
CREATE INDEX IF NOT EXISTS idx_client_auto_invoicing_enabled ON client_auto_invoicing(enabled);
CREATE INDEX IF NOT EXISTS idx_client_auto_invoicing_next_date ON client_auto_invoicing(next_invoice_date);
CREATE INDEX IF NOT EXISTS idx_client_auto_invoicing_frequency ON client_auto_invoicing(frequency);

CREATE INDEX IF NOT EXISTS idx_auto_invoice_items_auto_invoicing_id ON client_auto_invoice_items(auto_invoicing_id);
CREATE INDEX IF NOT EXISTS idx_auto_invoice_items_sort_order ON client_auto_invoice_items(auto_invoicing_id, sort_order);

-- ================================================================================================
-- DATA MIGRATION: Add default auto-invoicing settings for existing clients
-- ================================================================================================

-- Insert default auto-invoicing settings for clients that don't have them yet
INSERT INTO client_auto_invoicing (
    client_id, 
    enabled, 
    frequency, 
    amount, 
    description, 
    vat_rate, 
    payment_terms,
    documents_limit,
    documents_limit_warning,
    notes
)
SELECT 
    c.id as client_id,
    false as enabled, -- Start disabled for existing clients
    'monthly' as frequency,
    0 as amount, -- Will need manual configuration
    CASE 
        WHEN c.business_type = 'spZoo' THEN 'Obsługa księgowa spółki z o.o.'
        WHEN c.business_type = 'dzialalnoscGospodarcza' THEN 'Obsługa księgowa działalności gospodarczej'
        ELSE 'Standardowa obsługa księgowa'
    END as description,
    COALESCE(c.vat_rate, 23.00) as vat_rate,
    COALESCE(c.payment_terms, 14) as payment_terms,
    35 as documents_limit, -- Standard document limit
    true as documents_limit_warning,
    'Automatyczne fakturowanie wyłączone - wymaga konfiguracji' as notes
FROM clients c
WHERE c.id NOT IN (
    SELECT client_id FROM client_auto_invoicing
)
AND c.status IN ('aktualny', 'potencjalny'); -- Skip archived clients

-- ================================================================================================
-- UPDATE EXISTING INVOICES: Add auto-generation tracking
-- ================================================================================================

-- Add columns to invoices table for auto-generation tracking if they don't exist
DO $$ 
BEGIN
    -- Check and add is_auto_generated column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'is_auto_generated') THEN
        ALTER TABLE invoices ADD COLUMN is_auto_generated BOOLEAN DEFAULT false;
    END IF;
    
    -- Check and add auto_invoice_rule_id column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'auto_invoice_rule_id') THEN
        ALTER TABLE invoices ADD COLUMN auto_invoice_rule_id UUID REFERENCES client_auto_invoicing(id);
    END IF;
END
$$;

-- ================================================================================================
-- SAMPLE DATA: Add example auto-invoicing configurations
-- ================================================================================================

-- Enable auto-invoicing for a sample client (replace with actual client IDs)
DO $$
DECLARE
    sample_client_id UUID;
    auto_invoicing_id UUID;
BEGIN
    -- Find a sample active client
    SELECT id INTO sample_client_id 
    FROM clients 
    WHERE status = 'aktualny' 
    AND company_name IS NOT NULL 
    LIMIT 1;
    
    IF sample_client_id IS NOT NULL THEN
        -- Update the auto-invoicing settings for the sample client
        UPDATE client_auto_invoicing 
        SET 
            enabled = true,
            amount = 800.00,
            description = 'Kompletna obsługa księgowa',
            next_invoice_date = CURRENT_DATE + INTERVAL '1 month',
            notes = 'Przykładowa konfiguracja automatycznego fakturowania'
        WHERE client_id = sample_client_id
        RETURNING id INTO auto_invoicing_id;
        
        -- Add sample invoice items
        IF auto_invoicing_id IS NOT NULL THEN
            INSERT INTO client_auto_invoice_items (auto_invoicing_id, name, description, quantity, unit_price, tax_rate, sort_order)
            VALUES 
                (auto_invoicing_id, 'Księgowość pełna', 'Prowadzenie pełnych ksiąg rachunkowych', 1, 600.00, 23, 1),
                (auto_invoicing_id, 'Obsługa kadrowo-płacowa', 'Obsługa pracowników', 1, 200.00, 23, 2);
        END IF;
        
        RAISE NOTICE 'Sample auto-invoicing configuration created for client: %', sample_client_id;
    END IF;
END
$$;

-- ================================================================================================
-- CLEANUP AND VALIDATION
-- ================================================================================================

-- Remove any duplicate auto-invoicing records (safety check)
DELETE FROM client_auto_invoicing 
WHERE id NOT IN (
    SELECT DISTINCT ON (client_id) id 
    FROM client_auto_invoicing 
    ORDER BY client_id, created_at DESC
);

-- Validation queries to run after migration
DO $$
DECLARE
    client_count INTEGER;
    auto_invoicing_count INTEGER;
    enabled_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO client_count FROM clients WHERE status IN ('aktualny', 'potencjalny');
    SELECT COUNT(*) INTO auto_invoicing_count FROM client_auto_invoicing;
    SELECT COUNT(*) INTO enabled_count FROM client_auto_invoicing WHERE enabled = true;
    
    RAISE NOTICE 'Migration Summary:';
    RAISE NOTICE '- Total active/potential clients: %', client_count;
    RAISE NOTICE '- Auto-invoicing configurations: %', auto_invoicing_count;
    RAISE NOTICE '- Enabled auto-invoicing: %', enabled_count;
    
    IF auto_invoicing_count < client_count THEN
        RAISE WARNING 'Some clients may not have auto-invoicing configurations!';
    END IF;
END
$$;

-- ================================================================================================
-- POST-MIGRATION TASKS
-- ================================================================================================

-- Update statistics for the query planner
ANALYZE client_auto_invoicing;
ANALYZE client_auto_invoice_items;
ANALYZE clients;
ANALYZE invoices;

-- Create a view for easy querying of client auto-invoicing status
CREATE OR REPLACE VIEW client_auto_invoicing_summary AS
SELECT 
    c.id as client_id,
    c.company_name,
    c.first_name,
    c.last_name,
    c.status as client_status,
    ai.enabled as auto_invoicing_enabled,
    ai.frequency,
    ai.amount,
    ai.next_invoice_date,
    ai.documents_limit,
    COUNT(aii.id) as item_count,
    SUM(aii.quantity * aii.unit_price) as template_total
FROM clients c
LEFT JOIN client_auto_invoicing ai ON c.id = ai.client_id
LEFT JOIN client_auto_invoice_items aii ON ai.id = aii.auto_invoicing_id
WHERE c.status IN ('aktualny', 'potencjalny')
GROUP BY c.id, c.company_name, c.first_name, c.last_name, c.status, 
         ai.enabled, ai.frequency, ai.amount, ai.next_invoice_date, ai.documents_limit
ORDER BY c.company_name;

-- Grant permissions on the new view
GRANT SELECT ON client_auto_invoicing_summary TO office_app;

RAISE NOTICE 'Auto-invoicing migration completed successfully!';
RAISE NOTICE 'Next steps:';
RAISE NOTICE '1. Configure auto-invoicing settings for each client';
RAISE NOTICE '2. Set up invoice templates';
RAISE NOTICE '3. Test automatic invoice generation';
RAISE NOTICE '4. Enable pg_cron jobs for automated processing';