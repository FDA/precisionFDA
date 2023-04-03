# Summary of Makefile commands

_Last updated: 25.11.2022_

## Basic docker commands

```bash
# setup that runs db migrations (keeps db and web container running)
make prepare-db
# setup the test db for unit tests
make prepare-db-test
# run the stack
make run
# cleanup stack
make cleanup
```

## Basic deugging commands

```bash
# Restart for each service
make restart-web
make restart-frontend
make restart-nodejs-api
make restart-nodejs-worker
make restart-db
make restart-redis
make restart-sidekiq

# Extra restarts when running with GSRS
make restart-gsrs
make restart-gsrsdb

# Hook (exec bash) for each service
make hook-into-web
make hook-into-frontend
make hook-into-nodejs-api
make hook-into-nodejs-worker
make hook-into-db
make hook-into-redis
make hook-into-sidekiq

# Extra hooks (exec bash) when running with GSRS
make hook-into-gsrs
make hook-into-gsrsdb
```

## Image cleanup

```bash
# Image cleanup for each service
make image-cleanup-web
make image-cleanup-frontend
make image-cleanup-nodejs-api
make image-cleanup-nodejs-worker
make image-cleanup-db
make image-cleanup-redis
make image-cleanup-sidekiq

# Image cleanup for GSRS
make image-cleanup-gsrs
make image-cleanup-gsrsdb
```

## Db Wipe

```bash
# Database wipe
make db-wipe
```

## Cache cleanup

```bash
# Cache cleanups - volume removal
# cache-cleanup-ruby-sidekiq removes ruby dependencies, and triggers their reinstallation (roughly takes 15 minutes)
make cache-cleanup-ruby-sidekiq
# cache-cleanup-frontend removes webpack build cache
# for arm64v8.dev it also removes cached yarn dependencies in docker volume
make cache-cleanup-frontend
# cache-cleanup-nodejs-api removes yarn dependencies - trigger reinstallation from network cache
# only available for arm64v8.dev
make cache-cleanup-nodejs-api
# cache-cleanup-nodejs-worker removes yarn dependencies - trigger reinstallation from network cache
# only available for arm64v8.dev
make cache-cleanup-nodejs-worker

# Cache cleanups with database wipes (preferable for QAs)
# Each one works same way as described above + performs DB wipe
make cache-cleanup-ruby-sidekiq-with-db-wipe
make cache-cleanup-frontend-with-db-wipe
make cache-cleanup-nodejs-api-with-db-wipe
make cache-cleanup-nodejs-worker-with-db-wipe
```
