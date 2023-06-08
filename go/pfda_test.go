package main

import (
	"flag"
	"os"
	"testing"

	"dnanexus.com/precision-fda-cli/precisionfda"
	"dnanexus.com/precision-fda-cli/precisionfda/test"
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
	InputFilePath    *string
	FilePaths        *[]string
	FolderID         *string
	SpaceID          *string
	AssetFolderPath  *string
	AssetName        *string
	ReadmeFilePath   *string
	FileID           *string
	Args             *[]string
	Arg              *string
	OutputFilePath   *string
	EntityID         *string
	EntityType       *string
	Overwrite        *string
	FlagWithProgress bool

	// optional flags for ls, list-spaces, download, mkdir, head
	FlagRecursive     bool
	FlagHelp          bool
	FlagBrief         bool
	FlagJson          bool
	FlagFoldersOnly   bool
	FlagFilesOnly     bool
	FlagLocked        bool
	FlagUnactivated   bool
	FlagPhiProtected  bool
	FlagGroups        bool
	FlagReview        bool
	FlagPrivate       bool
	FlagAdministrator bool
	FlagGovernment    bool
	FlagParents       bool
	FlagPublic		  bool
	FlagLines         int
}

func (f *InputFlags) Reset() {
	f.InputFilePath = nil
	f.FilePaths = nil
	f.FolderID = nil
	f.SpaceID = nil
	f.AssetFolderPath = nil
	f.AssetName = nil
	f.ReadmeFilePath = nil
	f.FileID = nil
	f.Args = nil
	f.Arg = nil
	f.OutputFilePath = nil
	f.EntityID = nil
	f.EntityType = nil
	f.FlagRecursive = false
	f.FlagWithProgress = true
	// optional flags - default to false
	f.FlagHelp = false
	f.FlagJson = false
	f.FlagFoldersOnly = false
	f.FlagFilesOnly = false
	f.FlagBrief = false
	f.FlagLocked = false
	f.FlagUnactivated = false
	f.FlagReview = false
	f.FlagGroups = false
	f.FlagPrivate = false
	f.FlagAdministrator = false
	f.FlagGovernment = false
	f.FlagParents = false
	f.FlagPublic = false
	f.FlagLines = 10
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
	invokeDownload = func(client precisionfda.IPFDAClient, args *[]string, folderID *string, spaceID *string, public bool, recursive bool, outputFilePath *string, overwriteFile *string) error {
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
	test.Equals(t, "README.md", *input.InputFilePath)
	reset()

	// Case: upload-file success with folder and space
	os.Args = []string{"pfda", "upload-file", "--file", "./Dockerfile", "--key", "HELLO", "--folder-id", "test-folder", "--space-id", "test-space"}
	returnCode = runMainInternal(false)
	test.Equals(t, 0, returnCode)
	test.Equals(t, true, funcWasCalled)
	test.Equals(t, "Dockerfile", *input.InputFilePath)
	test.Equals(t, "test-folder", *input.FolderID)
	test.Equals(t, "test-space", *input.SpaceID)
	reset()

	invokeUploadMultipleFiles = func(client precisionfda.IPFDAClient, filePaths *[]string, folderID *string, spaceID *string, inputChunkSize *int, inputNumRoutines *int) error {
		funcWasCalled = true
		input.FilePaths = filePaths
		input.FolderID = folderID
		input.SpaceID = spaceID
		return nil
	}

	// Case: upload-file success with multiple files/folders separated by commas
	os.Args = []string{"pfda", "upload-file", "file1.csv", "file2.xlsx", "./src/file123.txt", "./src/folder123", "--key", "HELLO"}
	returnCode = runMainInternal(false)
	test.Equals(t, 0, returnCode)
	test.Equals(t, true, funcWasCalled)
	test.Equals(t, []string{"file1.csv", "file2.xlsx", "./src/file123.txt", "./src/folder123"}, *input.FilePaths)
	reset()

	// Case: upload-file success with folder and space with --cmd
	os.Args = []string{"pfda", "--cmd", "upload-file", "--file", "./Dockerfile", "--key", "HELLO", "--folder-id", "test-folder", "--space-id", "test-space"}
	returnCode = runMainInternal(false)
	test.Equals(t, 0, returnCode)
	test.Equals(t, true, funcWasCalled)
	test.Equals(t, "Dockerfile", *input.InputFilePath)
	test.Equals(t, "test-folder", *input.FolderID)
	test.Equals(t, "test-space", *input.SpaceID)
	reset()

	invokeUploadFolder = func(client precisionfda.IPFDAClient, inputFilePath *string, folderID *string, spaceID *string, inputChunkSize *int, inputNumRoutines *int) error {
		funcWasCalled = true
		input.InputFilePath = inputFilePath
		input.FolderID = folderID
		input.SpaceID = spaceID
		return nil
	}

	// Case: upload-file with single folder
	os.Args = []string{"pfda", "upload-file", "helpers/", "--key", "HELLO"}
	returnCode = runMainInternal(false)
	test.Equals(t, 0, returnCode)
	test.Equals(t, true, funcWasCalled)
	test.Equals(t, "helpers", *input.InputFilePath)
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

	invokeDownload = func(client precisionfda.IPFDAClient, args *[]string, folderID *string, spaceID *string, public bool, recursive bool, outputFilePath *string, overwriteFile *string) error {
		funcWasCalled = true
		input.Args = args
		input.FolderID = folderID
		input.SpaceID = spaceID
		input.FlagRecursive = recursive
		input.OutputFilePath = outputFilePath
		input.Overwrite = overwriteFile
		return nil
	}

	// Case: download with --cmd
	os.Args = []string{"pfda", "--cmd", "download", "--file-id", "file-12345", "--key", "HELLO"}
	returnCode := runMainInternal(false)
	test.Equals(t, 0, returnCode)
	test.Equals(t, true, funcWasCalled)
	test.Equals(t, []string{"file-12345"}, *input.Args)
	reset()

	// Case: download without --cmd, with outputFilePath
	os.Args = []string{"pfda", "download", "--file-id", "file-23456", "--key", "HELLO", "--output", "/tmp/canyoupleaseworksoicanbedonefortheday.argh"}
	returnCode = runMainInternal(false)
	test.Equals(t, 0, returnCode)
	test.Equals(t, true, funcWasCalled)
	test.Equals(t, []string{"file-23456"}, *input.Args)
	reset()

	// Case: download without --cmd, with -overwrite flag
	os.Args = []string{"pfda", "download", "--file-id", "file-23456", "--key", "HELLO", "--overwrite", "true"}
	returnCode = runMainInternal(false)
	test.Equals(t, 0, returnCode)
	test.Equals(t, true, funcWasCalled)
	test.Equals(t, []string{"file-23456"}, *input.Args)
	test.Equals(t, "true", *input.Overwrite)
	reset()

	// Case: download whole folder with -overwrite and recursive flag
	os.Args = []string{"pfda", "download", "-folder-id", "12223", "-key", "HELLO", "-overwrite", "true", "-recursive"}
	returnCode = runMainInternal(false)
	test.Equals(t, 0, returnCode)
	test.Equals(t, true, funcWasCalled)
	test.Equals(t, "12223", *input.FolderID)
	test.Equals(t, "true", *input.Overwrite)
	test.Equals(t, true, input.FlagRecursive)
	reset()

	// Case: download without --cmd, with -overwrite flag
	os.Args = []string{"pfda", "download", "file-23456", "file-2221", "file-11111", "-key", "HELLO", "-overwrite", "true"}
	returnCode = runMainInternal(false)
	test.Equals(t, 0, returnCode)
	test.Equals(t, true, funcWasCalled)
	test.Equals(t, []string{"file-23456", "file-2221", "file-11111"}, *input.Args)
	test.Equals(t, "true", *input.Overwrite)
	reset()

}

func TestInvokeListing(t *testing.T) {
	oldArgs := os.Args
	defer func() { os.Args = oldArgs }()

	var funcWasCalled = false
	input := &InputFlags{}
	var reset = func() {
		funcWasCalled = false
		input.Reset()
	}

	invokeListing = func(client precisionfda.IPFDAClient, folderID *string, spaceID *string, flags map[string]bool) error {
		funcWasCalled = true
		input.FolderID = folderID
		input.SpaceID = spaceID
		input.FlagBrief = flags["brief"]
		input.FlagFilesOnly = flags["files_only"]
		input.FlagFoldersOnly = flags["folders_only"]
		input.FlagJson = flags["json"]
		return nil
	}

	// Case: ls without folderID and spaceID and no flags
	os.Args = []string{"pfda", "ls", "--key", "AUTH_KEY"}
	returnCode := runMainInternal(false)
	test.Equals(t, 0, returnCode)
	test.Equals(t, true, funcWasCalled)
	test.Equals(t, false, input.FlagBrief)
	test.Equals(t, false, input.FlagFilesOnly)
	test.Equals(t, false, input.FlagFoldersOnly)
	test.Equals(t, false, input.FlagJson)
	reset()

	// Case: ls with help - only show help and do not call the func
	os.Args = []string{"pfda", "ls", "--help"}
	returnCode = runMainInternal(false)
	test.Equals(t, 1, returnCode)
	test.Equals(t, false, funcWasCalled)
	test.Equals(t, false, input.FlagBrief)
	test.Equals(t, false, input.FlagFilesOnly)
	test.Equals(t, false, input.FlagFoldersOnly)
	test.Equals(t, false, input.FlagJson)
	reset()

	// Case: ls return only files in json format
	os.Args = []string{"pfda", "ls", "--key", "AUTH_KEY", "--json", "--files"}
	returnCode = runMainInternal(false)
	test.Equals(t, 0, returnCode)
	test.Equals(t, true, funcWasCalled)
	test.Equals(t, false, input.FlagBrief)
	test.Equals(t, true, input.FlagFilesOnly)
	test.Equals(t, false, input.FlagFoldersOnly)
	test.Equals(t, true, input.FlagJson)
	reset()

	// Case: ls return only folders in brief format
	os.Args = []string{"pfda", "ls", "--key", "AUTH_KEY", "--brief", "--folders"}
	returnCode = runMainInternal(false)
	test.Equals(t, 0, returnCode)
	test.Equals(t, true, funcWasCalled)
	test.Equals(t, true, input.FlagBrief)
	test.Equals(t, false, input.FlagFilesOnly)
	test.Equals(t, true, input.FlagFoldersOnly)
	test.Equals(t, false, input.FlagJson)
	reset()
}

func TestInvokeListSpaces(t *testing.T) {
	oldArgs := os.Args
	defer func() { os.Args = oldArgs }()

	var funcWasCalled = false
	input := &InputFlags{}
	var reset = func() {
		funcWasCalled = false
		input.Reset()
	}

	invokeListSpaces = func(client precisionfda.IPFDAClient, flags map[string]bool) error {
		funcWasCalled = true
		input.FlagJson = flags["json"]
		input.FlagLocked = flags["locked"]
		input.FlagUnactivated = flags["unactivated"]
		input.FlagReview = flags["review"]
		input.FlagGroups = flags["groups"]
		input.FlagPrivate = flags["private_type"]
		input.FlagAdministrator = flags["administrator"]
		input.FlagGovernment = flags["government"]
		return nil
	}

	// Case: list-spaces with no flags
	os.Args = []string{"pfda", "list-spaces", "--key", "AUTH_KEY"}
	returnCode := runMainInternal(false)
	test.Equals(t, 0, returnCode)
	test.Equals(t, true, funcWasCalled)
	test.Equals(t, false, input.FlagLocked)
	test.Equals(t, false, input.FlagUnactivated)
	test.Equals(t, false, input.FlagReview)
	test.Equals(t, false, input.FlagGroups)
	test.Equals(t, false, input.FlagPrivate)
	test.Equals(t, false, input.FlagAdministrator)
	test.Equals(t, false, input.FlagGovernment)
	test.Equals(t, false, input.FlagJson)
	reset()

	// Case: list-spaces with help - only show help and do not call the func
	os.Args = []string{"pfda", "list-spaces", "--help"}
	returnCode = runMainInternal(false)
	test.Equals(t, 1, returnCode)
	test.Equals(t, false, funcWasCalled)
	test.Equals(t, false, input.FlagLocked)
	test.Equals(t, false, input.FlagUnactivated)
	test.Equals(t, false, input.FlagReview)
	test.Equals(t, false, input.FlagGroups)
	test.Equals(t, false, input.FlagPrivate)
	test.Equals(t, false, input.FlagAdministrator)
	test.Equals(t, false, input.FlagGovernment)
	test.Equals(t, false, input.FlagJson)
	reset()

	// Case: list-spaces only locked and in json format
	os.Args = []string{"pfda", "list-spaces", "--key", "AUTH_KEY", "--locked", "--json"}
	returnCode = runMainInternal(false)
	test.Equals(t, 0, returnCode)
	test.Equals(t, true, funcWasCalled)
	test.Equals(t, true, input.FlagLocked)
	test.Equals(t, false, input.FlagUnactivated)
	test.Equals(t, false, input.FlagReview)
	test.Equals(t, false, input.FlagGroups)
	test.Equals(t, false, input.FlagPrivate)
	test.Equals(t, false, input.FlagAdministrator)
	test.Equals(t, false, input.FlagGovernment)
	test.Equals(t, true, input.FlagJson)
	reset()

	// Case: list spaces - multi-type filter
	os.Args = []string{"pfda", "list-spaces", "--key", "AUTH_KEY", "--groups", "--private", "--administrator", "--review", "--government"}
	returnCode = runMainInternal(false)
	test.Equals(t, 0, returnCode)
	test.Equals(t, true, funcWasCalled)
	test.Equals(t, false, input.FlagLocked)
	test.Equals(t, false, input.FlagUnactivated)
	test.Equals(t, true, input.FlagReview)
	test.Equals(t, true, input.FlagGroups)
	test.Equals(t, true, input.FlagPrivate)
	test.Equals(t, true, input.FlagAdministrator)
	test.Equals(t, true, input.FlagGovernment)
	test.Equals(t, false, input.FlagJson)
	reset()
}

func TestInvokeDescribeEntity(t *testing.T) {
	oldArgs := os.Args
	defer func() { os.Args = oldArgs }()

	var funcWasCalled = false
	input := &InputFlags{}
	var reset = func() {
		funcWasCalled = false
		input.Reset()
	}

	invokeDescribe = func(client precisionfda.IPFDAClient, entityID *string, entityType *string) error {
		funcWasCalled = true
		input.EntityID = entityID
		input.EntityType = entityType
		return nil
	}

	// Case: describe-app entity - old syntax
	os.Args = []string{"pfda", "describe-app", "--app-id", "APP_ID", "--key", "AUTH_KEY"}
	returnCode := runMainInternal(false)
	test.Equals(t, 0, returnCode)
	test.Equals(t, true, funcWasCalled)
	test.Equals(t, "APP_ID", *input.EntityID)
	test.Equals(t, "app", *input.EntityType)
	reset()

	// Case: describe-app entity - new syntax
	os.Args = []string{"pfda", "describe-app", "APP_ID", "--key", "AUTH_KEY"}
	returnCode = runMainInternal(false)
	test.Equals(t, 0, returnCode)
	test.Equals(t, true, funcWasCalled)
	test.Equals(t, "APP_ID", *input.EntityID)
	test.Equals(t, "app", *input.EntityType)
	reset()

	// Case: describe-workflow entity - old syntax
	os.Args = []string{"pfda", "describe-workflow", "--workflow-id", "WORKFLOW_ID", "--key", "AUTH_KEY"}
	returnCode = runMainInternal(false)
	test.Equals(t, 0, returnCode)
	test.Equals(t, true, funcWasCalled)
	test.Equals(t, "WORKFLOW_ID", *input.EntityID)
	test.Equals(t, "workflow", *input.EntityType)
	reset()

	// Case: describe-workflow entity - new syntax
	os.Args = []string{"pfda", "describe-workflow", "WORKFLOW_ID", "--key", "AUTH_KEY"}
	returnCode = runMainInternal(false)
	test.Equals(t, 0, returnCode)
	test.Equals(t, true, funcWasCalled)
	test.Equals(t, "WORKFLOW_ID", *input.EntityID)
	test.Equals(t, "workflow", *input.EntityType)
	reset()
}

func TestInvokeMkdir(t *testing.T) {
	oldArgs := os.Args
	defer func() { os.Args = oldArgs }()

	var funcWasCalled = false
	input := &InputFlags{}
	var reset = func() {
		funcWasCalled = false
		input.Reset()
	}

	invokeMkdir = func(client precisionfda.IPFDAClient, names *[]string, folderID *string, spaceID *string, parents bool) error {
		funcWasCalled = true
		input.Args = names
		input.FolderID = folderID
		input.SpaceID = spaceID
		input.FlagParents = parents
		return nil
	}

	// Case: simple mkdir
	os.Args = []string{"pfda", "mkdir", "dir1", "--key", "AUTH_KEY"}
	returnCode := runMainInternal(false)
	test.Equals(t, 0, returnCode)
	test.Equals(t, true, funcWasCalled)
	test.Equals(t, []string{"dir1"}, *input.Args)
	reset()

	// Case: mkdir with multiple args
	os.Args = []string{"pfda", "mkdir", "dir1","dir2", "dir3", "-folder-id","123", "-space-id","333", "--key", "AUTH_KEY"}
	returnCode = runMainInternal(false)
	test.Equals(t, 0, returnCode)
	test.Equals(t, true, funcWasCalled)
	test.Equals(t, []string{"dir1", "dir2","dir3"}, *input.Args)
	test.Equals(t, "123", *input.FolderID)
	test.Equals(t, "333", *input.SpaceID)
	test.Equals(t, false, input.FlagParents)
	reset()

	// Case: mkdir nested folders with parents flag
	os.Args = []string{"pfda", "mkdir", "dir1/dir2/dir3", "-p", "--key", "AUTH_KEY"}
	returnCode = runMainInternal(false)
	test.Equals(t, 0, returnCode)
	test.Equals(t, true, funcWasCalled)
	test.Equals(t, []string{"dir1/dir2/dir3"}, *input.Args)
	test.Equals(t, true, input.FlagParents)
	reset()
}

func TestInvokeRmdir(t *testing.T) {
	oldArgs := os.Args
	defer func() { os.Args = oldArgs }()

	var funcWasCalled = false
	input := &InputFlags{}
	var reset = func() {
		funcWasCalled = false
		input.Reset()
	}

	invokeRmdir = func(client precisionfda.IPFDAClient, args *[]string) error {
		funcWasCalled = true
		input.Args = args
		return nil
	}

	// Case: simple mkdir
	os.Args = []string{"pfda", "rmdir", "123", "--key", "AUTH_KEY"}
	returnCode := runMainInternal(false)
	test.Equals(t, 0, returnCode)
	test.Equals(t, true, funcWasCalled)
	test.Equals(t, []string{"123"}, *input.Args)
	reset()

	// Case: mkdir with multiple args
	os.Args = []string{"pfda", "rmdir", "123", "333", "--key", "AUTH_KEY"}
	returnCode = runMainInternal(false)
	test.Equals(t, 0, returnCode)
	test.Equals(t, true, funcWasCalled)
	test.Equals(t, []string{"123", "333"}, *input.Args)

	test.Equals(t, false, input.FlagParents)
	reset()
}

func TestInvokeRm(t *testing.T) {
	oldArgs := os.Args
	defer func() { os.Args = oldArgs }()

	var funcWasCalled = false
	input := &InputFlags{}
	var reset = func() {
		funcWasCalled = false
		input.Reset()
	}

	invokeRm = func(client precisionfda.IPFDAClient, args *[]string,folderID *string, spaceID *string) error {
		funcWasCalled = true
		input.Args = args
		return nil
	}

	// Case: simple mkdir
	os.Args = []string{"pfda", "rm", "123", "--key", "AUTH_KEY"}
	returnCode := runMainInternal(false)
	test.Equals(t, 0, returnCode)
	test.Equals(t, true, funcWasCalled)
	test.Equals(t, []string{"123"}, *input.Args)
	reset()

	// Case: mkdir with multiple args
	os.Args = []string{"pfda", "rm", "123*", "333", "--key", "AUTH_KEY"}
	returnCode = runMainInternal(false)
	test.Equals(t, 0, returnCode)
	test.Equals(t, true, funcWasCalled)
	test.Equals(t, []string{"123*", "333"}, *input.Args)

	test.Equals(t, false, input.FlagParents)
	reset()
}

func TestInvokeHead(t *testing.T) {
	oldArgs := os.Args
	defer func() { os.Args = oldArgs }()

	var funcWasCalled = false
	input := &InputFlags{}
	var reset = func() {
		funcWasCalled = false
		input.Reset()
	}

	invokeHead = func(client precisionfda.IPFDAClient, arg *string, lines int) error {
		funcWasCalled = true
		input.Arg = arg
		input.FlagLines = lines
		return nil
	}

	// Case: simple mkdir
	os.Args = []string{"pfda", "head", "testfile.txt", "--key", "AUTH_KEY"}
	returnCode := runMainInternal(false)
	test.Equals(t, 0, returnCode)
	test.Equals(t, true, funcWasCalled)
	test.Equals(t, "testfile.txt", *input.Arg)
	test.Equals(t, 10, input.FlagLines)
	reset()

	// Case: mkdir with multiple args
	os.Args = []string{"pfda", "head", "testfile.txt", "-lines", "222", "--key", "AUTH_KEY"}
	returnCode = runMainInternal(false)
	test.Equals(t, 0, returnCode)
	test.Equals(t, true, funcWasCalled)
	test.Equals(t, "testfile.txt", *input.Arg)
	test.Equals(t, 222, input.FlagLines)
	reset()
}

func TestInvokeCat(t *testing.T) {
	oldArgs := os.Args
	defer func() { os.Args = oldArgs }()

	var funcWasCalled = false
	input := &InputFlags{}
	var reset = func() {
		funcWasCalled = false
		input.Reset()
	}

	invokeCat = func(client precisionfda.IPFDAClient, arg *string) error {
		funcWasCalled = true
		input.Arg = arg
		input.FlagLines = -1
		return nil
	}

	// Case: simple mkdir
	os.Args = []string{"pfda", "cat", "testfile.txt", "--key", "AUTH_KEY"}
	returnCode := runMainInternal(false)
	test.Equals(t, 0, returnCode)
	test.Equals(t, true, funcWasCalled)
	test.Equals(t, "testfile.txt", *input.Arg)
	test.Equals(t, -1, input.FlagLines)
	reset()

}
