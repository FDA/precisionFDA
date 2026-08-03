// PrecisionFDA CLI - FIPS 140-3 and TLS reporting used by the -version output.
package main

import (
	"crypto/fips140"
	"crypto/tls"
	"fmt"
	"net/http"
	"runtime/debug"
)

func printCryptoInfo() {
	fmt.Println(formatCryptoInfo(fips140.Enabled(), fips140.Enforced(), fips140.Version(), fipsBuildSetting()))
}

// formatCryptoInfo renders the FIPS 140-3 status line for the version output.
// It is kept free of package-level state so every branch can be unit-tested
// without building against a specific FIPS module.
func formatCryptoInfo(enabled, enforced bool, version, buildSetting string) string {
	const prefix = "  FIPS 140-3  :    "
	if !enabled {
		return prefix + "warning: FIPS mode not active"
	}
	if version == "latest" {
		// FIPS mode was toggled on at runtime, but the binary was not built
		// against a frozen, validated module (GOFIPS140), so this is not a
		// FIPS-compliant build.
		return prefix + "warning: enabled with non-frozen 'latest' module (not a validated build)"
	}
	mode := "on"
	if enforced {
		mode = "only (enforced)"
	}
	details := fmt.Sprintf("module %s, mode %s", version, mode)
	if buildSetting != "" {
		details += fmt.Sprintf(", built GOFIPS140=%s", buildSetting)
	}
	return prefix + "enabled (" + details + ")"
}

// fipsBuildSetting reports the GOFIPS140 value the binary was compiled with,
// read from the embedded build info. The toolchain records the resolved module
// snapshot (e.g. "v1.0.0-c2097c7c") rather than whatever string was passed, so
// a binary identifies its exact module even when an alias such as "certified"
// was used. Unlike the runtime fips140 state, this cannot be flipped via
// GODEBUG, so it is a spoof-resistant record of how the binary was built.
// Returns "" when unavailable.
func fipsBuildSetting() string {
	info, ok := debug.ReadBuildInfo()
	if !ok {
		return ""
	}
	for _, s := range info.Settings {
		if s.Key == "GOFIPS140" {
			return s.Value
		}
	}
	return ""
}

// GetTLSVersion returns the configured minimum TLS version for the transport.
// This is the negotiated floor, not the version of any established connection.
func GetTLSVersion(tr *http.Transport) string {
	if tr.TLSClientConfig == nil || tr.TLSClientConfig.MinVersion == 0 {
		return "Unknown"
	}
	return tls.VersionName(tr.TLSClientConfig.MinVersion)
}
