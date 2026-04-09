FROM golang:1.26.1

ENV GOPATH="/go"

# Fetch dependencies
WORKDIR /build
COPY go.mod go.sum ./
RUN go mod download

RUN mkdir -p /go/src/dnanexus.com/precision-fda-cli
WORKDIR /go/src/dnanexus.com/precision-fda-cli

ENTRYPOINT ["sh", "-c", "filename=\"pfda_${GOOS}_${GOARCH}\" && GOFIPS140=v1.26.0 go build -trimpath -ldflags \"-X main.Version=${VERSION} -X main.BuildTime=${BUILDTIME} -X main.commitID=${COMMITID} -X main.OsArch=${GOOS}/${GOARCH} -X main.jobExecutionEnabled=${JOB_EXECUTION_ENABLED}\" -o dist/$filename pfda.go && chmod +x dist/$filename"]
