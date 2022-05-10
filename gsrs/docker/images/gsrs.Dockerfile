FROM ubuntu:18.04 AS base

ARG gsrs_branch=precisionFDA_STAGE
ENV GSRS_BRANCH=$gsrs_branch

ARG mysql_user=root
ENV GSRS_CONFIG=conf/ginas-dev.conf

ENV MYSQL_HOST=gsrsdb
ENV MYSQL_DATABASE=ixginas
ENV MYSQL_ROOT_PASSWORD=password

RUN apt-get -qqy update && \
    apt-get -qqy --no-install-recommends install mysql-client openjdk-8-jdk git

RUN cd /srv && \
    git clone --depth 1 -b $GSRS_BRANCH https://github.com/dnanexus/gsrs-play-dist.git && \
    cd gsrs-play-dist && \
    chmod +x bin/ginas

WORKDIR /srv/gsrs-play-dist

COPY gsrs/ginas-dev.conf /srv/gsrs-play-dist/conf/ginas-dev.conf
COPY gsrs/docker/entrypoint/gsrs.entrypoint.sh /tmp/entrypoint.sh

# prepare a config file
RUN sed -i "s/<db_host>/${MYSQL_HOST}/g" $GSRS_CONFIG && \
    sed -i "s/<db_name>/${MYSQL_DATABASE}/g" $GSRS_CONFIG && \
    sed -i "s/<db_user>/${mysql_user}/g" $GSRS_CONFIG && \
    sed -i "s/<db_user_password>/${MYSQL_ROOT_PASSWORD}/g" $GSRS_CONFIG

ENTRYPOINT ["/tmp/entrypoint.sh"]
