package helpers

func FormatValue(print bool, value string) string {
	if print {
		return value + " "
	}
	return " "
}
