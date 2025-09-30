package precisionfda

import (
	"encoding/json"
	"errors"
	"fmt"
	"strings"

	"dnanexus.com/precision-fda-cli/helpers"
)

const tagCLI = "CLI_created"

// SetTags sets tags to a resource or folder using the API.
// Accepts either resource UID or folder-{id} as entityID.
// Returns an error if the operation fails.
func (c *PFDAClient) SetTags(entityID string, tags []string) error {
	if entityID == "" {
		return errors.New("entityID cannot be empty")
	}

	// Determine if it's a folder and extract the actual ID
	var id string
	var isFolder bool
	if strings.HasPrefix(entityID, "folder-") {
		id = strings.TrimPrefix(entityID, "folder-")
		if id == "" {
			return errors.New("invalid folder ID format")
		}
		isFolder = true
	} else {
		id = entityID
		isFolder = false
	}

	// Build payload based on entity type
	payload := map[string]interface{}{
		"tags": strings.Join(tags, ","),
	}
	if isFolder {
		payload["taggable_folder_id"] = id
	} else {
		payload["taggable_uid"] = id
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	setTagURL := c.BaseURL + "/api/set_tags"
	_, _, err = c.makeRequestFail("POST", setTagURL, jsonData)
	if err != nil {
		return err
	}

	helpers.PrintResult("Tags successfully set", c.JsonResponse)
	return nil
}

func (c *PFDAClient) SetProperties(entityID string, propertiesJSON string) error {
	setPropertiesURL := c.BaseURL + "/api/v2/cli/properties"

	var temp interface{}
	if err := json.Unmarshal([]byte(propertiesJSON), &temp); err != nil {
		return fmt.Errorf("invalid JSON provided: %w", err)
	}

	payload := map[string]interface{}{
		"targetId":   entityID,
		"properties": json.RawMessage(propertiesJSON),
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	_, _, err = c.makeRequest("POST", setPropertiesURL, jsonData)
	if err != nil {
		return err
	}
	helpers.PrintResult("Properties successfully set", c.JsonResponse)
	return nil
}
