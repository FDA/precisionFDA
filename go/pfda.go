// PrecisionFDA CLI
// Version 2.1.2
//
//
package main

import (
	"crypto/tls"
	"dnanexus.com/precision-fda-cli/precisionfda"
	"encoding/json"
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"rsc.io/goversion/version"
	"runtime"
	"strconv"
	"strings"
)

import _ "crypto/tls/fipsonly"

//
// CONSTANTS
//
const defaultNumRoutines = 10
const defaultChunkSize = 1<<24  // default 16.8MB (min. 5MB)
const defaultSkipVerify = "false"
const usageString = `

***********************
PFDA COMMAND LINE TOOL v2.1.2
***********************
To upload a file:

  pfda upload-file [--key <KEY>] --file </PATH/TO/FILE> [--folder-id <FOLDER_ID>]

To upload a file to a space:

  pfda upload-file [--key <KEY>] --file </PATH/TO/FILE> [--folder-id <FOLDER_ID>] --space-id 123

To upload an asset:

  pfda upload-asset [--key <KEY>] --name <NAME{.tar,.tar.gz}> --root </PATH/TO/ROOT/FOLDER> --readme <README{.txt,.md}>

To download a file from My Home or from a space you have access to:

  pfda download [--key <KEY>] --file-id <FILE_ID> [--output </PATH/TO/OUTPUT/FILE>]

To call a precisionFDA API route:

  pfda api [--key <KEY>] --route <API_ROUTE> --json <JSON_PAYLOAD> [--output </PATH/TO/OUTPUT/FILE>]

To print version info and exit :

  pfda --version

(--version flag can also be given with --cmd,
then version info is printed before obtaining key and executing command)
`
//
// N.B. the --cmd flag exists and is now deprecated, but the following should all work
//
// # Testing upload to localhost
// $ ./pfda upload-file --server localhost:3000 --skipverify true --key $KEY --file fileYouWantToUpload.pdf
// $ ./pfda --cmd upload-file --server localhost:3000 --skipverify true --key $KEY --file fileYouWantToUpload.pdf
//
// # Testing download from localhost
// $ ./pfda download --server localhost:3000 --skipverify true --key $KEY --file file-yourfileuuid-1
// $ ./pfda --cmd download --server localhost:3000 --skipverify true --key $KEY --file file-yourfileuuid-1
//
// # Testing the API for file download
// $ ./pfda api --server localhost:3000 --skipverify true --key $KEY --route "files/file-G70fbKj0qp9YGkg24kGxQvF4-1/download" --json '{ "format": "json" }'
// $ ./pfda --cmd api --server localhost:3000 --skipverify true --key $KEY --route "files/file-G70fbKj0qp9YGkg24kGxQvF4-1/download" --json '{ "format": "json" }'


//
// GLOBAL VARIABLES
//
var configPath = filepath.Join(getUserHomeDir(), ".pfda_config")
var defaultURL = "precision.fda.gov"

// these varaibles are populated by -ldflags -X command line options
var (
	commitID string
	Version string
	BuildTime string
	OsArch string
)

type jsonConfig struct {
	Key string `json:key`
}

var pfdaclient *precisionfda.PFDAClient


//
//  ACTION FUNCTIONS
//  Wrapping calls to pfdaclient allow us to replace these functions in pfda_test.go with mocks
//
var invokeUploadFile = func(client precisionfda.IPFDAClient, inputFilePath *string, folderID *string, spaceID *string, inputChunkSize *int, inputNumRoutines *int) error {
	client.SetChunkSize(*inputChunkSize)
	client.SetNumRoutines(*inputNumRoutines)
	return client.UploadFile(*inputFilePath, *folderID, *spaceID)
}

var invokeUploadAsset = func(client precisionfda.IPFDAClient, assetFolderPath *string, assetName *string, readmeFilePath *string, inputChunkSize *int, inputNumRoutines *int) error {
	client.SetChunkSize(*inputChunkSize)
	client.SetNumRoutines(*inputNumRoutines)
	return client.UploadAsset(*assetFolderPath, *assetName, *readmeFilePath)
}

