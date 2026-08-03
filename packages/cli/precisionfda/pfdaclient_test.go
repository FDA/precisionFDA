package precisionfda

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"dnanexus.com/precision-fda-cli/precisionfda/test"
)

func captureStdout(t *testing.T, fn func()) string {
	t.Helper()

	originalStdout := os.Stdout
	reader, writer, err := os.Pipe()
	test.Ok(t, err)

	os.Stdout = writer
	defer func() { os.Stdout = originalStdout }()

	// Drain the pipe concurrently so a large write can never block on a full
	// pipe buffer while nothing is reading.
	outC := make(chan string, 1)
	go func() {
		data, _ := io.ReadAll(reader)
		outC <- string(data)
	}()

	fn()
	test.Ok(t, writer.Close())

	output := <-outC
	test.Ok(t, reader.Close())
	return output
}

func TestNewPFDAClient(t *testing.T) {
	server := "test.precisionfda.com"
	pfdaclient := NewPFDAClient(server)

	test.Equals(t, pfdaclient.BaseURL, "https://test.precisionfda.com")
}

func TestChunkSize(t *testing.T) {
	server := "test.precisionfda.com"
	chunkSize := 16 * 1024 * 1024
	pfdaclient := NewPFDAClient(server)
	test.Equals(t, pfdaclient.ChunkSize, 1<<26)

	err := pfdaclient.SetChunkSize(chunkSize)
	test.Equals(t, err, nil)
	test.Equals(t, pfdaclient.ChunkSize, chunkSize)
}

func TestChunkSizeInvalid(t *testing.T) {
	pfdaclient := NewPFDAClient("test.precisionfda.com")

	err := pfdaclient.SetChunkSize(1)
	if err == nil {
		t.Fatal("expected error for chunk size below minimum")
	}

	err = pfdaclient.SetChunkSize(6 * 1024 * 1024 * 1024)
	if err == nil {
		t.Fatal("expected error for chunk size above maximum")
	}
}

func TestMaxRoutines(t *testing.T) {
	server := "test.precisionfda.com"
	pfdaclient := NewPFDAClient(server)
	test.Equals(t, pfdaclient.NumRoutines, 10)

	err := pfdaclient.SetNumRoutines(5)
	test.Equals(t, err, nil)
	test.Equals(t, pfdaclient.NumRoutines, 5)
}

func TestMaxRoutinesInvalid(t *testing.T) {
	pfdaclient := NewPFDAClient("test.precisionfda.com")

	err := pfdaclient.SetNumRoutines(0)
	if err == nil {
		t.Fatal("expected error for num routines below minimum")
	}

	err = pfdaclient.SetNumRoutines(101)
	if err == nil {
		t.Fatal("expected error for num routines above maximum")
	}
}

func TestUploadFile(t *testing.T) {
	t.Skip("Skipping httptests for now as I haven't been able to make them work")

	// Inspired by https://medium.com/zus-health/mocking-outbound-http-requests-in-go-youre-probably-doing-it-wrong-60373a38d2aa
	server := httptest.NewServer(http.HandlerFunc(func(rw http.ResponseWriter, req *http.Request) {
		fmt.Println(req.URL.String())
		test.Equals(t, req.URL.Path, "/api/create_file")

		if req.Header.Get("Accept") != "application/json" {
			t.Errorf("Expected Accept: application/json header, got: %s", req.Header.Get("Accept"))
		}

		// Send response to be tested
		rw.WriteHeader(http.StatusOK)
		rw.Write([]byte(`{"value":"fixed"}`))
	}))
	defer server.Close() // Close the server when test finishes

	pfdaclient := NewPFDAClient(server.URL)
	pfdaclient.UploadFile("./README.md", "", "", true)
}

func TestUploadFileToSpace(t *testing.T) {
	t.Skip("Skipping httptests for now")
}

func TestUploadAsset(t *testing.T) {
	t.Skip("Skipping httptests for now")
}

