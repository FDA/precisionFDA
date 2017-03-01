// PrecisionFDA Uploader
// Version 2.0
//
// Written in Go
//
package main

import (
  "bytes"
  "crypto/md5"
  "crypto/tls"
  "encoding/hex"
  "encoding/json"
  "flag"
  "fmt"
  "github.com/hashicorp/go-cleanhttp"     // required by go-retryablehttp
  "github.com/hashicorp/go-retryablehttp" // use http libraries from hashicorp for implement retry logic
  "io"
  "io/ioutil"
  "log"
  "math"
  "net/http"
  "os"
  "os/exec"
  "path/filepath"
  "strconv"
  "strings"
  "sync"
  "time"
)

//
// CONSTANTS
//
const userAgent = "Asset and File Uploader/2.0 (precisionFDA) Go-http-client/1.1"
const minRetryTime = 1          // seconds
const maxRetryTime = 30         // seconds
const maxRetryCount = 5
const defaultNumRoutines = 10
const defaultChunkSize = 1<<26  // default 67MB (min. 5MB)
const maxRoutines = 100
const minRoutines = 1
const maxChunkSize = 1<<32      // max. 2GB
const minChunkSize = 5*1<<11    // min. 5MB
const maxFileSize = 5*1<<41     // max. 5TB
const https = "https://"
const defaultSkipVerify = "false"
const usageString = `
***********************
PFDA UPLOADER TOOL v2.0
***********************
To upload a file:

  pfda --cmd upload-file [--key <KEY>] --file </PATH/TO/FILE>

To upload an asset:

  pfda --cmd upload-asset [--key <KEY>] --name <NAME{.tar,.tar.gz}> --root </PATH/TO/ROOT/FOLDER> --readme <README{.txt,.md}>

To call a precisionFDA API route:

  pfda --cmd api [--key <KEY>] --route <API_ROUTE> --json <JSON_PAYLOAD> [--output </PATH/TO/OUTPUT/FILE>]
`
//
// GLOBAL VARIABLES
//
var globalKey string
var configPath = os.Getenv("HOME") + "/.pfda_config"
var globalNumRoutines int
var globalChunkSize int
var defaultURL = "precision.fda.gov"
var baseURL = https + defaultURL

var client = &retryablehttp.Client{
  HTTPClient:   cleanhttp.DefaultClient(),
  Logger:       log.New(ioutil.Discard, "", 0),   // Throw away retryablehttp internal logging
  RetryWaitMin: minRetryTime * time.Second,
  RetryWaitMax: maxRetryTime * time.Second,
  RetryMax:     maxRetryCount,
  CheckRetry:   retryablehttp.DefaultRetryPolicy,
}

// Structs: Note that exported members (those visible to other packages) must be capitalized
type jsonID struct {
  ID string `json:"id"`
}
type jsonChunkInfo struct {
  ID string `json:"id"`
  Size int `json:"size"`
  Index int `json:"index"`
  Md5 string `json:"md5"`
}
type jsonFileInfo struct {
  Name string `json:"name"`
  Desc string `json:"description"`
}
type jsonAssetInfo struct {
  Name string `json:"name"`
  Desc string `json:"description"`
  Paths []string `json:"paths"`
}
type jsonConfig struct {
  Key string `json:key`
}
type uploadChunk struct {
  index int
  data []byte // slice/ptr
}

