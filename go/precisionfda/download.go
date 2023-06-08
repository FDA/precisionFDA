package precisionfda

import (
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"path"
	"strings"

	"github.com/docker/go-units"
	"github.com/gosuri/uilive"
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

type Printer struct {
	LinesToPrint int // max lines to print.
	Lines int
	Writer *uilive.Writer
}

func NewWriter(totalBytes int64, writer *uilive.Writer) *Writer {
	return &Writer{totalBytes, writer}
}

func NewPrinter(lines int, writer *uilive.Writer) *Printer {
	return &Printer{lines, 0, writer}
}

// Write implements the io.Writer interface.
func (wc *Printer) Write(p []byte) (int, error) {
	content := string(p[:])
	lines := strings.Split(strings.ReplaceAll(content, "\r\n", "\n"), "\n")
	for _, line := range lines {
		if wc.Lines == wc.LinesToPrint {
			return -1, fmt.Errorf(">> Line limit reached")
		}
		fmt.Println(line)
		wc.Lines = wc.Lines + 1
	}
	return len(p), nil
}

// Write implements the io.Writer interface.
func (wc *Writer) Write(p []byte) (int, error) {
	wc.Writer.Flush()
	return len(p), nil
}

func Download(fileURL string, outputFilePath string, fileSize int64, withProgressBar bool) error {
	out, err := os.Create(outputFilePath) // Create the file
	if err != nil {
		return err
	}
	defer out.Close()

	resp, err := http.Get(fileURL)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf(">> Error downloading file: %s", resp.Status)
	}

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

func DownloadDirectly(downloadUrl string, outputFilePath string, overwrite string) error {
	fileURL := downloadUrl
	originalName := path.Base(fileURL)
	fileName, err := url.PathUnescape(originalName)
	if err != nil {
		fileName = originalName
	}
	// fileSize := resultJSON["file_size"].(float64)
	if outputFilePath == "" {
		// If output is not specified, use the original filename and current working directory
		dir, err := os.Getwd()
		if err != nil {
			return err
		}

		outputFilePath = path.Join(dir, fileName)
	} else if fileInfo, err := os.Stat(outputFilePath); err == nil && fileInfo.IsDir() {
		// If outputFilePath exists and it is a directory then the file should be downloaded
		// to that directory while retaining its original name
		outputFilePath = path.Join(outputFilePath, fileName)
	}

	if _, err := os.Stat(outputFilePath); err == nil && (overwrite == "false" || overwrite == "") {
		fmt.Printf(">> Error: path %s already exists but -overwrite flag not set to true. Skipping download.\n", outputFilePath)
		return nil
	}

	withProgressBar := false
	err = Download(fileURL, outputFilePath, 0, withProgressBar)
	if err != nil {
		fmt.Printf(">> Error during download of %s - %s.\n", fileName, err)
		return nil
	}
	fmt.Printf(">> Downloaded:  %s\n", outputFilePath)
	return nil
}


func Head(fileURL string, lines int) error {
	tmp, err := os.CreateTemp("","head") // Create temp fake data destination
	if err != nil {
		return err
	}

	resp, err := http.Get(fileURL)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf(">> Error while getting file: %s", resp.Status)
	}

	writer := uilive.New()
	writer.Start()
	defer writer.Stop()

	body := io.TeeReader(resp.Body, NewPrinter(lines, writer))
	_, err = io.Copy(tmp, body)

	defer os.Remove(tmp.Name())
	return nil
}