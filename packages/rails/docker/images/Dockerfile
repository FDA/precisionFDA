# =========================
# Stage 1: Builder (Ruby + Node)
# =========================
ARG RUBY_IMAGE_TAG=3.2.2
ARG NODE_VERSION=22
ARG BUNDLER_VERSION=2.4.10

FROM ruby:${RUBY_IMAGE_TAG}-alpine AS builder

ENV RAILS_ENV=production
ENV DOCKER_BUILD=true

ARG NODE_VERSION
ENV APP_DIR=/precision-fda
WORKDIR $APP_DIR

# Install system dependencies and Node.js
RUN set -eux && \
    apk update && apk upgrade --no-cache && \
    apk add --no-cache \
      build-base \
      gcc \
      g++ \
      make \
      cmake \
      musl-dev \
      zlib-dev \
      libxml2-dev \
      libxslt-dev \
      curl \
      git \
      bash \
      openssl-dev \
      libffi-dev \
      mariadb-connector-c-dev \
      nodejs \
      npm \
      tzdata \
      shared-mime-info


RUN npm i -g pnpm@10.10.0 bower

# Copy Rails app
COPY packages/rails/ $APP_DIR

RUN chmod +x ./docker/entrypoint/prod.entrypoint.sh
RUN chmod +x ./docker/entrypoint/sidekiq.entrypoint.sh

ENV NOKOGIRI_USE_SYSTEM_LIBRARIES=true

# Install Ruby gems
RUN gem install bundler -v "$BUNDLER_VERSION" --no-document && \
    bundle config set --local without 'development test' && \
    bundle config set force_ruby_platform true && \
    bundle install --jobs=4 --retry=3

# =========================
# Build frontend assets
# =========================

COPY packages/client/ $APP_DIR/frontend
WORKDIR $APP_DIR/frontend
RUN pnpm install --frozen-lockfile && pnpm run build

WORKDIR $APP_DIR
RUN mv .env.do_not_delete .env
RUN mv config/database.do_not_delete.yml config/database.yml

RUN rm -rf public/packs app/assets/packs && \
    mkdir -p public/assets && \
    cp -r rails/app/assets/packs/* public/assets/ && \
    bower install --allow-root --force && \
    bundle exec rake assets:precompile


# =========================
# Stage 2: Final (Runtime)
# =========================
FROM ruby:${RUBY_IMAGE_TAG}-alpine

ENV APP_DIR=/precision-fda
ENV DOCKER_BUILD=true
WORKDIR $APP_DIR

# Install runtime dependencies only
RUN set -eux && \
    apk update && apk upgrade --no-cache && \
    apk add --no-cache \
      bash \
      curl \
      wait4ports \
      shared-mime-info \
      mariadb-connector-c \
      libxml2 \
      libxslt \
      zlib \
      nodejs \
      npm \
      tzdata

COPY --from=builder $APP_DIR $APP_DIR
COPY --from=builder /usr/local/bundle /usr/local/bundle

# Set entrypoint
ENTRYPOINT ["./docker/entrypoint/prod.entrypoint.sh"]
CMD []
