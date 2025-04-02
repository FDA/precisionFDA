import { ColumnDef } from '@tanstack/react-table'
import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { propertiesColumnDef, selectColumnDef } from '../../components/Table/selectColumnDef'
import { StyledTagItem, StyledTags } from '../../components/Tags'
import { DatabaseIcon } from '../../components/icons/DatabaseIcon'
import { RESOURCE_LABELS } from '../../types/user'
import { StyledNameCell } from '../home/home.styles'
import { DBStatus } from './DbStatus'
import { IDatabase } from './databases.types'

export const useDatabaseColumns = ({ properties = []}: { properties?: string[] }): ColumnDef<IDatabase>[] => {
  const location = useLocation()
  return [
    selectColumnDef<IDatabase>(),
    {
      header: 'Name',
      accessorKey: 'name',
      filterFn: 'includesString',
      cell: c => (
        <StyledNameCell
          as={Link}
          to={`${location.pathname}/${c.row.original.uid}`}
          state={{ from: location.pathname, fromSearch: location.search }}
        >
          <DatabaseIcon height={14} />
          {c.row.original.name}
        </StyledNameCell>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      filterFn: 'includesString',
      cell: c => <DBStatus status={c.row.original.status} />,
    },
    {
      header: 'Type',
      accessorKey: 'engine',
      filterFn: 'includesString',
      cell: c => (
        <>
          {c.row.original.engine === 'aurora-mysql' && 'MySQL'}
          {c.row.original.engine === 'aurora-postgresql' && 'PostgreSQL'}
        </>
      ),
    },
    {
      header: 'Instance',
      accessorKey: 'dxInstanceClass',
      filterFn: 'includesString',
      cell: c => <>{RESOURCE_LABELS[c.row.original.dxInstanceClass] ?? c.row.original.dxInstanceClass}</>,
    },
    {
      header: 'Created',
      accessorKey: 'createdAtDateTime',
      sortDescFirst: true,
      enableColumnFilter: false,
    },
    {
      header: 'Tags',
      accessorKey: 'tags',
      enableSorting: false,
      filterFn: 'includesString',
      cell: c => {
        return (
          <StyledTags>
            {c.row.original.tags.map(tag => (
              <StyledTagItem key={tag}>{tag}</StyledTagItem>
            ))}
          </StyledTags>
        )
      },
    },
    ...propertiesColumnDef<IDatabase>(properties),
  ]
}
