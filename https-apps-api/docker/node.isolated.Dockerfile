FROM node:12 AS base
WORKDIR /app

FROM base AS deps
WORKDIR /app
COPY https-apps-api/package.json ./
COPY https-apps-api/yarn.lock ./
# enumerate the packages for now
COPY https-apps-api/packages/api/package.json ./packages/api/package.json
COPY https-apps-api/packages/shared/package.json ./packages/shared/package.json
COPY https-apps-api/packages/worker/package.json ./packages/worker/package.json
# full install with devDependencies
RUN yarn install --frozen-lockfile

FROM deps AS build
WORKDIR /app
# copy root-level shared stuff
COPY .env ./
COPY key.pem ./
COPY cert.pem ./
# copy the code (leveraging .dockerignore)
COPY https-apps-api/ ./
# build /dist
RUN make build
