# =========================
# Stage 1: Builder (Ruby + Node)
# =========================
ARG RUBY_IMAGE_TAG=3.2.2
ARG NODE_VERSION=22
ARG BUNDLER_VERSION=2.4.10

FROM ruby:${RUBY_IMAGE_TAG} AS builder

ENV RAILS_ENV=production
ENV DOCKER_BUILD=true

ARG NODE_VERSION
ENV APP_DIR=/precision-fda
WORKDIR $APP_DIR

# Install system dependencies + Node.js
RUN set -e && \
    apt-get update && \
    apt-get install -y --no-install-recommends \
        cmake wget libssl-dev curl git \
    && curl -fsSL "https://deb.nodesource.com/setup_${NODE_VERSION}.x" | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*


RUN npm i -g pnpm@10.10.0 bower

# Copy Rails app
COPY packages/rails/ $APP_DIR

RUN chmod +x ./docker/entrypoint/prod.entrypoint.sh
RUN chmod +x ./docker/entrypoint/sidekiq.entrypoint.sh

# Install bundler and gems
RUN gem install bundler -v "$BUNDLER_VERSION" && \
    bundle config set --local without 'development test' && \
    bundle install

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
FROM ruby:${RUBY_IMAGE_TAG}-slim
ARG NODE_VERSION
ENV APP_DIR=/precision-fda
ENV DOCKER_BUILD=true
WORKDIR $APP_DIR

# Install only runtime deps
# Ensure Debian security patches (glibc, libc-bin, etc.)
RUN apt-get update \
    && apt-get upgrade -y --no-install-recommends \
    && apt-get install -y --no-install-recommends \
         curl \
         wait-for-it shared-mime-info libmariadb3 \
    && curl -fsSL "https://deb.nodesource.com/setup_${NODE_VERSION}.x" | bash - \
    && apt-get install -y nodejs \
    && apt-get purge -y linux-libc-dev \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder $APP_DIR $APP_DIR
COPY --from=builder /usr/local/bundle /usr/local/bundle

# Set entrypoint
ENTRYPOINT ["./docker/entrypoint/prod.entrypoint.sh"]
CMD []
