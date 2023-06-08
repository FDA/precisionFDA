package helpers

import (
	"strings"
)

func ParseArgsUntilFlag(args []string) ([]string, int) {

	validArgs := make([]string, 0)
	// skip first two which is "pfda <command>"
	OFFSET := 2

	for index, arg := range args[OFFSET:] {
		if !strings.HasPrefix(arg, "-") {
			validArgs = append(validArgs, arg)
		} else {
			return validArgs, index + OFFSET
		}
	}

	return validArgs, OFFSET
}
