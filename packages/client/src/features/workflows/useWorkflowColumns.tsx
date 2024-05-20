import { useQueryClient } from '@tanstack/react-query'
import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Column } from 'react-table'
import { FeaturedToggle } from '../../components/FeaturedToggle'
import {
  DefaultColumnFilter, SelectColumnFilter,
} from '../../components/Table/filters'
import { StyledTagItem, StyledTags } from '../../components/Tags'
import { BoltIcon } from '../../components/icons/BoltIcon'
import { ObjectGroupIcon } from '../../components/icons/ObjectGroupIcon'
import { StyledLinkCell, StyledNameCell } from '../home/home.styles'
import { KeyVal } from '../home/types'
import { IWorkflow } from './workflows.types'

export const useWorkflowColumns = ({
  isAdmin = false,
  handleRowClick,
  colWidths,
  properties = [],
}: {
  isAdmin?: boolean,
  handleRowClick: (id: string) => void
  colWidths?: KeyVal
  properties?: string[]
}) => {
  const location = useLocation()
  const queryClient = useQueryClient()

  return [
    {
      Header: 'Name',
      accessor: 'name',
      Filter: DefaultColumnFilter,
      width: colWidths?.name || 198,
      Cell: props => (
        <StyledNameCell
          as={Link}
          to={`${location.pathname}/${props.cell.row.original.uid}`}
          state={{ from: location.pathname, fromSearch: location.search }}
        >
          <BoltIcon height={14} />
          {props.value}
        </StyledNameCell>
      ),
    },
    {
      Header: 'Title',
      accessor: 'title',
      Filter: DefaultColumnFilter,
      width: colWidths?.title || 300,
    },
    {
      Header: 'Location',
      accessor: 'location',
      Filter: DefaultColumnFilter,
      width: colWidths?.location || 250,
      Cell: props => (
        <StyledLinkCell to={`${props.row.original.links.space}/workflows`}><ObjectGroupIcon />{props.value}</StyledLinkCell>
      ),
    },
    {
      Header: 'Featured',
      accessor: 'featured',
      Filter: SelectColumnFilter,
      disableSortBy: true,
      options: [{ label: 'Yes', value: 'true' }, { label: 'No', value: 'false'}],
      width: colWidths?.featured || 93,
      Cell: props => (
        <div style={{ paddingLeft: 20 }}><FeaturedToggle disabled={!isAdmin} resource="workflows" featured={props.cell.row.original.featured} uids={[props.cell.row.original.uid]} onSuccess={() => queryClient.invalidateQueries({ queryKey: ['workflows']})} /></div>
      ),
    },
    {
      Header: 'Added By',
      accessor: 'added_by',
      Filter: DefaultColumnFilter,
      width: colWidths?.added_by || 200,
      Cell: props => (
        <a data-turbolinks="false" href={props.cell.row.original.links.user}>
          {props.value}
        </a>
      ),
    },
    {
      Header: 'Created',
      accessor: 'created_at_date_time',
      sortDescFirst: true,
      width: colWidths?.created_at_date_time || 198,
      disableFilters: true,
    },
    {
      Header: 'Tags',
      accessor: 'tags',
      Filter: DefaultColumnFilter,
      disableSortBy: true,
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
  ] as Column<IWorkflow>[]
}
