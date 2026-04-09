package precisionfda

import (
	"bufio"
	"crypto/md5"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"math"
	"net/url"
	"os"
	"os/exec"
	"path"
	"path/filepath"
	"regexp"
	"runtime"
	"strconv"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"dnanexus.com/precision-fda-cli/helpers"

	"github.com/docker/go-units"
	"github.com/gosuri/uilive"
	"github.com/hashicorp/go-cleanhttp"     // required by go-retryablehttp
	"github.com/hashicorp/go-retryablehttp" // use http libraries from hashicorp for implement retry logic
	"github.com/manifoldco/promptui"
)

const defaultNumRoutines = 10
const defaultChunkSize = 1 << 26 // default 64MB (min. 16MB)
const minRoutines = 1
const maxRoutines = 100
const minChunkSize = 1 << 24    // min. 16MB
const maxChunkSize = 1 << 32    // max. 4GB
const maxFileSize = 5 * 1 << 40 // max. 5TB

// retryablehttp defaults
const maxRetryCount = 5
const minRetryTime = 1  // seconds
const maxRetryTime = 30 // seconds

const https = "https://"

type IPFDAClient interface {
	CallAPI(route string, data string, outputFile string) error
	UploadAsset(rootFolderPath string, name string, readmeFilePath string) error
	Upload(file io.ReadCloser, path string, folderID string, spaceID string, size int64, withProgressBar bool) error
	UploadFile(path string, folderID string, spaceID string, withProgressBar bool) error
	UploadStdin(fileName string, folderID string, spaceID string, withProgressBar bool) error
	UploadFolder(folderPath string, folderID string, spaceID string) error
	UploadMultipleFiles(paths []string, folderID string, spaceID string) error
	DownloadFile(arg string, outputFilePath string, overwrite string) error
	Download(args []string, folderID string, spaceID string, public bool, recursive bool, outputFilePath string, overwrite string) error
	FileViewLink(arg string, preauthenticated bool, ttl int64) error
	UploadResources(args []string, portalID string) error
	DescribeEntity(entityID string) error
	LsSpaces(state string, types []string, protected bool) error
	LsApps(spaceID string, flags map[string]bool) error
	LsAssets(scope string) error
	LsWorkflows(spaceID string, flags map[string]bool) error
	LsExecutions(scope string) error
	Ls(folderID string, spaceID string, flags map[string]bool) error
	LsMembers(spaceID string) error
	LsDiscussions(spaceID string) error
	Mkdir(names []string, folderID string, spaceID string, parents bool) error
	Rmdir(args []string) error
	Rm(args []string, folderID string, spaceID string) error
	Head(arg string, lines int) error
	GetScope() error
	CreateDiscussion(spaceID string, jsonBody string) error
	CreateReply(jsonBody string) error
	EditDiscussion(jsonBody string) error
	EditReply(jsonBody string) error
	SetTags(entityID string, tags []string) error
	SetProperties(entityID string, jsonProperties string) error
	GetDbClusterPassword(dbClusterID string) error
	RotateDbClusterPassword(dbClusterID string) error
	RefreshToken(autoRefresh bool) (string, error)
	GetLatestVersion() (string, error)
	RunApp(appUID string, jsonConfig string) error
	TerminateJob(jobUID string) error
	SetChunkSize(chunkSize int) error
	SetNumRoutines(numRoutines int) error
}

type PFDAClient struct {
	BaseURL         string
	UserAgent       string
	NumRoutines     int
	ChunkSize       int
	MinRoutines     int
	MaxRoutines     int
	MinChunkSize    int
	MaxChunkSize    int
	MaxFileSize     int
	ContinueOnError bool
	JsonResponse    bool

	Client  *retryablehttp.Client
	AuthKey string
}

func NewPFDAClient(serverURL string) *PFDAClient {
	c := PFDAClient{}
	c.BaseURL = https + serverURL
	c.NumRoutines = defaultNumRoutines
	c.ChunkSize = defaultChunkSize
	c.MinRoutines = minRoutines
	c.MaxRoutines = maxRoutines
	c.MinChunkSize = minChunkSize
	c.MaxChunkSize = maxChunkSize
	c.MaxFileSize = maxFileSize
	c.Client = &retryablehttp.Client{
		HTTPClient:   cleanhttp.DefaultClient(),
		RetryWaitMin: minRetryTime * time.Second,
		RetryWaitMax: maxRetryTime * time.Second,
		RetryMax:     maxRetryCount,
		CheckRetry:   retryablehttp.DefaultRetryPolicy,
		Backoff:      retryablehttp.DefaultBackoff,
	}
	c.ContinueOnError = false
	return &c
}

// Wire objects
type jsonID struct {
	ID string `json:"id"`
}

type bulkIDsPayload struct {
	IDs []string `json:"ids"`
}

type jsonChunkInfo struct {
	ID    string `json:"id"`
	Size  int    `json:"size"`
	Index int    `json:"index"`
	Md5   string `json:"md5"`
}

type jsonCreateFilePayload struct {
	Name       string `json:"name"`
	Desc       string `json:"description"`
	FolderID   string `json:"folder_id"`
	Scope      string `json:"scope"`
	ParentType string `json:"parent_type"`
	ParentID   string `json:"parent_id"`
}

