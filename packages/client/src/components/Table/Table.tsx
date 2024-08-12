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
  UseResizeColumnsState,
  useColumnOrder,
  useExpanded,
  useFilters,
  useFlexLayout,
  useGlobalFilter,
  useGroupBy,
  useMountedLayoutEffect,
  usePagination,
  useResizeColumns,
  useRowSelect,
  useSortBy,
  useTable,
} from 'react-table'
import 'regenerator-runtime'
import styled from 'styled-components'
import classNames from 'classnames'
import { ActionsDropdownGroupContent } from '../../features/home/ActionDropdownContent'
import { ActionFunctionsType, ActionGroupType } from '../../features/home/types'
import { TransparentButton } from '../Button'
import Dropdown from '../Dropdown'
import { ColumnsIcon } from '../icons/ColumnsIcon'
import { LoadingRows } from './LoadingRows'
import { DefaultColumnFilter } from './helpers'
import { ReactTableStyles, StyledTable } from './styles'
import { expandHook, selectionHook } from './tableHooks'
import { useComponentWidth } from './useComponentWidth'

const StyledColumnSelect = styled.div`
  position: sticky;
  top: 0;
  left: calc(100%);
  width: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  z-index: 3;
  display: grid;
`

const Back = styled.div`
  grid-area: 1 / 1;
  background-color: var(--background);
  width: 48px;
  height: 32px;
  margin-right: -4px;
  filter: blur(3px);
`

const Front = styled(Dropdown)`
  grid-area: 1 / 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  z-index: 3;
  width: 32px;
  color: var(--tertiary-400);
  &:hover {
    color: var(--tertiary-500);
  }
`

type SelectColumn = {
  key: string
  title: string
  isVisible: boolean
  groupTitle: string
}

type FilterSelectColumn = {
  [key: string]: SelectColumn
}

const ColumnSelect = ({
  columns,
  onChangeVisible,
}: {
  columns: SelectColumn[],
  onChangeVisible: (hiddenCols: string, cols: boolean) => void,
}) => {
  const actions: {[key: string]: ActionFunctionsType<any>} = {}
  for (const col of columns) {
    if (!actions[col.groupTitle]) {
      actions[col.groupTitle] = {}
    }
    actions[col.groupTitle][col.key] = {
      type: 'selection',
      isDisabled: false,
      isSelected: col.isVisible,
      key: col.key,
      title: col.title,
      func: (isVisible: boolean) => {
        onChangeVisible(col.key, isVisible)
      },
    }
  }
  const content: ActionGroupType[] = Object.entries(actions).map(([title, actions]) => ({
    actions,
    title,
  }))
  return (
    <StyledColumnSelect>
      <Front
        trigger="click"
        content={
          <ActionsDropdownGroupContent content={content} />
        }
      >
        {dropdownProps => (
          <TransparentButton {...dropdownProps} active={dropdownProps.isActive} title="Column Select">
            <ColumnsIcon height={14} />
          </TransparentButton>
        )}
      </Front>
      <Back />
    </StyledColumnSelect>
  )
}

export interface IRowActionProps<T extends object = {}> extends CellProps<T> {
  context: any
}

export interface ITable<T extends object = {}> extends TableOptions<T> {
  name: string
  fillWidth?: boolean
  hiddenColumns?: string[]
  properties?: string[] | undefined
  loading?: boolean
  loadingComponent?: any
  shouldResetFilters?: any[]
  emptyComponent?: React.ReactNode
  context?: object
  showTableTools?: boolean
  showPagination?: boolean
  isColsResizable?: boolean
  displayColFiller?: boolean
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
  enableColumnSelect?: boolean
  shouldAllowScrollbar?: boolean
  saveHiddenColumns: (cols: string[]) => void
}

