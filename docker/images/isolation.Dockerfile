ARG RUBY_IMAGE_TAG

FROM ruby:${RUBY_IMAGE_TAG}

ENV APP_DIR /precision-fda

WORKDIR $APP_DIR
RUN apt-get update && \
    apt-get install -y cmake wget libssl-dev nodejs wait-for-it
COPY ./docker/entrypoint/isolation.docker-entrypoint.sh $APP_DIR/docker/entrypoint/isolation.docker-entrypoint.sh

CMD $APP_DIR/docker/entrypoint/isolation.docker-entrypoint.sh
