package precisionfda

import (
	"bufio"
	"crypto/md5"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"math"
	"net/url"
	"os"
	"path/filepath"
	"regexp"
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

// MinChunkSize is the smallest allowed upload chunk size, also used by
// callers to derive a chunk size from the file size.
const MinChunkSize = 1 << 24    // min. 16MB
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
	Rmdir(args []string, recursive bool) error
	Rm(args []string, folderID string, spaceID string) error
	Head(arg string, lines int) error
	GetScope() error
	CreateDiscussion(spaceID string, jsonBody string) error
	CreateReply(jsonBody string) error
	EditDiscussion(jsonBody string) error
	EditReply(jsonBody string) error
	DeleteDiscussion(discussionID string) error
	DeleteReply(replyID string) error
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
	ContinueOnError bool
	JsonResponse    bool

	// jsonBatch, when non-nil, accumulates per-item JSON results so a command
	// that reports on many items (rm, rmdir, multi-file upload/download, ...)
	// can emit them as a single JSON array instead of many concatenated,
	// unparseable objects. jsonMu guards it because some batches emit from
	// concurrent goroutines.
	jsonBatch *[]any
	jsonMu    sync.Mutex

	// reportedErrs logs the failures already shown to the user so batch
	// commands can continue past individual failures and still exit non-zero
	// at the end (see errorScope).
	reportedErrs reportedErrs

	Client  *retryablehttp.Client
	AuthKey string
}

