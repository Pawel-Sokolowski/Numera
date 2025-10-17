# Migration Guide

This guide helps migrate existing code to use the new architecture patterns introduced in the refactor.

## Overview of Changes

The refactor introduces several new patterns:

1. React Query for server state
2. Zustand for client state
3. Centralized API client
4. Zod validation schemas
5. TypeScript strict mode

## Migrating to React Query

### Before (Direct API Calls)

```typescript
const [clients, setClients] = useState<Client[]>([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<Error | null>(null);

useEffect(() => {
  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/clients');
      const data = await response.json();
      setClients(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  fetchClients();
}, []);
```

### After (React Query)

```typescript
import { useClients } from '../hooks/useClients';

const { clients, isLoading, isError, error } = useClients();

// That's it! Caching, refetching, and error handling are automatic
```

## Migrating to Zustand

### Before (useState/Context)

```typescript
// In parent component
const [currentView, setCurrentView] = useState('dashboard');

// Pass down through props
<ChildComponent currentView={currentView} onViewChange={setCurrentView} />
```

### After (Zustand)

```typescript
// In any component
import { useAppStore } from '../stores/appStore';

const { currentView, setView } = useAppStore();

// Use directly, no prop drilling
<button onClick={() => setView('clients')}>Go to Clients</button>
```

## Migrating to Centralized API Client

### Before (Direct Fetch/Axios)

```typescript
const response = await fetch('/api/clients', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify(data),
});
```

### After (API Client)

```typescript
import { apiClient } from '../lib/api-client';

// Authentication headers added automatically
const response = await apiClient.post('/clients', data);
```

## Using Validation Schemas

### Before (Manual Validation)

```typescript
const validateClient = (client: Client) => {
  if (!client.name) return 'Name is required';
  if (client.nip.length !== 10) return 'NIP must be 10 digits';
  if (!client.email.includes('@')) return 'Invalid email';
  // ... more validation
};
```

### After (Zod Schemas)

```typescript
import { clientSchema } from '../lib/validation';

const result = clientSchema.safeParse(clientData);
if (!result.success) {
  // result.error contains detailed validation errors
  console.error(result.error.errors);
  return;
}

// result.data is type-safe and validated
const validatedClient = result.data;
```

## Authentication Migration

### Before (Manual Token Management)

```typescript
const login = async (username: string, password: string) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  const { token } = await response.json();
  localStorage.setItem('token', token);
  setUser(response.user);
};
```

### After (Auth Hook)

```typescript
import { useAuth } from '../hooks/useAuth';

const { login, logout, user, isAuthenticated } = useAuth();

// Tokens, storage, and state managed automatically
await login({ username, password });
```

## Form Validation with React Hook Form

### Integration with Zod

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { clientSchema } from '../lib/validation';

const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm({
  resolver: zodResolver(clientSchema),
});

const onSubmit = async (data) => {
  // data is already validated
  await createClient(data);
};
```

## TypeScript Strict Mode

### Common Issues and Fixes

#### Null/Undefined Checks

```typescript
// Before
const userName = user.name; // Error if user might be null

// After
const userName = user?.name ?? 'Guest';
```

#### Any Types

```typescript
// Before
const data: any = await fetchData();

// After
interface DataType {
  id: string;
  name: string;
}
const data: DataType = await fetchData();
```

#### Function Parameters

```typescript
// Before
function processClient(client) {
  // client type is implicit any
}

// After
function processClient(client: Client) {
  // fully typed
}
```

## Database Queries

### Before (String Interpolation)

```typescript
// ❌ SQL Injection Risk
const query = `SELECT * FROM clients WHERE name = '${name}'`;
await pool.query(query);
```

### After (Parameterized Queries)

```typescript
// ✅ Safe
const query = 'SELECT * FROM clients WHERE name = $1';
await pool.query(query, [name]);
```

## Component Testing

### Before (No Tests)

```typescript
// Component code with no tests
```

### After (With Tests)

```typescript
// MyComponent.tsx
export const MyComponent = ({ title }: { title: string }) => {
  return <h1>{title}</h1>;
};

// MyComponent.test.tsx
import { render, screen } from '../test/test-utils';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders title', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

## Migration Checklist

When migrating a feature:

- [ ] Replace direct API calls with custom hooks
- [ ] Add Zod validation schemas
- [ ] Use Zustand for local state
- [ ] Use React Query for server state
- [ ] Add TypeScript types (no `any`)
- [ ] Write unit tests for business logic
- [ ] Write component tests for UI
- [ ] Update documentation

## Step-by-Step Migration Example

### Example: Migrating Client Management

#### 1. Create API Service

```typescript
// src/api/clients.ts
import { apiClient } from '../lib/api-client';
import { Client } from '../types/client';

export const clientsApi = {
  getAll: async (): Promise<Client[]> => {
    const response = await apiClient.get<Client[]>('/clients');
    return response.data;
  },
  // ... more methods
};
```

#### 2. Create Custom Hook

```typescript
// src/hooks/useClients.ts
import { useQuery } from '@tanstack/react-query';
import { clientsApi } from '../api/clients';

export const useClients = () => {
  const query = useQuery({
    queryKey: ['clients'],
    queryFn: clientsApi.getAll,
  });

  return {
    clients: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
  };
};
```

#### 3. Update Component

```typescript
// src/components/ClientList.tsx
import { useClients } from '../hooks/useClients';

export const ClientList = () => {
  const { clients, isLoading, error } = useClients();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {clients.map((client) => (
        <li key={client.id}>{client.name}</li>
      ))}
    </ul>
  );
};
```

#### 4. Add Tests

```typescript
// src/components/__tests__/ClientList.test.tsx
import { render, screen, waitFor } from '../../test/test-utils';
import { ClientList } from '../ClientList';
import { clientsApi } from '../../api/clients';

vi.mock('../../api/clients');

describe('ClientList', () => {
  it('displays clients', async () => {
    clientsApi.getAll.mockResolvedValue([
      { id: '1', name: 'Client 1' },
      { id: '2', name: 'Client 2' },
    ]);

    render(<ClientList />);

    await waitFor(() => {
      expect(screen.getByText('Client 1')).toBeInTheDocument();
      expect(screen.getByText('Client 2')).toBeInTheDocument();
    });
  });
});
```

## Breaking Changes

### None!

The refactor is designed to be non-breaking. All existing code continues to work. New patterns can be adopted gradually.

## Getting Help

- Review existing migrated code in `src/hooks/` and `src/api/`
- Check Architecture Decision Records in `docs/adr/`
- See Testing Guide in `docs/guides/TESTING_GUIDE.md`
- Ask questions in team channels

## Next Steps

After migrating core features, consider:

1. Adding E2E tests for critical flows
2. Improving test coverage to 80%+
3. Refactoring remaining components
4. Adding performance monitoring
