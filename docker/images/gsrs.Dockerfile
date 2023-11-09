FROM tomcat:10.1.10-jdk11

ARG gsrs_branch=gsrs_LOCAL
ENV GSRS_BRANCH=$gsrs_branch

ENV CATALINA_HOME /usr/local/tomcat
ENV PATH $CATALINA_HOME/bin:$PATH

RUN mkdir -p "$CATALINA_HOME"

RUN apt-get -qqy update && \
    apt-get -qqy --no-install-recommends install git nano

# The backend won't start without this object; taken from here: https://github.com/dan2097/jna-inchi/
COPY ./docker/misc/gsrs/libjnainchi.so /lib/libjnainchi.so
# cacheMaxSize increased
COPY ./docker/misc/gsrs/context.xml /usr/local/tomcat/conf/context.xml

RUN cd /usr/local/tomcat/webapps && \
    git clone -b $GSRS_BRANCH https://github.com/dnanexus/gsrs-play-dist.git .

WORKDIR $CATALINA_HOME

EXPOSE 8080
CMD ["catalina.sh", "run"]