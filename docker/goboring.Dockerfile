FROM goboring/golang:1.16.7b7

RUN chmod -R 777 /go
RUN chmod -R 777 /usr/local/go
ENV GOPATH="/go"

RUN mkdir -p /go/src/dnanexus.com/precision-fda-cli
WORKDIR /go/src/dnanexus.com/precision-fda-cli

RUN go get github.com/hashicorp/go-retryablehttp && \
    go get golang.org/x/lint/golint && \
    go get github.com/gosuri/uiprogress

ENTRYPOINT filename="pfda_${GOOS}_${GOARCH}" \
           && go build -ldflags "-X main.Version=${VERSION} -X main.BuildTime=${BUILDTIME} -X main.commitID=${COMMITID} -X main.OsArch=${GOOS}/${GOARCH}"  -o dist/$filename -a pfda.go \
           && chmod 777 dist/$filename
