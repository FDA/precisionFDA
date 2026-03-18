#!/usr/bin/env bash
#
# Get all the users (excluding the technical ones) from the specified DB
# and call a GSRS endpoint to trigger their automatic registration.
#
# Made to be used as a part of GSRS DB update.
# OLD_DB params should point to the previously used DB
# GSRS app, which is called using curl needs to be connected to the new DB

# OLD_DB_HOST="gsrs-dev-db.cyy6pahwar0b.us-west-2.rds.amazonaws.com"
# OLD_DB_PORT=3306
# OLD_DB_NAME="ixginasDATE"
# OLD_DB_USER="admin"
# OLD_DB_PASS="INSERT_PASSWORD"
OLD_DB_HOST="${GSRS_DATABASE_HOST:-127.0.0.1}"
OLD_DB_PORT="${GSRS_DATABASE_PORT:-3306}"
OLD_DB_NAME="${OLD_DB_NAME:-ixginasDATE}"
OLD_DB_USER="${GSRS_DATABASE_USERNAME:-root}"
OLD_DB_PASS="${GSRS_DATABASE_PASSWORD:-password}"

# Allow OLD_DB_HOST in host:port format, e.g. mydb.example.com:3306
if [[ "$OLD_DB_HOST" == *:* ]]; then
  host_part="${OLD_DB_HOST%%:*}"
  port_part="${OLD_DB_HOST##*:}"

  # Only override port if port_part is non\-empty
  if [[ -n "$port_part" ]]; then
    OLD_DB_PORT="$port_part"
  fi
  OLD_DB_HOST="$host_part"
fi

# Technical users do not have an email set and we don't want to re-import these
users=$(mysql -h $OLD_DB_HOST -P $OLD_DB_PORT -u $OLD_DB_USER \
    -p$OLD_DB_PASS --ssl-mode=DISABLED $OLD_DB_NAME --batch --silent -e \
    "SELECT username, email FROM ix_core_principal WHERE email IS NOT NULL AND email != '';" | sed 's/\t/,/g')

IFS=$'\n'
for row in $users; do
    IFS=',' read -r username email <<< "$row"

    echo "Import user: $username ; $email"
    curl -H "AUTHENTICATION_USERNAME: $username" -H "AUTHENTICATION_EMAIL: $email" \
        'http://localhost:8080/substances/api/v1/buildInfo' -o /dev/null -s -w "%{http_code}\n"

    sleep 0.2
done
