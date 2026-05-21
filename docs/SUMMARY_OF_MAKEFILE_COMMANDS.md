# Summary of Makefile commands

_Last updated: 19.05.2026_

The Makefile uses the single local Docker stack from `docker/dev.docker-compose.yml` with the `precision-fda` Compose project. Prefix commands with `PFDA_SHOULD_RUN_GSRS=1` to add GSRS services. The Makefile passes `docker/.env` to Docker Compose when that file exists.

## Environment helpers

```bash
# copy .env.example files when .env files do not exist
make repo-env-files-init

# compare local .env files with examples
make check-missing-env-variables
make check-unpublished-env-variables
```

## Basic Docker commands

```bash
# setup that runs db migrations in a one-shot web container
make prepare-db

# setup the test db for unit tests
make prepare-db-test

# run the local stack
make run

# run with GSRS
PFDA_SHOULD_RUN_GSRS=1 make run

# stop the stack
make stop

# run the spec compose stack
make run-spec
```

## Debugging commands

```bash
# print the rendered Docker Compose config for the local stack
make debug-config

# restart the full local stack
make restart-full
```

To restart a single service or open a shell inside it, use Docker Compose directly. Define the helper from [Useful commands](./USEFUL_COMMANDS.md):

```bash
export PFDA_COMPOSE='docker compose -p precision-fda --env-file docker/.env -f docker/dev.docker-compose.yml'

# Restart one service
$PFDA_COMPOSE restart web
$PFDA_COMPOSE restart frontend
$PFDA_COMPOSE restart nodejs-api

# Hook into one service with bash
$PFDA_COMPOSE exec web bash
$PFDA_COMPOSE exec frontend bash
$PFDA_COMPOSE exec nodejs-api bash
```

## Image cleanup

```bash
# Full image/container cleanup for the local stack
make image-cleanup-full

# Image cleanup for services
make image-cleanup-web
make image-cleanup-frontend
make image-cleanup-nodejs-api
make image-cleanup-nodejs-worker
make image-cleanup-nodejs-admin-platform-client
make image-cleanup-db
make image-cleanup-redis
make image-cleanup-nginx
make image-cleanup-docs

# GSRS image cleanup when GSRS is enabled
PFDA_SHOULD_RUN_GSRS=1 make image-cleanup-gsrs
PFDA_SHOULD_RUN_GSRS=1 make image-cleanup-gsrsdb
```

## Db wipe

```bash
# Database wipe for the local stack
make db-wipe

# Include GSRS database volume when GSRS is enabled
PFDA_SHOULD_RUN_GSRS=1 make db-wipe
```

## Cache cleanup

```bash
# Ruby dependencies
make cache-cleanup-ruby-sidekiq

# Frontend Vite cache, pnpm store, and dependencies
make cache-cleanup-frontend

# Node pnpm store and dependencies
make cache-cleanup-nodejs-api
make cache-cleanup-nodejs-worker
make cache-cleanup-nodejs-admin-platform-client
make cache-cleanup-docs

# Cache cleanups with database wipe
make cache-cleanup-ruby-sidekiq-with-db-wipe
make cache-cleanup-frontend-with-db-wipe
make cache-cleanup-nodejs-api-with-db-wipe
make cache-cleanup-nodejs-worker-with-db-wipe
make cache-cleanup-nodejs-admin-platform-client-with-db-wipe
make cache-cleanup-docs-with-db-wipe
```
