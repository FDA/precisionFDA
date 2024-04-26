package precisionfda

import (
	"dnanexus.com/precision-fda-cli/helpers"
	"encoding/json"
	"fmt"
	"net/url"
	"strconv"
)

// apiConfig holds configuration for making API calls.
type apiConfig struct {
	Path     string
	Endpoint string
	SpaceID  string
	Flags    map[string]bool
}

// lsResource generic function to list various resources.
func (c *PFDAClient) lsResource(config apiConfig) error {
	apiURL := fmt.Sprintf("%s/api/%s/cli_%s", c.BaseURL, config.Path, config.Endpoint)

	params := url.Values{}
	if err := helpers.ValidateID(config.SpaceID, "space_id", params); err != nil {
		return err
	}

	for flag, value := range config.Flags {
		if value {
			params.Add(flag, strconv.FormatBool(value))
		}
	}

	fullURL := fmt.Sprintf("%s?%s", apiURL, params.Encode())
	status, body, err := c.makeRequestFail("GET", fullURL, nil)
	if err != nil {
		if status == "404 Not Found" {
			return fmt.Errorf("Target location not found or inaccessible")
		}
		return err
	}

	var result []map[string]interface{}
	if err := json.Unmarshal(body, &result); err != nil {
		return err
	}

	prettyJSON, _ := json.MarshalIndent(result, "", "    ")
	fmt.Printf("%s\n", string(prettyJSON))
	return nil
}

// Simplified specific listing functions
func (c *PFDAClient) LsApps(spaceID string, flags map[string]bool) error {
	return c.lsResource(apiConfig{Path: "apps", Endpoint: "apps", SpaceID: spaceID, Flags: flags})
}

func (c *PFDAClient) LsAssets(spaceID string, flags map[string]bool) error {
	return c.lsResource(apiConfig{Path: "assets", Endpoint: "assets", SpaceID: spaceID, Flags: flags})
}

func (c *PFDAClient) LsWorkflows(spaceID string, flags map[string]bool) error {
	return c.lsResource(apiConfig{Path: "workflows", Endpoint: "workflows", SpaceID: spaceID, Flags: flags})
}

func (c *PFDAClient) LsExecutions(spaceID string, flags map[string]bool) error {
	return c.lsResource(apiConfig{Path: "jobs", Endpoint: "jobs", SpaceID: spaceID, Flags: flags})
}

func (c *PFDAClient) LsDiscussions(spaceID string, flags map[string]bool) error {
	return c.lsResource(apiConfig{Path: "spaces/" + spaceID, Endpoint: "discussions", SpaceID: "", Flags: flags})
}

func (c *PFDAClient) LsSpaces(flags map[string]bool) error {
	apiURL := fmt.Sprintf("%s/api/spaces/cli", c.BaseURL)

	params := url.Values{}
	for flag, value := range flags {
		if value {
			params.Add(flag, strconv.FormatBool(value))
		}
	}
	fullURL := fmt.Sprintf("%s?%s", apiURL, params.Encode())
	status, body, err := c.makeRequestFail("GET", fullURL, nil)
	if err != nil {
		if status == "404 Not Found" {
			return fmt.Errorf("Something went wrong")
		} else {
			return err
		}
	}

	var spaces []jsonSpaceResponse
	if err := json.Unmarshal(body, &spaces); err != nil {
		return err
	}

	printListSpacesResponse(spaces, flags["json"])
	return nil
}

func (c *PFDAClient) LsMembers(spaceID string) error {
	apiURL := fmt.Sprintf("%s/api/spaces/%s/cli_members", c.BaseURL, spaceID)

	status, body, err := c.makeRequestFail("GET", apiURL, nil)
	if err != nil {
		if status == "404 Not Found" {
			return fmt.Errorf("Space not found or inaccessible")
		}
		return err
	}

	var members []jsonMembersResponse
	if err := json.Unmarshal(body, &members); err != nil {
		return err
	}

	printSpaceMembersResponse(members, c.JsonResponse)
	return nil
}
