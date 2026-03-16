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
	t.Skip("Skipping httptests for now")
}
