package helpers

import (
	"strconv"
	"strings"
)

func FormatValue(print bool, value string) string {
	if print {
		return value + " "
	}
	return " "
}

func HumanReadableSize(size int64) string {
	const (
		KB int64 = 1 << 10
		MB int64 = 1 << 20
		GB int64 = 1 << 30
		TB int64 = 1 << 40
	)

	formatSize := func(size float64, suffix string) string {
		// Format with two decimal points
		str := strconv.FormatFloat(size, 'f', 2, 64)
		// Trim unnecessary trailing zeros and the decimal point if not needed
		str = strings.TrimRight(str, "0")
		str = strings.TrimRight(str, ".")
		return str + " " + suffix
	}

	var sizeInFloat float64
	var suffix string

	switch {
	case size < KB:
		return formatSize(float64(size), "B")
	case size < MB:
		sizeInFloat, suffix = float64(size)/float64(KB), "KB"
	case size < GB:
		sizeInFloat, suffix = float64(size)/float64(MB), "MB"
	case size < TB:
		sizeInFloat, suffix = float64(size)/float64(GB), "GB"
	default:
		sizeInFloat, suffix = float64(size)/float64(TB), "TB"
	}

	return formatSize(sizeInFloat, suffix)
}

