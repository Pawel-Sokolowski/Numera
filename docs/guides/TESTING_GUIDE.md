# Testing Guide

This guide explains how to write and run tests in the Numera application.

## Test Infrastructure

The project uses a multi-layered testing approach:

1. **Unit Tests** - Vitest for testing individual functions and utilities
2. **Component Tests** - React Testing Library for testing React components
3. **E2E Tests** - Playwright for end-to-end testing

## Running Tests

### Unit & Component Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### E2E Tests

```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Install Playwright browsers (first time only)
npx playwright install
```

## Writing Unit Tests

### Example: Testing Validation Schemas

```typescript
import { describe, it, expect } from 'vitest';
import { clientSchema } from '../validation';

describe('clientSchema', () => {
  it('should validate a correct client', () => {
    const validClient = {
      name: 'Test Company',
      nip: '1234567890',
      email: 'test@example.com',
      phone: '123456789',
      address: 'Test Street 1',
      city: 'Warsaw',
      postalCode: '00-001',
    };

    const result = clientSchema.safeParse(validClient);
    expect(result.success).toBe(true);
  });
});
```

### Example: Testing React Hooks

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useClients } from '../useClients';

describe('useClients', () => {
  it('should fetch clients', async () => {
    const queryClient = new QueryClient();
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useClients(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.clients).toBeDefined();
  });
});
```

## Writing Component Tests

### Example: Testing a Button Component

```typescript
import { render, screen } from '../test/test-utils';
import { Button } from '../components/ui/button';

describe('Button', () => {
  it('should render with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should call onClick when clicked', async () => {
    const handleClick = vi.fn();
    const { user } = render(<Button onClick={handleClick}>Click me</Button>);

    await user.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

## Writing E2E Tests

### Example: Testing User Login Flow

```typescript
import { test, expect } from '@playwright/test';

test.describe('Login', () => {
  test('should allow user to login', async ({ page }) => {
    await page.goto('/');

    // Fill login form
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', 'password123');

    // Click login button
    await page.click('button[type="submit"]');

    // Verify redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });
});
```

## Test Organization

```
src/
├── lib/
│   ├── __tests__/
│   │   └── validation.test.ts
│   └── validation.ts
├── hooks/
│   ├── __tests__/
│   │   └── useAuth.test.ts
│   └── useAuth.ts
├── components/
│   ├── ui/
│   │   ├── __tests__/
│   │   │   └── button.test.tsx
│   │   └── button.tsx
└── test/
    ├── setup.ts
    └── test-utils.tsx

e2e/
├── auth.spec.ts
├── clients.spec.ts
└── invoices.spec.ts
```

## Test Utilities

### Custom Render Function

The custom render function in `src/test/test-utils.tsx` wraps components with necessary providers:

```typescript
import { render } from '../test/test-utils';

// Automatically includes QueryClientProvider and BrowserRouter
render(<MyComponent />);
```

### Mocking API Calls

```typescript
import { vi } from 'vitest';
import { apiClient } from '../lib/api-client';

vi.mock('../lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('MyComponent', () => {
  it('should fetch data', async () => {
    apiClient.get.mockResolvedValue({ data: [] });
    // Test component
  });
});
```

## CI/CD Integration

Tests run automatically on:

- Every push to main/develop
- Every pull request
- Can be manually triggered

See `.github/workflows/ci.yml` for CI configuration.

## Coverage Reports

Coverage reports are generated in `coverage/` directory:

```bash
npm run test:coverage

# View HTML report
open coverage/index.html
```

## Best Practices

### Unit Tests

- Test one thing per test
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Mock external dependencies
- Test edge cases and error scenarios

### Component Tests

- Test from user perspective
- Use semantic queries (getByRole, getByLabelText)
- Test user interactions
- Verify accessibility
- Don't test implementation details

### E2E Tests

- Test critical user workflows
- Use page objects for complex pages
- Handle async operations properly
- Take screenshots on failure
- Keep tests independent

## Debugging Tests

### Vitest

```bash
# Run specific test file
npm run test src/lib/__tests__/validation.test.ts

# Run tests matching pattern
npm run test -- --grep "client"

# Debug in VS Code
# Add breakpoint and use "Debug Test" CodeLens
```

### Playwright

```bash
# Run in headed mode
npm run test:e2e -- --headed

# Run in debug mode
npm run test:e2e -- --debug

# Run specific test
npm run test:e2e e2e/auth.spec.ts
```

## Common Issues

### Test Timeouts

Increase timeout in test:

```typescript
test('long running test', async () => {
  // test code
}, 10000); // 10 seconds
```

### Async Testing

Always use `waitFor` for async operations:

```typescript
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});
```

### Module Mocking

Mock modules before importing:

```typescript
vi.mock('../api/clients');
import { useClients } from '../hooks/useClients';
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
