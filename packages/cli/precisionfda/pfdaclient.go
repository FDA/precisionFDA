package precisionfda

import (
	"bufio"
	"bytes"
	"crypto/md5"
	"dnanexus.com/precision-fda-cli/helpers"
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
	"text/tabwriter"
	"time"

	"github.com/docker/go-units"
	"github.com/gosuri/uilive"
	"github.com/hashicorp/go-cleanhttp"     // required by go-retryablehttp
	"github.com/hashicorp/go-retryablehttp" // use http libraries from hashicorp for implement retry logic
	"github.com/manifoldco/promptui"
)

const userAgent = "precisionFDA CLI/2.7.1 "
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
	DescribeEntity(entityID string, entityType string) error
	LsSpaces(flags map[string]bool) error
	LsApps(spaceID string, flags map[string]bool) error
	LsAssets(spaceID string, flags map[string]bool) error
	LsWorkflows(spaceID string, flags map[string]bool) error
	LsExecutions(spaceID string, flags map[string]bool) error
	Ls(folderID string, spaceID string, flags map[string]bool) error
	LsMembers(spaceID string) error
	LsDiscussions(spaceID string, flags map[string]bool) error // might refactor to be able present public discussions as well.
	Mkdir(names []string, folderID string, spaceID string, parents bool) error
	Rmdir(args []string) error
	Rm(args []string, folderID string, spaceID string) error
	Head(arg string, lines int) error
	GetScope() error
	RefreshToken(autoRefresh bool) (string, error)
	GetLatestVersion() (string, error)
	SetChunkSize(chunkSize int)
	SetNumRoutines(numRoutines int)
}

type PFDAClient struct {
	BaseURL         string
	Platform        string
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
	Name           string `json:"name"`
	ParentFolderID string `json:"parent_folder_id,omitempty"`
	SpaceID        string `json:"space_id,omitempty"`
	Type           string `json:"type,omitempty"`
}

type jsonFileDownloadPayload struct {
	FileURL  string `json:"file_url"`
	FileSize int64  `json:"file_size"`
}

type uploadChunk struct {
	index int
	data  []byte // slice/ptr
}

// better name needed
type jsonSpaceResponse struct {
	Id        int    `json:"id"`
	Title     string `json:"title"`
	Role      string `json:"role"`
	Side      string `json:"side"`
	Type      string `json:"type"`
	State     string `json:"state"`
	Protected bool   `json:"protected"`
}

type jsonMembersResponse struct {
	Id        int    `json:"id"`
	Active    bool   `json:"active"`
	CreatedAt string `json:"createdAt"`
	Role      string `json:"role"`
	Side      string `json:"side"`
	Name      string `json:"name"`
	Username  string `json:"username"`
}

type jsonCreateFolderResponse struct {
	Id      int    `json:"id"`
	Path    string `json:"path"`
	Message struct {
		Type string `json:"type"`
	} `json:"message"`
}

