import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { DefaultColumnFilter } from '../../components/Table/filters'
import { StyledTagItem, StyledTags } from '../../components/Tags'
import { DatabaseIcon } from '../../components/icons/DatabaseIcon'
import { RESOURCE_LABELS } from '../../types/user'
import { StyledNameCell } from '../home/home.styles'
import { KeyVal } from '../home/types'
import { DBStatus } from './DbStatus'

export const useDatabaseColumns = ({ colWidths, properties = [] }: { colWidths: KeyVal; properties?: string[] }) => {
  const location = useLocation()
  return [
    {
      Header: 'Name',
      accessor: 'name',
      Filter: DefaultColumnFilter,
      width: colWidths?.name || 220,
      Cell: props => (
        <StyledNameCell
          as={Link}
          to={`${location.pathname}/${props.cell.row.original.uid}`}
          state={{ from: location.pathname, fromSearch: location.search }}
        >
          <DatabaseIcon height={14} />
          {props.value}
        </StyledNameCell>
      ),
    },
    {
      Header: 'Status',
      accessor: 'status',
      Filter: DefaultColumnFilter,
      width: colWidths?.status || 120,
      Cell: props => <DBStatus status={props.row.original.status} />,
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
      accessor: 'dxInstanceClass',
      Filter: DefaultColumnFilter,
      width: colWidths?.dxInstanceClass || 130,
      Cell: props => <>{RESOURCE_LABELS[props.row.original.dxInstanceClass] ?? props.row.original.dxInstanceClass}</>,
    },
    {
      Header: 'Created',
      accessor: 'createdAtDateTime',
      sortDescFirst: true,
      disableFilters: true,
      width: colWidths?.createdAtDateTime || 198,
    },
    {
      Header: 'Tags',
      accessor: 'tags',
      disableSortBy: true,
      Filter: DefaultColumnFilter,
      width: colWidths?.tags || 500,
      Cell: props => {
        return (
          <StyledTags>
            {props.value.map(tag => (
              <StyledTagItem key={tag}>{tag}</StyledTagItem>
            ))}
          </StyledTags>
        )
      },
    },
    ...properties.map(property => ({
      Header: property,
      accessor: row => row.properties[property],
      id: `props.${property}`,
      disableFilters: true,
      width: colWidths?.[property] || 200,
    })),
  ]
}
