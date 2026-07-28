# ==========================================
# Stage 1: Builder
# ==========================================
FROM tomcat:10.1-jdk17 AS builder

ARG GSRS3_MAIN_BRANCH=GSRSv3.2.0PUB
ARG FRONTEND_TAG=pfda

# Optional: set these to build dependencies from source instead of using Maven SNAPSHOTs.
# e.g. for 3.2.0 prerelease: --build-arg GSRS_STARTER_REF=master --build-arg GSRS_SUBSTANCES_REF=master
# When left empty (default), the build relies on SNAPSHOT artifacts in Maven Central / Sonatype.
ARG GSRS_STARTER_REF=""
ARG GSRS_SUBSTANCES_REF=""

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

# Clone the main deployment repo
RUN git clone --depth=1 --branch ${GSRS3_MAIN_BRANCH} \
    https://github.com/ncats/gsrs3-main-deployment.git source-repo

# ============================================================
# Optionally build dependency repos from source.
# When GSRS_STARTER_REF / GSRS_SUBSTANCES_REF are set, the repos
# are cloned and `mvn install`-ed so that SNAPSHOT artifacts are
# available in the local Maven cache. When empty, Maven resolves
# them from remote repositories as before.
# ============================================================

# ---------- Build gsrs-spring-starter (core library) ----------
RUN if [ -n "${GSRS_STARTER_REF}" ]; then \
      echo ">>> Building gsrs-spring-starter from source (${GSRS_STARTER_REF})"; \
      git clone --depth=1 --branch ${GSRS_STARTER_REF} \
        https://github.com/ncats/gsrs-spring-starter.git /build/gsrs-spring-starter && \
      cd /build/gsrs-spring-starter && \
      mvn install -DskipTests -q; \
    else \
      echo ">>> Skipping gsrs-spring-starter source build (using Maven SNAPSHOTs)"; \
    fi

# ---------- Build gsrs-spring-module-substances ----------
RUN if [ -n "${GSRS_SUBSTANCES_REF}" ]; then \
      echo ">>> Building gsrs-spring-module-substances from source (${GSRS_SUBSTANCES_REF})"; \
      git clone --depth=1 --branch ${GSRS_SUBSTANCES_REF} \
        https://github.com/ncats/gsrs-spring-module-substances.git /build/gsrs-spring-module-substances && \
      cd /build/gsrs-spring-module-substances && \
      chmod +x installExtraJars.sh && ./installExtraJars.sh && \
      mvn install -DskipTests -q; \
    else \
      echo ">>> Skipping gsrs-spring-module-substances source build (using Maven SNAPSHOTs)"; \
    fi

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
COPY config/roles_config.json conf/roles_config.json

COPY config/application.conf /tmp/application.conf.template
COPY config/config.json /tmp/config.json.template
COPY entrypoint.sh /usr/local/bin/entrypoint.sh

COPY gsrs-users-import.sh /usr/local/bin/gsrs-users-import.sh
RUN chmod +x /usr/local/bin/gsrs-users-import.sh

RUN chmod +x /usr/local/bin/entrypoint.sh && \
    chmod -R g+w conf

RUN sed -i "s|\${user.dir}|$CATALINA_HOME|g" \
      webapps/**/META-INF/context.xml || true

EXPOSE 8080

ENTRYPOINT ["/usr/bin/tini", "--", "/usr/local/bin/entrypoint.sh"]