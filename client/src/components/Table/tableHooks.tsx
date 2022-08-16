import React from 'react'
import { Hooks, HeaderProps, CellProps, useResizeColumns } from 'react-table'
import initial from 'lodash/initial'
import { IndeterminateCheckbox } from './IndeterminateCheckbox'
import { ExpandArrowIcon } from './styles'
import { TransparentButton } from '../Dropdown/styles'


export const selectionHook = (hooks: Hooks<any>) => {
  hooks.visibleColumns.push(columns => [
    {
      id: 'selection',
      width: 40,
      minWidth: 40,
      disableResizing: true,
      // The header can use the table's getToggleAllRowsSelectedProps method
      // to render a checkbox
      Header: ({ getToggleAllRowsSelectedProps }) => (
        <div>
          <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
        </div>
      ),
      // The cell can use the individual row's getToggleRowSelectedProps method
      // to the render a checkbox
      Cell: ({ row }) => (
        <div>
          <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
        </div>
      ),
    },
    ...columns,
  ])
  hooks.useInstanceBeforeDimensions.push(({ headers }) => {
    const selectedHeader = headers[0]
    selectedHeader.canResize = false
  })
}

export const useEmptyCol = (width: number) => (hooks: Hooks<any>) => {
  hooks.visibleColumns.push(columns => {
    const front = initial(columns)
    const stickyCol = columns.slice(-1)

    const emptyColWidth = width === 0 ? 1400 : width

    return [
      ...front,
      {
        id: 'empty',
        disableResizing: true,
        disableGroupBy: true,
        // minWidth: '100%',
        width: emptyColWidth,
        // minWidth: 500,
        flexGrow: 1,
        flexShrink: 0,
        Header: ({ getToggleAllRowsSelectedProps }: HeaderProps<any>) => (<div/>),
        Cell: ({ row }: CellProps<any>) => <div {...row.getRowProps()}></div>,
      },
      ...stickyCol,
    ]
  })

  // hooks.useInstanceAfterDimensions.push(({ width }) => {
  // console.log("working???");
  // const selectedHeader = headers[headers.length -1]
  // selectedHeader.maxWidth = 600
  // })
}

export const expandHook = (hooks: Hooks<any>) => {
  hooks.visibleColumns.push(columns => [
    {
      id: 'expander',
      disableResizing: true,
      disableGroupBy: true,
      width: 45,
      minWidth: 45,
      Header: ({ toggleAllRowsExpanded, isAllRowsExpanded }) => (
        <TransparentButton onClick={() => toggleAllRowsExpanded()}>
          <ExpandArrowIcon expanded={isAllRowsExpanded} />
        </TransparentButton>
      ),
      Cell: (cell: CellProps<any>) => {
        return (
          <div {...cell.row.getToggleRowExpandedProps()}>
            {cell.row.hideExpand ? (
              <ExpandArrowIcon hide={true} />
            ) : <ExpandArrowIcon expanded={cell.row.isExpanded} />}
          </div>
        )
      },
    },
    ...columns,
  ])
  hooks.useInstanceBeforeDimensions.push(({ headers }) => {
    const selectedHeader = headers[0]
    selectedHeader.canResize = false
  })
}

export const resizeHook = (isResizable: boolean) => {
  if (!isResizable) return
  else return useResizeColumns
}
