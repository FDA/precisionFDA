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
    # Verifies only direct dependencies - i.e. skips errors from transitive dependencies
    # https://classic.yarnpkg.com/en/docs/cli/check#toc-yarn-check-verify-tree
    yarn check --verify-tree || yarn --frozen-lockfile
  fi
fi

# Reuse service-level env variables for db polling
source .env

if [[ ! $SKIP_NODEJS_DB_WAITING || $SKIP_NODEJS_DB_WAITING = 0 ]]; then
  while ! mysql --user=${NODE_DATABASE_USER} --password=${NODE_DATABASE_PASSWORD} --host=db --database=${NODE_DATABASE_NAME} --silent --execute 'SELECT 1;'; do
    echo "Database not ready - waiting ${NODEJS_DB_POLLING_INTERVAL} second(s)"
    sleep ${NODEJS_DB_POLLING_INTERVAL}
  done
fi

echo "Database connection established"

# TODO(samuel) wrap the original docker entrypoint
docker-entrypoint.sh "$@"
