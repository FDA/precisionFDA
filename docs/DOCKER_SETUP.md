# Docker setup

This guide covers all the steps required to get docker based
development environment.

## Installing docker and docker-compose

**If you already have docker and docker-compose installed 
in your system, you can skip this step.**

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

This could take a while since during first run all required software 
will be installed. Once you have containers up and running run this command to
create database and seed it with data:

`$ docker-compose exec web bundle exec rake {db:setup,db:migrate}`

Also refer to [Localhost Setup](./LOCAL_INSTALL.md) 
section **pFDA localhost user** to create user on staging platform.

After this step you have all the required to start development.

## Running application

To run application just use this command:

`$ docker-compose up --build`

## Running tests

To run tests you have to use another compose file, so in order to do so
please use this command:

`$ docker-compose -f ./docker/isolation.docker-compose.yml run web rspec`

## Some useful commands

**All the commands should be executed when app is running**

* Getting to rails console:
  
  `$ docker-compose exec web bundle exec rails c`

* Running a migration:

  `$ docker-compose exec web bundle exec rake db:migrate`

* Getting to MySQL container:

  `$ docker-compose exec db bash`
  
* Getting to MySQL console:

  First get to MySQL container then `$ mysql -u root -p` (password is set
  in docker-compose.yml file)
