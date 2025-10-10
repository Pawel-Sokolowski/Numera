-- ================================================================================================
-- ROZSZERZONY SCHEMAT TRACKINGU CZASU PRACY - PostgreSQL
-- ================================================================================================
-- Dodatkowe tabele dla systemu zarządzania czasem pracy z ograniczeniem do jednej aktywnej sesji

-- Tabela sesji czasowych (tracking czasu pracy)
CREATE TABLE IF NOT EXISTS time_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    
    -- Podstawowe informacje o sesji
    project_name VARCHAR(200),
    task_name VARCHAR(200),
    description TEXT,
    
    -- Czas
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER, -- Calculated field
    
    -- Klasyfikacja
    work_type VARCHAR(50) DEFAULT 'general', -- general, accounting, consultation, documentation, meeting
    category VARCHAR(50) DEFAULT 'work', -- work, break, meeting, administration
    
    -- Płatność
    is_billable BOOLEAN DEFAULT true,
    hourly_rate DECIMAL(8,2),
    total_value DECIMAL(10,2), -- Calculated: duration * hourly_rate
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
    
    -- Notatki i tagi
    notes TEXT,
    tags TEXT[], -- Array of tags for categorization
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint: only one active session per user at a time
    UNIQUE(user_id, status) DEFERRABLE INITIALLY DEFERRED
);

-- Tabela dla przerw w sesjach
CREATE TABLE IF NOT EXISTS time_session_breaks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES time_sessions(id) ON DELETE CASCADE,
    break_start TIMESTAMP WITH TIME ZONE NOT NULL,
    break_end TIMESTAMP WITH TIME ZONE,
    break_reason VARCHAR(100), -- lunch, meeting, personal, technical
    duration_minutes INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela dla miesięcznych danych klientów (rozszerzona)
CREATE TABLE IF NOT EXISTS monthly_client_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id), -- Who manages this data
    
    -- Okres
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL,
    
    -- Finansowe dane
    revenue DECIMAL(12,2) DEFAULT 0,
    costs DECIMAL(12,2) DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    zus_amount DECIMAL(12,2) DEFAULT 0,
    
    -- Pracownicy
    employees_contract INTEGER DEFAULT 0, -- umowa zlecenie
    employees_fulltime INTEGER DEFAULT 0, -- umowa o pracę
    
    -- Dokumenty (uproszczone)
    documents_received INTEGER DEFAULT 0,
    documents_limit INTEGER DEFAULT 35, -- próg ostrzeżenia
    
    -- Status dokumentów
    document_status VARCHAR(20) DEFAULT 'dostarczone' 
        CHECK (document_status IN ('dostarczone', 'zweryfikowane', 'zaksiegowane', 'zakonczono')),
    
    -- Status różnych obszarów
    vat_status VARCHAR(20) DEFAULT 'pending' 
        CHECK (vat_status IN ('completed', 'pending', 'missing')),
    zus_status VARCHAR(20) DEFAULT 'pending' 
        CHECK (zus_status IN ('completed', 'pending', 'overdue')),
    tax_status VARCHAR(20) DEFAULT 'pending' 
        CHECK (tax_status IN ('completed', 'pending', 'review')),
    
    -- Terminy
    vat_deadline DATE,
    zus_deadline DATE,
    
    -- Zaległości
    overdue_days INTEGER DEFAULT 0,
    overdue_amount DECIMAL(12,2) DEFAULT 0,
    
    -- Czas pracy (agregowane z time_sessions)
    total_time_tracked INTEGER DEFAULT 0, -- minuty
    last_time_entry TIMESTAMP WITH TIME ZONE,
    
    -- Dodatkowe informacje
    tax_form VARCHAR(50), -- skala, liniowy, ryczałt
    is_vat_payer BOOLEAN DEFAULT false,
    
    -- Przypisania pracowników
    hr_employee_id UUID REFERENCES users(id),
    accounting_employee_id UUID REFERENCES users(id),
    
    -- Emaile
    primary_email VARCHAR(255),
    invoice_email VARCHAR(255),
    tax_notification_email VARCHAR(255),
    
    -- Notatki
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_update_by UUID REFERENCES users(id),
    
    -- Unikalność na miesiąc/rok/klienta
    UNIQUE(client_id, month, year)
);