func TestDownloadFile(t *testing.T) {
	const uid = "file-123456789012345678901234-1"

	var server *httptest.Server
	server = httptest.NewServer(http.HandlerFunc(func(rw http.ResponseWriter, req *http.Request) {
		switch req.URL.Path {
		case "/api/v2/cli/files/" + uid + "/download":
			rw.Header().Set("Content-Type", "application/json")
			fmt.Fprintf(rw, `{"fileUrl":%q,"fileSize":7}`, server.URL+"/payload/report.txt")
		case "/payload/report.txt":
			fmt.Fprint(rw, "content")
		default:
			http.NotFound(rw, req)
		}
	}))
	defer server.Close()

	outputPath := filepath.Join(t.TempDir(), "report.txt")
	pfdaclient := NewPFDAClient("unused")
	pfdaclient.BaseURL = server.URL
	pfdaclient.JsonResponse = true

	output := captureStdout(t, func() {
		test.Ok(t, pfdaclient.Download([]string{uid}, "", "", false, false, outputPath, "true"))
	})
	if !json.Valid([]byte(output)) {
		t.Fatalf("expected one valid JSON document, got %q", output)
	}

	// Download always emits a single JSON array, with the same item schema for
	// single and bulk downloads.
	var results []struct {
		FileName string `json:"file_name"`
		Path     string `json:"path"`
	}
	test.Ok(t, json.Unmarshal([]byte(output), &results))
	test.Equals(t, len(results), 1)
	test.Equals(t, results[0].FileName, "report.txt")
	test.Equals(t, results[0].Path, outputPath)
}

// A file already on disk that -overwrite does not authorise replacing is
// skipped rather than failed, so re-running the same download is idempotent.
// Both the single-file and the bulk path have to agree on that for both
// spellings of "do not overwrite" - the argument count must not decide the exit
// code. -overwrite=false says so outright; an omitted -overwrite would prompt,
// but in -json mode there is nobody to answer, and prompting would print an
// ANSI widget into the JSON document and then abort on the non-terminal stdin
// of a scripted run.
func TestDownloadSkipsExistingFileInsteadOfFailingOrPrompting(t *testing.T) {
	const uid = "file-123456789012345678901234-1"

	var server *httptest.Server
	server = httptest.NewServer(http.HandlerFunc(func(rw http.ResponseWriter, req *http.Request) {
		switch req.URL.Path {
		case "/api/v2/cli/files/" + uid + "/download":
			rw.Header().Set("Content-Type", "application/json")
			fmt.Fprintf(rw, `{"fileUrl":%q,"fileSize":7}`, server.URL+"/payload/report.txt")
		case "/api/files/bulk_download":
			rw.Header().Set("Content-Type", "application/json")
			fmt.Fprintf(rw, `[{"uid":%q,"url":%q}]`, uid, server.URL+"/payload/report.txt")
		case "/payload/report.txt":
			fmt.Fprint(rw, "content")
		default:
			http.NotFound(rw, req)
		}
	}))
	defer server.Close()

	for _, tc := range []struct {
		name      string
		args      []string
		overwrite string
		wantItems int
	}{
		{"single file, -overwrite=false", []string{uid}, "false", 1},
		{"single file, -overwrite omitted", []string{uid}, "", 1},
		{"bulk, -overwrite=false", []string{uid, uid}, "false", 2},
		{"bulk, -overwrite omitted", []string{uid, uid}, "", 2},
	} {
		t.Run(tc.name, func(t *testing.T) {
			outputDir := t.TempDir()
			outputPath := filepath.Join(outputDir, "report.txt")
			test.Ok(t, os.WriteFile(outputPath, []byte("existing"), 0o600))

			pfdaclient := NewPFDAClient("unused")
			pfdaclient.BaseURL = server.URL
			pfdaclient.JsonResponse = true

			// The bulk path derives the file name from the download url, so it
			// needs the containing directory as -output; the single-file path
			// takes either.
			target := outputPath
			if len(tc.args) > 1 {
				target = outputDir
			}

			var err error
			stdout := captureStdout(t, func() {
				err = pfdaclient.Download(tc.args, "", "", false, false, target, tc.overwrite)
			})

			// Leaving an already-present file alone is not a failure - the
			// command must stay exit 0.
			test.Ok(t, err)
			if !json.Valid([]byte(stdout)) {
				t.Fatalf("expected one valid JSON document, got %q", stdout)
			}

			var results []struct {
				FileName string `json:"file_name"`
				Path     string `json:"path"`
				Skipped  bool   `json:"skipped"`
			}
			test.Ok(t, json.Unmarshal([]byte(stdout), &results))
			test.Equals(t, len(results), tc.wantItems)
			for i, result := range results {
				test.Equals(t, result.Path, outputPath)
				if !result.Skipped {
					t.Fatalf("expected item %d to be marked skipped, got %q", i, stdout)
				}
			}

			// Skipped means untouched, not truncated or re-fetched.
			content, readErr := os.ReadFile(outputPath)
			test.Ok(t, readErr)
			test.Equals(t, "existing", string(content))
		})
	}
}

