#!/usr/bin/env bash

sed -i '/^#/!s/CipherString = DEFAULT@SECLEVEL=2/#CipherString = DEFAULT@SECLEVEL=2/g' /etc/ssl/openssl.cnf

dockerize -wait tcp://db:3306

cp config/database.sample.yml config/database.yml

if [[ ! $SKIP_RUBY_DEPS_SETUP || $SKIP_RUBY_DEPS_SETUP = 0 ]]; then
  bundle check || bundle install
fi

if [[ ! $SKIP_DB_SETUP || $SKIP_DB_SETUP = 0 ]]; then
  # Runs setup if database does not exist, or runs migrations if it does
  bundle exec rake db:prepare

  bundle exec rake user:generate_test_users
fi

if [[ -f ./key.pem && -f ./cert.pem ]]; then
  bundle exec thin --debug start --ssl --ssl-key-file ./key.pem --ssl-cert-file ./cert.pem
else
  bundle exec thin --ssl --debug start
fi
