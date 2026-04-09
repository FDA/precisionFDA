package precisionfda

import (
	"bufio"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"path"
	"regexp"

	"dnanexus.com/precision-fda-cli/helpers"
	"github.com/docker/go-units"
	"github.com/gosuri/uilive"
	"github.com/hashicorp/go-retryablehttp"
)

// ProgressWriter counts the number of bytes written to it.
type ProgressWriter struct {
	Total      int64
	Downloaded int64
	Writer     *uilive.Writer
}

// Write implements the io.Writer interface.
func (wc *ProgressWriter) Write(p []byte) (int, error) {
	n := len(p)
	wc.Downloaded += int64(n)
	percent := 100 * float64(wc.Downloaded) / float64(wc.Total)
	fmt.Fprintf(wc.Writer, "                  %.1f%% (%s of %s)\n", percent, units.BytesSize(float64(wc.Downloaded)), units.BytesSize(float64(wc.Total)))
	wc.Writer.Flush()
	return n, nil
}

func NewProgressWriter(totalBytes int64, writer *uilive.Writer) *ProgressWriter {
	return &ProgressWriter{totalBytes, 0, writer}
}

type Writer struct {
	Total  int64
	Writer *uilive.Writer
}

func NewWriter(totalBytes int64, writer *uilive.Writer) *Writer {
	return &Writer{totalBytes, writer}
}

// Write implements the io.Writer interface.
func (wc *Writer) Write(p []byte) (int, error) {
	wc.Writer.Flush()
	return len(p), nil
}

func (c *PFDAClient) DownloadFromUrl(fileURL string, outputFilePath string, fileSize int64, withProgressBar bool) error {
	out, err := os.Create(outputFilePath) // Create the file
	if err != nil {
		return err
	}
	defer out.Close()

	req, err := retryablehttp.NewRequest("GET", fileURL, nil)
	if err != nil {
		return err
	}
	c.setPostHeaders(req)
	resp, err := c.Client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	writer := uilive.New()
	writer.Start()
	defer writer.Stop()

	// Writer the body to file
	if withProgressBar {
		body := io.TeeReader(resp.Body, NewProgressWriter(fileSize, writer))
		_, err = io.Copy(out, body)
		return err
	} else {
		body := io.TeeReader(resp.Body, NewWriter(0, writer))
		_, err = io.Copy(out, body)
		return err
	}
}

func (c *PFDAClient) DownloadDirectly(downloadUrl string, outputFilePath string, overwrite string) error {
	originalName := path.Base(downloadUrl)
	fileName, err := url.PathUnescape(originalName)
	if err != nil {
		fileName = originalName
	}
	if outputFilePath == "" {
		// If output is not specified, use the original filename and current working directory
		dir, err := os.Getwd()
		if err != nil {
			return err
		}

		outputFilePath = path.Join(dir, fileName)
	} else if fileInfo, err := os.Stat(outputFilePath); err == nil && fileInfo.IsDir() {
		// If outputFilePath exists, and it is a directory then the file should be downloaded
		// to that directory while retaining its original name
		outputFilePath = path.Join(outputFilePath, fileName)
	}

	if _, err := os.Stat(outputFilePath); err == nil && (overwrite == "false" || overwrite == "") {
		helpers.PrintError(fmt.Errorf("Path %s already exists but -overwrite flag not set to true - skipping download", outputFilePath), c.JsonResponse)
		return nil
	}

	err = c.DownloadFromUrl(downloadUrl, outputFilePath, 0, false)
	if err != nil {
		helpers.PrintError(fmt.Errorf("Download of %s failed - %s.\n", fileName, err), c.JsonResponse)
		return nil
	}

	if c.JsonResponse {
		helpers.PrettyPrint(struct {
			FileName string `json:"file_name"`
			Path     string `json:"path"`
		}{FileName: fileName, Path: outputFilePath})
	} else {
		fmt.Printf("Downloaded %s to %s\n", fileName, outputFilePath)
	}
	return nil
}

func (c *PFDAClient) HeadFile(fileURL string, lines int) error {
	req, err := retryablehttp.NewRequest("GET", fileURL, nil)
	if err != nil {
		return err
	}
	c.setPostHeaders(req)
	resp, err := c.Client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("error while getting file: %s", resp.Status)
	}

	scanner := bufio.NewScanner(resp.Body)
	scanner.Buffer(make([]byte, bufio.MaxScanTokenSize), 1024*1024) // allow lines up to 1MB
	printed := 0
	for scanner.Scan() {
		fmt.Println(scanner.Text())
		printed++
		if lines > 0 && printed >= lines {
			break
		}
	}
	return scanner.Err()
}

var unsafeFileNameChars = regexp.MustCompile(`[<>:"/\\|?*]+`)

func sanitizeFileName(name string) string {
	return unsafeFileNameChars.ReplaceAllString(name, "_")
}