-- Tabela dla deklaracji podatkowych
CREATE TABLE IF NOT EXISTS tax_declarations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    monthly_data_id UUID REFERENCES monthly_client_data(id) ON DELETE CASCADE,
    
    -- Typ deklaracji
    declaration_type VARCHAR(50) NOT NULL, -- VAT-7, PIT-4R, ZUS-DRA, etc.
    form_code VARCHAR(20),
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft' 
        CHECK (status IN ('draft', 'wyslana', 'otrzymana', 'weryfikowana', 'zakonczona', 'odrzucona')),
    
    -- Terminy
    due_date DATE NOT NULL,
    submitted_date DATE,
    accepted_date DATE,
    
    -- Wartości
    tax_amount DECIMAL(12,2),
    penalty_amount DECIMAL(12,2) DEFAULT 0,
    
    -- Pliki i dokumenty
    file_path TEXT,
    confirmation_number VARCHAR(100),
    
    -- Notatki
    notes TEXT,
    internal_notes TEXT, -- Notatki wewnętrzne
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    processed_by UUID REFERENCES users(id)
);

-- Tabela dla automatycznego trackingu aktywności
CREATE TABLE IF NOT EXISTS user_activity_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Aktywność
    activity_type VARCHAR(50) NOT NULL, -- login, logout, timer_start, timer_stop, document_upload
    entity_type VARCHAR(50), -- client, invoice, document, session
    entity_id UUID,
    
    -- Czas i lokalizacja
    activity_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    
    -- Dodatkowe dane
    activity_data JSONB,
    duration_seconds INTEGER, -- Dla sesji pracy
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================================================
-- FUNKCJE AUTOMATYCZNE
-- ================================================================================================

-- Funkcja do obliczania czasu trwania sesji
CREATE OR REPLACE FUNCTION calculate_session_duration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.end_time IS NOT NULL AND NEW.start_time IS NOT NULL THEN
        NEW.duration_minutes := EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 60;
        
        -- Oblicz wartość jeśli jest stawka godzinowa
        IF NEW.hourly_rate IS NOT NULL THEN
            NEW.total_value := (NEW.duration_minutes / 60.0) * NEW.hourly_rate;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger dla automatycznego obliczania czasu
CREATE TRIGGER calculate_session_duration_trigger
    BEFORE INSERT OR UPDATE ON time_sessions
    FOR EACH ROW EXECUTE FUNCTION calculate_session_duration();

-- Funkcja do aktualizacji czasu w monthly_client_data
CREATE OR REPLACE FUNCTION update_monthly_time_tracking()
RETURNS TRIGGER AS $$
DECLARE
    monthly_record RECORD;
BEGIN
    -- Znajdź odpowiedni rekord miesięczny
    SELECT * INTO monthly_record 
    FROM monthly_client_data 
    WHERE client_id = NEW.client_id 
    AND month = EXTRACT(MONTH FROM NEW.start_time)
    AND year = EXTRACT(YEAR FROM NEW.start_time);
    
    IF FOUND THEN
        -- Aktualizuj czas trackingu
        UPDATE monthly_client_data 
        SET total_time_tracked = (
            SELECT COALESCE(SUM(duration_minutes), 0)
            FROM time_sessions 
            WHERE client_id = NEW.client_id 
            AND status = 'completed'
            AND EXTRACT(MONTH FROM start_time) = monthly_record.month
            AND EXTRACT(YEAR FROM start_time) = monthly_record.year
        ),
        last_time_entry = NEW.end_time,
        updated_at = NOW()
        WHERE id = monthly_record.id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger dla aktualizacji miesięcznych danych
CREATE TRIGGER update_monthly_time_tracking_trigger
    AFTER UPDATE ON time_sessions
    FOR EACH ROW 
    WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
    EXECUTE FUNCTION update_monthly_time_tracking();

-- Funkcja do sprawdzania ograniczenia jednej aktywnej sesji
CREATE OR REPLACE FUNCTION check_single_active_session()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'active' THEN
        -- Sprawdź czy użytkownik ma już aktywną sesję
        IF EXISTS (
            SELECT 1 FROM time_sessions 
            WHERE user_id = NEW.user_id 
            AND status = 'active' 
            AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
        ) THEN
            RAISE EXCEPTION 'Użytkownik może mieć tylko jedną aktywną sesję czasu pracy';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger dla ograniczenia aktywnych sesji
CREATE TRIGGER check_single_active_session_trigger
    BEFORE INSERT OR UPDATE ON time_sessions
    FOR EACH ROW 
    WHEN (NEW.status = 'active')
    EXECUTE FUNCTION check_single_active_session();

