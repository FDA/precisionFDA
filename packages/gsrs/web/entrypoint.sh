#!/bin/bash
set -e

# --- OverlayFS Setup ---
# Use the unique hostname (container ID) to prevent collisions if you run multiple tasks
UNIQUE_ID=$(hostname)
UPPER="/tmp/overlay-data/${UNIQUE_ID}/upper"
WORK="/tmp/overlay-data/${UNIQUE_ID}/work"
MERGED="/opt/gsrs/ginas.ix"

echo "Configuring OverlayFS for GSRS Index..."
mkdir -p "$UPPER" "$WORK" "$MERGED"

# The Actual Mount Command
mount -t overlay overlay \
  -o lowerdir=/tmp/read-only-base,upperdir="$UPPER",workdir="$WORK" \
  "$MERGED"

# Lucene cleanup: ensure no stale locks from the base index block startup
rm -f "$MERGED/write.lock"

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