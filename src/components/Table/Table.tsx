/* eslint-disable react/require-default-props */
import 'core-js'
import { range } from 'ramda'
import React, {
  MouseEventHandler,
  PropsWithChildren,
  ReactElement,
  ReactNode,
  useMemo,
} from 'react'
import {
  Cell,
  CellProps,
  Filters,
  IdType,
  Row,
  SortingRule,
  TableInstance,
  TableOptions,
  useColumnOrder,
  useExpanded,
  useFilters,
  useFlexLayout,
  useGlobalFilter,
  useGroupBy,
  useMountedLayoutEffect,
  usePagination,
  useResizeColumns,
  UseResizeColumnsState,
  useRowSelect, useSortBy,
  useTable,
} from 'react-table'
import 'regenerator-runtime'
import { DefaultColumnFilter } from './helpers'
import { LoadingRows } from './LoadingRows'
import { ReactTableStyles, StyledTable } from './styles'
import { expandHook, selectionHook } from './tableHooks'

export interface IRowActionProps<T extends object = {}> extends CellProps<T> {
  context: any
}

export interface ITable<T extends object = {}> extends TableOptions<T> {
  name: string
  fillWidth?: boolean
  hiddenColumns?: string[]
  loading?: boolean
  loadingComponent?: any
  shouldResetFilters?: any[]
  emptyComponent?: React.ReactNode
  context?: object
  showTableTools?: boolean
  showPagination?: boolean
  isColsResizable?: boolean
  isSelectable?: boolean
  selectedRows?: Record<IdType<T>, boolean>
  setSelectedRows?: (rowIds: Record<IdType<T>, boolean>) => void
  setSortByPreference?: (cols: SortingRule<string>[]) => void
  isSortable?: boolean
  sortByPreference?: SortingRule<string>[]
  isExpandable?: boolean
  subcomponent?: (row: Row<T>) => ReactNode
  onAdd?: (instance: TableInstance<T>) => MouseEventHandler
  onDelete?: (instance: TableInstance<T>) => MouseEventHandler
  onEdit?: (instance: TableInstance<T>) => MouseEventHandler
  onClick?: (row: Row<T>) => void
  isFilterable?: boolean
  filters?: Filters<T>
  setFilters?: (filters: any[]) => void
  cellProps?: (cell: Cell<T>) => any
  rowProps?: (row: Row<T>) => any
  updateRowState?: (row: Row<T>) => any
  saveColumnResizeWidth?: (
    columnResizing: UseResizeColumnsState<any>['columnResizing'],
  ) => void
  getRowId?: Parameters<typeof useTable>[0]['getRowId']
  shouldAllowScrollbar?: boolean
}

