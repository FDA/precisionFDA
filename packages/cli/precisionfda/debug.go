package precisionfda

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"regexp"
	"sort"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/hashicorp/go-retryablehttp"
)

// maxDebugBody caps how much of a request/response body is printed in debug mode.
const maxDebugBody = 10 * 1024

const redactedValue = "[REDACTED]"

// Header names whose values must never appear in debug output.
var sensitiveHeaderNames = map[string]bool{
	"authorization":       true,
	"proxy-authorization": true,
	"cookie":              true,
	"set-cookie":          true,
}

// Substrings marking a header or query parameter as secret-bearing,
// e.g. X-Amz-Security-Token, X-Amz-Signature, X-Amz-Credential.
var sensitiveNameMarkers = []string{"token", "secret", "signature", "credential"}

// Response headers worth tracing. Servers return a dozen more (CSP, HSTS,
// cache directives, ...) that never help diagnose a CLI issue and drown out
// the signal.
var responseHeaderAllowlist = map[string]bool{
	"content-type":   true,
	"content-length": true,
	"date":           true,
	"retry-after":    true,
	"location":       true,
	"x-request-id":   true,
}

// EnableDebug wraps the client transport so that every HTTP request and response
// (including each retry attempt) is traced to w with secrets redacted.
// Must be called after any code that type-asserts the transport to *http.Transport.
func (c *PFDAClient) EnableDebug(w io.Writer) {
	t := &debugTransport{inner: c.Client.HTTPClient.Transport, out: w}
	c.Client.HTTPClient.Transport = t
	// Only retryablehttp knows the attempt number; hand it to the transport
	// so retries can be marked in the trace.
	c.Client.RequestLogHook = func(_ retryablehttp.Logger, req *http.Request, attempt int) {
		t.attempts.Store(req, attempt)
	}
	t.emit(fmt.Sprintf("%s debug mode enabled - %s, server %s\n", debugPrefix(), c.UserAgent, c.BaseURL))
	t.emit(fmt.Sprintf("%s command: %s\n", debugPrefix(), redactArgs(os.Args)))
}

type debugTransport struct {
	inner    http.RoundTripper
	out      io.Writer
	mu       sync.Mutex // upload chunks are sent from concurrent goroutines; serialize whole entries
	seq      atomic.Int64
	attempts sync.Map // *http.Request -> retryablehttp attempt number
}

func (t *debugTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	id := t.seq.Add(1)
	retryNote := ""
	if attempt, ok := t.attempts.LoadAndDelete(req); ok {
		if n, _ := attempt.(int); n > 0 {
			retryNote = fmt.Sprintf(" (retry %d)", n)
		}
	}

	var entry strings.Builder
	fmt.Fprintf(&entry, "%s --> #%d %s %s%s\n", debugPrefix(), id, req.Method, redactURL(req.URL), retryNote)
	writeHeaders(&entry, req.Header, nil)
	writeRequestBody(&entry, req)
	t.emit(entry.String())

	start := time.Now()
	resp, err := t.inner.RoundTrip(req)
	duration := time.Since(start).Round(time.Millisecond)
	if err != nil {
		t.emit(fmt.Sprintf("%s <-- #%d ERROR after %s: %s\n", debugPrefix(), id, duration, err))
		return resp, err
	}

	entry.Reset()
	fmt.Fprintf(&entry, "%s <-- #%d %s (%s)\n", debugPrefix(), id, resp.Status, duration)
	writeHeaders(&entry, resp.Header, responseHeaderAllowlist)
	writeResponseBody(&entry, resp)
	t.emit(entry.String())

	return resp, nil
}

// emit writes a whole multi-line entry in one call so that entries from
// concurrent requests do not interleave line by line.
func (t *debugTransport) emit(s string) {
	t.mu.Lock()
	defer t.mu.Unlock()
	io.WriteString(t.out, s)
}

func debugPrefix() string {
	return time.Now().UTC().Format("[DEBUG 2006-01-02T15:04:05.000Z]")
}

// redactArgs reproduces the invoked command line with the auth key masked.
func redactArgs(args []string) string {
	redacted := make([]string, len(args))
	copy(redacted, args)
	for i, arg := range redacted {
		if !strings.HasPrefix(arg, "-") {
			continue
		}
		trimmed := strings.TrimLeft(arg, "-")
		if trimmed == "key" && i+1 < len(redacted) {
			redacted[i+1] = redactedValue
		} else if strings.HasPrefix(trimmed, "key=") {
			redacted[i] = arg[:len(arg)-len(trimmed)] + "key=" + redactedValue
		}
	}
	return strings.Join(redacted, " ")
}

// writeHeaders prints headers, silently dropping secret-bearing ones — a fully
// redacted value carries no information, so no placeholder line is printed.
// When allowlist is non-nil, headers outside it (and x-ratelimit-*) are
// dropped as well.
func writeHeaders(entry *strings.Builder, headers http.Header, allowlist map[string]bool) {
	names := make([]string, 0, len(headers))
	for name := range headers {
		lower := strings.ToLower(name)
		if allowlist != nil && !allowlist[lower] && !strings.HasPrefix(lower, "x-ratelimit") {
			continue
		}
		if isSensitiveName(name) {
			continue
		}
		names = append(names, name)
	}
	sort.Strings(names)
	for _, name := range names {
		for _, value := range headers[name] {
			if strings.EqualFold(name, "location") {
				// Redirect targets can be presigned URLs carrying signatures
				value = redactURLString(value)
			}
			fmt.Fprintf(entry, "    %s: %s\n", name, value)
		}
	}
}

