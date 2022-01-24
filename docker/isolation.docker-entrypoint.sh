#!/usr/bin/env bash

sed -i '/^#/!s/CipherString = DEFAULT@SECLEVEL=2/#CipherString = DEFAULT@SECLEVEL=2/g' /etc/ssl/openssl.cnf

dockerize -wait tcp://db:3306

cp config/database.yml.sample config/database.yml

bundle check || bundle install

if [ ! -d "/var/lib/mysql/precision@002dfda" ]; then
  bundle exec rake db:setup
else
  bundle exec rake db:migrate
fi

bundle exec rake user:generate_test_users

if [[ -f ./key.pem && -f ./cert.pem ]]; then
  bundle exec thin --debug start --ssl --ssl-key-file ./key.pem --ssl-cert-file ./cert.pem
else
  bundle exec thin --ssl --debug start
fi
