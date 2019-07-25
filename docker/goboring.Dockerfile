FROM goboring/golang:1.9.2b4

RUN go get github.com/hashicorp/go-retryablehttp \
    && go get github.com/golang/lint/golint

RUN mkdir /pfda
WORKDIR /pfda

RUN chmod -R 777 /go
RUN chmod -R 777 /usr/local/go

ENTRYPOINT filename="pfda_${GOOS}_${GOARCH}" \
           && go build -o tmp/$filename -a go/pfda.go \
           && chmod 777 tmp/$filename
