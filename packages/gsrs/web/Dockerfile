# ==========================================
# Stage 1: Builder
# ==========================================
FROM tomcat:10.1-jdk17 AS builder

ARG GSRS3_MAIN_BRANCH=GSRSv3.1.2PUB
ARG FRONTEND_TAG=pfda

# Install build dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      python3 \
      python3-dev \
      python3-setuptools \
      make \
      g++ \
      git \
      maven \
      unzip \
      ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /build

# Clone source
RUN git clone --depth=1 --branch ${GSRS3_MAIN_BRANCH} \
    https://github.com/ncats/gsrs3-main-deployment.git source-repo

# ---------- Frontend ----------
WORKDIR /build/source-repo/frontend

COPY config/pom.xml pom.xml

RUN chmod +x mvnw && \
    ./mvnw clean -U package \
      -Dfrontend.tag=${FRONTEND_TAG} \
      -DskipTests

# ---------- Backend ----------
WORKDIR /build/source-repo/substances
RUN chmod +x installExtraJars.sh mvnw && \
    ./installExtraJars.sh && \
    ./mvnw package -DskipTests

# ---------- Jakarta Migration ----------
RUN /usr/local/tomcat/bin/migrate.sh \
      target/substances.war target/substances.war && \
    /usr/local/tomcat/bin/migrate.sh \
      ../frontend/target/frontend.war \
      ../frontend/target/frontend.war

RUN mkdir -p /build/artifacts/{substances,frontend} && \
    unzip target/substances.war -d /build/artifacts/substances && \
    unzip ../frontend/target/frontend.war -d /build/artifacts/frontend


# ==========================================
# Stage 2: Runtime
# ==========================================

FROM tomcat:10.1-jre17-temurin-jammy

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y --no-install-recommends \
      gettext-base \
      ca-certificates \
      tini \
    && rm -rf /var/lib/apt/lists/*

ENV CATALINA_HOME=/usr/local/tomcat
ENV JAVA_OPTS="\
  -Djava.security.egd=file:/dev/urandom \
  -Djdk.util.zip.disableZip64ExtraFieldValidation=true \
  -Dserver.info=Apache_Tomcat \
  -XX:+UseContainerSupport \
  -XX:MaxRAMPercentage=75"

WORKDIR $CATALINA_HOME

RUN rm -rf webapps/* \
           bin/*.bat \
           webapps.dist \
           RELEASE-NOTES \
           RUNNING.txt

COPY --from=builder /build/artifacts/substances webapps/substances
COPY --from=builder /build/artifacts/frontend webapps/frontend

# Copy configs
COPY config/server.xml conf/server.xml
COPY config/context.xml conf/context.xml
COPY config/rewrite.config conf/Catalina/localhost/rewrite.config

COPY config/application.conf /tmp/application.conf.template
COPY config/config.json /tmp/config.json.template
COPY entrypoint.sh /usr/local/bin/entrypoint.sh


RUN chmod +x /usr/local/bin/entrypoint.sh && \
    chmod -R g+w conf

RUN sed -i "s|\${user.dir}|$CATALINA_HOME|g" \
      webapps/**/META-INF/context.xml || true

EXPOSE 8080

ENTRYPOINT ["/usr/bin/tini", "--", "/usr/local/bin/entrypoint.sh"]