type jsonCreateAssetPayload struct {
	Name  string   `json:"name"`
	Desc  string   `json:"description"`
	Paths []string `json:"paths"`
}

type jsonCreateFolderPayload struct {
	Name           string `json:"name"`
	ParentFolderID string `json:"parent_folder_id,omitempty"`
	SpaceID        string `json:"space_id,omitempty"`
}

type jsonRmPayload struct {
	Arg      string `json:"arg"`
	FolderID string `json:"folderId,omitempty"`
	SpaceID  string `json:"spaceId,omitempty"`
	Type     string `json:"type,omitempty"`
}

type uploadChunk struct {
	index int
	data  []byte // slice/ptr
}

type jsonCreateFolderResponse struct {
	Id      int    `json:"id"`
	Path    string `json:"path"`
	Message struct {
		Type string `json:"type"`
	} `json:"message"`
}

// Below were migrated from pfda.go:
//
// COMMAND FUNCTIONS
func (c *PFDAClient) CallAPI(route string, data string, outputFile string) error {
	// sanitize input
	route = strings.ToLower(route)
	url := c.BaseURL + "/api/" + route
	_, body, err := c.makeRequestFail("POST", url, []byte(data))
	if err != nil {
		return err
	}

	if outputFile == "" {
		fmt.Printf("Return response data for API call '%s:\n%s\n", route, string(body))
	} else {
		f, err := os.Create(outputFile)
		if err != nil {
			return err
		}

		defer f.Close()
		bytesWritten, err := f.Write(body)
		if err != nil {
			return err
		}

		fmt.Printf("Downloaded response data for API call: %s (%d bytes) to file '%s'\n", route, bytesWritten, outputFile)
	}
	return nil
}

func (c *PFDAClient) UploadAsset(rootFolderPath string, name string, readmeFilePath string) error {
	createURL := c.BaseURL + "/api/create_asset"
	closeURL := c.BaseURL + "/api/close_asset"

	// Get list of all asset files
	var fileList []string
	assetSize := int64(0)
	err := filepath.Walk(rootFolderPath, func(path string, f os.FileInfo, err error) error {
		if !f.IsDir() {
			relPath, err := filepath.Rel(rootFolderPath, path)
			if err != nil {
				return err
			}
			fileList = append(fileList, relPath)
			assetSize += f.Size()
		}
		return nil
	})
	if err != nil {
		return err
	}

	if assetSize > maxFileSize {
		return fmt.Errorf("Size of asset folder '%s' (%d) exceeds maximum allowed file size(%d)", rootFolderPath, assetSize, maxFileSize)
	}

	if assetSize == 0 {
		return fmt.Errorf("Size of asset folder '%s' is 0 - uploading an empty asset is not allowed", rootFolderPath)
	}

	// Read in the readme all at once
	readmeBuf, err := os.ReadFile(readmeFilePath)
	if err != nil {
		return err
	}

	jsonData, err := json.Marshal(jsonCreateAssetPayload{
		Name:  name,
		Desc:  string(readmeBuf),
		Paths: fileList[:],
	})
	if err != nil {
		return err
	}

	fileID, err := c.createFileID(createURL, jsonData)
	if err != nil {
		return err
	}

	chunkPool := make(chan uploadChunk, c.NumRoutines)
	wg := c.initWaitGroup(fileID, chunkPool, &assetSize, true)

	if !c.JsonResponse {
		fmt.Println(">> Archiving asset...")
	}
	// different approach for WinOS tar command
	if runtime.GOOS == "windows" {
		cmd := exec.Command("tar", "-cf", name, "-C", rootFolderPath, ".")
		if strings.HasSuffix(name, ".tar.gz") {
			cmd = exec.Command("tar", "-czf", name, "-C", rootFolderPath, ".")
		}
		err = cmd.Start()
		if err != nil {
			return err
		}
		err = cmd.Wait()
		if err != nil {
			return err
		}
		tarArchive, err := os.Open(name)
		if err != nil {
			return err
		}
		defer os.Remove(name)
		defer tarArchive.Close()
		c.readAndChunk(tarArchive, chunkPool, &assetSize)
	} else {
		cmd := exec.Command("tar", "-c", "-C", rootFolderPath, ".")
		if strings.HasSuffix(name, ".tar.gz") {
			cmd = exec.Command("tar", "-cz", "-C", rootFolderPath, ".")
		}
		stdout, err := cmd.StdoutPipe()
		err = cmd.Start()
		if err != nil {
			return err
		}
		c.readAndChunk(stdout, chunkPool, &assetSize)
	}
	if !c.JsonResponse {
		fmt.Print(">> Uploading asset |")
	}

	close(chunkPool)
	wg.Wait()

	if !c.JsonResponse {
		fmt.Println(">| Uploaded 100%\n>> Finalizing asset...")
	}
	jsonData, err = json.Marshal(jsonID{
		ID: fileID,
	})
	if err != nil {
		return err
	}

	c.makeRequestFail("POST", closeURL, jsonData)
	assetURL := c.BaseURL + "/home/assets/" + fileID
	if c.JsonResponse {
		helpers.PrettyPrint(struct {
			Url string `json:"url"`
		}{Url: assetURL})
	} else {
		fmt.Println(">> Done! Access your asset at " + assetURL)
	}
	return nil
}

