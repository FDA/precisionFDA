ARG FRONTEND_IMAGE_TAG

# Note(samuel) - non-emulated image doesn't build because of node-sass error
FROM amd64/node:${FRONTEND_IMAGE_TAG}

WORKDIR /precision-fda
RUN npm i -g pnpm@9.0.6
COPY package.json \
    pnpm-lock.yaml \
    /precision-fda/

RUN pnpm i --frozen-lockfile

COPY webpack.fragment.base.js \
    webpack.fragment.swc.js \
    webpack.docker.development.config.js \
    .swcrc \
    tsconfig.json \
    /precision-fda/
COPY src/ /precision-fda/src/
CMD [ "pnpm run watch:docker" ]
