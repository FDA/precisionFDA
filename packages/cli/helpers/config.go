package helpers

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"regexp"
)

var ConfigPath = filepath.Join(getUserHomeDir(), ".pfda_config")

var spaceRegex = regexp.MustCompile(`^space-(\d+)$`)

type jsonConfig struct {
	Key    string `json:"key"`
	Server string `json:"server"`
	Scope  string `json:"scope"`
}

// GetConfig loads the pFDA config file and returns the struct.
// A successful call returns (config, nil).
// If the config file does not exist, (&jsonConfig{}, os.ErrNotExist) is returned.
// On other errors, (nil, err) is returned.
func GetConfig() (*jsonConfig, error) {
	f, err := os.ReadFile(ConfigPath)
	if err != nil {
		if os.IsNotExist(err) {
			return &jsonConfig{}, err
		}
		return nil, err
	}
	var config jsonConfig
	err = json.Unmarshal(f, &config)
	if err != nil {
		return nil, err
	}
	return &config, nil
}

func SaveConfig(config *jsonConfig, jsonFlag bool) error {
	jsonData, err := json.Marshal(config)
	if err != nil {
		if !jsonFlag {
			fmt.Fprintf(os.Stderr, "Authorization key could not be serialized: %s\n", err)
		}
		return err
	}

	err = os.WriteFile(ConfigPath, jsonData, 0600) // 0600 is '-rw-------' (owner-only read/write permissions)
	if err != nil {
		if !jsonFlag {
			fmt.Fprintf(os.Stderr, "Could not save authorization key in config file '%s': %s\n", ConfigPath, err)
		}
		return err
	}

	if !jsonFlag {
		fmt.Printf("Saved authorization key in '%s'.\n", ConfigPath)
	}
	return nil
}

func (c *jsonConfig) GetSpaceId() string {
	matches := spaceRegex.FindStringSubmatch(c.Scope)
	if len(matches) != 2 {
		// scope is private/public
		return ""
	}
	// only can be space-{id} now
	return matches[1]
}

func getUserHomeDir() string {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		log.Fatal(err)
	}
	return homeDir
}