// If folderID is not empty, the file will be uploaded to the specified folder
// If spaceID is empty, the file will be uploaded to the user's home
func (c *PFDAClient) UploadFile(path string, folderID string, spaceID string, withProgressBar bool) error {

	file, err := os.Open(path)
	if err != nil {
		return err
	}
	defer file.Close()

	info, err := file.Stat()
	if err != nil {
		return err
	}

	size := info.Size()
	if size > maxFileSize {
		return fmt.Errorf("Size of file '%s' (%d) exceeds maximum allowed file size(%d)", path, size, maxFileSize)
	}

	if size == 0 {
		return fmt.Errorf("Size of file '%s' is 0 - uploading an empty file is not allowed", path)
	}

	err = c.Upload(&*file, path, folderID, spaceID, size, withProgressBar)
	c.HandleError(err)

	return nil
}

func (c *PFDAClient) UploadStdin(fileName string, folderID string, spaceID string, withProgressBar bool) error {
	// we do not know the size, stdin is buffered stream of data
	size := int64(1)
	// stdin has to be wrapped in those - otherwise not working as expected with linux piping
	stdin := io.NopCloser(bufio.NewReader(os.Stdin))
	err := c.Upload(stdin, fileName, folderID, spaceID, size, withProgressBar)
	c.HandleError(err)
	return nil
}

func (c *PFDAClient) Upload(file io.ReadCloser, path string, folderID string, spaceID string, size int64, withProgressBar bool) error {
	createURL := c.BaseURL + "/api/create_file"
	closeURL := c.BaseURL + "/api/close_file"

	scope, parentType, parentId := "", "", ""
	if spaceID != "" {
		if _, err := strconv.Atoi(spaceID); err != nil {
			return err
		}
		scope = "space-" + spaceID
	}

	dxJobId, isPresent := os.LookupEnv("DX_JOB_ID")
	if isPresent {
		parentType = "Job"
		parentId = dxJobId
	}

	jsonData, err := json.Marshal(jsonCreateFilePayload{
		Name:       filepath.Base(path),
		Desc:       "",
		FolderID:   folderID,
		Scope:      scope,
		ParentType: parentType,
		ParentID:   parentId,
	})
	if err != nil {
		return err
	}

	fileID, err := c.createFileID(createURL, jsonData)
	if err != nil {
		return err
	}

	chunkPool := make(chan uploadChunk, c.NumRoutines)

	if withProgressBar && !c.JsonResponse {
		fmt.Printf(">> Uploading file %s\n", path)
	}

	wg := c.initWaitGroup(fileID, chunkPool, &size, withProgressBar)
	c.readAndChunk(file, chunkPool, &size)

	close(chunkPool)
	c.SetTags(fileID, []string{tagCLI})
	wg.Wait()

	if withProgressBar && !c.JsonResponse {
		fmt.Println(">> Finalizing file...")
	}

	jsonData, err = json.Marshal(jsonID{
		ID: fileID,
	})
	if err != nil {
		return err
	}

	c.makeRequestFail("POST", closeURL, jsonData)
	var finalUrl string
	if spaceID != "" {
		finalUrl = c.BaseURL + "/spaces/" + spaceID + "/files/" + fileID
	} else {
		finalUrl = c.BaseURL + "/home/files/" + fileID
	}

	if c.JsonResponse {
		helpers.PrettyPrint(struct {
			Url string `json:"url"`
		}{Url: finalUrl})
	} else {
		fmt.Println(">> Uploaded: ", path)
	}

	if withProgressBar && !c.JsonResponse {
		fmt.Println(">> Done! Access your file at " + finalUrl)
	}

	return nil
}

func (c *PFDAClient) UploadFolder(folderPath string, folderID string, spaceID string) error {
	folders := make(map[string]string, 20)

	p, _ := filepath.Split(folderPath)
	folders[filepath.Clean(p)] = folderID

	if !c.JsonResponse {
		fmt.Println(">> Uploading content of:", folderPath)
	}

	var fileList []string
	err := filepath.Walk(folderPath, func(currentPath string, f os.FileInfo, err error) error {
		if f.IsDir() {
			parent, _ := filepath.Split(currentPath)
			id, err := c.createNewFolder(filepath.Base(currentPath), folders[filepath.Dir(parent)], spaceID)
			if err != nil {
				return err
			}
			folders[currentPath] = id
		} else {
			fileList = append(fileList, currentPath)
		}
		return nil
	})

	if err != nil {
		return err
	}

	var wg = sync.WaitGroup{}
	maxGoroutines := 4
	guard := make(chan struct{}, maxGoroutines)

	for _, file := range fileList {
		guard <- struct{}{}
		wg.Add(1)
		go func(file string) {
			parent, _ := filepath.Split(file)
			err := c.UploadFile(file, folders[filepath.Dir(parent)], spaceID, false)
			if err != nil {
				helpers.PrintError(err, c.JsonResponse)
			}
			<-guard
			wg.Done()

		}(file)
	}
	wg.Wait()

	var finalUrl string
	if spaceID != "" {
		finalUrl = c.BaseURL + "/spaces/" + spaceID + "/files?folder_id=" + folders[folderPath]
	} else {
		finalUrl = c.BaseURL + "/home/files?folder_id=" + folders[folderPath]
	}

	if c.JsonResponse {
		helpers.PrettyPrint(struct {
			Url string `json:"url"`
		}{Url: finalUrl})
	} else {
		fmt.Println(">> Done! Access your files at " + finalUrl)
	}
	return nil
}

