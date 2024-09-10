// PrecisionFDA CLI
// Version 2.7.1
package main

import (
	"crypto/tls"
	"encoding/json"
	"flag"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"runtime"
	"strconv"
	"strings"

	_ "crypto/tls/fipsonly"
	"dnanexus.com/precision-fda-cli/helpers"
	"dnanexus.com/precision-fda-cli/precisionfda"
	"rsc.io/goversion/version"
)

// CONSTANTS
const defaultNumRoutines = 10
const defaultChunkSize = 1 << 26 // default 64MB (min. 16MB)
const defaultSkipVerify = "false"
const usageString = `
****************************
PFDA COMMAND LINE TOOL v2.7.1
****************************

All available commands:
   pfda cat
   pfda describe
   pfda download
   pfda get-scope
   pfda head
   pfda ls
   pfda ls-apps
   pfda ls-assets
   pfda ls-discussions
   pfda ls-executions
   pfda ls-members
   pfda ls-spaces
   pfda ls-workflows
   pfda mkdir
   pfda rm
   pfda rmdir
   pfda upload-asset
   pfda upload-file
   pfda view-link

Command specific help section with description, examples and available flags:
   pfda <COMMAND> -help

To print version info and exit:
   pfda -version

Full documentation can be found in the Docs section of the precisionFDA website - https://precision.fda.gov/docs/cli
`

//
// N.B. the -cmd flag exists and is now deprecated, but the following should all work
//
// # Testing upload to localhost
// $ ./pfda upload-file -server localhost:3000 -skipverify true -key $KEY -file fileYouWantToUpload.pdf
// $ ./pfda -cmd upload-file -server localhost:3000 -skipverify true -key $KEY -file fileYouWantToUpload.pdf
//
// # Testing download from localhost
// $ ./pfda download -server localhost:3000 -skipverify true -key $KEY -file file-yourfileuuid-1
// $ ./pfda -cmd download -server localhost:3000 -skipverify true -key $KEY -file file-yourfileuuid-1
//
// # Testing the API for file download
// $ ./pfda api -server localhost:3000 -skipverify true -key $KEY -route "files/file-G70fbKj0qp9YGkg24kGxQvF4-1/download" -json '{ "format": "json" }'
// $ ./pfda -cmd api -server localhost:3000 -skipverify true -key $KEY -route "files/file-G70fbKj0qp9YGkg24kGxQvF4-1/download" -json '{ "format": "json" }'

// GLOBAL VARIABLES
var defaultURL = "precision.fda.gov"

// these varaibles are populated by -ldflags -X command line options
var (
	commitID  string
	Version   string
	BuildTime string
	OsArch    string
)

// ACTION FUNCTIONS
// Wrapping calls to pfdaclient allow us to replace these functions in pfda_test.go with mocks
var invokeUploadFile = func(client precisionfda.IPFDAClient, inputFilePath *string, folderID *string, spaceID *string, inputChunkSize *int, inputNumRoutines *int) error {
	client.SetChunkSize(*inputChunkSize)
	client.SetNumRoutines(*inputNumRoutines)
	return client.UploadFile(*inputFilePath, *folderID, *spaceID, true)
}

var invokeUploadStdinFile = func(client precisionfda.IPFDAClient, fileName *string, folderID *string, spaceID *string, inputChunkSize *int, inputNumRoutines *int) error {
	client.SetChunkSize(*inputChunkSize)
	client.SetNumRoutines(*inputNumRoutines)
	return client.UploadStdin(*fileName, *folderID, *spaceID, true)

}

var invokeUploadMultipleFiles = func(client precisionfda.IPFDAClient, filePaths *[]string, folderID *string, spaceID *string, inputChunkSize *int, inputNumRoutines *int) error {
	client.SetChunkSize(*inputChunkSize)
	client.SetNumRoutines(*inputNumRoutines)
	return client.UploadMultipleFiles(*filePaths, *folderID, *spaceID)
}

var invokeUploadFolder = func(client precisionfda.IPFDAClient, inputPath *string, folderID *string, spaceID *string, inputChunkSize *int, inputNumRoutines *int) error {
	client.SetChunkSize(*inputChunkSize)
	client.SetNumRoutines(*inputNumRoutines)
	return client.UploadFolder(*inputPath, *folderID, *spaceID)
}

