# Localhost setup on OSX 10.11.6

## Overview

To develop on pFDA locally you need to manually add a new user and organization.
Because when you first get started in a new system,
there is no existing user. So you can't log in to provision new accounts.
This requires manually "bootstrapping" the situation in steps described in
[pFDA localhost user](#pFDA-localhost-user).

## Install

### Setup for localhost development on MacOS

* Install XCode
    * Search and install XCode from the App Store.
* Install Apple Command Line Tools
    * Open XCode (this just needs to run once to initialize it) and close it.
    * Install XCode command line tools by running `xcode-select --install` in
    the terminal.
* Install [Homebrew](http://brew.sh/)
    * `/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"`
    * Run `brew update` to make sure all your formulas are current
* Install RVM
    * `gpg --keyserver hkp://keys.gnupg.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3`
    * `\curl -sSL https://get.rvm.io | bash -s stable`
* Install ruby
    * `rvm install 2.2.3`
* Install bundler
    * `gem install bundler`
    * to keep the current bundler version from Gemfile.lock:
        * `gem install bundler -v 1.16.6`
* Update the `libv8` gem before `bundle i`:
    * `gem install libv8 -v '3.16.14.13' -- --with-system-v8`
* Install git
    * `brew install git`
* Set up git ssh
    * `ssh-keygen -t rsa -b 4096 -C "your_email@dnanexus.com"`
    * Use `pbcopy < ~/.ssh/id_rsa.pub` to add SSH key to github [here](https://github.com/settings/keys)
* Set up git config
    * `git config --global core.editor "vim"`
    * `git config --global user.email “your_email@dnanexus.com”`
    * `git config --global user.name “FirstName LastName”`
    * `git config --global push.default simple`

### Docker setup

* Install Docker and Docker-Compose. See [instructions](https://docs.docker.com/compose/install/)
* Install gems
  * `docker-compose run web bundle install`
* Prepare db
  * `docker-compose run web bundle exec rake db:create`
  * `docker-compose run web bundle exec rake db:schema:load`

## pFDA setup

* Clone Repo
    * `git clone git@github.com:dnanexus/precision-fda.git`
* `bundle install`
* `bundle exec rake db:schema:load`

### Issues

On your first `bundle`, you may have issues installing the libv8 and
therubyracer gems. See [here](https://github.com/cowboyd/libv8/issues/205) for
potential solutions. Try `bundle update libv8`.

## pFDA localhost user

Register for a new user account at [https://staging.dnanexus.com/register](https://staging.dnanexus.com/register).
Note: the first time you visit this, you will be prompted to enter the credentials (ask around for what it is).
You must choose an unused email address, but you can use the google "+" trick
to signup with a variable email address, e.g. yourname+pfdalocal@dnanexus.com.
Activate your account with the link sent to your email.

Create a new organization:
- Choose an unused handle, such as floranteorg. Prepend pfda.. (two dots), so that the final handle will be pfda..floranteorg.
- Get access to the "dx" command line client [https://wiki.dnanexus.com/Downloads](https://wiki.dnanexus.com/Downloads).
- Type `dx login --staging` and log in with your new account.
- Type `dx new org --handle pfda..floranteorg "Florante's org"`
- Log into the web UI [https://staging.dnanexus.com](https://staging.dnanexus.com)
with your account, access your profile on the upper right.
- Click __Billing Accounts__
- Click __Add Billing Info__ in the pfda..floranteorg entry.
- Enter info (it doesn't have to be real, you can type "." in most entries). Enter your real DNAnexus email, however.
- Click __Update Billing Information__
- Check your email for a new email message asking you to confirm by clicking the link
- Click the link to confirm.

Create a User and Org, and other required records by running


The _dxuser_ of the user record must match your DNAnexus username, and the _handle_ of the org record must
match the DNAnexus org handle without the pfda.. prefix, i.e. floranteorg.

## pFDA running

* start rails server
    * `bundle exec thin --ssl start`
    * **You must use https, ex: [https://localhost:3000](https://localhost:3000)**
* start rails console
    * `bundle exec rails c`

## Testing

* Run all tests
    * `rake test`
