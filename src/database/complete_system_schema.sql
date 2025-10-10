-- ================================================================================================
-- KOMPLETNY SCHEMAT POSTGRESQL DLA SYSTEMU ZARZĄDZANIA BIUREM
-- ================================================================================================
-- Zawiera: zarządzanie klientami, faktury, chat, powiadomienia automatyczne SMTP,
-- terminy podatkowe, ZUS, kalendarz, dokumenty, raporty i uprawnienia
-- ================================================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_cron"; -- For scheduled tasks

-- ================================================================================================
-- 1. SYSTEM UŻYTKOWNIKÓW I UPRAWNIEŃ
-- ================================================================================================

-- Główna tabela użytkowników
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- For local auth (if not using external auth)
    role VARCHAR(50) NOT NULL CHECK (role IN ('administrator', 'zarzadzanie', 'wlasciciel', 'sekretariat', 'kadrowa', 'ksiegowa')),
    is_active BOOLEAN DEFAULT true,
    avatar_url TEXT,
    phone VARCHAR(20),
    position VARCHAR(100),
    hire_date DATE,
    salary DECIMAL(10,2),
    -- Chat status
    status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'away', 'busy')),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Preferences
    language VARCHAR(5) DEFAULT 'pl',
    timezone VARCHAR(50) DEFAULT 'Europe/Warsaw',
    email_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Uprawnienia modułowe
CREATE TABLE IF NOT EXISTS user_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    module VARCHAR(50) NOT NULL,
    permission VARCHAR(50) NOT NULL, -- 'read', 'write', 'delete', 'admin'
    granted_by UUID REFERENCES users(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, module, permission)
);

-- ================================================================================================
-- 2. SYSTEM KLIENTÓW I FIRM
-- ================================================================================================

-- Główna tabela klientów
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Dane podstawowe
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company_name VARCHAR(200),
    -- Identyfikatory firmowe
    nip VARCHAR(15),
    regon VARCHAR(14),
    krs VARCHAR(15),
    -- Kontakt
    email VARCHAR(255),
    phone VARCHAR(20),
    website VARCHAR(255),
    -- Adres
    street VARCHAR(200),
    city VARCHAR(100),
    postal_code VARCHAR(10),
    state VARCHAR(50),
    country VARCHAR(50) DEFAULT 'Polska',
    -- Status i typ
    status VARCHAR(20) DEFAULT 'aktualny' CHECK (status IN ('aktualny', 'potencjalny', 'archiwalny', 'nieaktywny')),
    client_type VARCHAR(20) DEFAULT 'firma' CHECK (client_type IN ('firma', 'osoba', 'organizacja')),
    business_type VARCHAR(100),
    -- Podatki i księgowość
    tax_type VARCHAR(50),
    accounting_type VARCHAR(50),
    vat_rate DECIMAL(5,2) DEFAULT 23.00,
    -- ZUS
    zus_type VARCHAR(100),
    zus_code VARCHAR(10),
    zus_start_date DATE,
    zus_end_date DATE,
    health_insurance BOOLEAN DEFAULT false,
    -- Preferencje
    preferred_contact VARCHAR(20) DEFAULT 'email' CHECK (preferred_contact IN ('email', 'phone', 'mail')),
    preferred_language VARCHAR(5) DEFAULT 'pl',
    -- Finanse
    payment_terms INTEGER DEFAULT 14, -- days
    credit_limit DECIMAL(12,2),
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    -- Metadata
    date_added DATE DEFAULT CURRENT_DATE,
    last_contact DATE,
    assigned_user UUID REFERENCES users(id),
    notes TEXT,
    tags TEXT[], -- Array of tags
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Właściciele firm (dla spółek)
CREATE TABLE IF NOT EXISTS client_owners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    pesel VARCHAR(11),
    share_percentage DECIMAL(5,2) NOT NULL CHECK (share_percentage > 0 AND share_percentage <= 100),
    role VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(20),
    is_main_contact BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dodatkowe emaile klientów
CREATE TABLE IF NOT EXISTS client_emails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    email_type VARCHAR(50) DEFAULT 'business', -- 'business', 'invoice', 'tax', 'personal'
    contact_person_name VARCHAR(200),
    is_primary BOOLEAN DEFAULT false,
    send_invoices BOOLEAN DEFAULT false,
    send_tax_notifications BOOLEAN DEFAULT false,
    send_reminders BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ustawienia automatycznego fakturowania klientów
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

-- Pozycje dla automatycznych faktur (szablon)
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

-- ================================================================================================
-- 3. SYSTEM FAKTUR I PŁATNOŚCI
-- ================================================================================================

-- Faktury
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    client_id UUID NOT NULL REFERENCES clients(id),
    -- Daty
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    sale_date DATE,
    -- Kwoty
    net_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    gross_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    paid_amount DECIMAL(12,2) DEFAULT 0,
    -- Status
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
    payment_method VARCHAR(50),
    -- Dane dodatkowe
    notes TEXT,
    payment_reference VARCHAR(100),
    bank_account VARCHAR(32), -- IBAN
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    sent_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE
);

