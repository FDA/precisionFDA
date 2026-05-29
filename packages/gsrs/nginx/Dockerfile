FROM nginx:alpine

RUN apk update && apk upgrade --no-cache

COPY nginx.conf /etc/nginx/nginx.conf
COPY entrypoint.sh /docker-entrypoint.d/99-frontend-dev.sh
RUN chmod +x /docker-entrypoint.d/99-frontend-dev.sh

EXPOSE 80