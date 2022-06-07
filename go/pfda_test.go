package main

import (
	"dnanexus.com/precision-fda-cli/precisionfda"
	"dnanexus.com/precision-fda-cli/precisionfda/test"
	"flag"
	"os"
	"testing"
)


func TestMain(m *testing.M) {
	// Not the most elegant way of avoiding usage spew in unit test output
	// but works since main uses the default flagset
	flag.Usage = func() {}

	// Run tests
	exitVal := m.Run()

	// Teardown

	// Exit with exit value from tests
	os.Exit(exitVal)
}

type InputFlags struct {
	InputFilePath *string
	FolderID *string
	SpaceID *string
	AssetFolderPath *string
	AssetName *string
	ReadmeFilePath *string
	FileID *string
	OutputFilePath *string
}

func (f *InputFlags) Reset() {
	f.InputFilePath = nil
	f.FolderID = nil
	f.SpaceID = nil
	f.AssetFolderPath = nil
	f.AssetName = nil
	f.ReadmeFilePath = nil
	f.FileID = nil
	f.OutputFilePath = nil
}

func runMainInternal(surpressStdout bool) int {
	var originalStdout = os.Stdout
	if surpressStdout {
		os.Stdout, _ = os.Open(os.DevNull)
	}
	returnCode := mainInternal()
	if surpressStdout {
		os.Stdout = originalStdout
	}
	return returnCode
}

func TestMainNoArgs(t *testing.T) {
	oldArgs := os.Args
	defer func() { os.Args = oldArgs }()

	os.Args = []string{"pfda"}
	returnCode := runMainInternal(true)
	test.Equals(t, 1, returnCode)
}

func TestWrongCmdError(t *testing.T) {
	oldArgs := os.Args
	defer func() { os.Args = oldArgs }()

	os.Args = []string{"pfda", "--cmd", "foobar"}
	returnCode := runMainInternal(true)
	test.Equals(t, 1, returnCode)
}

func TestPositionalCmdInWrongPlace(t *testing.T) {
	oldArgs := os.Args
	defer func() { os.Args = oldArgs }()

	var funcWasCalled = false
	invokeDownloadFile = func(client precisionfda.IPFDAClient, fileID *string, outputFilePath *string) error {
		funcWasCalled = true
		return nil
	}

	os.Args = []string{"pfda", "--file-id", "file-12345", "--key", "HELLO", "download"}
	returnCode := runMainInternal(true)
	test.Equals(t, 1, returnCode)
	test.Equals(t, false, funcWasCalled)

	invokeUploadFile = func(client precisionfda.IPFDAClient, inputFilePath *string, folderID *string, spaceID *string, inputChunkSize *int, inputNumRoutines *int) error {
		funcWasCalled = true
		return nil
	}

	os.Args = []string{"pfda", "--file", "./README.md", "--key", "HELLO", "upload-file"}
	returnCode = runMainInternal(true)
	test.Equals(t, 1, returnCode)
	test.Equals(t, false, funcWasCalled)
}

func TestPositionalCmdAndCommandBothSpecified(t *testing.T) {
	oldArgs := os.Args
	defer func() { os.Args = oldArgs }()

	var funcWasCalled = false
	invokeUploadFile = func(client precisionfda.IPFDAClient, inputFilePath *string, folderID *string, spaceID *string, inputChunkSize *int, inputNumRoutines *int) error {
		funcWasCalled = true
		return nil
	}
	os.Args = []string{"pfda", "upload-file", "--cmd", "upload-file", "--file", "./README.md", "--key", "HELLO"}
	returnCode := runMainInternal(true)
	test.Equals(t, 1, returnCode)
	test.Equals(t, false, funcWasCalled)
}

