export interface PaginatedResult<T> {
  data: T[]
  meta: {
    total: number
    totalPages: number
    pageSize: number
    page: number
  }
}
