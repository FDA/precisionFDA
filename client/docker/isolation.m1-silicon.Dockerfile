# Note(samuel)4 - non-emulated image doesn't build because of node-sass error
FROM amd64/node:12
WORKDIR /precision-fda
COPY package.json \
    yarn.lock \
    /precision-fda/
RUN yarn --frozen-lockfile
COPY webpack.fragment.base.js \
    webpack.fragment.swc.js \
    webpack.docker.development.config.js \
    .swcrc \
    tsconfig.json \
    /precision-fda/
# Note(samuel) - /src folder is expected to be mounted as volume for watch mode
CMD [ "yarn watch:docker" ]
