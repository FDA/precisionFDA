#!/bin/sh

cp config/database.yml.sample config/database.yml

service mysql start

bundle exec rake db:setup
bundle exec rake