func NewPFDAClient(serverURL string) *PFDAClient {
	c := PFDAClient{}
	c.BaseURL = https + serverURL
	c.NumRoutines = defaultNumRoutines
	c.ChunkSize = defaultChunkSize
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

// startJSONBatch begins collecting per-item JSON output so it can be emitted as
// a single JSON array (a valid, parseable document). It returns a finish func
// that prints the array; the func only has an effect in JSON mode. Batches do
// not nest: if one is already active the call is a no-op and items flow into the
// outer batch, so the outermost command still yields a single array.
func (c *PFDAClient) startJSONBatch() func() {
	if !c.JsonResponse {
		return func() {}
	}
	c.jsonMu.Lock()
	defer c.jsonMu.Unlock()
	if c.jsonBatch != nil {
		return func() {} // already batching (e.g. nested call) -> no-op
	}
	batch := make([]any, 0)
	c.jsonBatch = &batch
	return c.finishJSONBatch
}

func (c *PFDAClient) finishJSONBatch() {
	c.jsonMu.Lock()
	if c.jsonBatch == nil {
		c.jsonMu.Unlock()
		return
	}
	batch := *c.jsonBatch
	c.jsonBatch = nil
	c.jsonMu.Unlock()
	helpers.PrettyPrint(batch)
}

// canPrompt reports whether an interactive prompt can be put in front of the
// user. It cannot in -json mode: promptui draws its widget onto stdout, which
// corrupts the JSON document, and then aborts the process outright when stdin is
// not a terminal - before the deferred batch flush has run, so the results
// already collected are lost with it.
//
// Every prompt site is guarded by this. Where the arguments already given settle
// the question, the guard simply takes that answer - see DownloadFile's
// -overwrite handling, or Head's request for the whole file. Where only the user
// could have decided, it fails with an error naming what settles it
// non-interactively instead of guessing on their behalf; the more so as two of
// those decisions are about which files to delete.
func (c *PFDAClient) canPrompt() bool {
	return !c.JsonResponse
}

// emitItem reports one item of a command's output in whichever form the caller
// asked for: the JSON value when -json is set, the formatted line otherwise.
// Taking both forms at a single call site is what keeps them from diverging -
// a caller cannot emit JSON into plain-text output, nor add a field to the JSON
// shape and forget that the text form exists. textFormat is a Printf format and
// must carry its own trailing newline.
func (c *PFDAClient) emitItem(item any, textFormat string, textArgs ...any) {
	if !c.JsonResponse {
		fmt.Printf(textFormat, textArgs...)
		return
	}
	c.emitJSONItem(item)
}

// emitResult is emitItem for the generic {"result": ...} shape.
func (c *PFDAClient) emitResult(result string, textFormat string, textArgs ...any) {
	c.emitItem(jsonResult{Result: result}, textFormat, textArgs...)
}

// emitJSONItem records a single JSON result. When a batch is active the item is
// appended to it for one array emission; otherwise it is printed immediately as
// a standalone object (used by single-item commands). Safe for concurrent use.
//
// Prefer emitItem: it pairs the JSON value with its plain-text form so the two
// cannot drift. This is the JSON half on its own, and the guard below is what
// keeps a caller that reaches for it directly from printing JSON into plain-text
// output.
func (c *PFDAClient) emitJSONItem(item any) {
	if !c.JsonResponse {
		return
	}
	c.jsonMu.Lock()
	defer c.jsonMu.Unlock()
	if c.jsonBatch != nil {
		*c.jsonBatch = append(*c.jsonBatch, item)
		return
	}
	helpers.PrettyPrint(item)
}

// emitError reports err to the user (in JSON mode into the active batch) and
// records it so the command exits non-zero. An error that was already reported
// elsewhere is dropped: it was recorded where it was reported (every place that
// marks an error reported emits it first), so it is already in the log of the
// enclosing error scope, which was opened before the failing sub-operation ran.
// Recording it again would duplicate the log entry - visible when a failure
// bubbles up through a batch command, e.g. UploadFolder to UploadMultipleFiles
// or a recursive Download to HandleError - and emitting it again would
// duplicate the output.
func (c *PFDAClient) emitError(err error) {
	if err == nil || IsReported(err) {
		return
	}
	c.reportedErrs.record(err)
	if c.JsonResponse {
		c.emitJSONItem(helpers.ErrorResponse{Error: err.Error()})
		return
	}
	helpers.PrintError(err, false)
}

// Wire objects
type jsonID struct {
	ID string `json:"id"`
}

// jsonResult is the generic {"result": ...} shape for commands that report an
// outcome rather than an entity.
type jsonResult struct {
	Result string `json:"result"`
}

// jsonURL is the JSON shape of a link to a created or uploaded entity.
type jsonURL struct {
	Url string `json:"url"`
}

// jsonJobResult is the JSON shape of a launched job. jsonHTTPSAppResult adds the
// workstation URL an HTTPS app is reached at, which is only known after polling.
type jsonJobResult struct {
	JobUID       string `json:"jobUid"`
	ExecutionURL string `json:"executionUrl"`
}

type jsonHTTPSAppResult struct {
	JobUID         string `json:"jobUid"`
	ExecutionURL   string `json:"executionUrl"`
	WorkstationURL string `json:"workstationUrl"`
}

// jsonRemovedFile / jsonRemovedFolder are the JSON shapes of one removed node.
type jsonRemovedFile struct {
	Uid string `json:"uid"`
}

type jsonRemovedFolder struct {
	ID int `json:"id"`
}

// jsonDownloadResult is the JSON shape of one downloaded file - shared by the
// single-file and the bulk download paths so consumers see a single schema.
// Skipped marks a file that was left untouched because it already existed and
// -overwrite was not set; that is informational, not a failure.
type jsonDownloadResult struct {
	FileName string `json:"file_name"`
	Path     string `json:"path"`
	Skipped  bool   `json:"skipped,omitempty"`
}

// jsonUploadResult is the JSON shape of one uploaded file. The id and name are
// reported next to the url so a consumer does not have to parse them back out
// of it.
type jsonUploadResult struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	Url  string `json:"url"`
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

// jsonMkdirResult is a single created folder as reported by `mkdir --json`.
type jsonMkdirResult struct {
	Name string `json:"name"`
	ID   int    `json:"id"`
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

// If folderID is not empty, the file will be uploaded to the specified folder
// If spaceID is empty, the file will be uploaded to the user's home
func (c *PFDAClient) UploadFile(path string, folderID string, spaceID string, withProgressBar bool) error {

	// Batch from the very start so JSON output - including pre-upload
	// validation failures - is always a single array; nested calls from the
	// multi-file and folder uploads reuse the outer batch.
	finishJSON := c.startJSONBatch()
	defer finishJSON()

	// reportValidation reports a pre-upload failure (into the JSON batch in
	// JSON mode) so the command still emits one parseable array, and marks it
	// reported so the top level only converts it into a non-zero exit code.
	reportValidation := func(err error) error {
		c.emitError(err)
		return AsReported(err)
	}

	file, err := os.Open(path)
	if err != nil {
		return reportValidation(err)
	}
	defer file.Close()

	info, err := file.Stat()
	if err != nil {
		return reportValidation(err)
	}

	size := info.Size()
	if size > maxFileSize {
		return reportValidation(fmt.Errorf("Size of file '%s' (%d) exceeds maximum allowed file size (%d)", path, size, maxFileSize))
	}

	if size == 0 {
		return reportValidation(fmt.Errorf("Size of file '%s' is 0 - uploading an empty file is not allowed", path))
	}

	if err := c.Upload(&*file, path, folderID, spaceID, size, withProgressBar); err != nil {
		// Report the failure (into the JSON batch in JSON mode) and keep going -
		// callers uploading several files continue with the remaining ones. The
		// reported error still makes the command exit non-zero.
		c.emitError(fmt.Errorf("uploading '%s' failed: %w", path, err))
		return AsReported(err)
	}

	return nil
}

func (c *PFDAClient) UploadStdin(fileName string, folderID string, spaceID string, withProgressBar bool) error {
	// we do not know the size, stdin is buffered stream of data
	size := int64(1)
	// stdin has to be wrapped in those - otherwise not working as expected with linux piping
	stdin := io.NopCloser(bufio.NewReader(os.Stdin))

	// Batch so JSON output is always a single array.
	finishJSON := c.startJSONBatch()
	defer finishJSON()

	if err := c.Upload(stdin, fileName, folderID, spaceID, size, withProgressBar); err != nil {
		c.emitError(err)
		return AsReported(err)
	}
	return nil
}

func (c *PFDAClient) Upload(file io.ReadCloser, path string, folderID string, spaceID string, size int64, withProgressBar bool) error {
	createURL := c.BaseURL + "/api/create_file"

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

	name := filepath.Base(path)
	jsonData, err := json.Marshal(jsonCreateFilePayload{
		Name:       name,
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

	wait, abort := c.initWaitGroup(fileID, chunkPool, &size, withProgressBar)
	readErr := c.readAndChunk(file, chunkPool, &size, abort)
	close(chunkPool)

	// A chunk or read failure aborts this upload but no longer exits the
	// process, so a multi-file upload can carry on with the remaining files.
	if err := wait(); err != nil {
		return fmt.Errorf("uploading file: %w", err)
	}
	if readErr != nil {
		return fmt.Errorf("reading file: %w", readErr)
	}

	c.SetTags(fileID, []string{tagCLI})

	if withProgressBar && !c.JsonResponse {
		fmt.Println(">> Finalizing file...")
	}

	closeURL := c.BaseURL + "/api/v2/files/" + fileID + "/close"
	if _, err := c.makeRequest("PATCH", closeURL, nil); err != nil {
		return err
	}
	var finalUrl string
	if spaceID != "" {
		finalUrl = c.BaseURL + "/spaces/" + spaceID + "/files/" + fileID
	} else {
		finalUrl = c.BaseURL + "/home/files/" + fileID
	}

	// N.B. two spaces after the colon - fmt.Println used to add one between its
	// operands, and the plain-text output is kept byte-for-byte identical.
	c.emitItem(jsonUploadResult{ID: fileID, Name: name, Url: finalUrl}, ">> Uploaded:  %s\n", path)

	if withProgressBar && !c.JsonResponse {
		fmt.Println(">> Done! Access your file at " + finalUrl)
	}

	return nil
}

func (c *PFDAClient) UploadFolder(folderPath string, folderID string, spaceID string) error {
	// Report only failures of this operation, not of earlier ones on the client.
	reported := c.errorScope()
	// Emit uploaded files (and the final folder URL) as a single JSON array;
	// per-file uploads happen in concurrent goroutines below, so the batch's
	// collector is synchronized.
	finishJSON := c.startJSONBatch()
	defer finishJSON()

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
		// Report into the active batch so JSON mode still emits a single valid
		// array document instead of an array followed by a bare error object.
		c.emitError(err)
		return AsReported(err)
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
				c.emitError(err)
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

	c.emitItem(jsonURL{Url: finalUrl}, ">> Done! Access your files at %s\n", finalUrl)
	return reported()
}

func (c *PFDAClient) UploadMultipleFiles(paths []string, folderID string, spaceID string) error {

	// Report only failures of this operation, not of earlier ones on the client.
	reported := c.errorScope()
	// Emit uploaded files as a single JSON array rather than concatenated objects.
	finishJSON := c.startJSONBatch()
	defer finishJSON()

	if !c.JsonResponse {
		fmt.Printf(">> Uploading multiple files...\n")
	}

	// this could be done in parallel - be careful to used memory otherwise will get terminated by kernel OOM-killer.
	for _, path := range paths {
		f, err := os.Stat(path)
		if err != nil {
			c.emitError(fmt.Errorf("Input path '%s' does not exist or is not accessible - skipping", path))
			continue
		}
		path = filepath.Clean(path)
		var uploadErr error
		if f.IsDir() {
			uploadErr = c.UploadFolder(path, folderID, spaceID)
		} else {
			uploadErr = c.UploadFile(path, folderID, spaceID, false)
		}
		// Already-reported errors are dropped here - the folder/file upload that
		// failed has both printed and recorded them.
		c.emitError(uploadErr)
	}

	return reported()
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

	fileName := fileNameFromUrl(fileURL)

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
	if _, err := os.Stat(outputFilePath); err == nil && overwrite != "true" {
		// Same condition and outcome as the bulk path in DownloadDirectly: a
		// file already on disk that -overwrite does not authorise replacing is
		// skipped, not failed, so re-running a download is idempotent.
		//
		// -overwrite=false says so outright. An omitted -overwrite would ask,
		// but only a human can answer - and when they cannot be asked (see
		// canPrompt), leaving the file alone is the answer that loses nothing.
		if overwrite == "false" || !c.canPrompt() {
			c.emitSkippedDownload(fileName, outputFilePath)
			return nil
		}
		fmt.Printf(">> File %s already exists\n", outputFilePath)
		dialogOverwrite, err := yesNo("  Overwrite already existing path? ")
		if err != nil {
			return err
		}
		if !dialogOverwrite {
			return fmt.Errorf("Download cancelled")
		}
	}

	if !c.JsonResponse {
		fmt.Printf(">> Output File :  %s\n", outputFilePath)
	}
	withProgressBar := !c.JsonResponse
	err := c.DownloadFromUrl(fileURL, outputFilePath, int64(fileSize), withProgressBar)
	if err != nil {
		return err
	}
	c.emitItem(jsonDownloadResult{FileName: fileName, Path: outputFilePath}, ">> Done!\n\n")
	return nil
}

func (c *PFDAClient) Download(args []string, folderID string, spaceID string, public bool, recursive bool, outputFilePath string, overwrite string) error {

	// Report only failures of this operation, not of earlier ones on the client.
	reported := c.errorScope()

	// Multi-item downloads (several args, or a recursive tree) keep going on a
	// per-item failure instead of aborting the whole batch via HandleError.
	multi := len(args) > 1 || recursive
	c.ContinueOnError = multi

	// Batch from the start so results and per-item errors always form a single
	// JSON array, regardless of how many files end up matching. Recursive
	// calls reuse the outer batch.
	finishJSON := c.startJSONBatch()
	defer finishJSON()

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
			c.HandleError(err)
			continue
		}

		var children jsonListingResponse
		if err := json.Unmarshal(body, &children); err != nil {
			c.HandleError(err)
			continue
		}

		var uids []string
		for _, child := range children.Files {
			if child.Type == "UserFile" {
				uids = append(uids, child.Uid)
			} else if recursive {
				// create the child folder first.
				if err := os.MkdirAll(filepath.Join(outputFilePath, child.Name), os.ModePerm); err != nil {
					c.HandleError(err)
					continue
				}
				// Per-item failures inside the recursive call are already
				// reported and recorded there - nothing to do with them here.
				c.HandleError(c.Download([]string{fileName}, strconv.Itoa(child.Id), spaceID, public, recursive, filepath.Join(outputFilePath, child.Name), overwrite))
			}
		}

		if (len(uids) > 1 && (helpers.ContainsWildcard(fileName))) || len(uids) == 1 || args[0] == "" {
			fileIDs = append(fileIDs, uids...)
		} else if len(uids) > 1 {
			if !c.canPrompt() {
				c.HandleError(fmt.Errorf("%d files match '%s' and there is no way to ask which one to download in -json mode - pass its file-id, or a wildcard to download all of them", len(uids), fileName))
				continue
			}
			selected, err := pickFile(children.Files, "Multiple files found matching the given name, select which to download")
			if err != nil {
				c.HandleError(err)
				continue
			}
			fileIDs = append(fileIDs, selected)
		} else if !recursive {
			c.HandleError(fmt.Errorf("Unable to find any files matching '%s' - verify it exists and you have access to it", fileName))
		}
	}

	if len(fileIDs) > 1 || multi {
		c.parallelDownload(fileIDs, outputFilePath, overwrite)
	} else if len(fileIDs) == 1 {
		// Single-item download never continues on error, so HandleError already
		// exited non-zero (flushing the JSON batch) by the time we get here.
		c.HandleError(c.DownloadFile(fileIDs[0], outputFilePath, overwrite))
	}
	return reported()
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

	// N.B. one space after the colon - fmt.Println used to add it between its
	// operands, and the plain-text output is kept byte-for-byte identical.
	c.emitItem(jsonURL{Url: resultUrl}, "Url to view file: %s\n", resultUrl)
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

// emitCreatedFolder reports one successfully created folder.
func (c *PFDAClient) emitCreatedFolder(name string, id string) {
	folderId, _ := strconv.Atoi(id)
	c.emitItem(jsonMkdirResult{Name: name, ID: folderId}, "Created folder %s (id: %s) \n", name, id)
}

func (c *PFDAClient) Mkdir(dirs []string, folderID string, spaceID string, parents bool) error {

	c.ContinueOnError = len(dirs) > 1

	// Report only failures of this operation, not of earlier ones on the client.
	reported := c.errorScope()
	// Emit created folders as a single JSON array rather than concatenated objects.
	finishJSON := c.startJSONBatch()
	defer finishJSON()

	if parents {
		for _, dir := range dirs {
			parts := strings.Split(strings.TrimSuffix(dir, string(os.PathSeparator)), string(os.PathSeparator))
			parentId := folderID
			// created nested folders.
			for _, folder := range parts {
				id, err := c.createNewFolder(folder, parentId, spaceID)
				// An empty id signals a hard failure (network/permission/bad
				// response); a non-empty id with an error means the folder
				// already exists, which is fine for -p - reuse it and continue.
				if err != nil && id == "" {
					c.HandleError(err)
					break
				}
				if err == nil {
					c.emitCreatedFolder(folder, id)
				}
				parentId = id
			}
		}

		return reported()
	}

	for _, dir := range dirs {
		id, err := c.createNewFolder(dir, folderID, spaceID)
		c.HandleError(err)
		if err == nil {
			c.emitCreatedFolder(dir, id)
		}
	}
	return reported()
}

func (c *PFDAClient) Rmdir(args []string, recursive bool) error {

	c.ContinueOnError = len(args) > 1

	// Report only failures of this operation, not of earlier ones on the client.
	reported := c.errorScope()
	// Emit removed folders as a single JSON array rather than concatenated objects.
	finishJSON := c.startJSONBatch()
	defer finishJSON()

	for _, arg := range args {
		c.HandleError(c.rmdirOne(arg, recursive))
	}

	return reported()
}

// rmdirOne removes a single folder; the caller reports the returned error.
func (c *PFDAClient) rmdirOne(arg string, recursive bool) error {
	if !helpers.IsFolderId(arg) {
		return fmt.Errorf("Invalid folder id: %s - expected an integer", arg)
	}

	jsonData, err := json.Marshal(jsonRmPayload{Arg: arg, Type: "Folder"})
	if err != nil {
		return err
	}
	body, err := c.makeRequest("POST", c.BaseURL+"/api/v2/cli/nodes", jsonData)
	if err != nil {
		return err
	}

	var response []jsonFindNodesResponse
	if err := json.Unmarshal(body, &response); err != nil {
		return err
	}
	if len(response) == 0 {
		return fmt.Errorf("Target folder not found or inaccessible")
	}
	if response[0].Children > 0 && !recursive {
		return fmt.Errorf("Unable to remove non-empty folder")
	}

	return c.RemoveDir(arg)
}

func (c *PFDAClient) Rm(args []string, folderID string, spaceID string) error {

	c.ContinueOnError = len(args) > 1

	// Report only failures of this operation, not of earlier ones on the client.
	reported := c.errorScope()
	// Emit removed files as a single JSON array rather than concatenated objects.
	finishJSON := c.startJSONBatch()
	defer finishJSON()

	for _, arg := range args {
		c.HandleError(c.rmOne(arg, folderID, spaceID))
	}

	return reported()
}

// rmOne removes the file(s) matching a single argument (uid, name, or name
// with wildcards); the caller reports the returned error.
func (c *PFDAClient) rmOne(arg string, folderID string, spaceID string) error {
	if helpers.IsFileUid(arg) {
		return c.RemoveFile([]string{arg})
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
	if err := json.Unmarshal(body, &response); err != nil {
		return err
	}

	switch {
	case len(response) == 0:
		return fmt.Errorf("Target file not found or inaccessible")
	case len(response) == 1:
		return c.RemoveFile([]string{response[0].Uid})
	case !helpers.ContainsWildcard(arg):
		// given arg matches more files, let user select one and delete it
		if !c.canPrompt() {
			return fmt.Errorf("%d files match '%s' and there is no way to ask which one to delete in -json mode - pass the file-id of the one to remove", len(response), arg)
		}
		selected, err := pickFile(response, "Multiple files found matching the given name, select which to delete")
		if err != nil {
			return err
		}
		return c.RemoveFile([]string{selected})
	}

	// wildcard used, user wants to match more files, just inform about the count.
	// Without a prompt the confirmation cannot be obtained, and a delete of
	// everything that matched is not something to assume on the user's behalf -
	// so refuse, which is also what the unguarded prompt effectively did (it
	// aborted the process on a non-terminal stdin, having deleted nothing).
	if !c.canPrompt() {
		return fmt.Errorf("%d files match '%s' and there is no way to confirm deleting them all in -json mode - pass their file-ids explicitly", len(response), arg)
	}
	confirmed, err := yesNo(fmt.Sprintf("%d files match the given arg \"%s\", are you sure you want to continue?", len(response), arg))
	if err != nil {
		return err
	}
	if !confirmed {
		c.emitResult("delete aborted", ">> Delete aborted\n")
		return nil
	}
	uids := make([]string, 0, len(response))
	for _, file := range response {
		uids = append(uids, file.Uid)
	}
	return c.RemoveFile(uids)
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
	if chunkSize > maxChunkSize || chunkSize < MinChunkSize {
		return fmt.Errorf("chunk size must be between 16MB and 4GB")
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
		return "", fmt.Errorf("No id in response! Response: %s", string(body))
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
	// user wants print whole file, check size first. The check only spares a human
	// an unexpected flood of terminal output, so where they cannot be asked (see
	// canPrompt) it is dropped rather than turned into a failure: `cat` asked for
	// the whole file, and printing it is what the caller came for.
	if lines == -1 && fileSize > 10_000_000 && c.canPrompt() {
		agree, err := yesNo("The size of the file is over 10Mb - are you sure you want to display the whole content?")
		if err != nil {
			return err
		}
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
		c.emitDownloadFailure(strings.Join(uidsChunk, ","))
		return
	}
	var resultJSON []map[string]interface{}
	if err := json.Unmarshal(body, &resultJSON); err != nil {
		c.emitDownloadFailure(strings.Join(uidsChunk, ","))
		return
	}

	downloaded := make(map[string]string)
	for _, file := range resultJSON {
		// Validate the response instead of type-asserting blindly: a panic here
		// would kill the process from a goroutine and discard the JSON batch.
		uid, uidOK := file["uid"].(string)
		fileURL, urlOK := file["url"].(string)
		if !uidOK || !urlOK || fileURL == "" {
			// The post-download check below reports whichever uid is left over.
			continue
		}
		if err := c.DownloadDirectly(fileURL, outputFilePath, overwrite); err != nil {
			c.emitError(fmt.Errorf("unable to download: %s - %s", uid, err))
		}
		// Reported in place on failure, so the generic check below must not
		// report it a second time.
		downloaded[uid] = ""
	}

	// check if all requested files were downloaded.
	for _, uid := range uidsChunk {
		if _, found := downloaded[uid]; !found {
			c.emitDownloadFailure(uid)
		}
	}

}

// emitSkippedDownload reports a file left untouched because it already existed
// and -overwrite was not set to true. Skipping is not a failure: nothing is
// recorded, so an idempotent re-run of the same download still exits 0. Shared
// by the single-file and the bulk download paths so the two cannot drift on
// what an omitted or false -overwrite means.
func (c *PFDAClient) emitSkippedDownload(fileName string, outputFilePath string) {
	c.emitItem(
		jsonDownloadResult{FileName: fileName, Path: outputFilePath, Skipped: true},
		">> Path %s already exists but -overwrite flag not set to true - skipping download\n", outputFilePath,
	)
}

// emitDownloadFailure records a bulk-download failure for the exit code while
// keeping the CLI's ">>"-prefixed progress formatting in plain-text mode.
func (c *PFDAClient) emitDownloadFailure(what string) {
	if c.JsonResponse {
		c.emitError(fmt.Errorf("unable to download: %s", what))
		return
	}
	c.reportedErrs.record(fmt.Errorf("unable to download: %s", what))
	fmt.Printf(">> Unable to download: %s\n", what)
}

// parallelDownload downloads the given files in parallel chunks. Every failure
// is reported and recorded along the way (see emitError), so the caller only
// needs its error scope to turn any of them into a non-zero exit code.
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
			// Report through the normal channel so an active JSON batch is still
			// emitted, instead of aborting the process and losing all output.
			// Recording it (in emitError) makes the command exit non-zero.
			c.emitError(err)
			return
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

// initWaitGroup launches numRoutines upload goroutines and returns a wait
// function that blocks until all goroutines finish, stops the progress writer
// and returns the first chunk-upload failure (nil when all chunks succeeded),
// plus an abort channel that is closed on the first failure. The producer
// must select on abort while sending so it stops reading the source instead
// of chunking the whole remaining file into a pool that is only drained.
// Callers must close chunkPool before calling wait().
func (c *PFDAClient) initWaitGroup(fileID string, chunkPool <-chan uploadChunk, size *int64, withProgressBar bool) (wait func() error, abort <-chan struct{}) {
	numRoutines := helpers.Min(c.NumRoutines, int(math.Ceil(float64(*size)/float64(c.ChunkSize))))

	var totalSent uint64 = 0
	writer := uilive.New()
	writer.Start()

	abortCh := make(chan struct{})
	var g sync.WaitGroup
	var chunkErrMu sync.Mutex
	var chunkErr error
	for i := 0; i < numRoutines; i++ {
		g.Add(1)
		go func() {
			defer g.Done()
			for chunk := range chunkPool {
				chunkErrMu.Lock()
				failed := chunkErr != nil
				chunkErrMu.Unlock()
				if failed {
					continue // upload already failed - just drain the pool
				}
				if err := c.sendToStore(fileID, chunk); err != nil {
					chunkErrMu.Lock()
					if chunkErr == nil {
						chunkErr = err
						close(abortCh) // stop the producer - the remaining chunks would be thrown away
					}
					chunkErrMu.Unlock()
					continue
				}
				atomic.AddUint64(&totalSent, uint64(len(chunk.data)))
				currentSize := atomic.LoadUint64(&totalSent)
				totalSize := atomic.LoadInt64(size)
				if withProgressBar && !c.JsonResponse {
					fmt.Fprintf(writer, "     %.1f%% (%s / %s)\n",
						100*float64(currentSize)/float64(totalSize), units.BytesSize(float64(currentSize)), units.BytesSize(float64(totalSize)))
					writer.Flush()
				}
			}
		}()
	}

	return func() error {
		g.Wait()
		writer.Stop()
		chunkErrMu.Lock()
		defer chunkErrMu.Unlock()
		return chunkErr
	}, abortCh
}

// readAndChunk reads f into ChunkSize chunks and sends them to ch until EOF
// or until abort is closed (the upload failed - the remaining chunks would
// only be drained, so reading on wastes I/O and memory).
func (c *PFDAClient) readAndChunk(f io.ReadCloser, ch chan<- uploadChunk, size *int64, abort <-chan struct{}) error {
	chunkIndex := 1
	var totalDataLength = 0
	for {
		select {
		case <-abort:
			// wait() reports the chunk failure that triggered the abort.
			atomic.StoreInt64(size, int64(totalDataLength))
			return nil
		default:
		}
		byteBuf := make([]byte, c.ChunkSize)
		i := 0
		for i < c.ChunkSize {
			tempBuf := byteBuf[i:]
			m, err := f.Read(tempBuf)
			if err != nil && err != io.EOF {
				return err
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
		select {
		case ch <- uploadChunk{
			index: chunkIndex,
			data:  byteBuf[:i],
		}:
		case <-abort:
			// wait() reports the chunk failure that triggered the abort.
			atomic.StoreInt64(size, int64(totalDataLength))
			return nil
		}
		chunkIndex++
	}
	atomic.StoreInt64(size, int64(totalDataLength))
	return nil
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
	// Validate the response instead of panicking on a malformed one: this runs
	// inside an upload goroutine, and a panic there would kill the process and
	// discard the JSON batch accumulated so far.
	chunkURL, ok := resultJSON["url"].(string)
	if !ok || chunkURL == "" {
		return fmt.Errorf("upload-url response for chunk %d of %s contains no url", chunk.index, id)
	}
	headers, ok := resultJSON["headers"].(map[string]interface{})
	if !ok {
		return fmt.Errorf("upload-url response for chunk %d of %s contains no headers", chunk.index, id)
	}
	_, err := c.makeRequestWithHeaders("PUT", chunkURL, headers, chunk.data)
	return err
}

// yesNo asks the user to confirm. A failed prompt - an interrupt, or a stdin
// that is not a terminal - is returned as an error rather than exiting the
// process: the caller is inside a batch whose deferred JSON flush and error
// scope still have to run. Callers must reach this only via canPrompt.
func yesNo(label string) (bool, error) {
	prompt := promptui.Select{
		Label: label + " [Yes/No]",
		Items: []string{"Yes", "No"},
	}
	_, result, err := prompt.Run()
	if err != nil {
		return false, fmt.Errorf("Prompt failed %v", err)
	}
	return result == "Yes", nil
}

// Filters out only files to pick from. Reports a failed prompt as an error, see
// yesNo.
func pickFile(files []jsonFileResponse, label string) (string, error) {

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
		return "", fmt.Errorf("Prompt failed %v", err)
	}
	return ids[index], nil
}
