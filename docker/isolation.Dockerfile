FROM ruby:2.2.3
RUN apt-get update
RUN apt-get install cmake -y
ENV APP_DIR=/precision-fda
WORKDIR $APP_DIR
RUN mkdir -p $APP_DIR
COPY Gemfile Gemfile.lock $APP_DIR/
RUN bundle install
COPY . $APP_DIR
CMD $APP_DIR/docker/isolation.docker-entrypoint.sh
