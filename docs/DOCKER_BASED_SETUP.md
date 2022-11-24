# Docker-based setup


This guide covers all the steps required to get docker based
development environment. There are also a few _optional_ sections, that are recommended to use for full-stack developer roles

_Last updated: 17.11.2022_

## Installing docker and docker-compose

> If you already have docker installed in your system, you can skip this step.

The first step you have to do is to install [docker](https://docs.docker.com/install/) on your workstation. Instructions are **platform-specific**

## Platform differences

Because of platform differences between M1-silicon and Intel MacOS CPUs and technologies used in our stack, the docker environment setup is **platform-specific**, more on the topic [here](./MACOS_ARCHITECTURE_DIFFERENCES.md).

For this reason localhost docker stack is maintained for two different architectures

* MacOS intel
* MacOS M1-sillicon (`arm64v8`)

Docker stack contains performance differences for different roles - for instance QA engineers are in higher need to drop volumes because of frequent branch changes. These changes shouldn't have impact on business logic of application code, instead they modify image build and container runtime.

That produces in total 4 different configurations

* `dev` (MacOS intel)
* `qa` (MacOS intel)
* `arm64v8.dev` (M1-sillicon)
* `arm64v8.qa` (M1-sillicon)

(Optional) to learn more about the `docker-compose.yml` files, feel free to look at [Docker compose guide](./DOCKER_COMPOSE_GUIDE.md)

## Makefile

Make sure that you understand your role (dev, qa)

You can also find out architecture of your workstation by running `uname -m` (unless it's windows)



Most of the developemnt/testing use cases are documented in this [Makefile]
(../Makefile)

If you'd like to understand more about [Makefile](../Makefile), feel free to look at these resources

* [Makefile tutorial](https://makefiletutorial.com/)
* [Makefile built-in functions](https://www.gnu.org/software/make/manual/html_node/Functions.html)

In order not to duplicate every [Makefile](../Makefile) target, user role (`dev`, `qa`) is defined as environment variable

```bash
# Add following into ~/.bashrc or ~/.zshrc as dev
export PFDA_ROLE=dev
# Add following into ~/.bashrc or ~/.zshrc as qa
export PFDA_ROLE=qa
```

## Configuration differences for arm64v8.dev


If you're running `make run` with `arm64v8.dev` configuration (i.e. `arm64v8` architecture and `PFDA_ROLE=dev`), it uses different key paths for `nodejs-api`. Edit `https-apps-api/.env` with following values

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

```bash
make prepare-db
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

```bash
make run
```

Once the application is correctly installed & configured, you should be able to access the portal at `https://localhost:3000/`.
In order to log in to the system, ask for shared DEV credentials (ask some1 from the team)

### Running application with external services

```bash
make run-all
```

To get summary of all [Makefile](../Makefile) commands, take a look at [this summary](./SUMMARY_OF_MAKEFILE_COMMANDS.md)

### GSRS - external service

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

## Further reading

* [Summary of Makefile commands](./SUMMARY_OF_MAKEFILE_COMMANDS.md)
* [Docker compose guide](./DOCKER_COMPOSE_GUIDE.md)