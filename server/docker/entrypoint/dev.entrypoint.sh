#!/bin/bash
# Check if args were provided
if [[ "$#" -eq 0 ]]; then
    echo "No Command provided"
    exit 1
fi

if [[ ! $SKIP_NODEJS_DEPS_SETUP || $SKIP_NODEJS_DEPS_SETUP = 0 ]]; then
    pnpm i --frozen-lockfile
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
