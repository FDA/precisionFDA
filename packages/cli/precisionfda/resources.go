package precisionfda

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sync"
	"time"

	"dnanexus.com/precision-fda-cli/helpers"
)

func (c *PFDAClient) UploadResources(args []string, portalID string) error {
	var wg sync.WaitGroup
	semaphore := make(chan struct{}, 3)
	var uploadErr error
	var errMu sync.Mutex

	for _, p := range args {
		wg.Add(1)
		go func(path string) {
			defer wg.Done()
			semaphore <- struct{}{}
			defer func() { <-semaphore }()

			if err := c.UploadResource(path, portalID, !c.JsonResponse); err != nil {
				errMu.Lock()
				if uploadErr == nil {
					uploadErr = err
				}
				errMu.Unlock()
			}
		}(p)
	}
	wg.Wait()

	if uploadErr != nil {
		return uploadErr
	}

	if !c.JsonResponse {
		fmt.Println(">> Waiting for all resources links to be generated...")
	}

	return c.pollResourceURLs(portalID)
}

func (c *PFDAClient) pollResourceURLs(portalID string) error {
	apiURL := fmt.Sprintf("%s/api/v2/data-portals/%s/resources", c.BaseURL, portalID)
	retryInterval := 2 * time.Second

	for attempt := 0; attempt < 5; attempt++ {
		if attempt > 0 {
			time.Sleep(retryInterval)
			retryInterval *= 2
		}

		body, err := c.makeRequest("GET", apiURL, nil)
		if err != nil {
			return err
		}

		var resources []JsonResource
		if err := json.Unmarshal(body, &resources); err != nil {
			return err
		}

		if allResourcesHaveURLs(resources) {
			c.printResources(resources)
			return nil
		}
	}

	return fmt.Errorf("failed to generate URLs for all resources")
}

func allResourcesHaveURLs(resources []JsonResource) bool {
	for _, r := range resources {
		if r.URL == "" {
			return false
		}
	}
	return true
}

func (c *PFDAClient) printResources(resources []JsonResource) {
	if c.JsonResponse {
		helpers.PrettyPrint(resources)
		return
	}
	for _, r := range resources {
		fmt.Printf(">> Resource URL: %s\n", r.URL)
	}
}

type JsonResource struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
	URL  string `json:"url"`
}

type createResourcePayload struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

type createResourceResponse struct {
	FileUID string `json:"fileUid"`
}

func (c *PFDAClient) UploadResource(path string, portalID string, withProgressBar bool) error {
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
	if err := validateFileSize(path, size); err != nil {
		return err
	}

	fileUID, err := c.createResource(portalID, filepath.Base(path))
	if err != nil {
		return err
	}

	chunkPool := make(chan uploadChunk, c.NumRoutines)
	wg := c.initWaitGroup(fileUID, chunkPool, &size, withProgressBar)
	c.readAndChunk(file, chunkPool, &size)
	close(chunkPool)
	wg.Wait()

	closeURL := fmt.Sprintf("%s/api/v2/files/%s/close", c.BaseURL, fileUID)
	c.makeRequest("PATCH", closeURL, nil)
	return nil
}

func (c *PFDAClient) createResource(portalID, name string) (string, error) {
	url := fmt.Sprintf("%s/api/v2/data-portals/%s/resources", c.BaseURL, portalID)

	payload, err := json.Marshal(createResourcePayload{
		Name:        name,
		Description: "Resource created by precisionFDA CLI",
	})
	if err != nil {
		return "", err
	}

	body, err := c.makeRequest("POST", url, payload)
	if err != nil {
		return "", err
	}

	var resp createResourceResponse
	if err := json.Unmarshal(body, &resp); err != nil {
		return "", err
	}

	return resp.FileUID, nil
}

func validateFileSize(path string, size int64) error {
	if size > maxFileSize {
		return fmt.Errorf("size of file '%s' (%d) exceeds maximum allowed file size (%d)", path, size, maxFileSize)
	}
	if size == 0 {
		return fmt.Errorf("size of file '%s' is 0 - uploading an empty resource is not allowed", path)
	}
	return nil
}
