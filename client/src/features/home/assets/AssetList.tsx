import React, { useEffect, useMemo, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { SortingRule, UseResizeColumnsState } from 'react-table'
import { ButtonSolidBlue } from '../../../components/Button'
import Dropdown from '../../../components/Dropdown'
import { HoverDNAnexusLogo } from '../../../components/icons/DNAnexusLogo'
import { KeyIcon } from '../../../components/icons/KeyIcon'
import { QuestionIcon } from '../../../components/icons/QuestionIcon'
import { ContentFooter } from '../../../components/Page/ContentFooter'
import { Pagination } from '../../../components/Pagination'
import { EmptyTable } from '../../../components/Table/styles'
import Table from '../../../components/Table/Table'
import { getSelectedObjectsFromIndexes, toArrayFromObject } from '../../../utils/object'
import { useAuthUser } from '../../auth/useAuthUser'
import { useGenerateKeyModal } from '../../auth/useGenerateKeyModal'
import { ActionsDropdownContent } from '../ActionDropdownContent'
import { ActionsRow, QuickActions, StyledHomeTable } from '../home.styles'
import { ActionsButton } from '../show.styles'
import { IFilter, IMeta, KeyVal, ResourceScope } from '../types'
import { useList } from '../useList'
import { fetchAssets } from './assets.api'
import { IAsset } from './assets.types'
import { useAssetColumns } from './useAssetColumns'
import { useAssetActions } from './useAssetSelectActions'

type ListType = { assets: IAsset[]; meta: IMeta }

export const AssetList = ({ scope, spaceId }: { scope?: ResourceScope, spaceId?: string }) => {
  const history = useHistory()
  const user = useAuthUser()
  const isAdmin = user?.isAdmin

  const onRowClick = (uid: string) => history.push(`/home/assets/${uid}`)
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
  } = useList<ListType>({
    fetchList: fetchAssets,
    resource: 'assets',
    params: {
      spaceId: spaceId || undefined,
      scope: scope || undefined,
    },
  })
  const { status, data, error } = query

  const selectedFileObjects = getSelectedObjectsFromIndexes(
    selectedIndexes,
    data?.assets,
  )
  const actions = useAssetActions({ scope, selectedItems: selectedFileObjects, resourceKeys: ['assets'], resetSelected })
  const generateCLIKeyAction = useGenerateKeyModal()

  if (status === 'error') return <div>Error! {JSON.stringify(error)}</div>

  return (
    <>
      <div>
        <ActionsRow>
          <QuickActions>
            <ButtonSolidBlue
              as="a"
              data-turbolinks="false"
              href="/docs/assets"
              data-testid="home-assets-create-link"
            >
              <QuestionIcon height={13} /> How to create assets
            </ButtonSolidBlue>
            <ButtonSolidBlue onClick={() => generateCLIKeyAction.setShowModal(true)}>
              <KeyIcon height={13} />Generate CLI Key
            </ButtonSolidBlue>
          </QuickActions>
          <Dropdown
            trigger="click"
            content={
              <ActionsDropdownContent
                actions={actions}
                message={
                  scope === 'spaces' &&
                  'To perform other actions on this asset, access it from the Space'
                }
              />
            }
          >
            {dropdownProps => (
              <ActionsButton
                {...dropdownProps}
                data-testid="home-assets-actions-button"
                active={dropdownProps.isActive}
              />
            )}
          </Dropdown>
        </ActionsRow>
      </div>

      <AssetsListTable
        isAdmin={isAdmin}
        scope={scope}
        setFilters={setSearchFilter}
        // TODO(samuel) Typescript fix
        filters={toArrayFromObject(filterQuery as any)}
        apps={data?.assets}
        isLoading={status === 'loading'}
        handleRowClick={onRowClick}
        selectedRows={selectedIndexes}
        setSelectedRows={setSelectedIndexes}
        setSortBy={setSortBy}
        sortBy={sortBy}
        saveColumnResizeWidth={saveColumnResizeWidth}
        colWidths={colWidths}
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
      {actions['Attach to...']?.modal}
      {actions['Attach License']?.modal}
      {actions['Detach License']?.modal}
      {actions['Accept License']?.modal}
      {actions['Edit tags']?.modal}
      {actions['Rename']?.modal}
      {generateCLIKeyAction?.modalComp}
    </>
  )
}

export const AssetsListTable = ({
  isAdmin,
  filters,
  apps,
  handleRowClick,
  isLoading,
  setFilters,
  selectedRows,
  setSelectedRows,
  setSortBy,
  sortBy,
  scope,
  saveColumnResizeWidth,
  colWidths,
}: {
  isAdmin?: boolean
  filters: IFilter[]
  apps?: IAsset[]
  handleRowClick: (fileId: string) => void
  setFilters: (val: IFilter[]) => void
  selectedRows?: Record<string, boolean>
  setSelectedRows: (ids: Record<string, boolean>) => void
  sortBy?: SortingRule<string>[]
  setSortBy: (cols: SortingRule<string>[]) => void
  isLoading: boolean
  scope?: ResourceScope
  colWidths: KeyVal
  saveColumnResizeWidth: (
    columnResizing: UseResizeColumnsState<any>['columnResizing'],
  ) => void
}) => {
  const col = useAssetColumns({ handleRowClick, colWidths, isAdmin })
  const [hiddenColumns, sethiddenColumns] = useState<string[]>([])

  useEffect(() => {
    // Show or hide the Featured column based on scope
    const featuredColumnHide = scope !== 'everybody' ? 'featured' : null
    const locationColumnHide = scope !== 'spaces' ? 'location' : null
    const addedByColumnHide = scope === 'me' ? 'added_by' : null
    const cols = [
      featuredColumnHide,
      locationColumnHide,
      addedByColumnHide,
    ].filter(Boolean) as string[]
    sethiddenColumns(cols)
  }, [scope])

  const columns = useMemo(() => col, [col])
  const data = useMemo(() => apps || [], [apps])

  return (
    <StyledHomeTable>
      <Table<IAsset>
        name="apps"
        columns={columns}
        hiddenColumns={hiddenColumns}
        data={data}
        isSelectable
        isSortable
        isFilterable
        loading={isLoading}
        loadingComponent={<div>Loading...</div>}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        sortByPreference={sortBy}
        setSortByPreference={setSortBy}
        manualFilters
        shouldResetFilters={[scope]}
        filters={filters}
        setFilters={setFilters}
        emptyComponent={<EmptyTable>You have no assets here.</EmptyTable>}
        isColsResizable
        saveColumnResizeWidth={saveColumnResizeWidth}
      />
    </StyledHomeTable>
  )
}
