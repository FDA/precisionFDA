# OS-based setup

## MySQL 5.6 on MacOS
At the moment latest MySQL 5.6 (mysql@5.6 or mysql@5.6.46) has a bug that
doesn't allow to build mysql gem, so it's __REQUIRED__ to use version 5.6.43

`brew install mysql@5.6.43`

## MySQL 5.6 on Ubuntu Linux
Since Ubuntu 18.04 doesn't have MySQL 5.6 support out-of-box, you have to add
apt repository in your system and install MySQL from that repo. For more information
look [here](https://dev.mysql.com/doc/mysql-apt-repo-quick-guide/en/).

## Setting up and running

* Install RVM
    * `gpg --keyserver hkp://keys.gnupg.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3`
    * `\curl -sSL https://get.rvm.io | bash -s stable`

* Install ruby
    * `rvm install 2.3.8`

* Move to project's root directory
    * `cd <wherever you've clonned project>`

* Install bundler
    * `gem install bundler`
    
      __OR__ to keep the current bundler version from Gemfile.lock, run 
    
      `gem install bundler -v 1.16.6`

* Install required gems
    * `bundle install`
        
* Update the `libv8` gem before `bundle i`:
    * `gem install libv8 -v '3.16.14.13' -- --with-system-v8`
    
* Create database with the environment variables set with your account's data (if you don't have
an account yet, please refer to [new account registration](DEVELOPMENT_SETUP.md#New account registration)):
    * ```
      bundle exec rake {db:setup,db:migrate,user:generate_test_users} \
          PFDA_USER_FIRST_NAME=Florante \
          PFDA_USER_LAST_NAME=DelaCruz \
          PFDA_USER_EMAIL=fdelacruz+pfdalocal@dnanexus.com \
          PFDA_USER_ORG_HANDLE=floranteorg \
          PFDA_USER_DXUSER=fdelacruz
      ```

    __OR__

    If you don't want to use your personal account you may omit all
    environment variables and just run
    
    `docker-compose exec web bundle exec rake {db:setup,db:migrate,user:generate_test_users}`

* Start rails server
    * `bundle exec thin --ssl --debug start`
    
* Point your browser to [https://localhost:3000](https://localhost:3000), if you're seeing
index page, setup is done.

### Issues

On your first `bundle`, you may have issues installing the libv8 and
therubyracer gems. See [here](https://github.com/cowboyd/libv8/issues/205) for
potential solutions. Try `bundle update libv8`.

## Useful commands

You can find some useful commands [here](USEFUL_COMMANDS.md).
