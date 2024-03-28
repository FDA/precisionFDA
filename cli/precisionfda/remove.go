package precisionfda

import (
	"dnanexus.com/precision-fda-cli/helpers"
	"encoding/json"
	"fmt"
	"strconv"
)

// RemoveFile Remove files by uid.
func (c *PFDAClient) RemoveFile(uids []string) error {
	deleteFileURL := c.BaseURL + "/api/files/cli_remove"
	data := map[string]interface{}{"uids": uids}
	jsonData, err := json.Marshal(data)
	if err != nil {
		return err
	}
	_, body, err := c.makeRequestFail("POST", deleteFileURL, jsonData)
	if err != nil {
		return err
	}
	var resultJSON map[string]interface{}
	err = json.Unmarshal(body, &resultJSON)

	if err != nil {
		return err
	}

	if resultJSON["count"].(float64) == 0 {
		return fmt.Errorf("File(s) %s not found or inaccessible", uids)
	}

	for _, uid := range uids {
		if c.JsonResponse {
			helpers.PrettyPrint(struct {
				Uid string `json:"uid"`
			}{Uid: uid})
		} else {
			fmt.Printf("Removed %s \n", uid)
		}
	}
	return nil
}

func (c *PFDAClient) RemoveDir(uid string) error {
	deleteFileURL := c.BaseURL + "/api/files/cli_remove"

	data := map[string]interface{}{"ids": []string{uid}}
	jsonData, err := json.Marshal(data)
	if err != nil {
		return err
	}

	_, body, err := c.makeRequestFail("POST", deleteFileURL, jsonData)
	if err != nil {
		return err
	}

	var resultJSON map[string]interface{}
	err = json.Unmarshal(body, &resultJSON)
	if err != nil {
		return err
	}

	if resultJSON["count"].(float64) == 0 {
		return fmt.Errorf("Folder with id: %s not found or inaccessible", uid)
	}

	if c.JsonResponse {
		folderId, _ := strconv.Atoi(uid)
		helpers.PrettyPrint(struct {
			ID int `json:"id"`
		}{ID: folderId})
	} else {
		fmt.Printf("Removed dir (id: %s) \n", uid)
	}
	return nil
}