var invokeUploadAsset = func(client precisionfda.IPFDAClient, assetFolderPath *string, assetName *string, readmeFilePath *string, inputChunkSize *int, inputNumRoutines *int) error {
	client.SetChunkSize(*inputChunkSize)
	client.SetNumRoutines(*inputNumRoutines)
	return client.UploadAsset(*assetFolderPath, *assetName, *readmeFilePath)
}

var invokeDownload = func(client precisionfda.IPFDAClient, args *[]string, folderID *string, spaceID *string, public bool, recursive bool, outputFilePath *string, overwriteFile *string) error {
	return client.Download(*args, *folderID, *spaceID, public, recursive, *outputFilePath, *overwriteFile)
}

var invokeFileViewLink = func(client precisionfda.IPFDAClient, fileID *string, preauthenticated bool, duration int64) error {
	return client.FileViewLink(*fileID, preauthenticated, duration)
}

var invokeUploadResources = func(client precisionfda.IPFDAClient, args *[]string, portalID *string) error {
	return client.UploadResources(*args, *portalID)
}

var invokeDescribe = func(client precisionfda.IPFDAClient, entityID *string, entityType string) error {
	return client.DescribeEntity(*entityID, entityType)
}

var invokeLsSpaces = func(client precisionfda.IPFDAClient, flags map[string]bool) error {
	return client.LsSpaces(flags)
}

var invokeListing = func(client precisionfda.IPFDAClient, folderID *string, spaceID *string, flags map[string]bool) error {
	return client.Ls(*folderID, *spaceID, flags)
}

var invokeLsApps = func(client precisionfda.IPFDAClient, spaceID *string, flags map[string]bool) error {
	return client.LsApps(*spaceID, flags)
}

var invokeLsAssets = func(client precisionfda.IPFDAClient, spaceID *string, flags map[string]bool) error {
	return client.LsAssets(*spaceID, flags)
}

var invokeLsWorkflows = func(client precisionfda.IPFDAClient, spaceID *string, flags map[string]bool) error {
	return client.LsWorkflows(*spaceID, flags)
}

var invokeLsExecutions = func(client precisionfda.IPFDAClient, spaceID *string, flags map[string]bool) error {
	return client.LsExecutions(*spaceID, flags)
}

var invokeLsMembers = func(client precisionfda.IPFDAClient, spaceID *string) error {
	return client.LsMembers(*spaceID)
}

var invokeLsDiscussions = func(client precisionfda.IPFDAClient, spaceID *string) error {
	return client.LsDiscussions(*spaceID, map[string]bool{})
}

var invokeMkdir = func(client precisionfda.IPFDAClient, names *[]string, folderID *string, spaceID *string, parents bool) error {
	return client.Mkdir(*names, *folderID, *spaceID, parents)
}

var invokeRmdir = func(client precisionfda.IPFDAClient, args *[]string) error {
	return client.Rmdir(*args)
}

var invokeRm = func(client precisionfda.IPFDAClient, args *[]string, folderID *string, spaceID *string) error {
	return client.Rm(*args, *folderID, *spaceID)
}

var invokeHead = func(client precisionfda.IPFDAClient, arg *string, lines int) error {
	return client.Head(*arg, lines)
}

var invokeCat = func(client precisionfda.IPFDAClient, arg *string) error {
	// reusing head command with unreachable limit
	return client.Head(*arg, -1)
}

var invokeGetScope = func(client precisionfda.IPFDAClient) error {
	return client.GetScope()
}

var invokeRefreshToken = func(client precisionfda.IPFDAClient, autoRefresh bool) (string, error) {
	return client.RefreshToken(autoRefresh)
}

var invokeGetLatestVersion = func(client precisionfda.IPFDAClient) (string, error) {
	return client.GetLatestVersion()
}

func main() {
	returnCode := mainInternal()
	os.Exit(returnCode)
}

