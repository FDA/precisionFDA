package precisionfda

import (
	"encoding/json"
	"fmt"
	"strconv"
)

type jsonFindNodesResponse struct {
	Id        int    `json:"id"`
	Uid       string `json:"uid"`
	Name      string `json:"name"`
	Type      string `json:"type"`
	CreatedAt string `json:"createdAt"`
	Size      int64  `json:"fileSize"`
	// populated for Folders only
	Children int `json:"children"`
}

// RemoveFile Remove files by uid.
func (c *PFDAClient) RemoveFile(uids []string) error {
	deleteFileURL := c.BaseURL + "/api/v2/cli/nodes"
	data := map[string]interface{}{"uids": uids}
	jsonData, err := json.Marshal(data)
	if err != nil {
		return err
	}
	body, err := c.makeRequest("DELETE", deleteFileURL, jsonData)
	if err != nil {
		return err
	}

	var result float64
	err = json.Unmarshal(body, &result)
	if err != nil {
		return err
	}

	if result == 0 {
		return fmt.Errorf("File(s) %s not found or inaccessible", uids)
	}

	for _, uid := range uids {
		c.emitItem(jsonRemovedFile{Uid: uid}, "Removed %s \n", uid)
	}
	return nil
}

func (c *PFDAClient) RemoveDir(id string) error {
	deleteFileURL := c.BaseURL + "/api/v2/cli/nodes"

	intId, _ := strconv.Atoi(id)
	data := map[string]interface{}{"ids": []int{intId}}
	jsonData, err := json.Marshal(data)
	if err != nil {
		return err
	}

	body, err := c.makeRequest("DELETE", deleteFileURL, jsonData)
	if err != nil {
		return err
	}

	var result float64
	err = json.Unmarshal(body, &result)
	if err != nil {
		return err
	}

	if result == 0 {
		return fmt.Errorf("Folder with id: %d not found or inaccessible", intId)
	}

	c.emitItem(jsonRemovedFolder{ID: intId}, "Removed dir (id: %s) \n", id)
	return nil
}
