import {
  ColumnFiltersState,
  ColumnSizingState,
  ColumnSort,
  RowSelectionState,
  VisibilityState,
} from '@tanstack/react-table'
import React from 'react'
import Table from '../../../components/Table'
import { StyledPageTable } from '../../../components/Table/components/styles'
import { SpaceMembership } from './members.types'
import { ISpace } from '../spaces.types'
import { useMembersColumns } from './useMembersColumns'

export const MembersListTable = ({
  filters,
  setFilters,
  members,
  space,
  isLoading,
  selectedRows,
  setSelectedRows,
  sortBy,
  setSortBy,
  columnSizing,
  setColumnSizing,
  columnVisibility,
  setColumnVisibility,
  isLeadOrAdmin,
}: {
  filters: ColumnFiltersState
  setFilters: (val: ColumnFiltersState) => void
  sortBy: ColumnSort[]
  setSortBy: (cols: ColumnSort[]) => void
  members?: SpaceMembership[]
  space: ISpace
  isLoading: boolean
  selectedRows?: RowSelectionState
  setSelectedRows: (ids: RowSelectionState) => void
  columnSizing: ColumnSizingState
  setColumnSizing: (columnResizing: ColumnSizingState) => void
  setColumnVisibility: (cols: VisibilityState) => void
  columnVisibility: VisibilityState
  isLeadOrAdmin?: boolean
}) => {
  const columns = useMembersColumns({ space, isLeadOrAdmin })

  return (
    <StyledPageTable>
      <Table<SpaceMembership>
        isLoading={isLoading}
        data={members || []}
        columns={columns}
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
        emptyText="No members found."
        enableColumnFilters={true}
        manualFiltering={false}
        manualSorting={false}
      />
    </StyledPageTable>
  )
}
