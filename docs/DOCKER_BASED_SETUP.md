# Docker-based setup

This guide covers all the steps required to get docker based
development environment.

## Installing docker and docker-compose

> If you already have docker installed in your system, you can skip this step.

The first step you have to do is to install [docker](https://docs.docker.com/install/) on your workstation. Instructions are **platform-specific**

## Makefile and platform differences

Because of platform differences between M1-silicon and Intel MacOS CPUs and technologies used in our stack, the docker environment setup is **platform-specific**, more on the topic [here](./MACOS_ARCHITECTURE_DIFFERENCES.md).
Summary of all configurations is in top level [Makefile](../Makefile), which contains some basic commands. Feel free to add more according to your own need.

Note that not all `docker compose` commands are implemented - so when you want to execute `docker compose` command, make sure you have corresponding flags (`-f <COMPOSE_FILE>`) according to [Makefile](../Makefile).

### Example scenario

I am a dev using MacBook with `M1-silicon` CPU, and `nodejs-api` container just died (for some reason)

I can restart it with following command

```bash
# Edited from "make run-arm64v8-dev"
docker compose -f docker/isolation.arm64v8.docker-compose.yml -f docker/isolation-dev-server.docker-compose.override.yml restart nodejs-api
```
## General Setup

> This section is work in progress

There are a few [docker-related](../docker/isolation.docker-compose.yml) [env variables](../docker/.env.example), that are used in `docker-compose.yml` files

```bash
# Run in 'precision-fda' root directory
cp docker/.env.example docker/.env
```

Also please execute this temporary step to avoid non-existing bind mounts

```bash
mkdir -p app/assets/packs
touch app/assets/packs/bundle.js
```

### Platform differences

In order to make ruby watch mode working in `docker`, configure following in `docker/.env`

```bash
ARM64V8_DEVELOPMENT_PATCH=0
```

Alternatively run following

```bash
# Works only on mac os
test "$(uname -m)" = arm64 && sed -i '' 's/ARM64V8_DEVELOPMENT_PATCH=0/ARM64V8_DEVELOPMENT_PATCH=1/g' docker/.env
# In case linux version of command is required
# http://stackoverflow.com/questions/12696125/ddg#12696224
test "$(uname -m)" = arm64 && sed -i 's/ARM64V8_DEVELOPMENT_PATCH=0/ARM64V8_DEVELOPMENT_PATCH=1/g' docker/.env
```

## Database setup

The source of truth for `precision-fda` portal is `mysql` db, which is initialized with
* db migrations, that result in following [schema](../db/schema.rb)
  * See `db/migrate` directory, for instance [this file](../db/migrate/20150904202622_create_users.rb)
* `rake ` tasks that prepopulate the database, such as [this one](../lib/tasks/user.rake), that generates dummy users

### 1. Configure

* Create a `config/database.yml` file containing the database configuration
    ```bash
    # Run in 'precision-fda' root directory
    # Use 'config/database.sample.yml' as a template
    cp config/database.sample.yml config/database.yml
    ```
* Create a `.env` file in the project root with an additional environment variables to be passed into Docker containers.
    ```bash
    # NOTE - this env file is different from the one defined in "General Setup" section
    cp .env.example .env
    ```
  * > This part is work in progress
  * [`.env.example` file](../.env.example) is a reference file, however, there are a handful of secrets, ask a colleague to provide them

### 2. Prepare the database

The command might vary, depending on your role (dev, qa), or on CPU architecture of the workstation (`x86_64`, `arm64`). You can find more details on the topic [here](./MACOS_ARCHITECTURE_DIFFERENCES.md)

```bash
# UNTESTED
# intel dev
make prepare-db
# intel qa
make prepare-db-qa
# arm64v8 (Apple M1 Silicon) dev
make prepare-db-arm64v8-dev
# arm64v8 (Apple M1 Silicon) qa
make prepare-db-arm64v8-qa
```

* **IMPORTANT**
  * If by any chance you're reinitializing db with these steps, make sure that `SKIP_DP_SETUP` in `.env` is set to `0` (or left out)
  * Otherwise db setup will not work


## Nodejs API setup

There are also env variables specific for `nodejs` part of the repository, particularly `nodejs-api` and `nodejs-worker`

```bash
cp https-apps-api/.env.example https-apps-api/.env
```

## (Optional) Account setup

To use your own account to log-in to the system, run the command to
create database with the environment variables set with your account's data (if you don't have
an account yet, please refer to
[New account registration](DEVELOPMENT_SETUP.md#new-account-registration)):

```bash
docker compose exec \
    -e PFDA_USER_FIRST_NAME=Florante \
    -e PFDA_USER_LAST_NAME=DelaCruz \
    -e PFDA_USER_EMAIL=fdelacruz+pfdalocal@dnanexus.com \
    -e PFDA_USER_ORG_HANDLE=floranteorg \
    -e PFDA_USER_DXUSER=fdelacruz \
    web bundle exec rake {db:setup,db:migrate,user:generate_test_users}
# ! Don't forget to add respective flags before running this command
# For instance, dev with "arm64v8"
# docker compose 
#     -f docker/isolation.arm64v8.docker-compose.yml \
#     -f docker/isolation-dev-server.docker-compose.override.yml \
#     exec \
#     -e PFDA_USER_FIRST_NAME=Florante \
#     -e PFDA_USER_LAST_NAME=DelaCruz \
#     -e PFDA_USER_EMAIL=fdelacruz+pfdalocal@dnanexus.com \
#     -e PFDA_USER_ORG_HANDLE=floranteorg \
#     -e PFDA_USER_DXUSER=fdelacruz \
#     web bundle exec rake {db:setup,db:migrate,user:generate_test_users}
```

## Running application

Running again depends on role and workstation type

```bash
# intel dev
make run
# intel qa
make run-qa
# arm64v8 (Apple M1 Silicon) dev
make run-arm64v8-dev
# arm64v8 (Apple M1 Silicon) qa
make run-arm64v8-qa
```

Once the application is correctly installed & configured, you should be able to access the portal at `https://localhost:3000/`.
In order to log in to the system, ask for shared DEV credentials (ask some1 from the team)

## Running application with GSRS (deprecated section)

GSRS runs as a process on the same instance as pFDA but is completely separate codebase
To run everything locally via docker, you'd need to use a different docker-compose file.

First build and do the database setup as described above using the full docker-compose:

```docker-compose -p precision-fda-full -f docker/isolation.docker-compose.yml build
docker-compose -p precision-fda-full -f docker/isolation.docker-compose.yml start db web
docker-compose -p precision-fda-full -f docker/isolation.docker-compose.yml exec web bundle exec rake {db:setup,db:migrate,user:generate_test_users}
```

Then run the whole application

`docker-compose -p precision-fda-full -f docker/isolation.docker-compose.yml up`

### TODO(samuel)

discuss if it's worth documenting a build without GSRS