-- Pozycje faktury
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    name VARCHAR(300) NOT NULL,
    description TEXT,
    quantity DECIMAL(10,3) NOT NULL DEFAULT 1,
    unit VARCHAR(20) DEFAULT 'szt',
    unit_price DECIMAL(12,2) NOT NULL,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    tax_rate DECIMAL(5,2) NOT NULL DEFAULT 23,
    net_amount DECIMAL(12,2) NOT NULL,
    tax_amount DECIMAL(12,2) NOT NULL,
    gross_amount DECIMAL(12,2) NOT NULL,
    sort_order INTEGER DEFAULT 0
);

-- Płatności
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id),
    amount DECIMAL(12,2) NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method VARCHAR(50),
    reference_number VARCHAR(100),
    bank_account VARCHAR(32),
    notes TEXT,
    is_confirmed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- ================================================================================================
-- 4. SYSTEM DOKUMENTÓW
-- ================================================================================================

-- Główna tabela dokumentów
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(300) NOT NULL,
    description TEXT,
    file_path TEXT NOT NULL,
    file_name VARCHAR(300) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    -- Klasyfikacja
    document_type VARCHAR(50), -- 'invoice', 'contract', 'tax_document', 'other'
    category VARCHAR(100),
    tags TEXT[],
    -- Powiązania
    client_id UUID REFERENCES clients(id),
    invoice_id UUID REFERENCES invoices(id),
    related_user UUID REFERENCES users(id),
    -- Bezpieczeństwo
    is_confidential BOOLEAN DEFAULT false,
    access_level VARCHAR(20) DEFAULT 'normal' CHECK (access_level IN ('public', 'normal', 'confidential', 'restricted')),
    -- Metadata
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    uploaded_by UUID REFERENCES users(id),
    last_accessed TIMESTAMP WITH TIME ZONE,
    access_count INTEGER DEFAULT 0,
    is_archived BOOLEAN DEFAULT false
);

-- ================================================================================================
-- 5. SYSTEM KALENDARZA I WYDARZEŃ
-- ================================================================================================

-- Wydarzenia kalendarzowe
CREATE TABLE IF NOT EXISTS calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(300) NOT NULL,
    description TEXT,
    -- Czas
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    all_day BOOLEAN DEFAULT false,
    timezone VARCHAR(50) DEFAULT 'Europe/Warsaw',
    -- Typ i status
    event_type VARCHAR(50) DEFAULT 'meeting', -- 'meeting', 'deadline', 'reminder', 'holiday', 'personal'
    status VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('planned', 'confirmed', 'cancelled', 'completed')),
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    -- Lokalizacja
    location VARCHAR(300),
    is_online BOOLEAN DEFAULT false,
    meeting_url TEXT,
    -- Powiązania
    client_id UUID REFERENCES clients(id),
    assigned_to UUID REFERENCES users(id),
    created_by UUID NOT NULL REFERENCES users(id),
    -- Powtarzalność
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern TEXT, -- JSON with recurrence rules
    parent_event_id UUID REFERENCES calendar_events(id), -- For recurring events
    -- Przypomnienia
    reminder_enabled BOOLEAN DEFAULT true,
    reminder_minutes INTEGER DEFAULT 15,
    email_reminder BOOLEAN DEFAULT true,
    sms_reminder BOOLEAN DEFAULT false,
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Uczestnicy wydarzeń
CREATE TABLE IF NOT EXISTS event_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES calendar_events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    client_contact_id UUID REFERENCES client_emails(id), -- External participants
    email VARCHAR(255), -- For external participants without user account
    name VARCHAR(200), -- For external participants
    status VARCHAR(20) DEFAULT 'invited' CHECK (status IN ('invited', 'accepted', 'declined', 'tentative')),
    is_organizer BOOLEAN DEFAULT false,
    response_date TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

-- ================================================================================================
-- 6. SYSTEM CHAT ZESPOŁOWY (rozszerzony z poprzedniego)
-- ================================================================================================

-- Chat channels
CREATE TABLE IF NOT EXISTS chat_channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('public', 'private')),
    is_archived BOOLEAN DEFAULT false,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Channel members
CREATE TABLE IF NOT EXISTS channel_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id UUID NOT NULL REFERENCES chat_channels(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('member', 'admin')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_read_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(channel_id, user_id)
);

-- Chat messages (kanałowe i prywatne)
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id UUID REFERENCES chat_channels(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES users(id) ON DELETE CASCADE, -- For direct messages
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'image', 'system')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    edited_at TIMESTAMP WITH TIME ZONE,
    is_deleted BOOLEAN DEFAULT false,
    mentions UUID[] DEFAULT '{}', -- Array of user IDs mentioned
    -- Constraint: message must be either in a channel OR direct
    CONSTRAINT check_message_type CHECK (
        (channel_id IS NOT NULL AND receiver_id IS NULL) OR
        (channel_id IS NULL AND receiver_id IS NOT NULL)
    )
);

-- Message read status
CREATE TABLE IF NOT EXISTS message_read_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(message_id, user_id)
);

-- ================================================================================================
-- 7. SYSTEM POWIADOMIEŃ AUTOMATYCZNYCH I SMTP
-- ================================================================================================