var invokeDownloadFile = func(client precisionfda.IPFDAClient, fileID *string, outputFilePath *string) error {
	return client.DownloadFile(*fileID, *outputFilePath)
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
	jsonInput := flag.String("json", "", "JSON payload for specified API call (if any).")
	inputFilePath := flag.String("file", "", "Path to file for 'upload-file'")
	assetFolderPath := flag.String("root", "", "Path to root folder for 'upload-asset'")
	assetName := flag.String("name", "", "Name of uploaded asset file. Must end with '.tar' or '.tar.gz'.")
	readmeFilePath := flag.String("readme", "", "Readme file for uploaded asset. Must end with '.txt' or '.md'.")
	fileID := flag.String("file-id", "", "File ID of the file to be downloaded")
	folderID := flag.String("folder-id", "", "Folder ID of the target folder")
	spaceID := flag.String("space-id", "", "Space ID of the target space")
	outputFilePath := flag.String("output", "", "[optional] File path to write api call response data. Defaults to stdout.")
	inputChunkSize := flag.Int("chunksize", defaultChunkSize, "[optional] Size of each upload chunk in bytes (Min 5MB,/Max 2GB).")
	inputNumRoutines := flag.Int("threads", defaultNumRoutines, "[optional] Maximum number of upload threads to spawn (Max 100).")
	server := flag.String("server", defaultURL, "[optional] Server to connect and make requests to.")
	skipVerify := flag.String("skipverify", defaultSkipVerify, "[optional] Boolean string to skip certificate verification.")
	pfda_version := flag.Bool("version", false, "[optional] Print version")

	// Support for ./pfda upload-file option of specifying a command, making --cmd optional
	var positionalCmd string
	if len(os.Args) > 1 && !strings.HasPrefix(os.Args[1], "-") {
		// Storing first positional arg after ./pfda
		positionalCmd = os.Args[1]
		flag.CommandLine.Parse(os.Args[2:])
	} else {
		flag.Parse()
	}

	if positionalCmd != "" {
		if *command == "" {
			*command = positionalCmd
		} else {
			fmt.Println("Error: both positional command and --cmd option specified. Please remove one or the other")
			return 1
		}
	}

	if *server != "" && *server != defaultURL {
		pfdaclient = precisionfda.NewPFDAClient(*server)
	} else {
		pfdaclient = precisionfda.NewPFDAClient(defaultURL)
	}

	b, err := strconv.ParseBool(*skipVerify)
	if err != nil {
		printError(err)
		return 1
	}

	if b {
		// Setting '--skipverify' true will allow devs to connect to local instances with self-signed certs
		pfdaclient.Client.HTTPClient.Transport.(*http.Transport).TLSClientConfig = &tls.Config{
			InsecureSkipVerify: true,
			ServerName: *server,
		}
	} else {
		pfdaclient.Client.HTTPClient.Transport.(*http.Transport).TLSClientConfig = &tls.Config{
			MinVersion: tls.VersionTLS12,
		}
	}

	// if --version flag was given, print pfda info
	if *pfda_version {
		printInfo(pfdaclient)
		// if only --version without any command , exit
		if *command == "" {
			return 0
		}
	}

	if *authKey == "" {
		// Check config if '-key' not provided
		f, err := ioutil.ReadFile(configPath)
		if err != nil {
			// Internal error reading config
			if !os.IsNotExist(err) {
				fmt.Errorf("Error reading existing config file from path %s: %s\nIf this persists please delete ~/.pfda_config", configPath, err.Error())
				return 1
			}
			// No config exists at ~/.pfda_config
			fmt.Println(usageString)
			flag.Usage()
			return inputError(fmt.Sprintf("Authorization key not provided and configuration file '%s' not found. Please provide it as [--key <KEY>].", configPath))
		}
		var config jsonConfig
		err = json.Unmarshal(f, &config)
		if err != nil {
			printError(err)
			return 1
		}

		pfdaclient.AuthKey = config.Key
	} else {
		// '-key' provided, set AuthKey
		pfdaclient.AuthKey = *authKey
	}

	switch *command {
	case "upload-asset":
		if *assetFolderPath == "" {
			return inputError("Root directory for the asset is required. Provide it as [--root <ASSET_ROOT>].")
		}

		f, err := os.Stat(*assetFolderPath)
		if os.IsNotExist(err) || !f.IsDir() {
			return inputError(fmt.Sprintf("Input asset folder path '%s' does not exist or is not a directory.", *assetFolderPath))
		}

		if *assetName == "" {
			return inputError("Asset name (ending with .tar or .tar.gz) is required. Provide it as [--name <ASSET_NAME>].")
		}

		if !strings.HasSuffix(*assetName, ".tar") && !strings.HasSuffix(*assetName, ".tar.gz")  {
			return inputError(fmt.Sprintf("Input asset name '%s' does not end with '.tar' or '.tar.gz'.", *assetName))
		}

		if *readmeFilePath == "" {
			return inputError("Readme file for the asset (ending with .txt or .md) is required. Provide it as [--readme <ASSET_README>].")
		}

		f, err = os.Stat(*readmeFilePath)
		if os.IsNotExist(err) || f.IsDir() {
			return inputError(fmt.Sprintf("Input readme file path '%s' does not exist or is a directory.", *readmeFilePath))
		}

		err = invokeUploadAsset(pfdaclient, assetFolderPath, assetName, readmeFilePath, inputChunkSize, inputNumRoutines)
		if err != nil {
			printError(err)
			return 1
		}

	case "upload-file":
		if *inputFilePath == "" {
			return inputError("Path to file for upload is required. Please provide it as [--file <FILE_PATH>].")
		}

		f, err := os.Stat(*inputFilePath)
		if os.IsNotExist(err) || f.IsDir() {
			return inputError(fmt.Sprintf("Input file path '%s' does not exist or is a directory.", *inputFilePath))
		}

		err = invokeUploadFile(pfdaclient, inputFilePath, folderID, spaceID, inputChunkSize, inputNumRoutines)
		if err != nil {
			printError(err)
			return 1
		}

	case "download":
		if *fileID == "" {
			return inputError("File ID of the file to be downloaded is required: [--file-id <FILE_ID>]")
		}

		err := invokeDownloadFile(pfdaclient, fileID, outputFilePath)
		if err != nil {
			printError(err)
			return 1
		}

	case "api":
		if *apiRoute == "" {
			return inputError("API route is required. Please provide it as '--route <API_ROUTE_NAME>'.")
		}

		if *jsonInput != "" && !isValidJSON(*jsonInput) {
			return inputError(fmt.Sprintf("Provided JSON '%s' is not valid. Please provide the input in valid JSON format.", *jsonInput))
		}

		err := pfdaclient.CallAPI(*apiRoute, *jsonInput, *outputFilePath)
		if err != nil {
			printError(err)
			return 1
		}

	case "":
		// Empty command
		fmt.Println(usageString)
		flag.Usage()
		fmt.Println("Command to execute is required. Provide it as 'pfda {'upload-file','upload-asset','download','api'}'")
		return 1

	default:
		// Invalid, non-empty command
		fmt.Printf("Command ' %s' not found. Must be one of ['upload-file','upload-asset','download','api'}].\n", *command)
		return 1
	}

	// Write configuration and save key
	if *authKey != "" {
		// If key was given by --key option in the command line
		// marshal it to json and write into .pfda__config
		// if marshaling fails, issue warning and exit
		jsonData, err := json.Marshal(jsonConfig{
			Key: *authKey,
		})
		if err != nil {
			fmt.Printf("While the file has been uploaded succesfully\n, the authorization key can't be marshaled to json and saved in '%s': %s\n", configPath, err.Error())
			fmt.Printf("You will need to submit authorization key in the command line in the next upload.\n")
			// exit gracefully, without panic
			return 0
		}

		// below is a more compact and cleaner implementation which is recommended when writing small files
		// It doesn't use separate Create / Write from os package, as before but takes advantage of
		// ioutil.WriteFile which opens, writes and closes a file in one swoop
		// denote, that it also works on Windows ( checked on AWS EC2 windows instance )
		// despite Linux style file permissions are given
		// if .pfda_config exists it is truncaters before writing
		// denote also there is no need in defer f.Close(), since ioutil.WriteFile closes the file immediately after writing it
		err = ioutil.WriteFile(configPath, jsonData, 0644)  // 0644 is '-rw -r- -r-'
		if err != nil {
			fmt.Printf("Could not save authorization key in config file '%s': %s\n", configPath, err.Error())
		} else {
			fmt.Printf("Saved authorization key in config file '%s'. \nA new key does not need to be provided for 24 hours from the generation time of the provided key.\n", configPath)
		}
	}

	return 0
}

//
//  PRINT FUNCTIONS
//
func printInfo(pfdaclient *precisionfda.PFDAClient) {
	fmt.Printf("\npFDA CLI Info\n")
	fmt.Printf("  Commit ID   :    %s\n", commitID)
	fmt.Printf("  CLI Version :    %s\n", Version)
	fmt.Printf("  Os/Arch     :    %s\n", OsArch)
	fmt.Printf("  Build Time  :    %s\n", BuildTime)
	fmt.Printf("  Go Version  :    %s\n", runtime.Version())

	transport := pfdaclient.Client.HTTPClient.Transport.(*http.Transport)
	fmt.Printf("  TLS Version :    %s\n", GetTLSVersion(transport))

	printCryptoInfo()
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

//
//  HELPER FUNCTIONS
//
func printError(err error) {
	fmt.Println()
	fmt.Println(err)
}

func inputError(msg string) int {
	printError(fmt.Errorf(msg))
	return 1
}

func isValidJSON(s string) bool {
	var js interface{}
	return json.Unmarshal([]byte(s), &js) == nil
}

func getUserHomeDir() string {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		log.Fatal(err)
	}
	return homeDir
}
