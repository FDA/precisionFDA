package precisionfda

import (
	"encoding/json"
	"fmt"

	"dnanexus.com/precision-fda-cli/helpers"
)

func (c *PFDAClient) CreateDiscussion(spaceID string, jsonBody string) error {
	apiURL := fmt.Sprintf("%s/api/v2/cli/spaces/%s/discussions", c.BaseURL, spaceID)

	body, err := c.makeRequest("POST", apiURL, []byte(jsonBody))
	if err != nil {
		return err
	}

	return helpers.PrintPrettyJSON(body)
}

func (c *PFDAClient) CreateReply(jsonBody string) error {
	apiURL := fmt.Sprintf("%s/api/v2/cli/replies", c.BaseURL)

	body, err := c.makeRequest("POST", apiURL, []byte(jsonBody))
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
	body, err := c.makeRequest("PUT", apiURL, []byte(jsonBody))
	if err != nil {
		return err
	}

	return helpers.PrintPrettyJSON(body)
}

func (c *PFDAClient) EditReply(jsonBody string) error {
	var data struct {
		ReplyID     int              `json:"replyId"`
		Content     string           `json:"content,omitempty"`
		Attachments *json.RawMessage `json:"attachments,omitempty"`
	}

	if err := json.Unmarshal([]byte(jsonBody), &data); err != nil {
		return err
	}
	if data.ReplyID == 0 {
		return fmt.Errorf("replyId is required")
	}

	payload, err := json.Marshal(struct {
		Content     string           `json:"content,omitempty"`
		Attachments *json.RawMessage `json:"attachments,omitempty"`
	}{
		Content:     data.Content,
		Attachments: data.Attachments,
	})
	if err != nil {
		return err
	}

	apiURL := fmt.Sprintf("%s/api/v2/cli/replies/%d", c.BaseURL, data.ReplyID)
	body, err := c.makeRequest("PUT", apiURL, payload)
	if err != nil {
		return err
	}

	return helpers.PrintPrettyJSON(body)
}

func (c *PFDAClient) DeleteDiscussion(discussionID string) error {
	apiURL := fmt.Sprintf("%s/api/v2/cli/discussions/%s", c.BaseURL, discussionID)

	_, err := c.makeRequest("DELETE", apiURL, nil)
	return err
}

func (c *PFDAClient) DeleteReply(replyID string) error {
	apiURL := fmt.Sprintf("%s/api/v2/cli/replies/%s", c.BaseURL, replyID)

	_, err := c.makeRequest("DELETE", apiURL, nil)
	return err
}