// The name a download is written under comes from the download url, so it is
// server-supplied: percent-decoding its last segment can yield path separators
// and `..`. Both paths must sanitize it into a single harmless component, and
// must report the same name they wrote - a file landing outside the requested
// -output directory, or under a name the JSON does not name, is a bug either
// way, and the argument count must not decide which.
func TestDownloadSanitizesServerSuppliedFileName(t *testing.T) {
	const uid = "file-123456789012345678901234-1"
	// Decodes to `../../evil.txt`, sanitized to `.._.._evil.txt`.
	const escapedName = "%2e%2e%2f%2e%2e%2fevil.txt"
	const wantName = ".._.._evil.txt"

	var server *httptest.Server
	server = httptest.NewServer(http.HandlerFunc(func(rw http.ResponseWriter, req *http.Request) {
		payloadURL := server.URL + "/payload/" + escapedName
		switch {
		case req.URL.Path == "/api/v2/cli/files/"+uid+"/download":
			rw.Header().Set("Content-Type", "application/json")
			fmt.Fprintf(rw, `{"fileUrl":%q,"fileSize":7}`, payloadURL)
		case req.URL.Path == "/api/files/bulk_download":
			rw.Header().Set("Content-Type", "application/json")
			fmt.Fprintf(rw, `[{"uid":%q,"url":%q}]`, uid, payloadURL)
		case strings.HasPrefix(req.URL.EscapedPath(), "/payload/"):
			fmt.Fprint(rw, "content")
		default:
			http.NotFound(rw, req)
		}
	}))
	defer server.Close()

	for _, tc := range []struct {
		name string
		args []string
	}{
		{"single file", []string{uid}},
		{"bulk", []string{uid, uid}},
	} {
		t.Run(tc.name, func(t *testing.T) {
			// A directory as -output is what makes both paths derive the name
			// from the url rather than take it from the command line.
			outputDir := t.TempDir()

			pfdaclient := NewPFDAClient("unused")
			pfdaclient.BaseURL = server.URL
			pfdaclient.JsonResponse = true

			var err error
			stdout := captureStdout(t, func() {
				err = pfdaclient.Download(tc.args, "", "", false, false, outputDir, "true")
			})
			test.Ok(t, err)

			var results []struct {
				FileName string `json:"file_name"`
				Path     string `json:"path"`
			}
			test.Ok(t, json.Unmarshal([]byte(stdout), &results))
			if len(results) == 0 {
				t.Fatalf("expected at least one downloaded item, got %q", stdout)
			}
			wantPath := filepath.Join(outputDir, wantName)
			for _, result := range results {
				test.Equals(t, result.FileName, wantName)
				test.Equals(t, result.Path, wantPath)
			}

			content, readErr := os.ReadFile(wantPath)
			test.Ok(t, readErr)
			test.Equals(t, "content", string(content))

			// The payload landed at the reported path and the output directory
			// holds nothing else, so no write went anywhere but here. Asserted
			// against the directory itself rather than the escape target: a
			// `..`-relative path is shared with other runs, and a leftover file
			// there would fail this test for the previous run's bug.
			entries, readDirErr := os.ReadDir(outputDir)
			test.Ok(t, readDirErr)
			test.Equals(t, len(entries), 1)
			test.Equals(t, entries[0].Name(), wantName)
		})
	}
}

