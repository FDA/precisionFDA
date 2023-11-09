# Docker-based setup


This guide covers all the steps required to get docker based
development environment. There are also a few _optional_ sections, that are recommended to use for full-stack developer roles

_Last updated: 25.11.2022_

## Installing docker and docker-compose

> If you already have docker installed in your system, you can skip this step.

The first step you have to do is to install [docker](https://docs.docker.com/install/) on your workstation. Instructions are **platform-specific**

## Platform differences

Because of [platform differences](./MACOS_ARCHITECTURE_DIFFERENCES.md) between M1-silicon and Intel MacOS CPUs and technologies used in our stack, the docker environment setup is **platform-specific**.

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

## Setup before running

Run

```bash
make repo-init
```

to do most of the required setup at once

This does multiple things

* Sets up .env files in `.`, `./docker`, `./https-apps-api` directories
* Creates default database config in `config/database.sample.yml` 
* Creates custom pre-push githooks that validate `.env.example` files

What remains to be done, is ask a colleague for secrets to fill missing `.env` variables. Migration to [AWS Secrets Manager](https://docs.aws.amazon.com/secretsmanager/latest/userguide/getting-started.html) is in progress


To get summary of all [Makefile](../Makefile) commands, take a look at [this doc](./SUMMARY_OF_MAKEFILE_COMMANDS.md)

## Configuration differences for arm64v8.dev


If you're running `make run` with `arm64v8.dev` configuration (i.e. `arm64v8` architecture and `PFDA_ROLE=dev`), it uses different key paths for `nodejs-api`. Edit `https-apps-api/.env` with following values

```
NODE_PATH_CERT=/keys/cert.pem
NODE_PATH_KEY_CERT=/keys/key.pem
```

### Githooks - use cases and troubleshooting



If you happen to encounter blocking issues with githooks you can roll-back to initial state (with no adjustments) with following command

```bash
find ./utils/githooks -type f -exec sh -c 'rm ".git/hooks/$(basename {})"' \;
```

## (Optional) Account setup

To use your own account to log-in to the system, run the command to
create database with the environment variables set with your account's data (if you don't have
an account yet, please refer to
[New account registration](DEVELOPMENT_SETUP.md#new-account-registration)):

```bash
# TODO refactor this into Makefile as well
docker compose exec \
    -e PFDA_USER_FIRST_NAME=Florante \
    -e PFDA_USER_LAST_NAME=DelaCruz \
    -e PFDA_USER_EMAIL=fdelacruz+pfdalocal@dnanexus.com \
    -e PFDA_USER_ORG_HANDLE=floranteorg \
    -e PFDA_USER_DXUSER=fdelacruz \
    web bundle exec rake {db:setup,db:migrate,db:generate_mock_data,user:generate_test_users}
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
#     web bundle exec rake {db:setup,db:migrate,db:generate_mock_data,user:generate_test_users}
```

## Running application

```bash
make run
```

Once the application is correctly installed & configured, you should be able to access the portal at `https://localhost:3000/`.
In order to log in to the system, ask for shared DEV credentials (ask some1 from the team)

### Running application with external services

To run PFDA with external integration part of local stack, set up the following env variable in your `.rc` file

```bash
# Add following into ~/.bashrc or ~/.zshrc to run GSRS
export PFDA_SHOULD_RUN_GSRS=1
```

Run in the same way with

```bash
make run
```

## (Optional) Setup for impatient personalities

There are a few [docker-related](../docker/arm64v8.dev..docker-compose.yml) [env variables](../docker/.env.example), that are used in `docker-compose.yml` files, such as `SKIP_RUBY_SETUP`
After you run your docker setup successfully, and want to save some time by skipping dependency checks and reinstallations (assuming you've got them correct)

For obvious reasons these settings aren't versioned, and therefore are kept in separate [docker/.env](../docker/.env.example) file. Feel free to setup according your own need


## (Alternative) Symlink docker-compose.yml for less typing

If you want to use `docker compose` command with minimum of typing, you can symlink your preconfigured `docker-compose.yml` (for instance `docker/arm64v8.dev.docker-compose.yml`) into `docker/docker-compose.yml`. It is `.gitignore`d for this purposed

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

This should make use of docker compose pretty trivial as you can start it simply by running - in most cases you should be fine without GSRS

```bash
# PWD=./docker
docker compose up --build
```

## Further reading

* [Summary of Makefile commands](./SUMMARY_OF_MAKEFILE_COMMANDS.md)
* [Docker compose guide](./DOCKER_COMPOSE_GUIDE.md)