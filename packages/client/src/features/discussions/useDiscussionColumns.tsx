import React, { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { Column } from 'react-table'
import { formatDate } from '../../utils/formatting'
import { KeyVal } from '../home/types'
import { Discussion } from './discussions.types'
import { StyledLinkCell, StyledNameCell } from '../home/home.styles'
import { DefaultColumnFilter } from '../../components/Table/filters'
import { ObjectGroupIcon } from '../../components/icons/ObjectGroupIcon'
import { getSpaceIdFromScope } from '../../utils'

export const useDiscussionColumns = ({ colWidths, onClick }: { colWidths?: KeyVal; onClick?: any }) => {
  const location = useLocation()
  return useMemo<Column<Discussion>[]>(
    () =>
      [
        {
          Header: 'Title',
          accessor: 'note.title',
          Filter: DefaultColumnFilter,
          width: colWidths?.title || 480,
          Cell: ({ cell, value }) => {
            return <StyledNameCell onClick={() => onClick(cell.row.original)}>{value}</StyledNameCell>
          },
        },
        {
          Header: 'Created',
          accessor: 'createdAt',
          disableSortBy: true,
          width: colWidths?.created_at_date_time || 190,
          disableFilters: true,
          Cell({ value }) {
            return formatDate(value as any)
          },
        },
        {
          Header: 'Added by',
          accessor: 'user.fullName',
          Filter: DefaultColumnFilter,
          disableFilters: true,
          disableSortBy: true,
          width: colWidths?.format || 150,
          Cell: ({ cell, value }) => <StyledLinkCell to={`/users/${cell.row.original.user.dxuser}`}>{value}</StyledLinkCell>,
        },
        {
          Header: 'Location',
          accessor: 'note.scope',
          Filter: DefaultColumnFilter,
          width: colWidths?.location || 150,
          Cell: ({ row, value }) => (
            <StyledLinkCell to={`/spaces/${getSpaceIdFromScope(row.original.note.scope)}/discussions`}>
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
