ARG NODEJS_IMAGE_TAG

FROM node:${NODEJS_IMAGE_TAG}

RUN apt-get update && \
    apt-get install -y default-mysql-client

WORKDIR /app

RUN npm i -g pnpm

COPY server/package.json \
    server/pnpm-lock.yaml \
    server/Makefile \
    server/tsconfig.build.json \
    server/tsconfig.json \
    server/.env \
    ./

# copy root-level shared stuff
COPY key.pem cert.pem /keys/
COPY server/docker/entrypoint/dev.entrypoint.sh /usr/local/bin

ENTRYPOINT ["/usr/local/bin/dev.entrypoint.sh"]

# Note(samuel) - /src folder is expected to be mounted as volume for watch mode
