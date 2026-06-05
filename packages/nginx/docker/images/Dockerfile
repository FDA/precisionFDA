FROM node:22.15.0-slim AS client-builder

WORKDIR /app

RUN apt-get update && \
	apt-get install -y --no-install-recommends build-essential python3 && \
	rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm@10.10.0

COPY packages/client/package.json ./package.json
COPY packages/client/pnpm-lock.yaml ./pnpm-lock.yaml
COPY packages/client/pnpm-workspace.yaml ./pnpm-workspace.yaml

RUN pnpm install --frozen-lockfile

COPY packages/client/ .

ENV VITE_OUT_DIR=/app/dist
RUN pnpm run build

FROM nginx:stable-alpine

# Create SSL directory
RUN mkdir -p /etc/nginx/ssl

# Update Alpine packages (fewer CVEs since Alpine ships less)
RUN apk update && apk upgrade
RUN adduser -S -G www-data www-data


# Copy configs
COPY packages/nginx/nginx.conf /etc/nginx/nginx.conf
COPY packages/nginx/json_analytics_log_format_for_prometheus.conf /etc/nginx/conf.d/


# Remove default nginx content
RUN rm -rf /usr/share/nginx/html/*

# Copy built client assets
COPY --from=client-builder /app/dist /usr/share/nginx/html

# Entrypoint
COPY packages/nginx/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80 443

ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
