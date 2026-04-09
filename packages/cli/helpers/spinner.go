package helpers

import (
	"fmt"
	"sync"
	"time"
)

// Spinner displays an animated spinner with a message in the terminal.
// Usage:
//
//	spinner := helpers.NewSpinner("Loading...")
//	spinner.Start()
//	// do some work
//	spinner.Stop()
type Spinner struct {
	message  string
	frames   []string
	interval time.Duration
	stopCh   chan struct{}
	doneCh   chan struct{}
	mu       sync.Mutex
	running  bool
}

// Default spinner configuration
var (
	DefaultFrames   = []string{"⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"}
	DefaultInterval = 500 * time.Millisecond
)

// NewSpinner creates a new spinner with the given message.
func NewSpinner(message string) *Spinner {
	return &Spinner{
		message:  message,
		frames:   DefaultFrames,
		interval: DefaultInterval,
		stopCh:   make(chan struct{}),
		doneCh:   make(chan struct{}),
	}
}

// Start begins the spinner animation in a goroutine.
func (s *Spinner) Start() {
	s.mu.Lock()
	if s.running {
		s.mu.Unlock()
		return
	}
	s.running = true
	s.stopCh = make(chan struct{})
	s.doneCh = make(chan struct{})
	s.mu.Unlock()

	go s.run()
}

// Stop stops the spinner animation and clears the line.
// Safe to call on nil spinner.
func (s *Spinner) Stop() {
	if s == nil {
		return
	}
	s.mu.Lock()
	if !s.running {
		s.mu.Unlock()
		return
	}
	s.running = false
	s.mu.Unlock()

	close(s.stopCh)
	<-s.doneCh
	clearLine()
}

// UpdateMessage changes the spinner message while running.
func (s *Spinner) UpdateMessage(message string) {
	s.mu.Lock()
	s.message = message
	s.mu.Unlock()
}

func (s *Spinner) run() {
	frameIndex := 0
	ticker := time.NewTicker(s.interval)
	defer ticker.Stop()
	defer close(s.doneCh)

	// Draw initial frame
	s.drawFrame(frameIndex)

	for {
		select {
		case <-s.stopCh:
			return
		case <-ticker.C:
			frameIndex = (frameIndex + 1) % len(s.frames)
			s.drawFrame(frameIndex)
		}
	}
}

func (s *Spinner) drawFrame(frameIndex int) {
	s.mu.Lock()
	message := s.message
	s.mu.Unlock()
	fmt.Printf("\r%s %s", s.frames[frameIndex], message)
}

func clearLine() {
	fmt.Print("\r\033[K")
}
