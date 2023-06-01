// PrecisionFDA CLI
// Version 2.4
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
const defaultChunkSize = 1 << 24 // default 16.8MB (min. 5MB)
const defaultSkipVerify = "false"
const usageString = `
****************************
PFDA COMMAND LINE TOOL v2.4
****************************

To upload a file:
   pfda upload-file </PATH/TO/FILE> [-key <KEY>] 

To upload a file to a space:
   pfda upload-file </PATH/TO/FILE> [-key <KEY>]

To upload an asset:
   pfda upload-asset -name <NAME{.tar,.tar.gz}> -root </PATH/TO/ROOT/FOLDER> -readme <README{.txt,.md}> [-key <KEY>]

To download a file:
   pfda download <FILE_ID> [-key <KEY>]

To list files:
   pfda ls [-key <KEY>]

To list available spaces:
   pfda list-spaces [-key <KEY>]

To describe an app:
   pfda describe-app <APP_ID> [-key <KEY>]

To describe a workflow:
   pfda describe-workflow <WORKFLOW_ID> [-key <KEY>] 

To create a new folder:
   pfda mkdir <NAME> [-key <KEY>]

To delete a folder:
   pfda rmdir <FOLDER_ID> [-key <KEY>]

To delete a file:
   pfda rm <FILE_ID> [-key <KEY>]

To print content of a file:
   pfda cat <FILE_ID> [-key <KEY>]

To print first 10 lines of a file:
   pfda head <FILE_ID> [-key <KEY>]

To get current space id (on workstation):
   pfda get-space-id [-key <KEY>]

To print version info and exit :
   pfda -version

All available commands:
   pfda describe-app
   pfda describe-workflow
   pfda download
   pfda ls
   pfda list-spaces
   pfda upload-asset
   pfda upload-file
   pfda mkdir
   pfda rmdir
   pfda rm
   pfda head
   pfda cat

Command specific help section with description, examples and available flags:
   pfda <COMMAND> -help

Full documentation can be found in the Docs section of the precisionFDA website - https://precision.fda.gov/docs/cli`

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

var pfdaclient *precisionfda.PFDAClient

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

var invokeDescribe = func(client precisionfda.IPFDAClient, entityID *string, entityType *string) error {
	return client.DescribeEntity(*entityID, *entityType)
}

var invokeListSpaces = func(client precisionfda.IPFDAClient, flags map[string]bool) error {
	return client.ListSpaces(flags)
}

