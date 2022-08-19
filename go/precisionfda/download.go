package precisionfda

import (
	"fmt"
	"github.com/docker/go-units"
	"github.com/gosuri/uilive"
	"io"
	"net/http"
	"os"
)

// ProgressWriter counts the number of bytes written to it.
type ProgressWriter struct {
	Total int64
	Downloaded int64
	Writer *uilive.Writer
}

func NewProgressWriter(totalBytes int64, writer *uilive.Writer) *ProgressWriter {
	return &ProgressWriter { totalBytes, 0, writer }
}

// Write implements the io.Writer interface.
func (wc *ProgressWriter) Write(p []byte) (int, error) {
	n := len(p)
	wc.Downloaded += int64(n)
	percent := 100*float64(wc.Downloaded)/float64(wc.Total)
	fmt.Fprintf(wc.Writer, "                  %.1f%% (%s of %s)\n", percent,  units.BytesSize(float64(wc.Downloaded)), units.BytesSize(float64(wc.Total)))
	wc.Writer.Flush()
	return n, nil
}

func DownloadWithProgress(fileURL string, fileSize int64, outputFilePath string) error {
	out, err := os.Create(outputFilePath)	// Create the file
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
		return fmt.Errorf("Error downloading file: %s", resp.Status)
	}

	writer := uilive.New()
	writer.Start()
	defer writer.Stop()

	// Writer the body to file
    body := io.TeeReader(resp.Body, NewProgressWriter(fileSize, writer))
	_, err = io.Copy(out, body)
	return err
}
