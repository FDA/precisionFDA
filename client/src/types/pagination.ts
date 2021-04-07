// An alternative to PaginationShape for TypeScript

interface IPagination {
  currentPage: number,
  nextPage: number,
  prevPage: number,
  totalPages: number,
  totalCount: number,
}

export type { IPagination }
