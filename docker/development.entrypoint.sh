#!/usr/bin/env bash

# Install gems if needed
bundle check || bundle install --binstubs

# Run webserver
bundle exec thin --ssl start
