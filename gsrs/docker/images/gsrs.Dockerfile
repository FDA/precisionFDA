FROM tomcat:10.1.10-jdk11

ARG gsrs_branch=gsrs_LOCAL
ENV GSRS_BRANCH=$gsrs_branch
ENV GSRS_CONFIG=/usr/local/tomcat/substances/WEB-INF/classes/application.conf

ENV GSRS_DATABASE_URL=jdbc:mariadb://gsrsdb:3306/ixginas
ENV GSRS_DATABASE_USERNAME=root
ENV GSRS_DATABASE_PASSWORD=password

ENV CATALINA_HOME /usr/local/tomcat
ENV PATH $CATALINA_HOME/bin:$PATH
ENV CATALINA_OPTS="-Xms4G -Xmx4G -Djava.net.preferIPv4Stack=true"

RUN mkdir -p "$CATALINA_HOME"

RUN apt-get -qqy update && \
    apt-get -qqy --no-install-recommends install git nano

RUN cd /usr/local/tomcat/webapps && \
    git clone -b $GSRS_BRANCH https://github.com/dnanexus/gsrs-play-dist.git .

# RUN export CATALINA_OPTS="${CATALINA_OPTS} -Dspring-boot.run.jvmArguments='-Dix.ginas.load.file=/usr/local/tomcat/webapps/substances/WEB-INF/classes/rep18.gsrs'"
# COPY gsrs/docker/entrypoint/gsrs.entrypoint.sh /tmp/entrypoint.sh

WORKDIR $CATALINA_HOME

EXPOSE 8080
# ENTRYPOINT ["/tmp/entrypoint.sh"]
CMD ["catalina.sh", "run"]