#!/bin/bash
set -euo pipefail

# Check if args were provided
if [[ "$#" -eq 0 ]]; then
    echo "No Command provided"
    exit 1
fi

# Reinstall deps only when pnpm-lock.yaml changed, detected via a fingerprint marker kept in the
# persisted node_modules cache volume. A bumped lockfile reinstalls automatically; no flag to flip.
DOCS_DEPS_MARKER=/app/node_modules/.pfda-pnpm-lock.sha
DOCS_DEPS_FINGERPRINT="$(sha256sum pnpm-lock.yaml | cut -d' ' -f1)"
if [[ "$(cat "$DOCS_DEPS_MARKER" 2>/dev/null || true)" == "$DOCS_DEPS_FINGERPRINT" ]]; then
    echo "Docs deps unchanged (pnpm-lock.yaml fingerprint match) — skipping pnpm install"
else
    pnpm i --frozen-lockfile
    echo "$DOCS_DEPS_FINGERPRINT" > "$DOCS_DEPS_MARKER"
fi

exec docker-entrypoint.sh "$@"
