import type { Column, ColumnDef } from '@tanstack/react-table'
import { Link, useLocation } from 'react-router'
import { DatabaseIcon } from '@/components/icons/DatabaseIcon'
import { propertiesColumnDef, selectColumnDef } from '@/components/Table/selectColumnDef'
import { StyledTagItem, StyledTags } from '@/components/Tags'
import { DATABASE_RESOURCE_LABELS } from '@/types/user'
import SelectFilter, { selectFilterFn } from '../../components/Table/components/SelectFilter'
import { StyledNameCell } from '../home/home.styles'
import { DBStatus } from './DbStatus'
import type { IDatabase } from './databases.types'

const DATABASE_STATUS_OPTIONS = [
  { label: 'Available', option: 'available' },
  { label: 'Creating', option: 'creating' },
  { label: 'Stopping', option: 'stopping' },
  { label: 'Stopped', option: 'stopped' },
  { label: 'Starting', option: 'starting' },
  { label: 'Terminating', option: 'terminating' },
  { label: 'Terminated', option: 'terminated' },
]

const DATABASE_ENGINE_OPTIONS = [
  { label: 'MySQL', option: 'aurora-mysql' },
  { label: 'PostgreSQL', option: 'aurora-postgresql' },
]

export const useDatabaseColumns = ({ properties = [] }: { properties?: string[] }): ColumnDef<IDatabase>[] => {
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
      filterFn: selectFilterFn,
      meta: {
        filterElement: (column: Column<IDatabase>) => (
          <SelectFilter column={column} options={DATABASE_STATUS_OPTIONS} />
        ),
      },
      cell: c => <DBStatus status={c.row.original.status} />,
    },
    {
      header: 'Engine',
      accessorKey: 'engine',
      filterFn: selectFilterFn,
      meta: {
        filterElement: (column: Column<IDatabase>) => (
          <SelectFilter column={column} options={DATABASE_ENGINE_OPTIONS} />
        ),
      },
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
      cell: c => <>{DATABASE_RESOURCE_LABELS[c.row.original.dxInstanceClass] ?? c.row.original.dxInstanceClass}</>,
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
