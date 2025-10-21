package precisionfda

import (
	"fmt"

	"dnanexus.com/precision-fda-cli/helpers"
)

func (c *PFDAClient) GetDbClusterPassword(dbClusterId string) error {
	apiURL := fmt.Sprintf("%s/api/v2/cli/dbclusters/%s/password", c.BaseURL, dbClusterId)

	body, err := c.makeRequest("GET", apiURL, nil)
	if err != nil {
		return err
	}

	return helpers.PrintPrettyJSON(body)
}
func (c *PFDAClient) RotateDbClusterPassword(dbClusterId string) error {
	apiURL := fmt.Sprintf("%s/api/v2/cli/dbclusters/%s/password", c.BaseURL, dbClusterId)

	body, err := c.makeRequest("POST", apiURL, nil)
	if err != nil {
		return err
	}

	return helpers.PrintPrettyJSON(body)
}
