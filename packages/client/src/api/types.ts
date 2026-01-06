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
