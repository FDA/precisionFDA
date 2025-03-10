import React, { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { Column } from 'react-table'
import { formatDate } from '../../utils/formatting'
import { KeyVal } from '../home/types'
import { Discussion } from './discussions.types'
import { StyledLink, StyledLinkCell } from '../home/home.styles'
import { DefaultColumnFilter } from '../../components/Table/filters'
import { ObjectGroupIcon } from '../../components/icons/ObjectGroupIcon'
import { getSpaceIdFromScope } from '../../utils'

export const useDiscussionColumns = ({ colWidths }: { colWidths?: KeyVal }) => {
  const location = useLocation()
  return useMemo<Column<Discussion>[]>(
    () =>
      [
        {
          Header: 'Title',
          accessor: 'title',
          Filter: DefaultColumnFilter,
          disableSortBy: true,
          width: colWidths?.title || 480,
          Cell: ({ cell, value }) => {
            const spaceId = getSpaceIdFromScope(cell.row.original.scope)
            const basePath = spaceId ? `/spaces/${spaceId}/discussions` : location.pathname
            return <StyledLink to={`${basePath}/${cell.row.original.id}`}>{value}</StyledLink>
          },
        },
        {
          Header: 'Created',
          accessor: 'createdAt',
          disableFilters: true,
          disableSortBy: true,
          width: colWidths?.created_at_date_time || 190,
          Cell({ value }) {
            return formatDate(value)
          },
        },
        {
          Header: 'Updated',
          accessor: 'updatedAt',
          disableFilters: true,
          disableSortBy: true,
          width: colWidths?.created_at_date_time || 190,
          Cell({ value }) {
            return formatDate(value)
          },
        },
        {
          Header: 'Added by',
          accessor: 'user.fullName',
          Filter: DefaultColumnFilter,
          disableFilters: true,
          disableSortBy: true,
          width: colWidths?.format || 150,
          Cell: ({ cell, value }) => (
            <a data-turbolinks="false" href={`/users/${cell.row.original.user.dxuser}`}>
              {value}
            </a>
          ),
        },
        {
          Header: 'Location',
          accessor: 'scope',
          Filter: DefaultColumnFilter,
          disableSortBy: true,

          width: colWidths?.location || 150,
          Cell: ({ row, value }) => (
            <StyledLinkCell to={`/spaces/${getSpaceIdFromScope(row.original.scope)}/discussions`}>
              <ObjectGroupIcon />
              {value}
            </StyledLinkCell>
          ),
        },
        {
          Header: 'Answers',
          accessor: 'answersCount',
          disableFilters: true,
          disableSortBy: true,
          width: colWidths?.format || 80,
        },
        {
          Header: 'Comments',
          accessor: 'commentsCount',
          disableFilters: true,
          disableSortBy: true,
          width: colWidths?.format || 80,
        },
      ] as Column<Discussion>[],
    [location.search],
  )
}
