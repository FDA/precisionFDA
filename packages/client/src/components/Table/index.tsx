import {
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnSizingState,
  type ExpandedState,
  type GroupingState,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getGroupedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type OnChangeFn,
  type Row,
  type RowSelectionState,
  type SortingState,
  type Updater,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table'
import React, { type DragEventHandler, useEffectEvent, useMemo } from 'react'
import CustomTable from './components/CustomTable'
import { TableStyles } from './components/table.styles'
import { useComponentWidth } from './useComponentWidth'

function resolveUpdater<S>(updater: Updater<S>, current: S): S {
  return typeof updater === 'function' ? (updater as (old: S) => S)(current) : updater
}

function Table<T extends { id: number | string }>({
  enableColumnFilters = true,
  enableColumnSelect = true,
  enableRowClickSelection = false,
  emptyText,
  isLoading,
  data,
  columns,
  columnVisibility = {},
  setColumnVisibility,
  rowSelection = {},
  setSelectedRows,
  columnFilters = [],
  columnSortBy = [],
  setColumnSortBy,
  setColumnFilters,
  columnSizing = {},
  setColumnSizing,
  enableDnd,
  enableHtmlDnd,
  onDragStart,
  onRowClick,
  expanded = {},
  setExpanded,
  subRowKey,
  manualFiltering = true,
  manualSorting = true,
}: {
  enableColumnFilters?: boolean
  enableColumnSelect?: boolean
  enableRowClickSelection?: boolean
  emptyText?: string
  isLoading: boolean
  data: T[]
  columns: ColumnDef<T>[]
  rowSelection?: RowSelectionState
  setSelectedRows?: (v: RowSelectionState) => void
  columnSortBy?: SortingState
  setColumnSortBy?: (v: SortingState) => void
  columnFilters?: ColumnFiltersState
  setColumnFilters?: (v: ColumnFiltersState) => void
  columnSizing?: ColumnSizingState
  setColumnSizing?: (v: ColumnSizingState) => void
  enableDnd?: boolean
  enableHtmlDnd?: boolean
  onDragStart?: DragEventHandler
  onRowClick?: (row: Row<T>) => void
  expanded?: ExpandedState
  setExpanded?: (e: ExpandedState) => void
  setColumnVisibility?: (cols: VisibilityState) => void
  columnVisibility?: VisibilityState
  subRowKey?: keyof T
  manualFiltering?: boolean
  manualSorting?: boolean
}) {
  // const [columnVisibility, setColumnVisibility] = React.useState({})
  const [grouping, setGrouping] = React.useState<GroupingState>([])
  const [columnPinning, setColumnPinning] = React.useState({})
  const [liveColumnSizing, setLiveColumnSizing] = React.useState(columnSizing)

  const handleColumnFiltersChange: OnChangeFn<ColumnFiltersState> = updater => {
    setColumnFilters?.(resolveUpdater(updater, columnFilters))
  }

  const handleColumnSortChange: OnChangeFn<SortingState> = useEffectEvent(updater => {
    setColumnSortBy?.(resolveUpdater(updater, columnSortBy))
  })

  const handleSelectedRowsChange: OnChangeFn<RowSelectionState> = updater => {
    setSelectedRows?.(resolveUpdater(updater, rowSelection))
  }

  const handleColumnSizeChange: OnChangeFn<ColumnSizingState> = updater => {
    const resolved = resolveUpdater(updater, liveColumnSizing)
    setLiveColumnSizing(resolved)
    setColumnSizing?.(resolved)
  }

  const handleExpandingChange: OnChangeFn<ExpandedState> = updater => {
    setExpanded?.(resolveUpdater(updater, expanded))
  }

  const handleSetColumnVisibility: OnChangeFn<VisibilityState> = updater => {
    setColumnVisibility?.(resolveUpdater(updater, columnVisibility))
  }

  const table = useReactTable({
    data,
    columns,
    getSubRows: row => subRowKey && (row[subRowKey] as []),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    onColumnFiltersChange: handleColumnFiltersChange,
    onSortingChange: handleColumnSortChange,
    manualPagination: true,
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    onColumnVisibilityChange: handleSetColumnVisibility,
    onGroupingChange: setGrouping,
    onColumnPinningChange: setColumnPinning,
    onRowSelectionChange: handleSelectedRowsChange,
    onColumnSizingChange: handleColumnSizeChange,
    onExpandedChange: handleExpandingChange,
    autoResetPageIndex: false,
    state: {
      columnSizing: liveColumnSizing,
      grouping,
      columnFilters,
      columnVisibility,
      columnPinning,
      sorting: columnSortBy,
      rowSelection,
      expanded,
    },
    manualFiltering,
    manualSorting,
    enableColumnFilters: enableColumnFilters,
    // debugTable: true,
    // debugHeaders: true,
    // debugColumns: true,
  })

  // Fix empty space with column header with calculated width
  const { containerRef, containerWidth = 50 } = useComponentWidth()
  const sum = table
    .getVisibleFlatColumns()
    .map(c => c.getSize())
    .reduce((accumulator, value) => {
      return accumulator + value
    }, 0)
  const spacerWidth = useMemo(() => {
    if (!columnVisibility || !columnSizing) {
      return 0
    }
    return containerWidth > sum ? containerWidth - sum - 8 : 50
  }, [columnVisibility, columnSizing, containerWidth, sum])

  return (
    <TableStyles ref={containerRef}>
      <CustomTable
        isLoading={isLoading}
        emptyText={emptyText}
        table={table}
        enableDnd={enableDnd}
        enableHtmlDnd={enableHtmlDnd}
        onDragStart={onDragStart}
        onRowClick={onRowClick}
        spacerWidth={spacerWidth}
        enableColumnSelect={enableColumnSelect}
        enableRowClickSelection={enableRowClickSelection}
      />
    </TableStyles>
  )
}

export default Table
