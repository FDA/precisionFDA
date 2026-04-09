package precisionfda

import (
	"encoding/json"
	"fmt"
	"net/url"
	"os"
	"strconv"
	"strings"
	"text/tabwriter"

	"dnanexus.com/precision-fda-cli/helpers"
)

// apiConfig holds configuration for making API calls.
type apiConfig struct {
	Path     string
	Endpoint string
	SpaceID  string
	Flags    map[string]bool
}

// better name needed
type jsonSpaceResponse struct {
	Id        int     `json:"id"`
	Title     string  `json:"title"`
	Role      *string `json:"role"` // null when caller has no membership (e.g. site admin)
	Side      *string `json:"side"` // null when caller has no membership (e.g. site admin)
	Type      string  `json:"type"`
	State     string  `json:"state"`
	Protected bool    `json:"protected"`
}

type jsonMembersResponse struct {
	Id        int    `json:"id"`
	Active    bool   `json:"active"`
	CreatedAt string `json:"createdAt"`
	Role      string `json:"role"`
	Side      string `json:"side"`
	Name      string `json:"name"`
	Username  string `json:"username"`
}

// better name needed
type jsonFileResponse struct {
	Id        int    `json:"id"`
	Uid       string `json:"uid"`
	Name      string `json:"name"`
	Type      string `json:"type"`
	Locked    bool   `json:"locked"`
	State     string `json:"state"`
	AddedBy   string `json:"added_by"`
	CreatedAt string `json:"created_at"`
	Size      int64  `json:"file_size"`
	// populated for Folders only
	Children int `json:"children,omitempty"`
}

type jsonMetaResponse struct {
	Scope string `json:"scope"`
	Path  string `json:"path"`
}

