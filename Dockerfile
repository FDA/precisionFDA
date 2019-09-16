FROM ruby:2.3.8
RUN apt-get update
RUN apt-get install -y cmake libssl-dev

WORKDIR /precision-fda

COPY Gemfile Gemfile.lock ./

RUN bundle check || bundle install
