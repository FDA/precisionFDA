package precisionfda

import (
	"dnanexus.com/precision-fda-cli/helpers"
	"encoding/json"
	"fmt"
)

func (c *PFDAClient) CreateDiscussion(spaceID string, jsonBody string) error {
	apiURL := fmt.Sprintf("%s/api/v2/cli/spaces/%s/discussions", c.BaseURL, spaceID)

	_, body, err := c.makeRequest("POST", apiURL, []byte(jsonBody))
	if err != nil {
		return err
	}

	return helpers.PrintPrettyJSON(body)
}

func (c *PFDAClient) CreateReply(jsonBody string) error {
	apiURL := fmt.Sprintf("%s/api/v2/cli/discussions/reply", c.BaseURL)

	_, body, err := c.makeRequest("POST", apiURL, []byte(jsonBody))
	if err != nil {
		return err
	}

	return helpers.PrintPrettyJSON(body)
}

func (c *PFDAClient) EditDiscussion(jsonBody string) error {
	var data struct {
		DiscussionID int              `json:"discussionId"`
		Content      string           `json:"content"`
		Attachments  *json.RawMessage `json:"attachments,omitempty"`
	}

	if err := json.Unmarshal([]byte(jsonBody), &data); err != nil {
		return err
	}
	discussionID := data.DiscussionID

	apiURL := fmt.Sprintf("%s/api/v2/cli/discussions/%d", c.BaseURL, discussionID)
	_, body, err := c.makeRequest("PUT", apiURL, []byte(jsonBody))
	if err != nil {
		return err
	}

	return helpers.PrintPrettyJSON(body)
}

func (c *PFDAClient) EditReply(jsonBody string) error {
	apiURL := fmt.Sprintf("%s/api/v2/cli/discussions/reply", c.BaseURL)

	_, body, err := c.makeRequest("PUT", apiURL, []byte(jsonBody))
	if err != nil {
		return err
	}

	return helpers.PrintPrettyJSON(body)
}