func main() {
  // Define command line arguments
  command := flag.String("cmd", "", "Command to execute. Must be one of ['upload-file','upload-asset','api'].")
  authKey := flag.String("key", "", "Authorization key. Required if a previous config doesn't exist.")
  apiRoute := flag.String("route", "", "Name of precisionFDA API route to call.")
  jsonInput := flag.String("json", "", "JSON payload for specified API call (if any).")
  inputFilePath := flag.String("file", "", "Path to file for 'upload-file'")
  assetFolderPath := flag.String("root", "", "Path to root folder for 'upload-asset'")
  assetName := flag.String("name", "", "Name of uploaded asset file. Must end with '.tar' or '.tar.gz'.")
  readmeFilePath := flag.String("readme", "", "Readme file for uploaded asset. Must end with '.txt' or '.md'.")
  outputFilePath := flag.String("output", "", "[optional] File path to write api call response data. Defaults to stdout.")
  inputChunkSize := flag.Int("chunksize", defaultChunkSize, "[optional] Size of each upload chunk in bytes (Min 5MB,/Max 2GB).")
  inputNumRoutines := flag.Int("threads", defaultNumRoutines, "[optional] Maximum number of upload threads to spawn (Max 100).")
  server := flag.String("server", defaultURL, "[optional] Server to connect and make requests to.")
  skipVerify := flag.String("skipverify", defaultSkipVerify, "[optional] Boolean string to skip certificate verification.")

  // Parse command line args
  flag.Parse()

  if *authKey == "" {
    // Check config if '-key' not provided
    f, err := ioutil.ReadFile(configPath)
    if err != nil {
      // Internal error reading config
      if !os.IsNotExist(err) {
        panic(fmt.Errorf("Error reading existing config file from path %s: %s", configPath, err.Error()))
      }
      // No config exists at ~/.pfda_config
      fmt.Println(usageString)
      flag.Usage()
      inputError(fmt.Sprintf("Authorization key not provided and configuration file '%s' not found. Please provide it as [--key <KEY>].", configPath))
    }
    var config jsonConfig
    err = json.Unmarshal(f, &config)
    check(err)
    globalKey = config.Key
  } else {
    // '-key' provided, set globalKey
    globalKey = *authKey
  }

  if *server != "" && *server != defaultURL {
    baseURL = https + *server
  }

  b, err := strconv.ParseBool(*skipVerify)
  check(err)
  if b {
    client.HTTPClient.Transport.(*http.Transport).TLSClientConfig = &tls.Config{InsecureSkipVerify: true}
  }

  // Customized checks for each command
  switch *command {
  case "upload-asset":
    if *assetFolderPath == "" {
      inputError("Root directory for the asset is required. Provide it as [--root <ASSET_ROOT>].")
    }

    f, err := os.Stat(*assetFolderPath)
    if os.IsNotExist(err) || !f.IsDir() {
      inputError(fmt.Sprintf("Input asset folder path '%s' does not exist or is not a directory.", *assetFolderPath))
    }

    if *assetName == "" {
      inputError("Asset name (ending with .tar or .tar.gz) is required. Provide it as [--name <ASSET_NAME>].")
    }

    if !strings.HasSuffix(*assetName, ".tar") && !strings.HasSuffix(*assetName, ".tar.gz")  {
      inputError(fmt.Sprintf("Input asset name '%s' does not end with '.tar' or '.tar.gz'.", *assetName))
    }

    if *readmeFilePath == "" {
      inputError("Readme file for the asset (ending with .txt or .md) is required. Provide it as [--readme <ASSET_README>].")
    }

    f, err = os.Stat(*readmeFilePath)
    if os.IsNotExist(err) || f.IsDir() {
      inputError(fmt.Sprintf("Input readme file path '%s' does not exist or is a directory.", *readmeFilePath))
    }

    checkUploadArgs(*inputChunkSize, *inputNumRoutines)
    uploadAsset(*assetFolderPath, *assetName, *readmeFilePath)

  case "upload-file":
    if *inputFilePath == "" {
      inputError("Path to file for upload is required. Please provide it as [--file <FILE_PATH>].")
    }

    f, err := os.Stat(*inputFilePath)
    if os.IsNotExist(err) || f.IsDir() {
      inputError(fmt.Sprintf("Input file path '%s' does not exist or is a directory.", *inputFilePath))
    }

    checkUploadArgs(*inputChunkSize, *inputNumRoutines)
    uploadFile(*inputFilePath)

  case "api":
    if *apiRoute == "" {
      inputError("API route is required. Please provide it as '--route <API_ROUTE_NAME>'.")
    }

    if *jsonInput != "" && !isValidJSON(*jsonInput) {
      inputError(fmt.Sprintf("Provided JSON '%s' is not valid. Please provide the input in valid JSON format.", *jsonInput))
    }

    callRoute(*apiRoute, *jsonInput, *outputFilePath)

  case "":
    // Empty command
    fmt.Println(usageString)
    flag.Usage()
    fmt.Println("Command to execute is required. Provide it as '--cmd {'upload-file','upload-asset','api'}'")
    os.Exit(1)

  default:
    // Invalid, non-empty command
    fmt.Printf("Command ' %s' not found. Must be one of ['upload-file','upload-asset','api'}].\n", *command)
    os.Exit(1)
  }

  // Write configuration and save key
  if *authKey != "" {
    f, err := os.Create(configPath)
    check(err)
    defer f.Close()

    jsonData, err := json.Marshal(jsonConfig{
      Key: *authKey,
    })
    check(err)

    _, err = f.Write(jsonData)
    check(err)
    fmt.Printf("Saved authorization key in config file '%s'. A new key does not need to be provided for 24 hours from the generation time of the provided key.\n", configPath)
  }
}

