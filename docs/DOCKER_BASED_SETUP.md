# Docker-based setup

This guide covers all the steps required to get docker based
development environment.

## Installing docker and docker-compose

```
If you already have docker and docker-compose installed in your system, you can skip this step.
```

The first step you have to do is to install docker and docker-compose
in your OS.

Depending on OS you're using, installation process can vary so
please follow instructions for [docker](https://docs.docker.com/install/) 
and [docker-compose](https://docs.docker.com/compose/install/) related to 
your OS.

## Setting up

In order to set up application you have to setup database first. To do so
you have to run application by executing this command from project's root:

`$ docker-compose up --build`

This could take awhile since during first run all required software 
will be installed. Once you have containers up and running, run this command to
create database with the environment variables set with your account's data (if you don't have
an account yet, please refer to 
[new account registration](DEVELOPMENT_SETUP.md#New account registration)):
```
docker-compose exec \
    -e PFDA_USER_FIRST_NAME=Florante \
    -e PFDA_USER_LAST_NAME=DelaCruz \
    -e PFDA_USER_EMAIL=fdelacruz+pfdalocal@dnanexus.com \
    -e PFDA_USER_ORG_HANDLE=floranteorg \
    -e PFDA_USER_DXUSER=fdelacruz \
    web bundle exec rake {db:setup,db:migrate,user:generate_test_users}
```

__OR__

If you don't want to use your personal account you may omit all
environment variables and just run

`docker-compose exec web bundle exec rake {db:setup,db:migrate,user:generate_test_users}`

After this step you have all the required to start development.

## Running application

To run application just use this command:

`docker-compose up`

## QA testing environment

In order to run app in QA environment, use this command:

`docker-compose -f docker/isolation.docker-compose.yml up --build`

## Some useful commands

* Getting to MySQL container:

  `docker-compose exec db bash`
  
* Getting to MySQL console:

  First get to MySQL container then run `mysql -u root -p` (password is set
  in docker-compose.yml file)

For the rest of the useful commands see [here](USEFUL_COMMANDS.md).
