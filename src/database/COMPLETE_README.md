# KOMPLETNY SYSTEM ZARZĄDZANIA BIUREM - PostgreSQL

## 📋 Spis treści
1. [Przegląd systemu](#przegląd-systemu)
2. [Struktura bazy danych](#struktura-bazy-danych)
3. [System powiadomień automatycznych](#system-powiadomień-automatycznych)
4. [Konfiguracja SMTP](#konfiguracja-smtp)
5. [Instalacja i konfiguracja](#instalacja-i-konfiguracja)
6. [Harmonogramy automatyczne](#harmonogramy-automatyczne)
7. [API i integracje](#api-i-integracje)
8. [Bezpieczeństwo](#bezpieczeństwo)
9. [Monitoring i logi](#monitoring-i-logi)
10. [Przykłady użycia](#przykłady-użycia)

## 🏢 Przegląd systemu

Kompletny system zarządzania biurem księgowym z automatycznymi powiadomieniami SMTP, zawierający:

### Główne moduły:
- **Zarządzanie klientami** z polskimi danymi firmowymi (NIP, REGON, KRS)
- **System faktur** z automatycznym obliczaniem VAT
- **Powiadomienia automatyczne** z harmonogramami i SMTP
- **Terminy podatkowe i ZUS** z przypomnieniami
- **Chat zespołowy** z komunikacją real-time
- **Kalendarz** z wydarzeniami i spotkaniami
- **Dokumenty** z zarządzaniem plikami
- **Tracking czasu pracy**
- **Raporty i statystyki**
- **System uprawnień** modułowych

## 🗃️ Struktura bazy danych

### 1. System użytkowników i uprawnień

#### `users` - Główna tabela użytkowników
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL, -- administrator, zarzadzanie, wlasciciel, sekretariat, kadrowa, ksiegowa
    is_active BOOLEAN DEFAULT true,
    status VARCHAR(20) DEFAULT 'offline', -- online, offline, away, busy
    position VARCHAR(100),
    hire_date DATE,
    salary DECIMAL(10,2),
    language VARCHAR(5) DEFAULT 'pl',
    timezone VARCHAR(50) DEFAULT 'Europe/Warsaw',
    email_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `user_permissions` - Uprawnienia modułowe
```sql
CREATE TABLE user_permissions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    module VARCHAR(50) NOT NULL, -- clients, invoices, chat, calendar, reports
    permission VARCHAR(50) NOT NULL, -- read, write, delete, admin
    granted_by UUID REFERENCES users(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. System klientów

#### `clients` - Główna tabela klientów
```sql
CREATE TABLE clients (
    id UUID PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company_name VARCHAR(200),
    nip VARCHAR(15),
    regon VARCHAR(14),
    krs VARCHAR(15),
    email VARCHAR(255),
    phone VARCHAR(20),
    website VARCHAR(255),
    -- Adres
    street VARCHAR(200),
    city VARCHAR(100),
    postal_code VARCHAR(10),
    country VARCHAR(50) DEFAULT 'Polska',
    -- Status i typ
    status VARCHAR(20) DEFAULT 'aktualny', -- aktualny, potencjalny, archiwalny
    client_type VARCHAR(20) DEFAULT 'firma', -- firma, osoba, organizacja
    business_type VARCHAR(100),
    -- Podatki
    tax_type VARCHAR(50),
    accounting_type VARCHAR(50),
    vat_rate DECIMAL(5,2) DEFAULT 23.00,
    -- ZUS
    zus_type VARCHAR(100),
    zus_code VARCHAR(10),
    zus_start_date DATE,
    health_insurance BOOLEAN DEFAULT false,
    -- Płatności
    payment_terms INTEGER DEFAULT 14, -- dni
    credit_limit DECIMAL(12,2),
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    -- Metadata
    assigned_user UUID REFERENCES users(id),
    tags TEXT[],
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `client_owners` - Właściciele firm
```sql
CREATE TABLE client_owners (
    id UUID PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients(id),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    pesel VARCHAR(11),
    share_percentage DECIMAL(5,2) NOT NULL,
    role VARCHAR(100),
    email VARCHAR(255),
    is_main_contact BOOLEAN DEFAULT false
);
```

#### `client_emails` - Dodatkowe emaile klientów
```sql
CREATE TABLE client_emails (
    id UUID PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients(id),
    email VARCHAR(255) NOT NULL,
    email_type VARCHAR(50) DEFAULT 'business', -- business, invoice, tax, personal
    contact_person_name VARCHAR(200),
    send_invoices BOOLEAN DEFAULT false,
    send_tax_notifications BOOLEAN DEFAULT false,
    is_primary BOOLEAN DEFAULT false
);
```

### 3. System faktur

#### `invoices` - Faktury
```sql
CREATE TABLE invoices (
    id UUID PRIMARY KEY,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    client_id UUID NOT NULL REFERENCES clients(id),
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    sale_date DATE,
    net_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    gross_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    paid_amount DECIMAL(12,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft', -- draft, sent, paid, overdue, cancelled
    payment_method VARCHAR(50),
    bank_account VARCHAR(32), -- IBAN
    created_by UUID REFERENCES users(id),
    sent_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE
);
```

#### `invoice_items` - Pozycje faktury
```sql
CREATE TABLE invoice_items (
    id UUID PRIMARY KEY,
    invoice_id UUID NOT NULL REFERENCES invoices(id),
    name VARCHAR(300) NOT NULL,
    description TEXT,
    quantity DECIMAL(10,3) NOT NULL DEFAULT 1,
    unit VARCHAR(20) DEFAULT 'szt',
    unit_price DECIMAL(12,2) NOT NULL,
    tax_rate DECIMAL(5,2) NOT NULL DEFAULT 23,
    net_amount DECIMAL(12,2) NOT NULL,
    tax_amount DECIMAL(12,2) NOT NULL,
    gross_amount DECIMAL(12,2) NOT NULL
);
```

#### `payments` - Płatności
```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY,
    invoice_id UUID NOT NULL REFERENCES invoices(id),
    amount DECIMAL(12,2) NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method VARCHAR(50),
    reference_number VARCHAR(100),
    is_confirmed BOOLEAN DEFAULT false
);
```

### 4. System powiadomień SMTP

#### `smtp_config` - Konfiguracja SMTP
```sql
CREATE TABLE smtp_config (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE, -- default, invoices, reminders
    host VARCHAR(255) NOT NULL,
    port INTEGER NOT NULL DEFAULT 587,
    username VARCHAR(255) NOT NULL,
    password_encrypted TEXT NOT NULL,
    use_tls BOOLEAN DEFAULT true,
    from_name VARCHAR(255),
    from_email VARCHAR(255) NOT NULL,
    reply_to VARCHAR(255),
    -- Limity
    daily_limit INTEGER DEFAULT 1000,
    hourly_limit INTEGER DEFAULT 100,
    current_daily_count INTEGER DEFAULT 0,
    current_hourly_count INTEGER DEFAULT 0,
    -- Status
    is_active BOOLEAN DEFAULT true,
    last_test_date TIMESTAMP WITH TIME ZONE,
    last_test_status BOOLEAN
);
```

#### `notification_templates` - Szablony emaili
```sql
CREATE TABLE notification_templates (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE, -- invoice_reminder, tax_deadline, zus_reminder
    subject_template TEXT NOT NULL,
    body_template TEXT NOT NULL,
    body_html_template TEXT,
    notification_type VARCHAR(50) NOT NULL, -- invoice, tax, zus, general
    priority VARCHAR(10) DEFAULT 'medium',
    available_variables TEXT[], -- {client_name, amount, due_date}
    is_active BOOLEAN DEFAULT true
);
```

#### `notification_schedules` - Harmonogramy powiadomień
```sql
CREATE TABLE notification_schedules (
    id UUID PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    schedule_type VARCHAR(50) NOT NULL, -- invoice_reminders, tax_deadlines, zus_reminders
    template_id UUID NOT NULL REFERENCES notification_templates(id),
    smtp_config_id UUID NOT NULL REFERENCES smtp_config(id),
    -- Harmonogram
    cron_expression VARCHAR(100), -- 0 9 * * 1-5 (weekdays at 9 AM)
    frequency VARCHAR(20), -- daily, weekly, monthly, custom
    time_of_day TIME DEFAULT '09:00:00',
    days_of_week INTEGER[], -- [1,2,3,4,5] Monday-Friday
    -- Warunki
    trigger_days_before INTEGER, -- dni przed terminem
    trigger_days_after INTEGER, -- dni po terminie
    client_filters JSONB, -- filtry klientów
    min_amount DECIMAL(12,2),
    max_amount DECIMAL(12,2),
    -- Status
    is_active BOOLEAN DEFAULT true,
    last_run_at TIMESTAMP WITH TIME ZONE,
    next_run_at TIMESTAMP WITH TIME ZONE
);
```

#### `notification_queue` - Kolejka powiadomień
```sql
CREATE TABLE notification_queue (
    id UUID PRIMARY KEY,
    template_id UUID NOT NULL REFERENCES notification_templates(id),
    smtp_config_id UUID NOT NULL REFERENCES smtp_config(id),
    recipient_email VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(255),
    client_id UUID REFERENCES clients(id),
    subject TEXT NOT NULL,
    body_text TEXT NOT NULL,
    body_html TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- pending, sending, sent, failed
    priority VARCHAR(10) DEFAULT 'medium',
    scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    attempt_count INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    sent_at TIMESTAMP WITH TIME ZONE
);
```

### 5. Terminy podatkowe i ZUS

#### `tax_deadlines` - Definicje terminów podatkowych
```sql
CREATE TABLE tax_deadlines (
    id UUID PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    tax_type VARCHAR(50) NOT NULL, -- VAT, PIT, CIT, ZUS
    form_code VARCHAR(20), -- VAT-7, PIT-37
    deadline_date DATE NOT NULL,
    is_recurring BOOLEAN DEFAULT true,
    recurrence_pattern VARCHAR(50), -- monthly, quarterly, yearly
    notification_template_id UUID REFERENCES notification_templates(id),
    notify_days_before INTEGER[] DEFAULT '{7,3,1}', -- powiadomienia przed terminem
    is_active BOOLEAN DEFAULT true
);
```

#### `tax_deadline_instances` - Konkretne terminy dla klientów
```sql
CREATE TABLE tax_deadline_instances (
    id UUID PRIMARY KEY,
    tax_deadline_id UUID NOT NULL REFERENCES tax_deadlines(id),
    client_id UUID REFERENCES clients(id),
    deadline_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, completed, overdue
    completion_date DATE,
    notifications_sent INTEGER DEFAULT 0,
    notes TEXT
);
```

#### `zus_codes` - Kody ZUS ze stawkami
```sql
CREATE TABLE zus_codes (
    id UUID PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    pension_rate DECIMAL(5,4), -- emerytalna
    disability_rate DECIMAL(5,4), -- rentowa
    sickness_rate DECIMAL(5,4), -- chorobowa
    health_rate DECIMAL(5,4), -- zdrowotna
    min_base DECIMAL(10,2),
    max_base DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true
);
```

### 6. Chat zespołowy

#### `chat_channels` - Kanały zespołowe
```sql
CREATE TABLE chat_channels (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL, -- public, private
    is_archived BOOLEAN DEFAULT false,
    created_by UUID NOT NULL REFERENCES users(id),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `chat_messages` - Wiadomości
```sql
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY,
    channel_id UUID REFERENCES chat_channels(id), -- NULL for direct messages
    sender_id UUID NOT NULL REFERENCES users(id),
    receiver_id UUID REFERENCES users(id), -- For direct messages
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text', -- text, file, image
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT false,
    mentions UUID[] DEFAULT '{}' -- mentioned users
);
```

### 7. Kalendarz

#### `calendar_events` - Wydarzenia
```sql
CREATE TABLE calendar_events (
    id UUID PRIMARY KEY,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    all_day BOOLEAN DEFAULT false,
    event_type VARCHAR(50) DEFAULT 'meeting', -- meeting, deadline, reminder
    status VARCHAR(20) DEFAULT 'planned', -- planned, confirmed, cancelled
    location VARCHAR(300),
    client_id UUID REFERENCES clients(id),
    assigned_to UUID REFERENCES users(id),
    reminder_minutes INTEGER DEFAULT 15,
    is_recurring BOOLEAN DEFAULT false
);
```

### 8. Dokumenty

#### `documents` - Zarządzanie dokumentami
```sql
CREATE TABLE documents (
    id UUID PRIMARY KEY,
    name VARCHAR(300) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    document_type VARCHAR(50), -- invoice, contract, tax_document
    client_id UUID REFERENCES clients(id),
    invoice_id UUID REFERENCES invoices(id),
    is_confidential BOOLEAN DEFAULT false,
    uploaded_by UUID REFERENCES users(id),
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 9. Tracking czasu

#### `time_sessions` - Sesje pracy
```sql
CREATE TABLE time_sessions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    client_id UUID REFERENCES clients(id),
    project_name VARCHAR(200),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    work_type VARCHAR(50), -- accounting, consultation, meeting
    is_billable BOOLEAN DEFAULT true,
    hourly_rate DECIMAL(8,2),
    notes TEXT
);
```

### 10. Logi i audyt

#### `activity_logs` - Logi aktywności
```sql
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL, -- CREATE, UPDATE, DELETE
    entity_type VARCHAR(50), -- client, invoice, document
    entity_id UUID,
    details JSONB,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔔 System powiadomień automatycznych

### Jak działa system powiadomień:

1. **Definicja szablonów** - Tworzenie szablonów emaili z zmiennymi
2. **Konfiguracja harmonogramów** - Ustawienie kiedy i komu wysyłać
3. **Kolejka powiadomień** - Automatyczne generowanie powiadomień do wysłania
4. **Proces wysyłki** - SMTP sender przetwarza kolejkę
5. **Historia i tracking** - Śledzenie statusu wysyłki

### Przykłady harmonogramów:

#### Przypomnienia o płatnościach faktur
```sql
INSERT INTO notification_schedules (
    name,
    schedule_type,
    template_id,
    smtp_config_id,
    frequency,
    time_of_day,
    trigger_days_after,
    is_active
) VALUES (
    'Przypomnienia o płatnościach - 7 dni po terminie',
    'invoice_reminders',
    (SELECT id FROM notification_templates WHERE code = 'invoice_reminder'),
    (SELECT id FROM smtp_config WHERE name = 'default'),
    'daily',
    '09:00:00',
    7,
    true
);
```

#### Terminy podatkowe
```sql
INSERT INTO notification_schedules (
    name,
    schedule_type,
    template_id,
    smtp_config_id,
    cron_expression,
    trigger_days_before,
    is_active
) VALUES (
    'Przypomnienia VAT - 3 dni przed',
    'tax_deadlines',
    (SELECT id FROM notification_templates WHERE code = 'tax_deadline_reminder'),
    (SELECT id FROM smtp_config WHERE name = 'default'),
    '0 8 * * *', -- Codziennie o 8:00
    3,
    true
);
```

## 📧 Konfiguracja SMTP

### Dodawanie konfiguracji SMTP:

```sql
-- Gmail SMTP
INSERT INTO smtp_config (
    name,
    host,
    port,
    username,
    password_encrypted,
    use_tls,
    from_name,
    from_email,
    daily_limit,
    hourly_limit,
    is_active
) VALUES (
    'gmail_primary',
    'smtp.gmail.com',
    587,
    'your-email@gmail.com',
    crypt('your-app-password', gen_salt('bf')),
    true,
    'Biuro Księgowe ABC',
    'your-email@gmail.com',
    500,
    50,
    true
);

-- Outlook SMTP
INSERT INTO smtp_config (
    name,
    host,
    port,
    username,
    password_encrypted,
    use_tls,
    from_name,
    from_email,
    is_active
) VALUES (
    'outlook_backup',
    'smtp-mail.outlook.com',
    587,
    'your-email@outlook.com',
    crypt('your-password', gen_salt('bf')),
    true,
    'Biuro Księgowe ABC',
    'your-email@outlook.com',
    true
);
```

### Test konfiguracji SMTP:

```sql
-- Test funkcja (do implementacji w aplikacji)
CREATE OR REPLACE FUNCTION test_smtp_config(config_name VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    config_record RECORD;
BEGIN
    SELECT * INTO config_record FROM smtp_config WHERE name = config_name;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Tutaj kod testujący połączenie SMTP
    -- Zwraca TRUE jeśli test się powiódł
    
    UPDATE smtp_config 
    SET last_test_date = NOW(), 
        last_test_status = TRUE
    WHERE name = config_name;
    
    RETURN TRUE;
END;
$$ language 'plpgsql';
```

## 🚀 Instalacja i konfiguracja

### 1. Wymagania systemowe

- PostgreSQL 13+ z rozszerzeniami:
  - `uuid-ossp` - generowanie UUID
  - `pgcrypto` - szyfrowanie haseł
  - `pg_cron` - zadania cykliczne

### 2. Instalacja rozszerzeń

```sql
-- Włączenie rozszerzeń
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_cron";
```

### 3. Wykonanie schematu

```bash
# Wykonanie kompletnego schematu
psql -d your_database -f complete_system_schema.sql
```

### 4. Konfiguracja zadań cyklicznych

System automatycznie konfiguruje zadania cron:

```sql
-- Przetwarzanie kolejki powiadomień co 5 minut
SELECT cron.schedule('process-notifications', '*/5 * * * *', 'SELECT process_notification_queue(100);');

-- Generowanie przypomnień o fakturach codziennie o 9:00
SELECT cron.schedule('invoice-reminders', '0 9 * * *', 'SELECT generate_invoice_reminders();');

-- Przypomnienia o terminach podatkowych o 8:00
SELECT cron.schedule('tax-reminders', '0 8 * * *', 'SELECT generate_tax_deadline_reminders();');
```

### 5. Pierwsze uruchomienie

#### Tworzenie administratora:
```sql
INSERT INTO users (first_name, last_name, email, role) 
VALUES ('Admin', 'System', 'admin@twoja-firma.pl', 'administrator');
```

#### Konfiguracja SMTP:
```sql
INSERT INTO smtp_config (name, host, port, username, password_encrypted, from_email, is_active)
VALUES ('default', 'smtp.twoja-firma.pl', 587, 'noreply@twoja-firma.pl', 
        crypt('haslo-smtp', gen_salt('bf')), 'noreply@twoja-firma.pl', true);
```

## ⏰ Harmonogramy automatyczne

### Rodzaje harmonogramów:

#### 1. Przypomnienia o płatnościach
- **Częstotliwość**: Codziennie
- **Warunki**: Faktury przeterminowane > X dni
- **Template**: `invoice_reminder`

#### 2. Terminy podatkowe
- **Częstotliwość**: Codziennie
- **Warunki**: X dni przed terminem
- **Template**: `tax_deadline_reminder`

#### 3. ZUS przypomnienia
- **Częstotliwość**: Miesięcznie
- **Warunki**: Przed terminem składek
- **Template**: `zus_reminder`

#### 4. Raporty automatyczne
- **Częstotliwość**: Według harmonogramu
- **Warunki**: Konfigurowane filtry
- **Format**: PDF, Excel, CSV

### Przykład konfiguracji harmonogramu:

```sql
-- Przypomnienia o VAT co miesiąc, 3 dni przed terminem
INSERT INTO notification_schedules (
    name,
    schedule_type,
    template_id,
    smtp_config_id,
    frequency,
    time_of_day,
    trigger_days_before,
    client_filters,
    is_active
) VALUES (
    'VAT-7 Przypomnienia',
    'tax_deadlines',
    (SELECT id FROM notification_templates WHERE code = 'tax_deadline_reminder'),
    (SELECT id FROM smtp_config WHERE name = 'default'),
    'monthly',
    '08:00:00',
    3,
    '{"tax_type": "VAT", "status": "aktualny"}',
    true
);
```

## 🔧 Funkcje pomocnicze

### Przetwarzanie kolejki powiadomień:
```sql
-- Uruchomienie manalne przetwarzania kolejki
SELECT process_notification_queue(50); -- Przetworz max 50 powiadomień
```

### Generowanie przypomnień:
```sql
-- Generowanie przypomnień o fakturach
SELECT generate_invoice_reminders();

-- Generowanie przypomnień podatkowych
SELECT generate_tax_deadline_reminders();
```

### Sprawdzanie statusu systemu:
```sql
-- Statystyki kolejki powiadomień
SELECT 
    status,
    COUNT(*) as count,
    MIN(scheduled_for) as earliest,
    MAX(scheduled_for) as latest
FROM notification_queue 
GROUP BY status;

-- Ostatnie wysłane powiadomienia
SELECT 
    nh.recipient_email,
    nt.name as template_name,
    nh.sent_at,
    nh.final_status
FROM notification_history nh
JOIN notification_templates nt ON nh.template_id = nt.id
ORDER BY nh.sent_at DESC
LIMIT 10;
```

## 🔐 Bezpieczeństwo

### 1. Szyfrowanie haseł SMTP
```sql
-- Dodanie zaszyfrowanego hasła SMTP
UPDATE smtp_config 
SET password_encrypted = crypt('nowe-haslo', gen_salt('bf'))
WHERE name = 'default';

-- Odszyfrowanie (tylko w aplikacji)
SELECT name, host, port, username, 
       crypt('podane-haslo', password_encrypted) = password_encrypted as password_correct
FROM smtp_config;
```

### 2. Uprawnienia użytkowników
```sql
-- Przyznanie uprawnień do modułu
INSERT INTO user_permissions (user_id, module, permission) 
VALUES 
    ('user-uuid', 'invoices', 'read'),
    ('user-uuid', 'invoices', 'write'),
    ('user-uuid', 'clients', 'admin');

-- Sprawdzenie uprawnień
CREATE OR REPLACE FUNCTION user_has_permission(
    p_user_id UUID, 
    p_module VARCHAR, 
    p_permission VARCHAR
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_permissions 
        WHERE user_id = p_user_id 
        AND module = p_module 
        AND permission = p_permission
    );
END;
$$ language 'plpgsql';
```

### 3. Logi bezpieczeństwa
```sql
-- Logowanie podejrzanych aktywności
INSERT INTO system_logs (level, component, message, details)
VALUES ('WARN', 'auth', 'Multiple failed login attempts', 
        jsonb_build_object('ip', '192.168.1.100', 'attempts', 5));
```

## 📊 Monitoring i raporty

### 1. Status systemu powiadomień
```sql
-- Dashboard systemu powiadomień
SELECT 
    'Pending' as status, COUNT(*) as count 
FROM notification_queue WHERE status = 'pending'
UNION ALL
SELECT 
    'Failed' as status, COUNT(*) as count 
FROM notification_queue WHERE status = 'failed'
UNION ALL
SELECT 
    'Sent Today' as status, COUNT(*) as count 
FROM notification_history WHERE sent_at::date = CURRENT_DATE;
```

### 2. Raport wydajności SMTP
```sql
-- Statystyki wysyłki SMTP
SELECT 
    sc.name,
    sc.current_daily_count,
    sc.daily_limit,
    sc.last_test_status,
    COUNT(nh.id) as sent_today
FROM smtp_config sc
LEFT JOIN notification_history nh ON nh.template_id IN (
    SELECT id FROM notification_templates WHERE code LIKE '%'
) AND nh.sent_at::date = CURRENT_DATE
GROUP BY sc.id, sc.name, sc.current_daily_count, sc.daily_limit, sc.last_test_status;
```

### 3. Raport klientów z zaległościami
```sql
-- Klienci z przeterminowanymi fakturami
SELECT 
    c.company_name,
    c.email,
    COUNT(i.id) as overdue_invoices,
    SUM(i.gross_amount - COALESCE(i.paid_amount, 0)) as total_overdue
FROM clients c
JOIN invoices i ON c.id = i.client_id
WHERE i.status IN ('sent', 'overdue')
AND i.due_date < CURRENT_DATE
AND (i.gross_amount - COALESCE(i.paid_amount, 0)) > 0
GROUP BY c.id, c.company_name, c.email
ORDER BY total_overdue DESC;
```

## 💡 Przykłady użycia

### 1. Dodanie nowego klienta z automatycznymi powiadomieniami

```sql
-- Dodanie klienta
INSERT INTO clients (
    company_name, nip, email, phone, 
    city, tax_type, zus_type, assigned_user
) VALUES (
    'ABC Sp. z o.o.', '1234567890', 'kontakt@abc.pl', '123456789',
    'Warszawa', 'VAT', 'pełne ubezpieczenie', 
    (SELECT id FROM users WHERE email = 'ksiegowa@firma.pl')
);

-- Automatyczne utworzenie terminów podatkowych dla nowego klienta
-- (trigger automatycznie utworzy instancje terminów)
```

### 2. Utworzenie faktury z automatycznym przypomnieniem

```sql
-- Utworzenie faktury
INSERT INTO invoices (
    invoice_number, client_id, due_date, 
    net_amount, tax_amount, gross_amount, status
) VALUES (
    'FV/2024/001', 
    (SELECT id FROM clients WHERE nip = '1234567890'),
    CURRENT_DATE + INTERVAL '14 days',
    1000.00, 230.00, 1230.00, 'sent'
);

-- Dodanie pozycji faktury
INSERT INTO invoice_items (
    invoice_id, name, quantity, unit_price, tax_rate,
    net_amount, tax_amount, gross_amount
) VALUES (
    (SELECT id FROM invoices WHERE invoice_number = 'FV/2024/001'),
    'Usługi księgowe - grudzień 2024', 1, 1000.00, 23,
    1000.00, 230.00, 1230.00
);

-- Automatyczne przypomnienie zostanie utworzone przez harmonogram
```

### 3. Konfiguracja powiadomień dla konkretnego typu klientów

```sql
-- Powiadomienia tylko dla klientów VAT z przychodami > 50k
INSERT INTO notification_schedules (
    name,
    schedule_type,
    template_id,
    smtp_config_id,
    frequency,
    time_of_day,
    trigger_days_before,
    client_filters,
    min_amount
) VALUES (
    'VAT dla dużych klientów',
    'tax_deadlines',
    (SELECT id FROM notification_templates WHERE code = 'tax_deadline_reminder'),
    (SELECT id FROM smtp_config WHERE name = 'default'),
    'monthly',
    '07:00:00',
    5,
    '{"tax_type": "VAT", "status": "aktualny"}',
    50000.00
);
```

### 4. Raport miesięczny z automatyczną wysyłką

```sql
-- Utworzenie raportu miesięcznego
INSERT INTO saved_reports (
    name,
    report_type,
    parameters,
    is_scheduled,
    schedule_cron,
    owner_id,
    auto_export,
    export_format,
    export_email
) VALUES (
    'Miesięczny raport finansowy',
    'financial',
    '{"period": "monthly", "include_overdue": true}',
    true,
    '0 8 1 * *', -- 1. dzień miesiąca o 8:00
    (SELECT id FROM users WHERE role = 'administrator'),
    true,
    'pdf',
    'dyrektor@firma.pl'
);
```

## 🔄 Backup i recovery

### Backup bazy danych:
```bash
# Pełny backup
pg_dump -h localhost -U postgres -d biuro_system > backup_$(date +%Y%m%d).sql

# Backup tylko danych
pg_dump -h localhost -U postgres -d biuro_system --data-only > data_backup_$(date +%Y%m%d).sql

# Backup ze strukturą
pg_dump -h localhost -U postgres -d biuro_system --schema-only > schema_backup.sql
```

### Restore:
```bash
# Restore pełny
psql -h localhost -U postgres -d biuro_system < backup_20241201.sql

# Restore tylko danych
psql -h localhost -U postgres -d biuro_system < data_backup_20241201.sql
```

## 📞 Wsparcie i rozwiązywanie problemów

### Częste problemy:

#### 1. Powiadomienia nie są wysyłane
```sql
-- Sprawdź status SMTP
SELECT name, is_active, last_test_status, last_error FROM smtp_config;

-- Sprawdź kolejkę
SELECT status, COUNT(*) FROM notification_queue GROUP BY status;

-- Sprawdź logi
SELECT * FROM system_logs WHERE component = 'smtp' ORDER BY created_at DESC LIMIT 10;
```

#### 2. Harmonogramy nie działają
```sql
-- Sprawdź aktywne harmonogramy
SELECT name, is_active, last_run_at, next_run_at FROM notification_schedules;

-- Sprawdź zadania cron
SELECT * FROM cron.job;
```

#### 3. Problemy z uprawnieniami
```sql
-- Sprawdź uprawnienia użytkownika
SELECT u.email, up.module, up.permission 
FROM users u 
JOIN user_permissions up ON u.id = up.user_id 
WHERE u.email = 'user@firma.pl';
```

### Kontakt:
- **Email**: support@system-biuro.pl
- **Dokumentacja**: https://docs.system-biuro.pl
- **Issues**: https://github.com/system-biuro/issues

---

## 📝 Changelog

### v1.0.0
- Kompletny schemat PostgreSQL
- System powiadomień SMTP
- Automatyczne harmonogramy
- Zarządzanie klientami z polskimi danymi
- System faktur z VAT
- Chat zespołowy
- Kalendarz i wydarzenia
- Zarządzanie dokumentami
- Tracking czasu pracy
- System uprawnień
- Logi i audyt