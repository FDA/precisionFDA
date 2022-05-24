#!/bin/sh

cp config/database.sample.yml config/database.yml

service mysql start

bundle exec rake db:setup
bundle exec rake
