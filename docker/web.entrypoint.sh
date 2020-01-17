#!/usr/bin/env bash

sed -i '/^#/!s/CipherString = DEFAULT@SECLEVEL=2/#CipherString = DEFAULT@SECLEVEL=2/g' /etc/ssl/openssl.cnf

# Install gems if needed
bundle check || bundle install

# Run webserver
bundle exec thin --ssl start