export default function Table<T extends object>(
  props: PropsWithChildren<ITable<T>>,
): ReactElement {
  const {
    fillWidth = false,
    loading = true,
    columns,
    subcomponent,
    hiddenColumns,
    isSelectable = false,
    selectedRows,
    setSelectedRows,
    setSortByPreference,
    isSortable = false,
    sortByPreference,
    isExpandable = false,
    shouldResetFilters,
    isColsResizable = false,
    emptyComponent,
    context = {},
    isFilterable = false,
    filters,
    setFilters,
    data,
    cellProps,
    rowProps,
    updateRowState,
    saveColumnResizeWidth,
    manualFilters,
    shouldAllowScrollbar,
  } = props

  const defaultColumn = {
    Filter: DefaultColumnFilter,
    disableResizing: !isColsResizable,
    minWidth: 70,
    width: 150,
    // When using the useFlexLayout:
    // minWidth: 30, // minWidth is only used as a limit for resizing
    // width: 50, // width is used for both the flex-basis and flex-grow
    // maxWidth: 700, // maxWidth is only used as a limit for resizing
  }

  const instance = useTable<T>(
    {
      ...props,
      data,
      columns,
      defaultColumn,
      initialState: {
        filters: filters || [],
        hiddenColumns: hiddenColumns || [],
        selectedRowIds: selectedRows || ({} as any),
        sortBy: sortByPreference || [],
      },
      manualFilters,
      manualPagination: true,
      manualSortBy: true,
      disableMultiSort: true,
    },
    useColumnOrder,
    isFilterable ? useFilters : () => {},
    isFilterable ? useGlobalFilter : () => {},
    useGroupBy,
    isSortable ? useSortBy : () => {},
    isExpandable ? useExpanded : () => {},
    usePagination,
    useFlexLayout,
    isExpandable ? expandHook : () => {},
    isSelectable ? useRowSelect : () => {},
    isSelectable ? selectionHook : () => {},
    isColsResizable ? useResizeColumns : () => {},
  )

  const {
    getTableProps,
    getTableBodyProps,
    prepareRow,
    visibleColumns,
    page,
    state,
    state: { selectedRowIds, sortBy, columnResizing },
    setHiddenColumns,
    toggleAllRowsSelected,
    setAllFilters,
  } = instance

  useMountedLayoutEffect(() => {
    if(setSelectedRows) setSelectedRows(selectedRowIds)
  }, [selectedRowIds, setSelectedRows])

  useMountedLayoutEffect(() => {
    if(setSortByPreference) setSortByPreference(sortBy)
  }, [sortBy])

  // TODO: find a better way to reset filters when scope changes
  const reset = useMemo(() => shouldResetFilters, shouldResetFilters)
  useMountedLayoutEffect(() => {
    if(reset && reset.length > 0) setAllFilters([])
  }, reset)

  useMountedLayoutEffect(() => {
    if(typeof setFilters === 'function') setFilters(state.filters)
  }, [state.filters, setFilters])

  useMountedLayoutEffect(() => {
    if(hiddenColumns) setHiddenColumns(hiddenColumns)
  }, [hiddenColumns])

  useMountedLayoutEffect(() => {
    // Kinda hacky, but it works. Resets the selected rows in react-table
    // from the parent by setting selectredRows to undefined. This is because there
    // is no way to use useRowSelect in a conrolled way.
    if (selectedRows === undefined) {
      toggleAllRowsSelected(false)
    }
  }, [selectedRows])

  useMountedLayoutEffect(() => {
    if (saveColumnResizeWidth && columnResizing.isResizingColumn === null) {
      saveColumnResizeWidth(columnResizing)
      // setisResizing(false)
    }
  }, [columnResizing])

  return (
    <StyledTable data-testid="pfda-table">
      <ReactTableStyles shouldFillWidth={fillWidth} shouldAllowScrollbar={shouldAllowScrollbar}>
        <div className="tableWrap">
          <div {...getTableProps()} className="table sticky">
            <div className="thead">
              {visibleColumns.map((column, i) => (
                // eslint-disable-next-line react/jsx-key
                <div {...column.getHeaderProps()} className="th">
                  {isColsResizable && column.getResizerProps && (
                    <div
                      {...column.getResizerProps()}
                      className={`resizer ${
                        column.isResizing ? 'isResizing' : ''
                      }`}
                    />
                  )}
                  {isSortable && column.canSort ? (
                    <div {...column.getSortByToggleProps()} className="sort">
                      {column.render('Header')}
                      <span>
                        {/* eslint-disable-next-line no-nested-ternary */}
                        {column.isSorted
                          ? column.isSortedDesc
                            ? ' ↓'
                            : ' ↑'
                          : ''}
                      </span>
                    </div>
                  ) : (
                    <>{column.render('Header')}</>
                  )}
                </div>
              ))}
            </div>

            {isFilterable && (
              <div className="thead">
                {visibleColumns.map((column, i) => (
                  // eslint-disable-next-line react/jsx-key
                  <div {...column.getHeaderProps()} className="th">
                    {column.canFilter ? column.render('Filter') : null}
                  </div>
                ))}
              </div>
            )}

            <div {...getTableBodyProps()} className="tbody">
              {range(0, 10).map(i => (
                <LoadingRows<T>
                  loading={loading}
                  visibleColumns={visibleColumns}
                  delay={i}
                  key={i}
                />
              ))}
              {!loading && page.length === 0 && emptyComponent}
              {page.map((row, index) => {
                const r: Row<T> = (updateRowState && updateRowState(row)) || row
                prepareRow(r)
                return (
                  <React.Fragment key={r.id}>
                    <div
                      {...r.getRowProps(rowProps && rowProps(r))}
                      className="tr"
                    >
                      {r.cells.map(cell => (
                          // eslint-disable-next-line react/jsx-key
                          <div
                            {...cell.getCellProps(cellProps && cellProps(cell))}
                            className="td"
                            data-testid={`table-col-${cell.column.id}`}
                          >
                            {cell.render('Cell')}
                          </div>
                        ))}
                    </div>
                    {isExpandable && r.isExpanded
                      ? subcomponent && subcomponent(r)
                      : null}
                  </React.Fragment>
                )
              })}
            </div>
          </div>
        </div>
      </ReactTableStyles>
    </StyledTable>
  )
}
