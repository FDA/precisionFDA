# Precision FDA

The Precision FDA project is a web application which allows diagnostic testing
companies to collaborate and validate their analysis. This project was built
in collaboration with the FDA, to build a community around next generation
diagnostic testing. This project is still VERY young, so expect a lot of
changes coming soon.

## Tech stack
* Ruby 2.2
* Rails 4.2
* SQLite in development,  Mysql 5.6.26 in production

## Tooling
* Test framework TBD
* Template language TBD (ERB vs HAML, etc)
* Coffeescript
* [RVM](https://rvm.io/) for managing ruby version
* [Bundler](http://bundler.io/) for managing gem dependencies

## Setting up your development environment
1. If using gnome-terminal, https://rvm.io/integration/gnome-terminal
1. Install rubygems 2.4.6
    * Ubuntu: ""
1. Install SQLite
    * Ubuntu: `apt-get install sqlite3`
    * Mac: `brew install sqlite3`
1. `./setup_dev_env.sh`
1. `rvm use 2.2.1 --default`
