package helpers

import (
	"encoding/json"
	"strings"
)

func ParseArgsUntilFlag(args []string) ([]string, int) {
	const offset = 2 // skip first two which is "pfda <command>"

	validArgs := make([]string, 0)
	for index, arg := range args[offset:] {
		// Check if this is a flag
		if strings.HasPrefix(arg, "-") {
			return validArgs, index + offset
		}

		// Check if this argument is JSON
		if IsValidJSON(arg) {
			// Process as a single JSON argument
			trimmed := strings.TrimSpace(arg)
			if trimmed != "" {
				validArgs = append(validArgs, trimmed)
			}
		} else {
			// Split the argument by commas and process each part
			commaSeparated := strings.Split(arg, ",")
			for _, part := range commaSeparated {
				// Trim whitespace from each part
				trimmed := strings.TrimSpace(part)
				// Only add non-empty parts
				if trimmed != "" {
					validArgs = append(validArgs, trimmed)
				}
			}
		}
	}

	return validArgs, len(args)
}

func ParseEntityType(entityType string) string {

	validTypes := map[string]bool{
		"app":        true,
		"job":        true,
		"file":       true,
		"folder":     true,
		"workflow":   true,
		"discussion": true,
		"dbcluster":  true,
	}
	parts := strings.SplitN(entityType, "-", 2)

	if len(parts) > 0 && validTypes[parts[0]] {
		return parts[0]
	}

	return ""
}

func IsValidJSON(str string) bool {
	str = strings.TrimSpace(str)
	var js json.RawMessage
	return json.Unmarshal([]byte(str), &js) == nil
}