func TestInvokeUploadFile(t *testing.T) {
	oldArgs := os.Args
	defer func() { os.Args = oldArgs }()

	var funcWasCalled = false
	input := &InputFlags{}
	var reset = func() {
		funcWasCalled = false
		input.Reset()
	}

	invokeUploadFile = func(client precisionfda.IPFDAClient, inputFilePath *string, folderID *string, spaceID *string, inputChunkSize *int, inputNumRoutines *int) error {
		funcWasCalled = true
		input.InputFilePath = inputFilePath
		input.FolderID = folderID
		input.SpaceID = spaceID
		return nil
	}

	// Case: --file is missing
	os.Args = []string{"pfda", "--cmd", "upload-file"}
	returnCode := runMainInternal(true)
	test.Equals(t, 1, returnCode)
	test.Equals(t, false, funcWasCalled)
	reset()

	// Case: --file does not exist
	os.Args = []string{"pfda", "upload-file", "--file", "./IDoNot.Exist"}
	returnCode = runMainInternal(true)
	test.Equals(t, 1, returnCode)
	test.Equals(t, false, funcWasCalled)
	test.Equals(t, (*string)(nil), input.InputFilePath)
	reset()

	// Case: --file does not exist with --cmd
	os.Args = []string{"pfda", "--cmd", "upload-file", "--file", "./IDoNot.Exist"}
	returnCode = runMainInternal(true)
	test.Equals(t, 1, returnCode)
	test.Equals(t, false, funcWasCalled)
	test.Equals(t, (*string)(nil), input.InputFilePath)
	reset()

	// Case: upload-file upload success
	os.Args = []string{"pfda", "--cmd", "upload-file", "--file", "./README.md", "--key", "HELLO"}
	returnCode = runMainInternal(false)
	test.Equals(t, 0, returnCode)
	test.Equals(t, true, funcWasCalled)
	test.Equals(t, "./README.md", *input.InputFilePath)
	reset()

	// Case: upload-file success with folder and space
	os.Args = []string{"pfda", "upload-file", "--file", "./Dockerfile", "--key", "HELLO", "--folder-id", "test-folder", "--space-id", "test-space"}
	returnCode = runMainInternal(false)
	test.Equals(t, 0, returnCode)
	test.Equals(t, true, funcWasCalled)
	test.Equals(t, "./Dockerfile", *input.InputFilePath)
	test.Equals(t, "test-folder", *input.FolderID)
	test.Equals(t, "test-space", *input.SpaceID)
	reset()

	// Case: upload-file success with folder and space with --cmd
	os.Args = []string{"pfda", "--cmd", "upload-file", "--file", "./Dockerfile", "--key", "HELLO", "--folder-id", "test-folder", "--space-id", "test-space"}
	returnCode = runMainInternal(false)
	test.Equals(t, 0, returnCode)
	test.Equals(t, true, funcWasCalled)
	test.Equals(t, "./Dockerfile", *input.InputFilePath)
	test.Equals(t, "test-folder", *input.FolderID)
	test.Equals(t, "test-space", *input.SpaceID)
	reset()
}

