import React from 'react'
import {
  DefaultColumnFilter,
} from '../../components/Table/filters'
import { StyledTagItem, StyledTags } from '../../components/Tags'
import { DatabaseIcon } from '../../components/icons/DatabaseIcon'
import { RESOURCE_LABELS } from '../../types/user'
import { StyledLinkCell } from '../home/home.styles'
import { KeyVal } from '../home/types'

export const useDatabaseColumns = ({
  handleRowClick,
  colWidths,
  properties = [],
}: {
  handleRowClick: (id: string) => void
  colWidths: KeyVal
  properties?: string[]
}) => [
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
      <StyledLinkCell to={`/home/databases/${props.row.original.uid}`}>
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
    Cell: props => (
      <>
        {RESOURCE_LABELS[props.row.original.dx_instance_class] ?? props.row.original.dx_instance_class}
      </>
    )
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
    )},
  },
  ...properties.map(property => ({
    Header: property,
    accessor: row => row.properties[property],
    id: `props.${property}`,
    disableFilters: true,
    width: colWidths?.[property] || 200,
  })),
]
