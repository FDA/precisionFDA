FROM goboring/golang:1.16.7b7

ENV GOPATH="/go"

# Fetch dependencies
WORKDIR /build
COPY go.mod go.sum ./
RUN go mod download

RUN mkdir -p /go/src/dnanexus.com/precision-fda-cli
WORKDIR /go/src/dnanexus.com/precision-fda-cli

ENTRYPOINT filename="pfda_${GOOS}_${GOARCH}" \
           && go build -ldflags "-X main.Version=${VERSION} -X main.BuildTime=${BUILDTIME} -X main.commitID=${COMMITID} -X main.OsArch=${GOOS}/${GOARCH}"  -o dist/$filename -a pfda.go \
           && chmod +x dist/$filename