func TestInvokeUploadAsset(t *testing.T) {
	oldArgs := os.Args
	defer func() { os.Args = oldArgs }()

	var funcWasCalled = false
	input := &InputFlags{}
	var reset = func() {
		funcWasCalled = false
		input.Reset()
	}

	invokeUploadAsset = func(client precisionfda.IPFDAClient, assetFolderPath *string, assetName *string, readmeFilePath *string, inputChunkSize *int, inputNumRoutines *int) error {
		funcWasCalled = true
		input.AssetFolderPath = assetFolderPath
		input.AssetName = assetName
		input.ReadmeFilePath = readmeFilePath
		return nil
	}

	// Case: upload-asset with folder and space
	os.Args = []string{"pfda", "upload-asset", "--name", "test-asset.tar.gz", "--key", "HELLO", "--root", "./precisionfda", "--readme", "./README.md"}
	returnCode := runMainInternal(false)
	test.Equals(t, 0, returnCode)
	test.Equals(t, true, funcWasCalled)
	test.Equals(t, "./precisionfda", *input.AssetFolderPath)
	test.Equals(t, "test-asset.tar.gz", *input.AssetName)
	test.Equals(t, "./README.md", *input.ReadmeFilePath)
	reset()

	// Case: upload-asset with folder and space with --cmd
	os.Args = []string{"pfda", "--cmd", "upload-asset", "--name", "test-asset.tar.gz", "--key", "HELLO", "--root", "./precisionfda", "--readme", "./README.md"}
	returnCode = runMainInternal(false)
	test.Equals(t, 0, returnCode)
	test.Equals(t, true, funcWasCalled)
	test.Equals(t, "./precisionfda", *input.AssetFolderPath)
	test.Equals(t, "test-asset.tar.gz", *input.AssetName)
	test.Equals(t, "./README.md", *input.ReadmeFilePath)
	reset()

	// Case: upload-asset fails if --root doesn't exist
	os.Args = []string{"pfda", "upload-asset", "--name", "test-asset.tar.gz", "--key", "HELLO", "--root", "root-folder", "--readme", "./README.md"}
	returnCode = runMainInternal(false)
	test.Equals(t, 1, returnCode)
	test.Equals(t, false, funcWasCalled)
	test.Equals(t, (*string)(nil), input.AssetFolderPath)
	test.Equals(t, (*string)(nil), input.AssetName)
	test.Equals(t, (*string)(nil), input.ReadmeFilePath)
	reset()

	// Case: upload-asset fails if --file doesn't exist
	os.Args = []string{"pfda", "upload-asset", "--name", "test-asset.tar.gz", "--key", "HELLO", "--root", "./i-do-not-exist", "--readme", "./README.md"}
	returnCode = runMainInternal(false)
	test.Equals(t, 1, returnCode)
	test.Equals(t, false, funcWasCalled)
	test.Equals(t, (*string)(nil), input.AssetFolderPath)
	test.Equals(t, (*string)(nil), input.AssetName)
	test.Equals(t, (*string)(nil), input.ReadmeFilePath)
	reset()

	// Case: upload-asset with all parameters
	os.Args = []string{"pfda", "--cmd", "upload-asset", "--name", "test-asset.tar.gz", "--key", "HELLO", "--root", "./", "--readme", "./README.md"}
	returnCode = runMainInternal(false)
	test.Equals(t, 0, returnCode)
	test.Equals(t, true, funcWasCalled)
	test.Equals(t, "./", *input.AssetFolderPath)
	test.Equals(t, "test-asset.tar.gz", *input.AssetName)
	test.Equals(t, "./README.md", *input.ReadmeFilePath)
	reset()
}

func TestInvokeDownloadFile(t *testing.T) {
	oldArgs := os.Args
	defer func() { os.Args = oldArgs }()

	var funcWasCalled = false
	input := &InputFlags{}
	var reset = func() {
		funcWasCalled = false
		input.Reset()
	}

	invokeDownloadFile = func(client precisionfda.IPFDAClient, fileID *string, outputFilePath *string) error {
		funcWasCalled = true
		input.FileID = fileID
		input.OutputFilePath = outputFilePath
		return nil
	}

	// Case: download with --cmd
	os.Args = []string{"pfda", "--cmd", "download", "--file-id", "file-12345", "--key", "HELLO"}
	returnCode := runMainInternal(false)
	test.Equals(t, 0, returnCode)
	test.Equals(t, true, funcWasCalled)
	test.Equals(t, "file-12345", *input.FileID)
	reset()

	// Case: download without --cmd, with outputFilePath
	os.Args = []string{"pfda", "download", "--file-id", "file-23456", "--key", "HELLO", "--output", "/tmp/canyoupleaseworksoicanbedonefortheday.argh"}
	returnCode = runMainInternal(false)
	test.Equals(t, 0, returnCode)
	test.Equals(t, true, funcWasCalled)
	test.Equals(t, "file-23456", *input.FileID)
	reset()
}
