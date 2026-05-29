#!/bin/bash
set -e

# --- Index Setup ---
# Index is always bind-mounted to /tmp/read-only-base.
# Production (ECS): OverlayFS keeps the shared index read-only with a writable upper layer.
# Local dev: symlink directly.
if [ "${GSRS_LOCAL_MODE}" = "true" ]; then
  echo "Local mode — symlinking index directly"
  mkdir -p /opt/gsrs
  ln -sfn /tmp/read-only-base /opt/gsrs/ginas.ix
  find /opt/gsrs/ginas.ix -name "write.lock" -delete 2>/dev/null || true
else
  UNIQUE_ID=$(hostname)
  UPPER="/tmp/overlay-data/${UNIQUE_ID}/upper"
  WORK="/tmp/overlay-data/${UNIQUE_ID}/work"
  MERGED="/opt/gsrs/ginas.ix"

  echo "Configuring OverlayFS for GSRS Index..."
  mkdir -p "$UPPER" "$WORK" "$MERGED"

  if ! mount -t overlay overlay \
    -o "lowerdir=/tmp/read-only-base,upperdir=$UPPER,workdir=$WORK" \
    "$MERGED"; then
    echo "ERROR: OverlayFS mount failed."
    exit 1
  fi
  echo "OverlayFS mounted"

  rm -f "$MERGED/write.lock"
fi

# --- Original GSRS Configuration ---
TC_PATH="/usr/local/tomcat"
WEBAPPS="$TC_PATH/webapps"

echo "--- Starting GSRS Configuration (Debian) ---"

if [ -f "/tmp/application.conf.template" ]; then
    echo "Configuring application.conf..."
    envsubst < /tmp/application.conf.template > "$WEBAPPS/substances/WEB-INF/classes/application.conf"
fi

if [ -f "/tmp/config.json.template" ]; then
    echo "Configuring config.json..."
    envsubst < /tmp/config.json.template > "$WEBAPPS/frontend/WEB-INF/classes/static/assets/data/config.json"
fi

echo "--- Starting Tomcat ---"
exec catalina.sh run