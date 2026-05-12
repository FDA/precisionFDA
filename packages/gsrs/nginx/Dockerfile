FROM nginx:alpine

RUN apk update && apk upgrade --no-cache

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80