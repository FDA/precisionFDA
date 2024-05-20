package precisionfda

import (
	"dnanexus.com/precision-fda-cli/helpers"
	"fmt"
	"os"
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

func inputError(msg string) {
	fmt.Println(fmt.Errorf(msg))
	os.Exit(1)
}