func TestDownloadFailsWhenOutputDirCannotBeCreated(t *testing.T) {
	const uid1 = "file-123456789012345678901234-1"
	const uid2 = "file-123456789012345678901234-2"

	// An existing regular file passed as -output makes MkdirAll fail, so nothing
	// gets downloaded - the command must not report success.
	outputPath := filepath.Join(t.TempDir(), "not-a-dir")
	test.Ok(t, os.WriteFile(outputPath, []byte("blocker"), 0o600))

	pfdaclient := NewPFDAClient("unused")
	pfdaclient.JsonResponse = true

	var err error
	output := captureStdout(t, func() {
		err = pfdaclient.Download([]string{uid1, uid2}, "", "", false, false, outputPath, "true")
	})

	if err == nil {
		t.Fatal("expected an error when the output directory cannot be created")
	}
	if !IsReported(err) {
		t.Fatalf("expected the error to be marked as already reported, got %v", err)
	}
	// A single valid document also proves the failure was not printed twice.
	if !json.Valid([]byte(output)) {
		t.Fatalf("expected one valid JSON document, got %q", output)
	}

	var results []map[string]string
	test.Ok(t, json.Unmarshal([]byte(output), &results))
	test.Equals(t, len(results), 1)
	if results[0]["error"] == "" {
		t.Fatalf("expected the failure to be reported in the JSON array, got %q", output)
	}
}

func TestJSONBatchCollectsResultsAndErrors(t *testing.T) {
	pfdaclient := NewPFDAClient("unused")
	pfdaclient.JsonResponse = true
	pfdaclient.ContinueOnError = true

	output := captureStdout(t, func() {
		finishJSON := pfdaclient.startJSONBatch()
		pfdaclient.emitResult("delete aborted", ">> Delete aborted\n")
		pfdaclient.HandleError(errors.New("delete failed"))
		finishJSON()
	})
	if !json.Valid([]byte(output)) {
		t.Fatalf("expected one valid JSON document, got %q", output)
	}

	var results []map[string]string
	test.Ok(t, json.Unmarshal([]byte(output), &results))
	test.Equals(t, len(results), 2)
	test.Equals(t, results[0]["result"], "delete aborted")
	test.Equals(t, results[1]["error"], "delete failed")
}

// Each item's JSON and plain-text forms are supplied together at one call site,
// so neither can leak into the other mode. emitJSONItem carries the same guard
// as a backstop, since it stays reachable from emitItem and emitError.
func TestEmitItemKeepsEachModesOutputToItself(t *testing.T) {
	t.Run("plain text mode emits no JSON", func(t *testing.T) {
		pfdaclient := NewPFDAClient("unused")
		pfdaclient.JsonResponse = false

		output := captureStdout(t, func() {
			finishJSON := pfdaclient.startJSONBatch()
			pfdaclient.emitItem(jsonRemovedFile{Uid: "file-1"}, "Removed %s \n", "file-1")
			// A direct call, as if a future caller forgot the mode check.
			pfdaclient.emitJSONItem(jsonRemovedFile{Uid: "file-2"})
			finishJSON()
		})

		test.Equals(t, "Removed file-1 \n", output)
	})

	t.Run("json mode emits no plain text", func(t *testing.T) {
		pfdaclient := NewPFDAClient("unused")
		pfdaclient.JsonResponse = true

		output := captureStdout(t, func() {
			finishJSON := pfdaclient.startJSONBatch()
			pfdaclient.emitItem(jsonRemovedFile{Uid: "file-1"}, "Removed %s \n", "file-1")
			finishJSON()
		})

		var results []map[string]string
		test.Ok(t, json.Unmarshal([]byte(output), &results))
		test.Equals(t, len(results), 1)
		test.Equals(t, results[0]["uid"], "file-1")
		if strings.Contains(output, "Removed") {
			t.Fatalf("expected no plain-text output in -json mode, got %q", output)
		}
	})
}

