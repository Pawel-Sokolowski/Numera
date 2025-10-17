# ADR 001: Testing Infrastructure

## Status

Accepted

## Context

The application previously had no formal testing infrastructure. Manual testing was the only quality assurance method, which is time-consuming, error-prone, and doesn't scale with application growth.

## Decision

We will implement a comprehensive testing strategy:

1. **Unit/Integration Tests**: Vitest for testing business logic and React components
2. **Component Tests**: React Testing Library for testing user interactions
3. **E2E Tests**: Playwright for testing complete user workflows
4. **Coverage**: Target 80% code coverage for critical paths

### Tools Selected:

- **Vitest**: Fast, ESM-first test runner with excellent TypeScript support
- **React Testing Library**: Encourages testing from user perspective
- **Playwright**: Cross-browser E2E testing with excellent debugging tools
- **@testing-library/jest-dom**: Better assertions for DOM testing

## Consequences

### Positive:

- Automated regression testing
- Confidence in refactoring
- Documentation through tests
- Faster development cycles
- CI/CD integration

### Negative:

- Initial time investment to write tests
- Learning curve for team members
- Maintenance overhead for tests
- Slower initial development

## Implementation

- Test configuration: `vitest.config.ts`, `playwright.config.ts`
- Test utilities: `src/test/test-utils.tsx`
- CI integration: `.github/workflows/ci.yml`