type jsonListingResponse struct {
	Meta  jsonMetaResponse   `json:"meta"`
	Files []jsonFileResponse `json:"files"`
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

func (c *PFDAClient) LsAssets(scope string) error {
	apiURL := fmt.Sprintf("%s/api/v2/cli/assets", c.BaseURL)

	params := url.Values{}
	if scope != "" {
		params.Set("scope", scope)
	}

	fullURL := fmt.Sprintf("%s?%s", apiURL, params.Encode())
	body, err := c.makeRequest("GET", fullURL, nil)
	if err != nil {
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

func (c *PFDAClient) LsWorkflows(spaceID string, flags map[string]bool) error {
	return c.lsResource(apiConfig{Path: "workflows", Endpoint: "workflows", SpaceID: spaceID, Flags: flags})
}

func (c *PFDAClient) LsExecutions(scope string) error {
	apiURL := fmt.Sprintf("%s/api/v2/cli/jobs", c.BaseURL)

	params := url.Values{}
	if scope != "" {
		params.Set("scope", scope)
	}

	fullURL := fmt.Sprintf("%s?%s", apiURL, params.Encode())
	body, err := c.makeRequest("GET", fullURL, nil)
	if err != nil {
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

func (c *PFDAClient) LsDiscussions(spaceID string) error {
	apiURL := fmt.Sprintf("%s/api/v2/cli/spaces/%s/discussions", c.BaseURL, spaceID)

	body, err := c.makeRequest("GET", apiURL, nil)
	if err != nil {
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

func (c *PFDAClient) LsSpaces(state string, types []string, protected bool) error {
	apiURL := fmt.Sprintf("%s/api/v2/cli/spaces", c.BaseURL)

	params := url.Values{}
	if state != "" {
		params.Set("state", state)
	}
	for _, t := range types {
		params.Add("types[]", t)
	}
	if protected {
		params.Set("protected", "true")
	}

	fullURL := fmt.Sprintf("%s?%s", apiURL, params.Encode())
	body, err := c.makeRequest("GET", fullURL, nil)
	if err != nil {
		return err
	}

	var spaces []jsonSpaceResponse
	if err := json.Unmarshal(body, &spaces); err != nil {
		return err
	}

	printListSpacesResponse(spaces, c.JsonResponse)
	return nil
}

func (c *PFDAClient) LsMembers(spaceID string) error {
	apiURL := fmt.Sprintf("%s/api/v2/cli/spaces/%s/members", c.BaseURL, spaceID)

	body, err := c.makeRequest("GET", apiURL, nil)
	if err != nil {
		return err
	}

	var members []jsonMembersResponse
	if err := json.Unmarshal(body, &members); err != nil {
		return err
	}

	printSpaceMembersResponse(members, c.JsonResponse)
	return nil
}

func printListingVerbose(files []jsonFileResponse, meta jsonMetaResponse) {
	if len(files) == 0 {
		return
	}
	fmt.Printf("Scope: %s\nPath: %s\n\n", meta.Scope, meta.Path)

	isSpaceOrPublicContext := strings.Contains(meta.Scope, "space") || strings.Contains(meta.Scope, "Public")
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 2, '\t', tabwriter.AlignRight)

	// Function to join and print a line
	printLine := func(columns ...string) {
		fmt.Fprintln(writer, strings.Join(columns, "\t")+"\t")
	}

	// Determine the headers based on the context
	headers := []string{"File/Folder ID", "State", "Type", "Status", "Size", "Created"}
	if isSpaceOrPublicContext {
		headers = append(headers, "Added By")
	}
	headers = append(headers, "Name")
	printLine(headers...)

	for _, file := range files {
		columns := []string{
			getFileID(file),
			file.State,
			file.Type,
			helpers.FormatValue(file.Locked, "Locked"),
			getFileSize(file),
			file.CreatedAt,
		}
		if isSpaceOrPublicContext {
			columns = append(columns, file.AddedBy)
		}
		columns = append(columns, file.Name)
		printLine(columns...)
	}
	writer.Flush()
}

// pass all flags, so we can optimize the table header - if in 'private' do not show added-by
func printListingResponse(response jsonListingResponse, asJSON bool, brief bool) {
	if asJSON {
		prettyJSON, _ := json.MarshalIndent(response, "", "  ")
		fmt.Println(string(prettyJSON))
	} else if brief {
		printListingSimple(response.Files)
	} else {
		printListingVerbose(response.Files, response.Meta)
	}
}

func printListingSimple(files []jsonFileResponse) {
	if len(files) == 0 {
		return
	}

	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)

	// Function to join and print a line
	printLine := func(columns []string) {
		fmt.Fprintln(writer, strings.Join(columns, "\t")+"\t")
	}

	// Print header
	printLine([]string{"File/Folder ID", "Name"})

	for _, file := range files {
		printLine([]string{getFileID(file), file.Name})
	}

	writer.Flush()
}

func getFileID(file jsonFileResponse) string {
	if file.Type == "UserFile" {
		return file.Uid
	}
	return strconv.Itoa(file.Id)
}

func getFileSize(file jsonFileResponse) string {
	if file.Type == "UserFile" {
		return helpers.HumanReadableSize(file.Size)
	}
	return ""
}

func printListSpacesResponse(spaces []jsonSpaceResponse, asJSON bool) {
	if asJSON {
		prettyJSON, _ := json.MarshalIndent(spaces, "", "    ")
		fmt.Println(string(prettyJSON))
	} else if len(spaces) > 0 {
		writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)

		// Function to join and print a line
		printLine := func(columns []string) {
			fmt.Fprintln(writer, strings.Join(columns, "\t")+"\t")
		}

		headers := []string{"ID", "Type", "Status", "Role", "Side", "Name"}
		printLine(headers)

		for _, space := range spaces {
			role := helpers.DerefOrDefault(space.Role, "-")
			side := helpers.DerefOrDefault(space.Side, "-")
			columns := []string{strconv.Itoa(space.Id), space.Type, helpers.FormatValue(space.Protected, "Protected"), role, side, space.Title}
			printLine(columns)
		}
		writer.Flush()
	}
}

func printSpaceMembersResponse(members []jsonMembersResponse, asJSON bool) {
	if asJSON {
		prettyJSON, _ := json.MarshalIndent(members, "", "    ")
		fmt.Println(string(prettyJSON))
	} else if len(members) > 0 {
		writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)

		// Function to join and print a line
		printLine := func(columns []string) {
			fmt.Fprintln(writer, strings.Join(columns, "\t")+"\t")
		}

		headers := []string{"ID", "Name", "Role", "Side", "Active", "Added at"}
		printLine(headers)

		for _, member := range members {
			columns := []string{strconv.Itoa(member.Id), member.Name, member.Role, member.Side, strconv.FormatBool(member.Active), member.CreatedAt}
			printLine(columns)
		}
		writer.Flush()
	}
}
