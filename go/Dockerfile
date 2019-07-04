# Builds docker image with pfda asset uploader.
#
# Example:
#
# docker build -t pfda_uploader .
# docker run -v <ASSET_DIR>:/pfda pfda_uploader pfda \
#  --cmd upload-asset \
#  --key <TOKEN>
#  --name <ASSET_NAME>.tar.gz
#  --root /pfda/fake_root
#  --readme /pfda/readme.txt

FROM goboring/golang:1.8.3b4

RUN mkdir /pfda && \
    curl -o /pfda/pfda-2.0.0.tar.gz https://precision.fda.gov/pfda-2.0.0.tar.gz && \
    tar xfv /pfda/pfda-2.0.0.tar.gz -C /usr/local/bin/ && \
    rm /pfda/pfda-2.0.0.tar.gz && \
    chmod +x /usr/local/bin/pfda

WORKDIR /pfda
