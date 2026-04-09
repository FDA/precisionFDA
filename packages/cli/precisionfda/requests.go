package precisionfda

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"strings"

	"github.com/hashicorp/go-retryablehttp"
)

type ErrorResponse struct {
	Error struct {
		Code       string `json:"code"`
		Message    string `json:"message"`
		StatusCode int    `json:"statusCode"`
	} `json:"error"`
}

func parseErrorMessage(responseBody []byte) string {
	var errorResponse ErrorResponse

	// Try to unmarshal the JSON
	if err := json.Unmarshal(responseBody, &errorResponse); err != nil {
		return "Failed to parse error response."
	}

	// Return the error message if available
	if errorResponse.Error.Message != "" {
		return errorResponse.Error.Message
	}

	// Fallback message if no error message is found
	return "An unknown error occurred."
}

func (c *PFDAClient) makeRequestWithHeaders(requestType string, url string, headers map[string]interface{}, data []byte) ([]byte, error) {
	req, err := retryablehttp.NewRequest(requestType, url, bytes.NewReader(data))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// only set pfda headers if no custom headers are provided
	if len(headers) == 0 {
		c.setPostHeaders(req)
	} else {
		for key, value := range headers {
			if strVal, ok := value.(string); ok {
				req.Header.Set(key, strVal)
			}
		}
	}

	resp, err := c.Client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("API error (status %d): %s", resp.StatusCode, parseErrorMessage(body))
	}

	return body, nil
}

/**
 * Make a request to the PrecisionFDA API.
 * Returns the response body on success, or an error with status information.
 */
func (c *PFDAClient) makeRequest(requestType string, url string, data []byte) ([]byte, error) {
	return c.makeRequestWithHeaders(requestType, url, nil, data)
}

// makeGetJSON performs a GET request and unmarshal the JSON response body into dest.
func (c *PFDAClient) makeGetJSON(url string, dest interface{}) error {
	body, err := c.makeRequest("GET", url, nil)
	if err != nil {
		return err
	}
	return json.Unmarshal(body, dest)
}

// Deprecated: This method is not handling errors correctly, use makeRequest instead.
func (c *PFDAClient) makeRequestFail(requestType string, url string, data []byte) (status string, body []byte, err error) {
	req, err := retryablehttp.NewRequest(requestType, url, bytes.NewReader(data))
	if err != nil {
		return "", nil, fmt.Errorf("request failed: %w", err)
	}
	c.setPostHeaders(req)

	resp, err := c.Client.Do(req)
	if err != nil {
		return "", nil, fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()
	status = resp.Status
	body, _ = io.ReadAll(resp.Body)

	if !strings.HasPrefix(status, "2") {
		err = fmt.Errorf("%s Request to '%s' failed with status %s. For 4xx status, check that the provided id and auth-key are still valid.\n", requestType, url, status)
	}
	return status, body, err
}

func (c *PFDAClient) setPostHeaders(req *retryablehttp.Request) {
	req.Header.Set("User-Agent", c.UserAgent)
	if c.AuthKey != "" {
		req.Header.Set("Authorization", "Key "+c.AuthKey)
	}
	req.Header.Set("Content-Type", "application/json")
}
