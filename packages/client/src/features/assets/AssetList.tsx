import type {
  ColumnDefResolved,
  ColumnFiltersState,
  ColumnSizingState,
  ColumnSort,
  VisibilityState,
} from '@tanstack/react-table'
import { useNavigate } from 'react-router'
import { Button } from '@/components/Button'
import { KeyIcon } from '@/components/icons/KeyIcon'
import { QuestionIcon } from '@/components/icons/QuestionIcon'
import { ActionsMenu } from '@/components/Menu'
import { ContentFooter } from '@/components/Page/ContentFooter'
import { Pagination } from '@/components/Pagination'
import { StyledPageTable } from '@/components/Table/components/styles'
import { getSelectedObjectsFromIndexes, toArrayFromObject } from '@/utils/object'
import Table from '../../components/Table'
import { useGenerateKeyModal } from '../auth/useGenerateKeyModal'
import { ActionsMenuContent } from '../home/ActionMenuContent'
import { ActionModalsRenderer } from '../home/ActionModalsRenderer'
import { ActionsRow, QuickActions } from '../home/home.styles'
import { ResourceQueryErrorMessage } from '../home/ResourceQueryErrorMessage'
import { ResourceHeader } from '../home/show.styles'
import type { HomeScope, IMeta } from '../home/types'
import { useList } from '../home/useList'
import { usePropertiesQuery } from '../home/usePropertiesQuery'
import { fetchAssets } from './assets.api'
import type { IAsset } from './assets.types'
import { useAssetColumns } from './useAssetColumns'
import { useAssetActions } from './useAssetSelectActions'

type ListType = { assets: IAsset[]; meta: IMeta }

export const AssetList = ({
  homeScope,
  spaceId,
  isAdmin,
}: {
  homeScope?: HomeScope
  spaceId?: string
  isAdmin?: boolean
}) => {
  const navigate = useNavigate()

  const onRowClick = (uid: string): void => {
    navigate(`/home/assets/${uid}`)
  }
  const {
    setPerPageParam,
    setPageParam,
    setSearchFilter,
    filterQuery,
    perPageParam,
    setSortBy,
    sortBy,
    query,
    selectedIndexes,
    setSelectedIndexes,
    saveColumnResizeWidth,
    colWidths,
    resetSelected,
    columnVisibility,
    setColumnVisibility,
  } = useList<ListType>({
    fetchList: fetchAssets,
    resource: 'assets',
    params: {
      spaceId: spaceId || undefined,
      scope: homeScope || undefined,
    },
  })
  const { isLoading, data, error } = query
  const { data: propertiesData } = usePropertiesQuery('asset', homeScope, spaceId)

  const selectedFileObjects = getSelectedObjectsFromIndexes(selectedIndexes, data?.assets)
  const { actions, modals } = useAssetActions({
    homeScope,
    selectedItems: selectedFileObjects,
    resourceKeys: ['assets'],
    resetSelected,
  })
  const generateCLIKeyAction = useGenerateKeyModal()

  if (error) return <ResourceQueryErrorMessage />

  return (
    <>
      <ResourceHeader>
        <ActionsRow>
          <QuickActions>
            <Button
              data-variant="primary"
              as="a"
              data-turbolinks="false"
              href="/docs/guides/assets"
              data-testid="home-assets-create-link"
              target="_blank"
            >
              <QuestionIcon height={13} /> How to create assets
            </Button>
            <Button data-variant="primary" onClick={(): void => generateCLIKeyAction.setShowModal(true)}>
              <KeyIcon height={13} />
              Generate CLI Key
            </Button>
          </QuickActions>
          <ActionsMenu data-testid="home-assets-actions-button">
            <ActionsMenuContent
              actions={actions}
              message={
                homeScope === 'spaces' ? 'To perform other actions on this asset, access it from the Space' : undefined
              }
            />
          </ActionsMenu>
        </ActionsRow>
      </ResourceHeader>

      <AssetsListTable
        isAdmin={isAdmin ?? false}
        homeScope={homeScope}
        setFilters={setSearchFilter}
        filters={toArrayFromObject(filterQuery)}
        apps={data?.assets}
        properties={propertiesData?.keys}
        isLoading={isLoading}
        handleRowClick={onRowClick}
        selectedRows={selectedIndexes}
        setSelectedRows={setSelectedIndexes}
        setSortBy={setSortBy}
        sortBy={sortBy}
        setColumnSizing={saveColumnResizeWidth}
        columnSizing={colWidths}
        columnVisibility={columnVisibility}
        setColumnVisibility={setColumnVisibility}
      />

      <ContentFooter>
        <Pagination
          page={data?.meta?.pagination?.current_page}
          totalCount={data?.meta?.pagination?.total_count}
          totalPages={data?.meta?.pagination?.total_pages}
          perPage={perPageParam}
          isHidden={false}
          setPage={(p: number): void => setPageParam(p, true)}
          onPerPageSelect={(p: number): void => setPerPageParam(p, true)}
        />
      </ContentFooter>

      <ActionModalsRenderer modals={modals} />
      {generateCLIKeyAction?.modalComp}
    </>
  )
}

export const AssetsListTable = ({
  isAdmin,
  filters,
  apps,
  properties,
  handleRowClick,
  isLoading,
  setFilters,
  selectedRows,
  setSelectedRows,
  setSortBy,
  sortBy,
  homeScope,
  columnSizing,
  setColumnSizing,
  columnVisibility,
  setColumnVisibility,
}: {
  isAdmin?: boolean
  filters: ColumnFiltersState
  setFilters: (val: ColumnFiltersState) => void
  sortBy: ColumnSort[]
  setSortBy: (cols: ColumnSort[]) => void
  apps?: IAsset[]
  properties?: string[]
  handleRowClick: (fileId: string) => void
  selectedRows?: Record<string, boolean>
  setSelectedRows: (ids: Record<string, boolean>) => void
  isLoading: boolean
  homeScope?: HomeScope
  columnSizing: ColumnSizingState
  setColumnSizing: (columnResizing: ColumnSizingState) => void
  setColumnVisibility: (cols: VisibilityState) => void
  columnVisibility: VisibilityState
}) => {
  function filterColsByScope(c: ColumnDefResolved<IAsset>): boolean {
    // Check if any of the conditions is true, then hide the column
    return !(
      // If the homeScope is 'me', hide 'added_by' regardless of other conditions.
      (
        (homeScope === 'me' && c.accessorKey === 'added_by') ||
        // Hide 'location' for all homeScopes except 'spaces'.
        (homeScope !== 'spaces' && c.accessorKey === 'location') ||
        // Hide 'featured' for all homeScopes except 'everybody'.
        (homeScope !== 'everybody' && c.accessorKey === 'featured')
      )
    )
  }
  // @ts-expect-error types are not compatible
  const col = useAssetColumns({ handleRowClick, isAdmin, properties }).filter(filterColsByScope)

  return (
    <StyledPageTable>
      <Table<IAsset>
        isLoading={isLoading}
        data={apps || []}
        columns={col}
        columnSizing={columnSizing}
        setColumnSizing={setColumnSizing}
        rowSelection={selectedRows ?? {}}
        setSelectedRows={setSelectedRows}
        setColumnFilters={setFilters}
        columnSortBy={sortBy}
        setColumnSortBy={setSortBy}
        columnFilters={filters}
        columnVisibility={columnVisibility}
        setColumnVisibility={setColumnVisibility}
      />
    </StyledPageTable>
  )
}
