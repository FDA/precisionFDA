FROM ruby:2.7.5

ENV BUNDLER_VERSION 2.3.7

RUN apt-get update && apt-get install -y cmake libssl-dev && gem install bundler -v ${BUNDLER_VERSION}

WORKDIR /precision-fda

COPY Gemfile Gemfile.lock ./
