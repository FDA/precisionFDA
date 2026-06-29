#!/bin/bash
set -e

cd /app

echo "=== GSRS Frontend Dev Server ==="

# Install deps if node_modules is missing or outdated
if [ ! -d "node_modules/.bin/ng" ]; then
  echo "Installing dependencies (first run — this may take a few minutes)..."
  npm install --legacy-peer-deps
  # @types/deep-equal uses 'export =' which is incompatible with 'import * as'
  # in newer Angular/TS. Remove it — the code works fine without types for deep-equal.
  rm -rf node_modules/@types/deep-equal
fi

# Patch environment file for local development if not already patched
ENV_FILE="src/environments/environment.fda.local.ts"
if [ ! -f "$ENV_FILE" ]; then
  echo "Creating $ENV_FILE for local development..."
  cat > "$ENV_FILE" <<'EOF'
import { environment as fdaEnv } from './environment.fda';
export const environment = {
  ...fdaEnv,
  apiBaseUrl: 'https://localhost:3000/ginas/app/',
  baseHref: '/ginas/app/ui/',
};
EOF
fi

# Extract Dojo libs from lib/dojo-custom-jsdraw.zip into
# src/app/core/assets/ so the JSDraw structure editor can
# load them at /assets/dojo/dojo.js etc. Without this step ng serve does NOT
# serve those files (404) and the editor fails with "dojo is not defined".
if [ ! -d "src/app/core/assets/dojo" ]; then
  echo "Extracting Dojo/JSDraw assets (first run only)..."
  npm run process-dojo
fi

echo "Starting Angular dev server on port 4200..."
echo "Live reload enabled — changes to source files will auto-rebuild."
export NODE_OPTIONS="--max-old-space-size=4096"
exec npx ng serve \
  --host 0.0.0.0 \
  --port 4200 \
  --disable-host-check \
  --configuration fda.local \
  --poll 2000
