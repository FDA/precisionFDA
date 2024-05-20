package precisionfda

import (
	"encoding/json"
)

const tagCLI = "CLI_created"

// TagCliFile tags a file with a predefined tag.
func (c *PFDAClient) TagCliFile(fileID string) {
	c.tagResource("taggable_uid", fileID)
}

// TagCliFolder tags a folder with a predefined tag.
func (c *PFDAClient) TagCliFolder(folderID string) {
	c.tagResource("taggable_folder_id", folderID)
}

func (c *PFDAClient) tagResource(resourceKey, resourceID string) {
	jsonData, err := json.Marshal(map[string]interface{}{
		resourceKey: resourceID,
		"tags":      tagCLI,
	})
	if err != nil {
		return
	}

	c.addCLITag(jsonData)
}

func (c *PFDAClient) addCLITag(jsonData []byte) {
	setTagURL := c.BaseURL + "/api/set_tags"
	c.makeRequestFail("POST", setTagURL, jsonData)
}
