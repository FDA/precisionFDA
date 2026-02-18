# =========================
# Stage 1: Builder (Ruby + Node)
# =========================
ARG RUBY_IMAGE_TAG=3.2.2
ARG NODE_VERSION=22
ARG BUNDLER_VERSION=2.4.10
ARG GIT_BRANCH
ARG GIT_REVISION

FROM ruby:${RUBY_IMAGE_TAG}-alpine AS builder

ENV RAILS_ENV=production
ENV DOCKER_BUILD=true
ENV NODE_ENV=production

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

RUN npm i -g pnpm@10.29.3 bower

# Copy only dependency files for caching Ruby gems
COPY packages/rails/Gemfile $APP_DIR/Gemfile
COPY packages/rails/Gemfile.lock $APP_DIR/Gemfile.lock

ENV NOKOGIRI_USE_SYSTEM_LIBRARIES=true

# Install Ruby gems (Cache Optimization Point 1)
RUN gem install bundler -v "$BUNDLER_VERSION" --no-document && \
    bundle config set --local without 'development test' && \
    bundle config set force_ruby_platform true && \
    bundle install --jobs=4 --retry=3

# Copy the rest of the Rails app
COPY packages/rails/ $APP_DIR

RUN chmod +x ./docker/entrypoint/prod.entrypoint.sh
RUN chmod +x ./docker/entrypoint/runtime-env.sh

# =========================
# Build frontend assets
# =========================

# Copy only dependency files for caching Node modules
WORKDIR $APP_DIR/frontend
COPY packages/client/package.json $APP_DIR/frontend/package.json
COPY packages/client/pnpm-lock.yaml $APP_DIR/frontend/pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

# Copy the rest of the frontend code and build
COPY packages/client/ $APP_DIR/frontend
# Override VITE_OUT_DIR since the default '../rails/public/packs' is relative to packages/client
# but in Docker, frontend is at /precision-fda/frontend and Rails is at /precision-fda
ENV VITE_OUT_DIR=$APP_DIR/public/packs
RUN pnpm run build

WORKDIR $APP_DIR
RUN mv .env.do_not_delete .env
RUN mv config/database.do_not_delete.yml config/database.yml

RUN bower install --allow-root --force && \
    bundle exec rake assets:precompile


# =========================
# Stage 2: Final (Runtime)
# =========================
FROM ruby:${RUBY_IMAGE_TAG}-alpine
ARG GIT_BRANCH
ARG GIT_REVISION

ENV GIT_BRANCH=${GIT_BRANCH}
ENV GIT_REVISION=${GIT_REVISION}
ENV APP_DIR=/precision-fda
ENV DOCKER_BUILD=true
ENV OTEL_LOG_LEVEL=unknown
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
