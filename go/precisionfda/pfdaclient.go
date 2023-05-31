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

const userAgent = "precisionFDA CLI/2.4 "
const defaultNumRoutines = 10
const defaultChunkSize = 1 << 26 // default 67MB (min. 5MB)
const minRoutines = 1
const maxRoutines = 100
const minChunkSize = 5 * 1 << 11 // min. 5MB
const maxChunkSize = 1 << 32     // max. 2GB
const maxFileSize = 5 * 1 << 41  // max. 5TB

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
	DescribeEntity(entityID string, entityType string) error
	ListSpaces(flags map[string]bool) error
	Ls(folderID string, spaceID string, flags map[string]bool) error
	Mkdir(names []string, folderID string, spaceID string, parents bool) error
	Rmdir(args []string) error
	Rm(args []string, folderID string, spaceID string) error
	Head(arg string, lines int) error

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

type bulkIDs struct {
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

type rmPayload struct {
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
type jsonSpace struct {
	Id        int    `json:"id"`
	Title     string `json:"title"`
	Role      string `json:"role"`
	Side      string `json:"side"`
	Type      string `json:"type"`
	State     string `json:"state"`
	Protected bool   `json:"protected"`
}

// better name needed
type jsonFile struct {
	Id        int    `json:"id"`
	Uid       string `json:"uid"`
	Name      string `json:"name"`
	Type      string `json:"type"`
	Locked    bool   `json:"locked"`
	State     string `json:"state"`
	AddedBy   string `json:"added_by"`
	CreatedAt string `json:"created_at"`
	Size      string `json:"file_size"`
	// populated for Folders only
	Children int `json:"children,omitempty"`
}

type jsonMeta struct {
	Scope string `json:"scope"`
	Path  string `json:"path"`
}

type jsonListingPayload struct {
	Meta  jsonMeta   `json:"meta"`
	Files []jsonFile `json:"files"`
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
		inputError(fmt.Sprintf("Size of asset folder '%s' (%d) exceeds maximum allowed file size(%d).", rootFolderPath, assetSize, maxFileSize))
	}

	if assetSize == 0 {
		inputError(fmt.Sprintf("Size of asset folder '%s' is 0. Uploading an empty asset is not allowed.", rootFolderPath))
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

	fmt.Println(">> Archiving asset...")

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

	fmt.Print(">> Uploading asset |")
	// no need to open the rootFolderPath, asset is read from stdout
	// f, err := os.Open(rootFolderPath)
	// if err != nil {
	// 	return err
	// }
	// defer f.Close()
	close(chunkPool)
	wg.Wait()

	fmt.Println(">| Uploaded 100%\n>> Finalizing asset...")
	jsonData, err = json.Marshal(jsonID{
		ID: fileID,
	})
	if err != nil {
		return err
	}

	c.makeRequestFail("POST", closeURL, jsonData)
	fmt.Println(">> Done! Access your asset at " + c.BaseURL + "/home/assets/" + fileID)
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
		return fmt.Errorf(">> Size of file '%s' (%d) exceeds maximum allowed file size(%d).", path, size, maxFileSize)
	}

	if size == 0 {
		return fmt.Errorf(">> Size of file '%s' is 0. Uploading an empty file is not allowed.", path)
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

	scope := ""
	parentType := ""
	parentId := ""
	if spaceID != "" {
		_, err := strconv.Atoi(spaceID)
		if err != nil {
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

	if withProgressBar {
		fmt.Printf(">> Uploading file %s\n", path)
	}

	wg := c.initWaitGroup(fileID, chunkPool, &size, withProgressBar)
	c.readAndChunk(file, chunkPool, &size)

	close(chunkPool)
	wg.Wait()

	if withProgressBar {
		fmt.Println(">> Finalizing file...")
	}

	jsonData, err = json.Marshal(jsonID{
		ID: fileID,
	})
	if err != nil {
		return err
	}

	c.makeRequestFail("POST", closeURL, jsonData)
	fmt.Println(">> Uploaded: ", path)
	if withProgressBar {
		if spaceID != "" {
			fmt.Println(">> Done! Access your file at " + c.BaseURL + "/spaces/" + spaceID + "/files/" + fileID)
		} else {
			fmt.Println(">> Done! Access your file at " + c.BaseURL + "/home/files/" + fileID)
		}
	}

	return nil
}

func (c *PFDAClient) UploadFolder(folderPath string, folderID string, spaceID string) error {
	folders := make(map[string]string, 20)

	p, _ := path.Split(folderPath)
	folders[path.Clean(p)] = folderID

	fmt.Println(">> Uploading content of:", folderPath)

	var fileList []string
	err := filepath.Walk(folderPath, func(currentPath string, f os.FileInfo, err error) error {
		if f.IsDir() {
			parent, _ := path.Split(currentPath)
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
			parent, _ := path.Split(file)
			err := c.UploadFile(file, folders[filepath.Dir(parent)], spaceID, false)
			if err != nil {
				fmt.Println(err)
			}
			<-guard
			wg.Done()

		}(file)
	}
	wg.Wait()

	if spaceID != "" {
		fmt.Println(">> Done! Access your files at " + c.BaseURL + "/spaces/" + spaceID + "/files?folder_id=" + folders[folderPath])

	} else {
		fmt.Println(">> Done! Access your files at " + c.BaseURL + "/home/files?folder_id=" + folders[folderPath])
	}
	return nil
}

func (c *PFDAClient) UploadMultipleFiles(paths []string, folderID string, spaceID string) error {

	fmt.Printf(">> Uploading multiple files...\n")

	// this could be done in parallel - be careful to used memory otherwise will get terminated by kernel OOM-killer.
	for _, path := range paths {
		f, err := os.Stat(path)
		if os.IsNotExist(err) {
			fmt.Println(fmt.Sprintf("Input path '%s' does not exist - skipping.", path))
			continue
		}
		path = filepath.Clean(path)
		if f.IsDir() {
			err = c.UploadFolder(path, folderID, spaceID)
			if err != nil {
				fmt.Println(err)
			}
		} else {
			err = c.UploadFile(path, folderID, spaceID, false)
			if err != nil {
				fmt.Println(err)
			}
		}
	}

	return nil
}

func (c *PFDAClient) DownloadFile(arg string, outputFilePath string, overwrite string) error {

	apiURL := fmt.Sprintf("%s/api/files/%s/download?format=json", c.BaseURL, arg)
	fmt.Println(">> Preparing to download")
	status, body, err := c.makeRequestFail("GET", apiURL, nil)
	if err != nil {
		if status == "404 Not Found" {
			return fmt.Errorf(">> %s not found. Please check that this file exists and you have access to it", arg)
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
		fmt.Printf("Error while unescaping file name, using the original name.")
		fileName = originalName
	}
	fmt.Printf("   Downloading :  %s\n", fileName)

	fileSize := resultJSON["file_size"].(float64)
	fmt.Printf("     File Size :  %s\n", units.BytesSize(fileSize))

	if outputFilePath == "" {
		// If output is not specified, use the original filename and current working directory
		dir, err := os.Getwd()
		if err != nil {
			return err
		}

		outputFilePath = path.Join(dir, fileName)
	} else {
		if fileInfo, err := os.Stat(outputFilePath); err == nil && fileInfo.IsDir() {
			// If outputFilePath exists and it is a directory then the file should be downloaded
			// to that directory while retaining its original name
			// fmt.Printf(">> Specified outputFilePath %s is an existing directory\n", outputFilePath)
			outputFilePath = path.Join(outputFilePath, fileName)
		} else if strings.HasSuffix(outputFilePath, "/") {
			// A trailing / means the user has specified a directory, but it doesn't exist.
			if err := os.MkdirAll(outputFilePath, os.ModePerm); err != nil {
				return err
			}
			outputFilePath = path.Join(outputFilePath, fileName)

		} else if _, err := os.Stat(filepath.Dir(outputFilePath)); err != nil {
			// This is now assumed to be a file path and not a dir path, and the parent directory does not exist
			return fmt.Errorf("Error: The parent directory %s of the specified output doesn't exist", filepath.Dir(outputFilePath))
		}
	}
	// After the above block, outputFilePath should contain the target file path and cannot be a directory

	if _, err := os.Stat(outputFilePath); err == nil && overwrite == "" {
		fmt.Printf(">> File %s already exists\n", outputFilePath)
		dialogOverwrite := yesNo("  Overwrite already existing path? ")
		if !dialogOverwrite {
			return fmt.Errorf(">> Download cancelled")
		}
	} else if err == nil && overwrite == "false" {
		return fmt.Errorf(">> Error: path %s already exists but -overwrite flag not set to true. Skipping download.\n", outputFilePath)
	}

	fmt.Printf(">> Output File :  %s\n", outputFilePath)

	withProgressBar := true
	err = Download(fileURL, outputFilePath, int64(fileSize), withProgressBar)
	if err != nil {
		return err
	}

	fmt.Printf(">> Done!\n\n")
	return nil
}

func (c *PFDAClient) Download(args []string, folderID string, spaceID string, public bool, recursive bool, outputFilePath string, overwrite string) error {

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

		var children jsonListingPayload
		err = json.Unmarshal(body, &children)
		if err != nil {
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
			fmt.Println(fmt.Errorf(">> No files found matching: %s - please check it does exist and you have access to it", fileName))
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

func (c *PFDAClient) DescribeEntity(entityID string, entityType string) error {
	apiURL := fmt.Sprintf("%s/api/%ss/%s/describe", c.BaseURL, entityType, entityID)

	status, body, err := c.makeRequestFail("GET", apiURL, nil)
	if err != nil {
		if status == "404 Not Found" {
			return fmt.Errorf(">> %s not found - please check that it does exist and you have access to it", entityID)
		} else {
			return err
		}
	}

	var resultJSON map[string]interface{}
	err = json.Unmarshal(body, &resultJSON)
	if err != nil {
		return err
	}

	if resultJSON == nil {
		return fmt.Errorf("No response!\n\nResponse: %s", string(body))
	}

	prettyJSON, _ := json.MarshalIndent(resultJSON, "", "    ")
	fmt.Printf("%s\n", string(prettyJSON))

	return nil
}

func (c *PFDAClient) ListSpaces(flags map[string]bool) error {
	apiURL := fmt.Sprintf("%s/api/spaces/cli?", c.BaseURL)

	params := url.Values{}
	for flag, value := range flags {
		if value {
			params.Add(flag, strconv.FormatBool(value))
		}
	}

	status, body, err := c.makeRequestFail("GET", apiURL+params.Encode(), nil)
	if err != nil {
		if status == "404 Not Found" {
			return fmt.Errorf(">> Something went wrong")
		} else {
			return err
		}
	}

	var spaces []jsonSpace
	err = json.Unmarshal(body, &spaces)
	if err != nil {
		return err
	}

	printListSpacesResponse(spaces, flags)

	return nil
}

func (c *PFDAClient) Ls(folderID string, spaceID string, flags map[string]bool) error {
	apiURL := fmt.Sprintf("%s/api/files/cli?", c.BaseURL)

	params := url.Values{}

	if spaceID != "" {
		_, err := strconv.Atoi(spaceID)
		if err != nil {
			return fmt.Errorf(">> invalid space ID - expected an integer")
		}
		params.Add("space_id", spaceID)
	}

	if folderID != "" {
		_, err := strconv.Atoi(folderID)
		if err != nil {
			return fmt.Errorf(">> invalid folder ID - expected an integer")
		}
		params.Add("folder_id", folderID)
	}

	for flag, value := range flags {
		if value {
			params.Add(flag, strconv.FormatBool(value))
		}
	}

	status, body, err := c.makeRequestFail("GET", apiURL+params.Encode(), nil)
	if err != nil {
		if status == "404 Not Found" {
			return fmt.Errorf(">> Target location not found or inaccessible")
		} else {
			return err
		}
	}

	var response jsonListingPayload
	err = json.Unmarshal(body, &response)
	if err != nil {
		return err
	}

	printListingResponse(response, flags)
	return nil
}

func (c *PFDAClient) Mkdir(dirs []string, folderID string, spaceID string, parents bool) error {

	c.ContinueOnError = len(dirs) > 1

	if parents {
		for _, dir := range dirs {
			parts := strings.Split(dir, string(os.PathSeparator))
			parentId := folderID
			// created nested folders.
			for _, folder := range parts {
				id, err := c.createNewFolder(folder, parentId, spaceID)
				if err == nil {
					fmt.Printf(">> Created folder %s (id: %s) \n", folder, id)
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
			fmt.Printf(">> Created folder %s (id: %s) \n", dir, id)
		}
	}
	return nil
}

func (c *PFDAClient) Rmdir(args []string) error {

	c.ContinueOnError = len(args) > 1

	for _, arg := range args {
		if !helpers.IsFolderId(arg) {
			c.HandleError(fmt.Errorf(">> Invalid folder id: %s - expected an integer", arg))
			continue
		}

		jsonData, err := json.Marshal(rmPayload{Name: arg, Type: "Folder"})
		if err != nil {
			return err
		}
		_, body, err := c.makeRequestFail("POST", c.BaseURL+"/api/files/cli_node_search", jsonData)
		c.HandleError(err)
		var response []jsonFile

		err = json.Unmarshal(body, &response)
		if err != nil {
			return err
		}
		if len(response) == 0 {
			fmt.Println(">> Target folder not found or inaccessible")
			continue
		}

		if response[0].Children == 0 {
			err := c.RemoveDir(arg)
			c.HandleError(err)
		} else {
			fmt.Println(">> Unable to remove non-empty folder.")
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

		jsonData, err := json.Marshal(rmPayload{Name: helpers.TransformToSQLWildcards(arg), Type: "UserFile", ParentFolderID: folderID, SpaceID: spaceID})
		if err != nil {
			return err
		}
		// first check for matching files to be deleted - filename (with wildcard) logic
		_, body, err := c.makeRequestFail("POST", c.BaseURL+"/api/files/cli_node_search", jsonData)
		if err != nil {
			return err
		}
		var response []jsonFile
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

			fmt.Println(">> Delete aborted")
			// arg processed, continue to next
			continue
		}
		if toBeDeletedCount == 0 {
			fmt.Println(">> Target file not found or inaccessible")
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
			return "", fmt.Errorf("Something went wrong.")
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
		inputError("Chunk size must be between 5MB and 5GB.")
	} else {
		c.ChunkSize = chunkSize
	}
}

func (c *PFDAClient) SetNumRoutines(numRoutines int) {
	if numRoutines > maxRoutines || numRoutines < minRoutines {
		inputError("Maximum number of threads must an integer within the range of [1-100].")
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
			return "", fmt.Errorf("Error uploading the file. Please check that the space-id is correct and that you have access to that Space.")
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

	var resultJSON map[string]interface{}
	err = json.Unmarshal(body, &resultJSON)
	if err != nil {
		return "", err
	}

	newFolderID := fmt.Sprintf("%g", resultJSON["id"])
	if resultJSON["message"].(map[string]interface{})["type"] == "error" {
		return newFolderID, fmt.Errorf(">> Unable to create %s - already exists in target location", name)
	}

	return newFolderID, nil
}

func (c *PFDAClient) Head(arg string, lines int) error {

	if !helpers.IsFileId(arg) {
		return fmt.Errorf(">> Invalid file-id provided: %s", arg)
	}

	apiURL := fmt.Sprintf("%s/api/files/%s/download?format=json", c.BaseURL, arg)
	status, body, err := c.makeRequestFail("GET", apiURL, nil)
	if err != nil {
		if status == "404 Not Found" {
			return fmt.Errorf(">> %s not found. Please check that this file exists and you have access to it", arg)
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

	fileSize := resultJSON["file_size"].(float64)
	// user wants print whole file, check size first.
	if lines == -1 && fileSize > 10_000_000 {
		agree := yesNo("The size of the file is over 10Mb - are you sure you want to display the whole content?")
		if !agree {
			return fmt.Errorf(">> Cat cancelled")
		}
	}

	err = Head(fileURL, lines)
	if err != nil {
		return err
	}

	return nil
}

func (c *PFDAClient) downloadByChunks(uidsChunk []string, outputFilePath string, overwrite string) {
	apiURL := fmt.Sprintf("%s/api/files/bulk_download", c.BaseURL)
	jsonData, _ := json.Marshal(bulkIDs{
		IDs: uidsChunk,
	})
	_, body, _ := c.makeRequestFail("POST", apiURL, jsonData)

	var resultJSON []map[string]interface{}
	_ = json.Unmarshal(body, &resultJSON)

	downloaded := make(map[string]string)
	for _, file := range resultJSON {
		DownloadDirectly(file["url"].(string), outputFilePath, overwrite)
		downloaded[file["uid"].(string)] = ""
	}

	// check if all requested files were downloaded.
	for _, uid := range uidsChunk {
		_, found := downloaded[uid]
		if !found {
			fmt.Println(fmt.Errorf(">> Unable to download: %s", uid))
		}
	}

}

func (c *PFDAClient) parallelDownload(uids []string, outputFilePath string, overwrite string) {

	if len(uids) == 0 {
		return
	}
	fmt.Printf(">> Preparing to download: %d files \n", len(uids))
	var wg = sync.WaitGroup{}
	maxGoroutines := 5 // do not exceed 10 - magical TCP issues with lost packages appears.
	guard := make(chan struct{}, maxGoroutines)

	// create outputFilePath in case it was specified & doesn't exist yet - we assume user specified a dir name
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
				c.sendToStore(fileID, chunk)
				atomic.AddUint64(&totalSent, uint64(len(chunk.data)))
				currentSize := atomic.LoadUint64(&totalSent)
				totalSize := atomic.LoadInt64(size)
				if withProgressBar {
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
		err = fmt.Errorf("%s Request to '%s' failed with status %s. For 4xx status, check that the provided id and auth-key are still valid.\n\nResponse: %s", requestType, url, status, string(body))
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
		err = fmt.Errorf("%s Request to '%s' failed with status %s. For 4xx status, check that the provided id and auth-key are still valid.\n\nResponse: %s", requestType, url, status, string(body))
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

func inputError(msg string) {
	fmt.Println(fmt.Errorf(msg))
	os.Exit(1)
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
func pickFile(files []jsonFile, label string) string {

	options := make([]string, 0)
	ids := make([]string, 0)
	for _, file := range files {
		if file.Type == "UserFile" {
			options = append(options, "created "+file.CreatedAt+" - "+file.Size+" - "+file.Name+" ("+file.Uid+")")
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

// pass all flags, so we can optimize the table header - if in 'private' do not show added-by
func printListingResponse(response jsonListingPayload, flags map[string]bool) {
	if flags["json"] {
		prettyJSON, _ := json.MarshalIndent(response.Files, "", "    ")
		fmt.Printf("%s\n", string(prettyJSON))
	} else if flags["brief"] {
		printListingSimple(response.Files)
	} else {
		printListingVerbose(response.Files, response.Meta)
	}
}

func printListingSimple(files []jsonFile) {
	if len(files) == 0 {
		return
	}
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)

	fmt.Fprintln(writer, strings.Join([]string{"File/Folder ID", "Name"}, "\t")+"\t")

	for _, file := range files {
		if file.Type == "UserFile" {
			fmt.Fprintln(writer, strings.Join([]string{file.Uid, file.Name}, "\t")+"\t")
		} else {
			fmt.Fprintln(writer, strings.Join([]string{strconv.Itoa(file.Id), file.Name}, "\t")+"\t")
		}
	}
	writer.Flush()
}

func printListSpacesResponse(spaces []jsonSpace, flags map[string]bool) {
	if flags["json"] {
		prettyJSON, _ := json.MarshalIndent(spaces, "", "    ")
		fmt.Printf("%s\n", string(prettyJSON))
	} else if len(spaces) > 0 {
		writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)

		fmt.Fprintln(writer, strings.Join([]string{"ID", "Type", "Status", "Role", "Side", "Name"}, "\t")+"\t")
		for _, space := range spaces {
			fmt.Fprintln(writer, strings.Join([]string{strconv.Itoa(space.Id), space.Type, helpers.FormatValue(space.Protected, "Protected"), space.Role, space.Side, space.Title}, "\t")+"\t")
		}
		writer.Flush()

	}
}

func printListingVerbose(files []jsonFile, meta jsonMeta) {
	if len(files) == 0 {
		return
	}
	fmt.Printf("Scope: %s\nPath: %s\n\n", meta.Scope, meta.Path)

	isSpaceOrPublicContext := strings.Contains(meta.Scope, "space") || strings.Contains(meta.Scope, "Public")
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 2, '\t', tabwriter.AlignRight)

	if isSpaceOrPublicContext {
		fmt.Fprintln(writer, strings.Join([]string{"File/Folder ID", "State " + "\t", "Type", "Status", "Size", "Created", "Added By", "Name"}, "\t")+"\t")
		for _, file := range files {
			if file.Type == "UserFile" {
				fmt.Fprintln(writer, strings.Join([]string{file.Uid, file.State + "\t", file.Type, helpers.FormatValue(file.Locked, "Locked"), file.Size, file.CreatedAt, file.AddedBy, file.Name}, "\t")+"\t")
			} else {
				fmt.Fprintln(writer, strings.Join([]string{strconv.Itoa(file.Id), "\t", file.Type, helpers.FormatValue(file.Locked, "Locked"), "", file.CreatedAt, file.AddedBy, file.Name}, "\t")+"\t")
			}
		}
	} else {
		fmt.Fprintln(writer, strings.Join([]string{"File/Folder ID", "State" + "\t", "Type", "Status", "Size", "Created", "Name"}, "\t")+"\t")
		for _, file := range files {
			if file.Type == "UserFile" {
				fmt.Fprintln(writer, strings.Join([]string{file.Uid, file.State + "\t", file.Type, helpers.FormatValue(file.Locked, "Locked"), file.Size, file.CreatedAt, file.Name}, "\t")+"\t")
			} else {
				fmt.Fprintln(writer, strings.Join([]string{strconv.Itoa(file.Id), "\t", file.Type, helpers.FormatValue(file.Locked, "Locked"), "", file.CreatedAt, file.Name}, "\t")+"\t")
			}
		}
	}
	writer.Flush()
}

// HandleError Check for error, if found behave accordingly
func (c *PFDAClient) HandleError(err error) {
	if err != nil {
		fmt.Println(err)
		if !c.ContinueOnError {
			os.Exit(1)
		}
	}
}
