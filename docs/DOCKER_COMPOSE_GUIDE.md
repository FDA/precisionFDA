# Docker compose guide

This guide contains summary and best practices for dockerization in this repo.

_Last updated: 14.6.2022_

## Prerequisites

Make sure that you understand local configurations, described in [root "Makefike"](../Makefile) and ["docker-based setup" document](./DOCKER_BASED_SETUP.md)

## `extends` keyword

Although according to [docker documentation](https://docs.docker.com/compose/extends/#extending-services), `extend`ing is no longer supported in the most recent compose specification-v3, [this update](https://github.com/docker/compose/pull/7588) however makes it possible, to use blend of features from two different compose specifiactions (read through PR comments for more information) - in other words, we can use `extends` keyword

We use `extends` as primary tool to structure docker configuration with DRY principles

## Shared vs. specific

As mentioned in ["docker-based setup" document](./DOCKER_BASED_SETUP.md) and defined in [root "Makefike"](../Makefile), we use 4 specific configurations. There are 2 main reasons for that. Firstly because QAs and devs have different requirements, but also because of bugs in docker for `M1-silicon` apple CPUs - list mentioned  on [docker website](https://docs.docker.com/desktop/mac/apple-silicon/)

Summary of configurations

* `dev`
* `qa`
* `arm64v8-dev`
* `arm64v8-qa`

When creating/updating options, you should take into consideration, whether the option impacts colleagues - is it applicable/desired/required for their situation? Or is it only my specific use case?

In order to retain DRY principles, majority of settings is shared in following files

* [`base.services.yml`](../docker/base.services.yml)
* [`external.services.yml`](../docker/external.services.yml)
    * Details described in section [External services](#external-services) 

Due to maintenance of multiple configurations, that have their own specifics, each configuration has its own `docker-compose`

If you take a look at [one of docker-compose files](../docker/dev.docker-compose.yml) implementation mostly consists of `extend`ing services defined in `base.services.yml` and applying additional settings.

### Volumes

`extends` keyword in `docker compose` works only for services and currently there's no elegant way of reusing `docker` volumes (external volumes don't count)

_if you happen to find anything, feel free to apply it here_ :)

## Summary of best practices

### Secrets

First and foremost **never** add value that is considered secret into `docker-compose`. Even though kubernetes already has tooling to version secrets and it's possible in terms of technologies, this is not the time and place.

Environment variables that are considered secrets, shouldn't be versioned and consider defining them in corresponding `.env` file - preferably on service level. If secret value is required during build, consider adding it into [`./docker/.env`](../docker/.env.example), more information in [docker documentation](https://docs.docker.com/compose/environment-variables/#the-env-file)

### Configuration settings

Keep as many settings shared as possible in `*.services.yml` files.

If you encounter
* setting specific only for `M1-silicon` CPU, such as emulated image
  * For instance `node-sass` requires emulation on arm64v8 architectures, because of its dependencies on native libs
* qa specific setting
* Workaround, that could have drastic impact

You should add these type of settings to specific `docker-compose.yml`

### Versions

Keep all the versions at single place - preferably [`base.services.yml`](../docker/base.services.yml) (at least for now)

Updating at multiple places is tedious and is reason why emulated services, such as `db_emulated` remain in [`base.services.yml`](../docker/base.services.yml), even if they could be defined in specific `docker-compose.yml`

## External services

Integrated services that aren't considered part of 'standard' stack are defined in `external.services.yml`.
In order to minimize image build and setup parts of container processes, they are excluded by default.
You can run them by merging multiple `docker-compose.yml` files, as mentioned in [docker documentation](https://docs.docker.com/compose/extends/#multiple-compose-files).

Similar as `base.services.yml`, platform-related specifics are defined in
* [`external.docker-compose.yml`](../docker/external.docker-compose.yml)
* [`external.arm64v8.docker-compose.yml`](../docker/external.arm64v8.docker-compose.yml)

## (Hopefully) Future simplification

As mentioned, differences in M1-silicon make the setup difficult. In event, when [here mentioned](https://docs.docker.com/desktop/mac/apple-silicon/) issues get resolved, deprecation of `arm64v8-dev` and `arm64v8-qa` configurations should be taken into consideration.
