import { ColumnDefResolved, ColumnFiltersState, ColumnSizingState, ColumnSort, VisibilityState } from '@tanstack/react-table'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/Button'
import Dropdown from '../../components/Dropdown'
import { ContentFooter } from '../../components/Page/ContentFooter'
import { Pagination } from '../../components/Pagination'
import Table from '../../components/Table'
import { HoverDNAnexusLogo } from '../../components/icons/DNAnexusLogo'
import { KeyIcon } from '../../components/icons/KeyIcon'
import { QuestionIcon } from '../../components/icons/QuestionIcon'
import { getSelectedObjectsFromIndexes, toArrayFromObject } from '../../utils/object'
import { useAuthUser } from '../auth/useAuthUser'
import { useGenerateKeyModal } from '../auth/useGenerateKeyModal'
import { ActionsDropdownContent } from '../home/ActionDropdownContent'
import { ActionsRow, QuickActions } from '../home/home.styles'
import { ActionsButton, ResourceHeader } from '../home/show.styles'
import { HomeScope, IMeta } from '../home/types'
import { useList } from '../home/useList'
import { usePropertiesQuery } from '../home/usePropertiesQuery'
import { fetchAssets } from './assets.api'
import { IAsset } from './assets.types'
import { useAssetColumns } from './useAssetColumns'
import { useAssetActions } from './useAssetSelectActions'
import { ResouceQueryErrorMessage } from '../home/ResouceQueryErrorMessage'
import { StyledPageTable } from '../../components/Table/components/styles'

type ListType = { assets: IAsset[]; meta: IMeta }

export const AssetList = ({ homeScope, spaceId }: { homeScope?: HomeScope; spaceId?: string }) => {
  const navigate = useNavigate()
  const user = useAuthUser()
  const isAdmin = user?.isAdmin

  const onRowClick = (uid: string) => navigate(`/home/assets/${uid}`)
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
  const actions = useAssetActions({ homeScope, selectedItems: selectedFileObjects, resourceKeys: ['assets'], resetSelected })
  const generateCLIKeyAction = useGenerateKeyModal()

  if (error) return <ResouceQueryErrorMessage />

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
            <Button data-variant="primary" onClick={() => generateCLIKeyAction.setShowModal(true)}>
              <KeyIcon height={13} />
              Generate CLI Key
            </Button>
          </QuickActions>
          <Dropdown
            trigger="click"
            content={
              <ActionsDropdownContent
                actions={actions}
                message={homeScope === 'spaces' && 'To perform other actions on this asset, access it from the Space'}
              />
            }
          >
            {dropdownProps => (
              <ActionsButton {...dropdownProps} data-testid="home-assets-actions-button" active={dropdownProps.isActive} />
            )}
          </Dropdown>
        </ActionsRow>
      </ResourceHeader>

      <AssetsListTable
        isAdmin={isAdmin}
        homeScope={homeScope}
        setFilters={setSearchFilter}
        // TODO(samuel) Typescript fix
        filters={toArrayFromObject(filterQuery as any)}
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
          isPreviousData={data?.meta?.pagination?.prev_page !== null}
          isNextData={data?.meta?.pagination?.next_page !== null}
          setPage={p => setPageParam(p, 'replaceIn')}
          onPerPageSelect={p => setPerPageParam(p, 'replaceIn')}
        />
        <HoverDNAnexusLogo opacity height={14} />
      </ContentFooter>

      {actions['Delete']?.modal}
      {actions['Download']?.modal}
      {actions['Attach License']?.modal}
      {actions['Detach License']?.modal}
      {actions['Accept License']?.modal}
      {actions['Edit tags']?.modal}
      {actions['Edit properties']?.modal}
      {actions['Rename']?.modal}
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
