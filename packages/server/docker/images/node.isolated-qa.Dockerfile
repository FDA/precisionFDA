ARG NODEJS_IMAGE_TAG

FROM node:${NODEJS_IMAGE_TAG}

RUN apt-get update && \
    apt-get install -y build-essential libtool autoconf default-mysql-client

WORKDIR /app

RUN npm i -g pnpm@9.0.6

COPY server/package.json server/pnpm-lock.yaml ./
# full install with devDependencies
RUN pnpm i --frozen-lockfile

# copy the code (leveraging .dockerignore)
COPY server/ ./
# build /dist
RUN make build

ENTRYPOINT [ "/app/docker/entrypoint/qa.entrypoint.sh" ]
