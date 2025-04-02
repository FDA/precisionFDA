/* eslint-disable no-nested-ternary */
import React from 'react'
import styled from 'styled-components'
import { useReactTable, flexRender, getCoreRowModel, getSortedRowModel, ColumnDef, SortingState } from '@tanstack/react-table'

const Styles = styled.div`
  table {
    border-spacing: 0;
    border: 1px solid var(--c-layout-border-200);
    thead {
      border-color: var(--c-layout-border-200);
    }
    tbody tr {
      border-color: var(--c-layout-border-200);
    }
    tbody tr:nth-of-type(even) {
      background-color: inherit;
    }
    tr {
      border-color: var(--c-layout-border-200);
      &:last-child {
        td {
          border-bottom: 0;
        }
      }
    }
    th,
    td {
      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid var(--c-layout-border-200);
      border-right: 1px solid var(--c-layout-border-200);
      &:last-child {
        border-right: 0;
      }
    }
  }
`

const SorterSymbol = styled.div`
  font-size: 12px;
  width: 13px;
  height: 13px;
  display: inline-block;
  padding-left: 8px;
`

export function SimpleTable<T extends object>({ columns, data }: { columns: ColumnDef<T>[]; data: T[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <Styles>
      <table>
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default' }}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {header.column.getCanSort() && (
                    <SorterSymbol>
                      {header.column.getIsSorted() === 'asc' ? ' ↑' : header.column.getIsSorted() === 'desc' ? ' ↓' : ' '}
                    </SorterSymbol>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Styles>
  )
}
