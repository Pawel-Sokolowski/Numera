# ADR 002: State Management Architecture

## Status

Accepted

## Context

The application was using React's built-in state management (useState, useContext) which becomes difficult to manage as the application grows. We needed a scalable solution for both server and client state.

## Decision

We will use a hybrid approach:

1. **Server State**: React Query (@tanstack/react-query)
   - Handles data fetching, caching, synchronization
   - Built-in loading/error states
   - Automatic background refetching
   - Optimistic updates

2. **Client State**: Zustand
   - Simple, unopinionated state management
   - Minimal boilerplate
   - TypeScript support
   - React hooks integration
   - Middleware support (persist)

## Alternatives Considered

### Redux Toolkit

- **Pros**: Mature, extensive ecosystem, Redux DevTools
- **Cons**: More boilerplate, steeper learning curve, overkill for our needs

### MobX

- **Pros**: Simple reactive programming model
- **Cons**: Less popular, magical behavior can be confusing

### Zustand Only (for both server and client state)

- **Pros**: Single solution, simpler
- **Cons**: React Query has superior server state features (caching, refetching, etc.)

## Consequences

### Positive:

- Clear separation between server and client state
- Reduced boilerplate compared to Redux
- Better performance with automatic caching
- Type-safe state management
- Easier testing with mock data

### Negative:

- Learning curve for React Query concepts
- Two libraries to maintain
- Potential confusion about where to store state

## Implementation

- Query client: `src/lib/query-client.ts`
- Auth store: `src/stores/authStore.ts`
- App store: `src/stores/appStore.ts`
- Custom hooks: `src/hooks/useAuth.ts`, `src/hooks/useClients.ts`