-- Konfiguracja SMTP
CREATE TABLE IF NOT EXISTS smtp_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE, -- 'default', 'invoices', 'reminders'
    host VARCHAR(255) NOT NULL,
    port INTEGER NOT NULL DEFAULT 587,
    username VARCHAR(255) NOT NULL,
    password_encrypted TEXT NOT NULL, -- Encrypted password
    use_tls BOOLEAN DEFAULT true,
    use_ssl BOOLEAN DEFAULT false,
    from_name VARCHAR(255),
    from_email VARCHAR(255) NOT NULL,
    reply_to VARCHAR(255),
    -- Limity
    daily_limit INTEGER DEFAULT 1000,
    hourly_limit INTEGER DEFAULT 100,
    current_daily_count INTEGER DEFAULT 0,
    current_hourly_count INTEGER DEFAULT 0,
    last_reset_date DATE DEFAULT CURRENT_DATE,
    last_reset_hour INTEGER DEFAULT EXTRACT(HOUR FROM NOW()),
    -- Status
    is_active BOOLEAN DEFAULT true,
    last_test_date TIMESTAMP WITH TIME ZONE,
    last_test_status BOOLEAN,
    last_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Szablony emaili do powiadomień
CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE, -- 'invoice_reminder', 'tax_deadline', 'zus_reminder'
    subject_template TEXT NOT NULL,
    body_template TEXT NOT NULL,
    body_html_template TEXT,
    -- Typ powiadomienia
    notification_type VARCHAR(50) NOT NULL, -- 'invoice', 'tax', 'zus', 'general', 'payment'
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    -- Personalizacja
    supports_variables BOOLEAN DEFAULT true,
    available_variables TEXT[], -- ['client_name', 'amount', 'due_date', etc.]
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Harmonogramy automatycznych powiadomień
CREATE TABLE IF NOT EXISTS notification_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    -- Typ harmonogramu
    schedule_type VARCHAR(50) NOT NULL, -- 'invoice_reminders', 'tax_deadlines', 'zus_reminders', 'custom'
    -- Szablon i SMTP
    template_id UUID NOT NULL REFERENCES notification_templates(id),
    smtp_config_id UUID NOT NULL REFERENCES smtp_config(id),
    -- Harmonogram (cron-like)
    cron_expression VARCHAR(100), -- '0 9 * * 1-5' for weekdays at 9 AM
    -- Alternatywny harmonogram (prostszy)
    frequency VARCHAR(20), -- 'daily', 'weekly', 'monthly', 'custom'
    frequency_value INTEGER, -- for 'every X days'
    time_of_day TIME DEFAULT '09:00:00',
    days_of_week INTEGER[], -- [1,2,3,4,5] for Monday-Friday
    day_of_month INTEGER, -- for monthly
    -- Warunki uruchomienia
    trigger_condition TEXT, -- SQL condition
    trigger_days_before INTEGER, -- days before due date
    trigger_days_after INTEGER, -- days after due date
    -- Filtry
    client_filters JSONB, -- Complex filters in JSON
    min_amount DECIMAL(12,2), -- minimum amount to trigger
    max_amount DECIMAL(12,2), -- maximum amount to trigger
    -- Status i limity
    is_active BOOLEAN DEFAULT true,
    max_notifications_per_run INTEGER DEFAULT 100,
    max_retries INTEGER DEFAULT 3,
    retry_delay_minutes INTEGER DEFAULT 30,
    -- Ostatnie uruchomienie
    last_run_at TIMESTAMP WITH TIME ZONE,
    last_run_status VARCHAR(20), -- 'success', 'error', 'partial'
    last_run_count INTEGER DEFAULT 0,
    last_error TEXT,
    next_run_at TIMESTAMP WITH TIME ZONE,
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Kolejka powiadomień do wysłania
CREATE TABLE IF NOT EXISTS notification_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schedule_id UUID REFERENCES notification_schedules(id),
    template_id UUID NOT NULL REFERENCES notification_templates(id),
    smtp_config_id UUID NOT NULL REFERENCES smtp_config(id),
    -- Odbiorca
    recipient_email VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(255),
    client_id UUID REFERENCES clients(id),
    user_id UUID REFERENCES users(id),
    -- Treść (już wyrenderowana)
    subject TEXT NOT NULL,
    body_text TEXT NOT NULL,
    body_html TEXT,
    -- Dane kontekstowe (do ponownego renderowania)
    context_data JSONB,
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'sent', 'failed', 'cancelled')),
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    -- Harmonogram wysyłki
    scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Próby wysyłki
    attempt_count INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    last_attempt_at TIMESTAMP WITH TIME ZONE,
    last_error TEXT,
    -- Wysłane
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

-- Historia wysłanych powiadomień
CREATE TABLE IF NOT EXISTS notification_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    queue_id UUID REFERENCES notification_queue(id),
    schedule_id UUID REFERENCES notification_schedules(id),
    template_id UUID NOT NULL REFERENCES notification_templates(id),
    -- Odbiorca
    recipient_email VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(255),
    client_id UUID REFERENCES clients(id),
    user_id UUID REFERENCES users(id),
    -- Treść
    subject TEXT NOT NULL,
    body_text TEXT NOT NULL,
    body_html TEXT,
    -- Status końcowy
    final_status VARCHAR(20) NOT NULL,
    attempt_count INTEGER NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    -- Tracking
    delivered_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    bounced_at TIMESTAMP WITH TIME ZONE,
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    -- Metadane
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================================================
-- 8. SYSTEM TERMINÓW PODATKOWYCH I ZUS
-- ================================================================================================

