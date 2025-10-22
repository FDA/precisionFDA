FROM nginx:stable-alpine

# Create SSL directory
RUN mkdir -p /etc/nginx/ssl

# Update Alpine packages (fewer CVEs since Alpine ships less)
RUN apk update && apk upgrade
RUN adduser -S -G www-data www-data


# Copy configs
COPY packages/nginx/nginx.conf /etc/nginx/nginx.conf
COPY packages/nginx/json_analytics_log_format_for_prometheus.conf /etc/nginx/conf.d/

# Entrypoint
COPY packages/nginx/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80 443

ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
