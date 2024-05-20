/* eslint-disable react/jsx-key */
/* eslint-disable no-nested-ternary */
import React from 'react'
import styled from 'styled-components'
import { useTable, useSortBy, Column } from 'react-table'

const Styles = styled.div`
  table {
    border-spacing: 0;
    border: 1px solid black;
    tr {
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
      border-bottom: 1px solid black;
      border-right: 1px solid black;
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

export function SimpleTable<T extends object>({ columns, data }: { columns: Column<T>[], data: T[]}) {
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable(
      {
        columns,
        data,
      },
      useSortBy,
    )

  return (
    <Styles>
      <table {...getTableProps()}>
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                  {column.render('Header')}
                  <SorterSymbol>
                    {column.isSorted
                      ? column.isSortedDesc
                        ? ' ↓'
                        : ' ↑'
                      : ' '}
                  </SorterSymbol>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row, i) => {
            prepareRow(row)
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map(cell => {
                  return <td {...cell.getCellProps({
                    className: cell.column.className,
                  })}>{cell.render('Cell')}</td>
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </Styles>
  )
}
