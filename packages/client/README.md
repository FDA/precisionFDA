# PFDA Web Client Application

The main React frontend for the precisionFDA project.

## Tech Stack

- **Build Tool**: [Vite](https://vitejs.dev/) (v7+)
- **Package Manager**: [pnpm](https://pnpm.io/) (v10.10.0)
- **Framework**: React 19 with TypeScript
- **Routing**: React Router v7
- **Styling**: styled-components, CSS Modules
- **State Management**: TanStack React Query
- **Forms**: React Hook Form with Yup validation
- **Rich Text Editor**: Lexical
- **Code Editor**: Monaco Editor
- **Testing**: Vitest (unit), Playwright (e2e)
- **Component Development**: Storybook
- **API Mocking**: MSW (Mock Service Worker)

## Prerequisites

- Node.js 22+
- pnpm 10.10.0 (`npm i -g pnpm@10.10.0`)
- SSL certificates for HTTPS development (see below)

## Getting Started

### Local Development

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Start the development server**:
   ```bash
   pnpm dev
   ```

3. **Open the application**:
   Navigate to `https://localhost:4000`

### Development with MSW Mocks

To run the frontend with mocked API responses (useful for isolated frontend development):

```bash
pnpm dev:msw
```

## Docker Development

The client can be built and run using Docker Compose. From the repository root:

```bash
# Start the full development stack
docker compose -f docker/dev.docker-compose.yml up

# Build only the frontend (outputs to rails/app/assets/packs)
docker compose -f docker/dev.docker-compose.yml up frontend
```

### Docker Services

| Service | Description | Port |
|---------|-------------|------|
| `frontend` | Vite build for client | - |
| `web` | Rails API server | 5012 (internal 3000) |
| `nodejs-api` | Node.js API server | 3001 |
| `nodejs-worker` | Background worker | - |
| `nginx` | Reverse proxy | 3000 (HTTPS) |
| `db` | MySQL 8.0 | 32800 |
| `redis` | Redis cache | 6379 |

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Vite development server on port 4000 |
| `pnpm dev:msw` | Start dev server with MSW mocks enabled |
| `pnpm build` | Production build (outputs to `rails/app/assets/packs`) |
| `pnpm build:dev` | Development build |
| `pnpm start` | Preview production build |
| `pnpm test` | Run Vitest in watch mode |
| `pnpm test:run` | Run Vitest once |
| `pnpm test:ui` | Run Vitest with UI |
| `pnpm test:e2e` | Run Playwright E2E tests |
| `pnpm test:e2e:ui` | Run E2E tests with Playwright UI |
| `pnpm test:e2e:headed` | Run E2E tests in headed browser |
| `pnpm test:e2e:debug` | Debug E2E tests |
| `pnpm storybook` | Start Storybook on port 6006 |
| `pnpm build-storybook` | Build static Storybook |
| `pnpm lint` | Run ESLint |
| `pnpm tsc` | Type-check with TypeScript |

## Testing

### Unit Tests (Vitest)

Unit tests use Vitest with browser mode and MSW for API mocking.

```bash
# Run tests in watch mode
pnpm test

# Run tests once
pnpm test:run

# Run tests with UI
pnpm test:ui
```

Mocks are defined in `./src/mocks/handlers/`.

### E2E Tests (Playwright)

E2E tests run against a local Docker Compose environment using Playwright.

#### Prerequisites

1. Start the Docker Compose environment:
   ```bash
   docker compose -f docker/dev.docker-compose.yml up
   ```

2. Create an `.env.e2e` file in the `e2e/` directory:
   ```env
   TEST_USER_EMAIL=your-test-user@example.com
   TEST_USER_PASSWORD=your-password
   BASE_URL=https://localhost:3000
   ```

#### Running E2E Tests

```bash
# Run all E2E tests
pnpm test:e2e

# Run with Playwright UI (interactive)
pnpm test:e2e:ui

# Run in headed mode (see the browser)
pnpm test:e2e:headed

# Debug mode
pnpm test:e2e:debug
```

E2E test files are located in `./e2e/tests/`:
- `auth.setup.ts` - Authentication setup
- `my-home-*.spec.ts` - Home page tests
- `spaces-*.spec.ts` - Spaces feature tests
- `data-portals.spec.ts` - Data portals tests
- `challenges.spec.ts` - Challenges feature tests
- `logged-out.spec.ts` - Public/unauthenticated tests

## Storybook

Component documentation and development environment.

```bash
# Start Storybook dev server
pnpm storybook

# Build static Storybook
pnpm build-storybook
```

Access at `http://localhost:6006`

## Project Structure

```
packages/client/
├── .storybook/          # Storybook configuration
├── docker/              # Docker build files
├── e2e/                 # Playwright E2E tests
│   ├── fixtures/        # Test fixtures (images, files)
│   ├── tests/           # Test specs and helpers
│   └── playwright.config.ts
├── public/              # Static assets
├── src/
│   ├── api/             # API types and mutations
│   ├── assets/          # Images and brand assets
│   ├── brand/           # Multi-brand theming (PFDA/TRS)
│   ├── components/      # Shared UI components
│   ├── constants/       # App constants
│   ├── features/        # Feature modules
│   │   ├── admin/       # Admin dashboard
│   │   ├── apps/        # Apps management
│   │   ├── challenges/  # Challenges feature
│   │   ├── data-portals/# Data portals
│   │   ├── discussions/ # Discussions
│   │   ├── files/       # File management
│   │   ├── home/        # Home page
│   │   ├── lexi/        # Rich text editor
│   │   ├── spaces/      # Collaborative spaces
│   │   └── ...
│   ├── hooks/           # Custom React hooks
│   ├── layouts/         # Page layouts
│   ├── mocks/           # MSW mock handlers
│   ├── pages/           # Page components
│   ├── routes/          # React Router configuration
│   ├── styles/          # Global styles and theme
│   ├── test/            # Test utilities
│   ├── types/           # TypeScript types
│   └── utils/           # Utility functions
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
└── eslint.config.mjs    # ESLint configuration
```

## API Proxy Configuration

The Vite dev server proxies API requests to the backend at `https://0.0.0.0:3000`. Proxied routes include:

- `/api/*` - API endpoints
- `/login`, `/logout`, `/return_from_login` - Authentication
- `/docs` - Documentation
- `/assets`, `/pdfs` - Static files
- And various legacy routes

See `vite.config.ts` for the full proxy configuration.

## SSL Certificates

For HTTPS development, place SSL certificates at the repository root:
- `cert.pem`
- `key.pem`

The dev server will automatically use HTTPS if these files exist.

## Environment Variables

### Build-time Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_OUT_DIR` | Build output directory | `../rails/app/assets/packs` (prod) |
| `VITE_BASE_PATH` | Base path for assets | `/assets/` (prod), `/` (dev) |

### Runtime Variables

See `src/utils/runtimeEnv.ts` for runtime environment configuration.

## Cleanup

```bash
# Clear Vite cache
pnpm cleanup:cache

# Remove node_modules
pnpm cleanup:deps

# Full cleanup (both)
pnpm cleanup:full
```

## Related Documentation

- [Docker Compose Guide](../../docs/DOCKER_COMPOSE_GUIDE.md)
- [Main Project README](../../README.md)
