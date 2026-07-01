#!/bin/bash
set -euo pipefail

# Check if args were provided
if [[ "$#" -eq 0 ]]; then
    echo "No Command provided"
    exit 1
fi

# Reinstall deps only when pnpm-lock.yaml changed, detected via a fingerprint marker kept in the
# persisted node_modules cache volume. A bumped lockfile reinstalls automatically; no flag to flip.
FE_DEPS_MARKER=/precision-fda/node_modules/.pfda-pnpm-lock.sha
FE_DEPS_FINGERPRINT="$(sha256sum pnpm-lock.yaml | cut -d' ' -f1)"
if [[ "$(cat "$FE_DEPS_MARKER" 2>/dev/null || true)" == "$FE_DEPS_FINGERPRINT" ]]; then
    echo "Frontend deps unchanged (pnpm-lock.yaml fingerprint match) — skipping pnpm install"
else
    pnpm i --frozen-lockfile
    echo "$FE_DEPS_FINGERPRINT" > "$FE_DEPS_MARKER"
fi

exec "$@"
