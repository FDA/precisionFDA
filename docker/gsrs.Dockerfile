FROM ubuntu:18.04 AS base

RUN apt-get -qqy update && \
    apt-get -qqy --no-install-recommends install mysql-client openjdk-8-jdk git

RUN cd /srv && \
    git clone -b precisionFDA_PROD https://github.com/dnanexus/gsrs-play-dist.git && \
    cd gsrs-play-dist && \
    chmod +x bin/ginas

WORKDIR /srv/gsrs-play-dist

COPY docker/ginas-dev.conf /srv/gsrs-play-dist/conf/ginas-dev.conf
COPY docker/gsrs.entrypoint.sh /tmp/entrypoint.sh

EXPOSE 9000

ENTRYPOINT ["/tmp/entrypoint.sh"]
