FROM ruby:2.2.8
RUN apt-get update
ENV APP_DIR=/precision-fda
WORKDIR $APP_DIR
RUN mkdir -p $APP_DIR
COPY Gemfile Gemfile.lock $APP_DIR/
RUN bundle install
COPY . $APP_DIR
CMD $APP_DIR/docker/isolation.docker-entrypoint.sh
