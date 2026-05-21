ARG FRONTEND_IMAGE_TAG=24.15.0-slim

FROM node:${FRONTEND_IMAGE_TAG}

# curl is used by the compose healthcheck; node:slim doesn't ship it.
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
RUN npm i -g pnpm@11.1.1

COPY package.json \
    pnpm-lock.yaml \
    source.config.ts \
    /app/

COPY docker/entrypoint/dev.entrypoint.sh /usr/local/bin
RUN chmod +x /usr/local/bin/dev.entrypoint.sh

ENTRYPOINT ["/usr/local/bin/dev.entrypoint.sh"]

EXPOSE 4040

CMD [ "pnpm", "dev" ]
