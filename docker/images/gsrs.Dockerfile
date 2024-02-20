FROM tomcat:10.1.10-jdk11

ARG gsrs_branch=gsrs_240111
ENV GSRS_BRANCH=$gsrs_branch

ENV CATALINA_HOME /usr/local/tomcat
ENV PATH $CATALINA_HOME/bin:$PATH

# Install Node.js
RUN mkdir /nodeInstall
WORKDIR /nodeInstall
RUN curl -fsSL https://deb.nodesource.com/setup_lts.x > nodeInstall.sh
RUN chmod +x nodeInstall.sh
RUN ./nodeInstall.sh
RUN apt install nodejs -y

# ng-cli
RUN npm install -g @angular/cli

RUN mkdir -p "$CATALINA_HOME"

RUN apt-get -qqy update && \
    apt-get -qqy --no-install-recommends install git nano

RUN apt install build-essential -y && \
    apt install vim -y && \
    apt install less -y

# The backend won't start without this object; taken from here: https://github.com/dan2097/jna-inchi/
COPY ./docker/misc/gsrs/libjnainchi.so /lib/libjnainchi.so
# cacheMaxSize increased
COPY ./docker/misc/gsrs/context.xml /usr/local/tomcat/conf/context.xml
# Script to switch between frontend built from the users source code and prebuilt FE
COPY ./docker/misc/gsrs/switch-frontend.sh /switch-frontend.sh
RUN chmod +x /switch-frontend.sh

WORKDIR /usr/local/tomcat/webapps
RUN git clone -b $GSRS_BRANCH https://github.com/dnanexus/gsrs-play-dist.git .

WORKDIR $CATALINA_HOME

EXPOSE 8080
CMD ["catalina.sh", "run"]