export default function Table<T extends object>(
  props: PropsWithChildren<ITable<T>>,
): ReactElement {
  const {
    fillWidth = false,
    loading = true,
    columns,
    subcomponent,
    properties,
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
    enableColumnSelect = false,
    hiddenColumns,
    displayColFiller = true,
    saveHiddenColumns = () => {},
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
    isFilterable ? useFilters : () => { },
    isFilterable ? useGlobalFilter : () => { },
    useGroupBy,
    isSortable ? useSortBy : () => { },
    isExpandable ? useExpanded : () => { },
    usePagination,
    useFlexLayout,
    isExpandable ? expandHook : () => { },
    isSelectable ? useRowSelect : () => { },
    isSelectable ? selectionHook : () => { },
    isColsResizable ? useResizeColumns : () => { },
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
  

  // Fix empty space with column header with calculated width
  const { containerRef, containerWidth = 50 } = useComponentWidth()
  const spacerWidth = useMemo(() => {
    const sum = visibleColumns.map(c => c.width as number).reduce((accumulator, value) => {
      return accumulator + value
    }, 0)
    return containerWidth > sum ? containerWidth - sum - 8 : 50
  }, [visibleColumns])

  useMountedLayoutEffect(() => {
    if (setSelectedRows) setSelectedRows(selectedRowIds)
  }, [selectedRowIds, setSelectedRows])

  useMountedLayoutEffect(() => {
    if (setSortByPreference) setSortByPreference(sortBy)
  }, [sortBy])

  // TODO: find a better way to reset filters when scope changes
  const reset = useMemo(() => shouldResetFilters, shouldResetFilters)
  useMountedLayoutEffect(() => {
    if (reset && reset.length > 0) setAllFilters([])
  }, reset)

  useMountedLayoutEffect(() => {
    if (typeof setFilters === 'function') setFilters(state.filters)
  }, [state.filters, setFilters])

  useMountedLayoutEffect(() => {
    if (hiddenColumns) {
      setHiddenColumns(hiddenColumns)
    }
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

  const onChangeVisible = (col: string, isVisible: boolean) => {
    const newHCols = [...hiddenColumns ?? []]
    if (isVisible) {
      const index = hiddenColumns?.indexOf(col) ?? -1
      if (index > -1) {
        newHCols?.splice(index, 1)
        saveHiddenColumns([...newHCols || []])
      }
    } else {
      newHCols?.push(col)
      saveHiddenColumns([...newHCols || []])
    }
  }

  const getAvailableCols = () => {
    const standardColumns = columns?.filter((c) => c?.id === typeof 'string' || true && !c.id?.includes('props.'))
    .map(c => ({ key: c?.accessor, title: c.Header, groupTitle: 'Standard Columns', isVisible: !hiddenColumns?.includes(c.accessor) })) ?? []
    const propColums = properties?.map(p => ({ key: `props.${p}`, title: p, groupTitle: 'Property Columns', isVisible: !hiddenColumns?.includes(`props.${p}`) })) ?? []

    return [...standardColumns, ...propColums]
  }

  const colFiller = displayColFiller && <div className="th" style={{ width: spacerWidth - 10, minWidth: 50 }} />
 
  return (
    <StyledTable data-testid="pfda-table">
      <ReactTableStyles
        $shouldFillWidth={fillWidth}
        $shouldAllowScrollbar={shouldAllowScrollbar}
      >
        <div className="tableWrap" ref={containerRef}>
          <div {...getTableProps()} className="table sticky">
            <div className="thead" role="row">
              {enableColumnSelect && <ColumnSelect
                columns={getAvailableCols()}
                hiddenColumns={hiddenColumns}
                onChangeVisible={onChangeVisible}
                />
              }
              {visibleColumns.map((column) => {
                const classes = classNames('th', { 'row-expander': column.id === 'row-expander' })
                return (
                  // eslint-disable-next-line react/jsx-key
                  <div {...column.getHeaderProps()} className={classes}>
                    {isColsResizable && column.getResizerProps && (
                      <div
                        {...column.getResizerProps()}
                        className={`resizer ${column.isResizing ? 'isResizing' : ''
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
                )
              })}
              {colFiller}
            </div>

            {isFilterable && (
              <div className="thead filters" role="row">
                {visibleColumns.map((column, i) => {
                  const classes = classNames('th', { 'row-expander': column.id === 'row-expander' })
                  return (
                    // eslint-disable-next-line react/jsx-key
                    <div {...column.getHeaderProps()} className={classes}>
                      {column.canFilter ? column.render('Filter') : null}
                    </div>
                )})}
                {colFiller}
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
                      role="row"
                      data-testid="data-row"
                    >
                      {r.cells.map(cell => {
                        const classes = classNames('td', { 'row-expander': cell.column.id === 'row-expander' })
                        return (
                          // eslint-disable-next-line react/jsx-key
                          <div
                            {...cell.getCellProps(cellProps && cellProps(cell))}
                            className={classes}
                            data-testid={`table-col-${cell.column.id}`}
                          >
                            {cell.render('Cell')}
                          </div>
                      )})}
                      {colFiller}
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
