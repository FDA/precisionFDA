ARG NODEJS_IMAGE_TAG

FROM node:${NODEJS_IMAGE_TAG}

RUN apt-get update && \
    apt-get install -y build-essential libtool autoconf default-mysql-client procps

WORKDIR /app

RUN npm i -g pnpm@9.0.6

COPY package.json \
    pnpm-lock.yaml \
    Makefile \
    tsconfig.build.json \
    tsconfig.json \
    .env \
    /app/

COPY ./docker/entrypoint/dev.entrypoint.sh /usr/local/bin

ENTRYPOINT ["/usr/local/bin/dev.entrypoint.sh"]

# Note(samuel) - /src folder is expected to be mounted as volume for watch mode
