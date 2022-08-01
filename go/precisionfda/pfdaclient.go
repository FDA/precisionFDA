package precisionfda

import (
	"bytes"
	"crypto/md5"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"github.com/docker/go-units"
	"github.com/gosuri/uilive"
	"github.com/hashicorp/go-cleanhttp"     // required by go-retryablehttp
	"github.com/hashicorp/go-retryablehttp" // use http libraries from hashicorp for implement retry logic
    "github.com/manifoldco/promptui"
	"io"
	"io/ioutil"
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
	"time"
)


const userAgent = "Asset and File Uploader/2.1 (precisionFDA) Go-http-client/1.1"
const defaultNumRoutines = 10
const defaultChunkSize = 1<<26  // default 67MB (min. 5MB)
const minRoutines = 1
const maxRoutines = 100
const minChunkSize = 5*1<<11    // min. 5MB
const maxChunkSize = 1<<32      // max. 2GB
const maxFileSize = 5*1<<41     // max. 5TB

// retryablehttp defaults
const maxRetryCount = 5
const minRetryTime = 1          // seconds
const maxRetryTime = 30         // seconds

const https = "https://"

type IPFDAClient interface {
	CallAPI(route string, data string, outputFile string) error
	UploadAsset(rootFolderPath string, name string, readmeFilePath string) error
	UploadFile(path string, folderID string, spaceID string) error
	DownloadFile(fileId string, outputFilePath string) error

	SetChunkSize(chunkSize int)
	SetNumRoutines(numRoutines int)
}

type PFDAClient struct {
	BaseURL string
	NumRoutines int
	ChunkSize int
	MinRoutines int
	MaxRoutines int
	MinChunkSize int
	MaxChunkSize int
	MaxFileSize int

	Client *retryablehttp.Client
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
	return &c
}


// Wire objects
//
type jsonID struct {
	ID string `json:"id"`
}

type jsonChunkInfo struct {
	ID string `json:"id"`
	Size int `json:"size"`
	Index int `json:"index"`
	Md5 string `json:"md5"`
}

type jsonCreateFilePayload struct {
	Name string `json:"name"`
	Desc string `json:"description"`
	FolderID string `json:"folder_id"`
	Scope string `json:"scope"`
}

type jsonCreateAssetPayload struct {
	Name string `json:"name"`
	Desc string `json:"description"`
	Paths []string `json:"paths"`
}

type jsonFileDownloadPayload struct {
	FileURL string `json:"file_url"`
	FileSize int64 `json:"file_size"`
}

type uploadChunk struct {
	index int
	data []byte // slice/ptr
}


