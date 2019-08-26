FROM ruby:2.2.3
RUN apt-get update
RUN apt-get install -y cmake

WORKDIR /precision-fda

COPY Gemfile Gemfile.lock ./

RUN bundle check || bundle install
