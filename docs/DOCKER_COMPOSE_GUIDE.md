# Docker compose guide

This guide summarizes the local Docker Compose structure and best practices for this repo.

If you update any compose file, make sure that the [Docker troubleshooting Confluence guide](https://confluence.internal.dnanexus.com/display/XVGEN/Docker+troubleshooting+guide) stays up to date as well.

_Last updated: 12.05.2026_

## Prerequisites

Make sure that you understand local configurations described in the [Docker-based setup document](./DOCKER_BASED_SETUP.md).

## `extends` keyword

We use Docker Compose v2's `extends` keyword to share settings across compose files without duplication.

## Shared vs. local compose settings

Local Docker uses [`docker/dev.docker-compose.yml`](../docker/dev.docker-compose.yml) as the single compose file. The Makefile always selects that file and passes [`docker/.env`](../docker/.env.example) when it exists.

Apple Silicon behavior is already included in `dev.docker-compose.yml` — don't add a separate architecture overlay. When adding a setting, decide where it goes: settings used everywhere belong in `base.services.yml`; settings for optional integrations (e.g., GSRS) belong in `external.services.yml`; settings that only matter in local dev belong in `dev.docker-compose.yml`.

To retain DRY principles, most settings are shared in:

* [`base.services.yml`](../docker/base.services.yml)
* [`external.services.yml`](../docker/external.services.yml)
  * Details are described in [External services](#external-services)

The local compose file extends services from `base.services.yml` and applies local build, volume, environment, and dependency settings.

## Local Dockerfiles

Local Dockerfiles are named after how the image is used:

* `dev.Dockerfile` — bind-mounted development services
* `build.Dockerfile` — one-shot build images
* `dist.Dockerfile` — built distribution/runtime images

The current local Dockerfiles are:

| Package | Dockerfile | Usage |
| --- | --- | --- |
| Rails | `packages/rails/docker/images/dev.Dockerfile` | Rails web development container |
| Client | `packages/client/docker/images/dev.Dockerfile` | Vite development container |
| Client | `packages/client/docker/images/build.Dockerfile` | frontend asset build container |
| Docs | `packages/docs/docker/images/dev.Dockerfile` | docs development container |
| Server | `packages/server/docker/images/dev.Dockerfile` | NestJS API, worker, and admin development containers |
| Server | `packages/server/docker/images/dist.Dockerfile` | built Node.js distribution container |

### Volumes

`extends` works only for services. Docker volumes must be declared in the leaf compose files that use them.

## Summary of best practices

### Secrets

Never add a secret value to compose files.

Environment variables that are considered secrets should not be versioned. Define them in the corresponding service-level `.env` file when possible. Non-secret Docker runtime overrides can go in [`docker/.env`](../docker/.env.example); the Makefile passes it to Docker Compose when it exists. See the [Docker documentation](https://docs.docker.com/compose/environment-variables/#the-env-file) for more information.

### Configuration settings

Keep as many settings shared as possible in `*.services.yml` files.

Put a setting in `dev.docker-compose.yml` if it only applies to local development — for example:

* local development behavior, such as bind mounts, docs, or watch-mode settings
* Apple Silicon local runtime settings, such as native image/platform choices or filesystem watcher workarounds
* workarounds that should stay scoped to local dev (e.g., not leak into CI or production)

### Versions

Keep image versions in [`base.services.yml`](../docker/base.services.yml) unless a service genuinely needs a different version.

All Dockerfiles and CI must install the pnpm version pinned in the root [`package.json`](../package.json) `packageManager` field.

## External services

Integrated services that are not part of the standard stack are defined in [`external.services.yml`](../docker/external.services.yml). They are excluded by default to minimize local build and startup work.

Set `PFDA_SHOULD_RUN_GSRS=1` to make the Makefile append [`external.docker-compose.yml`](../docker/external.docker-compose.yml) and include the `gsrs` and `gsrsdb` services:

```bash
PFDA_SHOULD_RUN_GSRS=1 make run
```