//
//  COMMAND FUNCTIONS
//
func callRoute(route string, data string, outputFile string) {
  // sanitize input
  route = strings.ToLower(route)
  url := baseURL + "/api/" + route
  _, body := makeRequestFail("POST", url, []byte(data))

  if (outputFile == "") {
    fmt.Printf("Return response data for API call '%s:\n%s\n", route, string(body))
  } else {
    f, err := os.Create(outputFile)
    check(err)
    defer f.Close()
    bytesWritten, err := f.Write(body)
    check(err)
    fmt.Printf("Downloaded response data for API call: %s (%d bytes) to file '%s'\n", route, bytesWritten, outputFile)
  }
}

func uploadAsset(rootFolderPath string, name string, readmeFilePath string) {
  createURL := baseURL + "/api/create_asset"
  closeURL := baseURL + "/api/close_asset"

  // Get list of all asset files
  fileList := []string{}
  assetSize := int64(0)
  err := filepath.Walk(rootFolderPath, func(path string, f os.FileInfo, err error) error {
      if !f.IsDir() {
        relPath, err := filepath.Rel(rootFolderPath, path)
        check(err)
        fileList = append(fileList, relPath)
        assetSize += f.Size()
      }
      return nil
  })
  check(err)

  if (assetSize > maxFileSize) {
    inputError(fmt.Sprintf("Size of asset folder '%s' (%d) exceeds maximum allowed file size(%d).", rootFolderPath, assetSize, maxFileSize));
  }

  // Read in the readme all at once
  readmeBuf, err := ioutil.ReadFile(readmeFilePath)
  check(err)

  jsonData, err := json.Marshal(jsonAssetInfo{
    Name: name,
    Desc: string(readmeBuf),
    Paths: fileList[:],
  })
  check(err)

  fileID := createFileID(createURL, jsonData)
  chunkPool := make(chan uploadChunk, globalNumRoutines)
  wg := initWaitGroup(fileID, chunkPool, assetSize)

  fmt.Println(">> Archiving asset...")
  cmd := exec.Command("tar", "-c", "-C", rootFolderPath, ".")
  if strings.HasSuffix(name, ".tar.gz") {
    cmd = exec.Command("tar", "-cz", "-C", rootFolderPath, ".")
  }
  stdout, err := cmd.StdoutPipe()
  check(err)
  err = cmd.Start()
  check(err)

  fmt.Print(">> Uploading asset |")
  f, err := os.Open(rootFolderPath)
  check(err)
  defer f.Close()
  readAndChunk(stdout, chunkPool, assetSize)
  close(chunkPool)
  wg.Wait()

  fmt.Println(">| Uploaded 100%\n>> Finalizing asset...")
  jsonData, err = json.Marshal(jsonID{
    ID: fileID,
  })
  check(err)

  makeRequestFail("POST", closeURL, jsonData)
  fmt.Println(">> Done! Access your asset at " + baseURL + "/app_assets/" + fileID)
}

func uploadFile(path string) {
  createURL := baseURL + "/api/create_file"
  closeURL := baseURL + "/api/close_file"

  jsonData, err := json.Marshal(jsonAssetInfo{
    Name: filepath.Base(path),
    Desc: "",
  })
  check(err)

  fileID := createFileID(createURL, jsonData)
  chunkPool := make(chan uploadChunk, globalNumRoutines)

  fmt.Print(">> Uploading file |")
  f, err := os.Open(path)
  check(err)
  defer f.Close()
  info, err := f.Stat()
  check(err)
  if (info.Size() > maxFileSize) {
    inputError(fmt.Sprintf("Size of file '%s' (%d) exceeds maximum allowed file size(%d).", path, info.Size(), maxFileSize));
  }

  wg := initWaitGroup(fileID, chunkPool, info.Size())
  readAndChunk(f, chunkPool, info.Size())
  close(chunkPool)
  wg.Wait()

  fmt.Println(">| Uploaded 100%\n>> Finalizing file...")
  jsonData, err = json.Marshal(jsonID{
    ID: fileID,
  })
  check(err)

  makeRequestFail("POST", closeURL, jsonData)
  fmt.Println(">> Done! Access your file at " + baseURL + "/files/" + fileID)
}

//
//  HELPER FUNCTIONS
//
func check(e error) {
  if e != nil {
    panic(e)
  }
}

