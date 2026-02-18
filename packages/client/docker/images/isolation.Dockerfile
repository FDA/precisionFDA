ARG FRONTEND_IMAGE_TAG

FROM node:${FRONTEND_IMAGE_TAG}

WORKDIR /precision-fda
RUN npm i -g pnpm@10.29.3
COPY package.json \
    pnpm-lock.yaml \
    /precision-fda/
RUN pnpm i --frozen-lockfile

COPY vite.config.ts \
    index.html \
    tsconfig.json \
    .env* \
    /precision-fda/
COPY src/ /precision-fda/src/
COPY public/ /precision-fda/public/

CMD ["pnpm","run","build"]
