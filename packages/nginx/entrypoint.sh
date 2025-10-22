#!/bin/sh
set -e

# Write SSM secrets to files (passed via ECS secrets)
echo "$SSL_CERT" > /etc/nginx/ssl/pfda.crt
echo "$SSL_KEY" > /etc/nginx/ssl/pfda.key

# Execute CMD arguments (nginx -g 'daemon off;')
exec "$@"
