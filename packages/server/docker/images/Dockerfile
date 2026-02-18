ARG NODEJS_IMAGE_TAG=24.13.1-alpine
FROM node:${NODEJS_IMAGE_TAG} AS builder

WORKDIR /app

# Install OS dependencies
RUN apk update && apk upgrade --no-cache && \
    apk add --no-cache \
      build-base \
      libtool \
      autoconf \
      mysql-client \
      procps


# Install pnpm globally
RUN npm install -g pnpm@10.29.3

# Copy package files and install all dependencies
COPY packages/server/ ./
RUN pnpm install --frozen-lockfile

# Build all projects
RUN pnpm run build

FROM node:${NODEJS_IMAGE_TAG} AS runtime

WORKDIR /app

RUN npm install -g pnpm@10.29.3

# Upgrade packages and install runtime dependencies
RUN set -eux && \
    apk update && apk upgrade --no-cache && \
    apk add --no-cache curl

# Copy only build artifacts and certificates
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

COPY packages/server/ ./
RUN chmod +x ./docker/entrypoint/entrypoint.sh
# Expose port
EXPOSE 3001
ENV OTEL_LOG_LEVEL=none
# Set entrypoint
ENTRYPOINT ["./docker/entrypoint/entrypoint.sh"]
