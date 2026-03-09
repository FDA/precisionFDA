# Copilot Code Review Instructions

This is a monorepo with four packages: `packages/rails` (Ruby/Rails), `packages/client` (React/TypeScript), `packages/server` (NestJS), and `packages/cli` (Go).

## API Routing

- `/api/` routes go to Rails (legacy)
- `/api/v2/` routes go to NestJS (modern)
- New endpoints should use `/api/v2/`
- Migrating from `/api/` to `/api/v2/` is acceptable - NGINX handles routing automatically

## TypeScript/React (packages/client/)

Flag these issues:
- Use of `any` type - should use proper types
- Missing error handling in async operations
- Direct DOM manipulation instead of React patterns
- Missing dependency arrays in useEffect/useCallback/useMemo
- Not using TanStack Query for API calls
- Hardcoded strings that should be constants
- Missing null/undefined checks before accessing properties
- Not using the `@/` path alias for imports from `src/`

Style requirements:
- Single quotes, no semicolons, trailing commas
- Unused parameters should be prefixed with `_`
- Functional components with hooks only

## Rails (packages/rails/)

Flag these issues:
- N+1 queries - should use includes/preload
- Mass assignment vulnerabilities
- Missing authorization checks in controllers
- SQL injection risks - use parameterized queries
- Hardcoded secrets or credentials
- Missing validations on models
- Skipping callbacks without justification

## NestJS (packages/server/)

Flag these issues:
- Not using dependency injection
- Missing input validation with class-validator or Zod
- Exposing internal errors to clients
- Missing guards/interceptors for auth
- Not using transactions for multi-step database operations
- Hardcoded configuration that should be in env

## Go CLI (packages/cli/)

Flag these issues:
- Unchecked errors - all errors must be handled
- Resource leaks - files/connections not closed
- Hardcoded paths or credentials

## Security (All Packages)

Always flag:
- Credentials, API keys, or secrets in code
- SQL injection vulnerabilities
- XSS vulnerabilities (unsanitized user input in HTML)
- Command injection (user input in shell commands)
- Insecure deserialization
- Missing authentication/authorization checks
- Sensitive data in logs
- CORS misconfigurations

## Testing

- New features should include tests
- Bug fixes should include regression tests
- API changes should update MSW mocks in `packages/client/src/mocks/handlers.ts`

# Verification
- To every PR commit you (Github Copilot) create append - "Verified." at the end of the comment 
