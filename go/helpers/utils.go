package helpers

import (
	"fmt"
	"strconv"
	"strings"
)

func Min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func IsFileId(arg string) bool {
	return strings.HasPrefix(arg, "file-") && len(arg) >= 31
}

func IsFolderId(arg string) bool {
	num, err := strconv.Atoi(arg)
	return err == nil && num > 0
}

func ContainsWildcard(arg string) bool {
	return strings.Contains(arg, "?") || strings.Contains(arg, "*")
}

func TransformToSQLWildcards(nameWithWildcards string) string {
	mysqlWildcard := strings.ReplaceAll(nameWithWildcards, "*", "%")
	mysqlWildcard = strings.ReplaceAll(mysqlWildcard, "_", "\\_")
	mysqlWildcard = strings.ReplaceAll(mysqlWildcard, "?", "_")
	return mysqlWildcard
}

func GetChunkSize(filesCount int) int {
	switch size := filesCount; {
	case size < 5:
		return 1
	case size < 10:
		return 2
	case size < 20:
		return 4
	case size < 35:
		return 7
	case size < 50:
		return 10
	case size < 100:
		return 20
	default:
		return 25
	}
}

func CheckErr(e error) {
	if e != nil {
		panic(e)
	}
}

func InputError(msg string) int {
	PrintError(fmt.Errorf(msg))
	return 1
}
