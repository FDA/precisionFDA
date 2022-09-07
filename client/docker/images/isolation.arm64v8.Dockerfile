ARG FRONTEND_IMAGE_TAG

# Note(samuel) - non-emulated image doesn't build because of node-sass error
FROM amd64/node:${FRONTEND_IMAGE_TAG}

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
COPY src/ /precision-fda/src/
CMD [ "yarn watch:docker" ]