-- Terminy podatkowe
CREATE TABLE IF NOT EXISTS tax_deadlines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    -- Typ
    tax_type VARCHAR(50) NOT NULL, -- 'VAT', 'PIT', 'CIT', 'ZUS', 'other'
    form_code VARCHAR(20), -- 'VAT-7', 'PIT-37', etc.
    -- Terminy
    deadline_date DATE NOT NULL,
    period_start DATE, -- Okres za który składane
    period_end DATE,
    -- Częstotliwość
    is_recurring BOOLEAN DEFAULT true,
    recurrence_pattern VARCHAR(50), -- 'monthly', 'quarterly', 'yearly'
    -- Powiązania
    applies_to_clients BOOLEAN DEFAULT true,
    client_filters JSONB, -- Filtry określające których klientów dotyczy
    -- Powiadomienia
    notification_template_id UUID REFERENCES notification_templates(id),
    notify_days_before INTEGER[] DEFAULT '{7,3,1}', -- Powiadomienia 7, 3 i 1 dzień przed
    notify_clients BOOLEAN DEFAULT true,
    notify_users UUID[], -- Array user IDs to notify
    -- Status
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Instancje terminów podatkowych (konkretne terminy dla klientów)
CREATE TABLE IF NOT EXISTS tax_deadline_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tax_deadline_id UUID NOT NULL REFERENCES tax_deadlines(id),
    client_id UUID REFERENCES clients(id), -- NULL for general deadlines
    -- Terminy
    deadline_date DATE NOT NULL,
    period_start DATE,
    period_end DATE,
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'overdue', 'cancelled')),
    completion_date DATE,
    -- Notatki
    notes TEXT,
    documents UUID[], -- Array of document IDs
    -- Powiadomienia
    notifications_sent INTEGER DEFAULT 0,
    last_notification_sent TIMESTAMP WITH TIME ZONE,
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_by UUID REFERENCES users(id)
);

-- Kody i stawki ZUS
CREATE TABLE IF NOT EXISTS zus_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    -- Składki
    pension_rate DECIMAL(5,4), -- emerytalna
    disability_rate DECIMAL(5,4), -- rentowa
    sickness_rate DECIMAL(5,4), -- chorobowa
    accident_rate DECIMAL(5,4), -- wypadkowa
    health_rate DECIMAL(5,4), -- zdrowotna
    labor_fund_rate DECIMAL(5,4), -- fundusz pracy
    -- Limity
    min_base DECIMAL(10,2),
    max_base DECIMAL(10,2),
    -- Aktywność
    is_active BOOLEAN DEFAULT true,
    valid_from DATE,
    valid_to DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ZUS dla klientów
CREATE TABLE IF NOT EXISTS client_zus (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    zus_code_id UUID NOT NULL REFERENCES zus_codes(id),
    -- Okres obowiązywania
    start_date DATE NOT NULL,
    end_date DATE,
    -- Podstawa składkowa
    contribution_base DECIMAL(10,2),
    -- Status
    is_active BOOLEAN DEFAULT true,
    -- Powiadomienia
    reminder_days_before INTEGER DEFAULT 7,
    auto_reminders BOOLEAN DEFAULT true,
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- ================================================================================================
-- 9. SYSTEM RAPORTÓW I STATYSTYK
-- ================================================================================================

-- Zapisane raporty
CREATE TABLE IF NOT EXISTS saved_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    report_type VARCHAR(50) NOT NULL, -- 'financial', 'client', 'tax', 'productivity'
    -- Konfiguracja raportu
    parameters JSONB NOT NULL, -- Parametry raportu w JSON
    query_template TEXT, -- SQL template if custom query
    -- Harmonogram automatycznego generowania
    is_scheduled BOOLEAN DEFAULT false,
    schedule_cron VARCHAR(100), -- Cron expression
    last_generated TIMESTAMP WITH TIME ZONE,
    next_generation TIMESTAMP WITH TIME ZONE,
    -- Dostęp
    owner_id UUID NOT NULL REFERENCES users(id),
    is_public BOOLEAN DEFAULT false,
    shared_with UUID[], -- Array of user IDs
    -- Eksport
    auto_export BOOLEAN DEFAULT false,
    export_format VARCHAR(20) DEFAULT 'pdf', -- 'pdf', 'excel', 'csv'
    export_email VARCHAR(255),
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wygenerowane raporty (archiwum)
CREATE TABLE IF NOT EXISTS generated_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    saved_report_id UUID REFERENCES saved_reports(id),
    name VARCHAR(200) NOT NULL,
    -- Parametry użyte do generowania
    parameters_used JSONB,
    generation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Pliki
    file_path TEXT,
    file_size BIGINT,
    file_format VARCHAR(20),
    -- Status
    status VARCHAR(20) DEFAULT 'generating' CHECK (status IN ('generating', 'completed', 'failed')),
    error_message TEXT,
    -- Dostęp
    generated_by UUID NOT NULL REFERENCES users(id),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    download_count INTEGER DEFAULT 0,
    last_downloaded TIMESTAMP WITH TIME ZONE
);

-- ================================================================================================
-- 10. SYSTEM TRACKINGU CZASU PRACY
-- ================================================================================================

