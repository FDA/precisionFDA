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

### 1. Configure

- Create a `config/database.yml` file containing the database configuration for the portal.
  - You can use [`database.yml.sample` file](../config/database.yml.sample) as a template.
  - *Optionally*, update the configuration copied from the sample file as needed.
- Create a `.env` file in the project root with an additional environment variables to be passed into Docker containers.
  - See [`.env.sample` file](../.env.sample) for a reference.
  - To run the portal on a local machine, configure at least:
    - `NO_FIPS=1` - disables FIPS mode
    - `REDIS_WORKER_URL=redis://redis` - points Sidekiq to a running Redis instance. Use `redis` hostname to point to an instance created with `docker-compose`.
    - `ADMIN_TOKEN` (ask your teammate for this one)

### 2. Build & start

Execute the following command from project's root:

`$ docker-compose up --build`

This could take a while since during first run all required software 
will be installed.

### 3. Prepare the database

#### Quick setup

Once you have containers up and running, run this command to set-up your database:
`docker-compose exec web bundle exec rake {db:setup,db:migrate,user:generate_test_users}`

After this, you'll be able to use shared DEV credentials to log-in to the system (ask Pamella or somebody from the team to get those).

#### Full setup

To use your own account to log-in to the system, run the command to
create database with the environment variables set with your account's data (if you don't have
an account yet, please refer to
[New account registration](DEVELOPMENT_SETUP.md#new-account-registration)):


### 4. Validate the setup

Once the application is correctly installed & configured, you should be able to access the portal at:
```
https://localhost:3000/
```

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
