FROM ruby:2.7.1

RUN apt-get update && apt-get install -y cmake libssl-dev && gem install bundler -v 2.1.4

WORKDIR /precision-fda

COPY Gemfile Gemfile.lock ./