type JsonResource struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
	URL  string `json:"url"`
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
	fileList := []string{}
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
	c.TagCliFile(fileID)
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

	apiURL := fmt.Sprintf("%s/api/files/%s/download?format=json", c.BaseURL, arg)
	if !c.JsonResponse {
		fmt.Println(">> Preparing to download")
	}
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
		return fmt.Errorf("No file_url in response!\n\nResponse: %s", string(body))
	}
	fileURL := resultJSON["file_url"].(string)

	originalName := path.Base(fileURL)
	fileName, err := url.PathUnescape(originalName)
	if err != nil {
		fileName = originalName
	}

	fileSize := resultJSON["file_size"].(float64)
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
			// If outputFilePath exists and it is a directory then the file should be downloaded
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
		if helpers.IsFileId(arg) {
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

func (c *PFDAClient) DescribeEntity(entityID string, entityType string) error {
	apiURL := fmt.Sprintf("%s/api/%ss/%s/describe", c.BaseURL, entityType, entityID)

	status, body, err := c.makeRequestFail("GET", apiURL, nil)
	if err != nil {
		if status == "404 Not Found" {
			return fmt.Errorf("%s not found - please check that it does exist and you have access to it", entityID)
		} else {
			return err
		}
	}

	var resultJSON map[string]interface{}
	err = json.Unmarshal(body, &resultJSON)
	if err != nil {
		return err
	}

	prettyJSON, _ := json.MarshalIndent(resultJSON, "", "    ")
	fmt.Printf("%s\n", string(prettyJSON))

	return nil
}

func (c *PFDAClient) GetScope() error {

	dxJobId, isPresent := os.LookupEnv("DX_JOB_ID")
	if !isPresent {
		return fmt.Errorf("No space detected")
	}

	apiURL := fmt.Sprintf("%s/api/jobs/%s/scope", c.BaseURL, dxJobId)

	_, body, err := c.makeRequestFail("GET", apiURL, nil)
	if err != nil {
		return err
	}

	var resultJSON map[string]interface{}
	err = json.Unmarshal(body, &resultJSON)
	if err != nil {
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

		jsonData, err := json.Marshal(jsonRmPayload{Name: arg, Type: "Folder"})
		if err != nil {
			return err
		}
		_, body, err := c.makeRequestFail("POST", c.BaseURL+"/api/files/cli_node_search", jsonData)
		c.HandleError(err)

		var response []jsonFileResponse
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

		if helpers.IsFileId(arg) {
			err := c.RemoveFile([]string{arg})
			c.HandleError(err)
			continue
		}

		jsonData, err := json.Marshal(jsonRmPayload{Name: helpers.TransformToSQLWildcards(arg), Type: "UserFile", ParentFolderID: folderID, SpaceID: spaceID})
		if err != nil {
			return err
		}
		// first check for matching files to be deleted - filename (with wildcard) logic
		_, body, err := c.makeRequestFail("POST", c.BaseURL+"/api/files/cli_node_search", jsonData)
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
	apiURL := fmt.Sprintf("%s/api/cli_latest_version", c.BaseURL)

	_, body, err := c.makeRequestFail("GET", apiURL, nil)
	if err != nil {
		return "", err
	}

	var resultJSON map[string]interface{}
	err = json.Unmarshal(body, &resultJSON) // do this just to ensure the json is valid
	if err != nil {
		return "", err
	}

	return resultJSON["version"].(string), nil
}

func (c *PFDAClient) SetChunkSize(chunkSize int) {
	if chunkSize > maxChunkSize || chunkSize < minChunkSize {
		inputError("Chunk size must be between 5MB and 5GB")
	} else {
		c.ChunkSize = chunkSize
	}
}

func (c *PFDAClient) SetNumRoutines(numRoutines int) {
	if numRoutines > maxRoutines || numRoutines < minRoutines {
		inputError("Maximum number of threads must an integer within the range of [1-100]")
	} else {
		c.NumRoutines = numRoutines
	}
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

	c.TagCliFolder(newFolderID)
	return newFolderID, nil
}

func (c *PFDAClient) Head(arg string, lines int) error {

	if !helpers.IsFileId(arg) {
		return fmt.Errorf("invalid file-id provided: %s", arg)
	}

	apiURL := fmt.Sprintf("%s/api/files/%s/download?format=json", c.BaseURL, arg)
	status, body, err := c.makeRequestFail("GET", apiURL, nil)
	if err != nil {
		if status == "404 Not Found" {
			return fmt.Errorf("%s not found. Please check that this file exists and you have access to it", arg)
		}
		return err
	}

	var resultJSON map[string]interface{}
	if err := json.Unmarshal(body, &resultJSON); err != nil {
		return err
	}

	if resultJSON["file_url"] == nil {
		return fmt.Errorf("no file_url in response!\n\nResponse: %s", string(body))
	}
	fileURL := resultJSON["file_url"].(string)

	fileSize := resultJSON["file_size"].(float64)
	// user wants print whole file, check size first.
	if lines == -1 && fileSize > 10_000_000 {
		agree := yesNo("The size of the file is over 10Mb - are you sure you want to display the whole content?")
		if !agree {
			return fmt.Errorf("cat cancelled")
		}
	}

	err = c.HeadFile(fileURL, lines)
	if err != nil {
		return err
	}

	return nil
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

func (c *PFDAClient) makeRequestFail(requestType string, url string, data []byte) (status string, body []byte, err error) {
	req, err := retryablehttp.NewRequest(requestType, url, bytes.NewReader(data))
	helpers.CheckErr(err)
	c.setPostHeaders(req)

	resp, err := c.Client.Do(req)
	helpers.CheckErr(err)
	defer resp.Body.Close()
	status = resp.Status
	body, _ = io.ReadAll(resp.Body)

	if !strings.HasPrefix(status, "2") {
		err = fmt.Errorf("%s Request to '%s' failed with status %s. For 4xx status, check that the provided id and auth-key are still valid.\n", requestType, url, status)
	}
	return status, body, err
}

func (c *PFDAClient) makeRequestWithHeadersFail(requestType string, url string, headers map[string]interface{}, data []byte) (status string, body []byte, err error) {
	req, err := retryablehttp.NewRequest(requestType, url, bytes.NewReader(data))
	helpers.CheckErr(err)
	for header, value := range headers {
		req.Header.Set(header, value.(string))
	}

	resp, err := c.Client.Do(req)
	helpers.CheckErr(err)
	defer resp.Body.Close()

	status = resp.Status
	body, _ = io.ReadAll(resp.Body)

	if !strings.HasPrefix(status, "2") {
		err = fmt.Errorf("%s Request to '%s' failed with status %s. For 4xx status, check that the provided id and auth-key are still valid.\n", requestType, url, status)
	}
	return status, body, err
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
	uploadURL := c.BaseURL + "/api/get_upload_url"
	md5Sum := md5.Sum(chunk.data)
	jsonData, err := json.Marshal(jsonChunkInfo{
		ID:    id,
		Size:  len(chunk.data),
		Index: chunk.index,
		Md5:   hex.EncodeToString(md5Sum[:]),
	})

	_, body, err := c.makeRequestFail("POST", uploadURL, jsonData)
	if err != nil {
		return err
	}

	var resultJSON map[string]interface{}
	err = json.Unmarshal(body, &resultJSON)
	helpers.CheckErr(err)
	if resultJSON["url"] == "" {
		panic("No url in response!")
	}
	_, _, err = c.makeRequestWithHeadersFail("PUT", resultJSON["url"].(string), resultJSON["headers"].(map[string]interface{}), chunk.data)
	return err
}

func (c *PFDAClient) setPostHeaders(req *retryablehttp.Request) {
	req.Header.Set("User-Agent", userAgent+"("+c.Platform+")")
	req.Header.Set("Authorization", "Key "+c.AuthKey)
	req.Header.Set("Content-Type", "application/json")
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

func printListSpacesResponse(spaces []jsonSpaceResponse, asJSON bool) {
	if asJSON {
		prettyJSON, _ := json.MarshalIndent(spaces, "", "    ")
		fmt.Println(string(prettyJSON))
	} else if len(spaces) > 0 {
		writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)

		// Function to join and print a line
		printLine := func(columns []string) {
			fmt.Fprintln(writer, strings.Join(columns, "\t")+"\t")
		}

		headers := []string{"ID", "Type", "Status", "Role", "Side", "Name"}
		printLine(headers)

		for _, space := range spaces {
			columns := []string{strconv.Itoa(space.Id), space.Type, helpers.FormatValue(space.Protected, "Protected"), space.Role, space.Side, space.Title}
			printLine(columns)
		}
		writer.Flush()
	}
}

func printSpaceMembersResponse(members []jsonMembersResponse, asJSON bool) {
	if asJSON {
		prettyJSON, _ := json.MarshalIndent(members, "", "    ")
		fmt.Println(string(prettyJSON))
	} else if len(members) > 0 {
		writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)

		// Function to join and print a line
		printLine := func(columns []string) {
			fmt.Fprintln(writer, strings.Join(columns, "\t")+"\t")
		}

		headers := []string{"ID", "Name", "Role", "Side", "Active", "Added at"}
		printLine(headers)

		for _, member := range members {
			columns := []string{strconv.Itoa(member.Id), member.Name, member.Role, member.Side, strconv.FormatBool(member.Active), member.CreatedAt}
			printLine(columns)
		}
		writer.Flush()
	}
}
