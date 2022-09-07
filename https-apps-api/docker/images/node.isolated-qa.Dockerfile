ARG NODEJS_IMAGE_TAG

FROM node:${NODEJS_IMAGE_TAG}

WORKDIR /app
COPY https-apps-api/package.json https-apps-api/yarn.lock ./
# enumerate the packages for now
COPY https-apps-api/packages/api/package.json ./packages/api/package.json
COPY https-apps-api/packages/shared/package.json ./packages/shared/package.json
COPY https-apps-api/packages/worker/package.json ./packages/worker/package.json
# full install with devDependencies
RUN yarn install --frozen-lockfile

# copy root-level shared stuff
COPY key.pem cert.pem ./
# copy the code (leveraging .dockerignore)
COPY https-apps-api/ ./
# build /dist
RUN make build
