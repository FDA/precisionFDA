#!/bin/sh

sed -i '/^#/!s/CipherString = DEFAULT@SECLEVEL=2/#CipherString = DEFAULT@SECLEVEL=2/g' /etc/ssl/openssl.cnf

dockerize -wait tcp://db:3306

cp config/database.yml.sample config/database.yml

bundle check || bundle install

if [ ! -d "/var/lib/mysql/precisionfda@002dui@002dtest" ]; then
  bundle exec rake db:setup
else
  bundle exec rake db:migrate
fi

bundle exec rake user:generate_test_users

bundle exec thin --ssl --debug start
