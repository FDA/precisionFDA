#!/usr/bin/env bash
# Writes runtime environment variables to a JSON file for the frontend client.
# This allows secrets like RECAPTCHA_SITE_KEY to be passed at container runtime
# rather than baked into the Docker image at build time.

set -euo pipefail

RUNTIME_ENV_DIR="${RUNTIME_ENV_DIR:-/precision-fda/public/env}"
RUNTIME_ENV_PATH="${RUNTIME_ENV_DIR}/keys.json"

if [[ -n "${RECAPTCHA_SITE_KEY:-}" ]]; then
  mkdir -p "$RUNTIME_ENV_DIR"
  
  TMP_PATH="${RUNTIME_ENV_PATH}.tmp"
  
  cat > "$TMP_PATH" <<EOF
{
  "RECAPTCHA_SITE_KEY": "${RECAPTCHA_SITE_KEY}"
}
EOF
  
  chmod 644 "$TMP_PATH"
  mv "$TMP_PATH" "$RUNTIME_ENV_PATH"
  
  echo "[runtime-env] Wrote ${RUNTIME_ENV_PATH}"
else
  echo "[runtime-env] RECAPTCHA_SITE_KEY not set; skipping runtime env write" >&2
fi