// expectReportedFailures asserts that err is a non-nil, already-reported error
// and that output is a single JSON array containing exactly wantErrors errors.
func expectReportedFailures(t *testing.T, err error, output string, wantErrors int) {
	t.Helper()

	if err == nil {
		t.Fatal("expected a non-nil error so the command exits non-zero")
	}
	if !IsReported(err) {
		t.Fatalf("expected the error to be marked as already reported, got %v", err)
	}
	if !json.Valid([]byte(output)) {
		t.Fatalf("expected one valid JSON document, got %q", output)
	}
	var results []map[string]string
	test.Ok(t, json.Unmarshal([]byte(output), &results))
	test.Equals(t, len(results), wantErrors)
	for i, item := range results {
		if item["error"] == "" {
			t.Fatalf("expected item %d to be an error, got %q", i, output)
		}
	}
}

func TestRmContinuesAndExitsNonZeroWhenAllItemsFail(t *testing.T) {
	const uid1 = "file-123456789012345678901234-1"
	const uid2 = "file-123456789012345678901234-2"

	// The API reports 0 removed nodes for every request, so both deletions fail.
	server := httptest.NewServer(http.HandlerFunc(func(rw http.ResponseWriter, req *http.Request) {
		rw.Header().Set("Content-Type", "application/json")
		fmt.Fprint(rw, `0`)
	}))
	defer server.Close()

	pfdaclient := NewPFDAClient("unused")
	pfdaclient.BaseURL = server.URL
	pfdaclient.JsonResponse = true

	var err error
	output := captureStdout(t, func() {
		err = pfdaclient.Rm([]string{uid1, uid2}, "", "")
	})

	expectReportedFailures(t, err, output, 2)
}

func TestRmdirContinuesAndExitsNonZeroOnInvalidIds(t *testing.T) {
	pfdaclient := NewPFDAClient("unused")
	pfdaclient.JsonResponse = true

	var err error
	output := captureStdout(t, func() {
		err = pfdaclient.Rmdir([]string{"not-a-number", "also-invalid"}, false)
	})

	expectReportedFailures(t, err, output, 2)
}

func TestUploadMultipleFilesContinuesPastMissingPaths(t *testing.T) {
	pfdaclient := NewPFDAClient("unused")
	pfdaclient.JsonResponse = true

	var err error
	output := captureStdout(t, func() {
		err = pfdaclient.UploadMultipleFiles([]string{"/nonexistent/one", "/nonexistent/two"}, "", "")
	})

	// Both paths must be attempted (and reported) instead of aborting on the first.
	expectReportedFailures(t, err, output, 2)
}

func TestBubbledUpFailureIsRecordedOnce(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(rw http.ResponseWriter, req *http.Request) {
		http.Error(rw, `{"error":{"message":"no such route"}}`, http.StatusNotFound)
	}))
	defer server.Close()

	inputDir := t.TempDir()
	test.Ok(t, os.WriteFile(filepath.Join(inputDir, "input.txt"), []byte("content"), 0o600))

	pfdaclient := NewPFDAClient("unused")
	pfdaclient.BaseURL = server.URL
	pfdaclient.JsonResponse = true

	// The folder upload fails at folder creation, reports that failure and hands
	// it back marked as reported; UploadMultipleFiles then funnels the returned
	// error through emitError again.
	var err error
	output := captureStdout(t, func() {
		err = pfdaclient.UploadMultipleFiles([]string{inputDir}, "", "")
	})

	expectReportedFailures(t, err, output, 1)

	// The second pass must not append a duplicate: the failure log is what an
	// error scope reports from, so a bubbled-up error belongs in it exactly once.
	test.Equals(t, len(pfdaclient.reportedErrs.errs), 1)
}

func TestUploadFileAPIFailureIsReportedWithoutExit(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(rw http.ResponseWriter, req *http.Request) {
		http.Error(rw, `{"error":{"message":"no such route"}}`, http.StatusNotFound)
	}))
	defer server.Close()

	inputPath := filepath.Join(t.TempDir(), "input.txt")
	test.Ok(t, os.WriteFile(inputPath, []byte("content"), 0o600))

	pfdaclient := NewPFDAClient("unused")
	pfdaclient.BaseURL = server.URL
	pfdaclient.JsonResponse = true

	var err error
	output := captureStdout(t, func() {
		err = pfdaclient.UploadFile(inputPath, "", "", false)
	})

	// A server-side failure must not os.Exit the process; it is reported into
	// the JSON array and returned so multi-file uploads can keep going while
	// the command still exits non-zero.
	expectReportedFailures(t, err, output, 1)
}

