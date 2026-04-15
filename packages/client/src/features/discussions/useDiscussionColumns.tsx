import type { ColumnDef } from '@tanstack/react-table'
import { useLocation } from 'react-router'
import { ObjectGroupIcon } from '@/components/icons/ObjectGroupIcon'
import { getSpaceIdFromScope } from '@/utils'
import { formatDate } from '@/utils/formatting'
import { StyledLink, StyledLinkCell } from '../home/home.styles'
import type { Discussion } from './discussions.types'

export const useDiscussionColumns = (): ColumnDef<Discussion>[] => {
  const location = useLocation()
  return [
    {
      header: 'Title',
      accessorKey: 'title',
      enableSorting: true,
      enableColumnFilter: true,
      filterFn: 'includesString',
      size: 480,
      cell: c => {
        const spaceId = getSpaceIdFromScope(c.row.original.scope)
        const basePath = spaceId ? `/spaces/${spaceId}/discussions` : location.pathname
        return <StyledLink to={`${basePath}/${c.row.original.id}`}>{c.row.original.title}</StyledLink>
      },
    },
    {
      header: 'Created',
      accessorKey: 'createdAt',
      enableSorting: true,
      enableColumnFilter: false,
      size: 190,
      cell: c => {
        return formatDate(c.row.original.createdAt)
      },
    },
    {
      header: 'Added by',
      accessorKey: 'user.fullName',
      enableColumnFilter: false,
      filterFn: 'includesString',
      enableSorting: false,
      size: 150,
      cell: c => (
        <StyledLinkCell to={`/users/${c.row.original.user.dxuser}`}>{c.row.original.user.fullName}</StyledLinkCell>
      ),
    },
    {
      header: 'Location',
      accessorKey: 'scope',
      enableSorting: false,
      enableColumnFilter: false,
      filterFn: 'includesString',
      size: 150,
      cell: c => (
        <StyledLinkCell to={`/spaces/${getSpaceIdFromScope(c.row.original.scope)}/discussions`}>
          <ObjectGroupIcon />
          {c.row.original.scope}
        </StyledLinkCell>
      ),
    },
    {
      header: 'Answers',
      accessorKey: 'answersCount',
      enableColumnFilter: false,
      enableSorting: false,
      size: 80,
    },
    {
      header: 'Comments',
      accessorKey: 'commentsCount',
      enableColumnFilter: false,
      enableSorting: false,
      size: 80,
    },
  ]
}
