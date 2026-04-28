type AdminTableQueryState = {
  data: unknown
  isLoading: boolean
  isFetching: boolean
  isPlaceholderData: boolean
}

export const getAdminTableLoadingState = (query: AdminTableQueryState) => {
  const hasCachedData = query.data != null
  const showPlaceholderLoader = query.isFetching && query.isPlaceholderData

  return {
    showLoadingState: query.isLoading && !hasCachedData,
    showPlaceholderLoader,
    tableClassName: showPlaceholderLoader ? 'opacity-60 transition-opacity' : 'transition-opacity',
  }
}

export const AdminTablePlaceholderLoader = () => (
  <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
    <div className="inline-flex items-center justify-center rounded-full border border-(--tertiary-250) bg-(--background)/90 p-2 shadow-sm backdrop-blur-sm">
      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-(--tertiary-250) border-t-(--primary-500)" />
    </div>
  </div>
)
