package precisionfda

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"dnanexus.com/precision-fda-cli/precisionfda/test"
)

func TestNewPFDAClient(t *testing.T) {
	server := "test.precisionfda.com"
	pfdaclient := NewPFDAClient(server)

	test.Equals(t, pfdaclient.BaseURL, "https://test.precisionfda.com")
}

func TestChunkSize(t *testing.T) {
	server := "test.precisionfda.com"
	pfdaclient := NewPFDAClient(server)
	test.Equals(t, pfdaclient.ChunkSize, 1<<26)

	pfdaclient.SetChunkSize(10000000)
	test.Equals(t, pfdaclient.ChunkSize, 10000000)
}

func TestMaxRoutines(t *testing.T) {
	server := "test.precisionfda.com"
	pfdaclient := NewPFDAClient(server)
	test.Equals(t, pfdaclient.NumRoutines, 10)

	pfdaclient.SetNumRoutines(5)
	test.Equals(t, pfdaclient.NumRoutines, 5)
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
	defer server.Close()	// Close the server when test finishes

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
	t.Skip("Skipping httptests for now")
}
