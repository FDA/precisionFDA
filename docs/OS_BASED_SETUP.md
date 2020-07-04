# OS-based setup

## MySQL database

### MySQL 5.6 on MacOS
At the moment latest MySQL 5.6 (mysql@5.6 or mysql@5.6.46) has a bug that
doesn't allow to build mysql gem, so it's __REQUIRED__ to use version 5.6.43

`brew install mysql@5.6.43`

### MySQL 5.6 on Ubuntu Linux
Since Ubuntu 18.04 doesn't have MySQL 5.6 support out-of-box, you have to add
apt repository in your system and install MySQL from that repo. For more information
look [here](https://dev.mysql.com/doc/mysql-apt-repo-quick-guide/en/).

## Installation

* Install RVM
    * `gpg --keyserver hkp://keys.gnupg.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3`
    * `\curl -sSL https://get.rvm.io | bash -s stable`

* Install ruby
    * `rvm install 2.7.1`

* Move to project's root directory
    * `cd <wherever you've clonned project>`

* Install bundler
    * `gem install bundler`

      __OR__ to keep the current bundler version from Gemfile.lock, run

      `gem install bundler -v 2.1.4`

* (Mac) To overcome `bundle install` errors, you may need to install the following dependencies manually:
    * `cmake` (required to build `rugged` gem)
        * `brew install cmake`
    * V8, libv8 (required to install `therubyracer` gem)
        * `brew install v8@3.15`
        * `gem install libv8 -v '3.16.14.19' -- --with-system-v8`
            * Note: you may need to update the version to match the one bundler's trying to install.
    * `therubyracer`
        * First, find your V8 directory - look for `/usr/local/opt/v8@*`
        * `gem install therubyracer -- --with-v8-dir=/usr/local/opt/v8@3.15`
        * Source: https://gist.github.com/fernandoaleman/868b64cd60ab2d51ab24e7bf384da1ca

* Install the other required gems
    * `bundle install`

## Configure

See [the Configure section in `DOCKER_BASED_SETUP.md`](./DOCKER_BASED_SETUP.md#1.-configure) for the details.

### DB setup

#### Configure local database

After pointing the application to your local DB (`config/database.yml`), use the same commands to setup the DB as when setting-up a Docker-based DB (see [`DOCKER_BASED_SETUP.md`](./DOCKER_BASED_SETUP.md#3.-prepare-the-database).

#### Use Databse running in Docker

Alternatively, you can use a database running inside Docker (see [`DOCKER_BASED_SETUP.md`](./DOCKER_BASED_SETUP.md) for further details).

To point your local Rails application to the Docker-based DB, set `default.host` to `127.0.0.1` in `config/database.yml`.

## Run

To start rails server, run:
    * `bundle exec thin --ssl --debug start`

* Point your browser to [https://localhost:3000](https://localhost:3000), if you're seeing
index page, setup is done.

## Test

To run unit & integration tests, use the following commands
* Rails (RSpec):  `rspec` or `bundle exec rspec`
  * Note: some of these tests require a DB to be configured
* CoffeeScript (Jest): `yarn test` or `yarn test:watch` for watch mode

### Issues

On your first `bundle`, you may have issues installing the libv8 and
therubyracer gems. See [here](https://github.com/cowboyd/libv8/issues/205) for
potential solutions. Try `bundle update libv8`.

## Useful commands

You can find some useful commands [here](USEFUL_COMMANDS.md).
