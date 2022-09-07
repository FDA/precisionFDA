#!/usr/bin/env bash

sed -i '/^#/!s/CipherString = DEFAULT@SECLEVEL=2/#CipherString = DEFAULT@SECLEVEL=2/g' /etc/ssl/openssl.cnf

# Install gems if needed
bundle check || bundle install

if [[ -f ./key.pem && -f ./cert.pem ]]; then
  bundle exec thin --debug start --ssl --ssl-key-file ./key.pem --ssl-cert-file ./cert.pem
else
  bundle exec thin --ssl --debug start
fi
