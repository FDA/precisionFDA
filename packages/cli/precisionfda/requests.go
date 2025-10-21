package precisionfda

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"

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
			req.Header.Set(key, value.(string))
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
