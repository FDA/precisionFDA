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

Environment files are needed. You can either copy `.env.example` files to `.env` in directories `./docker`, `./packages/rails` and `./packages./server` to tweak the values or to keep the defaults, simply run

```bash
make repo-env-files-init
```

What remains to be done, is ask a colleague for secrets to fill missing `.env` variables. Migration to [AWS Secrets Manager](https://docs.aws.amazon.com/secretsmanager/latest/userguide/getting-started.html) is in progress


To get summary of all [Makefile](../Makefile) commands, take a look at [this doc](./SUMMARY_OF_MAKEFILE_COMMANDS.md)


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

### Running application with external services (GSRS)

To run PFDA with external integration part of local stack, set up the following env variable in your `.rc` file

```bash
# Add following into ~/.bashrc or ~/.zshrc to run GSRS
export PFDA_SHOULD_RUN_GSRS=1
```

Run in the same way with

```bash
make run
```

#### Switch GSRS version running in the container
1. Connect to the running container
2. Run script _run-version.sh_
3. Upon request paste required GSRS version branch name as in [gsrs-play-dist repo](https://github.com/dnanexus/gsrs-play-dist)

#### GSRS frontend development live update
Once you have the _gsrs_ container running, you can use it for GSRS frontend development:
1. Clone [GSRSFrontend repo](https://github.com/ncats/GSRSFrontend/tree/precision_new), branch _precision_new_.
2. Create env _GSRS_FRONTEND_PATH_ (eg. in your `~/.zshrc`) with an absolute path to the repo (eg. _/Users/pbarta@dnanexus.com/ncats/GSRSFrontend_)
3. Restart _gsrs_ container
4. Edit several config files in the cloned repo (these changes are not supposed to be committed):
 - `angular.json` - add line `"baseHref": "/ginas/app/beta/",` under `projects.gsrs-client.architect.options`
 - `src/app/fda/config/config.json` - add line `"customToolbarComponent": "precisionFDA",`
 - `src/environments/environment.fda.local.ts` - set following variables:
    ```bash
    environment.apiBaseUrl = 'https://localhost:3000/ginas/app/';
    environment.baseHref = '/ginas/app/beta/';
    ```
5. Connect to the running _gsrs_ container, run script `switch-frontend.sh` (located in root) and follow the instructions.
    ```bash
    docker exec -it <GSRS_CONTAINER_ID> bash
    cd /
    ./switch-frontend.sh
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