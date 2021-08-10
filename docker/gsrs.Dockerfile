# change it to another image (ubuntu 18)?
FROM ubuntu:16.04 AS base

# # install software
RUN apt-get update && \
    apt-get install -y curl nano wget git mysql-client openjdk-8-jdk

# instal nodejs v12 and deps
RUN curl -fsSL https://deb.nodesource.com/setup_12.x | bash - && \
    apt install -y nodejs && \
    NG_CLI_ANALYTICS=off npm install -g @angular/cli@latest

FROM base as frontend

COPY ./GSRSFrontend /srv/GSRSFrontend

WORKDIR /srv/GSRSFrontend
# setup frontend
RUN export NG_CLI_ANALYTICS=off && \
    cp package.dev.json package.json && \
    npm install && \
    npm run build-file-select && \
    npm run build-jsdraw-wrapper && \
    npm run build-ketcher-wrapper && \
    cp package.real.json package.json && \
    npm install && \
    npm audit fix && \
    npm i @angular-devkit/build-angular@0.803.25

FROM base as build

COPY --from=frontend /srv/GSRSFrontend /srv/GSRSFrontend
COPY ./GSRSBackend /srv/GSRSBackend

WORKDIR /srv/GSRSBackend
# build backend
RUN ./setup.sh

COPY ./docker/gsrs.entrypoint.sh /gsrs.entrypoint.sh

EXPOSE 9000
EXPOSE 4200

ENTRYPOINT ["/gsrs.entrypoint.sh"]
