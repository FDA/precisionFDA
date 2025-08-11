import React from 'react'
import styled from 'styled-components'
import { useReactTable, flexRender, getCoreRowModel, getSortedRowModel, ColumnDef, SortingState } from '@tanstack/react-table'

const TableContainer = styled.div`
  background: var(--background-shaded);
  border-radius: 12px;
  margin: 20px 0 20px 0;
  overflow: hidden;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.1),
    0 1px 2px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--c-layout-border);
  overflow-x: auto;

  table {
    width: 100%;
    border-spacing: 0;
    border-collapse: separate;

    thead {
      background: var(--background-shaded);
      position: sticky;
      top: 0;
      z-index: 10;
    }

    tbody tr {
      transition: background-color 0.15s ease;

      &:hover {
        background-color: var(--c-dropdown-hover-bg);
      }

      &:nth-of-type(odd) {
        background-color: var(--background);
      }

      &:nth-of-type(even) {
        background-color: var(--tertiary-30);
      }
    }

    th {
      font-weight: 600;
      font-size: 0.875rem;
      color: var(--c-text-700);
      text-align: left;
      padding: 1rem 1.25rem;
      border-bottom: 2px solid var(--c-layout-border);
      user-select: none;

      &:first-child {
        padding-left: 1.5rem;
      }

      &:last-child {
        padding-right: 1.5rem;
      }

      &[data-sortable='true'] {
        cursor: pointer;
        position: relative;

        &:hover {
          background-color: var(--tertiary-100);
          color: var(--c-text-600);
        }
      }
    }

    td {
      padding: 1rem 1.25rem;
      color: var(--c-text-600);
      font-size: 0.875rem;
      line-height: 1.5;
      border-bottom: 1px solid var(--c-layout-border-200);
      max-width: 300px;
      word-wrap: break-word;
      overflow-wrap: break-word;

      &:first-child {
        padding-left: 1.5rem;
      }

      &:last-child {
        padding-right: 1.5rem;
      }
    }

    tr:last-child td {
      border-bottom: none;
    }
  }
`

const SortIndicator = styled.div<{ direction?: 'asc' | 'desc' | false }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 0.5rem;
  width: 16px;
  height: 16px;
  font-size: 12px;
  color: ${props => (props.direction ? 'var(--c-link)' : 'var(--c-text-400)')};
  transition: all 0.2s ease;

  &::after {
    content: ${props => {
      if (props.direction === 'asc') return "'↑'"
      if (props.direction === 'desc') return "'↓'"
      return "'↕'"
    }};
    font-weight: 600;
  }
`

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1.5rem;
  color: var(--c-text-400);
  font-size: 0.875rem;
`

const TruncatedText = styled.div<{ $maxLines?: number }>`
  display: -webkit-box;
  -webkit-line-clamp: ${props => props.$maxLines || 3};
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
  max-height: ${props => `${(props.$maxLines || 3) * 1.5}em`};
  line-height: 1.5;
`

const CellContent = ({ children, maxLines = 3 }: { children: React.ReactNode; maxLines?: number }) => {
  if (typeof children === 'string' && children.length > 100) {
    return (
      <TruncatedText $maxLines={maxLines} title={children}>
        {children}
      </TruncatedText>
    )
  }
  return <>{children}</>
}

export function ChallengeEntriesTable<T extends object>({
  columns,
  data,
  emptyMessage = 'No data available',
}: {
  columns: ColumnDef<T>[]
  data: T[]
  emptyMessage?: string
}) {
  const [sorting, setSorting] = React.useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  if (data.length === 0) {
    return (
      <TableContainer>
        <EmptyState>{emptyMessage}</EmptyState>
      </TableContainer>
    )
  }

  return (
    <TableContainer>
      <table>
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => {
                const canSort = header.column.getCanSort()
                const sortDirection = header.column.getIsSorted()

                return (
                  <th
                    key={header.id}
                    data-sortable={canSort}
                    onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {canSort && <SortIndicator direction={sortDirection} />}
                    </div>
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id}>
                  <CellContent>{flexRender(cell.column.columnDef.cell, cell.getContext())}</CellContent>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </TableContainer>
  )
}