func TestUploadFileReportsIdNameAndUrl(t *testing.T) {
	const fileID = "file-123456789012345678901234-1"

	var serverURL string
	server := httptest.NewServer(http.HandlerFunc(func(rw http.ResponseWriter, req *http.Request) {
		rw.Header().Set("Content-Type", "application/json")
		switch {
		case req.URL.Path == "/api/create_file":
			fmt.Fprintf(rw, `{"id":%q}`, fileID)
		case strings.HasSuffix(req.URL.Path, "/upload-url"):
			fmt.Fprintf(rw, `{"url":%q,"headers":{}}`, serverURL+"/store")
		case req.URL.Path == "/store", req.URL.Path == "/api/set_tags", strings.HasSuffix(req.URL.Path, "/close"):
			fmt.Fprint(rw, `{}`)
		default:
			http.Error(rw, `{"error":{"message":"no such route"}}`, http.StatusNotFound)
		}
	}))
	defer server.Close()
	serverURL = server.URL

	inputPath := filepath.Join(t.TempDir(), "report.txt")
	test.Ok(t, os.WriteFile(inputPath, []byte("content"), 0o600))

	pfdaclient := NewPFDAClient("unused")
	pfdaclient.BaseURL = server.URL
	pfdaclient.JsonResponse = true

	var err error
	output := captureStdout(t, func() {
		err = pfdaclient.UploadFile(inputPath, "", "", false)
	})
	test.Ok(t, err)

	// The id and name spare consumers from parsing them out of the url.
	var results []map[string]string
	test.Ok(t, json.Unmarshal([]byte(output), &results))
	test.Equals(t, len(results), 1)
	test.Equals(t, results[0]["id"], fileID)
	test.Equals(t, results[0]["name"], "report.txt")
	test.Equals(t, results[0]["url"], server.URL+"/home/files/"+fileID)
}

// The prompts below cannot run in -json mode: promptui would draw its widget
// into the JSON document and then abort the process on the non-terminal stdin of
// a scripted run - which is also why these tests would not merely fail but take
// the whole test binary down if a guard went missing.
//
// Where nobody can be asked which file was meant, or whether a bulk delete
// should go ahead, the decision is not made on the user's behalf: the ambiguity
// comes back as a parseable error, and nothing is downloaded or deleted.

// expectPromptRefusals asserts that a command reported wantErrors failures and
// that each one is the guard's own refusal. Matching the message is what makes
// these tests notice a missing guard: an unguarded prompt fails on the test
// binary's stdin too, and would otherwise pass for the same "a failure was
// reported" outcome - while telling a real user only "Prompt failed EOF".
func expectPromptRefusals(t *testing.T, err error, output string, wantErrors int) {
	t.Helper()

	expectReportedFailures(t, err, output, wantErrors)

	var results []map[string]string
	test.Ok(t, json.Unmarshal([]byte(output), &results))
	for i, item := range results {
		if !strings.Contains(item["error"], "in -json mode") {
			t.Fatalf("expected item %d to explain that -json mode cannot prompt, got %q", i, item["error"])
		}
	}
}

