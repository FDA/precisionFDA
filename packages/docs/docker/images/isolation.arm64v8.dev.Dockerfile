ARG FRONTEND_IMAGE_TAG

FROM node:${FRONTEND_IMAGE_TAG}

WORKDIR /app
RUN npm i -g pnpm@10.29.3
COPY package.json \
    pnpm-lock.yaml \
    source.config.ts \
    /app/

COPY docker/entrypoint/dev.entrypoint.sh /usr/local/bin

ENTRYPOINT ["/usr/local/bin/dev.entrypoint.sh"]

EXPOSE 4040

CMD [ "pnpm", "dev" ]
