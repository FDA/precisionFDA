#!/bin/sh
set -e

# Ensure the SSL directory exists
mkdir -p /etc/nginx/ssl

# Write SSM secrets to files (passed via ECS secrets)
echo "$SSL_KEY" > /etc/nginx/ssl/https_server.key
echo "$SSL_CERT" > /etc/nginx/ssl/https_server.crt

# Execute whatever command is passed as arguments
exec "$@"