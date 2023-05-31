package helpers

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strconv"
	"strings"
)

var ConfigPath = filepath.Join(getUserHomeDir(), ".pfda_config")

type jsonConfig struct {
	Key string `json:key`
	Server string `json:server`
	Scope  string `json:scope`
}

func CreateConfig() *jsonConfig {
	config := jsonConfig{}
	return &config
}

// GetConfig loads the pFDA config file and returns the struct.
// A successful call returns (config, nil).
// In case the config was not found in FS or an error occurred, (nil, err) is returned.
func GetConfig() (*jsonConfig, error) {
	f, err := os.ReadFile(ConfigPath)
	if err != nil {
		// Internal error reading config
		return nil, err
	}
	var config jsonConfig
	err = json.Unmarshal(f, &config)
	if err != nil {
		return nil, err
	}
	return &config, nil
}

func SaveConfig(config *jsonConfig) {
	// If key was given by -key option in the command line
	// marshal it to json and write into .pfda__config
	// if marshaling fails, issue warning and exit
	jsonData, err := json.Marshal(config)
	if err != nil {
		fmt.Printf("While the file has been uploaded succesfully\n, the authorization key can't be marshaled to json and saved in '%s': %s\n", ConfigPath, err.Error())
		fmt.Printf("You will need to submit authorization key in the command line in the next operation.\n")
		// exit gracefully, without panic
	}

	// below is a more compact and cleaner implementation which is recommended when writing small files
	// It doesn't use separate Create / Write from os package, as before but takes advantage of
	// os.WriteFile which opens, writes and closes a file in one swoop
	// denote, that it also works on Windows ( checked on AWS EC2 windows instance )
	// despite Linux style file permissions are given
	// if .pfda_config exists it is truncaters before writing
	// denote also there is no need in defer f.Close(), since ioutil.WriteFile closes the file immediately after writing it
	err = os.WriteFile(ConfigPath, jsonData, 0644) // 0644 is '-rw -r- -r-'
	if err != nil {
		fmt.Printf("Could not save authorization key in config file '%s': %s\n", ConfigPath, err.Error())
	} else {
		fmt.Printf("Saved authorization key in config file '%s'. \nA new key does not need to be provided for 24 hours from the generation time of the provided key.\n", ConfigPath)
	}
}

func (c *jsonConfig) GetSpaceId() string {
	parts := strings.Split(c.Scope, "-")
	// scope is private/public
	if len(parts) != 2 {
		return ""
	}
	// only can be space-{id} now
	_, err := strconv.Atoi(parts[1])
	if (err) != nil {
		fmt.Println("Error while parsing space-id", err)
		return ""
	}
	return parts[1]
}

func getUserHomeDir() string {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		log.Fatal(err)
	}
	return homeDir
}
