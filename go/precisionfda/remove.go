package precisionfda

import (
	"encoding/json"
	"fmt"
	"strings"
)

// Remove single file by uid.
func (c *PFDAClient) RemoveFile(uids []string) error {
	deleteFileURL := c.BaseURL + "/api/files/remove"

	data := map[string]interface{}{"uids": uids}
	jsonData, err := json.Marshal(data)
	if err != nil {
		return err
	}
	status, body, err := c.makeRequestFail("POST", deleteFileURL, jsonData)
	var resultJSON map[string]interface{}
	err = json.Unmarshal(body, &resultJSON)

	if err != nil {
		return err
	}

	if !strings.HasPrefix(status, "2") {
		return fmt.Errorf(resultJSON["error"].(map[string]interface{})["message"].(string))
	}

	if resultJSON["message"].(map[string]interface{})["type"] == "error" {
		return fmt.Errorf(">> File(s) %s not found or inaccessible", uids)
	}

	for _,uid := range uids {
		fmt.Printf(">> Deleted %s \n", uid)
	}
	return nil
}

func (c *PFDAClient) RemoveDir(uid string) error {
	deleteFileURL := c.BaseURL + "/api/files/remove"

	data := map[string]interface{}{"ids": []string{uid}}
	jsonData, err := json.Marshal(data)
	if err != nil {
		return err
	}
	status, body, err := c.makeRequestFail("POST", deleteFileURL, jsonData)
	var resultJSON map[string]interface{}
	err = json.Unmarshal(body, &resultJSON)

	if err != nil {
		return err
	}

	if !strings.HasPrefix(status, "2") {
		return fmt.Errorf(resultJSON["error"].(map[string]interface{})["message"].(string))
	}

	if resultJSON["message"].(map[string]interface{})["type"] == "error" {
		return fmt.Errorf("Folder with id: %s not found or inaccessible", uid)
	}

	fmt.Printf(">> Deleted dir (id: %s) \n", uid)
	return nil
}
