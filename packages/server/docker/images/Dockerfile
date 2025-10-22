ARG NODEJS_IMAGE_TAG=22-slim
FROM node:${NODEJS_IMAGE_TAG} AS builder

WORKDIR /app

# Install OS dependencies
RUN apt-get update && \
    apt-get install -y build-essential libtool autoconf default-mysql-client procps && \
    apt-get upgrade -y && \
    rm -rf /var/lib/apt/lists/*

# Install pnpm globally
RUN npm install -g pnpm@10.10.0

# Copy package files and install all dependencies
COPY packages/server/ ./
RUN pnpm install --frozen-lockfile

# Build all projects
RUN pnpm run build

FROM node:${NODEJS_IMAGE_TAG} AS runtime

WORKDIR /app

RUN npm install -g pnpm@10.10.0

RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    apt-get upgrade -y && \
    rm -rf /var/lib/apt/lists/*

# Copy only build artifacts and certificates
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
# COPY cert.pem /keys/cert.pem
# COPY key.pem /keys/key.pem

COPY packages/server/ ./
RUN chmod +x ./docker/entrypoint/entrypoint.sh
# Expose port
EXPOSE 3001

# Set entrypoint
ENTRYPOINT ["./docker/entrypoint/entrypoint.sh"]
