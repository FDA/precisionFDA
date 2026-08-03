package precisionfda

import (
	"errors"
	"os"
	"sync"
)

// reportedError marks an error that has already been shown to the user - either
// printed directly or appended to the active JSON batch. Such an error is still
// propagated so the command exits non-zero, but the top level must not print it
// again: that would duplicate the message and, in JSON mode, emit a second
// document next to the batch array.
type reportedError struct {
	err error
}

func (e *reportedError) Error() string { return e.err.Error() }

func (e *reportedError) Unwrap() error { return e.err }

// AsReported wraps err to record that it has already been reported to the user.
func AsReported(err error) error {
	if err == nil || IsReported(err) {
		return err
	}
	return &reportedError{err: err}
}

// IsReported tells whether err has already been reported to the user and so
// only needs to influence the exit code.
func IsReported(err error) bool {
	var reported *reportedError
	return errors.As(err, &reported)
}

// reportedErrs tracks the failures shown to the user so batch commands can
// continue past individual failures yet still exit non-zero. It is guarded by
// its own mutex because errors are reported from concurrent goroutines
// (parallel downloads and uploads).
type reportedErrs struct {
	mu   sync.Mutex
	errs []error
}

// record appends a reported failure to the log.
func (r *reportedErrs) record(err error) {
	if err == nil {
		return
	}
	r.mu.Lock()
	defer r.mu.Unlock()
	r.errs = append(r.errs, AsReported(err))
}

// errorScope marks the current position in the failure log and returns a
// function that reports the first failure recorded after that mark, already
// wrapped as reported, or nil when everything since succeeded. Each batch
// operation opens its own scope so its return value reflects only its own
// failures - not those of earlier operations on the same client - while
// nested scopes (a folder upload inside a multi-file upload) still propagate
// their failures to the enclosing scope.
func (c *PFDAClient) errorScope() func() error {
	c.reportedErrs.mu.Lock()
	mark := len(c.reportedErrs.errs)
	c.reportedErrs.mu.Unlock()
	return func() error {
		c.reportedErrs.mu.Lock()
		defer c.reportedErrs.mu.Unlock()
		if len(c.reportedErrs.errs) > mark {
			return c.reportedErrs.errs[mark]
		}
		return nil
	}
}

// HandleError Check for error, if found behave accordingly
func (c *PFDAClient) HandleError(err error) {
	if err != nil {
		c.emitError(err)
		if !c.ContinueOnError {
			c.finishJSONBatch()
			os.Exit(1)
		}
	}
}
