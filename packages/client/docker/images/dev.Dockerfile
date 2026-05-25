# Image for the Vite dev server (React client in local development).
ARG FRONTEND_IMAGE_TAG=24.15.0-slim

FROM node:${FRONTEND_IMAGE_TAG}

WORKDIR /precision-fda
RUN npm i -g pnpm@11.1.1

COPY package.json \
    pnpm-lock.yaml \
    pnpm-workspace.yaml \
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
