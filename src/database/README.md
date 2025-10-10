# Chat System - Integracja z PostgreSQL/Supabase

Ten dokument zawiera instrukcje dotyczące integracji systemu chat'a zespołowego z bazą danych PostgreSQL lub Supabase.

## Schemat bazy danych

Plik `chat_schema.sql` zawiera kompletny schemat bazy danych przygotowany pod PostgreSQL/Supabase.

### Główne tabele:

1. **users** - Użytkownicy systemu z rolami i statusem online
2. **chat_channels** - Kanały zespołowe (publiczne/prywatne)
3. **channel_members** - Członkowie kanałów z uprawnieniami
4. **chat_messages** - Wiadomości (zarówno kanałowe jak i prywatne)
5. **message_read_status** - Status przeczytania wiadomości
6. **message_attachments** - Załączniki do wiadomości
7. **conversations** - Konwersacje prywatne między użytkownikami

## Integracja z Supabase

### Krok 1: Utworzenie projektu Supabase

1. Idź na [supabase.com](https://supabase.com)
2. Utwórz nowy projekt
3. Skopiuj URL projektu i klucz API

### Krok 2: Wykonanie schematu

1. W panelu Supabase przejdź do SQL Editor
2. Skopiuj zawartość pliku `chat_schema.sql`
3. Wykonaj zapytanie, aby utworzyć wszystkie tabele i funkcje

### Krok 3: Konfiguracja RLS (Row Level Security)

Schemat zawiera już podstawowe polityki RLS, ale możesz je dostosować:

```sql
-- Przykład polityki dla wiadomości kanałowych
CREATE POLICY "Channel members can view messages" ON chat_messages
FOR SELECT USING (
  channel_id IS NOT NULL AND 
  EXISTS (
    SELECT 1 FROM channel_members 
    WHERE channel_id = chat_messages.channel_id 
    AND user_id = auth.uid()
  )
);
```

### Krok 4: Konfiguracja Real-time

1. W panelu Supabase przejdź do Settings > API
2. Włącz Real-time dla tabeli `chat_messages`
3. Skonfiguruj filtry dla kanałów i wiadomości prywatnych

### Krok 5: Integracja z frontend

1. Zainstaluj Supabase client:
```bash
npm install @supabase/supabase-js
```

2. Utwórz plik konfiguracyjny `lib/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

3. Zamień mock implementacje w `utils/chatDatabase.ts` na prawdziwe zapytania Supabase

### Przykłady zapytań

#### Pobieranie kanałów użytkownika:
```typescript
const { data: channels } = await supabase
  .from('channel_with_members')
  .select('*')
  .contains('members', [{ user_id: userId }]);
```

#### Wysyłanie wiadomości:
```typescript
const { data: message } = await supabase
  .from('chat_messages')
  .insert({
    channel_id: channelId,
    sender_id: senderId,
    content: content,
    message_type: 'text'
  })
  .select(`
    *,
    sender:users!sender_id(first_name, last_name)
  `)
  .single();
```

#### Real-time subscription:
```typescript
const subscription = supabase
  .channel(`channel_${channelId}`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'chat_messages',
      filter: `channel_id=eq.${channelId}`
    },
    (payload) => {
      // Obsługa nowej wiadomości
      handleNewMessage(payload.new);
    }
  )
  .subscribe();
```

## Integracja z PostgreSQL (bez Supabase)

Jeśli używasz czystego PostgreSQL:

1. Utwórz bazę danych
2. Wykonaj schemat z `chat_schema.sql`
3. Użyj biblioteki jak `pg` lub `prisma` do połączenia
4. Zaimplementuj własne API endpoints
5. Użyj WebSocket lub Server-Sent Events dla real-time

### Przykład z Prisma:

1. Zainstaluj Prisma:
```bash
npm install prisma @prisma/client
```

2. Generuj schemat Prisma na podstawie bazy:
```bash
npx prisma db pull
npx prisma generate
```

3. Użyj Prisma Client w aplikacji

## Funkcjonalności systemu chat

### Obecne funkcjonalności:
- ✅ Kanały zespołowe (publiczne/prywatne)
- ✅ Wiadomości prywatne między użytkownikami
- ✅ Funkcja "Nowa wiadomość" z wyborem odbiorcy
- ✅ Lista konwersacji z ostatnimi wiadomościami
- ✅ Oznaczanie wiadomości jako przeczytane
- ✅ Wyszukiwanie kanałów i użytkowników
- ✅ Responsywny design

### Do implementacji z backendem:
- ⏳ Real-time synchronizacja wiadomości
- ⏳ Załączniki do wiadomości
- ⏳ Status online/offline użytkowników
- ⏳ Powiadomienia push
- ⏳ Edycja i usuwanie wiadomości
- ⏳ Wspominanie użytkowników (@username)
- ⏳ Archiwizowanie konwersacji
- ⏳ Wyszukiwanie w treści wiadomości

## Bezpieczeństwo

### RLS Policies
Schemat zawiera podstawowe polityki bezpieczeństwa:
- Użytkownicy widzą tylko kanały, do których należą
- Wiadomości prywatne są widoczne tylko dla nadawcy i odbiorcy
- Tylko członkowie kanału mogą wysyłać wiadomości
- Użytkownicy mogą edytować tylko swoje wiadomości

### Zalecenia:
- Używaj zmiennych środowiskowych dla kluczy API
- Implementuj rate limiting dla API
- Waliduj wszystkie dane wejściowe
- Używaj HTTPS w produkcji
- Regularne backupy bazy danych

## Skalowanie

### Optymalizacje:
- Indeksy na często używanych kolumnach
- Paginacja wiadomości
- Cachowanie częstych zapytań
- Kompresja załączników
- CDN dla plików statycznych

### Monitoring:
- Logi błędów
- Metryki wydajności
- Monitoring bazy danych
- Alerty dla nietypowej aktywności

## Migracja danych

Jeśli masz istniejące dane chat, utwórz skrypty migracji:

1. Mapuj istniejące struktury na nowy schemat
2. Przetestuj migrację na kopii danych
3. Wykonaj migrację w trybie maintenance
4. Zweryfikuj integralność danych

## Wsparcie

W przypadku problemów z integracją:
1. Sprawdź logi błędów
2. Zweryfikuj połączenie z bazą danych
3. Sprawdź polityki RLS
4. Przetestuj zapytania w SQL Editor