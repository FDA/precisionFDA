---
applyTo: '**'
---
# precisionFDA AI Instructions
- **Core layout**: `packages/rails` (legacy Rails), `packages/server` (NestJS API + worker), `packages/client` (React app), `packages/nginx` (reverse proxy).

- **Traffic flow**: `packages/nginx/default.conf.template` routes most paths to Rails, `/api/v2` and `/ws` to the Nest API on 3001, and `/docs` to the docs service; preserve this split when adding endpoints.

- **Rails role**: `packages/rails` still renders HTML, serves packs via `public/packs`, and exposes classic REST in `packages/rails/config/routes.rb`; avoid touching the asset pipeline when React already owns a flow.

- **React build**: `packages/client/vite.config.ts` outputs to `../rails/public/packs`; run `pnpm run build` before Rails-only features that need fresh bundles.

- **React dev**: from `packages/client` run `pnpm install && pnpm run dev` for `https://localhost:4000`; axios calls stay relative (`/api/v2/...`) so nginx can proxy to Rails/Nest in Docker.

- **React patterns**: `packages/client/src/features/<domain>` bundles UI, hooks, and types; data access uses axios plus `@tanstack/react-query` (see `features/discussions/api.ts`) with CSRF headers set in `src/index.tsx`.

- **Mocking**: enable MSW by exporting `ENABLE_DEV_MSW=true`; handlers live in `src/mocks`, and Storybook stories should cover new mocks.

- **Server dev**: `packages/server` uses `pnpm`; run `make install`, then `make run-dev` (API) and `make run-worker-dev` with MySQL on 32800 and Redis on 6379 from the Docker stack.

- **Nest modules**: `apps/api/src/api.module.ts` wires feature modules; share business logic through `libs/shared` (MikroORM entities, services, platform clients).

- **User context**: middleware in `apps/api/src/user-context/middleware` expects `id`, `dxuser`, `accessToken` query params; reuse `@shared/domain/user-context` helpers instead of custom parsing.

- **Database**: MikroORM config lives in `libs/shared/src/database/config`; persist new models under `libs/shared/src/domain` and register them via module providers.

- **Queues**: worker jobs sit in `apps/worker/src/jobs` with Bull queues configured under `libs/shared/src/queue`; enqueue work through provided services, not raw Redis calls.

- **Config**: environment toggles centralize in `libs/shared/src/config/index.ts` with overrides in `envs/*.ts`; document new env vars in `.env.example` files before use.

- **Admin platform client**: `apps/admin-platform-client` shares the same libs; update API contracts alongside admin UI changes to keep Nest modules consistent.

- **Testing (server)**: mocha specs live in `apps/api/test` and `libs/shared/test`; run `make test-api` / `make test-worker` after `make prepare-db-test` seeds the schema.

- **Logging**: API logging integrates with Rails via `RailsLoggerInterceptor`; inject `Logger` from `@shared/logger` instead of `console.log`.

- **React testing**: execute `pnpm test` (or `pnpm test:run`) in `packages/client`; tests use Vitest with Playwright browser testing.

- **Docs site**: `packages/docs` is Next.js (Fumadocs) served on port 4040; follow deployment notes in `packages/docs/README.md` when altering content.

- **CLI**: `packages/cli` holds the Go uploader with `build-dist.sh`; coordinate changes with `infra/deploy.sh` to keep automation aligned.

- **Docker workflow**: the root `Makefile` drives setup (`make repo-env-files-init`, `make prepare-db`, `make run`); set `PFDA_ROLE` and generate `cert.pem` / `key.pem` via `docs/DOCKER_BASED_SETUP.md`.

- **Reverse proxy**: `docker/base.services.yml` binds certs and ports (nginx on 3000, Rails internal 3000, Nest API 3001); wire new services here and extend nginx templates.

- **Build graph**: `turbo.json` encodes build/test dependencies (e.g., `client:build` depends on `server:build`); update it when adding cross-package tasks.

- **Secrets**: local env values live in `.env` files under `docker/`, `packages/rails`, and `packages/server`; never commit real credentials—prefer AWS Secrets Manager references.

- **Legacy migration**: many Rails controllers remain (`packages/rails/app/controllers`); shadow them with React + Nest equivalents before retiring endpoints.

- **External APIs**: Nest services wrap DNAnexus calls via `libs/shared/src/platform-client`; reuse those clients to inherit auth/token refresh behaviors.

- **Email templates**: MJML lives in `apps/api/src/emails`; update snapshots and rerun `make test-api` when editing.

- **WebSockets**: `/ws` upgrades hit adapters in `@shared/websocket`; register new gateways under `apps/api/src/websocket`.

- **Static assets**: the Docker frontend container binds `packages/rails/public/packs`; keep build outputs relative so bind mounts continue to work.

- **CI signals**: `.github/workflows/precisionFDA.yml` builds client + Rails; add placeholder touches for new artifacts to avoid pipeline cache misses.

- **Database bootstrapping**: run `docker compose exec web bundle exec rake db:setup db:migrate db:generate_mock_data user:generate_test_users` with env overrides from `docs/DOCKER_BASED_SETUP.md` when seeding locals.

- **Ports recap**: nginx `https://localhost:3000`, Nest API 3001, admin platform client 3002, React dev server 4000, docs 4040.

- **Strategic bias**: Rails is being phased out—prefer implementing new features in Nest + React and leave comments when touching legacy code.

- **Pre-PR checks**: verify `make run` still boots, rerun targeted tests, and regenerate client packs so `packages/rails/public/packs` stays current.

  

## Other Notes

- The year is 2026, February

We use React 19.2
- the useEffectEvent feature is stable. - Use the useEffectEvent documentation: https://react.dev/reference/react/useEffectEvent
- `forwardRef` is not longer used and ref is passed in through props.

- Use CSS modules for styling React components.
- Our project css variables are defined in packages/client/src/styles/variables.ts
- Take heavy inspiration from shadcn ui for styling for components.
- for accessibility, use base-ui components where possible. https://base-ui.com/llms.txt
- in the UI use lucide icons for general icons. https://lucide.dev/icons/
