ARG RUBY_IMAGE_TAG

FROM amd64/ruby:${RUBY_IMAGE_TAG}
# This dockerfile is required for Apple Silicon M1, otherwise gem installation during build of "web" and "sidekiq" services fails

# NOTE: arg needs to be defined on this line, otherwise build fails
ARG COFFEE_MAJOR_NODE_VERSION

ENV APP_DIR /precision-fda

WORKDIR $APP_DIR
RUN curl -fsSL https://deb.nodesource.com/setup_${COFFEE_MAJOR_NODE_VERSION}.x | bash - && \
    apt-get update && \
    apt-get install -y cmake wget libssl-dev nodejs wait-for-it && \
    npm install -g bower
COPY ./docker/entrypoint/isolation.docker-entrypoint.sh $APP_DIR/docker/entrypoint/isolation.docker-entrypoint.sh

CMD $APP_DIR/docker/entrypoint/isolation.docker-entrypoint.sh