func TestDownloadRefusesAmbiguousNameInJSONModeInsteadOfPrompting(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(rw http.ResponseWriter, req *http.Request) {
		if req.URL.Path != "/api/files/cli" {
			t.Errorf("unexpected request %s %s - nothing must be downloaded", req.Method, req.URL.Path)
			http.NotFound(rw, req)
			return
		}
		rw.Header().Set("Content-Type", "application/json")
		fmt.Fprint(rw, `{"files":[
			{"uid":"file-123456789012345678901234-1","name":"report.txt","type":"UserFile"},
			{"uid":"file-123456789012345678901234-2","name":"report.txt","type":"UserFile"}
		]}`)
	}))
	defer server.Close()

	pfdaclient := NewPFDAClient("unused")
	pfdaclient.BaseURL = server.URL
	pfdaclient.JsonResponse = true

	// Both args are reported because two of them make this a batch; a single arg
	// would by design exit the process on its first failure - and with it the
	// test binary.
	var err error
	output := captureStdout(t, func() {
		err = pfdaclient.Download([]string{"report.txt", "report.txt"}, "", "", false, false, t.TempDir(), "")
	})

	expectPromptRefusals(t, err, output, 2)
}

func TestRmRefusesAmbiguousNameInJSONModeInsteadOfPrompting(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(rw http.ResponseWriter, req *http.Request) {
		if req.Method == http.MethodDelete {
			t.Errorf("unexpected DELETE %s - no file must be removed without being picked", req.URL.Path)
		}
		rw.Header().Set("Content-Type", "application/json")
		fmt.Fprint(rw, `[
			{"uid":"file-123456789012345678901234-1","name":"report.txt","type":"UserFile"},
			{"uid":"file-123456789012345678901234-2","name":"report.txt","type":"UserFile"}
		]`)
	}))
	defer server.Close()

	pfdaclient := NewPFDAClient("unused")
	pfdaclient.BaseURL = server.URL
	pfdaclient.JsonResponse = true

	var err error
	output := captureStdout(t, func() {
		err = pfdaclient.Rm([]string{"report.txt", "report.txt"}, "", "")
	})

	expectPromptRefusals(t, err, output, 2)
}

// A wildcard that matches several files is confirmed by count before anything is
// deleted. Unable to ask, rm refuses rather than assuming consent - the safe
// direction, and the same net effect the unguarded prompt had.
func TestRmRefusesWildcardDeleteInJSONModeInsteadOfPrompting(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(rw http.ResponseWriter, req *http.Request) {
		if req.Method == http.MethodDelete {
			t.Errorf("unexpected DELETE %s - the bulk delete was never confirmed", req.URL.Path)
		}
		rw.Header().Set("Content-Type", "application/json")
		fmt.Fprint(rw, `[
			{"uid":"file-123456789012345678901234-1","name":"tmp_a","type":"UserFile"},
			{"uid":"file-123456789012345678901234-2","name":"tmp_b","type":"UserFile"}
		]`)
	}))
	defer server.Close()

	pfdaclient := NewPFDAClient("unused")
	pfdaclient.BaseURL = server.URL
	pfdaclient.JsonResponse = true

	var err error
	output := captureStdout(t, func() {
		err = pfdaclient.Rm([]string{"tmp_*", "tmp_*"}, "", "")
	})

	expectPromptRefusals(t, err, output, 2)
}

// cat's size check is the one prompt that resolves without the user: it only
// spares a human an unexpected flood of output, and `cat` already asked for the
// whole file - so it prints instead of failing.
func TestCatPrintsWholeLargeFileInJSONModeWithoutPrompting(t *testing.T) {
	const uid = "file-123456789012345678901234-1"

	var server *httptest.Server
	server = httptest.NewServer(http.HandlerFunc(func(rw http.ResponseWriter, req *http.Request) {
		switch req.URL.Path {
		case "/api/v2/cli/files/" + uid + "/download":
			rw.Header().Set("Content-Type", "application/json")
			fmt.Fprintf(rw, `{"fileUrl":%q,"fileSize":20000000}`, server.URL+"/payload/report.txt")
		case "/payload/report.txt":
			fmt.Fprint(rw, "first\nsecond\n")
		default:
			http.NotFound(rw, req)
		}
	}))
	defer server.Close()

	pfdaclient := NewPFDAClient("unused")
	pfdaclient.BaseURL = server.URL
	pfdaclient.JsonResponse = true

	var err error
	output := captureStdout(t, func() {
		// lines == -1 is what `cat` passes: the whole file, however big.
		err = pfdaclient.Head(uid, -1)
	})

	test.Ok(t, err)
	test.Equals(t, output, "first\nsecond\n")
}
