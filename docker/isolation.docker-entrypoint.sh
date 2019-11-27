#!/bin/sh

dockerize -wait tcp://db:3306

cp config/database.yml.sample config/database.yml

bundle check || bundle install

if [ -d "/var/lib/mysql/precisionfda@002dui@002dtest" ]; then
  bundle exec rake db:migrate
else
  bundle exec rake db:setup
  bundle exec rake db:migrate
  bundle exec rake user:generate_test_users
fi

bundle exec thin --ssl --debug start