-- Sesje pracy
CREATE TABLE IF NOT EXISTS time_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    client_id UUID REFERENCES clients(id),
    project_name VARCHAR(200),
    task_description TEXT,
    -- Czas
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER, -- Calculated field
    -- Klasyfikacja
    work_type VARCHAR(50), -- 'accounting', 'consultation', 'documentation', 'meeting'
    is_billable BOOLEAN DEFAULT true,
    hourly_rate DECIMAL(8,2),
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
    -- Notatki
    notes TEXT,
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================================================
-- 11. SYSTEM LOGÓW I AUDYTU
-- ================================================================================================

-- Logi aktywności użytkowników
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50), -- 'client', 'invoice', 'document', etc.
    entity_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Logi systemu (błędy, powiadomienia, itp.)
CREATE TABLE IF NOT EXISTS system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level VARCHAR(20) NOT NULL, -- 'DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'
    component VARCHAR(50) NOT NULL, -- 'smtp', 'notifications', 'auth', 'api'
    message TEXT NOT NULL,
    details JSONB,
    error_code VARCHAR(50),
    stack_trace TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================================================
-- 12. INDEXES FOR PERFORMANCE
-- ================================================================================================

-- User indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Client indexes
CREATE INDEX IF NOT EXISTS idx_clients_nip ON clients(nip);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_assigned_user ON clients(assigned_user);
CREATE INDEX IF NOT EXISTS idx_clients_date_added ON clients(date_added);

-- Client auto-invoicing indexes
CREATE INDEX IF NOT EXISTS idx_client_auto_invoicing_client_id ON client_auto_invoicing(client_id);
CREATE INDEX IF NOT EXISTS idx_client_auto_invoicing_enabled ON client_auto_invoicing(enabled);
CREATE INDEX IF NOT EXISTS idx_client_auto_invoicing_next_date ON client_auto_invoicing(next_invoice_date);
CREATE INDEX IF NOT EXISTS idx_client_auto_invoicing_frequency ON client_auto_invoicing(frequency);

-- Auto invoice items indexes
CREATE INDEX IF NOT EXISTS idx_auto_invoice_items_auto_invoicing_id ON client_auto_invoice_items(auto_invoicing_id);
CREATE INDEX IF NOT EXISTS idx_auto_invoice_items_sort_order ON client_auto_invoice_items(auto_invoicing_id, sort_order);

-- Invoice indexes
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_issue_date ON invoices(issue_date);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);

-- Notification indexes
CREATE INDEX IF NOT EXISTS idx_notification_queue_status ON notification_queue(status);
CREATE INDEX IF NOT EXISTS idx_notification_queue_scheduled_for ON notification_queue(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_notification_queue_priority ON notification_queue(priority);

-- Chat indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_channel_id ON chat_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_receiver_id ON chat_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- Calendar indexes
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_assigned_to ON calendar_events(assigned_to);
CREATE INDEX IF NOT EXISTS idx_calendar_events_client_id ON calendar_events(client_id);

-- Document indexes
CREATE INDEX IF NOT EXISTS idx_documents_client_id ON documents(client_id);
CREATE INDEX IF NOT EXISTS idx_documents_document_type ON documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_upload_date ON documents(upload_date);

-- Tax deadline indexes
CREATE INDEX IF NOT EXISTS idx_tax_deadline_instances_deadline_date ON tax_deadline_instances(deadline_date);
CREATE INDEX IF NOT EXISTS idx_tax_deadline_instances_client_id ON tax_deadline_instances(client_id);
CREATE INDEX IF NOT EXISTS idx_tax_deadline_instances_status ON tax_deadline_instances(status);

-- Activity log indexes
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);

-- ================================================================================================
-- 13. TRIGGERS AND FUNCTIONS
-- ================================================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON calendar_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_channels_updated_at BEFORE UPDATE ON chat_channels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_messages_updated_at BEFORE UPDATE ON chat_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_smtp_config_updated_at BEFORE UPDATE ON smtp_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_schedules_updated_at BEFORE UPDATE ON notification_schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate invoice totals
CREATE OR REPLACE FUNCTION calculate_invoice_totals()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        -- Calculate totals for the invoice
        UPDATE invoices SET
            net_amount = (
                SELECT COALESCE(SUM(net_amount), 0)
                FROM invoice_items
                WHERE invoice_id = NEW.invoice_id
            ),
            tax_amount = (
                SELECT COALESCE(SUM(tax_amount), 0)
                FROM invoice_items
                WHERE invoice_id = NEW.invoice_id
            ),
            gross_amount = (
                SELECT COALESCE(SUM(gross_amount), 0)
                FROM invoice_items
                WHERE invoice_id = NEW.invoice_id
            )
        WHERE id = NEW.invoice_id;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Recalculate totals after deletion
        UPDATE invoices SET
            net_amount = (
                SELECT COALESCE(SUM(net_amount), 0)
                FROM invoice_items
                WHERE invoice_id = OLD.invoice_id
            ),
            tax_amount = (
                SELECT COALESCE(SUM(tax_amount), 0)
                FROM invoice_items
                WHERE invoice_id = OLD.invoice_id
            ),
            gross_amount = (
                SELECT COALESCE(SUM(gross_amount), 0)
                FROM invoice_items
                WHERE invoice_id = OLD.invoice_id
            )
        WHERE id = OLD.invoice_id;
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Trigger for automatic invoice total calculation
CREATE TRIGGER calculate_invoice_totals_trigger
    AFTER INSERT OR UPDATE OR DELETE ON invoice_items
    FOR EACH ROW EXECUTE FUNCTION calculate_invoice_totals();

