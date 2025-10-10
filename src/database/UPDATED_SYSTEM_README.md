# SYSTEM ZARZĄDZANIA BIUREM - ZAKTUALIZOWANA DOKUMENTACJA

## 🎯 Najnowsze Zmiany

### Reorganizacja Menu
- **Kalendarz** → przeniesiony do sekcji **Komunikacja**
- **Dokumenty** → przeniesione do sekcji **Zarządzanie Klientami**
- **Dane Miesięczne** → przeniesione do sekcji **Zarządzanie Klientami**

### Poprawki Czasomierza
- ✅ Czasomierz teraz **liczy czas** w czasie rzeczywistym
- ✅ **Tylko jedna aktywna sesja** na użytkownika
- ✅ Blokada rozpoczynania nowego czasomierza gdy inny jest aktywny
- ✅ Poprawne zatrzymywanie z wyświetlaniem czasu trwania
- ✅ Integracja z localStorage dla trwałości

### Uproszczenie Danych Miesięcznych
- ✅ **Dokumenty**: pokazuje tylko liczbę (nie 28/35)
- ✅ **Czerwone ostrzeżenie** gdy przekracza limit (domyślnie 35)
- ✅ **Edytowalne pole** dla liczby dokumentów
- ✅ Usunięto zbędne komplikacje z progress barami

## 📊 Nowa Struktura Menu

### 🏢 Zarządzanie Klientami
- Panel Główny
- Wszyscy Klienci  
- Dodaj Klienta
- **📁 Dokumenty** *(przeniesione)*
- **📊 Dane Miesięczne** *(przeniesione)*

### 💬 Komunikacja
- Chat Zespołowy
- Centrum Email
- **📅 Kalendarz** *(przeniesiony)*

### 💼 Biznes
- Faktury
- Automatyczne Faktury
- Szablony Faktur
- Integracja Bankowa
- Zarządzanie Kontraktami

### 🏗️ Organizacja
- Raport Czasu Pracy
- Zarządzanie Personelem
- Szablony Email

### ⚙️ Ustawienia
- Mój Profil
- Preferencje

## ⏱️ System Czasomierza - Nowe Funkcje

### Ograniczenia i Zabezpieczenia
```typescript
// Tylko jedna aktywna sesja na użytkownika
if (activeTimer) {
  toast.error("Zatrzymaj obecny czasomierz przed rozpoczęciem nowego");
  return;
}
```

### Real-time Tracking
- Odliczanie w czasie rzeczywistym (aktualizacja co sekundę)
- Automatyczne zapisywanie do localStorage
- Wyświetlanie w formacie HH:MM:SS
- Informacje o kliencie i zadaniu

### Integracja z Danymi Miesięcznymi
- Automatyczne dodawanie czasu do miesięcznych statystyk
- Tracking dla konkretnych klientów
- Podział na kategorie pracy

## 📋 Dane Miesięczne - Nowy Format

### Dokumenty (uproszczone)
```sql
-- Stara wersja: documentsReceived/documentsTotal (28/35)
-- Nowa wersja: tylko liczba z ostrzeżeniem

documents_received INTEGER DEFAULT 0,
documents_limit INTEGER DEFAULT 35, -- próg ostrzeżenia
```

### Wyświetlanie
- **Zwykły**: `28 dokumentów`
- **Przekroczenie**: `38 dokumentów` *(czerwony tekst)*
- **Badge ostrzeżenia**: `Przekracza o 3` *(czerwony badge)*

### Edycja
- Pole input type="number"
- Czerwone tło gdy przekracza limit
- Automatyczny zapis zmian

## 🗄️ PostgreSQL - Rozszerzony Schemat

### Nowe Tabele dla Czasomierza

#### `time_sessions` - Sesje czasowe
```sql
CREATE TABLE time_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    client_id UUID REFERENCES clients(id),
    project_name VARCHAR(200),
    task_name VARCHAR(200),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    status VARCHAR(20) DEFAULT 'active',
    is_billable BOOLEAN DEFAULT true,
    hourly_rate DECIMAL(8,2),
    -- Constraint: tylko jedna aktywna sesja na użytkownika
    UNIQUE(user_id, status) DEFERRABLE INITIALLY DEFERRED
);
```