//  Below were migrated from pfda.go:
//
//  COMMAND FUNCTIONS
//
func (c *PFDAClient) CallAPI(route string, data string, outputFile string) error {
	// sanitize input
	route = strings.ToLower(route)
	url := c.BaseURL + "/api/" + route
	_, body, err := c.makeRequestFail("POST", url, []byte(data))
	if err != nil {
		return err
	}

	if (outputFile == "") {
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

	if (assetSize > maxFileSize) {
		inputError(fmt.Sprintf("Size of asset folder '%s' (%d) exceeds maximum allowed file size(%d).", rootFolderPath, assetSize, maxFileSize));
	}

	if (assetSize == 0) {
		inputError(fmt.Sprintf("Size of asset folder '%s' is 0. Uploading an empty asset is not allowed.", rootFolderPath));
	}

	// Read in the readme all at once
	readmeBuf, err := ioutil.ReadFile(readmeFilePath)
	if err != nil {
		return err
	}

	jsonData, err := json.Marshal(jsonCreateAssetPayload{
		Name: name,
		Desc: string(readmeBuf),
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
	wg := c.initWaitGroup(fileID, chunkPool, &assetSize)

	fmt.Println(">> Archiving asset...")

	// different approarch for WinOS tar command
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

// If folderID is empty, the file will be uploaded to the specified folder
// If spaceID is empty, the file will be uploaded to the user's home
func (c *PFDAClient) UploadFile(path string, folderID string, spaceID string) error {
	createURL := c.BaseURL + "/api/create_file"
	closeURL := c.BaseURL + "/api/close_file"

	scope := ""
	if spaceID != "" {
		_, err := strconv.Atoi(spaceID)
		if err != nil {
			return err
		}
		scope = "space-" + spaceID
	}
	jsonData, err := json.Marshal(jsonCreateFilePayload{
		Name: filepath.Base(path),
		Desc: "",
		FolderID: folderID,
		Scope: scope,
	})
	if err != nil {
		return err
	}

	f, err := os.Open(path)
	if err != nil {
		return err
	}
	defer f.Close()
	info, err := f.Stat()
	if err != nil {
		return err
	}

	size := info.Size()

	if (size > maxFileSize) {
		inputError(fmt.Sprintf("Size of file '%s' (%d) exceeds maximum allowed file size(%d).", path, size, maxFileSize));
	}

	if (size == 0) {
		inputError(fmt.Sprintf("Size of file '%s' is 0. Uploading an empty file is not allowed.", path));
	}

	fileID, err := c.createFileID(createURL, jsonData)
	if err != nil {
		return err
	}

	chunkPool := make(chan uploadChunk, c.NumRoutines)

	fmt.Printf(">> Uploading file %s\n", path)

	wg := c.initWaitGroup(fileID, chunkPool, &size)
	c.readAndChunk(f, chunkPool, &size)

	close(chunkPool)
	wg.Wait()

	fmt.Println(">| Uploaded 100%\n>> Finalizing file...")
	jsonData, err = json.Marshal(jsonID{
		ID: fileID,
	})
	if err != nil {
		return err
	}

	c.makeRequestFail("POST", closeURL, jsonData)
	fmt.Println(">> Done! Access your file at " + c.BaseURL + "/home/files/" + fileID)
	return nil
}

func (c *PFDAClient) DownloadFile(fileId string, outputFilePath string) error {
	apiURL := fmt.Sprintf("%s/api/files/%s/download?format=json", c.BaseURL, fileId)

	fmt.Println(">> Preparing to download")
	status, body, err := c.makeRequestFail("GET", apiURL, nil)
	if err != nil {
		if status == "404 Not Found" {
			return fmt.Errorf("File ID %s not found. Please check that this file exists and you have access to it.", fileId)
		} else {
			return err
		}
	}

	var resultJSON map[string]interface{}
	err = json.Unmarshal(body, &resultJSON)
	if err != nil {
		return err
	}

	if (resultJSON["file_url"] == nil) {
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
			return fmt.Errorf("Error: %s doesn't exist. Please create it first before running the command", outputFilePath)
		} else if _, err := os.Stat(filepath.Dir(outputFilePath)); err != nil {
			// This is now assumed to be a file path and not a dir path, and the parent directory does not exist
			return fmt.Errorf("Error: The parent directory %s of the specified output doesn't exist", filepath.Dir(outputFilePath))
		}
	}
	// After the above block, outputFilePath should contain the target file path and cannot be a directory

	if _, err := os.Stat(outputFilePath); err == nil {
		fmt.Printf(">> File %s already exists\n", outputFilePath)
		overwrite := yesNo("  Overwrite? ")
		if !overwrite {
			return fmt.Errorf("Download cancelled")
		}
	}

	fmt.Printf(">> Output File :  %s\n", outputFilePath)

	err = DownloadWithProgress(fileURL, int64(fileSize), outputFilePath)
	if err != nil {
		return err
	}

	fmt.Printf(">> Done!\n\n")
	return nil
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

	if (resultJSON["id"] == nil) {
		return "", fmt.Errorf("No id in response!\n\nResponse: %s", string(body))
	}
	fileID := resultJSON["id"].(string)
	return fileID, nil
}

func (c *PFDAClient) initWaitGroup(fileID string, chunkPool <-chan uploadChunk, size *int64) (wg *sync.WaitGroup) {
	numRoutines := min(c.NumRoutines, int(math.Ceil(float64(*size)/float64(c.ChunkSize))))

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
				fmt.Fprintf(writer, "     %.1f%% (%s / %s)\n",
							100*float64(currentSize)/float64(totalSize), units.BytesSize(float64(currentSize)), units.BytesSize(float64(totalSize)))
				writer.Flush()
			}
			g.Done()
		}()
	}
	wg = &g
	return
}

