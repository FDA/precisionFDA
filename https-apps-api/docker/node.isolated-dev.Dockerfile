FROM node:12.22.10

WORKDIR /app
COPY https-apps-api/package.json https-apps-api/yarn.lock ./
# enumerate the packages for now
COPY https-apps-api/packages/api/package.json ./packages/api/package.json
COPY https-apps-api/packages/shared/package.json ./packages/shared/package.json
COPY https-apps-api/packages/worker/package.json ./packages/worker/package.json
# full install with devDependencies
RUN yarn install --frozen-lockfile

# copy root-level shared stuff
COPY key.pem cert.pem /keys/
# Note(samuel) - /src folder is expected to be mounted as volume for watch mode
CMD ["make", "watch"]
