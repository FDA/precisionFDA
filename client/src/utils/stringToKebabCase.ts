export function stringToKebabCase(s: string) {
  return s.replace(/[-\s]+/g, '-').replace(/^-/, '').replace(/[^a-zA-Z0-9àç_èéù-]+/g, '').toLowerCase()
}
