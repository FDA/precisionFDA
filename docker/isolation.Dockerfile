FROM ruby:2.7.2

ENV DOCKERIZE_VERSION v0.6.0
ENV APP_DIR /precision-fda

WORKDIR $APP_DIR
RUN mkdir -p $APP_DIR
COPY . $APP_DIR

RUN apt-get update && \
    apt-get install -y cmake wget libssl-dev nodejs && \
    wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz && \
    tar -C /usr/local/bin -xzvf dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz && \
    rm dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz && \
    gem install bundler -v 2.2.10

CMD $APP_DIR/docker/isolation.docker-entrypoint.sh
