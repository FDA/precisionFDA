# Docker-based setup


This guide covers all the steps required to get docker based
development environment. There are also a few _optional_ sections, that are strongly recommended to use for full-stack developer roles

## Prerequisites

Make sure that you understand this [Makefile](../Makefile)

Make sure you know, which configuration to use. Your configuration depends on following

* role (qa | dev)
* architecture of your workstation
  * unless its windows, you can find it using command - `uname -m`

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
docker compose -f docker/arm64v8.dev.docker-compose.yml restart nodejs-api
```
## Minor fixes that it's better to setup in advance

Majority of the UI is developed as React app - see [client/package.json](../client/package.json).
Compiled react app is served from asset pipeline. For now it requires sharing files between two running containers, which is accomplished with bind mounts (feel free to read through `docker-compose.yml` files for better understanding of topic)

To keep number of side effects minimal, single file `bundle.js` is mounted instead of whole directory. Although it's cleaner solution, this results in possible issue during initial setup, where source bind mount is missing. Fix it by running following commands

```bash
mkdir -p app/assets/packs
touch app/assets/packs/bundle.js
```

### Minor configuration differences for nodejs-api

If you're running stack with `make run-arm64v8-dev` configuration, it uses different key paths for `nodejs-api`. Edit `https-apps-api/.env` with following values

```
NODE_PATH_CERT=/keys/cert.pem
NODE_PATH_KEY_CERT=/keys/key.pem
```
## Database setup

The source of truth for `precision-fda` portal is `mysql` db, which is initialized with
* db migrations, that results in following [schema](../db/schema.rb)
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
#     -f docker/arm64v8.dev.docker-compose.yml \
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

## Running application with external services

```bash
# intel dev
make run-all
# intel qa
make run-all-qa
# arm64v8 (Apple M1 Silicon) dev
make run-all-arm64v8-dev
# arm64v8 (Apple M1 Silicon) qa
make run-all-arm64v8-qa
```

### GSRS

GSRS runs as a process on the same instance as pFDA but is completely separate codebase

_Last updated 14.6.2022_

> Atm GSRS local setup is not fully functional, needs various fixes. Contact colleagues to get more information on this topic

## (Optional) Setup for impatient personalities

There are a few [docker-related](../docker/arm64v8.dev..docker-compose.yml) [env variables](../docker/.env.example), that are used in `docker-compose.yml` files, such as `SKIP_RUBY_SETUP`
After you run your docker setup successfully, and want to save some time by skipping dependency checks and reinstallations (assuming you've got them correct), feel free to setup

```bash
# Run in 'precision-fda' root directory
cp docker/.env.example docker/.env
```

For obvious reasons these settings aren't versioned, and therefore are kept in separate [docker/.env](../docker/.env.example) file


## (Optional) Symlink docker-compose.yml for less typing

If copy-pasting too many CLI options (such as `-f docker/dev.docker-compose.yml`) is getting frustrating, feel free to symlink your favourite configuration into `docker-compose.yml`

For instance

```bash
# Run in 'precision-fda' root directory
# intel dev
ln -s docker/dev.docker-compose.yml docker/docker-compose.yml
# intel qa
ln -s docker/qa.docker-compose.yml docker/docker-compose.yml
# arm64v8 (Apple M1 Silicon) dev
ln -s docker/arm64v8.dev.docker-compose.yml docker/docker-compose.yml
# arm64v8 (Apple M1 Silicon) qa
ln -s docker/arm64v8.qa.docker-compose.yml docker/docker-compose.yml
```

This makes use of docker compose more trivial, you can start the stack with simply

```bash
docker compose up --build
```

Note that this part of setup is experimental, potential side effects are suspected with this approach

## Updating docker-compose files

Before updating anything related to docker setup, please take a look at [Docker compose guide](./DOCKER_COMPOSE_GUIDE.md), to update according to repo best practices
