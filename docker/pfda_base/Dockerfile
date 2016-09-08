# base package
FROM ubuntu:14.04
MAINTAINER Alan Zhu <azhu@dnanexus.com>

# install apt-packages
# don't use ENV to set DEBIAN_FRONTEND
RUN DEBIAN_FRONTEND=noninteractive apt-get update && apt-get install -y \
  aria2 \
  byobu \
  cmake \
  cpanminus \
  curl \
  dstat \
  g++ \
  git \
  htop \
  libboost-all-dev \
  libcurl4-openssl-dev \
  libncurses5-dev \
  make \
  perl \
  pypy \
  python-dev \
  python-pip \
  r-base \
  ruby1.9.3 \
  wget \
  xz-utils

# install python packages
RUN pip install \
  requests==2.5.0 \
  futures==2.2.0 \
  setuptools==10.2

# create directory /work
RUN mkdir /work
# set it to $HOME
ENV HOME="/work"
# set it to CWD
WORKDIR /work

# copy 'emit' script
COPY emit "/usr/bin/emit"
# need to source emit for setting environmental variables
RUN echo "alias \"emit=. emit\"" > ~/.bashrc

# startup
ENTRYPOINT ["/bin/bash"]
