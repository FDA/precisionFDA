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

# Run the Nest CLI as `node …/nest.js` (PID 1) instead of `pnpm run`, so SIGTERM/SIGINT reach
# Node directly and containers stop promptly. --watch is on by default; set NODE_DEV_WATCH=0 to disable.
nest_cli_js="node_modules/@nestjs/cli/bin/nest.js"
watch_args=()
if [[ "${NODE_DEV_WATCH:-1}" == "1" ]]; then
  watch_args+=(--watch)
fi

if [[ "$#" -ge 3 && "$1" == "pnpm" && "$2" == "run" ]]; then
  case "$3" in
    start:dev:api)
      exec node "$nest_cli_js" start api "${watch_args[@]}"
      ;;
    start:dev:worker)
      exec node "$nest_cli_js" start worker "${watch_args[@]}"
      ;;
    start:dev:admin-platform-client)
      exec node "$nest_cli_js" start admin-platform-client "${watch_args[@]}"
      ;;
  esac
fi

# Use exec to replace shell process and forward signals properly
exec docker-entrypoint.sh "$@"