func (c *PFDAClient) UploadMultipleFiles(paths []string, folderID string, spaceID string) error {

	if !c.JsonResponse {
		fmt.Printf(">> Uploading multiple files...\n")
	}

	// this could be done in parallel - be careful to used memory otherwise will get terminated by kernel OOM-killer.
	for _, path := range paths {
		f, err := os.Stat(path)
		if os.IsNotExist(err) {
			helpers.PrintError(fmt.Errorf("Input path '%s' does not exist - skipping", path), c.JsonResponse)
			continue
		}
		path = filepath.Clean(path)
		if err := func() error {
			if f.IsDir() {
				return c.UploadFolder(path, folderID, spaceID)
			} else {
				return c.UploadFile(path, folderID, spaceID, false)
			}
		}(); err != nil {
			helpers.PrintError(err, c.JsonResponse)
		}
	}

	return nil
}

func (c *PFDAClient) DownloadFile(arg string, outputFilePath string, overwrite string) error {

	apiURL := fmt.Sprintf("%s/api/v2/cli/files/%s/download", c.BaseURL, arg)
	if !c.JsonResponse {
		fmt.Println(">> Preparing to download")
	}
	var resultJSON map[string]interface{}
	if err := c.makeGetJSON(apiURL, &resultJSON); err != nil {
		return err
	}

	fileURL, ok := resultJSON["fileUrl"].(string)
	if !ok {
		return fmt.Errorf("no fileUrl in response")
	}

	originalName := path.Base(fileURL)
	fileName, err := url.PathUnescape(originalName)
	if err != nil {
		fileName = originalName
	}
	fileName = sanitizeFileName(fileName)

	fileSize, ok := resultJSON["fileSize"].(float64)
	if !ok {
		return fmt.Errorf("no fileSize in response")
	}
	if !c.JsonResponse {
		fmt.Printf("   Downloading :  %s\n", fileName)
		fmt.Printf("     File Size :  %s\n", units.BytesSize(fileSize))
	}
	if outputFilePath == "" {
		// If output is not specified, use the original filename and current working directory
		dir, err := os.Getwd()
		if err != nil {
			return err
		}

		outputFilePath = filepath.Join(dir, fileName)
	} else {
		if fileInfo, err := os.Stat(outputFilePath); err == nil && fileInfo.IsDir() {
			// If outputFilePath exists, and it is a directory then the file should be downloaded
			// to that directory while retaining its original name
			// fmt.Printf(">> Specified outputFilePath %s is an existing directory\n", outputFilePath)
			outputFilePath = filepath.Join(outputFilePath, fileName)
		} else if strings.HasSuffix(outputFilePath, "/") {
			// A trailing / means the user has specified a directory, but it doesn't exist.
			if err := os.MkdirAll(outputFilePath, os.ModePerm); err != nil {
				return err
			}
			outputFilePath = filepath.Join(outputFilePath, fileName)

		} else if _, err := os.Stat(filepath.Dir(outputFilePath)); err != nil {
			// This is now assumed to be a file path and not a dir path, and the parent directory does not exist
			return fmt.Errorf("The parent directory %s of the specified output doesn't exist", filepath.Dir(outputFilePath))
		}
	}
	// After the above block, outputFilePath should contain the target file path and cannot be a directory
	if _, err := os.Stat(outputFilePath); err == nil && overwrite == "" {
		fmt.Printf(">> File %s already exists\n", outputFilePath)
		dialogOverwrite := yesNo("  Overwrite already existing path? ")
		if !dialogOverwrite {
			return fmt.Errorf("Download cancelled")
		}
	} else if err == nil && overwrite == "false" {
		return fmt.Errorf("Path %s already exists but -overwrite flag not set to true - skipping download", outputFilePath)
	}

	if !c.JsonResponse {
		fmt.Printf(">> Output File :  %s\n", outputFilePath)
	}
	withProgressBar := !c.JsonResponse
	err = c.DownloadFromUrl(fileURL, outputFilePath, int64(fileSize), withProgressBar)
	if err != nil {
		return err
	}
	if c.JsonResponse {
		helpers.PrintResult(outputFilePath, true)
	} else {
		fmt.Printf(">> Done!\n\n")
	}
	return nil
}

