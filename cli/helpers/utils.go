package helpers

import (
	"encoding/json"
	"fmt"
	"math"
	"net/url"
	"strconv"
	"strings"
)

type ErrorResponse struct {
	Error string `json:"error"`
}

func Min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func Max(a, b int) int {
	if a > b {
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

// Calculate chunk size using math.Ceil to round up,
// ensuring the number of chunks does not exceed 10 000.
func CalculateChunkSize(fileSize int64, minChunkSize int) int {
	const maxChunks = 10_000
	idealChunkSize := int(math.Ceil(float64(fileSize) / float64(maxChunks-1)))
	return Max(idealChunkSize, minChunkSize)
}

func ValidateID(id string, paramName string, params url.Values) error {
	if id != "" {
		if _, err := strconv.Atoi(id); err != nil {
			return fmt.Errorf("Invalid %s - expected an integer", paramName)
		}
		params.Add(paramName, id)
	}
	return nil
}

func CheckErr(e error) {
	if e != nil {
		panic(e)
	}
}

// PrintError prints the error to standard output. If asJSON is true, it prints in JSON format.
func PrintError(err error, asJSON bool) {
	if asJSON {
		jsonErr, _ := json.Marshal(ErrorResponse{Error: err.Error()})
		fmt.Println(string(jsonErr))
	} else {
		// Default to plain text
		fmt.Println("Error:", err.Error())
	}
}

func ErrorFromError(err error, asJSON bool) int {
	PrintError(err, asJSON)
	return 1
}

func ErrorFromString(msg string, asJSON bool) int {
	PrintError(fmt.Errorf(msg), asJSON)
	return 1
}

func PrintResult(result string, asJSON bool) {
	if asJSON {
		jsonData, _ := json.MarshalIndent(struct {
			Result string `json:"result"`
		}{Result: result}, "", "")
		fmt.Println(string(jsonData))
	} else {
		// Default to plain text
		fmt.Println(result)
	}
}

// PrettyPrint takes an empty interface as input, which can be either a byte slice of raw JSON
// or any Go data structure. It then pretty-prints the JSON representation of the input.
func PrettyPrint(data interface{}) {
	var jsonData []byte

	switch v := data.(type) {
	case []byte:
		// Attempt to unmarshal and marshal to pretty-print, ignore errors.
		var tmp interface{}
		if err := json.Unmarshal(v, &tmp); err == nil {
			jsonData, _ = json.MarshalIndent(tmp, "", "  ")
		}
	default:
		// Attempt to marshal directly to pretty-printed JSON, ignore errors.
		jsonData, _ = json.MarshalIndent(data, "", "  ")
	}
	fmt.Println(string(jsonData))
}
