FROM ruby:2.7.5

RUN apt-get update && apt-get install -y cmake libssl-dev && gem install bundler -v 2.2.33

WORKDIR /precision-fda

COPY Gemfile Gemfile.lock ./
