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

To include GSRS in the local stack, set `PFDA_SHOULD_RUN_GSRS=1` for the command or export it in your shell profile:

```bash
PFDA_SHOULD_RUN_GSRS=1 make run
```

#### Switch GSRS version running in the container

1. Connect to the running container.
2. Run script _run-version.sh_.
3. When prompted, paste the required GSRS version branch name from the [gsrs-play-dist repo](https://github.com/dnanexus/gsrs-play-dist).

#### GSRS frontend development live update

Once the _gsrs_ container is running, you can use it for GSRS frontend development:

1. Clone the [GSRSFrontend repo](https://github.com/ncats/GSRSFrontend/tree/precision_new), branch _precision_new_.
2. Create `GSRS_FRONTEND_PATH` (for example in `~/.zshrc`) with an absolute path to the repo, such as _/Users/pbarta@dnanexus.com/ncats/GSRSFrontend_.
3. Restart the _gsrs_ container.
4. Edit several config files in the cloned repo. These changes are not supposed to be committed:
   * `angular.json` - add line `"baseHref": "/ginas/app/ui/",` under `projects.gsrs-client.architect.options`
   * `src/app/fda/config/config.json` - add line `"customToolbarComponent": "precisionFDA",`
   * `src/environments/environment.fda.local.ts` - set the following variables:
     ```bash
     environment.apiBaseUrl = 'https://localhost:3000/ginas/app/';
     environment.baseHref = '/ginas/app/ui/';
     ```
5. Connect to the running _gsrs_ container, run script `switch-frontend.sh` (located in root), and follow the instructions.
   ```bash
   docker exec -it <GSRS_CONTAINER_ID> bash
   cd /
   ./switch-frontend.sh
   ```

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
