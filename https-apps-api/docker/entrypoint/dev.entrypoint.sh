#!/bin/bash


# Check if args were provided
if [[ "$#" -eq 0 ]]; then
    echo "No Command provided"
    exit 1
fi

if [[ ! $SKIP_NODEJS_DEPS_SETUP || $SKIP_NODEJS_DEPS_SETUP = 0 ]]; then
  is_node_modules_empty=$(find ./node_modules -maxdepth 0 -empty)
  # In case of empty node modules, `yarn check` is a waste of time
  if [[ $is_node_modules_empty ]]; then
    yarn --frozen-lockfile
  else
    yarn check || yarn --frozen-lockfile
  fi
fi

# TODO(samuel) implement waiting for db here

# NOTE(samuel) wrap the original docker entrypoint
docker-entrypoint.sh "$@"
