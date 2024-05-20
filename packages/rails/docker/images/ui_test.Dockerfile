#docker build -f docker/images/ui_test.Dockerfile -t autoui .
#docker run \
#-e PFDA_AT_USER_1_PASSWORD_LOC \
#-e PFDA_AT_USER_2_PASSWORD_LOC \
#-e PFDA_AT_USER_ADMIN_PASSWORD_LOC \
#-e PFDA_BASIC_AUTH_DNX_PASSWORD_LOC \
#--mount type=bind,source="$(pwd)"/tmp/,target=/log_storage \
#autoui

ARG FIREFOX_VERSION=57.0
ARG RUBY_IMAGE_TAG
ARG MAVEN_VERSION=3.3.9
FROM ruby:${RUBY_IMAGE_TAG}

RUN echo deb http://http.debian.net/debian jessie-backports main >> /etc/apt/sources.list && \
    apt-get update && \
    apt-get -y -qq install libgtk-3-dev && \
    # Mysql
    echo 'mysql-server mysql-server/root_password password password' | debconf-set-selections && \
    echo 'mysql-server mysql-server/root_password_again password password' | debconf-set-selections && \
    apt-get -y -qq install mysql-server && \
    # Firefox
    wget -nv -O /tmp/firefox.tar.bz2 https://ftp.mozilla.org/pub/firefox/releases/${FIREFOX_VERSION}/linux-x86_64/en-US/firefox-${FIREFOX_VERSION}.tar.bz2 && \
    tar -C /opt -xjf /tmp/firefox.tar.bz2 && \
    rm /tmp/firefox.tar.bz2 && \
    mv /opt/firefox /opt/firefox-${FIREFOX_VERSION} && \
    ln -fs /opt/firefox-${FIREFOX_VERSION}/firefox /usr/bin/firefox && \
    # Geckodriver
    wget -nv https://github.com/mozilla/geckodriver/releases/download/v0.19.1/geckodriver-v0.19.1-linux64.tar.gz && \
    apt-get -y -qq install software-properties-common python-software-properties && \
    # JDK
    apt-get install -y -qq -t jessie-backports openjdk-8-jdk && \
    update-alternatives --config java && \
    # Maven
    mkdir /usr/share/maven && \
    wget -nv https://apache.osuosl.org/maven/maven-3/${MAVEN_VERSION}/binaries/apache-maven-${MAVEN_VERSION}-bin.tar.gz && \
    tar -xzf apache-maven-${MAVEN_VERSION}-bin.tar.gz -C /usr/share/maven --strip-components=1 && \
    ln -s /usr/share/maven/bin/mvn /usr/bin/mvn

ENV APP_DIR=/precision-fda

WORKDIR $APP_DIR

COPY Gemfile Gemfile.lock $APP_DIR/

RUN bundle install

COPY test/functional/pom.xml .

RUN mvn -B dependency:resolve

COPY . $APP_DIR
RUN tar -xzf /geckodriver-v0.19.1-linux64.tar.gz -C $APP_DIR/test/functional/drivers/

WORKDIR $APP_DIR/test/functional
RUN mvn -B compile test-compile
WORKDIR $APP_DIR

ENV DATABASE_URL=mysql2://root:password@localhost/precision-fda-uitest
ENV RAILS_ENV=ui_test
ENV PFDA_USER_ORG_HANDLE=alice_org
ENV PFDA_USER_DXUSER=alice
ENV NO_FIPS=1

ENV PFDA_AT_USER_1_PASSWORD_DEV="password"
ENV PFDA_AT_USER_2_PASSWORD_DEV="password"
ENV PFDA_AT_USER_ADMIN_PASSWORD_DEV="password"
ENV PFDA_BASIC_AUTH_DNX_PASSWORD_DEV="password"

ENV PFDA_SERVER_URL_DEV="https://localhost:3000"
ENV PFDA_SERVER_URL_LOC="https://localhost:3000"
ENV PFDA_SERVER_URL_PROD="https://localhost:3000"

ENV PFDA_PLATFORM_SERVER_URL_LOC="https://staging.dnanexus.com"
ENV PFDA_PLATFORM_SERVER_URL_DEV="https://staging.dnanexus.com"

ENTRYPOINT $APP_DIR/docker/entrypoint/ui_test.entrypoint.sh