-- Function to update channel last activity
CREATE OR REPLACE FUNCTION update_channel_last_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.channel_id IS NOT NULL THEN
        UPDATE chat_channels 
        SET last_activity = NOW() 
        WHERE id = NEW.channel_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_channel_activity AFTER INSERT ON chat_messages
    FOR EACH ROW EXECUTE FUNCTION update_channel_last_activity();

-- Function to create tax deadline instances
CREATE OR REPLACE FUNCTION create_tax_deadline_instances()
RETURNS TRIGGER AS $$
DECLARE
    client_record RECORD;
    next_deadline DATE;
BEGIN
    -- Only for recurring deadlines
    IF NEW.is_recurring THEN
        -- Calculate next deadline based on recurrence pattern
        next_deadline := NEW.deadline_date;
        
        -- Create instances for all applicable clients
        FOR client_record IN 
            SELECT id FROM clients 
            WHERE is_archived = false 
            AND (NEW.client_filters IS NULL OR clients.* @> NEW.client_filters)
        LOOP
            INSERT INTO tax_deadline_instances (
                tax_deadline_id,
                client_id,
                deadline_date,
                period_start,
                period_end
            ) VALUES (
                NEW.id,
                client_record.id,
                next_deadline,
                NEW.period_start,
                NEW.period_end
            );
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER create_tax_deadline_instances_trigger
    AFTER INSERT ON tax_deadlines
    FOR EACH ROW EXECUTE FUNCTION create_tax_deadline_instances();

-- Function to log user activities
CREATE OR REPLACE FUNCTION log_user_activity()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO activity_logs (
        user_id,
        action,
        entity_type,
        entity_id,
        details
    ) VALUES (
        COALESCE(NEW.updated_by, NEW.created_by, OLD.updated_by),
        CASE 
            WHEN TG_OP = 'INSERT' THEN 'CREATE'
            WHEN TG_OP = 'UPDATE' THEN 'UPDATE'
            WHEN TG_OP = 'DELETE' THEN 'DELETE'
        END,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE 
            WHEN TG_OP = 'INSERT' THEN row_to_json(NEW)
            WHEN TG_OP = 'UPDATE' THEN jsonb_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW))
            WHEN TG_OP = 'DELETE' THEN row_to_json(OLD)
        END
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Apply activity logging to key tables
CREATE TRIGGER log_client_activity AFTER INSERT OR UPDATE OR DELETE ON clients
    FOR EACH ROW EXECUTE FUNCTION log_user_activity();

CREATE TRIGGER log_invoice_activity AFTER INSERT OR UPDATE OR DELETE ON invoices
    FOR EACH ROW EXECUTE FUNCTION log_user_activity();

CREATE TRIGGER log_document_activity AFTER INSERT OR UPDATE OR DELETE ON documents
    FOR EACH ROW EXECUTE FUNCTION log_user_activity();

-- ================================================================================================
-- 14. FUNCTIONS FOR NOTIFICATIONS AND AUTOMATION
-- ================================================================================================

-- Function to process notification queue
CREATE OR REPLACE FUNCTION process_notification_queue(batch_size INTEGER DEFAULT 100)
RETURNS INTEGER AS $$
DECLARE
    processed_count INTEGER := 0;
    notification_record RECORD;
    smtp_config_record RECORD;
BEGIN
    -- Process pending notifications
    FOR notification_record IN 
        SELECT * FROM notification_queue 
        WHERE status = 'pending' 
        AND scheduled_for <= NOW()
        AND attempt_count < max_attempts
        ORDER BY priority DESC, scheduled_for ASC
        LIMIT batch_size
    LOOP
        -- Get SMTP configuration
        SELECT * INTO smtp_config_record 
        FROM smtp_config 
        WHERE id = notification_record.smtp_config_id 
        AND is_active = true;
        
        IF FOUND THEN
            -- Update status to sending
            UPDATE notification_queue 
            SET status = 'sending', 
                last_attempt_at = NOW(),
                attempt_count = attempt_count + 1
            WHERE id = notification_record.id;
            
            -- Here you would integrate with your SMTP sending logic
            -- For now, we'll simulate successful sending
            
            -- Mark as sent (in real implementation, this would be done after successful SMTP send)
            UPDATE notification_queue 
            SET status = 'sent', 
                sent_at = NOW()
            WHERE id = notification_record.id;
            
            -- Move to history
            INSERT INTO notification_history (
                queue_id,
                schedule_id,
                template_id,
                recipient_email,
                recipient_name,
                client_id,
                user_id,
                subject,
                body_text,
                body_html,
                final_status,
                attempt_count,
                sent_at,
                created_at
            ) SELECT 
                id,
                schedule_id,
                template_id,
                recipient_email,
                recipient_name,
                client_id,
                user_id,
                subject,
                body_text,
                body_html,
                status,
                attempt_count,
                sent_at,
                NOW()
            FROM notification_queue 
            WHERE id = notification_record.id;
            
            processed_count := processed_count + 1;
        ELSE
            -- SMTP config not found or inactive
            UPDATE notification_queue 
            SET status = 'failed',
                last_error = 'SMTP configuration not found or inactive'
            WHERE id = notification_record.id;
        END IF;
    END LOOP;
    
    -- Clean up old sent notifications
    DELETE FROM notification_queue 
    WHERE status = 'sent' 
    AND sent_at < NOW() - INTERVAL '7 days';
    
    RETURN processed_count;
