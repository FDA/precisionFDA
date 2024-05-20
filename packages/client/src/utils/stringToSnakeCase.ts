export function stringToSnakeCase(s: string): string {
  return s.replace(/[\s-]+/g, '_').replace(/^-/, '').replace(/[^a-zA-Z0-9àç_èéù_]+/g, '').toLowerCase()
}
