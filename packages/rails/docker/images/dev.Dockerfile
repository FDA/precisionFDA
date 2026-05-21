ARG RUBY_IMAGE_TAG=3.2.2

FROM ruby:${RUBY_IMAGE_TAG}

# NOTE: arg needs to be defined on this line, otherwise build fails
ARG COFFEE_MAJOR_NODE_VERSION=22
ENV APP_DIR=/precision-fda

WORKDIR $APP_DIR
RUN curl -fsSL https://deb.nodesource.com/setup_${COFFEE_MAJOR_NODE_VERSION}.x | bash - && \
    apt-get update && \
    apt-get install -y --no-install-recommends build-essential cmake wget libssl-dev nodejs default-mysql-client && \
    rm -rf /var/lib/apt/lists/* && \
    npm install -g bower && \
    sed -i '/^#/!s/CipherString = DEFAULT@SECLEVEL=2/#CipherString = DEFAULT@SECLEVEL=2/g' /etc/ssl/openssl.cnf
COPY ./docker/entrypoint/dev.entrypoint.sh $APP_DIR/docker/entrypoint/dev.entrypoint.sh
RUN chmod +x $APP_DIR/docker/entrypoint/dev.entrypoint.sh

CMD ["/precision-fda/docker/entrypoint/dev.entrypoint.sh"]
