package precisionfda

import (
	"bytes"
	"dnanexus.com/precision-fda-cli/helpers"
	"encoding/json"
	"fmt"
	"github.com/hashicorp/go-retryablehttp"
	"io"
	"strings"
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

/**
 * Make a request to the PrecisionFDA API.
 * In case of an error, the function will return the error message in err.
 */
func (c *PFDAClient) makeRequest(requestType string, url string, data []byte) (status string, body []byte, err error) {
	req, err := retryablehttp.NewRequest(requestType, url, bytes.NewReader(data))
	helpers.CheckErr(err)
	c.setPostHeaders(req)

	resp, err := c.Client.Do(req)
	helpers.CheckErr(err)
	defer resp.Body.Close()
	status = resp.Status
	body, _ = io.ReadAll(resp.Body)

	if !strings.HasPrefix(status, "2") {
		err = fmt.Errorf(parseErrorMessage(body))
	}
	return status, body, err
}
