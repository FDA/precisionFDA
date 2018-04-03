FROM ruby:2.2.3
RUN apt-get update
RUN apt-get install cmake -y
RUN apt-get install -y wget
ENV DOCKERIZE_VERSION v0.6.0
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && rm dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz

ENV APP_DIR=/precision-fda
WORKDIR $APP_DIR
RUN mkdir -p $APP_DIR
COPY Gemfile Gemfile.lock $APP_DIR/
RUN bundle install
COPY . $APP_DIR
CMD $APP_DIR/docker/isolation.docker-entrypoint.sh
