#!/usr/bin/env bash
set -e

# ------------------------------
# Generate runtime environment for frontend
# ------------------------------
source /precision-fda/docker/entrypoint/runtime-env.sh
source /precision-fda/docker/entrypoint/robots-txt.sh
# ------------------------------
# Generate database.yml from DATABASE_URL
# ------------------------------

if [[ -z "$DATABASE_URL" ]]; then
  echo "DATABASE_URL not set!"
  exit 1
fi

echo "$SSL_CERT" > /precision-fda/cert.pem
echo "$SSL_KEY" > /precision-fda/key.pem

# Parse DATABASE_URL: mysql2://username:password@host:port/db_name
proto="$(echo $DATABASE_URL | grep :// | sed -e's,^\(.*://\).*,\1,g')"
url="${DATABASE_URL/$proto/}"
userpass="$(echo $url | cut -d@ -f1)"
hostportdb="$(echo $url | cut -d@ -f2)"

username="$(echo $userpass | cut -d: -f1)"
password="$(echo $userpass | cut -d: -f2)"
host="$(echo $hostportdb | cut -d: -f1)"
port="$(echo $hostportdb | cut -d: -f2 | cut -d/ -f1)"
database="$(echo $hostportdb | cut -d/ -f2)"

cat > config/database.yml <<EOL
${RAILS_ENV:-production}:
  adapter: mysql2
  encoding: utf8
  database: $database
  username: $username
  password: $password
  host: $host
  port: $port
  sslca: ${DB_SSLCA:-/precision-fda/global-bundle.pem}
  reconnect: true
  pool: ${DB_POOL:-5}
EOL

echo "database.yml generated from DATABASE_URL"

# ------------------------------
# Wait for DB
# ------------------------------
echo "Waiting for DB ($host:$port) to be ready..."
wait4ports -t 0 "tcp://$host:$port"
echo "DB connection established"


# ------------------------------
# If the command is a rake/rails task, just exec it (e.g. migrations)
# ------------------------------
if [[ "${1:-}" == "bundle" && "${2:-}" == "exec" && "${3:-}" == "rake" ]]; then
  echo "Running rake task: $*"
  exec "$@"
fi

# ------------------------------
# Otherwise start Puma
# ------------------------------
exec bundle exec puma -b "tcp://0.0.0.0:3000" -e "${RAILS_ENV:-production}"


