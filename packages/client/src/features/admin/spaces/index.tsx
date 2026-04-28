import axios from 'axios'
import { DEFAULT_PAGINATED_DATA } from '@/api/types'
import { HoverDNAnexusLogo } from '@/components/icons/DNAnexusLogo'
import { ObjectGroupIcon } from '@/components/icons/ObjectGroupIcon'
import { hidePagination, Pagination } from '@/components/Pagination'
import Table from '@/components/Table'
import { usePageMeta } from '@/hooks/usePageMeta'
import { getSelectedObjectsFromIndexes, toArrayFromObject } from '@/utils/object'
import type { IFilter, MetaV2 } from '../../home/types'
import { useList } from '../../home/useList'
import { type Params, prepareListFetchV2 } from '../../home/utils'
import { type ISpaceV2, columnFilters as spaceListColumnFilters } from '../../spaces/spaces.types'
import { useSpacesColumns } from '../../spaces/useSpacesColumns'
import { AdminContentFooter, AdminStyledPageTable, Title, Topbox, TopLeft } from '../styles'
import { AdminTablePlaceholderLoader, getAdminTableLoadingState } from '../tableLoading'
import { SpacesListActionRow } from './SpacesListActionRow'

type AdminSpaceListType = { data: ISpaceV2[]; meta: MetaV2 }

export async function fetchSpaces(filters: IFilter[], params: Params) {
  const query = prepareListFetchV2(filters, params) as Record<string, string>
  return axios.get<AdminSpaceListType>('/api/v2/spaces', { params: new URLSearchParams(query) }).then(r => r.data)
}

export const SpacesList = () => {
  usePageMeta({ title: 'precisionFDA Admin - Spaces' })

  const {
    setPerPageParam,
    setPageParam,
    setSearchFilter,
    filterQuery,
    perPageParam,
    sortBy,
    setSortBy,
    query,
    selectedIndexes,
    setSelectedIndexes,
    saveColumnResizeWidth,
    colWidths,
    columnVisibility,
    setColumnVisibility,
  } = useList<AdminSpaceListType>({
    fetchList: fetchSpaces,
    resource: 'spaces',
    params: {},
    filters: spaceListColumnFilters,
  })

  const columns = useSpacesColumns()

  const { data = DEFAULT_PAGINATED_DATA, isLoading, error } = query
  const { showLoadingState, showPlaceholderLoader, tableClassName } = getAdminTableLoadingState({
    data: query.data,
    isLoading,
    isFetching: query.isFetching,
    isPlaceholderData: query.isPlaceholderData,
  })
  if (error) {
    return <div>{JSON.stringify(error)}</div>
  }

  const selectedObjects = getSelectedObjectsFromIndexes(selectedIndexes, data.data)

  const filters = toArrayFromObject(filterQuery)

  return (
    <>
      <Topbox>
        <TopLeft>
          <ObjectGroupIcon height={20} />
          <Title>Space Management</Title>
        </TopLeft>
        <SpacesListActionRow
          selectedSpaces={selectedObjects}
          setSelectedIndexes={setSelectedIndexes}
          refetchSpaces={query.refetch}
        />
      </Topbox>

      <div className="relative flex flex-1 min-h-0 flex-col">
        {showPlaceholderLoader && <AdminTablePlaceholderLoader />}
        <AdminStyledPageTable className={tableClassName}>
          <Table<ISpaceV2>
            isLoading={showLoadingState}
            data={data.data}
            columns={columns}
            columnSizing={colWidths}
            setColumnSizing={saveColumnResizeWidth}
            columnVisibility={columnVisibility}
            setColumnVisibility={setColumnVisibility}
            rowSelection={selectedIndexes}
            setSelectedRows={setSelectedIndexes}
            setColumnFilters={setSearchFilter}
            columnSortBy={sortBy}
            setColumnSortBy={setSortBy}
            columnFilters={filters}
          />
        </AdminStyledPageTable>
      </div>

      <AdminContentFooter>
        <Pagination
          page={data.meta.page}
          totalCount={data.meta.total}
          totalPages={data.meta.totalPages}
          perPage={perPageParam}
          isHidden={hidePagination(query.isFetched, data.data.length, data.meta.totalPages)}
          setPage={setPageParam as (n: number) => void}
          onPerPageSelect={setPerPageParam as (n: number) => void}
          showListCount
        />
        <HoverDNAnexusLogo opacity height={14} />
      </AdminContentFooter>
    </>
  )
}
