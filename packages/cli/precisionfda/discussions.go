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

	err := json.Unmarshal([]byte(jsonBody), &data)
	if err != nil {
		return err
	}
	discussionID := data.DiscussionID

	// Remove the discussionId by re-marshaling without it
	modifiedData := map[string]interface{}{
		"content":     data.Content,
		"attachments": data.Attachments,
	}
	modifiedJSON, err := json.Marshal(modifiedData)
	if err != nil {
		return err
	}

	apiURL := fmt.Sprintf("%s/api/v2/cli/discussions/%d", c.BaseURL, discussionID)

	_, body, err := c.makeRequest("PUT", apiURL, modifiedJSON)

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