func isSensitiveName(name string) bool {
	lower := strings.ToLower(name)
	if sensitiveHeaderNames[lower] {
		return true
	}
	for _, marker := range sensitiveNameMarkers {
		if strings.Contains(lower, marker) {
			return true
		}
	}
	return false
}

// downloadTokenPattern matches the capability token embedded as a path segment
// in DNAnexus download URLs (https://<host>/F/D/<token>/<filename>). The token
// is a bearer credential that grants download access for its lifetime, so it
// must never reach the trace even though it lives in the path, not the query.
var downloadTokenPattern = regexp.MustCompile(`(/F/D/)[^/?#]+`)

// redactURL masks secrets in a URL: values of secret-bearing query parameters
// (presigned URL signatures, credentials, tokens) and DNAnexus download tokens
// carried as a path segment. Diagnostic parameters such as X-Amz-Date and
// X-Amz-Expires, and the trailing filename, stay visible.
func redactURL(u *url.URL) string {
	redacted := *u
	if redacted.RawQuery != "" {
		query := redacted.Query()
		changed := false
		for name, values := range query {
			lower := strings.ToLower(name)
			if lower == "awsaccesskeyid" || isSensitiveName(name) {
				for i := range values {
					values[i] = "REDACTED"
				}
				changed = true
			}
		}
		if changed {
			redacted.RawQuery = query.Encode()
		}
	}
	return downloadTokenPattern.ReplaceAllString(redacted.String(), "${1}REDACTED")
}

func redactURLString(s string) string {
	u, err := url.Parse(s)
	if err != nil {
		return s
	}
	return redactURL(u)
}

// writeRequestBody logs small JSON request bodies via a fresh GetBody copy —
// the live req.Body must not be consumed here. Anything else (binary upload
// chunks, oversized payloads) is summarized instead of dumped.
func writeRequestBody(entry *strings.Builder, req *http.Request) {
	if req.Body == nil || req.Body == http.NoBody || req.ContentLength == 0 {
		return
	}
	contentType := req.Header.Get("Content-Type")
	if !strings.Contains(contentType, "application/json") ||
		req.ContentLength < 0 || req.ContentLength > maxDebugBody || req.GetBody == nil {
		fmt.Fprintf(entry, "    body: <%s, content-type %q, omitted>\n", sizeLabel(req.ContentLength), contentType)
		return
	}
	body, err := req.GetBody()
	if err != nil {
		fmt.Fprintf(entry, "    body: <unavailable: %s>\n", err)
		return
	}
	defer body.Close()
	data, err := io.ReadAll(body)
	if err != nil {
		fmt.Fprintf(entry, "    body: <unavailable: %s>\n", err)
		return
	}
	fmt.Fprintf(entry, "    body (%d bytes): %s\n", len(data), data)
}

// writeResponseBody logs successful JSON response bodies - and any error-status
// body, whatever its content type - up to maxDebugBody bytes. The consumed
// prefix is stitched back onto resp.Body so callers (including streaming
// downloads) read the body unchanged; other bodies, notably file-content
// downloads served as text/* or binary, are summarized without touching the
// body at all.
func writeResponseBody(entry *strings.Builder, resp *http.Response) {
	if resp.ContentLength == 0 {
		return
	}
	contentType := resp.Header.Get("Content-Type")
	isError := resp.StatusCode < 200 || resp.StatusCode >= 300
	// Successful bodies are dumped only when JSON (the API protocol type); file
	// downloads - served as text/plain, text/csv, application/octet-stream, ... -
	// are never dumped so file contents cannot leak into the trace. Error bodies
	// are always shown regardless of content type: presigned S3 failures come
	// back as application/xml, proxy errors as text/html.
	if !isError && !strings.Contains(contentType, "application/json") {
		fmt.Fprintf(entry, "    body: <%s, content-type %q, omitted>\n", sizeLabel(resp.ContentLength), contentType)
		return
	}
	if resp.Body == nil || resp.Body == http.NoBody {
		return
	}

	peek, readErr := io.ReadAll(io.LimitReader(resp.Body, maxDebugBody+1))
	var rest io.Reader = resp.Body
	if readErr != nil {
		rest = errorReader{readErr}
	}
	resp.Body = stitchedBody{io.MultiReader(bytes.NewReader(peek), rest), resp.Body}

	if len(peek) > maxDebugBody {
		fmt.Fprintf(entry, "    body (first %d bytes): %s <truncated>\n", maxDebugBody, peek[:maxDebugBody])
	} else if len(peek) > 0 {
		fmt.Fprintf(entry, "    body (%d bytes): %s\n", len(peek), peek)
	}
}

func sizeLabel(n int64) string {
	if n < 0 {
		return "unknown size"
	}
	return fmt.Sprintf("%d bytes", n)
}

// stitchedBody re-joins the peeked prefix with the unread remainder while
// keeping the original body as the closer.
type stitchedBody struct {
	io.Reader
	io.Closer
}

// errorReader replays a read error to the caller after the peeked bytes.
type errorReader struct{ err error }

func (r errorReader) Read([]byte) (int, error) { return 0, r.err }