func checkUploadArgs(chunkSize int, numRoutines int) {
  if chunkSize > maxChunkSize || chunkSize < minChunkSize {
    inputError("Chunk size must be between 5MB and 5GB.")
  } else {
    globalChunkSize = chunkSize
  }

  if numRoutines > maxRoutines || numRoutines < minRoutines {
    inputError("Maximum number of threads must an integer within the range of [1-100].")
  } else {
    globalNumRoutines = numRoutines
  }
}

func createFileID(url string, data []byte) (fileID string) {
  _, body := makeRequestFail("POST", url, data)

  var resultJSON map[string]interface{}
  err := json.Unmarshal(body, &resultJSON)
  check(err)
  if (resultJSON["id"] == nil) {
    panic("No id in response!")
  }
  fileID = resultJSON["id"].(string)
  return
}

func initWaitGroup(fileID string, chunkPool <-chan uploadChunk, size int64) (wg *sync.WaitGroup) {
  numRoutines := min(globalNumRoutines, int(math.Ceil(float64(size)/float64(globalChunkSize))))

  var g sync.WaitGroup
  for i := 0; i < numRoutines; i++ {
    g.Add(1)
    go func() {
      for chunk := range chunkPool {
        fmt.Printf("=")
        sendToStore(fileID, chunk)
      }
      g.Done()
    }()
  }
  wg = &g
  return
}

func inputError(msg string) {
  fmt.Println(fmt.Errorf(msg))
  os.Exit(1)
}

func isValidJSON(s string) bool {
  var js interface{}
  return json.Unmarshal([]byte(s), &js) == nil
}

func makeRequestFail(requestType string, url string, data []byte) (status string, body []byte) {
  req, err := retryablehttp.NewRequest(requestType, url, bytes.NewReader(data))
  check(err)
  setPostHeaders(req)

  resp, err := client.Do(req)
  check(err)
  defer resp.Body.Close()
  status = resp.Status
  body, _ = ioutil.ReadAll(resp.Body)

  if (!strings.HasPrefix(status, "2")) {
    urlFailure(requestType, url, status)
  }
  return
}

func makeRequestWithHeadersFail(requestType string, url string, headers map[string]interface{}, data []byte) (status string, body []byte) {
  req, err := retryablehttp.NewRequest(requestType, url, bytes.NewReader(data))
  check(err)
  for header, value := range headers {
    req.Header.Set(header, value.(string))
  }

  resp, err := client.Do(req)
  check(err)
  defer resp.Body.Close()
  status = resp.Status
  body, _ = ioutil.ReadAll(resp.Body)

  if (!strings.HasPrefix(status, "2")) {
    urlFailure(requestType, url, status)
  }
  return
}

func min(a, b int) int {
  if a < b {
    return a
  }
  return b
}

func readAndChunk(f io.ReadCloser, c chan<- uploadChunk, size int64) {
  // dynamically adjust chunkSize
  chunkIndex := 1
  for {
    byteBuf := make([]byte, globalChunkSize)
    i := 0
    for i < globalChunkSize {
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
    // Only upload an empty chunk if empty file
    if i == 0 && chunkIndex > 1 {
      break
    }
    c <- uploadChunk{
      index: chunkIndex,
      data: byteBuf[:i], // use slice
    }
    chunkIndex++
  }
}

func sendToStore(id string, chunk uploadChunk) {
  uploadURL := baseURL + "/api/get_upload_url"
  md5Sum := md5.Sum(chunk.data)
  jsonData, err := json.Marshal(jsonChunkInfo{
    ID: id,
    Size: len(chunk.data),
    Index: chunk.index,
    Md5: hex.EncodeToString(md5Sum[:]),
  })

  _, body := makeRequestFail("POST", uploadURL, jsonData)

  var resultJSON map[string]interface{}
  err = json.Unmarshal(body, &resultJSON)
  check(err)
  if (resultJSON["url"] == "") {
    panic("No url in response!")
  }
  makeRequestWithHeadersFail("PUT", resultJSON["url"].(string), resultJSON["headers"].(map[string]interface{}), chunk.data)
}


func setPostHeaders(req *retryablehttp.Request) {
  req.Header.Set("User-Agent", userAgent)
  req.Header.Set("Authorization", "Key " + globalKey)
  req.Header.Set("Content-Type", "application/json")
}

func urlFailure(requestType string, url string, status string) {
  log.Fatalln(fmt.Errorf("%s Request to '%s' failed with status %s. For 4xx status, check that the provided app-id and auth-key are still valid", requestType, url, status))
}
