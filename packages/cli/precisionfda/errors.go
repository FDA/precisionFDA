package precisionfda

import (
	"os"

	"dnanexus.com/precision-fda-cli/helpers"
)

// HandleError Check for error, if found behave accordingly
func (c *PFDAClient) HandleError(err error) {
	if err != nil {
		helpers.ErrorFromError(err, c.JsonResponse)
		if !c.ContinueOnError {
			os.Exit(1)
		}
	}
}
