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

func ParseEntityType(entityType string) (string, string) {

	validTypes := map[string]bool{
		"app":        true,
		"job":        true,
		"file":       true,
		"workflow":   true,
		"discussion": true,
	}
	parts := strings.SplitN(entityType, "-", 2)

	if len(parts) > 0 && validTypes[parts[0]] {
		return parts[0], parts[1]
	}

	return "", ""
}