#### `monthly_client_data` - Miesięczne dane (uproszczone)
```sql
CREATE TABLE monthly_client_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id),
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL,
    -- Dokumenty (uproszczone)
    documents_received INTEGER DEFAULT 0,
    documents_limit INTEGER DEFAULT 35,
    -- Agregowany czas pracy
    total_time_tracked INTEGER DEFAULT 0, -- minuty
    -- Inne pola...
    UNIQUE(client_id, month, year)
);
```

### Automatyczne Funkcje PostgreSQL

#### Ograniczenie Jednej Aktywnej Sesji
```sql
CREATE OR REPLACE FUNCTION check_single_active_session()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'active' THEN
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
$$;
```

#### Automatyczne Obliczanie Czasu
```sql
CREATE OR REPLACE FUNCTION calculate_session_duration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.end_time IS NOT NULL AND NEW.start_time IS NOT NULL THEN
        NEW.duration_minutes := EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 60;
        IF NEW.hourly_rate IS NOT NULL THEN
            NEW.total_value := (NEW.duration_minutes / 60.0) * NEW.hourly_rate;
        END IF;
    END IF;
    RETURN NEW;
END;
$$;
```

#### Aktualizacja Miesięcznych Statystyk
```sql
CREATE OR REPLACE FUNCTION update_monthly_time_tracking()
RETURNS TRIGGER AS $$
BEGIN
    -- Aktualizuj czas w monthly_client_data po zakończeniu sesji
    UPDATE monthly_client_data 
    SET total_time_tracked = (
        SELECT COALESCE(SUM(duration_minutes), 0)
        FROM time_sessions 
        WHERE client_id = NEW.client_id 
        AND status = 'completed'
        AND EXTRACT(MONTH FROM start_time) = EXTRACT(MONTH FROM NEW.start_time)
        AND EXTRACT(YEAR FROM start_time) = EXTRACT(YEAR FROM NEW.start_time)
    )
    WHERE client_id = NEW.client_id;
    RETURN NEW;
END;
$$;
```

## 🔧 Funkcje Pomocnicze

### Pobieranie Aktywnej Sesji
```sql
CREATE OR REPLACE FUNCTION get_user_active_session(p_user_id UUID)
RETURNS TABLE (
    session_id UUID,
    client_name TEXT,
    project_name VARCHAR,
    start_time TIMESTAMP WITH TIME ZONE,
    duration_minutes NUMERIC
);
```

### Zatrzymywanie Sesji
```sql
CREATE OR REPLACE FUNCTION stop_active_session(p_user_id UUID)
RETURNS BOOLEAN;
```

### Generowanie Raportów
```sql
CREATE OR REPLACE FUNCTION generate_time_report(
    p_user_id UUID DEFAULT NULL,
    p_client_id UUID DEFAULT NULL,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
) RETURNS TABLE (
    user_name TEXT,
    client_name TEXT,
    total_hours NUMERIC,
    total_value NUMERIC
);
```

## 📈 Widoki dla Raportowania

### Aktywne Sesje
```sql
CREATE VIEW active_time_sessions AS
SELECT 
    ts.*,
    u.first_name,
    u.last_name,
    c.company_name,
    EXTRACT(EPOCH FROM (NOW() - ts.start_time)) / 60 as current_duration_minutes
FROM time_sessions ts
JOIN users u ON ts.user_id = u.id
LEFT JOIN clients c ON ts.client_id = c.id
WHERE ts.status = 'active';
```

### Miesięczne Statystyki
```sql
CREATE VIEW monthly_time_statistics AS
SELECT 
    mcd.*,
    c.company_name,
    (mcd.total_time_tracked / 60.0) as total_hours_tracked,
    CASE 
        WHEN mcd.documents_received > mcd.documents_limit THEN true 
        ELSE false 
    END as exceeds_document_limit,
    (mcd.documents_received - mcd.documents_limit) as documents_over_limit
FROM monthly_client_data mcd
JOIN clients c ON mcd.client_id = c.id;
```

## 🚀 Implementacja Frontend

