ARG FRONTEND_IMAGE_TAG

# Note(samuel) - non-emulated image doesn't build because of node-sass error
FROM amd64/node:${FRONTEND_IMAGE_TAG}

WORKDIR /precision-fda
COPY package.json \
    yarn.lock \
    webpack.fragment.base.js \
    webpack.fragment.swc.js \
    webpack.docker.development.config.js \
    .swcrc \
    tsconfig.json \
    /precision-fda/

COPY docker/entrypoint/dev.entrypoint.sh /usr/local/bin

ENTRYPOINT ["/usr/local/bin/dev.entrypoint.sh"]
# Note(samuel) - /src folder is expected to be mounted as volume for watch mode
CMD [ "yarn watch:docker" ]