var invokeListing = func(client precisionfda.IPFDAClient, folderID *string, spaceID *string, flags map[string]bool) error {
	return client.Ls(*folderID, *spaceID, flags)
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

	command := flag.String("cmd", "", "[Deprecated - please use the format ./pfda <cmd>] Command to execute. Must be one of ['upload-file','upload-asset','api'].")
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

	if positionalCmd != "" {
		if *command == "" {
			*command = positionalCmd
		} else {
			return helpers.InputError("Error input >>> both positional command and -cmd option specified. Please remove one or the other")
		}
	}

	// always check if config != nil
	config, configErr := helpers.GetConfig()
	if configErr != nil && !os.IsNotExist(configErr) {
		fmt.Println("Error >>> ", configErr)
	}

	if *server != "" && *server != defaultURL {
		pfdaclient = precisionfda.NewPFDAClient(*server)
	} else {
		if config != nil && config.Server != "" {
			pfdaclient = precisionfda.NewPFDAClient(config.Server)
		} else {
			pfdaclient = precisionfda.NewPFDAClient(defaultURL)
		}
	}
	pfdaclient.Platform = OsArch

	b, err := strconv.ParseBool(*skipVerify)
	if err != nil {
		helpers.PrintError(err)
		return 1
	}

	if b {
		// Setting '-skipverify' true will allow devs to connect to local instances with self-signed certs
		pfdaclient.Client.HTTPClient.Transport.(*http.Transport).TLSClientConfig = &tls.Config{
			InsecureSkipVerify: true,
			ServerName:         *server,
		}
	} else {
		pfdaclient.Client.HTTPClient.Transport.(*http.Transport).TLSClientConfig = &tls.Config{
			MinVersion: tls.VersionTLS12,
		}
	}

	// if -version flag was given, print pfda info
	if *pfda_version {
		printInfo(pfdaclient)
		// if only -version without any command , exit
		checkLatestVersion(pfdaclient)
		return 0
	}

	recursive := *flagRecursive || *flagRecursiveShort
	parents := *flagParents || *flagParentsShort
	help := *flagHelp || *flagHelpShort

	if !help && *command != "" {

		if config == nil {
			if *authKey == "" {
				return helpers.InputError("Missing authorization key >>> Could not find config file and no key was provided with the command.")
			}
			pfdaclient.AuthKey = *authKey
		} else {
			if *authKey == "" {
				pfdaclient.AuthKey = config.Key
			} else {
				pfdaclient.AuthKey = *authKey
			}
			if *spaceID == "" {
				if !*flagMe && !*flagPublic {
					*spaceID = config.GetSpaceId()
				}
			}
		}
	}

	switch *command {
	case "upload-asset":
		if help {
			return helpers.PrintUploadAssetHelp()
		}

		if *assetFolderPath == "" {
			return helpers.InputError("Root directory for the asset is required. Provide it as [-root <ASSET_ROOT>].")
		}

		f, err := os.Stat(*assetFolderPath)
		if os.IsNotExist(err) || !f.IsDir() {
			return helpers.InputError(fmt.Sprintf("Input asset folder path '%s' does not exist or is not a directory.", *assetFolderPath))
		}

		if *fileName == "" {
			return helpers.InputError("Asset name (ending with .tar or .tar.gz) is required. Provide it as [-name <ASSET_NAME>].")
		}

		if !strings.HasSuffix(*fileName, ".tar") && !strings.HasSuffix(*fileName, ".tar.gz") {
			return helpers.InputError(fmt.Sprintf("Input asset name '%s' does not end with '.tar' or '.tar.gz'.", *fileName))
		}

		if *readmeFilePath == "" {
			return helpers.InputError("Readme file for the asset (ending with .txt or .md) is required. Provide it as [-readme <ASSET_README>].")
		}

		f, err = os.Stat(*readmeFilePath)
		if os.IsNotExist(err) || f.IsDir() {
			return helpers.InputError(fmt.Sprintf("Input readme file path '%s' does not exist or is a directory.", *readmeFilePath))
		}

		err = invokeUploadAsset(pfdaclient, assetFolderPath, fileName, readmeFilePath, inputChunkSize, inputNumRoutines)
		if err != nil {
			helpers.PrintError(err)
			return 1
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

		if len(args) == 0 && stdinData {
			if *fileName == "" {
				return helpers.InputError("Filename for stdin input is required. Provide it as [-name <FILE_NAME>]")
			}
			err := invokeUploadStdinFile(pfdaclient, fileName, folderID, spaceID, inputChunkSize, inputNumRoutines)
			if err != nil {
				helpers.PrintError(err)
				return 1
			}
			defer stdinFile.Close()
			break
		}

		if len(args) != 0 && stdinData {
			return helpers.InputError("Cannot combine multiple file sources. Use either args or stdin.")
		}

		if len(args) == 0 {
			return helpers.InputError("Path for upload is required. Please provide it as an argument or stdin.")
		}

		if *fileName != "" {
			fmt.Println(">> Filename flag ignored for upload")
		}

		// uploading more than one file/folder
		if len(args) > 1 {
			err = invokeUploadMultipleFiles(pfdaclient, &args, folderID, spaceID, inputChunkSize, inputNumRoutines)
			if err != nil {
				helpers.PrintError(err)
				return 1
			}
			// just one file/folder to upload
		} else {
			path := filepath.Clean(args[0])
			f, err := os.Stat(path)
			if os.IsNotExist(err) {
				return helpers.InputError(fmt.Sprintf("Input path '%s' does not exist.", path))
			}

			if f.IsDir() {
				err = invokeUploadFolder(pfdaclient, &path, folderID, spaceID, inputChunkSize, inputNumRoutines)
				if err != nil {
					helpers.PrintError(err)
					return 1
				}
			} else {
				err = invokeUploadFile(pfdaclient, &path, folderID, spaceID, inputChunkSize, inputNumRoutines)
				if err != nil {
					helpers.PrintError(err)
					return 1
				}
			}
		}

	case "download":
		if help {
			return helpers.PrintDownloadHelp()
		}

		if *fileID == "" && *folderID == "" && *spaceID == "" && len(args) == 0 {
			return helpers.InputError("File ID or name of the file to be downloaded is required: [-file-id <FILE_ID>]\n  Or provide either of Space and/or Folder ID you want to bulk-download: [-folder-id <FOLDER_ID> -space-id <SPACE_ID>]")
		}

		if *fileID != "" && *folderID != "" {
			return helpers.InputError("Cannot combine FileID and folderID flags")
		}

		// we need tri-state as there is different behavior for -overwrite=false and completely ommited -overwrite flag
		if *flagOverwriteFile != "true" && *flagOverwriteFile != "false" && *flagOverwriteFile != "" {
			return helpers.InputError("-overwrite flag only accepts true/false or omit it completely.")
		}

		// if -file-id flag used, override args.
		if *fileID != "" {
			args = []string{*fileID}
		}

		err := invokeDownload(pfdaclient, &args, folderID, spaceID, *flagPublic, recursive, outputFilePath, flagOverwriteFile)
		if err != nil {
			helpers.PrintError(err)
			return 1
		}

	case "describe-app":
		if help {
			return helpers.PrintDescribeAppHelp()
		}

		if *appID != "" {
			args = []string{*appID}
		}

		if len(args) == 0 {
			return helpers.InputError(">> App ID is required.")
		}

		var entityType = "app"
		err := invokeDescribe(pfdaclient, &args[0], &entityType)
		if err != nil {
			helpers.PrintError(err)
			return 1
		}

	case "describe-workflow":
		if help {
			return helpers.PrintDescribeWorkflowHelp()
		}

		if *workflowID != "" {
			args = []string{*workflowID}
		}

		if len(args) == 0 {
			return helpers.InputError(">> Workflow ID is required.")
		}

		var entityType = "workflow"
		err := invokeDescribe(pfdaclient, &args[0], &entityType)
		if err != nil {
			helpers.PrintError(err)
			return 1
		}

	case "list-spaces":
		if help {
			return helpers.PrintListSpacesHelp()
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
		err := invokeListSpaces(pfdaclient, flags)
		if err != nil {
			helpers.PrintError(err)
			return 1
		}

	case "ls":
		if help {
			return helpers.PrintLsHelp()
		}

		if *flagFilesOnly && *flagFoldersOnly {
			return helpers.InputError("Cannot combine -folders and -files flags together. Please choose one of the flags only.")
		}

		flags := map[string]bool{
			"brief":        *flagBrief,
			"files_only":   *flagFilesOnly,
			"folders_only": *flagFoldersOnly,
			// present as JSON / pretty print
			"json": *flagJson,
		}

		if *flagPublic {
			flags["public_scope"] = *flagPublic
		}

		err := invokeListing(pfdaclient, folderID, spaceID, flags)
		if err != nil {
			helpers.PrintError(err)
			return 1
		}

	case "mkdir":
		if help {
			return helpers.PrintMkdirHelp()
		}

		err := invokeMkdir(pfdaclient, &args, folderID, spaceID, parents)
		if err != nil {
			helpers.PrintError(err)
			return 1
		}

	case "rmdir":
		if help {
			return helpers.PrintRmdirHelp()
		}

		err := invokeRmdir(pfdaclient, &args)
		if err != nil {
			helpers.PrintError(err)
			return 1
		}

	case "rm":
		if help {
			return helpers.PrintRmHelp()
		}

		err := invokeRm(pfdaclient, &args, folderID, spaceID)
		if err != nil {
			helpers.PrintError(err)
			return 1
		}

	case "head":
		if help {
			return helpers.PrintHeadHelp()
		}
		err := invokeHead(pfdaclient, &args[0], *flagLines)
		if err != nil {
			helpers.PrintError(err)
			return 1
		}

	case "cat":
		if help {
			return helpers.PrintCatHelp()
		}
		err := invokeCat(pfdaclient, &args[0])
		if err != nil {
			helpers.PrintError(err)
			return 1
		}

	case "get-space-id":
		if help {
			return helpers.PrintGetSpaceIdHelp()
		}

		if config == nil || config.GetSpaceId() == "" {
			// error while getting config or spaceID not set
			fmt.Println("No space detected.")
			return 1
		}
		fmt.Println(config.GetSpaceId())

	case "refresh-key":
		// add option for auto-refresh later
		newToken, err := invokeRefreshToken(pfdaclient, false)
		if err != nil {
			fmt.Printf("There was an error during key refresh action. Please provide new Key from pFDA website.\n")
			return 1
		}

		if configErr != nil {
			fmt.Printf("Could not save authorization key in config file '%s': %s\n", helpers.ConfigPath, err.Error())
			return 1
		}

		config.Key = newToken
		helpers.SaveConfig(config)
		return 0

	case "api":
		if *apiRoute == "" {
			return helpers.InputError("API route is required. Please provide it as '-route <API_ROUTE_NAME>'.")
		}

		if *jsonInput != "" && !isValidJSON(*jsonInput) {
			return helpers.InputError(fmt.Sprintf("Provided JSON '%s' is not valid. Please provide the input in valid JSON format.", *jsonInput))
		}

		err := pfdaclient.CallAPI(*apiRoute, *jsonInput, *outputFilePath)
		if err != nil {
			helpers.PrintError(err)
			return 1
		}

	case "":
		// Empty command
		fmt.Println(usageString)
		checkLatestVersion(pfdaclient)
		return 1

	default:
		// Invalid, non-empty command
		fmt.Printf("Command '%s' not found. Must be one of \n'cat' \n'describe-app' \n'describe-workflow' \n'download' \n'get-space-id' \n'head \n'list-spaces' \n'ls' \n'rm' \n'rmdir' \n'upload-asset' \n'upload-file' \n", *command)
		return 1
	}

	// Write configuration and save key
	if *authKey != "" {
		if configErr != nil && os.IsNotExist(configErr) {
			config = helpers.CreateConfig()
		}
		config.Key = *authKey
		helpers.SaveConfig(config)
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
