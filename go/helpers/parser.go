package helpers

import (
	"strings"
)

func ParseArgsUntilFlag(args []string) ([]string, int) {
	const offset = 2 // skip first two which is "pfda <command>"

	validArgs := make([]string, 0)
	for index, arg := range args[offset:] {
		if strings.HasPrefix(arg, "-") {
			return validArgs, index + offset
		}
		validArgs = append(validArgs, arg)
	}

	return validArgs, len(args)
}
