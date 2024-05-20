ARG FRONTEND_IMAGE_TAG

# Note(samuel) - non-emulated image doesn't build because of node-sass error
FROM amd64/node:${FRONTEND_IMAGE_TAG}

WORKDIR /precision-fda
RUN npm i -g pnpm@9.0.6
COPY package.json \
    pnpm-lock.yaml \
    webpack.fragment.base.js \
    webpack.fragment.swc.js \
    webpack.docker.development.config.js \
    .swcrc \
    tsconfig.json \
    /precision-fda/

COPY docker/entrypoint/dev.entrypoint.sh /usr/local/bin

ENTRYPOINT ["/usr/local/bin/dev.entrypoint.sh"]
# Note(samuel) - /src folder is expected to be mounted as volume for watch mode
CMD [ "pnpm run watch:docker" ]
