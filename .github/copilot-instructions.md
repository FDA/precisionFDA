# Copilot Code Review Instructions

This is a monorepo with four packages: `packages/rails` (Ruby/Rails), `packages/client` (React/TypeScript), `packages/server` (NestJS), and `packages/cli` (Go).

## Documentation Sources (/docs)

- Use markdown files in `/docs` as the primary reference for project setup, architecture, and coding conventions
- Local setup and environment: `docs/DEVELOPMENT_SETUP.md`, `docs/DOCKER_BASED_SETUP.md`, `docs/DOCKER_COMPOSE_GUIDE.md`, `docs/OS_BASED_SETUP.md`
- Coding guides: `docs/guides/frontend.md`, `docs/guides/backend.md`, `docs/backend/backend-coding-guide.md`
- Migration and architecture context: `docs/guides/rails-to-nestjs-migration.md`, `docs/guides/rails-analysis.md`
- If guidance conflicts, follow the most specific `/docs` markdown file relevant to the package being changed

Note: This file is used for local development only. Github Actions are not reading this file.