-- Funkcja do logowania aktywności
CREATE OR REPLACE FUNCTION log_user_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
        INSERT INTO user_activity_tracking (
            user_id, activity_type, entity_type, entity_id, activity_data
        ) VALUES (
            NEW.user_id, 'timer_start', 'time_session', NEW.id,
            jsonb_build_object(
                'client_id', NEW.client_id,
                'project_name', NEW.project_name,
                'task_name', NEW.task_name
            )
        );
    ELSIF TG_OP = 'UPDATE' AND NEW.status = 'completed' AND OLD.status = 'active' THEN
        INSERT INTO user_activity_tracking (
            user_id, activity_type, entity_type, entity_id, 
            duration_seconds, activity_data
        ) VALUES (
            NEW.user_id, 'timer_stop', 'time_session', NEW.id,
            NEW.duration_minutes * 60,
            jsonb_build_object(
                'client_id', NEW.client_id,
                'duration_minutes', NEW.duration_minutes,
                'total_value', NEW.total_value
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger dla logowania aktywności
CREATE TRIGGER log_time_session_activity
    AFTER INSERT OR UPDATE ON time_sessions
    FOR EACH ROW EXECUTE FUNCTION log_user_activity();

-- ================================================================================================
-- INDEKSY DLA WYDAJNOŚCI
-- ================================================================================================

-- Time sessions indexes
CREATE INDEX IF NOT EXISTS idx_time_sessions_user_id ON time_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_time_sessions_client_id ON time_sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_time_sessions_status ON time_sessions(status);
CREATE INDEX IF NOT EXISTS idx_time_sessions_start_time ON time_sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_time_sessions_user_status ON time_sessions(user_id, status);

-- Monthly data indexes
CREATE INDEX IF NOT EXISTS idx_monthly_client_data_client_id ON monthly_client_data(client_id);
CREATE INDEX IF NOT EXISTS idx_monthly_client_data_period ON monthly_client_data(year, month);
CREATE INDEX IF NOT EXISTS idx_monthly_client_data_user_id ON monthly_client_data(user_id);

-- Tax declarations indexes
CREATE INDEX IF NOT EXISTS idx_tax_declarations_client_id ON tax_declarations(client_id);
CREATE INDEX IF NOT EXISTS idx_tax_declarations_due_date ON tax_declarations(due_date);
CREATE INDEX IF NOT EXISTS idx_tax_declarations_status ON tax_declarations(status);

-- Activity tracking indexes
CREATE INDEX IF NOT EXISTS idx_user_activity_tracking_user_id ON user_activity_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_tracking_time ON user_activity_tracking(activity_time);
CREATE INDEX IF NOT EXISTS idx_user_activity_tracking_type ON user_activity_tracking(activity_type);

-- ================================================================================================
-- WIDOKI DLA UŁATWIENIA ZAPYTAŃ
-- ================================================================================================

-- Widok aktywnych sesji z detalami klienta
CREATE OR REPLACE VIEW active_time_sessions AS
SELECT 
    ts.*,
    u.first_name,
    u.last_name,
    u.email,
    c.company_name,
    c.nip,
    EXTRACT(EPOCH FROM (NOW() - ts.start_time)) / 60 as current_duration_minutes
FROM time_sessions ts
JOIN users u ON ts.user_id = u.id
LEFT JOIN clients c ON ts.client_id = c.id
WHERE ts.status = 'active';

-- Widok miesięcznych statystyk czasu pracy
CREATE OR REPLACE VIEW monthly_time_statistics AS
SELECT 
    mcd.*,
    c.company_name,
    c.nip,
    u.first_name as manager_first_name,
    u.last_name as manager_last_name,
    hr.first_name as hr_first_name,
    hr.last_name as hr_last_name,
    acc.first_name as accounting_first_name,
    acc.last_name as accounting_last_name,
    (mcd.total_time_tracked / 60.0) as total_hours_tracked,
    CASE 
        WHEN mcd.documents_received > mcd.documents_limit THEN true 
        ELSE false 
    END as exceeds_document_limit,
    (mcd.documents_received - mcd.documents_limit) as documents_over_limit
FROM monthly_client_data mcd
JOIN clients c ON mcd.client_id = c.id
JOIN users u ON mcd.user_id = u.id
LEFT JOIN users hr ON mcd.hr_employee_id = hr.id
LEFT JOIN users acc ON mcd.accounting_employee_id = acc.id;

-- Widok raportów czasu pracy
CREATE OR REPLACE VIEW time_tracking_reports AS
SELECT 
    ts.user_id,
    u.first_name,
    u.last_name,
    ts.client_id,
    c.company_name,
    DATE_TRUNC('day', ts.start_time) as work_date,
    DATE_TRUNC('week', ts.start_time) as work_week,
    DATE_TRUNC('month', ts.start_time) as work_month,
    SUM(ts.duration_minutes) as total_minutes,
    SUM(ts.duration_minutes) / 60.0 as total_hours,
    SUM(ts.total_value) as total_value,
    COUNT(*) as session_count,
    AVG(ts.duration_minutes) as avg_session_minutes
FROM time_sessions ts
JOIN users u ON ts.user_id = u.id
LEFT JOIN clients c ON ts.client_id = c.id
WHERE ts.status = 'completed'
GROUP BY ts.user_id, u.first_name, u.last_name, ts.client_id, c.company_name,
         DATE_TRUNC('day', ts.start_time), DATE_TRUNC('week', ts.start_time), DATE_TRUNC('month', ts.start_time);

-- ================================================================================================
-- PRZYKŁADOWE ZAPYTANIA I FUNKCJE POMOCNICZE
-- ================================================================================================

-- Funkcja do pobierania aktywnej sesji użytkownika
CREATE OR REPLACE FUNCTION get_user_active_session(p_user_id UUID)
RETURNS TABLE (
    session_id UUID,
    client_name TEXT,
    project_name VARCHAR,
    task_name VARCHAR,
    start_time TIMESTAMP WITH TIME ZONE,
    duration_minutes NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ts.id,
        COALESCE(c.company_name, 'Bez klienta'),
        ts.project_name,
        ts.task_name,
        ts.start_time,
        EXTRACT(EPOCH FROM (NOW() - ts.start_time)) / 60
    FROM time_sessions ts
    LEFT JOIN clients c ON ts.client_id = c.id
    WHERE ts.user_id = p_user_id AND ts.status = 'active';
END;
$$ language 'plpgsql';

-- Funkcja do zatrzymywania aktywnej sesji
CREATE OR REPLACE FUNCTION stop_active_session(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    session_found BOOLEAN := false;
BEGIN
    UPDATE time_sessions 
    SET status = 'completed',
        end_time = NOW(),
        updated_at = NOW()
    WHERE user_id = p_user_id 
    AND status = 'active';
    
    GET DIAGNOSTICS session_found = FOUND;
    RETURN session_found;
END;
$$ language 'plpgsql';

-- Funkcja do generowania raportu czasu pracy
CREATE OR REPLACE FUNCTION generate_time_report(
    p_user_id UUID DEFAULT NULL,
    p_client_id UUID DEFAULT NULL,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    user_name TEXT,
    client_name TEXT,
    total_hours NUMERIC,
    total_value NUMERIC,
    session_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (u.first_name || ' ' || u.last_name) as user_name,
        COALESCE(c.company_name, 'Bez klienta') as client_name,
        ROUND((SUM(ts.duration_minutes) / 60.0)::numeric, 2) as total_hours,
        ROUND(SUM(COALESCE(ts.total_value, 0))::numeric, 2) as total_value,
        COUNT(*) as session_count
    FROM time_sessions ts
    JOIN users u ON ts.user_id = u.id
    LEFT JOIN clients c ON ts.client_id = c.id
    WHERE ts.status = 'completed'
    AND (p_user_id IS NULL OR ts.user_id = p_user_id)
    AND (p_client_id IS NULL OR ts.client_id = p_client_id)
    AND (p_start_date IS NULL OR DATE(ts.start_time) >= p_start_date)
    AND (p_end_date IS NULL OR DATE(ts.start_time) <= p_end_date)
    GROUP BY u.id, u.first_name, u.last_name, c.id, c.company_name
    ORDER BY total_hours DESC;
END;
$$ language 'plpgsql';

-- ================================================================================================
-- DANE PRZYKŁADOWE
-- ================================================================================================

-- Wstaw przykładowe kody ZUS (jeśli nie istnieją)
INSERT INTO zus_codes (code, name, pension_rate, disability_rate, sickness_rate, health_rate, is_active) 
VALUES 
    ('05 10', 'Pełne ubezpieczenie', 0.1976, 0.0650, 0.0245, 0.0900, true),
    ('05 70', 'Bez chorobowego', 0.1976, 0.0650, 0.0000, 0.0900, true),
    ('05 92', 'Tylko zdrowotne', 0.0000, 0.0000, 0.0000, 0.0900, true)
ON CONFLICT (code) DO NOTHING;

-- Przykładowe miesięczne dane (po utworzeniu klientów i użytkowników)
-- INSERT INTO monthly_client_data (client_id, user_id, month, year, documents_received, documents_limit)
-- SELECT c.id, u.id, 9, 2025, 25, 35
-- FROM clients c, users u 
-- WHERE c.company_name LIKE '%Sp. z o.o.%' 
-- AND u.role = 'ksiegowa' 
-- LIMIT 1;

-- ================================================================================================
-- ZAKOŃCZENIE SCHEMATU
-- ================================================================================================