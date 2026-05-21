ARG NODEJS_IMAGE_TAG=24.15.0-slim

FROM node:${NODEJS_IMAGE_TAG}

RUN apt-get update && \
    apt-get install -y --no-install-recommends build-essential libtool autoconf default-mysql-client procps curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN npm i -g pnpm@11.1.1

# The whole /app is bind-mounted from packages/server at runtime, so any COPY
# of source/config files here would be shadowed. We keep only the entrypoint,
# which lives outside /app and survives the mount.
COPY ./docker/entrypoint/dev.entrypoint.sh /usr/local/bin

ENTRYPOINT ["/usr/local/bin/dev.entrypoint.sh"]
