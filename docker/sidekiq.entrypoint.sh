#!/usr/bin/env bash

# Install gems if needed
bundle check || bundle install

# Run sidekiq
bundle exec sidekiq
