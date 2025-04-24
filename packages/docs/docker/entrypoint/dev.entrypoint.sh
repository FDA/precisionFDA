#!/bin/bash

# Check if args were provided
if [[ "$#" -eq 0 ]]; then
    echo "No Command provided"
    exit 1
fi

if [[ ! $SKIP_FRONTEND_DEPS_SETUP || $SKIP_FRONTEND_DEPS_SETUP = 0 ]]; then
    pnpm i --frozen-lockfile
fi

docker-entrypoint.sh "$@"
