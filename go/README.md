# precisionFDA

### Uploader v2.0.1
##### Written using [fork of Go that uses BoringCrypto](https://github.com/golang/go/tree/dev.boringcrypto)

BoringCrypto branch is used because of FIPS compliance. Currently using go1.16.7b7

Latest releases of boringcrypto are available [here](https://go.googlesource.com/go/+/dev.boringcrypto/misc/boring/RELEASES)


### Getting Started:
This will install Go locally on your machine. For customized installation please refer to the [Go docs on installation](https://golang.org/doc/install).

Run the following on the root of the repo:

1. To install the Go docker image, run:
   ```bash
   $ docker build -f docker/goboring.Dockerfile -t goboring .
   ```
2. To build the source code, run:
   ```bash
   $ docker run --rm --mount type=bind,source="$(pwd)/go",target=/go/src/dnanexus.com/precision-fda-cli -e GOOS='linux' -e GOARCH='amd64' -e VERSION='2.0.1' goboring
   ```

3. To run the PFDA Uploader, run:
   ```bash
   $ ./go/dist/pfda_linux_amd64
   ```

### Development Guide

To quickly test changes to the code, you can use the same docker image as follows.

First build the goboring docker image:

   ```# Make sure cwd is the precision-fda repo root
   $ docker build -f docker/goboring.Dockerfile -t goboring .
   ```

Generate the key for staging at https://precisionfda-staging.dnanexus.com/assets/new and 

   ```$ docker run -it --rm --entrypoint bash --mount type=bind,source="$(pwd)/go",target=/go/src/dnanexus.com/precision-fda-cli goboring
   $ export KEY=<INSERT KEY FROM STAGING>
   $ go run pfda.go --cmd upload-file --key $KEY --file <PATH_TO_FILE>
   ```

### Build for Distribution

Make sure the goboring docker image is built, then invoke `./go/build-dist.sh` from the repo root.

Build products will be available in `./go/dist`


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

# Version History

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
