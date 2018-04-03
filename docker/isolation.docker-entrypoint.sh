#!/bin/sh

dockerize -wait tcp://db:3306

if [ -d "/mysql-volume/precisionfda@002dui@002dtest" ]; then
  bundle exec rake db:migrate
else
  bundle exec rake db:setup &&
   bundle exec rake user:generate_test_users
fi

bundle exec thin --ssl --debug start
