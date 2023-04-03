# precisionFDA CLI

##### Written using Go

As of Go 1.18 the BoringCrypto fork has been merged with the main branch. BoringCrypto is used because of [FIPS 140-2 compliance](https://boringssl.googlesource.com/boringssl/+/master/crypto/fipsmodule/FIPS.md).

Latest releases of boringcrypto are available [here](https://go.googlesource.com/go/+/dev.boringcrypto/misc/boring/RELEASES)


### Getting Started:
This will install Go locally on your machine. For customized installation please refer to the [Go docs on installation](https://golang.org/doc/install).

Run the following in the precision-fda/go directory:

1. To build the Go docker image:
   ```bash
   $ make build-docker
   ```
2. To build the source code, use one of the following: (N.B. darwin is macOS)
   ```bash
   $ make build-darwin
   $ make build-linux
   $ make build-windows
   ```

3. To run the PFDA Uploader:
   ```bash
   $ ./dist/pfda_darwin_amd64
   $ ./dist/pfda_linux_amd64
   $ ./dist/pfda_windows_amd64
   ```

### Development Guide

To quickly test changes to the code, you can use the same docker image as follows.

First build the precisionfda-cli docker image:

   ```# Make sure cwd is the precision-fda/go directory
   $ make build-docker
   or
   $ docker build -t precisionfda-cli .
   ```

Generate the key for local testing https://localhost:3000/assets/new
or for staging https://precisionfda-staging.dnanexus.com/assets/new and then

   ```$ docker run -it --rm --entrypoint bash --network host --mount type=bind,source="$(pwd)",target=/go/src/dnanexus.com/precision-fda-cli -w /go/src/dnanexus.com/precision-fda-cli precisionfda-cli
   $ export KEY=<INSERT KEY>
   $ go run pfda.go upload-file --key $KEY --file <PATH_TO_FILE>
   ```

To test for local development, add the following flags `--server localhost:3000 --skipverify true`
To test on staging, add the following flags `--server precisionfda-staging.dnanexus.com`

For example:

   ``` # Set KEY API key generated above
   # Testing upload to localhost
   $ ./pfda upload-file --server localhost:3000 --skipverify true --key $KEY --file fileYouWantToUpload.pdf
   $ ./pfda upload-file --server localhost:3000 --skipverify true --key $KEY --file fileYouWantToUpload.pdf

   # Testing download from localhost
   $ ./pfda download --server localhost:3000 --skipverify true --key $KEY --file file-yourfileuuid-1
   $ ./pfda download --server localhost:3000 --skipverify true --key $KEY --file file-yourfileuuid-1

   # Testing the API for file download
   $ ./pfda api --server localhost:3000 --skipverify true --key $KEY --route "files/file-G70fbKj0qp9YGkg24kGxQvF4-1/download" --json '{ "format": "json" }'
   $ ./pfda api --server localhost:3000 --skipverify true --key $KEY --route "files/file-G70fbKj0qp9YGkg24kGxQvF4-1/download" --json '{ "format": "json" }'
   ```

### Running Unit Tests

Run `make test`

Or run it inside an interactive docker container
   ```$ docker run -it --rm --entrypoint bash --network host --mount type=bind,source="$(pwd)",target=/go/src/dnanexus.com/precision-fda-cli -w /go/src/dnanexus.com/precision-fda-cli goboring/golang:1.16.7b7
   $ go test ./...
   ```


### Build for Distribution

Make sure the goboring docker image is built, then invoke `./build-dist.sh` from the /go directory.

Build products will be available in `./dist`


### Cross Compilation:
Compiling for non-native target platforms is made easy with go. Regardless of what OS/architecture you are running locally.

The supported options for `$GOOS` and `$GOARCH` are listed below:
```bash
$GOOS		$GOARCH

android		arm
darwin		386
darwin		amd64
darwin		arm
darwin		arm64
dragonfly	amd64
freebsd		386
freebsd		amd64
freebsd		arm
linux		386
linux		amd64
linux		arm
linux		arm64
linux		ppc64
linux		ppc64le
linux		mips64
linux		mips64le
netbsd		386
netbsd		amd64
netbsd		arm
openbsd		386
openbsd		amd64
openbsd		arm
plan9		386
plan9		amd64
solaris		amd64
windows		386
windows		amd64
```


# FIPS Compliance

List of FIPS certifications is listed in the BoringCrypto:
https://boringssl.googlesource.com/boringssl/+/master/crypto/fipsmodule/FIPS.md#validations

The current validation on NIST site:
https://csrc.nist.gov/Projects/Cryptographic-Module-Validation-Program/Certificate/3678

The package is configured by itself solely by importing it, the relevant code is here: https://go.googlesource.com/go/+/dev.boringcrypto/src/crypto/tls/fipsonly/fipsonly.go

To test for FIPS compliance we can inspect the symbols using `go tool nm ./pfda` and ensure that crypto/internal/boring/sig.FIPSOnly.* is present.


# Version History

### 2.3 (2023-03-27)
- improved syntax of commands 
- added support for multiple files/folders to upload-file and download commands.
- New feature - mkdir; create new folders in any location
- New feature - rmdir; delete folders from any location
- New feature - rm; delete files from any location
- New feature - head, cat; print content of a file


### 2.2.1 (2022-12-20)

- improved output of ls command
- added `-overwrite` flag for download command

### 2.2 (2022-12-07)

- New feature - ls; list files from private home or a space
- New feature - list-spaces; list all available spaces
- New feature - describe-app; describe-workflow; describe the entity
- Added new `-help` flag for all commands with examples and brief instructions

### 2.1.2 (2022-08-03)

- Fixed windows asset upload

### 2.1.1 (2022-07-18)

- Improvements to asset upload
- Fixed downloading file with spaces in filename


### 2.1 (2022-02-22)

- The CLI can now download files from private home or a space
- When uploading files, add the -space-id option to specify a space
- Specifying -folder-id will allow files to be uploaded to a specific folder
- -version flag now prints FIPS only mode confirmation

### 2.0.1 (2021-08-26)

- Fix an issue uploading very large files
- Improved uploading progress display
- Upgraded to goboring 1.16.7b7

### 2.0.0 (2021-02-06)

- TLS 1.2 and FIPS 140-2 support

### 1.0.4 (2016-01-05)

- Reduced memory usage of each thread

### 1.0.3 (2015-12-14)

- The uploader can now be used for both assets and files

### 1.0.2 (2015-12-03)

- Multi-threaded uploading, for faster uploading of large assets
