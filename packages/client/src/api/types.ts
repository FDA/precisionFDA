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

type StatusMessages = {
  unauthorized?: string
  forbidden?: string
  serverError?: string
}

const DEFAULT_STATUS_MESSAGES: Required<StatusMessages> = {
  unauthorized: 'Your session has expired or is invalid. Sign in again and retry.',
  forbidden: 'You do not have permission to perform this action.',
  serverError: 'The server could not complete this request. Please try again in a few minutes.',
}

/** Prefer server `error.message`; fall back to HTTP status hints, then `Error.message`. */
export function getBackendErrorMessage(error: unknown, fallback: string, statusMessages: StatusMessages = {}): string {
  if (isAxiosError(error)) {
    const payload = error.response?.data as BackendError | undefined
    if (payload?.error?.message) {
      return payload.error.message
    }
    const status = error.response?.status
    if (status === 401) {
      return statusMessages.unauthorized ?? DEFAULT_STATUS_MESSAGES.unauthorized
    }
    if (status === 403) {
      return statusMessages.forbidden ?? DEFAULT_STATUS_MESSAGES.forbidden
    }
    if (status !== undefined && status >= 500) {
      return statusMessages.serverError ?? DEFAULT_STATUS_MESSAGES.serverError
    }
    return fallback
  }
  if (error instanceof Error && error.message) {
    return error.message
  }
  return fallback
}
