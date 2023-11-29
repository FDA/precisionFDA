ARG NODEJS_IMAGE_TAG

FROM node:${NODEJS_IMAGE_TAG}

RUN apt-get update && \
    apt-get install -y default-mysql-client

WORKDIR /app

RUN npm i -g pnpm

COPY server/package.json server/pnpm-lock.yaml ./
# full install with devDependencies
RUN pnpm i --frozen-lockfile

# copy root-level shared stuff
COPY key.pem cert.pem ./
# copy the code (leveraging .dockerignore)
COPY server/ ./
# build /dist
RUN make build

ENTRYPOINT [ "/app/docker/entrypoint/qa.entrypoint.sh" ]