func (c *PFDAClient) makeRequestFail(requestType string, url string, data []byte) (status string, body []byte, err error) {
	req, err := retryablehttp.NewRequest(requestType, url, bytes.NewReader(data))
	check(err)
	c.setPostHeaders(req)

	resp, err := c.Client.Do(req)
	check(err)
	defer resp.Body.Close()
	status = resp.Status
	body, _ = ioutil.ReadAll(resp.Body)

	if (!strings.HasPrefix(status, "2")) {
		err = fmt.Errorf("%s Request to '%s' failed with status %s. For 4xx status, check that the provided app-id and auth-key are still valid.\n\nResponse: %s", requestType, url, status, string(body))
	}
	return status, body, err
}

func (c *PFDAClient) makeRequestWithHeadersFail(requestType string, url string, headers map[string]interface{}, data []byte) (status string, body []byte, err error) {
	req, err := retryablehttp.NewRequest(requestType, url, bytes.NewReader(data))
	check(err)
	for header, value := range headers {
		req.Header.Set(header, value.(string))
	}

	resp, err := c.Client.Do(req)
	check(err)
	defer resp.Body.Close()

	status = resp.Status
	body, _ = ioutil.ReadAll(resp.Body)

	if (!strings.HasPrefix(status, "2")) {
		err = fmt.Errorf("%s Request to '%s' failed with status %s. For 4xx status, check that the provided app-id and auth-key are still valid.\n\nResponse: %s", requestType, url, status, string(body))
	}
	return status, body, err
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
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
		totalDataLength += i;
		// Only upload an empty chunk if empty file
		if i == 0 && chunkIndex > 1 {
			break
		}
		ch <- uploadChunk{
			index: chunkIndex,
			data: byteBuf[:i], // use slice
		}
		chunkIndex++
	}
	atomic.StoreInt64(size, int64(totalDataLength))
}

func (c *PFDAClient) sendToStore(id string, chunk uploadChunk) error {
	uploadURL := c.BaseURL + "/api/get_upload_url"
	md5Sum := md5.Sum(chunk.data)
	jsonData, err := json.Marshal(jsonChunkInfo{
		ID: id,
		Size: len(chunk.data),
		Index: chunk.index,
		Md5: hex.EncodeToString(md5Sum[:]),
	})

	_, body, err := c.makeRequestFail("POST", uploadURL, jsonData)
	if err != nil {
		return err
	}

	var resultJSON map[string]interface{}
	err = json.Unmarshal(body, &resultJSON)
	check(err)
	if (resultJSON["url"] == "") {
		panic("No url in response!")
	}
	_, _, err = c.makeRequestWithHeadersFail("PUT", resultJSON["url"].(string), resultJSON["headers"].(map[string]interface{}), chunk.data)
	return err
}

func (c *PFDAClient) setPostHeaders(req *retryablehttp.Request) {
	req.Header.Set("User-Agent", userAgent)
	req.Header.Set("Authorization", "Key " + c.AuthKey)
	req.Header.Set("Content-Type", "application/json")
}


//
//  HELPER FUNCTIONS
//
// TODO - All calls to panic should be removed in favour of returning errors
func check(e error) {
	if e != nil {
		panic(e)
	}
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
