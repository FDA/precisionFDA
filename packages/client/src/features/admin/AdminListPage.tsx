import { isAxiosError } from 'axios'
import type { ReactNode } from 'react'
import { type BackendError, DEFAULT_PAGINATED_DATA } from '@/api/types'
import { HoverDNAnexusLogo } from '@/components/icons/DNAnexusLogo'
import { hidePagination, Pagination } from '@/components/Pagination'
import { Button } from '@/components/ui/button'
import type { MetaV2 } from '@/features/home/types'
import { AdminContentFooter, AdminStyledPageTable, Title, Topbox } from './styles'
import { AdminTablePlaceholderLoader, getAdminTableLoadingState } from './tableLoading'

type ListShape = { data: unknown[]; meta: MetaV2 }

type AdminListPageQuery<T extends ListShape> = {
  data: T | undefined
  error: unknown
  isLoading: boolean
  isFetching: boolean
  isFetched: boolean
  isPlaceholderData: boolean
  refetch: () => void
}

type AdminListPageProps<T extends ListShape> = {
  title: ReactNode
  actions?: ReactNode
  query: AdminListPageQuery<T>
  perPage: number
  setPage: (n: number) => void
  setPerPage: (n: number) => void
  tableClassName?: string
  children: (ctx: { isLoading: boolean }) => ReactNode
}

export const AdminListPage = <T extends ListShape>({
  title,
  actions,
  query,
  perPage,
  setPage,
  setPerPage,
  tableClassName,
  children,
}: AdminListPageProps<T>) => {
  const data = (query.data ?? DEFAULT_PAGINATED_DATA) as T
  const {
    showLoadingState,
    showPlaceholderLoader,
    tableClassName: loadingClass,
  } = getAdminTableLoadingState({
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isPlaceholderData: query.isPlaceholderData,
  })

  return (
    <>
      <Topbox>
        <Title>{title}</Title>
        {actions}
      </Topbox>

      <div className="relative flex flex-1 min-h-0 flex-col">
        {query.error ? (
          <AdminListErrorState error={query.error} onRetry={query.refetch} />
        ) : (
          <>
            {showPlaceholderLoader && <AdminTablePlaceholderLoader />}
            <AdminStyledPageTable className={`${loadingClass}${tableClassName ? ` ${tableClassName}` : ''}`}>
              {children({ isLoading: showLoadingState })}
            </AdminStyledPageTable>
          </>
        )}
      </div>

      <AdminContentFooter>
        <Pagination
          page={data.meta.page}
          totalCount={data.meta.total}
          totalPages={data.meta.totalPages}
          perPage={perPage}
          isHidden={hidePagination(query.isFetched, data.data.length, data.meta.totalPages)}
          setPage={setPage}
          onPerPageSelect={setPerPage}
          showListCount
        />
        <HoverDNAnexusLogo opacity height={14} />
      </AdminContentFooter>
    </>
  )
}

const getListErrorMessage = (error: unknown): string => {
  if (isAxiosError(error)) {
    const payload = error.response?.data as BackendError | undefined
    if (payload?.error?.message) return payload.error.message
    const status = error.response?.status
    if (status === 401) return 'Your session has expired. Sign in again and retry.'
    if (status === 403) return 'You do not have permission to view this list.'
    if (status !== undefined && status >= 500)
      return 'The server could not complete this request. Please try again in a few minutes.'
  }
  if (error instanceof Error && error.message) return error.message
  return 'An unexpected error occurred. Try again or contact support.'
}

const AdminListErrorState = ({ error, onRetry }: { error: unknown; onRetry: () => void }) => (
  <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 py-12 text-center">
    <div className="text-sm font-medium text-(--c-text-700)">Could not load data</div>
    <div className="max-w-md text-xs text-(--c-text-500)">{getListErrorMessage(error)}</div>
    <Button size="sm" variant="outline" onClick={onRetry}>
      Retry
    </Button>
  </div>
)