END;
$$ language 'plpgsql';

-- Function to generate invoice reminders
CREATE OR REPLACE FUNCTION generate_invoice_reminders()
RETURNS INTEGER AS $$
DECLARE
    reminder_count INTEGER := 0;
    invoice_record RECORD;
    client_record RECORD;
    template_record RECORD;
    smtp_config_record RECORD;
    subject_rendered TEXT;
    body_rendered TEXT;
BEGIN
    -- Get template for invoice reminders
    SELECT * INTO template_record 
    FROM notification_templates 
    WHERE code = 'invoice_reminder' 
    AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN 0;
    END IF;
    
    -- Get default SMTP config
    SELECT * INTO smtp_config_record 
    FROM smtp_config 
    WHERE name = 'default' 
    AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN 0;
    END IF;
    
    -- Find overdue invoices that need reminders
    FOR invoice_record IN 
        SELECT i.*, c.company_name, c.first_name, c.last_name, c.email
        FROM invoices i
        JOIN clients c ON i.client_id = c.id
        WHERE i.status IN ('sent', 'overdue')
        AND i.due_date < CURRENT_DATE
        AND (i.gross_amount - COALESCE(i.paid_amount, 0)) > 0
        AND c.email IS NOT NULL
        AND NOT EXISTS (
            -- Don't send if reminder was sent in last 7 days
            SELECT 1 FROM notification_history nh
            WHERE nh.template_id = template_record.id
            AND nh.client_id = i.client_id
            AND nh.created_at > NOW() - INTERVAL '7 days'
        )
    LOOP
        -- Render template variables
        subject_rendered := REPLACE(
            REPLACE(template_record.subject_template, '{invoice_number}', invoice_record.invoice_number),
            '{client_name}', COALESCE(invoice_record.company_name, invoice_record.first_name || ' ' || invoice_record.last_name)
        );
        
        body_rendered := REPLACE(
            REPLACE(
                REPLACE(
                    REPLACE(template_record.body_template, 
                        '{client_name}', COALESCE(invoice_record.company_name, invoice_record.first_name || ' ' || invoice_record.last_name)
                    ),
                    '{invoice_number}', invoice_record.invoice_number
                ),
                '{due_date}', TO_CHAR(invoice_record.due_date, 'DD.MM.YYYY')
            ),
            '{amount}', TO_CHAR(invoice_record.gross_amount - COALESCE(invoice_record.paid_amount, 0), '999G999D99') || ' PLN'
        );
        
        -- Add to notification queue
        INSERT INTO notification_queue (
            template_id,
            smtp_config_id,
            recipient_email,
            recipient_name,
            client_id,
            subject,
            body_text,
            context_data,
            priority
        ) VALUES (
            template_record.id,
            smtp_config_record.id,
            invoice_record.email,
            COALESCE(invoice_record.company_name, invoice_record.first_name || ' ' || invoice_record.last_name),
            invoice_record.client_id,
            subject_rendered,
            body_rendered,
            jsonb_build_object(
                'invoice_id', invoice_record.id,
                'invoice_number', invoice_record.invoice_number,
                'due_date', invoice_record.due_date,
                'amount', invoice_record.gross_amount - COALESCE(invoice_record.paid_amount, 0)
            ),
            'high'
        );
        
        reminder_count := reminder_count + 1;
    END LOOP;
    
    RETURN reminder_count;
END;
$$ language 'plpgsql';

-- Function to generate tax deadline reminders
CREATE OR REPLACE FUNCTION generate_tax_deadline_reminders()
RETURNS INTEGER AS $$
DECLARE
    reminder_count INTEGER := 0;
    deadline_record RECORD;
    template_record RECORD;
    smtp_config_record RECORD;
    days_until_deadline INTEGER;
