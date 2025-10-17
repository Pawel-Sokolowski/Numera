-- Add indexes for better query performance
-- Clients table indexes
CREATE INDEX IF NOT EXISTS idx_clients_nip ON clients(nip);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Invoices table indexes (if exists)
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id) WHERE EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'invoices'
);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number) WHERE EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'invoices'
);
CREATE INDEX IF NOT EXISTS idx_invoices_issue_date ON invoices(issue_date) WHERE EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'invoices'
);

-- Calendar events indexes (if exists)
CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON calendar_events(start_date) WHERE EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'calendar_events'
);

-- Documents indexes (if exists)
CREATE INDEX IF NOT EXISTS idx_documents_client_id ON documents(client_id) WHERE EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'documents'
);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at) WHERE EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'documents'
);