func (c *PFDAClient) Download(args []string, folderID string, spaceID string, public bool, recursive bool, outputFilePath string, overwrite string) error {

	c.ContinueOnError = len(args) > 1

	fileIDs := make([]string, 0)
	fileNames := make([]string, 0)

	if len(args) == 0 {
		args = append(args, "")
	}

	// prepare lists of files to downloads defined by name or id.
	for _, arg := range args {
		arg = strings.TrimSpace(arg)
		if helpers.IsFileUid(arg) {
			fileIDs = append(fileIDs, arg)
		} else {
			fileNames = append(fileNames, arg)
		}
	}

	// iterate over filenames with possible wildcards and download them.
	for _, fileName := range fileNames {
		apiURL := fmt.Sprintf("%s/api/files/cli?", c.BaseURL)
		params := url.Values{}

		if spaceID != "" {
			params.Add("space_id", spaceID)
		}
		if folderID != "" && folderID != "root" {
			params.Add("folder_id", folderID)
		}
		if fileName != "" {
			//respecting ruby backend specific filters
			params.Add("filters[filter]", helpers.TransformToSQLWildcards(fileName))
		}

		if public {
			params.Add("public_scope", "true")
		}

		_, body, err := c.makeRequestFail("GET", apiURL+params.Encode(), nil)
		if err != nil {
			return err
		}

		var children jsonListingResponse
		if err := json.Unmarshal(body, &children); err != nil {
			return err
		}

		var uids []string
		for _, child := range children.Files {
			if child.Type == "UserFile" {
				uids = append(uids, child.Uid)
			} else if recursive {
				// create the child folder first.
				if err := os.MkdirAll(filepath.Join(outputFilePath, child.Name), os.ModePerm); err != nil {
					log.Fatal(err)
				}
				c.Download([]string{fileName}, strconv.Itoa(child.Id), spaceID, public, recursive, filepath.Join(outputFilePath, child.Name), overwrite)
			}
		}

		if (len(uids) > 1 && (helpers.ContainsWildcard(fileName))) || len(uids) == 1 || args[0] == "" {
			fileIDs = append(fileIDs, uids...)
		} else if len(uids) > 1 {
			selected := pickFile(children.Files, "Multiple files found matching the given name, select which to download")
			fileIDs = append(fileIDs, selected)
		} else if !recursive {
			c.HandleError(fmt.Errorf("Unable to find any files matching '%s' - verify it exists and you have access to it", fileName))
		}
	}

	if len(fileIDs) > 1 || len(args) > 1 || recursive {
		c.parallelDownload(fileIDs, outputFilePath, overwrite)
	} else if len(fileIDs) == 1 {
		err := c.DownloadFile(fileIDs[0], outputFilePath, overwrite)
		c.HandleError(err)
	}
	return nil
}

func (c *PFDAClient) FileViewLink(arg string, preauthenticated bool, duration int64) error {

	baseURL, _ := url.Parse(fmt.Sprintf("%s/api/files/%s/download", c.BaseURL, arg))

	// Prepare query parameters
	params := url.Values{}
	params.Add("format", "json")
	params.Add("preauthenticated", fmt.Sprintf("%t", preauthenticated))
	params.Add("duration", fmt.Sprintf("%d", duration))
	params.Add("inline", "true")

	// Encode query parameters and append to the base URL
	baseURL.RawQuery = params.Encode()

	apiURL := baseURL.String()

	status, body, err := c.makeRequestFail("GET", apiURL, nil)
	if err != nil {
		if status == "404 Not Found" {
			return fmt.Errorf("%s not found. Please check that this file exists and you have access to it", arg)
		} else {
			return err
		}
	}

	var resultJSON map[string]interface{}
	err = json.Unmarshal(body, &resultJSON)
	if err != nil {
		return err
	}

	if resultJSON["file_url"] == nil {
		return fmt.Errorf("Error while getting the url")
	}

	resultUrl := resultJSON["file_url"].(string)

	if c.JsonResponse {
		helpers.PrettyPrint(struct {
			Url string `json:"url"`
		}{Url: resultUrl})
	} else {
		fmt.Println("Url to view file:", resultUrl)
	}
	return nil
}

func (c *PFDAClient) DescribeEntity(entityID string) error {
	apiURL := fmt.Sprintf("%s/api/v2/cli/%s/describe", c.BaseURL, entityID)

	body, err := c.makeRequest("GET", apiURL, nil)
	if err != nil {
		return err
	}

	return helpers.PrintPrettyJSON(body)
}

func (c *PFDAClient) GetScope() error {

	dxJobId, isPresent := os.LookupEnv("DX_JOB_ID")
	if !isPresent {
		return fmt.Errorf("No space detected")
	}

	apiURL := fmt.Sprintf("%s/api/v2/cli/jobs/%s/scope", c.BaseURL, dxJobId)

	var resultJSON map[string]interface{}
	if err := c.makeGetJSON(apiURL, &resultJSON); err != nil {
		return err
	}

	scope, ok := resultJSON["scope"].(string)
	if !ok {
		return fmt.Errorf("scope is not a string")
	}

	// Check if the scope is 'private'.
	if scope == "private" {
		helpers.PrintResult("private", c.JsonResponse)
		return nil
	}

	// Use regex to find the number after 'space-'.
	re := regexp.MustCompile(`^space-(\d+)$`)
	matches := re.FindStringSubmatch(scope)
	if len(matches) != 2 {
		return fmt.Errorf("scope format is incorrect")
	}

	// Print only the number part if the scope is in the format 'space-{number}'.
	helpers.PrintResult(matches[1], c.JsonResponse)
	return nil
}

func (c *PFDAClient) Ls(folderID string, spaceID string, flags map[string]bool) error {
	apiURL := fmt.Sprintf("%s/api/files/cli", c.BaseURL)

	params := url.Values{}

	if err := helpers.ValidateID(spaceID, "space_id", params); err != nil {
		return err
	}

	if err := helpers.ValidateID(folderID, "folder_id", params); err != nil {
		return err
	}

	for flag, value := range flags {
		if value {
			params.Add(flag, strconv.FormatBool(value))
		}
	}

	fullURL := fmt.Sprintf("%s?%s", apiURL, params.Encode())
	status, body, err := c.makeRequestFail("GET", fullURL, nil)
	if err != nil {
		if status == "404 Not Found" {
			return fmt.Errorf("Target location not found or inaccessible")
		}
		return err
	}

	var response jsonListingResponse
	if err := json.Unmarshal(body, &response); err != nil {
		return err
	}

	printListingResponse(response, flags["json"], flags["brief"])
	return nil
}

