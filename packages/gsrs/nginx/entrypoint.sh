#!/bin/sh
# Generate frontend location config based on GSRS_FRONTEND_DEV env var
mkdir -p /etc/nginx/conf.d

if [ "$GSRS_FRONTEND_DEV" = "true" ]; then
  echo 'GSRS nginx: Frontend dev mode ENABLED (routing /ginas/app/ui → gsrs-frontend-dev:4200)'
  cat > /etc/nginx/conf.d/frontend-location.conf <<'EOF'
location /ginas/app/ui {
  resolver 127.0.0.11 valid=10s;
  set $frontend http://gsrs-frontend-dev:4200;
  proxy_pass $frontend;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
  proxy_read_timeout 300s;
}
EOF
else
  echo 'GSRS nginx: Frontend dev mode DISABLED (routing /ginas/app/ui → gsrs-web WAR)'
  cat > /etc/nginx/conf.d/frontend-location.conf <<'EOF'
location /ginas/app/ui {
  proxy_pass http://gsrs-web:8080/frontend/ginas/app/ui;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
EOF
fi
