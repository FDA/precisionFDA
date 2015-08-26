# Precision FDA

The Precision FDA project is a web application which allows diagnostic testing
companies to collaborate and validate their analysis. This project was built
in collaboration with the FDA, to build a community around next generation
diagnostic testing. This project is still VERY young, so expect a lot of
changes coming soon.

## Tech stack
* Ruby 2.2.3
* Rails 4.2.3
* SQLite3 in development,  Mysql 5.6.26 in production

## Tooling
* Test framework TBD
* Template language TBD (ERB vs HAML, etc)
* Coffeescript
* [RVM](https://rvm.io/) for managing ruby version
* [Bundler](http://bundler.io/) for managing gem dependencies

## Setting up your development environment
1. `git clone git@github.com:dnanexus/precision-fda.git && cd precision-fda`
1. [Ubuntu only] If using gnome-terminal, https://rvm.io/integration/gnome-terminal
1. [OS X only] `xcode-select --install`
1. Set up RVM
    1. [Ubuntu only] `gpg --keyserver hkp://keys.gnupg.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3`
    1. `curl -sSL https://get.rvm.io | bash -s stable`
    1. Source the rvm file mentioned in the previous command or open a new terminal before proceeding
1. Install and use ruby 2.2.3
    1. `rvm install ruby-2.2.3`
    1. `rvm use 2.2.3 --default`
1. Install builder and gems
    1. `gem install bundler --version 1.10.6`
    1. `bundle install` (Alternatively, if you don't want your gems to be tainted, do `bundle install --deployment`. This will install gems in ./vendor/bundle. Binaries in those gems will not be in your path by default, but you can run them via `bundle exec <cmd>`, i.e. `bundle exec thin`)
1. `thin --ssl start` (or, if you followed the "Alternatively" path above, `bundle exec thin --ssl start`)
1. Visit https://localhost:3000 (don't forget the SSL) and ignore any certificate warnings. For example, in Chrome click "advanced" on the lower left and then click "proceed" below.
