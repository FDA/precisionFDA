# Docker-based setup

This guide covers the Docker-based local development environment for Apple Silicon Macs. There are also a few _optional_ sections that are recommended for full-stack development.

_Last updated: 19.05.2026_

## Installing Docker and Docker Compose

> If you already have Docker installed on your system, you can skip this step.

Install [Docker Desktop](https://docs.docker.com/install/) on your workstation. The Makefile uses the Docker Compose v2 plugin (`docker compose`).

## Local Docker configurations

Local Docker uses [`docker/dev.docker-compose.yml`](../docker/dev.docker-compose.yml) as its compose file. Apple Silicon-specific behavior is already included — no separate architecture overlay is needed.

The normal local workflow is:

```bash
make prepare-db
make run
make stop
make db-wipe
```

`make prepare-db` starts the database dependencies if needed, runs the Rails database setup in a temporary web container, then stops the containers once setup is done. The temporary web container is removed and database data remains in Docker volumes.

GSRS is optional and is enabled with `PFDA_SHOULD_RUN_GSRS=1`.

(Optional) To learn more about the compose files, see the [Docker compose guide](./DOCKER_COMPOSE_GUIDE.md).

## Makefile

Most development/testing use cases are documented in the [Makefile](../Makefile).

If you'd like to understand more about Makefiles, see:

* [Makefile tutorial](https://makefiletutorial.com/)
* [Makefile built-in functions](https://www.gnu.org/software/make/manual/html_node/Functions.html)

## Setup before running

You need `.env` files in `./docker`, `./packages/rails`, and `./packages/server`. Copy the `.env.example` file in each, or run:

```bash
make repo-env-files-init
```

The Makefile passes `docker/.env` to Docker Compose when that file exists. Put local Docker-only overrides there instead of in your shell profile. Common overrides include:

* backend URLs such as `NODE_API_URL`, `RUBY_API_URL`, and `DOCS_URL`
* startup shortcuts such as `SKIP_RUBY_DEPS_SETUP`, `SKIP_FRONTEND_DEPS_SETUP`, `SKIP_NODEJS_DEPS_SETUP`, `SKIP_DB_SETUP`, and `NODE_DEV_WATCH`

Fill in any local `.env` variables that aren't checked into the repo. Never commit secrets — keep them out of compose files and out of `.env` files that are tracked by git.

Run `make check-missing-env-variables` after updating `.env` files.

For a summary of Makefile commands, see [Summary of Makefile commands](./SUMMARY_OF_MAKEFILE_COMMANDS.md).

### Githooks troubleshooting

If a githook is preventing you from committing, you can remove all hooks with:

```bash
find ./utils/githooks -type f -exec sh -c 'rm ".git/hooks/$(basename {})"' \;
```

## (Optional) Account setup

To log in with your own account, seed the database with your details. If you do not have an account yet, see [New account registration](DEVELOPMENT_SETUP.md#new-account-registration).

```bash
# Initialize the database first.
make prepare-db

# Start the app stack.
make run

# In another terminal, open a shell in the running web container.
# (Define $PFDA_COMPOSE first - see ./USEFUL_COMMANDS.md)
$PFDA_COMPOSE exec web bash

# Then run inside the web container.
PFDA_USER_FIRST_NAME=Florante \
PFDA_USER_LAST_NAME=DelaCruz \
PFDA_USER_EMAIL=fdelacruz+pfdalocal@dnanexus.com \
PFDA_USER_ORG_HANDLE=floranteorg \
PFDA_USER_DXUSER=fdelacruz \
bundle exec rake db:setup db:migrate db:generate_mock_data user:generate_test_users
```

## Running application

```bash
make run
```

Once the application is correctly installed and configured, you should be able to access the portal at `https://localhost:3000/` by default. To log in, ask the team for shared DEV credentials.

Stop the stack with:

```bash
make stop
```

### Running application with external services (GSRS)

GSRS runs as part of the local Docker stack. A schema-only database is included in the repo so GSRS can start empty without any downloads. For a fully populated instance (substance data + Lucene search index), run `make gsrs-seed-data` first — this downloads the data from S3 and requires the AWS CLI to be installed and configured:

```bash
# Install the AWS CLI (macOS)
brew install awscli

# Configure credentials (use your access key from the AWS console)
aws configure
```

#### Quick start

```bash
# Add to ~/.bashrc or ~/.zshrc
export PFDA_SHOULD_RUN_GSRS=1
```

Then run as usual:

```bash
make run
```

To populate with full substance data and search index:

```bash
make gsrs-seed-data
make run
```

This starts the GSRS backend, MariaDB (schema from `docker/misc/gsrs-db-init/01-gsrsdb-schema.sql`), and nginx sidecar. If you ran `make gsrs-seed-data`, the full data dump and Lucene index are also loaded.

GSRS UI is available at `https://localhost:3000/ginas/app/ui/`.

#### Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PFDA_SHOULD_RUN_GSRS` | _(unset)_ | Set to `1` to include GSRS containers |
| `GSRS_LOCAL_MODE` | `true` | Symlinks index directly (required for macOS) |
| `GSRS_INDEX_PATH` | `packages/gsrs/seed-data/ginas.ix` | Path to Lucene index directory |
| `GSRS_FRONTEND_DEV` | `false` | Set to `true` to enable live frontend dev server |
| `GSRS_FRONTEND_PATH` | _(unset)_ | Absolute path to GSRSFrontend repo (required when `GSRS_FRONTEND_DEV=true`) |

#### Resetting GSRS data

To start fresh (wipe DB and index):

```bash
make stop
docker volume rm precision-fda_db-gsrs-mariadb-volume
```

Then `make run` again to recreate with seed data.

#### GSRS frontend development (live hot reload)

A dedicated container runs the Angular dev server with hot reload. No manual config edits needed.

1. Clone [GSRSFrontend repo](https://github.com/ncats/GSRSFrontend), branch `pfda`:
   ```bash
   git clone -b pfda https://github.com/ncats/GSRSFrontend.git ~/Projects/GSRSFrontend
   ```

2. Edit several config files in the cloned repo (these changes are not supposed to be committed):
   - `angular.json` - add line `"baseHref": "/ginas/app/ui/",` under `projects.gsrs-client.architect.options`
   - `src/app/fda/config/config.json` - add lines `"customToolbarComponent": "precisionFDA",` and `"isPfdaVersion": true,`
   - `src/environments/environment.fda.local.ts` - set following variables:
     ```typescript
     environment.apiBaseUrl = 'https://localhost:3000/ginas/app/';
     environment.baseHref = '/ginas/app/ui/';
     ```

3. Set environment variables (e.g., in `~/.zshrc`):
   ```bash
   export PFDA_SHOULD_RUN_GSRS=1
   export GSRS_FRONTEND_DEV=true
   export GSRS_FRONTEND_PATH=~/Projects/GSRSFrontend
   ```

4. Run:
   ```bash
   make run
   ```

The frontend dev container installs dependencies and runs `ng serve` with the `fda.local` configuration. Changes to source files in your local GSRSFrontend repo are picked up automatically via polling.

> **Note:** The first startup takes a few minutes while Angular compiles. Subsequent starts reuse the cached `node_modules` volume.

## (Optional) Skip cache rebuilds for faster startup

After the Docker setup runs successfully, you can save startup time by using [`docker/.env.example`](../docker/.env.example) as a reference and setting skip flags in `docker/.env`. These flags only work if the relevant deps and caches have already been built by a previous successful startup.

Common options include:

```bash
SKIP_RUBY_DEPS_SETUP=1
SKIP_FRONTEND_DEPS_SETUP=1
SKIP_NODEJS_DEPS_SETUP=1
SKIP_DB_SETUP=1
NODE_DEV_WATCH=0
```

These flags aren't checked into the repo — set them for your local workflow only.

## macOS notes

On macOS, the default Rails file watcher doesn't reliably detect changes inside Docker bind-mounts. To work around this, [`docker/dev.docker-compose.yml`](../docker/dev.docker-compose.yml) sets `PFDA_LOCAL_DOCKER_FILE_WATCHER_PATCH=1`, which forces Rails to use a polling-based watcher in the local Docker stack. See [`packages/rails/config/environments/development.rb`](../packages/rails/config/environments/development.rb).

## Further reading

* [Summary of Makefile commands](./SUMMARY_OF_MAKEFILE_COMMANDS.md)
* [Docker compose guide](./DOCKER_COMPOSE_GUIDE.md)
