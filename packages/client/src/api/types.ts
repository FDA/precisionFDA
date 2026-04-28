import { isAxiosError } from 'axios'

export const DEFAULT_PAGINATED_DATA = {
  data: [],
  meta: { total: 0, page: 1, pageSize: 20, totalPages: 0 },
}

export interface BackendError {
  error: {
    code: string
    message: string
    statusCode: number
  }
}

/** Prefer server `error.message`; fall back to HTTP status hints, then `Error.message`. */
export function getBackendErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const payload = error.response?.data as BackendError | undefined
    if (payload?.error?.message) {
      return payload.error.message
    }
    const status = error.response?.status
    if (status === 401) {
      return 'Your session has expired or is invalid. Sign in again, then try changing your email.'
    }
    if (status === 403) {
      return 'You are not allowed to change your email address. Contact support if you need help.'
    }
    if (status !== undefined && status >= 500) {
      return 'The server could not complete this request. Please try again in a few minutes.'
    }
    return fallback
  }
  if (error instanceof Error && error.message) {
    return error.message
  }
  return fallback
}
