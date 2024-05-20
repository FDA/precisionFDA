package precisionfda

import (
	"dnanexus.com/precision-fda-cli/helpers"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sync"
	"time"
)

func (c *PFDAClient) UploadResources(args []string, portalID string) error {

	var wg sync.WaitGroup
	semaphore := make(chan struct{}, 3) // Limit to 3 concurrent goroutines

	results := make(chan error, len(args))
	for _, path := range args {
		wg.Add(1)
		go func(path string) {
			defer wg.Done()
			semaphore <- struct{}{} // Acquire
			err := c.UploadResource(path, portalID, !c.JsonResponse)
			<-semaphore // Release
			results <- err
		}(path)
	}

	wg.Wait()
	close(results)

	if !c.JsonResponse {
		fmt.Println(">> Waiting for all resources links to be generated...")
	}

	maxRetries := 5
	retryInterval := 2 * time.Second
	getResourceApiURL := fmt.Sprintf("%s/api/data_portals/%s/resources", c.BaseURL, portalID)

	for attempt := 0; attempt < maxRetries; attempt++ {
		if attempt != 0 {
			time.Sleep(retryInterval)
			retryInterval *= 2 // exponential backoff
		}

		_, body, err := c.makeRequestFail("GET", getResourceApiURL, nil)
		if err != nil {
			return err
		}

		var response []JsonResource
		if err := json.Unmarshal(body, &response); err != nil {
			return err
		}

		allURLsPresent := true
		for _, resource := range response {
			if resource.URL == "" {
				allURLsPresent = false
				break
			}
		}

		if allURLsPresent {
			if c.JsonResponse {
				helpers.PrettyPrint(response)
			} else {
				for _, resource := range response {
					fmt.Printf(">> Resource URL: %s\n", resource.URL)
				}
			}
			return nil // Exit function successfully when all resources have URLs
		}

	}

	return fmt.Errorf("Failed to generate URLs for all resources")
}

func (c *PFDAClient) UploadResource(path string, portalID string, withProgressBar bool) error {
	createURL := fmt.Sprintf("%s/api/data_portals/%s/resources", c.BaseURL, portalID)
	closeURL := c.BaseURL + "/api/close_file"

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
		return fmt.Errorf("size of file '%s' (%d) exceeds maximum allowed file size(%d)", path, size, maxFileSize)
	}
	if size == 0 {
		return fmt.Errorf("size of file '%s' is 0 - uploading an empty resource is not allowed", path)
	}

	jsonData, err := json.Marshal(map[string]interface{}{
		"name":        filepath.Base(path),
		"description": "Resource created by precisionFDA CLI",
	})
	if err != nil {
		return err
	}

	_, body, err := c.makeRequestFail("POST", createURL, jsonData)
	if err != nil {
		return err
	}

	var result map[string]interface{}
	err = json.Unmarshal(body, &result)
	if err != nil {
		return err
	}

	fileUid := result["fileUid"].(string)
	chunkPool := make(chan uploadChunk, c.NumRoutines)
	wg := c.initWaitGroup(fileUid, chunkPool, &size, withProgressBar)
	c.readAndChunk(file, chunkPool, &size)
	close(chunkPool)
	wg.Wait()

	jsonData, err = json.Marshal(map[string]interface{}{
		"uid": fileUid,
	})
	if err != nil {
		return err
	}

	// This is async; we cannot wait for close, but some delay is called in the main function
	c.makeRequestFail("POST", closeURL, jsonData)
	return nil
}
