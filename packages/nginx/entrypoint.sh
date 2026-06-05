#!/bin/sh
set -e

# Write SSM secrets to files (passed via ECS secrets)
echo "$SSL_CERT" > /etc/nginx/ssl/pfda.crt
echo "$SSL_KEY" > /etc/nginx/ssl/pfda.key

sed -i "s|\${UNII_HOST}|$UNII_HOST|g" /etc/nginx/nginx.conf

RUNTIME_ENV_DIR="/usr/share/nginx/html/env"
RUNTIME_ENV_PATH="${RUNTIME_ENV_DIR}/keys.json"

mkdir -p "$RUNTIME_ENV_DIR"

cat > "$RUNTIME_ENV_PATH" <<EOF
{
  "RECAPTCHA_SITE_KEY": "${RECAPTCHA_SITE_KEY:-}"
}
EOF

chmod 644 "$RUNTIME_ENV_PATH"
echo "[runtime-env] Wrote ${RUNTIME_ENV_PATH}"

# Execute CMD arguments (nginx -g 'daemon off;')
exec "$@"
