package precisionfda

import (
	"archive/tar"
	"compress/gzip"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"

	"dnanexus.com/precision-fda-cli/helpers"
)

type jsonCreateAssetPayload struct {
	Name  string   `json:"name"`
	Desc  string   `json:"description"`
	Paths []string `json:"paths"`
}

func (c *PFDAClient) UploadAsset(rootFolderPath string, name string, readmeFilePath string) error {
	createURL := c.BaseURL + "/api/v2/cli/assets"

	// Get list of all asset files
	var fileList []string
	assetSize := int64(0)
	err := filepath.Walk(rootFolderPath, func(path string, f os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if !f.IsDir() {
			relPath, err := filepath.Rel(rootFolderPath, path)
			if err != nil {
				return err
			}
			fileList = append(fileList, filepath.ToSlash(relPath))
			assetSize += f.Size()
		}
		return nil
	})
	if err != nil {
		return err
	}

	if assetSize > maxFileSize {
		return fmt.Errorf("Size of asset folder '%s' (%d) exceeds maximum allowed file size (%d)", rootFolderPath, assetSize, maxFileSize)
	}

	if assetSize == 0 {
		return fmt.Errorf("Size of asset folder '%s' is 0 - uploading an empty asset is not allowed", rootFolderPath)
	}

	// Read in the readme all at once
	readmeBuf, err := os.ReadFile(readmeFilePath)
	if err != nil {
		return err
	}

	jsonData, err := json.Marshal(jsonCreateAssetPayload{
		Name:  name,
		Desc:  string(readmeBuf),
		Paths: fileList,
	})
	if err != nil {
		return err
	}

	fileID, err := c.createFileID(createURL, jsonData)
	if err != nil {
		return err
	}

	chunkPool := make(chan uploadChunk, c.NumRoutines)
	// assetSize is the raw (pre-tar) total; the actual tar/tar.gz stream
	// size is unknown until streaming completes.  Seed uploadSize with
	// enough capacity to always start c.NumRoutines workers; readAndChunk
	// overwrites it with the real byte count for accurate progress display.
	uploadSize := int64(c.NumRoutines) * int64(c.ChunkSize)
	wait := c.initWaitGroup(fileID, chunkPool, &uploadSize, true)

	if !c.JsonResponse {
		fmt.Println(">> Archiving asset...")
	}
	// Use Go-native archiving on every OS to avoid platform-specific tar padding.
	// BSD/libarchive tar (macOS, and Windows 10 1803+) pads compressed output to 10240-byte blocking-factor multiples; GNU tar on Linux does not.
	// archive/tar + compress/gzip produces identical, padding-free output everywhere and removes the dependency on a system `tar` binary (older Windows shipped none at all).
	pr, pw := io.Pipe()
	go func() {
		var writeErr error
		if strings.HasSuffix(name, ".tar.gz") {
			gw := gzip.NewWriter(pw)
			tw := tar.NewWriter(gw)
			writeErr = archiveDir(tw, rootFolderPath)
			if closeErr := tw.Close(); closeErr != nil && writeErr == nil {
				writeErr = closeErr
			}
			if closeErr := gw.Close(); closeErr != nil && writeErr == nil {
				writeErr = closeErr
			}
		} else {
			tw := tar.NewWriter(pw)
			writeErr = archiveDir(tw, rootFolderPath)
			if closeErr := tw.Close(); closeErr != nil && writeErr == nil {
				writeErr = closeErr
			}
		}
		pw.CloseWithError(writeErr)
	}()
	if err := c.readAndChunk(pr, chunkPool, &uploadSize); err != nil {
		close(chunkPool)
		wait()
		return fmt.Errorf("archiving asset: %w", err)
	}
	if !c.JsonResponse {
		fmt.Print(">> Uploading asset |")
	}

	close(chunkPool)
	wait()

	if !c.JsonResponse {
		fmt.Println(">| Uploaded 100%\n>> Finalizing asset...")
	}

	closeURL := c.BaseURL + "/api/v2/files/" + fileID + "/close"
	if _, err := c.makeRequest("PATCH", closeURL, nil); err != nil {
		return err
	}
	assetURL := c.BaseURL + "/home/assets/" + fileID
	if c.JsonResponse {
		helpers.PrettyPrint(struct {
			Url string `json:"url"`
		}{Url: assetURL})
	} else {
		fmt.Println(">> Done! Access your asset at " + assetURL)
	}
	return nil
}

// archiveDir writes the contents of rootFolderPath as a POSIX tar archive to tw.
// All entry paths are relative to rootFolderPath and prefixed with "./" to match
// the output produced by `tar -c -C rootFolderPath .`.
func archiveDir(tw *tar.Writer, rootFolderPath string) error {
	return filepath.Walk(rootFolderPath, func(fpath string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		relPath, err := filepath.Rel(rootFolderPath, fpath)
		if err != nil {
			return err
		}
		// Normalize to forward-slash separators (important on Windows).
		relPath = filepath.ToSlash(relPath)

		// Build the in-archive header name; the root directory becomes "./".
		var headerName string
		if relPath == "." {
			headerName = "./"
		} else {
			headerName = "./" + relPath
		}

		// Resolve symlink target when needed.
		linkTarget := ""
		if info.Mode()&os.ModeSymlink != 0 {
			if linkTarget, err = os.Readlink(fpath); err != nil {
				return err
			}
		}

		header, err := tar.FileInfoHeader(info, linkTarget)
		if err != nil {
			return err
		}
		header.Name = headerName
		if info.IsDir() && !strings.HasSuffix(header.Name, "/") {
			header.Name += "/"
		}
		if err := tw.WriteHeader(header); err != nil {
			return err
		}
		if info.Mode().IsRegular() {
			f, err := os.Open(fpath)
			if err != nil {
				return err
			}
			_, err = io.Copy(tw, f)
			f.Close()
			if err != nil {
				return err
			}
		}
		return nil
	})
}
