FROM python:3.11-alpine

RUN apk update && apk upgrade --no-cache && \
    apk add --no-cache \
    mariadb-client \
    bash

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir boto3

WORKDIR /app

COPY data_update.py .

ENTRYPOINT ["python", "data_update.py"]