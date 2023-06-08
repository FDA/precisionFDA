import React, { useMemo } from 'react'
import { Column } from 'react-table'
import { DatabaseIcon } from '../../../components/icons/DatabaseIcon'
import {
  DefaultColumnFilter
} from '../../../components/Table/filters'
import { StyledTagItem, StyledTags } from '../../../components/Tags'
import { StyledLinkCell } from '../home.styles'
import { KeyVal } from '../types'
import { IDatabase } from './databases.types'

export const useDatabaseColumns = ({
  handleRowClick,
  colWidths
}: {
  handleRowClick: (id: string) => void
  colWidths: KeyVal
}) =>
  useMemo<Column<IDatabase>[]>(
    () =>
      [
        {
          Header: 'Status',
          accessor: 'status',
          Filter: DefaultColumnFilter,
          width: colWidths?.status || 120,
        },
        {
          Header: 'Name',
          accessor: 'name',
          Filter: DefaultColumnFilter,
          width: colWidths?.name || 220,
          Cell: props => (
            <StyledLinkCell to={`/home/databases/${props.row.original.dxid}`}>
              <DatabaseIcon height={14} />
              {props.value}
            </StyledLinkCell>
          ),
        },
        {
          Header: 'Type',
          accessor: 'engine',
          Filter: DefaultColumnFilter,
          width: colWidths?.engine || 130,
          Cell: props => (
            <>
              {props.value === 'aurora-mysql' && 'MySQL'}
              {props.value === 'aurora-postgresql' && 'PostgreSQL'}
            </>
          ),
        },
        {
          Header: 'Instance',
          accessor: 'dx_instance_class',
          Filter: DefaultColumnFilter,
          width: colWidths?.dx_instance_class || 130,
        },
        {
          Header: 'Created',
          accessor: 'created_at_date_time',
          sortDescFirst: true,
          disableFilters: true,
          width: colWidths?.created_at_date_time || 198,
        },
        {
          Header: 'Tags',
          accessor: 'tags',
          disableSortBy: true,
          Filter: DefaultColumnFilter,
          width: colWidths?.tags || 500,
          Cell: props => {
            return(
              <StyledTags>
                {props.value.map(tag => (
                  <StyledTagItem key={tag}>{tag}</StyledTagItem>
                ))}
              </StyledTags>
          )}
        },
      ] as Column<IDatabase>[],
    [],
  )
