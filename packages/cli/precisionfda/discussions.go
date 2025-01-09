package precisionfda

import (
	"encoding/json"
	"fmt"
)

func (c *PFDAClient) CreateDiscussion(spaceID string, jsonBody string) error {
	apiURL := fmt.Sprintf("%s/api/v2/cli/spaces/%s/discussions", c.BaseURL, spaceID)

	_, body, err := c.makeRequest("POST", apiURL, []byte(jsonBody))

	if err != nil {
		return err
	}

	var result map[string]interface{}
	if err := json.Unmarshal(body, &result); err != nil {
		return err
	}

	prettyJSON, _ := json.MarshalIndent(result, "", "    ")
	fmt.Printf("%s\n", string(prettyJSON))
	return nil
}

func (c *PFDAClient) CreateReply(jsonBody string) error {
	apiURL := fmt.Sprintf("%s/api/v2/cli/discussions/reply", c.BaseURL)

	_, body, err := c.makeRequest("POST", apiURL, []byte(jsonBody))

	if err != nil {
		return err
	}

	var result map[string]interface{}
	if err := json.Unmarshal(body, &result); err != nil {
		return err
	}

	prettyJSON, _ := json.MarshalIndent(result, "", "    ")
	fmt.Printf("%s\n", string(prettyJSON))
	return nil
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

	var result map[string]interface{}
	if err := json.Unmarshal(body, &result); err != nil {
		return err
	}

	prettyJSON, _ := json.MarshalIndent(result, "", "    ")
	fmt.Printf("%s\n", string(prettyJSON))
	return nil
}

func (c *PFDAClient) EditReply(jsonBody string) error {
	apiURL := fmt.Sprintf("%s/api/v2/cli/discussions/reply", c.BaseURL)

	_, body, err := c.makeRequest("PUT", apiURL, []byte(jsonBody))

	if err != nil {
		return err
	}

	var result map[string]interface{}
	if err := json.Unmarshal(body, &result); err != nil {
		return err
	}

	prettyJSON, _ := json.MarshalIndent(result, "", "    ")
	fmt.Printf("%s\n", string(prettyJSON))
	return nil
}
