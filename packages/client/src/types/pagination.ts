export interface Pagination {
  current_page: number,
  next_page: null | number,
  prev_page: null | number,
  total_pages: number,
  total_count: number
}

export interface PaginationMetaV2 {
  total: number
  totalPages: number
  pageSize: number
  page: number
}