func (c *PFDAClient) Mkdir(dirs []string, folderID string, spaceID string, parents bool) error {

	c.ContinueOnError = len(dirs) > 1

	if parents {
		for _, dir := range dirs {
			parts := strings.Split(strings.TrimSuffix(dir, string(os.PathSeparator)), string(os.PathSeparator))
			parentId := folderID
			// created nested folders.
			for _, folder := range parts {
				id, err := c.createNewFolder(folder, parentId, spaceID)
				if err == nil {
					if c.JsonResponse {
						folderId, _ := strconv.Atoi(id)
						helpers.PrettyPrint(struct {
							Name string `json:"name"`
							ID   int    `json:"id"`
						}{Name: folder, ID: folderId})
					} else {
						fmt.Printf("Created folder %s (id: %s) \n", folder, id)
					}
				}
				parentId = id
			}
		}

		return nil
	}

	for _, dir := range dirs {
		id, err := c.createNewFolder(dir, folderID, spaceID)
		c.HandleError(err)
		if err == nil {
			if c.JsonResponse {
				folderId, _ := strconv.Atoi(id)
				helpers.PrettyPrint(struct {
					Name string `json:"name"`
					ID   int    `json:"id"`
				}{Name: dir, ID: folderId})
			} else {
				fmt.Printf("Created folder %s (id: %s) \n", dir, id)
			}
		}
	}
	return nil
}

func (c *PFDAClient) Rmdir(args []string) error {

	c.ContinueOnError = len(args) > 1

	for _, arg := range args {
		if !helpers.IsFolderId(arg) {
			c.HandleError(fmt.Errorf("Invalid folder id: %s - expected an integer", arg))
			continue
		}

		jsonData, err := json.Marshal(jsonRmPayload{Arg: arg, Type: "Folder"})
		if err != nil {
			return err
		}
		body, err := c.makeRequest("POST", c.BaseURL+"/api/v2/cli/nodes", jsonData)
		c.HandleError(err)

		var response []jsonFindNodesResponse
		if err := json.Unmarshal(body, &response); err != nil {
			return err
		}
		if len(response) == 0 {
			c.HandleError(fmt.Errorf("Target folder not found or inaccessible"))
			continue
		}

		if response[0].Children == 0 {
			err := c.RemoveDir(arg)
			c.HandleError(err)
		} else {
			c.HandleError(fmt.Errorf("Unable to remove non-empty folder"))
		}
	}

	return nil
}

func (c *PFDAClient) Rm(args []string, folderID string, spaceID string) error {

	c.ContinueOnError = len(args) > 1
	for _, arg := range args {

		if helpers.IsFileUid(arg) {
			err := c.RemoveFile([]string{arg})
			c.HandleError(err)
			continue
		}

		jsonData, err := json.Marshal(jsonRmPayload{Arg: helpers.TransformToSQLWildcards(arg), Type: "UserFile", FolderID: folderID, SpaceID: spaceID})
		if err != nil {
			return err
		}
		// first check for matching files to be deleted - filename (with wildcard) logic
		body, err := c.makeRequest("POST", c.BaseURL+"/api/v2/cli/nodes", jsonData)
		if err != nil {
			return err
		}
		var response []jsonFileResponse
		err = json.Unmarshal(body, &response)
		if err != nil {
			return err
		}

		toBeDeletedCount := len(response)
		if toBeDeletedCount > 1 {
			// given arg matches more files, let user select one and delete it
			if !helpers.ContainsWildcard(arg) {
				result := pickFile(response, "Multiple files found matching the given name, select which to delete")
				err := c.RemoveFile([]string{result})
				c.HandleError(err)
				// arg processed, continue to next
				continue
			}
			// wildcard used, user wants to match more files, just inform about the count.
			agree := yesNo(fmt.Sprintf("%d files match the given arg \"%s\", are you sure you want to continue?", toBeDeletedCount, arg))
			if agree {
				uids := make([]string, 0)
				for _, file := range response {
					uids = append(uids, file.Uid)
				}
				err := c.RemoveFile(uids)
				c.HandleError(err)
				// arg processed, continue to next
				continue
			}
			if c.JsonResponse {
				helpers.PrintResult("delete aborted", true)
			} else {
				fmt.Println(">> Delete aborted")
			}
			// arg processed, continue to next
			continue
		}
		if toBeDeletedCount == 0 {
			c.HandleError(fmt.Errorf("Target file not found or inaccessible"))
			// arg processed, continue to next
			continue
		}
		// single file matches the name, delete it
		err = c.RemoveFile([]string{response[0].Uid})
		c.HandleError(err)
		// arg processed, continue to next
		continue

	}
	return nil
}

// RefreshToken Just gets the new token, the logic for token replacement is in go/pfda.go
func (c *PFDAClient) RefreshToken(autoRefresh bool) (string, error) {
	apiURL := fmt.Sprintf("%s/api/auth_key", c.BaseURL)

	status, body, err := c.makeRequestFail("GET", apiURL, nil)
	if err != nil {
		if status == "404 Not Found" {
			return "", fmt.Errorf("Something went wrong")
		} else {
			return "", err
		}
	}

	var resultJSON map[string]interface{}
	err = json.Unmarshal(body, &resultJSON) // do this just to ensure the json is valid
	if err != nil {
		return "", err
	}

	return resultJSON["Key"].(string), nil
}

