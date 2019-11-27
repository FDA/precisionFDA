#!/usr/bin/env bash

# Install gems if needed
bundle check || bundle install

# Run webserver
bundle exec thin --ssl start
