#!/bin/bash
set -euo pipefail

# Check if args were provided
if [[ "$#" -eq 0 ]]; then
    echo "No Command provided"
    exit 1
fi

# Reuse service-level env variables for db polling
if [[ ! -f .env ]]; then
    echo "Missing packages/server/.env. Run 'make repo-env-files-init' from the repository root." >&2
    exit 1
fi
source .env

while ! mysql --user="${NODE_DATABASE_USER}" --password="${NODE_DATABASE_PASSWORD}" --host=db --database="${NODE_DATABASE_NAME}" --silent --execute 'SELECT 1;'; do
    echo "Database not ready - waiting ${NODEJS_DB_POLLING_INTERVAL:-5} second(s)"
    sleep "${NODEJS_DB_POLLING_INTERVAL:-5}"
done

echo "Database connection established"

# Use exec to replace shell process and forward signals properly
exec docker-entrypoint.sh "$@"
