package precisionfda

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"sync/atomic"
	"testing"
	"time"

	"dnanexus.com/precision-fda-cli/precisionfda/test"
)

func newDebugTestClient(t *testing.T) (*PFDAClient, *bytes.Buffer) {
	t.Helper()
	pfdaclient := NewPFDAClient("test.precisionfda.com")
	pfdaclient.UserAgent = "pfda-test"
	var buf bytes.Buffer
	pfdaclient.EnableDebug(&buf)
	return pfdaclient, &buf
}

func TestDebugRedactsSecrets(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(rw http.ResponseWriter, req *http.Request) {
		rw.Header().Set("Content-Type", "application/json")
		rw.Header().Set("Content-Security-Policy", "default-src 'self'")
		rw.Header().Set("X-Request-Id", "req-12345")
		rw.Write([]byte(`{"ok":true}`))
	}))
	defer server.Close()

	pfdaclient, buf := newDebugTestClient(t)
	pfdaclient.AuthKey = "supersecretkey"

	body, err := pfdaclient.makeRequest("POST", server.URL+"/api/foo?X-Amz-Signature=sekret&size=5", []byte(`{"name":"a.txt"}`))
	test.Ok(t, err)
	test.Equals(t, `{"ok":true}`, string(body))

	out := buf.String()
	test.Assert(t, strings.Contains(out, "debug mode enabled - pfda-test, server https://test.precisionfda.com"), "expected banner line, got %q", out)
	test.Assert(t, strings.Contains(out, "command: "), "expected invoked command in banner, got %q", out)
	test.Assert(t, strings.Contains(out, "--> #1 POST "), "expected request line, got %q", out)
	test.Assert(t, strings.Contains(out, "<-- #1 200 OK ("), "expected response status line with duration, got %q", out)
	test.Assert(t, !strings.Contains(out, "Authorization"), "expected Authorization header to be omitted entirely, got %q", out)
	test.Assert(t, !strings.Contains(out, "supersecretkey"), "auth key leaked into debug output: %q", out)
	test.Assert(t, !strings.Contains(out, "sekret"), "presigned signature leaked into debug output: %q", out)
	test.Assert(t, strings.Contains(out, "X-Amz-Signature=REDACTED"), "expected redacted signature query param, got %q", out)
	test.Assert(t, strings.Contains(out, "size=5"), "expected diagnostic query param to stay visible, got %q", out)
	test.Assert(t, strings.Contains(out, `{"name":"a.txt"}`), "expected JSON request body, got %q", out)
	test.Assert(t, strings.Contains(out, `{"ok":true}`), "expected JSON response body, got %q", out)
	test.Assert(t, strings.Contains(out, "X-Request-Id: req-12345"), "expected allowlisted X-Request-Id header, got %q", out)
	test.Assert(t, !strings.Contains(out, "Content-Security-Policy"), "expected noisy response header to be dropped, got %q", out)
}

func TestDebugRedactsKeyInCommandBanner(t *testing.T) {
	test.Equals(t, "pfda ls --key [REDACTED] -debug", redactArgs([]string{"pfda", "ls", "--key", "topsecret", "-debug"}))
	test.Equals(t, "pfda ls -key=[REDACTED]", redactArgs([]string{"pfda", "ls", "-key=topsecret"}))
	test.Equals(t, "pfda mkdir key foo", redactArgs([]string{"pfda", "mkdir", "key", "foo"}))
}

func TestRedactURLMasksDownloadToken(t *testing.T) {
	// DNAnexus download URLs carry a capability token as a path segment, with no
	// query string at all, so query-only redaction would leak it.
	cases := []struct {
		name string
		in   string
		want string
	}{
		{
			"download url, token in path, no query",
			"https://dl.dnanex.us/F/D/kbGB8kX54vq4PqVPQK9J8xV1VjjQ4Pbk75fKxjB1/hs37d5.2bit",
			"https://dl.dnanex.us/F/D/REDACTED/hs37d5.2bit",
		},
		{
			"api host download url",
			"https://api.dnanexus.com/F/D/f9032P65QG3xf2qzpf1g57Yy9q86BPQq4p47YxxY/gencode19.bb",
			"https://api.dnanexus.com/F/D/REDACTED/gencode19.bb",
		},
		{
			"download url with both path token and query signature",
			"https://dl.dnanex.us/F/D/SECRETTOKEN/file.vcf?X-Amz-Signature=sig&size=5",
			"https://dl.dnanex.us/F/D/REDACTED/file.vcf?X-Amz-Signature=REDACTED&size=5",
		},
		{
			"ordinary api url is untouched",
			"https://test.precisionfda.com/api/v2/cli/files/file-123/download",
			"https://test.precisionfda.com/api/v2/cli/files/file-123/download",
		},
	}
	for _, tc := range cases {
		u, err := url.Parse(tc.in)
		test.Ok(t, err)
		test.Equals(t, tc.want, redactURL(u))
	}
}

func TestDebugRedactsDownloadTokenInRequestTrace(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(rw http.ResponseWriter, req *http.Request) {
		rw.Header().Set("Content-Type", "application/octet-stream")
		rw.Write([]byte("file-bytes"))
	}))
	defer server.Close()

	pfdaclient, buf := newDebugTestClient(t)

	_, err := pfdaclient.makeRequest("GET", server.URL+"/F/D/SUPERSECRETTOKEN/hs37d5.2bit", nil)
	test.Ok(t, err)

	out := buf.String()
	test.Assert(t, !strings.Contains(out, "SUPERSECRETTOKEN"), "download token leaked into debug trace: %q", out)
	test.Assert(t, strings.Contains(out, "/F/D/REDACTED/hs37d5.2bit"), "expected redacted download token in request line, got %q", out)
}

