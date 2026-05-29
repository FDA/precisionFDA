FROM node:22-bullseye-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends git python3 make g++ && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Dependencies are installed at container startup (from bind-mounted source)
EXPOSE 4200

COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
