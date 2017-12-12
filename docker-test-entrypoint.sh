#!/bin/sh
service mysql start && bundle exec rake db:setup && bundle exec rake
