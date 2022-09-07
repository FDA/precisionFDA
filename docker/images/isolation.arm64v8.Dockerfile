ARG RUBY_IMAGE_TAG

FROM amd64/ruby:${RUBY_IMAGE_TAG}
# This dockerfile is required for Apple Silicon M1, otherwise gem installation during build of "web" and "sidekiq" services fails

ENV DOCKERIZE_VERSION v0.6.0
ENV APP_DIR /precision-fda
ENV BUNDLER_VERSION 2.3.7

WORKDIR $APP_DIR
RUN apt-get update && \
    apt-get install -y cmake wget libssl-dev nodejs && \
    wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz && \
    tar -C /usr/local/bin -xzvf dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz && \
    rm dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz && \
    gem install bundler -v ${BUNDLER_VERSION}
COPY ./docker/entrypoint/isolation.docker-entrypoint.sh $APP_DIR/docker/entrypoint/isolation.docker-entrypoint.sh

CMD $APP_DIR/docker/entrypoint/isolation.docker-entrypoint.sh
