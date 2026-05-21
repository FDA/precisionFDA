# Image for producing the production frontend bundle (one-shot build).
ARG FRONTEND_IMAGE_TAG=24.15.0-slim

FROM node:${FRONTEND_IMAGE_TAG}

WORKDIR /precision-fda
RUN npm i -g pnpm@11.1.1
COPY package.json \
    pnpm-lock.yaml \
    /precision-fda/

# pnpm 11 requires explicit build approval via pnpm-workspace.yaml when running
# --frozen-lockfile outside a workspace (Docker build context has no root workspace file).
RUN printf 'allowBuilds:\n  esbuild: true\n  msw: true\n' \
    > /precision-fda/pnpm-workspace.yaml

# Auto-purge stale node_modules in non-TTY environments (e.g. Docker volumes from prior pnpm version).
RUN echo 'confirm-modules-purge=false' > /precision-fda/.npmrc

RUN pnpm i --frozen-lockfile

COPY vite.config.ts \
    index.html \
    tsconfig.json \
    .env* \
    /precision-fda/
COPY src/ /precision-fda/src/
COPY public/ /precision-fda/public/

CMD ["pnpm","run","build"]