BEGIN
    -- Get template for tax reminders
    SELECT * INTO template_record 
    FROM notification_templates 
    WHERE code = 'tax_deadline_reminder' 
    AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN 0;
    END IF;
    
    -- Get default SMTP config
    SELECT * INTO smtp_config_record 
    FROM smtp_config 
    WHERE name = 'default' 
    AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN 0;
    END IF;
    
    -- Find upcoming tax deadlines
    FOR deadline_record IN 
        SELECT tdi.*, td.name as deadline_name, td.notify_days_before,
               c.company_name, c.first_name, c.last_name, c.email
        FROM tax_deadline_instances tdi
        JOIN tax_deadlines td ON tdi.tax_deadline_id = td.id
        LEFT JOIN clients c ON tdi.client_id = c.id
        WHERE tdi.status = 'pending'
        AND tdi.deadline_date >= CURRENT_DATE
        AND tdi.deadline_date <= CURRENT_DATE + INTERVAL '30 days'
        AND (c.email IS NOT NULL OR td.notify_users IS NOT NULL)
    LOOP
        days_until_deadline := deadline_record.deadline_date - CURRENT_DATE;
        
        -- Check if we should send reminder for this deadline
        IF days_until_deadline = ANY(deadline_record.notify_days_before) THEN
            -- Send to client if email exists
            IF deadline_record.email IS NOT NULL THEN
                INSERT INTO notification_queue (
                    template_id,
                    smtp_config_id,
                    recipient_email,
                    recipient_name,
                    client_id,
                    subject,
                    body_text,
                    context_data,
                    priority
                ) VALUES (
                    template_record.id,
                    smtp_config_record.id,
                    deadline_record.email,
                    COALESCE(deadline_record.company_name, deadline_record.first_name || ' ' || deadline_record.last_name),
                    deadline_record.client_id,
                    REPLACE(template_record.subject_template, '{deadline_name}', deadline_record.deadline_name),
                    REPLACE(
                        REPLACE(template_record.body_template, '{deadline_name}', deadline_record.deadline_name),
                        '{deadline_date}', TO_CHAR(deadline_record.deadline_date, 'DD.MM.YYYY')
                    ),
                    jsonb_build_object(
                        'deadline_id', deadline_record.id,
                        'deadline_name', deadline_record.deadline_name,
                        'deadline_date', deadline_record.deadline_date,
                        'days_until', days_until_deadline
                    ),
                    'high'
                );
                
                reminder_count := reminder_count + 1;
            END IF;
        END IF;
    END LOOP;
    
    RETURN reminder_count;
END;
$$ language 'plpgsql';

-- ================================================================================================
-- 15. SCHEDULED JOBS (using pg_cron extension)
-- ================================================================================================

-- Schedule notification processing every 5 minutes
SELECT cron.schedule('process-notifications', '*/5 * * * *', 'SELECT process_notification_queue(100);');

-- Schedule invoice reminders daily at 9 AM
SELECT cron.schedule('invoice-reminders', '0 9 * * *', 'SELECT generate_invoice_reminders();');

-- Schedule tax deadline reminders daily at 8 AM
SELECT cron.schedule('tax-reminders', '0 8 * * *', 'SELECT generate_tax_deadline_reminders();');

-- Schedule cleanup of old logs weekly on Sunday at midnight
SELECT cron.schedule('cleanup-logs', '0 0 * * 0', '
    DELETE FROM activity_logs WHERE created_at < NOW() - INTERVAL ''90 days'';
    DELETE FROM system_logs WHERE created_at < NOW() - INTERVAL ''30 days'';
    DELETE FROM notification_history WHERE created_at < NOW() - INTERVAL ''365 days'';
');

-- ================================================================================================
-- 16. SAMPLE DATA FOR TESTING
-- ================================================================================================

-- Insert default SMTP configuration
INSERT INTO smtp_config (name, host, port, username, password_encrypted, from_name, from_email, is_active) VALUES
('default', 'smtp.gmail.com', 587, 'your-email@gmail.com', crypt('your-password', gen_salt('bf')), 'System Zarządzania Biurem', 'your-email@gmail.com', true);

-- Insert default notification templates
INSERT INTO notification_templates (name, code, subject_template, body_template, notification_type, available_variables) VALUES
('Przypomnienie o płatności faktury', 'invoice_reminder', 
 'Przypomnienie o płatności faktury {invoice_number}',
 'Szanowni Państwo {client_name},

Uprzejmie przypominamy o płatności faktury nr {invoice_number} na kwotę {amount}.
Termin płatności upłynął w dniu {due_date}.

Prosimy o pilną regulację należności.

Pozdrawiam,
Zespół księgowy',
 'invoice',
 '{client_name,invoice_number,amount,due_date}'
),
('Przypomnienie o terminie podatkowym', 'tax_deadline_reminder',
 'Przypomnienie: {deadline_name} - termin {deadline_date}',
 'Szanowni Państwo {client_name},

Przypominamy o zbliżającym się terminie: {deadline_name}.
Termin składania: {deadline_date}

W razie pytań prosimy o kontakt.

Pozdrawiam,
Zespół księgowy',
 'tax',
 '{client_name,deadline_name,deadline_date}'
);

-- Insert sample ZUS codes
INSERT INTO zus_codes (code, name, pension_rate, disability_rate, sickness_rate, health_rate, is_active) VALUES
('05 10', 'Ubezpieczenie pełne', 0.1976, 0.0650, 0.0245, 0.0900, true),
('05 70', 'Ubezpieczenie emerytalno-rentowe', 0.1976, 0.0650, 0.0000, 0.0900, true),
('05 92', 'Ubezpieczenie zdrowotne', 0.0000, 0.0000, 0.0000, 0.0900, true);

-- Insert default admin user
INSERT INTO users (first_name, last_name, email, role, is_active) VALUES
('Admin', 'System', 'admin@firma.pl', 'administrator', true);

-- Insert sample tax deadlines
INSERT INTO tax_deadlines (name, tax_type, form_code, deadline_date, is_recurring, recurrence_pattern, notify_days_before) VALUES
('Deklaracja VAT-7', 'VAT', 'VAT-7', '2024-01-25', true, 'monthly', '{7,3,1}'),
('Zeznanie PIT-37', 'PIT', 'PIT-37', '2024-04-30', true, 'yearly', '{30,14,7}'),
('Płatności ZUS', 'ZUS', 'ZUS', '2024-01-20', true, 'monthly', '{5,2}');

-- ================================================================================================
-- END OF SCHEMA
-- ================================================================================================