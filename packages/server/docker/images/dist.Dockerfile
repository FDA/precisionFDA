ARG NODEJS_IMAGE_TAG=24.15.0-slim

FROM node:${NODEJS_IMAGE_TAG}

RUN apt-get update && \
    apt-get install -y --no-install-recommends build-essential libtool autoconf default-mysql-client curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN npm i -g pnpm@11.1.1

COPY package.json pnpm-lock.yaml ./
RUN pnpm i --frozen-lockfile

COPY . ./
RUN make build

ENTRYPOINT [ "/app/docker/entrypoint/dist.entrypoint.sh" ]