func TestDebugShowsErrorBodyRegardlessOfContentType(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(rw http.ResponseWriter, req *http.Request) {
		rw.Header().Set("Content-Type", "application/xml")
		rw.WriteHeader(http.StatusForbidden)
		rw.Write([]byte(`<Error><Code>AccessDenied</Code></Error>`))
	}))
	defer server.Close()

	pfdaclient, buf := newDebugTestClient(t)

	_, err := pfdaclient.makeRequest("GET", server.URL, nil)
	test.Assert(t, err != nil, "expected error for 403 response")

	out := buf.String()
	test.Assert(t, strings.Contains(out, "<-- #1 403 Forbidden"), "expected 403 status line, got %q", out)
	test.Assert(t, strings.Contains(out, "<Error><Code>AccessDenied</Code></Error>"), "expected XML error body in debug output, got %q", out)
}

func TestDebugOmitsBinaryBodies(t *testing.T) {
	binary := bytes.Repeat([]byte{0x01, 0x02, 0x03, 0xff}, 100)
	server := httptest.NewServer(http.HandlerFunc(func(rw http.ResponseWriter, req *http.Request) {
		rw.Header().Set("Content-Type", "application/octet-stream")
		rw.Write(binary)
	}))
	defer server.Close()

	pfdaclient, buf := newDebugTestClient(t)

	// Binary request body (like an upload chunk PUT) and binary response body
	headers := map[string]interface{}{"Content-Type": "application/octet-stream"}
	body, err := pfdaclient.makeRequestWithHeaders("PUT", server.URL, headers, binary)
	test.Ok(t, err)
	test.Equals(t, binary, body)

	out := buf.String()
	test.Assert(t, strings.Contains(out, `body: <400 bytes, content-type "application/octet-stream", omitted>`), "expected omitted body lines, got %q", out)
	test.Assert(t, !strings.Contains(out, string([]byte{0x01, 0x02, 0x03})), "binary bytes leaked into debug output: %q", out)
}

func TestDebugOmitsTextFileDownloadBodies(t *testing.T) {
	// Genomic files (VCF/BED/CSV/TSV) are frequently served with a text/* type.
	// A successful download must never dump its contents into the trace.
	contents := "chrom\tpos\tref\talt\nchr1\t1000\tA\tG\n" + strings.Repeat("x", 2*maxDebugBody)
	for _, contentType := range []string{"text/plain", "text/csv", "text/tab-separated-values"} {
		server := httptest.NewServer(http.HandlerFunc(func(rw http.ResponseWriter, req *http.Request) {
			rw.Header().Set("Content-Type", contentType)
			rw.Write([]byte(contents))
		}))

		pfdaclient, buf := newDebugTestClient(t)

		body, err := pfdaclient.makeRequest("GET", server.URL, nil)
		server.Close()
		test.Ok(t, err)
		test.Equals(t, contents, string(body))

		out := buf.String()
		test.Assert(t, strings.Contains(out, "omitted>"), "expected text file body to be omitted for %q, got %q", contentType, out)
		test.Assert(t, !strings.Contains(out, "chr1\t1000"), "text file contents leaked into debug output for %q: %q", contentType, out)
	}
}

func TestDebugTruncatesLargeBodyAndKeepsItReadable(t *testing.T) {
	large := []byte(`{"data":"` + strings.Repeat("a", 3*maxDebugBody) + `"}`)
	server := httptest.NewServer(http.HandlerFunc(func(rw http.ResponseWriter, req *http.Request) {
		rw.Header().Set("Content-Type", "application/json")
		rw.Write(large)
	}))
	defer server.Close()

	pfdaclient, buf := newDebugTestClient(t)

	body, err := pfdaclient.makeRequest("GET", server.URL, nil)
	test.Ok(t, err)
	test.Equals(t, large, body)

	out := buf.String()
	test.Assert(t, strings.Contains(out, "<truncated>"), "expected truncation marker, got %d bytes of output", len(out))
	test.Assert(t, len(out) < 2*maxDebugBody, "expected debug output to stay capped, got %d bytes", len(out))
}

func TestDebugLogsEachRetryAttempt(t *testing.T) {
	var calls atomic.Int32
	server := httptest.NewServer(http.HandlerFunc(func(rw http.ResponseWriter, req *http.Request) {
		if calls.Add(1) < 3 {
			rw.WriteHeader(http.StatusInternalServerError)
			return
		}
		rw.Header().Set("Content-Type", "application/json")
		rw.Write([]byte(`{"ok":true}`))
	}))
	defer server.Close()

	pfdaclient, buf := newDebugTestClient(t)
	pfdaclient.Client.RetryWaitMin = time.Millisecond
	pfdaclient.Client.RetryWaitMax = 2 * time.Millisecond

	body, err := pfdaclient.makeRequest("GET", server.URL, nil)
	test.Ok(t, err)
	test.Equals(t, `{"ok":true}`, string(body))

	out := buf.String()
	test.Equals(t, int32(3), calls.Load())
	for _, expected := range []string{"--> #1 GET", "--> #2 GET", "--> #3 GET", "<-- #3 200 OK", "(retry 1)", "(retry 2)"} {
		test.Assert(t, strings.Contains(out, expected), "expected %q in debug output, got %q", expected, out)
	}
	test.Equals(t, 2, strings.Count(out, "(retry"))
	test.Equals(t, 2, strings.Count(out, "500 Internal Server Error"))
}
