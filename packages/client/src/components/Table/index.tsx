import {
  ColumnDef,
  ColumnFiltersState,
  ColumnSizingState,
  ExpandedState,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getGroupedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  GroupingState,
  OnChangeFn,
  RowSelectionState,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table'
import React, { DragEventHandler, useMemo } from 'react'

import CustomTable from './components/CustomTable'
import { TableStyles } from './components/styles'
import { useComponentWidth } from './useComponentWidth'
import { useDebounce } from './useDebounce'

function Table<T extends { id: number }>({
  enableColumnFilters = true,
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
  expanded = {},
  setExpanded,
  subRowKey,
  manualFiltering = true,
  manualSorting = true,
}: {
  enableColumnFilters?: boolean
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
    if (typeof updater === 'function') {
      if(setColumnFilters) setColumnFilters(updater(columnFilters))
    }
  }

  const handleColumnSortChange: OnChangeFn<SortingState> = updater => {
    if (typeof updater === 'function') {
      if(setColumnSortBy) setColumnSortBy(updater(columnSortBy))
    }
  }

  const handleSelectedRowsChange: OnChangeFn<RowSelectionState> = updater => {
    if (typeof updater === 'function') {
      if(setSelectedRows) setSelectedRows(updater(rowSelection))
    }
  }

  const handleColumnSizeChange: OnChangeFn<ColumnSizingState> = updater => {
    if (typeof updater === 'function') {
      const resolvedUpdater = updater(liveColumnSizing)
      setLiveColumnSizing(resolvedUpdater)
      if(setColumnSizing) setColumnSizing(resolvedUpdater)
    }
  }

  const handleExpandingChange: OnChangeFn<ExpandedState> = updater => {
    if (typeof updater === 'function' && setExpanded) {
      setExpanded(updater(expanded))
    }
  }

  const handleSetColumnVisibility: OnChangeFn<VisibilityState> = updater => {
    if (typeof updater === 'function') {
      if(setColumnVisibility) {
        const resolvedUpdater = updater(columnVisibility)
        setColumnVisibility(resolvedUpdater)
      }
    }
  }


  const table = useReactTable({
    data,
    columns,
    getSubRows: row => subRowKey && row[subRowKey] as [],
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
  const dSum = useDebounce(sum, 300)
  const spacerWidth = useMemo(() => {
    if (!columnVisibility || !columnSizing) {
      return 0
    }
    return containerWidth > sum ? containerWidth - sum - 8 : 50
  }, [columnVisibility, containerWidth, dSum])

  return (
    <TableStyles ref={containerRef}>
      <CustomTable isLoading={isLoading} emptyText={emptyText} table={table} enableDnd={enableDnd} enableHtmlDnd={enableHtmlDnd} onDragStart={onDragStart} spacerWidth={spacerWidth} />
    </TableStyles>
  )
}

export default Table
