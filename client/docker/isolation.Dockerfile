FROM node:12
WORKDIR /precision-fda
COPY package.json \
    yarn.lock \
    webpack.common.config.js \
    webpack.docker.development.config.js \
    .babelrc.js \
    tsconfig.json \
    /precision-fda/
RUN yarn --frozen-lockfile
# Note(samuel) - /src folder is expected to be mounted as volume for watch mode
CMD [ "yarn watch" ]
