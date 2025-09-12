/* eslint-disable jsx-a11y/no-static-element-interactions */
import { flexRender, Row, RowData, Table, Column } from '@tanstack/react-table'
import classNames from 'classnames'
import { range } from 'ramda'
import React, { DragEventHandler } from 'react'
import styled from 'styled-components'
import { IFile } from '../../../features/files/files.types'
import { Draggable, Droppable } from '../DnD'
import { ColumnSelect } from './ColumnSelect'
import Filter from './Filter'
import { LoadingRows } from './LoadingRows'
import { getRowGroup, getTableHeaderGroups, TableGroup } from './util'

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    filterElement?: (column: Column<TData, TValue>) => React.ReactNode
  }
}

type Props<T extends RowData> = {
  emptyText?: string
  isLoading?: boolean
  table: Table<T>
  tableGroup?: TableGroup
  enableDnd?: boolean
  enableHtmlDnd?: boolean
  onDragStart?: DragEventHandler
  displayColSpacer?: boolean
  spacerWidth?: number
}

const DnDRow = ({ row, numSelected, children }: {row: Row<IFile>, numSelected: number, children: React.ReactNode }) => {
  const isSelected = row.getIsSelected()

  let DnDComp = isSelected ? Draggable : 'tr'
  if (isSelected && row.original.type === 'Folder') {
    DnDComp = Draggable
  }
  if (!isSelected && row.original.type === 'Folder') {
    DnDComp = Droppable
  }
  const dndProps = DnDComp !== 'tr' ? { numSelected } : {}
  return (
    <DnDComp data-testid="data-row" as="tr" {...dndProps} id={row.original.id} name={row.original.name}>
      {children}
    </DnDComp>
  )
}

const Filler = styled.td``

export function CustomTable<T extends RowData>({
  emptyText = 'There are no items here.',
  isLoading,
  table,
  tableGroup,
  enableDnd = false,
  enableHtmlDnd = undefined,
  onDragStart = undefined,
  spacerWidth = 0,
  displayColSpacer = true,
}: Props<T>) {
  const [headerGroups] = getTableHeaderGroups(table, tableGroup)
  const numSelected = table.getSelectedRowModel().rows.length

  const colFiller = (as: string) => displayColSpacer && <Filler as={as} style={{ width: spacerWidth - 10, minWidth: 50 }} />

  return (
    <>
      <table
        data-testid="pfda-table"
        cellSpacing="0"
        cellPadding="0"
        style={{
          width: table.getCenterTotalSize(),
        }}
      >
        <thead>
          {headerGroups.map(headerGroup => (
            <React.Fragment key={headerGroup.id}>
              <tr className="name-row" style={{ position: 'relative' }}>
                {headerGroup.headers.map(header => (
                  <th
                    className={classNames({
                      'cell-select cell-select-header sticky-left': header.column.id === 'select',
                      relative: true,
                    })}
                    key={header.id}
                    style={{ width: header.getSize() }}
                    colSpan={header.colSpan}
                  >
                    <button
                      type="button"
                      tabIndex={header.column.getCanSort() ? 0 : -1}
                      onClick={header.column.getToggleSortingHandler()}
                      className={classNames('col-select-btn', {
                        'col-sort-btn': header.column.getCanSort(),
                        'name-btn': header.column.id !== 'select',
                      })}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}{' '}
                      {header.column.getIsSorted() ? (header.column.getIsSorted() === 'asc' ? '↑' : '↓') : ''}
                    </button>

                    <div
                      onDoubleClick={() => header.column.resetSize()}
                      onMouseDown={header.getResizeHandler()}
                      onTouchStart={header.getResizeHandler()}
                      className={
                        header.column.getCanResize()
                          ? `resizer ${table.options.columnResizeDirection} ${header.column.getIsResizing() ? 'isResizing' : ''}`
                          : ''
                      }
                    />
                  </th>
                ))}
                {colFiller('th')}
                <ColumnSelect<T> table={table} />
              </tr>
              {table.options.enableColumnFilters && (
                <tr className="filter-row">
                  {headerGroup.headers.map(header => (
                    <th
                      className={classNames({ 'cell-select': header.column.id === 'select' })}
                      key={header.id}
                      style={{ width: header.getSize() }}
                      colSpan={header.colSpan}
                      data-testid={`table-filter-${header.column.id}`}
                    >
                      {header.column.columnDef.meta?.filterElement?.(header.column)}
                      {header.column.getCanFilter() && !header.column.columnDef.meta?.filterElement ? (
                        <Filter column={header.column} table={table} />
                      ) : null}
                    </th>
                  ))}
                  {colFiller('th')}
                </tr>
              )}
            </React.Fragment>
          ))}
        </thead>

        <tbody>
          {isLoading &&
            range(0, 3).map(i => <LoadingRows visibleColumns={headerGroups[0].headers.map(h => h.column)} delay={i} key={i} />)}
          {table.getRowModel().rows.map(row => {
            const cells = getRowGroup(row, tableGroup).map(cell => (
              <td
                className={classNames({ 'cell-select sticky-left': cell.column.id === 'select', relative: true })}
                key={cell.id}
                style={{ width: cell.column.getSize() }}
                data-testid={`table-col-${cell.column.id}`}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))

            if (enableDnd) {
              return (
                <DnDRow key={row.id} row={row as Row<IFile>} numSelected={numSelected}>
                  {cells}
                  {colFiller('td')}
                </DnDRow>
              )
            }

            const isSubRow = row.depth > 0

            if (enableHtmlDnd) {
              return (
                <tr data-testid="data-row" key={row.id} className={classNames({ 'sub-row': isSubRow })} draggable={true} onDragStart={onDragStart} id={`html-dnd-${row.id}`}>
                  {cells}
                  {colFiller('td')}
                </tr>
              )
            }

            return (
              <tr data-testid="data-row" key={row.id} className={classNames({ 'sub-row': isSubRow })}>
                {cells}
                {colFiller('td')}
              </tr>
            )
          })}
        </tbody>
      </table>
      {!isLoading && table.getRowModel().rows.length === 0 && emptyText && <div className="table-empty">{emptyText}</div>}
    </>
  )
}

export default CustomTable
