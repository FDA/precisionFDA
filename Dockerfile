FROM ruby:2.6.5

RUN apt-get update && apt-get install -y cmake libssl-dev

WORKDIR /precision-fda

COPY Gemfile Gemfile.lock ./
