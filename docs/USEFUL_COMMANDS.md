# Useful commands

The examples below assume the Docker-based setup from [Docker-based setup](./DOCKER_BASED_SETUP.md). For Makefile targets, see [Summary of Makefile commands](./SUMMARY_OF_MAKEFILE_COMMANDS.md).

For commands that are easier to run directly through Docker Compose, define a helper that matches the Makefile configuration. Run `make repo-env-files-init` first so `docker/.env` exists, or omit `--env-file docker/.env` from the helper.

```bash
export PFDA_COMPOSE='docker compose -p precision-fda --env-file docker/.env -f docker/dev.docker-compose.yml'
```

Use `PFDA_SHOULD_RUN_GSRS=1 make run` when you need GSRS services.

## Rails

Open a Rails container shell:

```bash
$PFDA_COMPOSE exec web bash
```

Run common Rails commands:

```bash
$PFDA_COMPOSE exec web bundle exec rails c
$PFDA_COMPOSE exec web bundle exec rake db:migrate
$PFDA_COMPOSE exec web bundle exec rspec
$PFDA_COMPOSE exec web bundle exec rspec spec/<path_to_spec>
$PFDA_COMPOSE exec web bundle exec rubocop
$PFDA_COMPOSE exec web bundle exec brakeman -A --parser-timeout 30 -w2
```

Open coverage output from the host:

```bash
open packages/rails/coverage/index.html
```

## React client

```bash
$PFDA_COMPOSE exec frontend pnpm lint
$PFDA_COMPOSE exec frontend pnpm tsc
$PFDA_COMPOSE exec frontend pnpm test:run
$PFDA_COMPOSE exec frontend pnpm test:run -- -t Challenge
```

## Node.js backend

```bash
$PFDA_COMPOSE exec nodejs-api pnpm run lint
$PFDA_COMPOSE exec nodejs-api make test-api
$PFDA_COMPOSE exec nodejs-api make test-worker
$PFDA_COMPOSE exec nodejs-api make test-shared
$PFDA_COMPOSE exec nodejs-api pnpm run build
```

Restart individual Node.js services after configuration changes:

```bash
$PFDA_COMPOSE restart nodejs-api
$PFDA_COMPOSE restart nodejs-worker
$PFDA_COMPOSE restart nodejs-admin-platform-client
```

## Docs site

```bash
$PFDA_COMPOSE exec docs pnpm lint
$PFDA_COMPOSE exec docs pnpm run build
```

## Database

Open a database shell:

```bash
$PFDA_COMPOSE exec db mysql -uroot -ppassword
```

Recreate local database volumes:

```bash
make db-wipe
make prepare-db
```
