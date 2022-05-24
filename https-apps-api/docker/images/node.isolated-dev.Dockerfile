ARG NODEJS_IMAGE_TAG

FROM node:${NODEJS_IMAGE_TAG}

WORKDIR /app
COPY https-apps-api/package.json \
    https-apps-api/yarn.lock \
    https-apps-api/Makefile \
    https-apps-api/tsconfig.build.json \
    https-apps-api/tsconfig.json \
    https-apps-api/.env \
    ./
# enumerate the packages for now
COPY https-apps-api/packages/api/package.json ./packages/api/package.json
COPY https-apps-api/packages/shared/package.json ./packages/shared/package.json
COPY https-apps-api/packages/worker/package.json ./packages/worker/package.json

# copy root-level shared stuff
COPY key.pem cert.pem /keys/
COPY https-apps-api/docker/entrypoint/dev.entrypoint.sh /usr/local/bin

ENTRYPOINT ["/usr/local/bin/dev.entrypoint.sh"]

# Note(samuel) - /src folder is expected to be mounted as volume for watch mode
