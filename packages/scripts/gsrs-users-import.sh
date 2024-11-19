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
OLD_DB_HOST="127.0.0.1"
OLD_DB_PORT=32900
OLD_DB_NAME="ixginasDATE"
OLD_DB_USER="root"
OLD_DB_PASS="password"

# Technical users do not have an email set and we don't want to re-import these
users=$(mysql -h $OLD_DB_HOST -P $OLD_DB_PORT -u $OLD_DB_USER \
    -p$OLD_DB_PASS --ssl-mode=DISABLED $OLD_DB_NAME --batch --silent -e \
    "SELECT username, email FROM ix_core_principal WHERE email IS NOT NULL AND email != '';" | sed 's/\t/,/g')

IFS=$'\n'
for row in $users; do
    IFS=',' read -r username email <<< "$row"

    echo "Import user: $username ; $email"
    curl -H "AUTHENTICATION_HEADER_NAME: $username" -H "AUTHENTICATION_HEADER_NAME_EMAIL: $email" \
        'http://localhost:8080/ginas/app/api/v1/buildInfo' -o /dev/null -s -w "%{http_code}\n"

    sleep 0.2
done