func (c *PFDAClient) GetLatestVersion() (string, error) {
	apiURL := fmt.Sprintf("%s/api/v2/cli/version/latest", c.BaseURL)

	var result struct {
		Version string `json:"version"`
	}
	if err := c.makeGetJSON(apiURL, &result); err != nil {
		return "", err
	}

	return result.Version, nil
}

func (c *PFDAClient) SetChunkSize(chunkSize int) error {
	if chunkSize > maxChunkSize || chunkSize < minChunkSize {
		return fmt.Errorf("chunk size must be between 16MB and 5GB")
	}
	c.ChunkSize = chunkSize
	return nil
}

func (c *PFDAClient) SetNumRoutines(numRoutines int) error {
	if numRoutines > maxRoutines || numRoutines < minRoutines {
		return fmt.Errorf("maximum number of threads must be an integer within the range of [1-100]")
	}
	c.NumRoutines = numRoutines
	return nil
}

func (c *PFDAClient) createFileID(url string, data []byte) (string, error) {
	status, body, err := c.makeRequestFail("POST", url, data)
	if err != nil {
		if status == "404 Not Found" {
			// 404 should only be returned if the specified spaceId is invalid
			// For invalid folder-id, an error json is returned
			return "", fmt.Errorf("uploading file - Please check that the space-id is correct and that you have access to that Space")
		} else {
			return "", err
		}
	}

	var resultJSON map[string]interface{}
	err = json.Unmarshal(body, &resultJSON)
	if err != nil {
		return "", err
	}

	if resultJSON["id"] == nil {
		return "", fmt.Errorf("No id in response!\n\nResponse: %s", string(body))
	}
	fileID := resultJSON["id"].(string)
	return fileID, nil
}

func (c *PFDAClient) createNewFolder(name string, parentFolderID string, spaceID string) (string, error) {

	createFolderURL := c.BaseURL + "/api/files/create_folder"
	jsonData, err := json.Marshal(jsonCreateFolderPayload{
		Name:           name,
		ParentFolderID: parentFolderID, // might be "" -> not used
		SpaceID:        spaceID,        // might be "" -> not used
	})

	if err != nil {
		return "", err
	}

	_, body, err := c.makeRequestFail("POST", createFolderURL, jsonData)
	if err != nil {
		return "", err
	}

	var resultJSON jsonCreateFolderResponse
	if err := json.Unmarshal(body, &resultJSON); err != nil {
		return "", err
	}

	newFolderID := strconv.Itoa(resultJSON.Id)
	if resultJSON.Message.Type == "error" {
		return newFolderID, fmt.Errorf("unable to create folder: %s - already exists in target location", name)
	}

	c.SetTags("folder-"+newFolderID, []string{tagCLI})
	return newFolderID, nil
}

func (c *PFDAClient) Head(arg string, lines int) error {

	if !helpers.IsFileUid(arg) {
		return fmt.Errorf("invalid file-id provided: %s", arg)
	}

	apiURL := fmt.Sprintf("%s/api/v2/cli/files/%s/download", c.BaseURL, arg)

	var resultJSON map[string]interface{}
	if err := c.makeGetJSON(apiURL, &resultJSON); err != nil {
		return err
	}

	fileURL, ok := resultJSON["fileUrl"].(string)
	if !ok {
		return fmt.Errorf("no fileUrl in response")
	}
	fileSize, ok := resultJSON["fileSize"].(float64)
	if !ok {
		return fmt.Errorf("no fileSize in response")
	}
	// user wants print whole file, check size first.
	if lines == -1 && fileSize > 10_000_000 {
		agree := yesNo("The size of the file is over 10Mb - are you sure you want to display the whole content?")
		if !agree {
			return fmt.Errorf("cat cancelled")
		}
	}

	return c.HeadFile(fileURL, lines)
}

func (c *PFDAClient) downloadByChunks(uidsChunk []string, outputFilePath string, overwrite string) {
	apiURL := fmt.Sprintf("%s/api/files/bulk_download", c.BaseURL)
	jsonData, _ := json.Marshal(bulkIDsPayload{
		IDs: uidsChunk,
	})
	_, body, err := c.makeRequestFail("POST", apiURL, jsonData)
	if err != nil {
		helpers.PrintError(fmt.Errorf("unable to download: %s", strings.Join(uidsChunk, ",")), c.JsonResponse)
		return
	}
	var resultJSON []map[string]interface{}
	_ = json.Unmarshal(body, &resultJSON)

	downloaded := make(map[string]string)
	for _, file := range resultJSON {
		c.DownloadDirectly(file["url"].(string), outputFilePath, overwrite)
		downloaded[file["uid"].(string)] = ""
	}

	// check if all requested files were downloaded.
	for _, uid := range uidsChunk {
		_, found := downloaded[uid]
		if !found {
			if c.JsonResponse {
				helpers.PrintError(fmt.Errorf("unable to download: %s", uid), c.JsonResponse)
			} else {
				fmt.Printf(">> Unable to download: %s\n", uid)
			}
		}
	}

}

