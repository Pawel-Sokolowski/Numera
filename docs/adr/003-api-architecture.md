# ADR 003: API Client Architecture

## Status

Accepted

## Context

The application was making direct fetch/axios calls scattered throughout components. This made it difficult to:

- Add authentication headers consistently
- Handle token refresh
- Implement error handling
- Mock API calls for testing
- Type API responses

## Decision

We will implement a centralized API client architecture:

1. **API Client Class** (`src/lib/api-client.ts`)
   - Wraps Axios with configuration
   - Handles authentication tokens
   - Implements token refresh logic
   - Provides TypeScript-typed methods

2. **API Service Modules** (`src/api/`)
   - Organized by domain (clients, auth, invoices)
   - Type-safe API methods
   - Business logic separated from HTTP logic

3. **Custom Hooks** (`src/hooks/`)
   - React Query hooks for each domain
   - Handles loading/error states
   - Optimistic updates
   - Cache invalidation

## Alternatives Considered

### Direct Fetch Calls

- **Pros**: No dependencies, native
- **Cons**: Verbose, no interceptors, manual error handling

### GraphQL (Apollo Client)

- **Pros**: Flexible queries, type generation
- **Cons**: Requires GraphQL server, overkill for REST API

### tRPC

- **Pros**: End-to-end type safety, RPC-style
- **Cons**: Requires TypeScript on server, not REST

## Consequences

### Positive:

- Centralized authentication logic
- Consistent error handling
- Easy to mock for testing
- Type-safe API calls
- Automatic token refresh
- Better code organization

### Negative:

- Abstraction layer to maintain
- Learning curve for new patterns
- Additional bundle size (Axios)

## Implementation

- API client: `src/lib/api-client.ts`
- Auth API: `src/api/auth.ts`
- Clients API: `src/api/clients.ts`
- Auth hook: `src/hooks/useAuth.ts`
- Clients hook: `src/hooks/useClients.ts`