### TypeScript Interfaces
```typescript
interface TimeSession {
  id: string;
  userId: string;
  clientId: string;
  projectName: string;
  taskName: string;
  startTime: string;
  endTime?: string;
  duration: number; // minuty
  status: 'active' | 'completed' | 'paused';
  isbillable: boolean;
  hourlyRate?: number;
}

interface MonthlyClientData {
  clientId: string;
  month: number;
  year: number;
  documentsReceived: number;
  documentsLimit: number; // domyślnie 35
  totalTimeTracked: number; // minuty
  // inne pola...
}
```

### Hooks dla Czasomierza
```typescript
const useTimeTracker = () => {
  const [activeSession, setActiveSession] = useState<TimeSession | null>(null);
  
  const startTimer = (clientId: string, projectName: string, taskName: string) => {
    if (activeSession) {
      throw new Error("Zatrzymaj obecny czasomierz przed rozpoczęciem nowego");
    }
    // Start timer logic...
  };
  
  const stopTimer = () => {
    // Stop timer logic...
  };
  
  return { activeSession, startTimer, stopTimer };
};
```

## 📊 Migracja Danych

### Z Starego Formatu Dokumentów
```sql
-- Migracja z documentsReceived/documentsTotal do nowego formatu
UPDATE monthly_client_data 
SET documents_limit = 35 
WHERE documents_limit IS NULL;

-- Usuń niepotrzebne pola
ALTER TABLE monthly_client_data DROP COLUMN IF EXISTS documents_total;
ALTER TABLE monthly_client_data DROP COLUMN IF EXISTS documents_progress;
```

### Przykładowe Dane
```sql
-- Wstaw przykładowe dane miesięczne
INSERT INTO monthly_client_data (
    client_id, user_id, month, year, 
    documents_received, documents_limit,
    employees_contract, employees_fulltime
) VALUES 
    ('client-1', 'user-1', 9, 2025, 28, 35, 3, 12),
    ('client-2', 'user-1', 9, 2025, 38, 35, 2, 6); -- przekracza limit
```

## 🔍 Monitoring i Alerty

### Przekroczenie Limitów Dokumentów
```sql
-- Zapytanie dla alertów
SELECT 
    c.company_name,
    mcd.documents_received,
    mcd.documents_limit,
    (mcd.documents_received - mcd.documents_limit) as over_limit
FROM monthly_client_data mcd
JOIN clients c ON mcd.client_id = c.id
WHERE mcd.documents_received > mcd.documents_limit
AND mcd.month = EXTRACT(MONTH FROM NOW())
AND mcd.year = EXTRACT(YEAR FROM NOW());
```

### Długo Trwające Sesje
```sql
-- Sesje trwające > 8 godzin
SELECT *
FROM active_time_sessions
WHERE current_duration_minutes > 480;
```

## 🎨 Stylowanie CSS

### Czerwone Ostrzeżenie dla Dokumentów
```css
.documents-over-limit {
  color: #dc2626; /* red-600 */
  font-weight: 600;
}

.documents-input-over-limit {
  border-color: #ef4444; /* red-500 */
  background-color: #fef2f2; /* red-50 */
}
```

### Aktywny Czasomierz
```css
.active-timer {
  background-color: #f0fdf4; /* green-50 */
  border-color: #bbf7d0; /* green-200 */
  color: #15803d; /* green-700 */
}

.timer-pulse {
  animation: pulse 2s ease-in-out infinite;
}
```

## 📚 Dodatkowa Dokumentacja

- `/database/complete_system_schema.sql` - Pełny schemat PostgreSQL
- `/database/time_tracking_schema.sql` - Rozszerzony schemat czasomierza
- `/utils/supabaseIntegration.ts` - Integracja z Supabase
- `/components/TimeTracker.tsx` - Główny komponent czasomierza
- `/components/MonthlyDataPanel.tsx` - Uproszczony panel miesięczny
- `/components/ActiveTimerDisplay.tsx` - Wyświetlacz aktywnego czasomierza

System jest teraz w pełni przygotowany pod PostgreSQL z automatycznymi funkcjami, ograniczeniami i raportowaniem oraz zawiera wszystkie poprawki czasomierza i uproszczenia danych miesięcznych.