func (c *PFDAClient) parallelDownload(uids []string, outputFilePath string, overwrite string) {

	if len(uids) == 0 {
		return
	}
	if !c.JsonResponse {
		fmt.Printf(">> Preparing to download: %d files \n", len(uids))
	}
	var wg = sync.WaitGroup{}
	maxGoroutines := 5 // do not exceed 10 - magical TCP issues with lost packages appears.
	guard := make(chan struct{}, maxGoroutines)

	// create outputFilePath in case it was specified - we assume user specified a dir name
	if outputFilePath != "" {
		if err := os.MkdirAll(outputFilePath, os.ModePerm); err != nil {
			log.Fatal(err)
		}
	}

	var divided [][]string
	var chunkSize = helpers.GetChunkSize(len(uids))

	for i := 0; i < len(uids); i += chunkSize {
		end := i + chunkSize
		if end > len(uids) {
			end = len(uids)
		}
		divided = append(divided, uids[i:end])
	}

	for _, uidsChunk := range divided {
		guard <- struct{}{}
		wg.Add(1)
		go func(uidsChunk []string) {
			c.downloadByChunks(uidsChunk, outputFilePath, overwrite)
			<-guard
			wg.Done()

		}(uidsChunk)
	}
	wg.Wait()
}

func (c *PFDAClient) initWaitGroup(fileID string, chunkPool <-chan uploadChunk, size *int64, withProgressBar bool) (wg *sync.WaitGroup) {
	numRoutines := helpers.Min(c.NumRoutines, int(math.Ceil(float64(*size)/float64(c.ChunkSize))))

	var totalSent uint64 = 0
	writer := uilive.New()
	writer.Start()
	defer writer.Stop()

	var g sync.WaitGroup
	for i := 0; i < numRoutines; i++ {
		g.Add(1)
		go func() {
			for chunk := range chunkPool {
				err := c.sendToStore(fileID, chunk)
				c.HandleError(err)
				atomic.AddUint64(&totalSent, uint64(len(chunk.data)))
				currentSize := atomic.LoadUint64(&totalSent)
				totalSize := atomic.LoadInt64(size)
				if withProgressBar && !c.JsonResponse {
					fmt.Fprintf(writer, "     %.1f%% (%s / %s)\n",
						100*float64(currentSize)/float64(totalSize), units.BytesSize(float64(currentSize)), units.BytesSize(float64(totalSize)))
					writer.Flush()
				}
			}
			g.Done()
		}()
	}
	wg = &g
	return
}

func (c *PFDAClient) readAndChunk(f io.ReadCloser, ch chan<- uploadChunk, size *int64) {
	// dynamically adjust chunkSize
	chunkIndex := 1
	var totalDataLength = 0
	for {
		byteBuf := make([]byte, c.ChunkSize)
		i := 0
		for i < c.ChunkSize {
			tempBuf := byteBuf[i:]
			m, err := f.Read(tempBuf)
			if err != nil && err != io.EOF {
				panic(err)
			}
			i += m
			if err == io.EOF {
				break
			}
		}
		totalDataLength += i
		// Only upload an empty chunk if empty file
		if i == 0 && chunkIndex > 1 {
			break
		}
		ch <- uploadChunk{
			index: chunkIndex,
			data:  byteBuf[:i], // use slice
		}
		chunkIndex++
	}
	atomic.StoreInt64(size, int64(totalDataLength))
}

func (c *PFDAClient) sendToStore(id string, chunk uploadChunk) error {
	uploadURL := fmt.Sprintf("%s/api/v2/files/%s/upload-url", c.BaseURL, id)
	md5Sum := md5.Sum(chunk.data)

	// build URL with query parameters
	params := url.Values{}
	params.Add("size", strconv.Itoa(len(chunk.data)))
	params.Add("index", strconv.Itoa(chunk.index))
	params.Add("md5", hex.EncodeToString(md5Sum[:]))

	fullURL := fmt.Sprintf("%s?%s", uploadURL, params.Encode())

	var resultJSON map[string]interface{}
	if err := c.makeGetJSON(fullURL, &resultJSON); err != nil {
		return err
	}
	if resultJSON["url"] == "" {
		panic("No url in response!")
	}
	_, err := c.makeRequestWithHeaders("PUT", resultJSON["url"].(string), resultJSON["headers"].(map[string]interface{}), chunk.data)
	return err
}

func yesNo(label string) bool {
	prompt := promptui.Select{
		Label: label + " [Yes/No]",
		Items: []string{"Yes", "No"},
	}
	_, result, err := prompt.Run()
	if err != nil {
		log.Fatalf("Prompt failed %v\n", err)
	}
	return result == "Yes"
}

// Filters out only files to pick from.
func pickFile(files []jsonFileResponse, label string) string {

	options := make([]string, 0)
	ids := make([]string, 0)
	for _, file := range files {
		if file.Type == "UserFile" {
			options = append(options, "created "+file.CreatedAt+" - "+helpers.HumanReadableSize(file.Size)+" - "+file.Name+" ("+file.Uid+")")
			ids = append(ids, file.Uid)
		}
	}

	prompt := promptui.Select{
		Label: label,
		Items: options,
	}
	index, _, err := prompt.Run()
	if err != nil {
		log.Fatalf("Prompt failed %v\n", err)
	}
	return ids[index]
}