func mainInternal() int {
	// This isn't necessary for the CLI to run correctly, but we define command line flags
	// inside mainInternal so that they can be unit tested
	flag.CommandLine = flag.NewFlagSet(os.Args[0], flag.ExitOnError)

	command := flag.String("cmd", "", "[Deprecated - please use the format ./pfda <cmd>] Command to execute.")
	authKey := flag.String("key", "", "Authorization key. Required if a previous config doesn't exist.")
	apiRoute := flag.String("route", "", "Name of precisionFDA API route to call.")
	jsonInput := flag.String("json-payload", "", "JSON payload for specified API call (if any).")
	inputFilePath := flag.String("file", "", "Path to file for 'upload-file'")
	assetFolderPath := flag.String("root", "", "Path to root folder for 'upload-asset'")
	fileName := flag.String("name", "", "Name of uploaded file.")
	readmeFilePath := flag.String("readme", "", "Readme file for uploaded asset. Must end with '.txt' or '.md'.")
	fileID := flag.String("file-id", "", "File ID of the file to be downloaded")
	appID := flag.String("app-id", "", "App ID of the app to be described")
	workflowID := flag.String("workflow-id", "", "Workflow ID of the workflow to be described")
	folderID := flag.String("folder-id", "", "Folder ID of the target folder")
	spaceID := flag.String("space-id", "", "Space ID of the target space")
	portalID := flag.String("portal-id", "", "Slug or ID of the target portal")
	outputFilePath := flag.String("output", "", "[optional] File path to write api call response data. Defaults to stdout.")
	inputChunkSize := flag.Int("chunksize", defaultChunkSize, "[optional] Size of each upload chunk in bytes (Min 5MB,/Max 2GB).")
	inputNumRoutines := flag.Int("threads", defaultNumRoutines, "[optional] Maximum number of upload threads to spawn (Max 100).")
	server := flag.String("server", defaultURL, "[optional] Server to connect and make requests to.")
	skipVerify := flag.String("skipverify", defaultSkipVerify, "[optional] Boolean string to skip certificate verification.")
	pfda_version := flag.Bool("version", false, "[optional] Print version")

	// help flag - does not run any command just prints help info
	flagHelp := flag.Bool("help", false, "[optional] Print help info for the particular command")
	flagHelpShort := flag.Bool("h", false, "[optional] Print help info for the particular command") // is there a better way to have aliases ??

	// optional flags for adjusting the desired output values, format and behavior
	flagBrief := flag.Bool("brief", false, "[optional] Only present brief info")
	flagJson := flag.Bool("json", false, "[optional] Present result as JSON")
	flagFilesOnly := flag.Bool("files", false, "[optional] Only present files")
	flagFoldersOnly := flag.Bool("folders", false, "[optional] Only present folders")
	flagPublic := flag.Bool("public", false, "[optional] Only present public scope")
	flagMe := flag.Bool("me", false, "[optional] Only present private scope")
	flagLocked := flag.Bool("locked", false, "[optional] Only present locked spaces")
	flagUnactivated := flag.Bool("unactivated", false, "[optional] Only present unactivated spaces")
	flagProtected := flag.Bool("protected", false, "[optional] Only present protected spaces")
	flagGroups := flag.Bool("groups", false, "[optional] Only present groups spaces")
	flagReview := flag.Bool("review", false, "[optional] Only present review spaces")
	flagPrivate := flag.Bool("private", false, "[optional] Only present private spaces")
	flagAdministrator := flag.Bool("administrator", false, "[optional] Only present administrator spaces")
	flagGovernment := flag.Bool("government", false, "[optional] Only present government spaces")
	flagOverwriteFile := flag.String("overwrite", "", "[optional] Preselect overwrite option what to do with already existing file.")
	flagRecursive := flag.Bool("recursive", false, "[optional] Recurse into a directory.")
	flagRecursiveShort := flag.Bool("r", false, "[optional] Recurse into a directory.")
	flagParents := flag.Bool("parents", false, "[optional] No error if existing, make parent directories as needed")
	flagParentsShort := flag.Bool("p", false, "[optional] No error if existing, make parent directories as needed")
	flagLines := flag.Int("lines", 10, "[optional] Number of lines to print, default 10")
	flagPreauthenticated := flag.Bool("auth", false, "[optional] Use preauthenticated URL for viewing file")
	flagDuration := flag.Int64("duration", 86_400, "[optional] Time to live for preauthenticated URL in seconds")

	// Support for ./pfda upload-file option of specifying a command, making -cmd optional
	var positionalCmd string
	var args []string
	var index int
	if len(os.Args) > 1 && !strings.HasPrefix(os.Args[1], "-") {
		// Storing first positional arg after ./pfda
		positionalCmd = os.Args[1]
		// check possible non-flag args
		args, index = helpers.ParseArgsUntilFlag(os.Args)
		flag.CommandLine.Parse(os.Args[index:])

	} else {
		flag.Parse()
	}

	if *command != "" {
		fmt.Println("\nWARNING! THIS SYNTAX IS BEING DEPRECATED. PLEASE USE THE FOLLOWING SYNTAX INSTEAD: ./pfda <command> <args> \n")
	}

	if positionalCmd != "" {
		if *command != "" {
			return helpers.ErrorFromString("Error input >>> both positional command and -cmd option specified. Please remove one or the other", *flagJson)
		}
		*command = positionalCmd
	}

	// always check if config != nil
	config, configErr := helpers.GetConfig()
	if configErr != nil {
		if !os.IsNotExist(configErr) {
			return helpers.ErrorFromError(configErr, *flagJson)
		}
	}

	serverURL := defaultURL
	if *server != "" && *server != defaultURL {
		serverURL = *server
	} else if config != nil && config.Server != "" {
		serverURL = config.Server
	}

	pfdaclient := precisionfda.NewPFDAClient(serverURL)
	pfdaclient.Platform = OsArch
	pfdaclient.JsonResponse = *flagJson

	skipVerifyBool, _ := strconv.ParseBool(*skipVerify)
	transport := pfdaclient.Client.HTTPClient.Transport.(*http.Transport)
	if skipVerifyBool {
		// Setting '-skipverify' true will allow devs to connect to local instances with self-signed certs
		transport.TLSClientConfig = &tls.Config{InsecureSkipVerify: true, ServerName: *server}
	} else {
		transport.TLSClientConfig = &tls.Config{MinVersion: tls.VersionTLS12}
	}

	if *pfda_version {
		printInfo(pfdaclient)
		checkLatestVersion(pfdaclient)
		return 0
	}

	recursive := *flagRecursive || *flagRecursiveShort
	parents := *flagParents || *flagParentsShort
	help := *flagHelp || *flagHelpShort

	if !help && *command != "" {
		// Set AuthKey based on provided authKey or from config.
		pfdaclient.AuthKey = *authKey
		if *authKey == "" {
			if config == nil {
				return helpers.ErrorFromString("Missing authorization key - could not find config file and no key was provided with the command.", *flagJson)
			}
			pfdaclient.AuthKey = config.Key
		}

		// Set spaceID from config if it's not provided and neither flagMe nor flagPublic is set.
		if *spaceID == "" && !*flagMe && !*flagPublic {
			if config != nil {
				*spaceID = config.GetSpaceId()
			}
		}
	}

	switch *command {
	case "upload-asset":
		if help {
			return helpers.PrintUploadAssetHelp()
		}

		if *assetFolderPath == "" {
			return helpers.ErrorFromString("Root directory for the asset is required - provide it as [-root <ASSET_ROOT>]", *flagJson)
		}

		f, err := os.Stat(*assetFolderPath)
		if os.IsNotExist(err) || !f.IsDir() {
			return helpers.ErrorFromString(fmt.Sprintf("Input asset folder path '%s' does not exist or is not a directory", *assetFolderPath), *flagJson)
		}

		if *fileName == "" {
			return helpers.ErrorFromString("Asset name (ending with .tar or .tar.gz) is required - provide it as [-name <ASSET_NAME>]", *flagJson)
		}

		if !strings.HasSuffix(*fileName, ".tar") && !strings.HasSuffix(*fileName, ".tar.gz") {
			return helpers.ErrorFromString(fmt.Sprintf("input asset name '%s' does not end with '.tar' or '.tar.gz'.", *fileName), *flagJson)
		}

		if *readmeFilePath == "" {
			return helpers.ErrorFromString("Readme file for the asset (ending with .txt or .md) is required - provide it as [-readme <ASSET_README>]", *flagJson)
		}

		f, err = os.Stat(*readmeFilePath)
		if os.IsNotExist(err) || f.IsDir() {
			return helpers.ErrorFromString(fmt.Sprintf("Input readme file path '%s' does not exist or is a directory", *readmeFilePath), *flagJson)
		}

		err = invokeUploadAsset(pfdaclient, assetFolderPath, fileName, readmeFilePath, inputChunkSize, inputNumRoutines)
		if err != nil {
			return helpers.ErrorFromError(err, *flagJson)
		}

	case "upload-file":
		if help {
			return helpers.PrintUploadFileHelp()
		}

		stdinData := false
		stdinFile := os.Stdin

		fi, _ := os.Stdin.Stat()
		if (fi.Mode() & os.ModeCharDevice) == 0 {
			stdinData = true
		}

		// if -file flag used, override args.
		if *inputFilePath != "" {
			args = []string{*inputFilePath}
		}

		// STDIN upload logic
		if len(args) == 0 && stdinData {
			if *fileName == "" {
				return helpers.ErrorFromString("Filename for stdin input is required - provide it as [-name <FILE_NAME>]", *flagJson)
			}
			err := invokeUploadStdinFile(pfdaclient, fileName, folderID, spaceID, inputChunkSize, inputNumRoutines)
			if err != nil {
				return helpers.ErrorFromError(err, *flagJson)

			}
			defer stdinFile.Close()
			break
		}

		if len(args) != 0 && stdinData {
			return helpers.ErrorFromString("Cannot combine multiple file sources - use either args or stdin", *flagJson)
		}

		if len(args) == 0 {
			return helpers.ErrorFromString("Path for upload is required - provide it as an argument or stdin", *flagJson)
		}

		if *fileName != "" && !*flagJson {
			fmt.Println(">> Filename flag ignored for upload")
		}

		// uploading more than one file/folder
		if len(args) > 1 {
			err := invokeUploadMultipleFiles(pfdaclient, &args, folderID, spaceID, inputChunkSize, inputNumRoutines)
			if err != nil {
				return helpers.ErrorFromError(err, *flagJson)
			}
			// just one file/folder to upload
		} else {
			path := filepath.Clean(args[0])
			f, err := os.Stat(path)
			if os.IsNotExist(err) {
				return helpers.ErrorFromString(fmt.Sprintf("Input path '%s' does not exist", path), *flagJson)
			}

			if f.IsDir() {
				err = invokeUploadFolder(pfdaclient, &path, folderID, spaceID, inputChunkSize, inputNumRoutines)
				if err != nil {
					return helpers.ErrorFromError(err, *flagJson)

				}
			} else {
				if *inputChunkSize == defaultChunkSize {
					// if chunkSize was not set by user, calculate it based on file size
					*inputChunkSize = helpers.CalculateChunkSize(f.Size(), pfdaclient.MinChunkSize)
				}
				err = invokeUploadFile(pfdaclient, &path, folderID, spaceID, inputChunkSize, inputNumRoutines)
				if err != nil {
					return helpers.ErrorFromError(err, *flagJson)
				}
			}
		}

	case "download":
		if help {
			return helpers.PrintDownloadHelp()
		}

		if *fileID == "" && *folderID == "" && *spaceID == "" && len(args) == 0 {
			return helpers.ErrorFromString("File ID or name of the file to be downloaded is required: [-file-id <FILE_ID>]\n  Or provide either of Space and/or Folder ID you want to bulk-download: [-folder-id <FOLDER_ID> -space-id <SPACE_ID>]", *flagJson)
		}

		if *fileID != "" && *folderID != "" {
			return helpers.ErrorFromString("Cannot combine file-id and folder-id flags", *flagJson)
		}

		// we need tri-state as there is different behavior for -overwrite=false and completely omitted -overwrite flag
		validOverwrite := map[string]bool{"": true, "true": true, "false": true}
		if !validOverwrite[*flagOverwriteFile] {
			return helpers.ErrorFromString("Invalid value for -overwrite flag - acceptable values are true, false, or omit it completely", *flagJson)
		}

		// Override args with -file-id if provided
		if *fileID != "" {
			args = []string{*fileID}
		}

		err := invokeDownload(pfdaclient, &args, folderID, spaceID, *flagPublic, recursive, outputFilePath, flagOverwriteFile)
		if err != nil {
			return helpers.ErrorFromError(err, *flagJson)
		}

	case "view-link":
		if help {
			return helpers.PrintViewLinkHelp()
		}

		if len(args) == 0 {
			return helpers.ErrorFromString("File ID is required", *flagJson)
		}

		if !helpers.IsFileId(args[0]) {
			return helpers.ErrorFromString(fmt.Sprintf("File ID '%s' is invalid", args[0]), *flagJson)
		}

		err := invokeFileViewLink(pfdaclient, &args[0], *flagPreauthenticated, *flagDuration)
		if err != nil {
			return helpers.ErrorFromError(err, *flagJson)
		}

	case "describe-app":

		fmt.Println("\nWARNING! THIS COMMAND IS BEING DEPRECATED. PLEASE USE THE FOLLOWING SYNTAX INSTEAD: ./pfda describe <APP_ID>")

		if help {
			return helpers.PrintDescribeAppHelp()
		}

		if *appID != "" {
			args = []string{*appID}
		}

		if len(args) == 0 {
			return helpers.ErrorFromString("App ID is required", *flagJson)
		}

		err := invokeDescribe(pfdaclient, &args[0], "app")
		if err != nil {
			return helpers.ErrorFromError(err, *flagJson)
		}

	case "describe":

		if help {
			return helpers.PrintDescribeHelp()
		}

		if len(args) == 0 {
			return helpers.ErrorFromString("Entity ID is required", *flagJson)
		}

		entityType, entityId := helpers.ParseEntityType(args[0])
		if entityType == "" {
			return helpers.ErrorFromString(fmt.Sprintf("Invalid entity type '%s' - must be one of: app, job, file, worklfow, discussion.", args[0]), *flagJson)
		}
		if entityType == "discussion" {
			args[0] = entityId
		}
		err := invokeDescribe(pfdaclient, &args[0], entityType)
		if err != nil {
			return helpers.ErrorFromError(err, *flagJson)
		}

	case "upload-resource":
		if help {
			return helpers.PrintUploadResourceHelp()
		}

		if len(args) == 0 {
			return helpers.ErrorFromString("Path to the resource(s) is required", *flagJson)
		}

		if *portalID == "" {
			return helpers.ErrorFromString("Portal ID is required", *flagJson)
		}

		err := invokeUploadResources(pfdaclient, &args, portalID)
		if err != nil {
			return helpers.ErrorFromError(err, *flagJson)
		}

	case "describe-workflow":

		fmt.Println("\nWARNING! THIS COMMAND IS BEING DEPRECATED. PLEASE USE THE FOLLOWING SYNTAX INSTEAD: ./pfda describe <WORKFLOW_ID>")

		if help {
			return helpers.PrintDescribeWorkflowHelp()
		}

		if *workflowID != "" {
			args = []string{*workflowID}
		}

		if len(args) == 0 {
			return helpers.ErrorFromString("Workflow ID is required", *flagJson)
		}

		err := invokeDescribe(pfdaclient, &args[0], "workflow")
		if err != nil {
			return helpers.ErrorFromError(err, *flagJson)
		}

	case "ls-apps":
		if help {
			return helpers.PrintLsAppsHelp()
		}

		flags := map[string]bool{}

		if *flagPublic {
			flags["public_scope"] = true
		}

		err := invokeLsApps(pfdaclient, spaceID, flags)
		if err != nil {
			return helpers.ErrorFromError(err, *flagJson)
		}

	case "ls-assets":
		if help {
			return helpers.PrintLsAssetsHelp()
		}

		flags := map[string]bool{}
		if *flagPublic {
			flags["public_scope"] = true
		}

		err := invokeLsAssets(pfdaclient, spaceID, flags)
		if err != nil {
			return helpers.ErrorFromError(err, *flagJson)
		}
	case "ls-workflows":
		if help {
			return helpers.PrintLsWorkflowsHelp()
		}

		flags := map[string]bool{}
		if *flagPublic {
			flags["public_scope"] = true
		}

		err := invokeLsWorkflows(pfdaclient, spaceID, flags)
		if err != nil {
			return helpers.ErrorFromError(err, *flagJson)
		}

	case "ls-executions":
		if help {
			return helpers.PrintLsExecutionsHelp()
		}

		flags := map[string]bool{}
		if *flagPublic {
			flags["public_scope"] = true
		}

		err := invokeLsExecutions(pfdaclient, spaceID, flags)
		if err != nil {
			return helpers.ErrorFromError(err, *flagJson)

		}

	case "ls-spaces", "list-spaces":
		if help {
			return helpers.PrintLsSpacesHelp()
		}

		flags := map[string]bool{
			// state of space, must be exclusive
			"locked":      *flagLocked,
			"unactivated": *flagUnactivated,
			// types of space flag, multiple allowed
			"protected":     *flagProtected,
			"review":        *flagReview,
			"groups":        *flagGroups,
			"private_type":  *flagPrivate,
			"administrator": *flagAdministrator,
			"government":    *flagGovernment,
			// present as JSON / pretty print
			"json": *flagJson,
		}
		err := invokeLsSpaces(pfdaclient, flags)
		if err != nil {
			return helpers.ErrorFromError(err, *flagJson)
		}

	case "ls-members":
		if help {
			return helpers.PrintLsMembersHelp()
		}

		if *spaceID != "" {
			args = []string{*spaceID}
		}
		if len(args) == 0 {
			return helpers.ErrorFromString("Space ID is required", *flagJson)
		}

		err := invokeLsMembers(pfdaclient, &args[0])
		if err != nil {
			return helpers.ErrorFromError(err, *flagJson)
		}

	case "ls-discussions":
		if help {
			return helpers.PrintLsDiscussionsHelp()
		}

		if *spaceID != "" {
			args = []string{*spaceID}
		}

		if len(args) == 0 {
			return helpers.ErrorFromString("Space ID is required", *flagJson)
		}

		if len(args) != 1 {
			return helpers.ErrorFromString("Only one space ID is allowed", *flagJson)
		}

		err := invokeLsDiscussions(pfdaclient, &args[0])
		if err != nil {
			return helpers.ErrorFromError(err, *flagJson)

		}

	case "ls":
		if help {
			return helpers.PrintLsHelp()
		}

		if *flagFilesOnly && *flagFoldersOnly {
			return helpers.ErrorFromString("The flags '-folders' and '-files' cannot be used together - use only one of these flags.", *flagJson)
		}

		flags := map[string]bool{
			"brief":        *flagBrief,
			"files_only":   *flagFilesOnly,
			"folders_only": *flagFoldersOnly,
			// present as JSON / pretty print
			"json": *flagJson,
		}

		if *flagPublic {
			flags["public_scope"] = true
		}

		err := invokeListing(pfdaclient, folderID, spaceID, flags)
		if err != nil {
			return helpers.ErrorFromError(err, *flagJson)
		}

	case "mkdir":
		if help {
			return helpers.PrintMkdirHelp()
		}
		err := invokeMkdir(pfdaclient, &args, folderID, spaceID, parents)
		if err != nil {
			return helpers.ErrorFromError(err, *flagJson)
		}

	case "rmdir":
		if help {
			return helpers.PrintRmdirHelp()
		}
		err := invokeRmdir(pfdaclient, &args)
		if err != nil {
			return helpers.ErrorFromError(err, *flagJson)
		}

	case "rm":
		if help {
			return helpers.PrintRmHelp()
		}
		err := invokeRm(pfdaclient, &args, folderID, spaceID)
		if err != nil {
			return helpers.ErrorFromError(err, *flagJson)
		}

	case "head":
		if help {
			return helpers.PrintHeadHelp()
		}
		err := invokeHead(pfdaclient, &args[0], *flagLines)
		if err != nil {
			return helpers.ErrorFromError(err, *flagJson)
		}

	case "cat":
		if help {
			return helpers.PrintCatHelp()
		}
		err := invokeCat(pfdaclient, &args[0])
		if err != nil {
			return helpers.ErrorFromError(err, *flagJson)
		}

	case "get-scope":
		if help {
			return helpers.PrintGetScopeHelp()
		}

		err := invokeGetScope(pfdaclient)
		if err != nil {
			return helpers.ErrorFromError(err, *flagJson)
		}

	case "refresh-key":
		// add option for auto-refresh later
		newToken, err := invokeRefreshToken(pfdaclient, false)
		if err != nil {
			return helpers.ErrorFromString("There was an error during key refresh action, please provide new Key from precisionFDA website", *flagJson)
		}

		if configErr != nil {
			return helpers.ErrorFromString(fmt.Sprintf("Could not save authorization key in config file '%s': %s", helpers.ConfigPath, err.Error()), *flagJson)
		}

		config.Key = newToken
		helpers.SaveConfig(config, *flagJson)
		return 0

	case "api":
		if *apiRoute == "" {
			return helpers.ErrorFromString("API route is required - provide it as '-route <API_ROUTE_NAME>'.", *flagJson)
		}

		if *jsonInput != "" && !isValidJSON(*jsonInput) {
			return helpers.ErrorFromString(fmt.Sprintf("Provided JSON '%s' is not valid - provide the input in valid JSON format.", *jsonInput), *flagJson)
		}

		err := pfdaclient.CallAPI(*apiRoute, *jsonInput, *outputFilePath)
		if err != nil {
			return helpers.ErrorFromError(err, *flagJson)
		}

	case "":
		// Empty command
		fmt.Println(usageString)
		checkLatestVersion(pfdaclient)
		return 0

	default:
		// Invalid, non-empty command
		// both 'upload-resource' and 'refresh-key' are intentionally omitted.
		return helpers.ErrorFromString(fmt.Sprintf("Command '%s' not found. Must be one of: \n'cat' \n'describe' \n'download' \n'get-scope' \n'head' \n'ls' \n'ls-apps' \n'ls-assets' \n'ls-executions' \n'ls-members' \n'ls-discussions' \n'ls-spaces' \n'ls-workflows' \n'mkdir' \n'rm' \n'rmdir' \n'upload-asset' \n'upload-file' \n'view-link'\n", *command), *flagJson)
	}

	// Write configuration and save key
	if *authKey != "" {
		if configErr != nil && os.IsNotExist(configErr) {
			config = helpers.CreateConfig()
		}
		config.Key = *authKey
		helpers.SaveConfig(config, *flagJson)
	}

	return 0
}

