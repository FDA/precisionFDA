# precisionFDA

### Uploader v2.0
##### Written using [Go v1.7.1](https://golang.org/dl/)

### Getting Started:
This will install Go locally on your machine. For customized installation please refer to the [Go docs on installation](https://golang.org/doc/install).

1. To install Go (Mac OS X), run:
   ```bash
   $ ./install_go.sh
   ```
   If you are installing on a Linux system run: `./install_go.sh linux`

    __Note:__ After running step 1, you'll need to either open a new terminal window or run `source ~/.bash_profile`.
2. To build the source code, run:
   ```bash
   $ go build pfda.go
   ```

3. To run the PFDA Uploader, run:
   ```bash
   $ ./pfda
   ```

4. Also included in the installation is the `golint` linting tool for go. To lint your code, run:
   ```bash
   $ golint pfda.go
   ```   

### Cross Compilation:
Compiling for non-native target platforms is made easy with go. Regardless of what OS/architecture you are running locally, simply run:
```bash
GOOS=<TARGET_OS> GOARCH=<TARGET_ARCH> go build pfda.go
```
This will compile the pfda uploader (or the given `*.go` source file) into an executable for the OS specified by `<TARGET_OS>` and the architecture specified by `<TARGET_ARCH>`.

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
To confirm the executable was built correctly you can run the `file` command, which provides compilation details on a given executable:
```bash
$ file pfda
pfda: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), statically linked, not stripped
```

### Cleaning up:
To remove Go, run:
```bash
$ ./uninstall_go.sh
```
For more details, please see the [Go docs on uninstalling](https://golang.org/doc/install#uninstall).
