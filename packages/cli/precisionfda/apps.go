package precisionfda

import (
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"dnanexus.com/precision-fda-cli/helpers"
)

const (
	httpsAppPollInterval = 15 * time.Second
	httpsAppPollTimeout  = 10 * time.Minute
)

// RunApp launches an application with the specified configuration.
func (c *PFDAClient) RunApp(appUID string, jsonConfig string) error {
	apiURL := fmt.Sprintf("%s/api/v2/cli/apps/%s/run", c.BaseURL, appUID)

	body, err := c.makeRequest("POST", apiURL, []byte(jsonConfig))
	if err != nil {
		return err
	}

	var result map[string]interface{}
	if err := json.Unmarshal(body, &result); err != nil {
		return err
	}

	jobUID, ok := result["jobUid"].(string)
	if !ok {
		return fmt.Errorf("no jobUid in response")
	}
	execURL := c.buildExecURL(jsonConfig, jobUID)

	jobInfo, err := c.describeJob(jobUID)
	if err != nil {
		return err
	}

	// Check if HTTPS app (workstation)
	if httpsApp, ok := jobInfo["httpsApp"].(map[string]interface{}); ok {
		if enabled, _ := httpsApp["enabled"].(bool); enabled {
			return c.outputHTTPSAppResult(jobUID, execURL)
		}
	}

	return c.outputJobResult(jobUID, execURL)
}

// TerminateJob terminates a running job.
func (c *PFDAClient) TerminateJob(jobUID string) error {
	apiURL := fmt.Sprintf("%s/api/v2/cli/jobs/%s/terminate", c.BaseURL, jobUID)

	if _, err := c.makeRequest("PATCH", apiURL, nil); err != nil {
		return err
	}

	if c.JsonResponse {
		helpers.PrintResult("Job termination started", true)
	} else {
		fmt.Printf(">> Job termination requested successfully\n")
	}
	return nil
}

// describeJob fetches job description from the API.
func (c *PFDAClient) describeJob(jobUID string) (map[string]interface{}, error) {
	url := fmt.Sprintf("%s/api/v2/cli/%s/describe", c.BaseURL, jobUID)
	body, err := c.makeRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	var result map[string]interface{}
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, err
	}
	return result, nil
}

// buildExecURL constructs the execution URL based on scope from config.
func (c *PFDAClient) buildExecURL(jsonConfig string, jobUID string) string {
	var config map[string]interface{}
	scope := "private"
	if json.Unmarshal([]byte(jsonConfig), &config) == nil {
		if s, ok := config["scope"].(string); ok && s != "" {
			scope = s
		}
	}

	if scope != "private" && strings.HasPrefix(scope, "space-") {
		spaceID := scope[6:] // remove "space-" prefix
		return fmt.Sprintf("%s/spaces/%s/executions/%s", c.BaseURL, spaceID, jobUID)
	}
	return fmt.Sprintf("%s/home/executions/%s", c.BaseURL, jobUID)
}

// outputJobResult prints the result for a regular (non-HTTPS) job.
func (c *PFDAClient) outputJobResult(jobUID, execURL string) error {
	if c.JsonResponse {
		helpers.PrettyPrint(struct {
			JobUID       string `json:"jobUid"`
			ExecutionURL string `json:"executionUrl"`
		}{JobUID: jobUID, ExecutionURL: execURL})
	} else {
		fmt.Printf(">> Job UID: %s\n", jobUID)
		fmt.Printf(">> Execution URL: %s\n", execURL)
	}
	return nil
}

// outputHTTPSAppResult polls for workstation URL and prints the result.
func (c *PFDAClient) outputHTTPSAppResult(jobUID, execURL string) error {
	httpsURL, err := c.pollForHTTPSAppURL(jobUID)
	if err != nil {
		return err
	}

	if c.JsonResponse {
		helpers.PrettyPrint(struct {
			JobUID         string `json:"jobUid"`
			ExecutionURL   string `json:"executionUrl"`
			WorkstationURL string `json:"workstationUrl"`
		}{JobUID: jobUID, ExecutionURL: execURL, WorkstationURL: httpsURL})
	} else {
		fmt.Printf(">> Job UID: %s\n", jobUID)
		fmt.Printf(">> Execution URL: %s\n", execURL)
		fmt.Printf("%s>> Workstation URL: %s%s\n", helpers.ColorGreen, httpsURL, helpers.ColorReset)
	}
	return nil
}

// pollForHTTPSAppURL polls until the workstation URL is available.
func (c *PFDAClient) pollForHTTPSAppURL(jobUID string) (string, error) {
	var spinner *helpers.Spinner
	if !c.JsonResponse {
		spinner = helpers.NewSpinner("Waiting for workstation to launch...")
		spinner.Start()
	}
	defer spinner.Stop()

	ticker := time.NewTicker(httpsAppPollInterval)
	defer ticker.Stop()
	startTime := time.Now()

	for {
		url, err := c.getHTTPSAppURL(jobUID)
		if err != nil {
			return "", err
		}
		if url != "" {
			return url, nil
		}

		select {
		case <-ticker.C:
			if time.Since(startTime) > httpsAppPollTimeout {
				return "", fmt.Errorf("timeout waiting for workstation URL after %v", httpsAppPollTimeout)
			}
		}
	}
}

var httpsAppTerminalStates = map[string]bool{
	"failed":     true,
	"terminated": true,
	"done":       true,
}

// getHTTPSAppURL returns the workstation URL if the job is running and ready.
// Returns an error if the job has entered a terminal state or if the describe call fails.
func (c *PFDAClient) getHTTPSAppURL(jobUID string) (string, error) {
	job, err := c.describeJob(jobUID)
	if err != nil {
		return "", fmt.Errorf("failed to describe job %s: %w", jobUID, err)
	}

	state, _ := job["state"].(string)
	if httpsAppTerminalStates[state] {
		return "", fmt.Errorf("job %s ended in terminal state: %s", jobUID, state)
	}

	// Check: state == "running" && properties.httpsAppState == "running"
	if state != "running" {
		return "", nil
	}
	if props, ok := job["properties"].(map[string]interface{}); ok {
		if httpsState, _ := props["httpsAppState"].(string); httpsState != "running" {
			return "", nil
		}
	} else {
		return "", nil
	}

	// Extract httpsApp.dns.url
	if httpsApp, ok := job["httpsApp"].(map[string]interface{}); ok {
		if dns, ok := httpsApp["dns"].(map[string]interface{}); ok {
			if url, ok := dns["url"].(string); ok {
				return url, nil
			}
		}
	}
	return "", nil
}
