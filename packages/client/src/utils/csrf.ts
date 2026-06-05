const CSRF_TOKEN_URL = '/api/v2/csrf-token'

let cachedCsrfToken: string | null = null
let csrfTokenPromise: Promise<string | null> | null = null

/**
 * Fetch a CSRF token from the server without using the cache.
 * Use when a fresh token is required (e.g. end of a long upload).
 */
export async function fetchCsrfToken(): Promise<string | null> {
  try {
    const response = await fetch(CSRF_TOKEN_URL, { credentials: 'same-origin' })
    if (!response.ok) return null
    const data = await response.json()
    return data.token ?? null
  } catch {
    return null
  }
}

/**
 * Return a cached CSRF token, coalescing concurrent cache misses into one request.
 */
export const getCsrfToken = async (): Promise<string | null> => {
  if (cachedCsrfToken) return cachedCsrfToken
  if (csrfTokenPromise) return csrfTokenPromise

  csrfTokenPromise = fetchCsrfToken()
    .then(token => {
      cachedCsrfToken = token
      return token
    })
    .catch(e => {
      console.error('Failed to fetch CSRF token', e)
      return null
    })
    .finally(() => {
      csrfTokenPromise = null
    })

  return csrfTokenPromise
}

export const clearCsrfToken = (): void => {
  cachedCsrfToken = null
  csrfTokenPromise = null
}

export function buildCsrfHeaders(token?: string | null): Record<string, string> {
  if (!token) return {}
  return { 'X-CSRF-Token': token }
}