// PRINT FUNCTIONS
func printInfo(pfdaclient *precisionfda.PFDAClient) {
	fmt.Printf("\npFDA CLI Info\n")
	fmt.Printf("  Commit ID   :    %s\n", commitID)
	fmt.Printf("  CLI Version :    %s\n", Version)
	fmt.Printf("  Os/Arch     :    %s\n", OsArch)
	fmt.Printf("  Build Time  :    %s\n", BuildTime)
	fmt.Printf("  Go Version  :    %s\n", runtime.Version())

	transport := pfdaclient.Client.HTTPClient.Transport.(*http.Transport)
	fmt.Printf("  TLS Version :    %s\n", GetTLSVersion(transport))

	// printCryptoInfo()
}

func checkLatestVersion(pfdaclient *precisionfda.PFDAClient) {
	res, err := invokeGetLatestVersion(pfdaclient)
	if err != nil {
		fmt.Println("Error while checking for latest available version.")
	}
	if res != Version {
		fmt.Printf("\nThere is a newer version available for you to download - v%s \nVisit https://precision.fda.gov/docs/cli to get the latest version!\n", res)
	}
}

func printCryptoInfo() {
	executable, err := os.Executable()
	if err != nil {
		fmt.Println("Unable to retrieve executable path")
	}

	v, err := version.ReadExe(executable)
	if err != nil {
		fmt.Println("Unable to retrieve goversion info")
	}

	// TODO: find a new way to verify the build is FIPS 140-2 compliant.
	if v.FIPSOnly {
		fmt.Println("  FIPS        :    +crypto/tls/fipsonly verified")
	} else {
		fmt.Println("  FIPS        :    warning FIPS mode not verified")
	}
}

func GetTLSVersion(tr *http.Transport) string {
	switch tr.TLSClientConfig.MinVersion {
	case tls.VersionTLS10:
		return "TLS 1.0"
	case tls.VersionTLS11:
		return "TLS 1.1"
	case tls.VersionTLS12:
		return "TLS 1.2"
	case tls.VersionTLS13:
		return "TLS 1.3"
	}
	return "Unknown"
}

func isValidJSON(s string) bool {
	var js interface{}
	return json.Unmarshal([]byte(s), &js) == nil
}
