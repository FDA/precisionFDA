ARG FRONTEND_IMAGE_TAG

# Note(samuel) - non-emulated image doesn't build because of node-sass error
FROM node:${FRONTEND_IMAGE_TAG}

WORKDIR /precision-fda
RUN npm i -g pnpm@10.10.0
COPY package.json \
    pnpm-lock.yaml \
    /precision-fda/
RUN pnpm i --frozen-lockfile
COPY vite.config.ts \
    index.html \
    tsconfig.json \
    .env* \
    /precision-fda/
COPY public/ /precision-fda/public/

COPY docker/entrypoint/dev.entrypoint.sh /usr/local/bin
RUN chmod +x /usr/local/bin/dev.entrypoint.sh

ENTRYPOINT ["/usr/local/bin/dev.entrypoint.sh"]
CMD ["pnpm","run","build"]
