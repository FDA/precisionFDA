# precisionFDA

### Uploader v2.0
##### Written using [fork of Go that uses BoringCrypto](https://github.com/golang/go/tree/dev.boringcrypto)

### Getting Started:
This will install Go locally on your machine. For customized installation please refer to the [Go docs on installation](https://golang.org/doc/install).

1. To install Go (Mac OS X), run:
   ```bash
   $ docker build -f docker/goboring.Dockerfile -t goboring .
   ```
2. To build the source code, run:
   ```bash
   $ docker run --mount type=bind,source="$(pwd)",target=/pfda -e GOOS='linux' -e GOARCH='amd64' goboring
   ```

3. To run the PFDA Uploader, run:
   ```bash
   $ ./tmp/pfda_linux_amd64
   ```

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
