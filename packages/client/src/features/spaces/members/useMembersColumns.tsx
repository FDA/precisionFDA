import { ColumnDef } from '@tanstack/react-table'
import React from 'react'
import { Link } from 'react-router'
import { UsersIcon } from '../../../components/icons/UserIcon'
import { selectColumnDef } from '../../../components/Table/selectColumnDef'
import { StyledNameCell } from '../../home/home.styles'
import { ISpace } from '../spaces.types'
import { StatusPill } from './members.styles'
import { getSpaceMembershipSideAlias, SpaceMembership } from './members.types'

export const useMembersColumns = ({
  space,
  isLeadOrAdmin,
}: {
  space: ISpace
  isLeadOrAdmin?: boolean
}): ColumnDef<SpaceMembership>[] => {
  const columns: ColumnDef<SpaceMembership>[] = []

  if (isLeadOrAdmin) {
    columns.push(selectColumnDef<SpaceMembership>())
  }

  columns.push(
    {
      header: 'User',
      accessorKey: 'title',
      filterFn: 'includesString',
      size: 250,
      cell: info => (
        <StyledNameCell as={Link} to={`/users/${info.row.original.user_name}`} target="_blank" rel="noopener noreferrer">
          <UsersIcon height={14} />
          {info.getValue<string>()}
        </StyledNameCell>
      ),
    },
    {
      header: 'Username',
      accessorKey: 'user_name',
      filterFn: 'includesString',
      size: 200,
      cell: info => (
        <Link to={`/users/${info.getValue<string>()}`} target="_blank" rel="noopener noreferrer">
          {info.getValue<string>()}
        </Link>
      ),
    },
    {
      header: 'Role',
      accessorKey: 'role',
      filterFn: 'includesString',
      size: 150,
      cell: info => {
        const isDeactivated = info.row.original.active === 'Inactive'
        return isDeactivated ? `${info.getValue<string>()} (disabled)` : info.getValue<string>()
      },
    },
    {
      header: 'Side',
      accessorKey: 'side',
      filterFn: 'includesString',
      size: 150,
      cell: info => getSpaceMembershipSideAlias(info.getValue<'host' | 'guest'>(), space),
    },
    {
      header: 'Status',
      accessorKey: 'active',
      filterFn: 'includesString',
      size: 100,
      cell: info => <StatusPill $active={info.getValue<string>() === 'Active'}>{info.getValue<string>()}</StatusPill>,
    },
    {
      header: 'Domain',
      accessorKey: 'domain',
      filterFn: 'includesString',
      size: 200,
      cell: info => info.getValue<string>(),
    },
    {
      header: 'Joined On',
      accessorKey: 'created_at',
      enableColumnFilter: false,
      size: 200,
      cell: info => info.getValue<string>(),
    },
  )

  return columns
}
